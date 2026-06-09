export const MAX_FILE_SIZE = 10 * 1024 * 1024

export function isSupportedFileType(mimeType: string): boolean {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ].includes(mimeType)
}