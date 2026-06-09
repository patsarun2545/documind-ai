'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Send, Loader2, RefreshCw, ArrowLeft, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatMessage, MessageSource } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ChatPage({
  params,
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(
    searchParams.get('sessionId')
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [documentStatus, setDocumentStatus] = useState<string | null>(null)
  const [documentTitle, setDocumentTitle] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    if (!sessionId) {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId: documentId }),
        })
        const result = await response.json()
        if (result.success) {
          const newSessionId = result.data.session.id
          setSessionId(newSessionId)
          setDocumentTitle(result.data.session.document?.title || 'Document')
          router.replace(
            `/chat/${documentId}?sessionId=${newSessionId}`,
            { scroll: false }
          )
          await fetchSessionMessages(newSessionId)
        }
      } catch (error) {
        toast.error('Failed to create chat session')
      }
    } else {
      await fetchSessionMessages(sessionId)
    }
  }

  const fetchSessionMessages = async (sid: string) => {
    try {
      const response = await fetch(`/api/chat/sessions/${sid}/messages`)
      const result = await response.json()
      if (result.success) {
        setMessages(result.data.messages)
        setDocumentStatus(result.data.session.document?.status || null)
        setDocumentTitle(result.data.session.document?.title || 'Document')
      }
    } catch (error) {
      toast.error('Failed to fetch messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [documentId])

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId || isStreaming) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'USER',
      content: input,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'ASSISTANT',
      content: '',
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch(
        `/api/chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) {
        throw new Error('No response body')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, isError: true }
                      : m
                  )
                )
                break
              }

              if (parsed.chunk) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? { ...m, content: m.content + parsed.chunk }
                      : m
                  )
                )
              }

              if (parsed.done) {
                break
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id ? { ...m, isError: true } : m
        )
      )
      toast.error('Failed to send message')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleRetry = (message: ChatMessage) => {
    const userMessageIndex = messages.findIndex(
      (m) => m.id === message.id && m.role === 'ASSISTANT'
    )
    if (userMessageIndex > 0) {
      const prevUserMessage = messages[userMessageIndex - 1]
      if (prevUserMessage.role === 'USER') {
        setInput(prevUserMessage.content)
        setMessages((prev) => prev.filter((m) => m.id !== message.id))
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="Back to documents"
          className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-[24px] font-bold text-white tracking-[-0.03em]">
            {documentTitle}
          </h1>
          <p className="text-[14px] text-gray-400">Ask questions about your document</p>
        </div>
      </div>

      {documentStatus !== 'READY' && (
        <div className="border border-amber-500/20 bg-amber-500/10 p-4 rounded-lg">
          <p className="text-[14px] text-amber-400" aria-live="polite">
            Document is not ready for chat. Status: {documentStatus}
          </p>
        </div>
      )}

      {/* Chat Container */}
      <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] h-[500px] flex flex-col rounded-lg">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-[14px]">Start a conversation by asking a question</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'USER' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'ASSISTANT' && (
                  <div className="mr-3 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-4',
                    message.role === 'USER'
                      ? 'bg-[#6366F1] text-white'
                      : message.isError
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-[#1A2035] border border-[rgba(255,255,255,0.1)] text-white'
                  )}
                  aria-label={
                    message.role === 'USER'
                      ? 'Your message'
                      : 'Assistant message'
                  }
                >
                  {message.role === 'ASSISTANT' && !message.isError && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] font-semibold text-[#6366F1]">
                        DocuMind AI
                      </span>
                    </div>
                  )}
                  {message.isError && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px]">Failed to generate response</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(message)}
                        aria-label="Retry message"
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.sources.map((source: MessageSource, idx) => (
                        <Badge
                          key={idx}
                          className="bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20 text-[11px] font-medium"
                        >
                          [Chunk {source.chunkIndex}]
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isStreaming && (
            <div className="flex justify-start">
              <div className="mr-3 flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="bg-[#1A2035] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-semibold text-[#6366F1] mb-2">
                    DocuMind AI
                  </span>
                </div>
                <div className="flex gap-1 mt-2">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your document..."
              disabled={isStreaming || documentStatus !== 'READY'}
              aria-label="Message input"
              className="flex-1 bg-[#0A0F1E] border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500 focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-colors"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isStreaming || documentStatus !== 'READY'}
              aria-label="Send message"
              className="h-10 w-10 rounded-full bg-[#6366F1] hover:bg-[#5558E3] text-white flex items-center justify-center transition-colors"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
