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
  const [workDelays, setWorkDelays] = useState<any[]>([])
  const [avgNewLabel, setAvgNewLabel] = useState<string | null>(null)
  const [avgInProgLabel, setAvgInProgLabel] = useState<string | null>(null)
  const [avg0to1Label, setAvg0to1Label] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchWorkDelays = async () => {
      try {
        const r = await fetch(`${backendURL}/points/work-delay`, { method: 'GET', headers: { 'Content-Type': 'application/json' } })
        const j = await r.json()
        if (j.status === 'success') {
          // backend returns { workTreatments: WorkTreatmentDTO[], average0to05Ms/Label, average05to1Ms/Label, average0to1Ms/Label }
          const payload = j.data ?? {}
          setWorkDelays(payload.workTreatments ?? [])
          setAvgNewLabel(payload.average0to05Label ?? null)
          setAvgInProgLabel(payload.average05to1Label ?? null)
          setAvg0to1Label(payload.average0to1Label ?? null)
        } else {
          // ignore
        }
      } catch (err) {
        // ignore
      }
    }
    fetchWorkDelays()
  }, [])

  const StatCard = ({ title, value, icon, unit = '', color = 'green' }: { title: string, value: string | number, icon: any, unit?: string, color?: string }) => (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex items-center">
      <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${color}-100 text-${color}-600 mr-4 shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-gray-800">
          {value}
          {unit && <span className="text-base font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );

  const IconMapPin = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const IconRuler = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M8 4v4m8-4v4" /></svg>;
  const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
  const IconCash = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;


  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white p-5 rounded-xl shadow-md border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="absolute top-5 right-5 w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <StatCard title="Points signalés" value={nbPoints} icon={<IconMapPin />} color="blue" />
        <StatCard title="Surface totale" value={totalSurface.toFixed(2)} unit="m²" icon={<IconRuler />} color="purple" />
        <StatCard title="Avancement moyen" value={avgProgress.toFixed(2)} unit="%" icon={<IconTrendingUp />} color="green" />
        <StatCard title="Budget total" value={totalBudget.toLocaleString()} unit="Ar" icon={<IconCash />} color="yellow" />
      </div>

      {/* Work delays table */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Délai de traitement des travaux</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="py-2 pr-4">Point</th>
                    <th className="py-2 pr-4">Nouveau ➡ En cours</th>
                    <th className="py-2 pr-4">En cours ➡ Terminé</th>
                    <th className="py-2 pr-4">Nouveau ➡ Terminé</th>
                  </tr>
                </thead>
            <tbody>
              {workDelays.map((w) => {
                const p = w.pointDTO
                const d1Label = w.newDelaytoInProgressLabel
                const d2Label = w.inProgressDelaytofinishedLabel
                    const totalLabel = w.totalDelayLabel
                return (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="py-3 pr-4">#{p.id} — {p.point_type_label ?? ''} — {p.point_state_label ?? ''}</td>
                    <td className="py-3 pr-4">{d1Label ?? '—'}</td>
                    <td className="py-3 pr-4">{d2Label ?? '—'}</td>
                        <td className="py-3 pr-4">{totalLabel ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
                <tfoot>
                  <tr className="border-t font-semibold text-gray-700">
                    <td className="py-3 pr-4">Moyennes</td>
                    <td className="py-3 pr-4">{avgNewLabel ?? '—'}</td>
                    <td className="py-3 pr-4">{avgInProgLabel ?? '—'}</td>
                    <td className="py-3 pr-4">{avg0to1Label ?? '—'}</td>
                  </tr>
                </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
