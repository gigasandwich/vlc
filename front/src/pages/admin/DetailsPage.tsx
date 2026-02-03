import { useMemo, useState } from 'react'

type PointType = { id: number; label: string }
type PointState = { id: number; label: string; order: number; progress: number }
type Factory = { id: number; label: string }
type User = { id: number; email: string; username?: string }

type Point = {
  id: number
  date: string
  surface?: number
  budget?: number
  lat: number
  lng: number
  userId: number
  pointStateId: number
  pointTypeId: number
  factoryIds: number[]
}

type Tab = 'points' | 'types' | 'states' | 'factories'

function formatNumber(v: number | undefined) {
  if (v === undefined || Number.isNaN(v)) return '-'
  return String(v)
}

export default function DetailsPage() {
  const [tab, setTab] = useState<Tab>('points')
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Mock data (no backend integration for now)
  const [users] = useState<User[]>([
    { id: 1, email: 'admin@vlc.local', username: 'Admin' },
    { id: 2, email: 'user@vlc.local', username: 'User' },
  ])

  const [pointTypes, setPointTypes] = useState<PointType[]>([
    { id: 1, label: 'Fuite' },
    { id: 2, label: 'Panne' },
  ])

  const [pointStates, setPointStates] = useState<PointState[]>([
    { id: 1, label: 'Ouvert', order: 1, progress: 0 },
    { id: 2, label: 'En cours', order: 2, progress: 50 },
    { id: 3, label: 'Terminé', order: 3, progress: 100 },
  ])

  const [factories, setFactories] = useState<Factory[]>([
    { id: 1, label: 'Usine A' },
    { id: 2, label: 'Usine B' },
  ])

  const [points, setPoints] = useState<Point[]>([
    {
      id: 101,
      date: new Date().toISOString().slice(0, 10),
      surface: 12.5,
      budget: 15000,
      lat: -18.8792,
      lng: 47.5079,
      userId: 1,
      pointStateId: 1,
      pointTypeId: 1,
      factoryIds: [1],
    },
    {
      id: 102,
      date: new Date().toISOString().slice(0, 10),
      surface: 20,
      budget: 40000,
      lat: -18.91,
      lng: 47.52,
      userId: 2,
      pointStateId: 2,
      pointTypeId: 2,
      factoryIds: [1, 2],
    },
  ])

  const [editingPointId, setEditingPointId] = useState<number | null>(null)
  const editingPoint = useMemo(() => points.find(p => p.id === editingPointId) || null, [points, editingPointId])

  const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users])
  const typeById = useMemo(() => new Map(pointTypes.map(t => [t.id, t])), [pointTypes])
  const stateById = useMemo(() => new Map(pointStates.map(s => [s.id, s])), [pointStates])
  const factoryById = useMemo(() => new Map(factories.map(f => [f.id, f])), [factories])

  const pointsUsingType = (typeId: number) => points.some(p => p.pointTypeId === typeId)
  const pointsUsingState = (stateId: number) => points.some(p => p.pointStateId === stateId)
  const pointsUsingFactory = (factoryId: number) => points.some(p => p.factoryIds.includes(factoryId))

  const Pill = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
    <span
      className={
        'px-3 py-1.5 rounded-full text-sm border transition-colors ' +
        (active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-slate-700 border-gray-200')
      }
    >
      {children}
    </span>
  )

  const TabButton = ({ value, label }: { value: Tab; label: string }) => (
    <button
      onClick={() => {
        setTab(value)
        setNotice(null)
      }}
      className="text-left"
      type="button"
    >
      <Pill active={tab === value}>{label}</Pill>
    </button>
  )

  const Notice = () => {
    if (!notice) return null
    return (
      <div
        className={
          'mb-4 rounded-lg border px-4 py-3 text-sm ' +
          (notice.type === 'success'
            ? 'bg-green-50 border-green-100 text-green-800'
            : 'bg-red-50 border-red-100 text-red-800')
        }
      >
        {notice.text}
      </div>
    )
  }

  // ----- Points: update/delete only -----
  const [pointForm, setPointForm] = useState<{
    date: string
    surface: string
    budget: string
    lat: string
    lng: string
    userId: string
    pointStateId: string
    pointTypeId: string
    factoryIds: number[]
  } | null>(null)

  const openEditPoint = (p: Point) => {
    setEditingPointId(p.id)
    setPointForm({
      date: p.date,
      surface: p.surface === undefined ? '' : String(p.surface),
      budget: p.budget === undefined ? '' : String(p.budget),
      lat: String(p.lat),
      lng: String(p.lng),
      userId: String(p.userId),
      pointStateId: String(p.pointStateId),
      pointTypeId: String(p.pointTypeId),
      factoryIds: [...p.factoryIds],
    })
  }

  const closeEditPoint = () => {
    setEditingPointId(null)
    setPointForm(null)
  }

  const savePoint = () => {
    if (!editingPoint || !pointForm) return

    const lat = Number(pointForm.lat)
    const lng = Number(pointForm.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setNotice({ type: 'error', text: 'Latitude/Longitude invalides' })
      return
    }

    const updated: Point = {
      id: editingPoint.id,
      date: pointForm.date,
      surface: pointForm.surface.trim() ? Number(pointForm.surface) : undefined,
      budget: pointForm.budget.trim() ? Number(pointForm.budget) : undefined,
      lat,
      lng,
      userId: Number(pointForm.userId),
      pointStateId: Number(pointForm.pointStateId),
      pointTypeId: Number(pointForm.pointTypeId),
      factoryIds: pointForm.factoryIds,
    }

    setPoints(prev => prev.map(p => (p.id === updated.id ? updated : p)))
    setNotice({ type: 'success', text: 'Point mis à jour (local)' })
  }

  const deletePoint = (id: number) => {
    setPoints(prev => prev.filter(p => p.id !== id))
    if (editingPointId === id) closeEditPoint()
    setNotice({ type: 'success', text: 'Point supprimé (local)' })
  }

  // ----- Reference tables: update/delete only -----
  const updateType = (id: number, label: string) => {
    setPointTypes(prev => prev.map(t => (t.id === id ? { ...t, label } : t)))
    setNotice({ type: 'success', text: 'Type mis à jour (local)' })
  }

  const deleteType = (id: number) => {
    if (pointsUsingType(id)) {
      setNotice({ type: 'error', text: 'Impossible: type utilisé par un point' })
      return
    }
    setPointTypes(prev => prev.filter(t => t.id !== id))
    setNotice({ type: 'success', text: 'Type supprimé (local)' })
  }

  const updateState = (id: number, patch: Partial<Omit<PointState, 'id'>>) => {
    setPointStates(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
    setNotice({ type: 'success', text: 'État mis à jour (local)' })
  }

  const deleteState = (id: number) => {
    if (pointsUsingState(id)) {
      setNotice({ type: 'error', text: 'Impossible: état utilisé par un point' })
      return
    }
    setPointStates(prev => prev.filter(s => s.id !== id))
    setNotice({ type: 'success', text: 'État supprimé (local)' })
  }

  const updateFactory = (id: number, label: string) => {
    setFactories(prev => prev.map(f => (f.id === id ? { ...f, label } : f)))
    setNotice({ type: 'success', text: 'Usine mise à jour (local)' })
  }

  const deleteFactory = (id: number) => {
    if (pointsUsingFactory(id)) {
      setNotice({ type: 'error', text: 'Impossible: usine liée à un point' })
      return
    }
    setFactories(prev => prev.filter(f => f.id !== id))
    setNotice({ type: 'success', text: 'Usine supprimée (local)' })
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Info Details</h2>
          <p className="text-sm text-gray-500">Gestion locale (liste + update + delete, sans création)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TabButton value="points" label="Points" />
          <TabButton value="types" label="Types" />
          <TabButton value="states" label="États" />
          <TabButton value="factories" label="Usines" />
        </div>
      </div>

      <Notice />

      {tab === 'points' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Liste des points</h3>
                <p className="text-sm text-gray-500">Inspiré de la table point + liaisons (user_, point_state, point_type, point_factory)</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-100">
                {points.length} éléments
              </span>
            </div>

            <div className="w-full overflow-auto border border-gray-100 rounded-xl">
              <table className="min-w-[1100px] w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">ID</th>
                    <th className="text-left font-semibold px-4 py-3">Date</th>
                    <th className="text-left font-semibold px-4 py-3">Surface</th>
                    <th className="text-left font-semibold px-4 py-3">Budget</th>
                    <th className="text-left font-semibold px-4 py-3">Coordonnées</th>
                    <th className="text-left font-semibold px-4 py-3">Utilisateur</th>
                    <th className="text-left font-semibold px-4 py-3">État</th>
                    <th className="text-left font-semibold px-4 py-3">Type</th>
                    <th className="text-left font-semibold px-4 py-3">Usines</th>
                    <th className="text-left font-semibold px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map(p => {
                    const u = userById.get(p.userId)
                    const st = stateById.get(p.pointStateId)
                    const ty = typeById.get(p.pointTypeId)
                    const fLabels = p.factoryIds
                      .map(id => factoryById.get(id)?.label)
                      .filter(Boolean)
                      .join(', ')

                    return (
                      <tr key={p.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-slate-700 font-medium">{p.id}</td>
                        <td className="px-4 py-3 text-gray-700">{p.date}</td>
                        <td className="px-4 py-3 text-gray-700">{formatNumber(p.surface)}</td>
                        <td className="px-4 py-3 text-gray-700">{formatNumber(p.budget)}</td>
                        <td className="px-4 py-3 text-gray-700">{p.lat}, {p.lng}</td>
                        <td className="px-4 py-3 text-gray-700">{u?.username || u?.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{st?.label || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{ty?.label || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{fLabels || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-slate-700 hover:bg-white"
                              onClick={() => openEditPoint(p)}
                              type="button"
                            >
                              Modifier
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                              onClick={() => deletePoint(p.id)}
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {points.length === 0 && (
                    <tr className="border-t border-gray-100">
                      <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                        Aucun point.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Édition</h3>
              <p className="text-sm text-gray-500">Update uniquement (pas de création)</p>
            </div>

            {!editingPoint || !pointForm ? (
              <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-4">
                Sélectionnez un point puis cliquez sur “Modifier”.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs text-gray-500">Point #{editingPoint.id}</div>

                <div>
                  <label className="text-xs font-medium text-gray-600">Date (date_)</label>
                  <input
                    type="date"
                    value={pointForm.date}
                    onChange={e => setPointForm(prev => (prev ? { ...prev, date: e.target.value } : prev))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Surface</label>
                    <input
                      value={pointForm.surface}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, surface: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Budget</label>
                    <input
                      value={pointForm.budget}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, budget: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Latitude</label>
                    <input
                      value={pointForm.lat}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, lat: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Longitude</label>
                    <input
                      value={pointForm.lng}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, lng: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">Utilisateur (user_)</label>
                  <select
                    value={pointForm.userId}
                    onChange={e => setPointForm(prev => (prev ? { ...prev, userId: e.target.value } : prev))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {users.map(u => (
                      <option key={u.id} value={String(u.id)}>
                        {u.username || u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">État (point_state)</label>
                    <select
                      value={pointForm.pointStateId}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, pointStateId: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {pointStates.map(s => (
                        <option key={s.id} value={String(s.id)}>
                          {s.label} ({s.progress}%)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Type (point_type)</label>
                    <select
                      value={pointForm.pointTypeId}
                      onChange={e => setPointForm(prev => (prev ? { ...prev, pointTypeId: e.target.value } : prev))}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100"
                    >
                      {pointTypes.map(t => (
                        <option key={t.id} value={String(t.id)}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">Usines (point_factory)</label>
                  <div className="mt-2 space-y-2">
                    {factories.map(f => {
                      const checked = pointForm.factoryIds.includes(f.id)
                      return (
                        <label key={f.id} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => {
                              const next = e.target.checked
                                ? Array.from(new Set([...pointForm.factoryIds, f.id]))
                                : pointForm.factoryIds.filter(id => id !== f.id)
                              setPointForm(prev => (prev ? { ...prev, factoryIds: next } : prev))
                            }}
                          />
                          {f.label}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={savePoint}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={closeEditPoint}
                    className="px-4 py-2 rounded-lg bg-white text-slate-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {tab === 'types' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Point types</h3>
            <p className="text-sm text-gray-500">Update + delete uniquement</p>
          </div>

          <div className="space-y-2">
            {pointTypes.map(t => (
              <div key={t.id} className="border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="text-sm font-medium text-slate-700 w-10">#{t.id}</div>
                <input
                  value={t.label}
                  onChange={e => updateType(t.id, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => deleteType(t.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            ))}

            {pointTypes.length === 0 && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-4">
                Aucun type.
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'states' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Point states</h3>
            <p className="text-sm text-gray-500">Update + delete uniquement</p>
          </div>

          <div className="space-y-2">
            {pointStates.map(s => (
              <div key={s.id} className="border border-gray-100 rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="text-sm font-medium text-slate-700 md:col-span-1">#{s.id}</div>
                <input
                  value={s.label}
                  onChange={e => updateState(s.id, { label: e.target.value })}
                  className="md:col-span-5 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <input
                  value={String(s.order)}
                  onChange={e => updateState(s.id, { order: Number(e.target.value) })}
                  className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="order_"
                />
                <input
                  value={String(s.progress)}
                  onChange={e => updateState(s.id, { progress: Number(e.target.value) })}
                  className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="progress"
                />
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => deleteState(s.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}

            {pointStates.length === 0 && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-4">
                Aucun état.
              </div>
            )}
          </div>
        </section>
      )}

      {tab === 'factories' && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Factories</h3>
            <p className="text-sm text-gray-500">Update + delete uniquement</p>
          </div>

          <div className="space-y-2">
            {factories.map(f => (
              <div key={f.id} className="border border-gray-100 rounded-lg p-3 flex items-center gap-3">
                <div className="text-sm font-medium text-slate-700 w-10">#{f.id}</div>
                <input
                  value={f.label}
                  onChange={e => updateFactory(f.id, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => deleteFactory(f.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            ))}

            {factories.length === 0 && (
              <div className="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-4">
                Aucune usine.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
