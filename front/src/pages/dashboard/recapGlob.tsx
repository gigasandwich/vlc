import { useState } from 'react'
import { backendURL } from '../../constant'

interface recapGlobProps {
  onResponse: (data: any, type: 'success' | 'error') => void
}

export default function RecapGlob({ onResponse }: recapGlobProps) {
  const [nbPoints, setNbPoints] = useState(0)
  const [totalSurface, setTotalSurface] = useState(0.00)
  const [avgProgress,setAvgProgress] = useState(0.00)
  const [totalBudget,setTotalBudget] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setNbPoints(0)
    setTotalSurface(0)
    setAvgProgress(0)
    setTotalBudget(0)
    /*try {
        
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
    }*/
  }

  return (
    <div className="recapGlob-view">
      <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Récapitulation actuel</h2>
      <table>
        <tr>
            <th>Nombre de points</th>
            <th>Total de surface</th>
            <th>Moyenne des avancements</th>
            <th>Total de budget</th>
        </tr>
        <tr>
            <td>{nbPoints}</td>
            <td>{totalSurface}</td>
            <td>{avgProgress}</td>
            <td>{totalBudget}</td>
        </tr>
      </table>
    </div>
  )
}
