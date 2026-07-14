import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Shown when an API call fails or an error boundary catches an error.
 *
 * Props:
 *  - title: string   — error heading
 *  - message: string — error detail
 *  - onRetry: fn     — if provided, shows a Retry button
 *  - className: string
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-20 text-center px-6',
        className
      )}
    >
      {/* Warning icon */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'hsl(var(--destructive) / 0.15)' }}
      >
        <AlertTriangle
          className="w-9 h-9"
          style={{ color: 'hsl(var(--destructive))' }}
        />
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <p className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
          {title}
        </p>
        <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--foreground))' }}
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  )
}
