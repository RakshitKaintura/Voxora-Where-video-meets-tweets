import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <span className="text-7xl font-black" style={{ color: 'hsl(var(--red))' }}>404</span>
      <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Page not found</h1>
      <p style={{ color: 'hsl(var(--muted-foreground))' }}>The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 px-5 py-2 rounded-full text-sm font-medium"
        style={{ backgroundColor: 'hsl(var(--red))', color: 'white' }}
      >
        Go Home
      </Link>
    </div>
  )
}
