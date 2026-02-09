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

function normalizeRole(role) {
  if (!role) return null

  // Supports shapes:
  // - { id: number, label: string }
  // - { roleTypeId: number, label: string }
  // - { label: string }
  // - 'USER'
  const label =
    typeof role === 'string'
      ? role
      : typeof role?.label === 'string'
        ? role.label
        : typeof role?.name === 'string'
          ? role.name
          : null

  const rawId =
    typeof role === 'object'
      ? (role?.id ?? role?.roleTypeId ?? role?.role_id ?? role?.typeRoleId ?? null)
      : null
  const id = rawId == null ? null : Number(rawId)

  return {
    id: Number.isFinite(id) ? id : null,
    label: label != null ? String(label) : null,
  }
}

function normalizeRoles(userDoc) {
  const roles = Array.isArray(userDoc?.roles)
    ? userDoc.roles
    : userDoc?.role
      ? [userDoc.role]
      : []

  return roles
    .map(normalizeRole)
    .filter((r) => r && r.label)
    .map((r) => ({ id: r.id ?? null, label: String(r.label) }))
}

function hasUserRole(userDoc) {
  const roles = normalizeRoles(userDoc)
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

    const data = doc.data() || {}
    return {
      _docId: doc.id,
      ...data,
      roles: normalizeRoles(data),
    }
  } catch (err) {
    logDevError('[Firestore] Failed to fetch user profile', err, { uid })
    throw err
  }
}

export function assertUserRole(profile) {
  if (!profile) throw new Error('Accès refusé')
  if (!hasUserRole(profile)) throw new Error('Accès refusé')
}
