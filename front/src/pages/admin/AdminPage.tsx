import React, { useEffect, useState } from 'react';
import { backendURL } from '../../constant';

export default function AdminPage() {
  const [points, setPoints] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    factoryIds: [] as number[]
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/points/list`);
      const data = await res.json();
      if (data && data.data) {
        setPoints(data.data);
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
      factoryIds: []
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
          factoryIds: formData.factoryIds
        })
      });
      if (res.ok) {
        setIsEditing(false);
        load();
      } else {
        alert('Update failed');
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
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
        <h2 className="text-2xl font-bold text-gray-800">Administration — Points</h2>
        <button onClick={load} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && points && (
        <div className="bg-white shadow rounded border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Surface</th>
                <th className="px-4 py-2">Budget</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p: any) => (
                <tr key={p.id} className="border-t even:bg-gray-50">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.date}</td>
                  <td className="px-4 py-2">{p.surface}</td>
                  <td className="px-4 py-2">{p.budget}</td>
                  <td className="px-4 py-2">{p.stateLabel}</td>
                  <td className="px-4 py-2">{p.typeLabel}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleEdit(p)} className="px-2 py-1 bg-green-600 text-white rounded">Edit</button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Edit Point {selectedPoint.id}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Surface</label>
                <input
                  type="number"
                  value={formData.surface}
                  onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Budget</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Point State</label>
                <select
                  value={formData.pointStateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointStateId: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select State</option>
                  {pointStates.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Point Type</label>
                <select
                  value={formData.pointTypeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointTypeId: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Type</option>
                  {pointTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Factories</label>
                {factories.map((f: any) => (
                  <label key={f.id} className="block">
                    <input
                      type="checkbox"
                      checked={formData.factoryIds.includes(f.id)}
                      onChange={(e) => handleCheckboxChange(f.id, e.target.checked)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 mr-2 bg-gray-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
