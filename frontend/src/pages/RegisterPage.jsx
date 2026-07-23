import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AtSign, Upload, Loader2, ImagePlus } from 'lucide-react'
import { useState, useRef } from 'react'
import { useRegister } from '@/hooks/useAuth'

// ─── Validation schema ────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, numbers, and underscores'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ─── Image preview helper ─────────────────────────────────────────────────────
function ImageUploadField({ label, id, preview, onSelect, hint, required, icon: Icon }) {
  const inputRef = useRef(null)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
        {label} {required && <span style={{ color: 'hsl(var(--destructive))' }}>*</span>}
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-white/40 overflow-hidden"
        style={{
          height: id === 'avatar' ? '100px' : '80px',
          borderColor: 'hsl(var(--border))',
          backgroundColor: 'hsl(var(--input))',
        }}
        aria-label={`Upload ${label}`}
      >
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Icon className="w-6 h-6" style={{ color: 'hsl(var(--muted-foreground))' }} />
            <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {hint}
            </span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onSelect(file)
        }}
      />
    </div>
  )
}

// ─── Field wrapper component ──────────────────────────────────────────────────
function Field({ label, id, error, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          />
        )}
        {children}
      </div>
      {error && (
        <p className="text-xs" style={{ color: 'hsl(var(--destructive))' }}>{error}</p>
      )}
    </div>
  )
}

// ─── Register Page ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', email: '', password: '' },
  })

  const handleAvatarSelect = (file) => {
    setAvatarFile(file)
    setAvatarError('')
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleCoverSelect = (file) => {
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const onSubmit = (data) => {
    if (!avatarFile) {
      setAvatarError('Avatar image is required')
      return
    }

    const formData = new FormData()
    formData.append('fullName', data.fullName)
    formData.append('username', data.username.toLowerCase())
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('avatar', avatarFile)
    if (coverFile) formData.append('coverImage', coverFile)

    registerMutation.mutate(formData)
  }

  const inputClass = (hasError) =>
    `w-full h-11 rounded-xl border text-sm outline-none transition-all focus:ring-2 pl-10 pr-4`

  const inputStyle = (hasError) => ({
    backgroundColor: 'hsl(var(--input))',
    borderColor: hasError ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
    color: 'hsl(var(--foreground))',
  })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-10 relative"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(/auth-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="text-center max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 mt-2 mb-4 flex flex-col gap-3">
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter flex justify-center" style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.9))' }}>
          <span className="text-blue-500" style={{ textShadow: '0 0 30px rgba(59,130,246,0.6)' }}>Vox</span>
          <span className="text-red-500" style={{ textShadow: '0 0 30px rgba(239,68,68,0.6)' }}>ora</span>
        </h1>
        <p className="text-2xl md:text-4xl font-semibold tracking-tight text-white" style={{ textShadow: '0 4px 12px rgba(0,0,0,1), 0 2px 4px rgba(0,0,0,0.8)' }}>
          Where video <span className="text-cyan-400 font-black" style={{ textShadow: '0 0 15px rgba(34,211,238,0.6), 0 4px 12px rgba(0,0,0,1)' }}>meets</span> tweets
        </p>
      </div>

      <div
        className="w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 bg-black/10 backdrop-blur-2xl border border-white/10"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Voxora Logo" className="h-28 w-auto object-contain mb-2 scale-110" />
            <span className="text-4xl font-black tracking-tighter" style={{ color: 'hsl(var(--foreground))' }}>
              Voxora
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            Create your account
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Join Voxora today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Full name + Username — 2 column on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" id="fullName" error={errors.fullName?.message} icon={User}>
              <input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                {...register('fullName')}
                className={inputClass(errors.fullName)}
                style={inputStyle(errors.fullName)}
              />
            </Field>

            <Field label="Username" id="username" error={errors.username?.message} icon={AtSign}>
              <input
                id="username"
                type="text"
                placeholder="janedoe"
                autoComplete="username"
                {...register('username')}
                className={inputClass(errors.username)}
                style={inputStyle(errors.username)}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="Email address" id="email" error={errors.email?.message} icon={Mail}>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={inputClass(errors.email)}
              style={inputStyle(errors.email)}
            />
          </Field>

          {/* Password */}
          <Field label="Password" id="password" error={errors.password?.message} icon={Lock}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              {...register('password')}
              className={`${inputClass(errors.password)} pr-11`}
              style={inputStyle(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                : <Eye className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
              }
            </button>
          </Field>

          {/* Image uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ImageUploadField
                label="Profile photo"
                id="avatar"
                preview={avatarPreview}
                onSelect={handleAvatarSelect}
                hint="Click to upload (required)"
                required
                icon={Upload}
              />
              {avatarError && (
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--destructive))' }}>
                  {avatarError}
                </p>
              )}
            </div>

            <ImageUploadField
              label="Cover image"
              id="coverImage"
              preview={coverPreview}
              onSelect={handleCoverSelect}
              hint="Click to upload (optional)"
              icon={ImagePlus}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="h-11 w-full rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
          >
            {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold hover:underline"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
