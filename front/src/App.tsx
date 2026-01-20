//import { useEffect, useState } from 'react'
import MapHome from './components/Map'
import './App.css'

function App() {
  //const [count, setCount] = useState(0)
  //const [examples, setExamples] = useState<Array<{id: number; column1?: string}>>([])

  // useEffect(() => {
  //   fetch('http://localhost:1234/some-endpoint')
  //     .then((r) => r.json())
  //     .then(setExamples)
  //     .catch((e) => console.error('fetch /some-endpoint failed', e))
  // }, [])

  return (
    <>
      <div>
        
        <div>
          <h2>Carte d Antananarivo</h2>
          <main>
            <MapHome />
          </main>
        </div>
      </div>
    </>
  )
}

export default App
