/**
 * Firebase Web config.
 *
 * Configure via Vite env vars in `mobile/.env` (or `.env.local`).
 * Values must be prefixed with `VITE_` to be exposed to the client.
 */

export function getFirebaseConfig() {
  // Vite injects import.meta.env at build time.
  const env = /** @type {any} */ (import.meta.env || {})

  return {
    apiKey: env.VITE_FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || '',
  }
}

export function assertFirebaseConfig(config) {
  const missing = []

  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY')
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN')
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID')

  if (missing.length) {
    throw new Error(
      `Firebase config missing: ${missing.join(', ')}. ` +
        'Create `mobile/.env.local` (or `mobile/.env`) and set these variables.'
    )
  }
}
