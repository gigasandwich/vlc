import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginUser from './pages/auth/LoginUser';
import MapPage from './components/MapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPoints from './pages/admin/AdminPoints';
import DashboardPage from './pages/dashboard/DashboardPage';
import DetailsPage from './pages/admin/DetailsPage.tsx';
import BottomNav from './components/BottomNav';
import UserInfo from './components/UserInfo';
import './App.css';
import type { MapPoint } from './types/mapPoints'

function App() {
  const [user, setUser] = useState<any>(null);
  const [points, setPoints] = useState<MapPoint[]>([]);

  const isAdmin = !!(
    user &&
    (user.role === 'admin' ||
      (Array.isArray(user.roles) && user.roles.some((r: any) => r?.label === 'ADMIN')))
  );

  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:1234'}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      })
        .then(r => r.json())
        .then(j => {
          if (j.status === 'success') {
            setUser(j.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
        {user && <UserInfo user={user} />}
        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<MapPage points={points} setPoints={setPoints} />} />
            <Route path="/map" element={<MapPage points={points} setPoints={setPoints} />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/details" element={isAdmin ? <DetailsPage /> : <Navigate to="/profile" replace />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/points" element={<AdminPoints />} />
            <Route path="/profile" element={
              <div className="h-full w-full bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-700">Connexion</h2>
                    <p className="text-gray-500 mt-2">Connectez-vous pour continuer</p>
                  </div>
                  <LoginUser onResponse={(_, type) => {
                    if (type === 'success') {
                      // Fetch user after login
                      const jwt = localStorage.getItem('jwt');
                      if (jwt) {
                        fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:1234'}/auth/me`, {
                          headers: { Authorization: `Bearer ${jwt}` }
                        })
                          .then(r => r.json())
                          .then(j => {
                            if (j.status === 'success') {
                              setUser(j.data);
                            }
                          });
                      }
                    }
                  }} />
                </div>
              </div>
            } />
          </Routes>
        </div>
        <BottomNav user={user} />
      </div>
    </BrowserRouter>
  );
}

export default App;