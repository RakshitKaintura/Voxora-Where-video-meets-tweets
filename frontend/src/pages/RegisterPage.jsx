import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--background))' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Register</h1>
        <p className="mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>Registration form — Phase 3</p>
        <Link to="/login" style={{ color: 'hsl(var(--blue))' }}>Back to Login</Link>
      </div>
    </div>
  )
}
