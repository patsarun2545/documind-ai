jest.mock('@/lib/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test',
    JWT_SECRET: 'test-secret-minimum-32-characters-long',
    GEMINI_API_KEY: 'test-key',
    NODE_ENV: 'test',
  },
}))

import { buildPrompt } from '@/lib/rag'

describe('rag', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })
  describe('buildPrompt', () => {
    it('includes question and all chunk contents', () => {
      const question = 'What is this about?'
      const chunks = [
        { content: 'First chunk content', chunkIndex: 0, id: '1', distance: 0.1 },
        { content: 'Second chunk content', chunkIndex: 1, id: '2', distance: 0.2 },
      ] as any[]
      
      const prompt = buildPrompt(question, chunks)
      
      expect(prompt).toContain(question)
      expect(prompt).toContain('First chunk content')
      expect(prompt).toContain('Second chunk content')
    })

    it('includes question with empty context when chunks array is empty', () => {
      const question = 'What is this about?'
      const chunks: any[] = []
      
      const prompt = buildPrompt(question, chunks)
      
      expect(prompt).toContain(question)
      expect(prompt).toContain('Context:')
    })

    it('includes [Chunk X]: prefix for each chunk', () => {
      const question = 'What is this about?'
      const chunks = [
        { content: 'First chunk content', chunkIndex: 0, id: '1', distance: 0.1 },
        { content: 'Second chunk content', chunkIndex: 1, id: '2', distance: 0.2 },
      ] as any[]
      
      const prompt = buildPrompt(question, chunks)
      
      expect(prompt).toContain('[Chunk 0]:')
      expect(prompt).toContain('[Chunk 1]:')
    })

    it('does not throw when chunks array is empty', () => {
      const question = 'What is this about?'
      const chunks: any[] = []
      
      expect(() => buildPrompt(question, chunks)).not.toThrow()
    })
  })
})
