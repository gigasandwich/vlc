interface SyncStatistics {
  usersCreatedLocally: number;
  usersPushedToFirestore: number;
  usersUpdatedLocally: number;
  usersUpdatedInFirestore: number;
  historicCreatedLocally: number;
  historicPushedToFirestore: number;
  historicUpdatedLocally: number;
  historicUpdatedInFirestore: number;
  pointsCreatedLocally: number;
  pointsPushedToFirestore: number;
  pointsUpdatedLocally: number;
  pointsUpdatedInFirestore: number;
  pointHistoricCreatedLocally: number;
  pointHistoricPushedToFirestore: number;
  pointHistoricUpdatedLocally: number;
  pointHistoricUpdatedInFirestore: number;
  totalErrors: number;
  errorMessages: string[];
}

interface SyncResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncResults: SyncStatistics | null;
}

export default function SyncResultsModal({ isOpen, onClose, syncResults }: SyncResultsModalProps) {
  if (!isOpen || !syncResults) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Resultats de Synchronisation</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Users Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2 text-blue-600">Utilisateurs</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Crees localement:</span>
                  <span className="font-medium text-green-600">{syncResults.usersCreatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pousses vers Firestore:</span>
                  <span className="font-medium text-blue-600">{syncResults.usersPushedToFirestore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis a jour localement:</span>
                  <span className="font-medium text-orange-600">{syncResults.usersUpdatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis a jour dans Firestore:</span>
                  <span className="font-medium text-purple-600">{syncResults.usersUpdatedInFirestore}</span>
                </div>
              </div>
            </div>

            {/* User History Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2 text-green-600">Historique Utilisateurs</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Crees localement:</span>
                  <span className="font-medium text-green-600">{syncResults.historicCreatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pousses vers Firestore:</span>
                  <span className="font-medium text-blue-600">{syncResults.historicPushedToFirestore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour localement:</span>
                  <span className="font-medium text-orange-600">{syncResults.historicUpdatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour dans Firestore:</span>
                  <span className="font-medium text-purple-600">{syncResults.historicUpdatedInFirestore}</span>
                </div>
              </div>
            </div>

            {/* Points Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2 text-red-600">Points</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Crees localement:</span>
                  <span className="font-medium text-green-600">{syncResults.pointsCreatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pousses vers Firestore:</span>
                  <span className="font-medium text-blue-600">{syncResults.pointsPushedToFirestore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour localement:</span>
                  <span className="font-medium text-orange-600">{syncResults.pointsUpdatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour dans Firestore:</span>
                  <span className="font-medium text-purple-600">{syncResults.pointsUpdatedInFirestore}</span>
                </div>
              </div>
            </div>

            {/* Point History Section */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-lg mb-2 text-yellow-600">Historique Points</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Crees localement:</span>
                  <span className="font-medium text-green-600">{syncResults.pointHistoricCreatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pousses vers Firestore:</span>
                  <span className="font-medium text-blue-600">{syncResults.pointHistoricPushedToFirestore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour localement:</span>
                  <span className="font-medium text-orange-600">{syncResults.pointHistoricUpdatedLocally}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour dans Firestore:</span>
                  <span className="font-medium text-purple-600">{syncResults.pointHistoricUpdatedInFirestore}</span>
                </div>
              </div>
            </div>

            {/* Errors Section */}
            <div className="border rounded-lg p-4 border-red-200 bg-red-50">
              <h4 className="font-semibold text-lg mb-2 text-red-600">Erreurs ({syncResults.totalErrors})</h4>
              <div className="max-h-40 overflow-y-auto">
                <ul className="text-sm text-red-700 space-y-1">
                  {syncResults.errorMessages.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 font-bold">.</span>
                      <span className="break-words">{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}