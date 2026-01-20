import { useState } from 'react'
import { backendURL } from '../../constant'

interface SignupProps {
  onResponse: (data: any, type: 'success' | 'error') => void
}

export default function Signup({ onResponse }: SignupProps) {
  const [username, setUsername] = useState('newusername')
  const [email, setEmail] = useState('newuser@gmail.com')
  const [password, setPassword] = useState('newpass')
  const [isLoading, setIsLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const r = await fetch(`${backendURL}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, password, username }).toString(),
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
      <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Create Account</h2>
      <form onSubmit={submit} className="auth-form">
        <div className="form-group">
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="johndoe"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
