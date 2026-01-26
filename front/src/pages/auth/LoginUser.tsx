import { useState } from 'react'
import { backendURL } from '../../constant'

interface LoginUserProps {
  onResponse: (data: any, type: 'success' | 'error') => void
}

export default function LoginUser({ onResponse }: LoginUserProps) {
  const [email, setEmail] = useState('user1@gmail.com')
  const [password, setPassword] = useState('user1')
  const [isLoading, setIsLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('password', password)

      const r = await fetch(`${backendURL}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
      const j = await r.json()
      if (j.status === 'success') {
        onResponse(j, 'success')
      } else {
        onResponse(j, 'error')
      }
    } catch (err) {
      onResponse({ error: String(err) }, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-view">
      <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Welcome Back</h2>
      <form onSubmit={submit} className="auth-form">
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
