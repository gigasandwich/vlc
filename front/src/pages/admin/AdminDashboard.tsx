import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { backendURL } from '../../constant';

export default function AdminDashboard() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${backendURL}/sync/all`, { method: 'POST' });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        alert('Sync completed successfully');
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch (error) {
      alert('Error syncing: ' + error);
    } finally {
      setIsSyncing(false);
    }
  };
  const adminActions = [
    {
      title: 'Gestion des Points',
      link: '/admin/points',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" />
        </svg>
      )
    },
    {
      title: 'Creer Nouvel Utilisateur',
      link: '/signup',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      )
    },
    {
      title: 'Mettre a Jour Configurations',
      link: '/admin/configs',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: 'Reinitialiser Blocage',
      link: '/admin/reset-blocking',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tableau de Bord Administration</h2>

      <div className="mt-6">
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 no-underline cursor-pointer w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center">
            <div className="text-blue-600 mr-3 flex-shrink-0">
              <svg className={`w-8 h-8 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 flex-1 text-center">
              {isSyncing ? 'Synchronisation en cours...' : 'Synchronisation'}
            </h3>
          </div>
        </button>
      </div>
      
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminActions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 no-underline"
          >
            <div className="flex items-center">
              <div className="text-blue-600 mr-3 flex-shrink-0">
                {action.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 flex-1 text-center">{action.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}