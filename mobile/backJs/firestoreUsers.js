import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'

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
  assertFirebaseConfig(config)
  if (!getApps().length) {
    return initializeApp(config)
  }
  return getApps()[0]
}

const app = getOrInitFirebaseApp()
const db = getFirestore(app)

function hasUserRole(userDoc) {
  const roles = Array.isArray(userDoc?.roles) ? userDoc.roles : []
  return roles.some((r) => String(r?.label || '').toUpperCase() === 'USER')
}

/**
 * Fetch user profile from Firestore `users` collection by firebase uid (stored as `fbId`).
 * Expects a document shape like:
 * { id: number, email: string, fbId: string, username: string, roles: [{label:"USER"|...}] }
 */
export async function fetchUserProfileByFirebaseUid(uid) {
  if (!uid) throw new Error('Connexion refusée')
  try {
    const q = query(collection(db, 'users'), where('fbId', '==', uid))
    const snap = await getDocs(q)
    const doc = snap.docs[0]
    if (!doc) return null
    return { _docId: doc.id, ...doc.data() }
  } catch (err) {
    logDevError('[Firestore] Failed to fetch user profile', err, { uid })
    throw err
  }
}

export function assertUserRole(profile) {
  if (!profile) throw new Error('Accès refusé')
  if (!hasUserRole(profile)) throw new Error('Accès refusé')
}
