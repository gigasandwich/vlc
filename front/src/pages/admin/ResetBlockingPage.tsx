import React, { useState, useEffect } from 'react';
import { backendURL } from '../../constant';

interface BlockedUser {
  id: number;
  email: string;
  username: string | null;
}

export default function ResetBlockingPage() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendURL}/users/blocked`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setBlockedUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch blocked users');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetBlock = async (userId: number) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('No authentication token found');
      return;
    }

    try {
      const response = await fetch(`${backendURL}/auth/reset-block/${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Block reset successfully');
        fetchBlockedUsers(); // Refresh
      } else {
        alert(data.error || 'Failed to reset block');
      }
    } catch (err) {
      alert('Network error occurred');
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reinitialisation bloc</h2>
      {blockedUsers.length === 0 ? (
        <div className="text-gray-600 text-center">Aucun utilisateur bloque</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blockedUsers.map(user => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <div className="mb-2">
                <div className="font-semibold text-gray-900">{user.email}</div>
                {user.username && (
                  <div className="text-sm text-gray-600">Username: {user.username}</div>
                )}
              </div>
              <button
                onClick={() => resetBlock(user.id)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Reinitialiser
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}