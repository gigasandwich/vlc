import React, { useEffect, useState } from 'react';
import { backendURL } from '../../constant';
import { formatDate, formatNumber, capitalize } from '../../utils';

export default function AdminPoints() {
  const [points, setPoints] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [factories, setFactories] = useState<any[]>([]);
  const [pointStates, setPointStates] = useState<any[]>([]);
  const [pointTypes, setPointTypes] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [formData, setFormData] = useState({
    surface: '',
    budget: '',
    pointStateId: '',
    pointTypeId: '',
    factoryIds: [] as number[],
    updatedAt: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/points`);
      const data = await res.json();
      if (data && data.data) {
        setPoints(data.data);
        console.log(data);
      } else {
        setError('Invalid response');
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [factRes, stateRes, typeRes] = await Promise.all([
        fetch(`${backendURL}/points/factories`),
        fetch(`${backendURL}/points/pointStates`),
        fetch(`${backendURL}/points/pointTypes`)
      ]);
      const factData = await factRes.json();
      const stateData = await stateRes.json();
      const typeData = await typeRes.json();
      if (factData.data) setFactories(factData.data);
      if (stateData.data) setPointStates(stateData.data);
      if (typeData.data) setPointTypes(typeData.data);
    } catch (e: any) {
      console.error('Error loading options:', e);
    }
  };

  useEffect(() => {
    load();
    loadOptions();
  }, []);

  const handleEdit = (point: any) => {
    setSelectedPoint(point);
    setFormData({
      surface: point.surface || '',
      budget: point.budget || '',
      pointStateId: point.stateId || '',
      pointTypeId: point.typeId || '',
      factoryIds: point.factoryIds || [],
      updatedAt: new Date().toISOString().slice(0, 16),
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      alert('No JWT found, please login');
      return;
    }
    try {
      const updatedAt = formData.updatedAt.length === 16 ? formData.updatedAt + ':00' : formData.updatedAt;
      const res = await fetch(`${backendURL}/points/${selectedPoint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          surface: parseFloat(formData.surface),
          budget: parseFloat(formData.budget),
          pointStateId: parseInt(formData.pointStateId),
          pointTypeId: parseInt(formData.pointTypeId),
          factoryIds: formData.factoryIds,
          updatedAt: updatedAt,
        })
      });
      if (res.ok) {
        setIsEditing(false);
        load();
      } else {
        const data = await res.json();
        alert(`Update failed: ${res.status} ${res.statusText}\n${data.error}`);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (point: any) => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      alert('No JWT found, please login');
      return;
    }

    const ok = window.confirm(`Supprimer le point #${point.id} ?`);
    if (!ok) return;

    try {
      setDeletingId(point.id);
      const res = await fetch(`${backendURL}/points/${point.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (res.ok) {
        await load();
      } else {
        let details = '';
        try {
          const data = await res.json();
          details = data?.error ?? data?.message ?? JSON.stringify(data);
        } catch {
          details = await res.text();
        }
        alert(`Delete failed: ${res.status} ${res.statusText}\n${details}`);
      }
    } catch (e: any) {
      alert('Error: ' + (e?.message || String(e)));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCheckboxChange = (factoryId: number, checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      factoryIds: checked
        ? [...prev.factoryIds, factoryId]
        : prev.factoryIds.filter((id: any) => id !== factoryId)
    }));
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Points</h2>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Rafraichir</span>
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && points && (
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold">ID</th>
                <th className="px-6 py-3 font-semibold">Date de creation</th>
                <th className="px-6 py-3 font-semibold text-right">Surface</th>
                <th className="px-6 py-3 font-semibold text-right">Budget</th>
                <th className="px-6 py-3 font-semibold">Type</th>        
                <th className="px-6 py-3 font-semibold">Entreprises</th>                
                <th className="px-6 py-3 font-semibold">Etat</th>
                <th className="px-6 py-3 font-semibold">Actions</th>
                <th className="px-6 py-3 font-semibold">Date de derniere modification</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">{p.id}</td>
                  <td className="px-6 py-4">{formatDate(p.date)}</td>
                  <td className="px-6 py-4 text-right">{Number.isFinite(Number(p.surface)) ? formatNumber(Number(p.surface)) : ''}</td>
                  <td className="px-6 py-4 text-right">{Number.isFinite(Number(p.budget)) ? formatNumber(Number(p.budget)) : ''}</td>
                  <td className="px-6 py-4">{capitalize(p.typeLabel)}</td>
                  <td className="px-6 py-4">{p.factoryLabels ? p.factoryLabels.split(',').map((s: any) => capitalize(s.trim())).join(', ') : ''}</td>
                  <td className="px-6 py-4">{capitalize(p.stateLabel)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p)} className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14" />
                        </svg>
                        <span>{deletingId === p.id ? 'Deleting…' : 'Delete'}</span>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatDate(p.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && points === null && (
        <div className="text-gray-500">No data</div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Edit Point {selectedPoint.id}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Surface</label>
                <input
                  type="number"
                  value={formData.surface}
                  onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                  className="col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Budget</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Etat du probleme</label>
                <select
                  value={formData.pointStateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointStateId: e.target.value }))}
                  className="col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Selectionnez un etat</option>
                  {pointStates.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Type du probleme</label>
                <select
                  value={formData.pointTypeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointTypeId: e.target.value }))}
                  className="col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Selectionnez un type</option>
                  {pointTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4 items-start">
                <label className="text-sm font-medium text-gray-700 pt-3">Usines</label>
                <div className="col-span-2 space-y-2 max-h-32 overflow-y-auto">
                  {factories.map((f: any) => (
                    <label key={f.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.factoryIds.includes(f.id)}
                        onChange={(e) => handleCheckboxChange(f.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Date de modification</label>
                <input
                  type="datetime-local"
                  value={formData.updatedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, updatedAt: e.target.value }))}
                  className="col-span-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md transition-all duration-200 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
