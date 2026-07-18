import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext(null)

// ─── Hook: useToast ───────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider />')
  return ctx
}

// ─── Individual Toast item ────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const COLORS = {
  success: 'hsl(142 71% 45%)',
  error:   'hsl(var(--destructive))',
  warning: 'hsl(38 92% 50%)',
  info:    'hsl(var(--blue))',
}

function Toast({ id, type = 'info', title, message, onDismiss, duration = 4000 }) {
  const Icon = ICONS[type] ?? Info
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(id), duration)
    return () => clearTimeout(timerRef.current)
  }, [id, duration, onDismiss])

  return (
    <div
      className="flex items-start gap-3 w-80 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-full duration-300"
      style={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
      }}
      role="alert"
      aria-live="polite"
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: COLORS[type] }} />

      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
            {title}
          </p>
        )}
        {message && (
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
      </button>
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(({ type = 'info', title, message, duration }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, type, title, message, duration }])
  }, [])

  // Convenience shortcuts
  toast.success = (title, message, opts) => toast({ type: 'success', title, message, ...opts })
  toast.error   = (title, message, opts) => toast({ type: 'error',   title, message, ...opts })
  toast.warning = (title, message, opts) => toast({ type: 'warning', title, message, ...opts })
  toast.info    = (title, message, opts) => toast({ type: 'info',    title, message, ...opts })

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        className="fixed bottom-4 right- 4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
