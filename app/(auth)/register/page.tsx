'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'
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

const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.boolean().refine((val) => val === true, 'You must agree to the Terms of Service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  const password = form.watch('password')

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: '' }
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++
    if (pwd.match(/[0-9]/) || pwd.match(/[^a-zA-Z0-9]/)) strength++
    return {
      strength,
      label: strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Medium' : 'Strong',
    }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || 'Registration failed')
        return
      }

      toast.success('Registration successful')
      router.push('/login')
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
          Create your account.
        </h2>
        <p className="text-[14px] text-gray-400 leading-relaxed">
          Start analyzing your documents with AI-powered insights.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[14px] font-medium text-gray-300"
                >
                  Full Name
                </Label>
                <FormControl>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    aria-label="Full name"
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={
                      form.formState.errors.name ? 'name-error' : undefined
                    }
                    className={cn(
                      'bg-[#0D1424] border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500',
                      'focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]',
                      'transition-colors duration-200',
                      form.formState.errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage id="name-error" className="text-[12px] text-red-400" />
              </FormItem>
            )}
          />

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
                {password && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors duration-200',
                            i <= passwordStrength.strength
                              ? passwordStrength.strength === 1
                                ? 'bg-red-500'
                                : passwordStrength.strength === 2
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                              : 'bg-[rgba(255,255,255,0.08)]'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[12px] text-gray-500">{passwordStrength.label}</p>
                  </div>
                )}
                <FormMessage id="password-error" className="text-[12px] text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[14px] font-medium text-gray-300"
                >
                  Confirm Password
                </Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      aria-label="Confirm password"
                      aria-invalid={!!form.formState.errors.confirmPassword}
                      aria-describedby={
                        form.formState.errors.confirmPassword ? 'confirmPassword-error' : undefined
                      }
                      className={cn(
                        'bg-[#0D1424] border-[rgba(255,255,255,0.08)] text-white placeholder:text-gray-500 pr-10',
                        'focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]',
                        'transition-colors duration-200',
                        form.formState.errors.confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage id="confirmPassword-error" className="text-[12px] text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1 h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-[#0D1424] text-[#6366F1] focus:ring-1 focus:ring-[#6366F1] focus:ring-offset-0"
                    aria-label="Agree to Terms of Service"
                  />
                </FormControl>
                <Label
                  htmlFor="terms"
                  className="text-[14px] font-normal text-gray-400 leading-relaxed cursor-pointer"
                >
                  I agree to the{' '}
                  <a href="/terms" className="text-[#6366F1] hover:text-[#818CF8] transition-colors">
                    Terms of Service
                  </a>
                </Label>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-[#6366F1] hover:bg-[#5558E3] text-white font-medium transition-colors duration-200"
            disabled={isLoading}
            aria-label="Create account"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-[14px] text-gray-400">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium text-[#6366F1] hover:text-[#818CF8] transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
