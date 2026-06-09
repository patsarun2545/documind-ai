import { embeddingModel } from '@/lib/gemini'

const BATCH_SIZE = 20

export interface EmbeddedChunk {
  content: string
  embedding: number[]
  index: number
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function embedChunks(
  chunks: Array<{ content: string; index: number }>
): Promise<EmbeddedChunk[]> {
  const results: EmbeddedChunk[] = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    let attempt = 0
    let success = false

    while (attempt < 3 && !success) {
      try {
        // Process each chunk in the batch individually
        for (const chunk of batch) {
          const response = await embeddingModel.embedContent(chunk.content)
          results.push({
            content: chunk.content,
            embedding: response.embedding.values,
            index: chunk.index,
          })
        }
        success = true
      } catch (error) {
        attempt++
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          await sleep(delay)
        } else {
          throw error
        }
      }
    }
  }

  return results
}
