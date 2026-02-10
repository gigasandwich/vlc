import React, { useState } from 'react'
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
      const params = new URLSearchParams()
      params.append('email', email)
      params.append('password', password)
      params.append('username', username)

      const r = await fetch(`${backendURL}/auth/sign-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': `Bearer ${localStorage.getItem('jwt') || ''}` },
        body: params.toString(),
      })
      const j = await r.json()
      if (j.status === 'success') {
        alert('Compte cree avec succes !')
        onResponse(j, 'success')
      } else {
        alert(j.error)
        onResponse(j, 'error')
      }
    } catch (err) {
      alert(err)
      onResponse({ error: String(err) }, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-5 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center">
          <img src="/vlc_logo.png" alt="VLC" className="h-14 w-14 rounded-full border border-black/10 bg-white p-2 shadow-sm" />
        </div>
        <h2 className="text-center text-2xl/9 font-bold text-gray-700 mt-4">Creer un compte</h2>
        <form onSubmit={submit} className="space-y-6 mt-6">
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-600">Nom d'utilisateur</label>
            <div className="mt-2">
              <input
                id="username"
                type="text"
                name="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base text-black outline-none placeholder:text-gray-400 focus:border-black sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-600">Adresse email</label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base text-black outline-none placeholder:text-gray-400 focus:border-black sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-600">Mot de passe</label>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base text-black outline-none placeholder:text-gray-400 focus:border-black sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm/6 font-semibold text-white hover:bg-black/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              disabled={isLoading}
            >
              {isLoading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
