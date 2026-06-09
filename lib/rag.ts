import { embeddingModel } from '@/lib/gemini'
import { prisma } from '@/lib/db'

export interface ChunkResult {
  id: string
  content: string
  chunkIndex: number
  distance: number
}

export async function embedQuery(question: string): Promise<number[]> {
  const response = await embeddingModel.embedContent({
    content: { parts: [{ text: question }], role: 'user' }
  })
  return response.embedding.values
}

export async function searchSimilarChunks(
  documentId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<ChunkResult[]> {
  const vectorString = `[${queryEmbedding.join(',')}]`

  const results = await prisma.$queryRaw<ChunkResult[]>`
    SELECT 
      id,
      content,
      "chunkIndex",
      (embedding <=> ${vectorString}::vector) as distance
    FROM "DocumentChunk"
    WHERE "documentId" = ${documentId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${topK}
  `

  return results
}

export function buildPrompt(
  question: string,
  chunks: ChunkResult[]
): string {
  const context = chunks
    .map((c) => `[Chunk ${c.chunkIndex}]: ${c.content}`)
    .join('\n\n')

  return `System: ตอบคำถามโดยอ้างอิงจาก context ที่ให้มา ถ้าไม่มีข้อมูลเพียงพอให้บอกว่าข้อมูลไม่ครบ

Context:
${context}

Question: ${question}

Answer:`
}
