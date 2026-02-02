import { useState } from 'react'
import LoginUser from './pages/auth/LoginUser'
import RecapGlob from './pages/dashboard/recapGlob'
import MapPage from './components/MapPage'
import './App.css'

type Tab = 'map' | 'dashboard' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map') 
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  const handleResponse = (data: any, type: 'success' | 'error') => {
    setMessageType(type)
    if (type === 'success') {
      setMessage('Connexion réussie !')
      setActiveTab('map') // Redirection auto vers la carte
    } else {
      setMessage(data.error || 'Erreur')
    }
  }

  const DashboardView = () => (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RecapGlob/>
      </div>
    </div>
  )

  const ProfileView = () => (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-700">Connexion</h2>
        </div>
        {message && (
          <div className={`p-3 mb-4 rounded text-center ${
            messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
        <LoginUser onResponse={handleResponse} />
      </div>
    </div>
  )

  // --- ICONES SVG ---
  const IconMap = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" /></svg>
  const IconDash = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  const IconUser = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>

  const NavItem = ({ tab, label, icon: Icon }: { tab: Tab, label: string, icon: any }) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex-1 flex flex-col items-center justify-center py-2 transition-all duration-200 ${
          isActive ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        <div className={`p-1.5 rounded-full transition-transform duration-200 ${isActive ? '-translate-y-1 bg-blue-100 text-blue-600' : ''}`}>
          <Icon />
        </div>
        <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      </button>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 font-sans overflow-hidden">
      
      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* VUE MAP */}
        {activeTab === 'map' && (
          <div className="h-full w-full">
            <MapPage />
          </div>
        )}

        {/* VUE DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardView />
        )}

        {/* VUE PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView />
        )}
        
      </div>

      {/* BOTTOM BAR (Responsive) */}
      <nav className="bg-white w-full border-t border-gray-200 h-16 shrink-0 flex justify-around items-center shadow-[0_-4px_15px_rgba(0,0,0,0.02)] z-[2000]">
        <NavItem tab="map" label="Carte" icon={IconMap} />
        <NavItem tab="dashboard" label="Tableau" icon={IconDash} />
        <NavItem tab="profile" label="Profil" icon={IconUser} />
      </nav>

    </div>
  )
}

export default App