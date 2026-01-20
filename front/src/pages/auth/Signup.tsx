import { useState } from 'react'
import { backendURL } from '../../constant'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [resp, setResp] = useState<any>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const r = await fetch(`${backendURL}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })
      const j = await r.json()
      setResp(j)
    } catch (err) {
      setResp({ error: String(err) })
    }
  }

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <div>
          <label>Username: <input value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        </div>
        <div>
          <label>Email: <input value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        </div>
        <div>
          <label>Password: <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        </div>
        <div>
          <button type="submit">Create account</button>
        </div>
      </form>

      <h3>Response</h3>
      <pre>{resp ? JSON.stringify(resp, null, 2) : 'No response yet'}</pre>
    </div>
  )
}
