import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json<ApiResponse<null>>(
      {
        success: true,
        data: null,
        error: null,
      }
    )

    response.cookies.delete('token')
    return response
  } catch (error) {
    console.error('Logout error:', error)
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
