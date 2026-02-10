import React, { useState, useEffect } from 'react';
import { backendURL } from '../../constant';

interface User {
  id: number;
  email: string;
  username: string;
  roles: Array<{id: number, label: string, fbId: string}>;
  updatedAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendURL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data);
      } else {
        alert('Erreur lors du chargement des utilisateurs');
      }
    } catch (error) {
      alert('Erreur: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email
    });
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ username: '', email: '', role: '' });
  };

  const saveUser = async () => {
    if (!editingUser) return;

    try {
      const params = new URLSearchParams();
      params.append('email', editForm.email);
      if (editForm.username) params.append('username', editForm.username);

      const response = await fetch(`${backendURL}/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
        body: params.toString()
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Utilisateur modifie avec succes');
        setEditingUser(null);
        fetchUsers(); // Refresh the list
      } else {
        alert(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      alert('Erreur: ' + error);
    }
  };

  const deleteUser = async (userEmail: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const params = new URLSearchParams();
      params.append('email', userEmail);

      const response = await fetch(`${backendURL}/users/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`
        },
        body: params.toString()
      });
      const data = await response.json();
      if (data.status === 'success') {
        alert('Utilisateur supprimé avec succès');
        fetchUsers(); // Refresh the list
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      alert('Erreur: ' + error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
        <div className="text-center">Chargement des utilisateurs...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Utilisateurs</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom d'utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modifié le
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.roles.length > 0 ? user.roles[0].label : 'USER'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUser?.id === user.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveUser}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors cursor-pointer"
                      >
                        Sauvegarder
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(user)}
                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteUser(user.email)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}