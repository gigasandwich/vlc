export default { getDashboardSnapshot }
import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDoc, doc, getFirestore } from 'firebase/firestore'

function logDevError(label, err, extra = undefined) {
  try {
    const code = err?.code || err?.name
    const message = err?.message || String(err)
    console.error(label, { code, message, err, ...(extra ? { extra } : {}) })
  } catch {
    // ignore
  }
}

function getOrInitFirebaseApp() {
  const config = getFirebaseConfig()
  try {
    assertFirebaseConfig(config)
  } catch (err) {
    logDevError('[Firebase] Invalid config', err, { config })
    throw new Error('Connexion impossible.')
  }

  if (!getApps().length) {
    return initializeApp(config)
  }
  return getApps()[0]
}

const app = getOrInitFirebaseApp()
const auth = getAuth(app)
const db = getFirestore(app)

async function ensureSignedIn() {
  const existing = auth.currentUser
  if (existing && !existing.isAnonymous) return existing

  const user = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe?.()
      resolve(null)
    }, 5000)

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        clearTimeout(timeout)
        unsubscribe?.()
        resolve(u)
      }
    })
  })

  if (!user || user.isAnonymous) {
    throw new Error('Veuillez vous connecter.')
  }

  return user
}

/**
 * Read the dashboard snapshot saved by the sync process at `dashboard/stats`.
 * Returns the document data (expected keys: summary, workDelay) or null if missing.
 */
export async function getDashboardSnapshot() {
  await ensureSignedIn()
  try {
    const ref = doc(db, 'dashboard', 'stats')
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data()
  } catch (err) {
    logDevError('[firestoreRecap] getDashboardSnapshot failed', err)
    return null
  }
}
