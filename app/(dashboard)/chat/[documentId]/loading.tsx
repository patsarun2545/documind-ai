import { Skeleton } from '@/components/ui/skeleton'

export default function ChatLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.08)]" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-[rgba(255,255,255,0.08)]" />
          <Skeleton className="h-4 w-64 bg-[rgba(255,255,255,0.08)]" />
        </div>
      </div>

      {/* Chat Container Skeleton */}
      <div className="border border-[rgba(255,255,255,0.08)] bg-[#0D1424] h-[500px] flex flex-col">
        {/* Messages Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* AI Message Skeleton */}
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4 rounded-full bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-24 bg-[rgba(255,255,255,0.08)]" />
              </div>
              <div className="bg-[#1A2035] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-48 bg-[rgba(255,255,255,0.08)] shimmer" />
                <Skeleton className="h-4 w-64 bg-[rgba(255,255,255,0.08)] shimmer" />
                <Skeleton className="h-4 w-40 bg-[rgba(255,255,255,0.08)] shimmer" />
              </div>
            </div>
          </div>

          {/* User Message Skeleton */}
          <div className="flex justify-end">
            <div className="max-w-[80%]">
              <div className="bg-[#6366F1] rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-32 bg-[rgba(255,255,255,0.2)] shimmer" />
                <Skeleton className="h-4 w-48 bg-[rgba(255,255,255,0.2)] shimmer" />
              </div>
            </div>
          </div>

          {/* AI Message Skeleton */}
          <div className="flex justify-start">
            <div className="max-w-[80%] space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-4 rounded-full bg-[rgba(255,255,255,0.08)]" />
                <Skeleton className="h-4 w-24 bg-[rgba(255,255,255,0.08)]" />
              </div>
              <div className="bg-[#1A2035] border border-[rgba(255,255,255,0.1)] rounded-lg p-4 space-y-2">
                <Skeleton className="h-4 w-56 bg-[rgba(255,255,255,0.08)] shimmer" />
                <Skeleton className="h-4 w-72 bg-[rgba(255,255,255,0.08)] shimmer" />
                <Skeleton className="h-4 w-32 bg-[rgba(255,255,255,0.08)] shimmer" />
              </div>
            </div>
          </div>
        </div>

        {/* Input Area Skeleton */}
        <div className="border-t border-[rgba(255,255,255,0.08)] p-4">
          <div className="flex gap-2">
            <Skeleton className="flex-1 h-10 bg-[rgba(255,255,255,0.08)] rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-full bg-[rgba(255,255,255,0.08)]" />
          </div>
        </div>
      </div>
    </div>
  )
}
