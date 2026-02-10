import React, { useEffect, useState } from 'react';
import { backendURL } from '../../constant';

export default function PriceModification() {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [formPrice, setFormPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPrice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/prices/current`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setCurrentPrice(data.data.price);
        setFormPrice(data.data.price.toString());
      }
    } catch (e: any) {
      setError('Error loading price: ' + (e.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch(`${backendURL}/prices/history`);
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data)) {
        setPriceHistory(data.data);
      }
    } catch (e: any) {
      setError('Error loading history: ' + (e.message || String(e)));
    }
  };

  useEffect(() => {
    loadPrice();
    loadHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      setError('No JWT found, please login');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${backendURL}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({ price: parseFloat(formPrice) })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSuccess('Prix mis à jour avec succès');
        loadPrice();
        loadHistory();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (e: any) {
      setError('Error: ' + (e.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Modification des Prix</h1>

      {loading && <div className="text-gray-600">Chargement...</div>}
      {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

      {!loading && (
        <>
          {/* Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-8 max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Actuel (Ar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-[300px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </form>
          </div>

          {/* History Table */}
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Historique des Prix</h2>
            </div>
            {priceHistory.length === 0 ? (
              <div className="px-6 py-4 text-gray-600">Aucun historique disponible</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Prix (Ar)</th>
                  </tr>
                </thead>
                <tbody>
                  {priceHistory.map((item: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-3 text-sm text-gray-900">
                        {new Date(item.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

