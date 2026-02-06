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
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-500">Adresse email</label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                name="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm/6 font-medium text-gray-500">Mot de passe</label>
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
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
