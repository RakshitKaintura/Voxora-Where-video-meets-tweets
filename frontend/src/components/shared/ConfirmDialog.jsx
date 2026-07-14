import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * An accessible confirmation modal dialog.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - onConfirm: () => void
 *  - title: string
 *  - message: string
 *  - confirmLabel: string  — defaults to "Confirm"
 *  - cancelLabel: string   — defaults to "Cancel"
 *  - variant: 'danger' | 'default'
 *  - isLoading: boolean    — disables buttons while processing
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) {
  const cancelRef = useRef(null)

  // Focus trap & escape key
  useEffect(() => {
    if (!isOpen) return
    cancelRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'hsl(0 0% 0% / 0.7)' }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
    >
      {/* Dialog panel */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 shadow-2xl"
        style={{
          backgroundColor: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          {variant === 'danger' && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'hsl(var(--destructive) / 0.15)' }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(var(--destructive))' }} />
            </div>
          )}
          <h2
            id="confirm-title"
            className="text-base font-semibold"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            {title}
          </h2>
        </div>

        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-1">
          <button
            ref={cancelRef}
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'hsl(var(--secondary))',
              color: 'hsl(var(--foreground))',
            }}
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 min-w-[80px]"
            style={{
              backgroundColor: variant === 'danger'
                ? 'hsl(var(--destructive))'
                : 'hsl(var(--primary))',
              color: 'white',
            }}
          >
            {isLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
