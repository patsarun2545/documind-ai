import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rateLimit'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiResponse, ChatSession } from '@/types'

const createSessionSchema = z.object({
  documentId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const parsed = createSessionSchema.safeParse(body)

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

    const { documentId } = parsed.data

    // Find document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Document not found',
        },
        { status: 404 }
      )
    }

    if (document.userId !== session.userId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Forbidden',
        },
        { status: 403 }
      )
    }

    // Check document status
    if (document.status === 'PROCESSING') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Document is still processing',
        },
        { status: 400 }
      )
    }

    if (document.status === 'FAILED') {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Document processing failed',
        },
        { status: 400 }
      )
    }

    // Check for existing session
    const existingSession = await prisma.chatSession.findFirst({
      where: {
        userId: session.userId,
        documentId,
      },
    })

    if (existingSession) {
      return NextResponse.json<ApiResponse<{ session: ChatSession }>>(
        {
          success: true,
          data: {
            session: {
              id: existingSession.id,
              userId: existingSession.userId,
              documentId: existingSession.documentId,
              title: existingSession.title,
              createdAt: existingSession.createdAt.toISOString(),
            },
          },
          error: null,
        }
      )
    }

    // Create new session
    const newSession = await prisma.chatSession.create({
      data: {
        userId: session.userId,
        documentId,
        title: document.title,
      },
    })

    return NextResponse.json<ApiResponse<{ session: ChatSession }>>(
      {
        success: true,
        data: {
          session: {
            id: newSession.id,
            userId: newSession.userId,
            documentId: newSession.documentId,
            title: newSession.title,
            createdAt: newSession.createdAt.toISOString(),
          },
        },
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create chat session error:', error)
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

export async function GET(request: NextRequest) {
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

    const sessions = await prisma.chatSession.findMany({
      where: { userId: session.userId },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            fileName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<ApiResponse<{ sessions: ChatSession[] }>>(
      {
        success: true,
        data: {
          sessions: sessions.map((s: any) => ({
            id: s.id,
            userId: s.userId,
            documentId: s.documentId,
            title: s.title,
            document: s.document
              ? {
                  id: s.document.id,
                  title: s.document.title,
                  fileName: s.document.fileName,
                  status: s.document.status,
                }
              : undefined,
            createdAt: s.createdAt.toISOString(),
          })),
        },
        error: null,
      }
    )
  } catch (error) {
    console.error('Get chat sessions error:', error)
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
