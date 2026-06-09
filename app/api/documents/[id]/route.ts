import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiResponse, Document } from '@/types'

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

    const document = await prisma.document.findUnique({
      where: { id: id },
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

    return NextResponse.json<ApiResponse<{ document: Document }>>(
      {
        success: true,
        data: {
          document: {
            id: document.id,
            userId: document.userId,
            title: document.title,
            fileName: document.fileName,
            fileSize: document.fileSize,
            fileType: document.fileType,
            status: document.status,
            createdAt: document.createdAt.toISOString(),
          },
        },
        error: null,
      }
    )
  } catch (error) {
    console.error('Get document error:', error)
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

export async function DELETE(
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

    const document = await prisma.document.findUnique({
      where: { id: id },
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

    await prisma.$transaction(async (tx: any) => {
      // 1. Find session ids first
      const sessions = await tx.chatSession.findMany({
        where: { documentId: id },
        select: { id: true },
      })
      const sessionIds = sessions.map((s: any) => s.id)

      // 2. Delete ChatMessage via sessionIds
      if (sessionIds.length > 0) {
        await tx.chatMessage.deleteMany({
          where: { sessionId: { in: sessionIds } },
        })
      }

      // 3. Delete ChatSession
      await tx.chatSession.deleteMany({
        where: { documentId: id },
      })

      // 4. Delete DocumentChunk
      await tx.documentChunk.deleteMany({
        where: { documentId: id },
      })

      // 5. Delete Document
      await tx.document.delete({
        where: { id: id },
      })
    })

    return NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        data: null,
        error: null,
      }
    )
  } catch (error) {
    console.error('Delete document error:', error)
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
