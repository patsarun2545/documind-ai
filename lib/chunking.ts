const CHUNK_SIZE = 500
const OVERLAP = 50

export interface Chunk {
  content: string
  chunkIndex: number
}

export function chunkText(text: string): Chunk[] {
  if (!text.trim()) {
    return []
  }

  const words = text.split(/\s+/)
  const chunks: Chunk[] = []
  let chunkIndex = 0

  for (let i = 0; i < words.length; i += CHUNK_SIZE - OVERLAP) {
    const chunkWords = words.slice(i, i + CHUNK_SIZE)
    chunks.push({
      content: chunkWords.join(' '),
      chunkIndex,
    })
    chunkIndex++
  }

  return chunks
}
