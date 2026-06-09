import { isSupportedFileType, parseDocument } from '@/lib/documentParser'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

jest.mock('pdf-parse')
jest.mock('mammoth')

const mockPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>
const mockMammoth = mammoth as jest.Mocked<typeof mammoth>

describe('documentParser', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-minimum-32-characters-long'
    process.env.GEMINI_API_KEY = 'test-key'
    process.env.DATABASE_URL = 'postgresql://test'
  })
  describe('isSupportedFileType', () => {
    it('returns true for PDF', () => {
      expect(isSupportedFileType('application/pdf')).toBe(true)
    })

    it('returns true for plain text', () => {
      expect(isSupportedFileType('text/plain')).toBe(true)
    })

    it('returns true for DOCX', () => {
      expect(isSupportedFileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true)
    })

    it('returns false for PNG', () => {
      expect(isSupportedFileType('image/png')).toBe(false)
    })

    it('returns false for empty string', () => {
      expect(isSupportedFileType('')).toBe(false)
    })
  })

  describe('parseDocument', () => {
    it('parses TXT buffer correctly', async () => {
      const buffer = Buffer.from('Sample text content')
      const result = await parseDocument(buffer, 'text/plain')
      expect(result.text).toBe('Sample text content')
    })

    it('throws error for unsupported file type', async () => {
      const buffer = Buffer.from('Sample content')
      await expect(parseDocument(buffer, 'image/png')).rejects.toThrow('Unsupported file type')
    })
  })
})
