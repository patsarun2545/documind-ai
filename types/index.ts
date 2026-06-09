export type DocumentStatus = 'PROCESSING' | 'READY' | 'FAILED'
export type MessageRole = 'USER' | 'ASSISTANT'

export interface Document {
  id: string
  userId: string
  title: string
  fileName: string
  fileSize: number
  fileType: string
  status: DocumentStatus
  createdAt: string
}

export interface MessageSource {
  chunkIndex: number
  content: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  sources?: MessageSource[]
  createdAt: string
  isError?: boolean        // local only ไม่บันทึก DB
}

export interface ChatSession {
  id: string
  userId: string
  documentId: string
  title: string
  document?: {
    id: string
    title: string
    fileName: string
    status: DocumentStatus
  }
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: string | null
}

export interface User {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export interface AuthUser {
  userId: string
  email: string
}
