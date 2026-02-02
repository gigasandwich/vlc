import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true)
    try {
      const r = await fetch(`${backendURL}/points/summary`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      const j = await r.json()

      if (j.status === 'success') {
        setNbPoints(j.data.nbPoints)
        setTotalSurface(j.data.totalSurface)
        setAvgProgress(j.data.avgProgress)
        setTotalBudget(j.data.totalBudget)

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
    fetchSummary()
  },[])

  return (
    <div className="recapGlob-view">
      <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Récapitulation actuel</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre de points</th>
            <th>Total de surface</th>
            <th>Moyenne des avancements</th>
            <th>Total de budget</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{nbPoints}</td>
            <td>{totalSurface}</td>
            <td>{avgProgress}</td>
            <td>{totalBudget}</td>
          </tr>
        </tbody>
      </table>

    </div>
  )
}
