'use client'
import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{
        style: {
          background: '#1A2035',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#ffffff',
        },
      }}
    />
  )
}
