'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, FileText, MessageSquare, Settings, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: FileText },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-[240px] bg-[#0D1424] border-r border-[rgba(255,255,255,0.08)] fixed left-0 top-0 bottom-0"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-16 px-6 border-b border-[rgba(255,255,255,0.08)] flex items-center">
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-bold text-white tracking-[-0.03em]">
              DocuMind
            </span>
            <span className="text-[10px] font-semibold text-[#6366F1] px-1.5 py-0.5 border border-[#6366F1]/30 rounded">
              AI
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all duration-200',
                  active
                    ? 'text-[#6366F1] bg-[rgba(99,102,241,0.1)] border-l-2 border-[#6366F1]'
                    : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-colors"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Log out"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#0D1424] flex items-center justify-between px-6 sticky top-0 z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center text-[14px] text-gray-400" aria-label="Breadcrumb">
            <span className="text-white">Dashboard</span>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <div className="relative pl-4 border-l border-[rgba(255,255,255,0.08)]">
              <button
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="h-8 w-8 rounded-full bg-[#6366F1] flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-[14px] text-white hidden sm:block">User</span>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#0D1424] border border-[rgba(255,255,255,0.08)] rounded-md shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-[14px] text-gray-400 hover:text-red-400 hover:bg-[rgba(239,68,68,0.1)] transition-colors rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D1424] border-t border-[rgba(255,255,255,0.08)] z-50"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around py-2">
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-md transition-colors',
                  active ? 'text-[#6366F1]' : 'text-gray-400'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
