import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rateLimit'
import { getSessionFromRequest } from '@/lib/auth'
import { embedQuery, searchSimilarChunks, buildPrompt } from '@/lib/rag'
import { chatModel } from '@/lib/gemini'
import { prisma } from '@/lib/db'
import { ApiResponse, ChatMessage, ChatSession } from '@/types'

const sendMessageSchema = z.object({
  question: z.string().min(1).max(1000),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getSessionFromRequest()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: id },
      include: { document: true },
    })

    if (!chatSession) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Chat session not found',
        },
        { status: 404 }
      )
    }

    if (chatSession.userId !== session.userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json<ApiResponse<{ messages: ChatMessage[]; session: ChatSession }>>(
      {
        success: true,
        data: {
          messages: messages.map((m: any) => ({
            id: m.id,
            sessionId: m.sessionId,
            role: m.role,
            content: m.content,
            sources: m.sources as any,
            createdAt: m.createdAt.toISOString(),
          })),
          session: {
            id: chatSession.id,
            userId: chatSession.userId,
            documentId: chatSession.documentId,
            title: chatSession.title,
            createdAt: chatSession.createdAt.toISOString(),
            document: {
            id: chatSession.document?.id ?? '',
            title: chatSession.document?.title ?? '',
            fileName: chatSession.document?.fileName ?? '',
            status: chatSession.document?.status ?? 'PROCESSING',
},
          },
        },
        error: null,
      }
    )
  } catch (error) {
    console.error('Get chat messages error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const rateLimitResponse = rateLimit(request, 'api')
    if (rateLimitResponse) return rateLimitResponse

    const session = await getSessionFromRequest()
    if (!session) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const chatSession = await prisma.chatSession.findUnique({
      where: { id: id },
    })

    if (!chatSession) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Chat session not found',
        },
        { status: 404 }
      )
    }

    if (chatSession.userId !== session.userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: parsed.error.errors[0].message,
        },
        { status: 400 }
      )
    }

    const { question } = parsed.data
    const sessionId = id

    // Create user message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'USER',
        content: question,
      },
    })

    // Get embedding and search similar chunks
    const embedding = await embedQuery(question)
    const similarChunks = await searchSimilarChunks(
      chatSession.documentId,
      embedding,
      5
    )

    // Build prompt
    const prompt = buildPrompt(question, similarChunks)

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullResponse = ''

        try {
          const result = await chatModel.generateContentStream(prompt)

          for await (const chunk of result.stream) {
            const text = chunk.text()
            fullResponse += text
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ chunk: text })}\n\n`)
            )
          }

          // Save assistant message
          await prisma.chatMessage.create({
            data: {
              sessionId,
              role: 'ASSISTANT',
              content: fullResponse,
              sources: similarChunks.map((c) => ({
                chunkIndex: c.chunkIndex,
                content: c.content.slice(0, 200),
              })),
            },
          })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
          )
        } catch (error) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        data: null,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
