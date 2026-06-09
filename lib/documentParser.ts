import 'server-only'
import { isSupportedFileType, MAX_FILE_SIZE } from './documentConfig'
export { isSupportedFileType, MAX_FILE_SIZE } 

import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; pageCount?: number }> {
  if (mimeType === 'application/pdf') {
    const data = await pdf(buffer)
    return { text: data.text, pageCount: data.numpages }
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer })
    return { text: result.value }
  }

  if (mimeType === 'text/plain') {
    return { text: buffer.toString('utf-8') }
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}
