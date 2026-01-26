import { useState } from 'react'
import LoginUser from './pages/auth/LoginUser'
import Signup from './pages/auth/Signup'
import './App.css'

type Route = 'user-login' | 'signup' | 'admin'

function App() {
  const [route, setRoute] = useState<Route>('user-login')
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  // Callback to handle response data from children
  const handleResponse = (data: any, type: 'success' | 'error') => {
    setMessageType(type)
    if (type === 'success') {
      if (route === 'user-login' && data.data?.token) {
        localStorage.setItem('token', data.data.token)
        setMessage('Login successful!')
        setRoute('admin')
      } else if (route === 'signup') {
        setMessage(data.data || 'Signup successful!')
      }
    } else {
      setMessage(data.error || 'An error occurred')
    }
  }

  const switchRoute = (newRoute: Route) => {
    setRoute(newRoute)
    setMessage(null)
    setMessageType(null)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Authentication</h1>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${route === 'user-login' ? 'active' : ''}`}
            onClick={() => switchRoute('user-login')}
          >
            Sign In
          </button>
          <button
            className={`nav-tab ${route === 'signup' ? 'active' : ''}`}
            onClick={() => switchRoute('signup')}
          >
            Sign Up
          </button>
        </nav>
      </header>

      <main>
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
        {route === 'user-login' && <LoginUser onResponse={handleResponse} />}
        {route === 'signup' && <Signup onResponse={handleResponse} />}
      </main>
    </div>
  )
}

export default App
