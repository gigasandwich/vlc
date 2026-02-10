import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { collection, getDocs, getFirestore, limit, query, updateDoc, where } from 'firebase/firestore'

function logDevError(label, err, extra = undefined) {
  try {
    const code = err?.code || err?.name
    const message = err?.message || String(err)
    // Suppress permission-denied errors (expected when Firestore rules block pre-auth access)
    if (code === 'permission-denied') {
      console.debug(label, { code, message, ...(extra ? { extra } : {}) })
    } else {
      console.error(label, { code, message, err, ...(extra ? { extra } : {}) })
    }
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

/**
 * Fetch user profile from Firestore `users` collection by email.
 * NOTE: This requires Firestore rules to allow it pre-auth.
 */
export async function fetchUserProfileByEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return null

  try {
    const q = query(collection(db, 'users'), where('email', '==', e), limit(1))
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
    logDevError('[Firestore] Failed to fetch user profile by email', err, { email: e })
    throw err
  }
}

function isUserDisabled(profile) {
  if (!profile) return false
  if (profile.disabled === true) return true
  const label = String(profile?.userState?.label || '').toUpperCase()
  if (label && label !== 'ACTIVE') return true
  return false
}

export function assertUserNotDisabled(profile) {
  if (!profile) throw new Error('Accès refusé')
  if (isUserDisabled(profile)) throw new Error('Compte bloqué')
}

async function updateUserDoc(docId, patch) {
  if (!docId) throw new Error('Connexion refusée')
  // Lazy import of doc() to keep this file consistent with modular style
  const { doc } = await import('firebase/firestore')
  const ref = doc(db, 'users', String(docId))
  await updateDoc(ref, patch)
}

/**
 * Increment login attempt counter for the given email.
 * Directly updates the user document by finding it via email query.
 * Returns the updated attempt count.
 */
export async function incrementAttemptByEmail(email) {
  const emailKey = String(email || '').trim().toLowerCase()
  if (!emailKey) {
    console.error('[Firestore] Invalid email for incrementAttemptByEmail')
    return { attempt: null, profile: null }
  }

  try {
    console.log("TRYYYY")
    // Query user by email
    const q = query(collection(db, 'users'), where('email', '==', emailKey), limit(1))
    console.log(q)
    const snap = await getDocs(q)
    console.log(snap)
    const doc = snap.docs[0]

    console.log(doc)
    
    if (!doc) {
      console.warn('[Firestore] User not found by email:', emailKey)
      return { attempt: null, profile: null }
    }

    const docId = doc.id
    const currentAttempt = Number(doc.data()?.attempt ?? 0)
    const nextAttempt = currentAttempt + 1

    // Update the attempt counter
    const { doc: docRef } = await import('firebase/firestore')
    const userRef = docRef(db, 'users', docId)
    await updateDoc(userRef, { attempt: nextAttempt })

    console.log('[Firestore] Updated attempt for', emailKey, ':', nextAttempt)
    return { attempt: nextAttempt, profile: { ...doc.data(), attempt: nextAttempt } }
  } catch (err) {
    const code = err?.code || err?.name
    const message = err?.message || String(err)
    console.error('[Firestore] Failed to increment attempt', { code, message, err, email: emailKey })
    throw err
  }
}

/**
 * Reset attempt counter for a logged-in user (by firebase uid).
 */
export async function resetAttemptByFirebaseUid(uid) {
  const profile = await fetchUserProfileByFirebaseUid(uid)
  if (!profile?._docId) return
  try {
    await updateUserDoc(profile._docId, { attempt: 0 })
  } catch (err) {
    logDevError('[Firestore] Failed to reset attempt', err, { uid })
  }
}

/**
 * Mark a user as disabled in Firestore (app-level block).
 * This does NOT disable the Firebase Authentication user (requires Admin SDK).
 */
export async function disableUserByEmail(email) {
  const emailKey = String(email || '').trim().toLowerCase()
  if (!emailKey) return

  try {
    // Query user by email
    const q = query(collection(db, 'users'), where('email', '==', emailKey), limit(1))
    const snap = await getDocs(q)
    const doc = snap.docs[0]
    
    if (!doc) {
      console.warn('[Firestore] User not found by email for disabling:', emailKey)
      return
    }

    const docId = doc.id
    const { doc: docRef } = await import('firebase/firestore')
    const userRef = docRef(db, 'users', docId)
    await updateDoc(userRef, { disabled: true })
    console.log('[Firestore] Disabled user:', emailKey)
  } catch (err) {
    const code = err?.code || err?.name
    const message = err?.message || String(err)
    console.error('[Firestore] Failed to disable user', { code, message, err, email: emailKey })
  }
}

export function assertUserRole(profile) {
  if (!profile) throw new Error('Accès refusé')
  if (!hasUserRole(profile)) throw new Error('Accès refusé')
}
