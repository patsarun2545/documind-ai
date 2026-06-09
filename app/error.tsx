'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold text-white tracking-[-0.03em]">
            Something went wrong.
          </h1>
          <p className="text-[14px] text-gray-400 leading-relaxed">
            {process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            variant="outline"
            className="border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            Try again
          </Button>
          <Link href="/">
            <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white transition-colors">
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
