import { useState } from 'react'
import LoginUser from './pages/auth/LoginUser'
import Signup from './pages/auth/Signup'

type Route = 'user-login' | 'signup'

function App() {
  const [route, setRoute] = useState<Route>('user-login')

  return (
    <div>
      <header>
        <h1>Authentication</h1>
        <nav>
          <button onClick={() => setRoute('user-login')}>Sign In</button>{' '}
          <button onClick={() => setRoute('signup')}>Sign Up</button>
        </nav>
      </header>

      <main>
        {route === 'user-login' && <LoginUser />}
        {route === 'signup' && <Signup />}
      </main>
    </div>
  )
}

export default App
