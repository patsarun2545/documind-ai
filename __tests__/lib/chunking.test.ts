import { chunkText } from '@/lib/chunking'

describe('chunkText', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })
  it('returns empty array for empty text', () => {
    const result = chunkText('')
    expect(result).toEqual([])
  })

  it('returns single chunk for text less than 500 words', () => {
    const text = 'word '.repeat(100).trim()
    const result = chunkText(text)
    expect(result).toHaveLength(1)
    expect(result[0].chunkIndex).toBe(0)
  })

  it('returns multiple chunks for text more than 500 words', () => {
    const text = 'word '.repeat(600).trim()
    const result = chunkText(text)
    expect(result.length).toBeGreaterThan(1)
  })

  it('creates overlap between chunks (50 words)', () => {
    const text = 'word '.repeat(600).trim()
    const result = chunkText(text)
    
    if (result.length > 1) {
      const chunk0Words = result[0].content.split(' ')
      const chunk1Words = result[1].content.split(' ')
      
      // Get last 50 words from chunk 0
      const chunk0Last50 = chunk0Words.slice(-50)
      // Get first 50 words from chunk 1
      const chunk1First50 = chunk1Words.slice(0, 50)
      
      expect(chunk0Last50).toEqual(chunk1First50)
    }
  })

  it('increments chunkIndex correctly', () => {
    const text = 'word '.repeat(600).trim()
    const result = chunkText(text)
    
    result.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index)
    })
  })
})
