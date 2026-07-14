import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Login</h1>
        <p className="mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>Auth forms — Phase 3</p>
        <Link to="/" style={{ color: 'hsl(var(--blue))' }}>Go Home</Link>
      </div>
    </div>
  )
}
