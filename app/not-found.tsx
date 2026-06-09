import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
            <FileQuestion className="h-10 w-10 text-[#6366F1]" />
          </div>
        </div>

        {/* 404 Message */}
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold text-white tracking-[-0.03em]">
            Page not found.
          </h1>
          <p className="text-[14px] text-gray-400 leading-relaxed">
            The page you're looking for doesn't exist.
          </p>
        </div>

        {/* Action Button */}
        <Link href="/">
          <Button className="bg-[#6366F1] hover:bg-[#5558E3] text-white transition-colors">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
