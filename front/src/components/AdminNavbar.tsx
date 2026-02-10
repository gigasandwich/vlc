import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { backendURL } from '../constant';
import SyncResultsModal from '../pages/admin/SyncResultsModal';

interface AdminNavbarProps {
  user: any;
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [pointsDropdownOpen, setPointsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const usersDropdownRef = useRef<HTMLDivElement>(null);
  const pointsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usersDropdownRef.current && !usersDropdownRef.current.contains(event.target as Node)) {
        setUsersDropdownOpen(false);
      }
      if (pointsDropdownRef.current && !pointsDropdownRef.current.contains(event.target as Node)) {
        setPointsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`${backendURL}/sync/all`, { 
        method: 'POST', 
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt')}` || '',
        } 
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setSyncResults(data.data);
        setShowSyncModal(true);
      } else {
        alert(data.error || 'Erreur lors de la synchronisation');
      }
    } catch (error) {
      alert('Erreur: ' + error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <nav className="bg-gray-800 fixed w-full z-20 top-0 start-0 border-b border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4 w-full">
        <div className="flex items-center flex-1 space-x-6">
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse no-underline -ml-2">
            {/* <div className="p-1.5 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div> */}
            <span className="self-center text-lg font-bold whitespace-nowrap bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">VLC</span>
          </Link>
          
          {/* User Info */}
          <div className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-300">{user.name || user.username}</div>
          </div>
        </div>
        
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button 
            type="button" 
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-300 rounded-lg md:hidden hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-600" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h14"/>
            </svg>
          </button>
        </div>

        <div className={`${mobileMenuOpen ? 'block' : 'hidden'} w-full md:flex md:w-auto md:order-1`}>
          <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-600 rounded-lg bg-gray-700 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-gray-800 md:items-center list-none m-0">
            
            {/* Users Dropdown */}
            <li className="relative" ref={usersDropdownRef}>
              <button 
                onClick={() => setUsersDropdownOpen(!usersDropdownOpen)}
                className="flex items-center justify-between w-full md:w-auto bg-gray-600 md:bg-transparent py-2 px-3 md:py-0 md:px-0 md:p-0 rounded md:rounded-none font-medium text-lg text-gray-300 hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-blue-400 no-underline transition-colors duration-200"
              >
                Utilisateurs 
                <svg className={`w-3 h-3 md:w-4 md:h-4 ms-1.5 transition-transform duration-200 ${usersDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
                </svg>
              </button>
              {usersDropdownOpen && (
                <div className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-48 mt-2 top-full left-0">
                  <ul className="py-1 text-sm font-medium list-none m-0">
                    <li>
                      <Link 
                        to="/signup" 
                        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white no-underline transition-colors duration-150"
                        onClick={() => setUsersDropdownOpen(false)}
                      >
                        Créer Nouvel Utilisateur
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/users" 
                        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white no-underline transition-colors duration-150"
                        onClick={() => setUsersDropdownOpen(false)}
                      >
                        Modifier Utilisateurs
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/reset-blocking" 
                        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white no-underline transition-colors duration-150"
                        onClick={() => setUsersDropdownOpen(false)}
                      >
                        Réinitialiser Blocage
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Points Dropdown */}
            <li className="relative" ref={pointsDropdownRef}>
              <button 
                onClick={() => setPointsDropdownOpen(!pointsDropdownOpen)}
                className="flex items-center justify-between w-full md:w-auto bg-gray-600 md:bg-transparent py-2 px-3 md:py-0 md:px-0 md:p-0 rounded md:rounded-none font-medium text-lg text-gray-300 hover:bg-gray-500 md:hover:bg-transparent md:border-0 md:hover:text-blue-400 no-underline transition-colors duration-200"
              >
                Gestion des Points
                <svg className={`w-3 h-3 md:w-4 md:h-4 ms-1.5 transition-transform duration-200 ${pointsDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/>
                </svg>
              </button>
              {pointsDropdownOpen && (
                <div className="absolute z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-48 mt-2 top-full left-0">
                  <ul className="py-1 text-sm font-medium list-none m-0">
                    <li>
                      <Link 
                        to="/admin/points" 
                        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white no-underline transition-colors duration-150"
                        onClick={() => setPointsDropdownOpen(false)}
                      >
                        Vue d'ensemble
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/points/price" 
                        className="block py-2 px-4 text-gray-300 hover:bg-gray-700 hover:text-white no-underline transition-colors duration-150"
                        onClick={() => setPointsDropdownOpen(false)}
                      >
                        Modification prix
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>

            {/* Config */}
            {/* <li>
              <Link to="/admin/configs" className="block md:inline py-2 px-3 text-gray-300 rounded hover:bg-gray-600 md:hover:bg-transparent md:border-0 md:hover:text-blue-400 md:p-0 md:py-0 no-underline transition-colors duration-200">
                Configurations
              </Link>
            </li> */}

            {/* Sync Button */}
            <li className="w-full md:w-auto">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full md:w-auto text-white bg-blue-600 hover:bg-blue-700 box-border border border-transparent focus:ring-4 focus:ring-blue-500 shadow-sm font-medium text-sm px-4 py-2 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSyncing ? 'Sync...' : 'Sync'}
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
      <SyncResultsModal 
        isOpen={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        syncResults={syncResults}
      />
    </>
  );
}