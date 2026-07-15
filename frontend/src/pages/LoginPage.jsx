import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useLogin } from '@/hooks/useAuth'

// ─── Validation schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data) => {
    loginMutation.mutate({ email: data.email, username: data.email, password: data.password })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Glass card */}
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
          >
            YT
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Sign in to your YTVerse account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register('email')}
                className="w-full h-11 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: 'hsl(var(--input))',
                  borderColor: errors.email ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  '--tw-ring-color': 'hsl(var(--ring) / 0.3)',
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
                className="w-full h-11 pl-10 pr-11 rounded-xl border text-sm outline-none transition-all focus:ring-2"
                style={{
                  backgroundColor: 'hsl(var(--input))',
                  borderColor: errors.password ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                  : <Eye    className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                }
              </button>
            </div>
            {errors.password && (
              <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-11 w-full rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
            style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
          >
            {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold hover:underline"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
