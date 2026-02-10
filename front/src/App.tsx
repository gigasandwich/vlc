import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginUser from './pages/auth/LoginUser';
import RecapGlob from './pages/dashboard/recapGlob';
import MapPage from './components/MapPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPoints from './pages/admin/AdminPoints';
import ResetBlockingPage from './pages/admin/ResetBlockingPage';
import BottomNav from './components/BottomNav';
import UserInfo from './components/UserInfo';
import './App.css';
import Signup from './pages/auth/Signup';

function App() {
  const [user, setUser] = useState<any>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

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
          } else {
            setSessionExpired(true);
            localStorage.removeItem('jwt');
            setUser(null);
          }
        })
        .catch(() => {
          setSessionExpired(true);
          localStorage.removeItem('jwt');
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (sessionExpired) {
      alert('Your session has expired. Please log in again.');
      setSessionExpired(false);
    }
  }, [sessionExpired]);

  return (
    <BrowserRouter>
      <div className="h-screen w-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
        {user && <UserInfo user={user} />}
        <div className="flex-1 relative overflow-hidden">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/dashboard" element={
              <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h2>
                <RecapGlob onResponse={() => {}} />
              </div>
            } />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/profile" replace />} />
            <Route path="/admin/points" element={user && user.role === 'admin' ? <AdminPoints /> : <Navigate to="/profile" replace />} />
            <Route path="/admin/reset-blocking" element={user && user.role === 'admin' ? <ResetBlockingPage /> : <Navigate to="/profile" replace />} />
            <Route path="/signup" element={
              <div className="h-full w-full bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                  <Signup onResponse={(_, type) => {
                    if (type === 'success') {
                      // Redirect to profile/login after successful signup
                      window.location.href = '/profile';
                    }
                  }} />
                </div>
              </div>
            } />
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