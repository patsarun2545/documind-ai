import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { rateLimit } from '@/lib/rateLimit'
import { getSessionFromRequest } from '@/lib/auth'
import { parseDocument, isSupportedFileType, MAX_FILE_SIZE } from '@/lib/documentParser'
import { chunkText } from '@/lib/chunking'
import { embedChunks } from '@/lib/embedding'
import { recoverStuckDocuments } from '@/lib/startup'
import { prisma } from '@/lib/db'
import { ApiResponse, Document } from '@/types'

let recovered = false

async function ensureRecovery() {
  if (!recovered) {
    recovered = true
    await recoverStuckDocuments()
  }
}

async function processDocument(
  documentId: string,
  filePath: string,
  mimeType: string
): Promise<void> {
  try {
    const buffer = await readFile(filePath)
    const { text } = await parseDocument(buffer, mimeType)
    const chunks = chunkText(text)
    const embedded = await embedChunks(
      chunks.map((c) => ({ content: c.content, index: c.chunkIndex }))
    )

    for (const chunk of embedded) {
      const vectorString = `[${chunk.embedding.join(',')}]`
      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk"
          (id, "documentId", content, embedding, "chunkIndex", "createdAt")
        VALUES (
          gen_random_uuid(), ${documentId}, ${chunk.content},
          ${vectorString}::vector, ${chunk.index}, NOW()
        )
      `
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'READY' },
    })
  } catch (error) {
    console.error('processDocument failed:', error)
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    })
  } finally {
    await unlink(filePath).catch(() => {})
  }
}

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

    await ensureRecovery()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'File is required',
        },
        { status: 400 }
      )
    }

    const mimeType = file.type
    if (!isSupportedFileType(mimeType)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'Unsupported file type',
        },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          data: null,
          error: 'File size exceeds 10MB limit',
        },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileUuid = crypto.randomUUID()
    const fileName = `${fileUuid}-${file.name}`
    const filePath = join('/tmp', 'uploads', fileName)

    await mkdir(join('/tmp', 'uploads'), { recursive: true })
    await writeFile(filePath, buffer)

    const document = await prisma.document.create({
      data: {
        userId: session.userId,
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: mimeType,
        status: 'PROCESSING',
      },
    })

    setImmediate(() => processDocument(document.id, filePath, mimeType))

    return NextResponse.json<ApiResponse<{ documentId: string }>>(
      {
        success: true,
        data: { documentId: document.id },
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload document error:', error)
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
    await ensureRecovery()

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

    const documents = await prisma.document.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<ApiResponse<{ documents: Document[] }>>(
      {
        success: true,
        data: {
          documents: documents.map((doc: any) => ({
            id: doc.id,
            userId: doc.userId,
            title: doc.title,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            fileType: doc.fileType,
            status: doc.status,
            createdAt: doc.createdAt.toISOString(),
          })),
        },
        error: null,
      }
    )
  } catch (error) {
    console.error('Get documents error:', error)
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
