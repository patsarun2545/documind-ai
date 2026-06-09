export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0F1E] p-4 relative overflow-hidden">
      {/* Neural Pulse Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          className="w-[800px] h-[800px] opacity-[0.03] neural-pulse"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="400" cy="400" r="100" stroke="#6366F1" strokeWidth="1" />
          <circle cx="400" cy="400" r="200" stroke="#6366F1" strokeWidth="1" />
          <circle cx="400" cy="400" r="300" stroke="#6366F1" strokeWidth="1" />
          <circle cx="400" cy="400" r="400" stroke="#6366F1" strokeWidth="1" />
        </svg>
      </div>

      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="text-[24px] font-bold text-white tracking-[-0.03em]">
          DocuMind
        </span>
        <span className="text-[12px] font-semibold text-[#6366F1] px-2 py-0.5 border border-[#6366F1]/30 rounded">
          AI
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
