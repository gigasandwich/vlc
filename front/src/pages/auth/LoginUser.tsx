import React, { useState } from 'react'
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
        localStorage.setItem('jwt', j.data.token)
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
          <img src="/vlc_logo.png" alt="VLC" className="h-16 w-16 rounded-full border border-black/10 bg-white p-2 shadow-sm" />
        </div>
        <form onSubmit={submit} className="space-y-5 mt-6">
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
                className="block w-full rounded-md border border-black/10 bg-white px-3 py-2 text-base text-black outline-none placeholder:text-gray-400 focus:border-black sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-600">Mot de passe</label>
              {/* <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div> */}
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {isLoading ? 'En cours de connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

        {/* <p className="mt-10 text-center text-sm/6 text-gray-400">
          Not a member?
          <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300"> Start a 14 day free trial</a>
        </p> */}
      </div>
    </div>
  )
}
