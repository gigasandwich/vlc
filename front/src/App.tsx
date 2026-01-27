import { useState } from 'react'
import LoginUser from './pages/auth/LoginUser'
import MapPage from './components/Map'
import './App.css'

// Définition des types d'onglets
type Tab = 'map' | 'dashboard' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('map') // Par défaut : Map
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  // Fonction de callback pour le Login
  const handleResponse = (data: any, type: 'success' | 'error') => {
    setMessageType(type)
    if (type === 'success') {
      setMessage('Login successful!')
      // Optionnel: après login, on pourrait rediriger vers la map
      // setActiveTab('map') 
    } else {
      setMessage(data.error || 'An error occurred')
    }
  }

  // Composant pour le Dashboard (Page blanche)
  const DashboardView = () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-white">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
      <p className="text-gray-500 mt-2">Contenu vide pour le moment</p>
    </div>
  )

  // Composant pour la page Profile/Login
  const ProfileView = () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-700">Connexion Utilisateur</h2>
        
        {message && (
          <div className={`p-3 mb-4 rounded text-sm text-center ${
            messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
        
        <LoginUser onResponse={handleResponse} />
      </div>
    </div>
  )

  // Icônes SVG simples
  const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" />
    </svg>
  )
  const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
  const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )

  return (
    // CONTENEUR PRINCIPAL : Prend toute la hauteur de l'écran (fixe le bug de taille)
    <div className={`h-screen w-screen flex flex-col bg-gray-100 font-sans ${activeTab === 'map' ? 'overflow-hidden' : 'overflow-auto'}`}>
      
      {/* ZONE DE CONTENU (Flex-1 : prend tout l'espace sauf la barre du bas) */}
      <div className={`flex-1 relative ${activeTab === 'map' ? 'overflow-hidden' : 'overflow-auto'}`}>
        
        {/* VUE CARTE */}
        {activeTab === 'map' && (
          <div className="h-full w-full">
            <MapPage />
          </div>
        )}

        {/* VUE TABLEAU (Page blanche) */}
        {activeTab === 'dashboard' && (
          <DashboardView />
        )}

        {/* VUE PROFIL (Login) */}
        {activeTab === 'profile' && (
          <ProfileView />
        )}

      </div>

      {/* BOTTOM BAR (Navigation fixe en bas) */}
      <nav className="bg-white w-full border-t border-gray-200 h-16 shrink-0 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        
        {/* Bouton Carte */}
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            activeTab === 'map' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform duration-200 ${activeTab === 'map' ? '-translate-y-1' : ''}`}>
            <MapIcon />
          </div>
          <span className="text-[10px] mt-1 font-medium">Carte</span>
        </button>

        {/* Bouton Tableau */}
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform duration-200 ${activeTab === 'dashboard' ? '-translate-y-1' : ''}`}>
            <DashboardIcon />
          </div>
          <span className="text-[10px] mt-1 font-medium">Tableau</span>
        </button>

        {/* Bouton Profil */}
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
            activeTab === 'profile' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className={`p-1 rounded-lg transition-transform duration-200 ${activeTab === 'profile' ? '-translate-y-1' : ''}`}>
            <ProfileIcon />
          </div>
          <span className="text-[10px] mt-1 font-medium">Profil</span>
        </button>

      </nav>
    </div>
  )
}

export default App