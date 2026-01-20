import { useState } from 'react'
import { backendURL } from '../../constant'

export default function LoginUser() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resp, setResp] = useState<any>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
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
      setResp(j)
    } catch (err) {
      setResp({ error: String(err) })
    }
  }

  return (
    <div>
      <h2>User login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email: <input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        </div>
        <div>
          <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        </div>
        <div>
          <button type="submit">Sign in</button>
        </div>
      </form>

      <h3>Response</h3>
      <pre>{resp ? JSON.stringify(resp, null, 2) : 'No response yet'}</pre>
    </div>
  )
}
