import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ApiResponse } from '@/types'

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

    return NextResponse.json<ApiResponse<{ status: string }>>(
      {
        success: true,
        data: { status: document.status },
        error: null,
      }
    )
  } catch (error) {
    console.error('Get document status error:', error)
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
