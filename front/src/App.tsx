import { useState } from 'react'
import LoginUser from './pages/auth/LoginUser'
import LoginAdmin from './pages/auth/LoginAdmin'
import Signup from './pages/auth/Signup'

type Route = 'user-login' | 'admin-login' | 'signup'

function App() {
  const [route, setRoute] = useState<Route>('user-login')

  return (
    <div>
      <header>
        <h1>Auth demo</h1>
        <nav>
          <button onClick={() => setRoute('user-login')}>User Login</button>{' '}
          <button onClick={() => setRoute('admin-login')}>Admin Login</button>{' '}
          <button onClick={() => setRoute('signup')}>Signup</button>
        </nav>
      </header>

      <main>
        {route === 'user-login' && <LoginUser />}
        {route === 'admin-login' && <LoginAdmin />}
        {route === 'signup' && <Signup />}
      </main>
    </div>
  )
}

export default App
