import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-[#0A0F1E]',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#6366F1] text-white',
        success: 'border-transparent bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'border-transparent bg-amber-500/10 text-amber-400 border-amber-500/20',
        error: 'border-transparent bg-red-500/10 text-red-400 border-red-500/20',
        outline: 'text-white border-[rgba(255,255,255,0.12)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
