'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { isSupportedFileType, MAX_FILE_SIZE } from '@/lib/documentConfig'

interface UploadZoneProps {
  onUploadComplete: (documentId: string) => void
  onStatusChange: (documentId: string, status: string) => void
}

type UploadState = 'idle' | 'uploading' | 'polling' | 'done' | 'error'

export function UploadZone({
  onUploadComplete,
  onStatusChange,
}: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const handleFileSelect = (file: File) => {
    if (!isSupportedFileType(file.type)) {
      toast.error('Unsupported file type. Please upload PDF, DOCX, or TXT.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit.')
      return
    }

    setFileName(file.name)
    uploadFile(file)
  }

  const uploadFile = (file: File) => {
    setState('uploading')
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = async () => {
      if (xhr.status === 201) {
        const result = JSON.parse(xhr.responseText)
        const docId = result.data.documentId
        setDocumentId(docId)
        setState('polling')
        startPolling(docId)
      } else {
        const result = JSON.parse(xhr.responseText)
        toast.error(result.error || 'Upload failed')
        setState('error')
      }
    }

    xhr.onerror = () => {
      toast.error('Upload failed')
      setState('error')
    }

    xhr.open('POST', '/api/documents')
    xhr.send(formData)
  }

  const startPolling = (docId: string) => {
    if (pollingRef.current.has(docId)) {
      return
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/documents/${docId}/status`)
        const result = await response.json()

        if (result.success && result.data.status !== 'PROCESSING') {
          clearInterval(intervalId)
          pollingRef.current.delete(docId)
          setState('done')
          onStatusChange(docId, result.data.status)
          onUploadComplete(docId)

          setTimeout(() => {
            setState('idle')
            setFileName('')
            setDocumentId(null)
            setProgress(0)
          }, 2000)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 3000)

    pollingRef.current.set(docId, intervalId)
  }

  useEffect(() => {
    return () => {
      pollingRef.current.forEach((intervalId) => {
        clearInterval(intervalId)
      })
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCancel = () => {
    if (documentId && pollingRef.current.has(documentId)) {
      clearInterval(pollingRef.current.get(documentId)!)
      pollingRef.current.delete(documentId)
    }
    setState('idle')
    setFileName('')
    setDocumentId(null)
    setProgress(0)
  }

  if (state === 'idle') {
    return (
      <div
        className={`p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragOver
            ? 'border-[#6366F1] bg-[rgba(99,102,241,0.05)]'
            : 'border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.2)]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload document"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick()
          }
        }}
      >
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-[18px] font-semibold text-white mb-2">
            Upload document
          </h3>
          <p className="text-[14px] text-gray-400 mb-4">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-[12px] text-gray-500">
            PDF, DOCX, or TXT (max 10MB)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File input"
        />
      </div>
    )
  }

  return (
    <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-500" />
          <span className="font-medium text-white">{fileName}</span>
        </div>
        {state !== 'done' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            aria-label="Cancel upload"
            className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {state === 'uploading' && (
        <div className="space-y-2">
          <div className="flex justify-between text-[14px] text-gray-400">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div
            className="h-2 bg-[#1A2035] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-[#6366F1] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {state === 'polling' && (
        <div className="flex items-center gap-2 text-[14px] text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing document...</span>
        </div>
      )}

      {state === 'done' && (
        <div className="flex items-center gap-2 text-[14px] text-green-400">
          <FileText className="h-4 w-4" />
          <span>Document uploaded successfully</span>
        </div>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-2 text-[14px] text-red-400">
          <X className="h-4 w-4" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}
    </div>
  )
}
