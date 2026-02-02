import { useState } from 'react'
import { backendURL } from '../../constant'

interface LoginUserProps {
  onResponse: (data: any, type: 'success' | 'error') => void
}

export default function LoginUser({ onResponse }: LoginUserProps) {
  const [email, setEmail] = useState('admin@gmail.com')
  const [password, setPassword] = useState('admin123')
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
    <form onSubmit={submit} className="space-y-4">
      <div className="form-group">
        <label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="nom@example.com"
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
      <div className="form-group">
        <label htmlFor="login-password"  className="text-sm font-medium text-gray-700">Mot de passe</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
        />
      </div>
      <button type="submit" className="w-full py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 ease-in-out disabled:bg-green-300" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
