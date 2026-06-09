export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E]">
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Logo */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-[#6366F1] rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#0D1424] border border-[rgba(255,255,255,0.08)]">
            <span className="text-[24px] font-bold text-white tracking-[-0.03em]">
              D
            </span>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-[24px] font-bold text-white tracking-[-0.03em]">
            DocuMind
          </h1>
          <p className="text-[14px] text-gray-400">
            Loading your workspace...
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-1">
          <span className="h-2 w-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
