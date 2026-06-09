'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Login failed')
        return
      }

      toast.success('Login successful')
      router.push('/')
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="space-y-2">
        <h2 className="text-[48px] font-bold text-white tracking-[-0.03em] leading-tight">
          Welcome back.
        </h2>
        <p className="text-[14px] text-gray-400 leading-relaxed">
          Sign in to continue analyzing your documents.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[14px] font-medium text-gray-300"
                >
                  Email
                </Label>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={
                      form.formState.errors.email ? 'email-error' : undefined
                    }
                    className={cn(
                      'bg-[#0D1424] border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500',
                      'focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]',
                      'transition-colors duration-200',
                      form.formState.errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="email-error" className="text-[12px] text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[14px] font-medium text-gray-300"
                >
                  Password
                </Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      aria-label="Password"
                      aria-invalid={!!form.formState.errors.password}
                      aria-describedby={
                        form.formState.errors.password ? 'password-error' : undefined
                      }
                      className={cn(
                        'bg-[#0D1424] border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500 pr-10',
                        'focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]',
                        'transition-colors duration-200',
                        form.formState.errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage id="password-error" className="text-[12px] text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-medium transition-colors duration-200"
            disabled={isLoading}
            aria-label="Sign in"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-[14px] text-gray-400">
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-medium text-[#6366F1] hover:text-[#818CF8] transition-colors"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  )
}
