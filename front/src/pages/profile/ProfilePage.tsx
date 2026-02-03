import { useState } from 'react';
import LoginUser from '../auth/LoginUser';

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleResponse = (data: any, type: 'success' | 'error') => {
    setMessageType(type);
    if (type === 'success') {
      setMessage('Connexion réussie !');
    } else {
      setMessage(data.error || 'Erreur');
    }
  };

  return (
    <div className="h-full w-full bg-gray-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-700">Connexion</h2>
          <p className="text-gray-500 mt-2">Connectez-vous pour continuer</p>
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
  );
}