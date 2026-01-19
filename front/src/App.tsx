import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [examples, setExamples] = useState<Array<{id: number; column1?: string}>>([])

  useEffect(() => {
    fetch('http://localhost:1234/some-endpoint')
      .then((r) => r.json())
      .then(setExamples)
      .catch((e) => console.error('fetch /some-endpoint failed', e))
  }, [])

  return (
    <>
      <div>
        
        <div>
          <h2>Examples from backend</h2>
          <ul>
            {examples.map((ex) => (
              <li key={ex.id}>{ex.column1 ?? `#${ex.id}`}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default App
