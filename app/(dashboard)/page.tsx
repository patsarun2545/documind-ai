'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, MessageSquare, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadZone } from '@/components/upload/UploadZone'
import { Document } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const result = await response.json()
      if (result.success) {
        setDocuments(result.data.documents)
      }
    } catch (error) {
      toast.error('Failed to fetch documents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        toast.success('Document deleted')
        fetchDocuments()
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSING':
        return (
          <Badge
            className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[12px] font-medium"
            role="status"
            aria-label="Processing document"
          >
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case 'READY':
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[12px] font-medium">
            Ready
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[12px] font-medium">
            Error
          </Badge>
        )
      default:
        return <Badge className="text-[12px] font-medium">{status}</Badge>
    }
  }

  const stats = {
    total: documents.length,
    analyzed: documents.filter(d => d.status === 'READY').length,
    chats: 0, // This would come from an API
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-white tracking-[-0.03em]">
            Your documents.
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">
            Manage and analyze your uploaded files
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone
        onUploadComplete={() => fetchDocuments()}
        onStatusChange={() => fetchDocuments()}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] p-6">
          <p className="text-[14px] text-gray-400 mb-2">Total Documents</p>
          <p className="text-[32px] font-bold text-white tracking-[-0.03em]">{stats.total}</p>
        </div>
        <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] p-6">
          <p className="text-[14px] text-gray-400 mb-2">Analyzed</p>
          <p className="text-[32px] font-bold text-white tracking-[-0.03em]">{stats.analyzed}</p>
        </div>
        <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] p-6">
          <p className="text-[14px] text-gray-400 mb-2">Chats</p>
          <p className="text-[32px] font-bold text-white tracking-[-0.03em]">{stats.chats}</p>
        </div>
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : documents.length === 0 ? (
        <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-[18px] font-semibold text-white mb-2">
            No documents yet
          </h3>
          <p className="text-[14px] text-gray-400 mb-6">
            Upload your first document to get started
          </p>
        </div>
      ) : (
        <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)]">
                  <th className="text-left text-[12px] font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Name
                  </th>
                  <th className="text-left text-[12px] font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Type
                  </th>
                  <th className="text-left text-[12px] font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Uploaded
                  </th>
                  <th className="text-left text-[12px] font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-right text-[12px] font-medium text-gray-400 uppercase tracking-wider px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-[14px] font-medium text-white">{doc.title}</p>
                          <p className="text-[12px] text-gray-500 font-mono">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-gray-400">
                        {doc.fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] text-gray-400">{formatDate(doc.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/chat/${doc.id}`)}
                          disabled={doc.status !== 'READY'}
                          aria-disabled={doc.status !== 'READY'}
                          aria-label={`Chat with ${doc.title}`}
                          className="text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id, doc.title)}
                          aria-label={`Delete ${doc.title}`}
                          className="text-gray-400 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
