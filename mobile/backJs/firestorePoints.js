import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, GeoPoint, getDocs, getFirestore, Timestamp } from 'firebase/firestore'

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

  // Wait briefly for persisted auth state to be restored.
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
    // Anonymous auth is forbidden.
    throw new Error('Veuillez vous connecter.')
  }

  return user
}

function getAuthDebug() {
  try {
    const user = auth?.currentUser
    return {
      signedIn: !!user,
      uid: user?.uid || null,
      isAnonymous: !!user?.isAnonymous,
    }
  } catch {
    return { signedIn: false, uid: null, isAnonymous: null }
  }
}

/**
 * @typedef {{
 *  id: string,
 *  budget?: number,
 *  coordinates?: { latitude: number, longitude: number },
 *  date_?: any,
 *  point_state_id?: number,
 *  point_type_id?: number,
 *  surface?: number,
 *  user_id?: number,
 *  [key: string]: any
 * }} FirestorePoint
 */

/**
 * Fetch all points from `points` collection.
 * @returns {Promise<FirestorePoint[]>}
 */
export async function fetchFirestorePoints() {
  await ensureSignedIn()
  let snap
  try {
    snap = await getDocs(collection(db, 'points'))
  } catch (err) {
    const code = err?.code || err?.name
    const msg = err?.message || String(err)
    if (code === 'unauthenticated') {
      throw new Error('Veuillez vous connecter.')
    }
    if (code === 'permission-denied' || /insufficient permissions/i.test(msg)) {
      const authInfo = getAuthDebug()
      logDevError('[Firestore] Read permission denied', err, { authInfo })
      throw new Error('Connexion refusée : pas de permission.')
    }
    logDevError('[Firestore] Read failed', err)
    throw new Error('Erreur de connexion. Réessaie plus tard.')
  }

  const points = []
  snap.forEach((doc) => points.push({ id: doc.id, ...doc.data() }))

  return points
}

/**
 * Create a new point in `points` collection.
 * @param {{ latitude: number, longitude: number }} coordinates
 * @param {number} point_type_id
 * @returns {Promise<{ id: string } & Record<string, any>>}
 */
export async function createFirestorePoint({ coordinates, point_type_id }) {
  const user = await ensureSignedIn()
  let localUserId = null
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    const id = Number(u?.id)
    if (Number.isFinite(id)) localUserId = id
  } catch {
    // ignore
  }

  const typeId = Number(point_type_id)
  const typeLabel = typeId === 2 ? 'grave' : typeId === 3 ? 'très grave' : 'peu grave'

  const now = new Date()
  const date_ = Timestamp.fromDate(now)

  const payload = {
    budget: 0,
    surface: 0,
    date_,
    coordinates: new GeoPoint(Number(coordinates.latitude), Number(coordinates.longitude)),
    point_state: {
      id: 1,
      label: 'nouveau',
    },
    point_type: {
      id: typeId,
      label: typeLabel,
    },
    user_id: localUserId ?? null,
    createdByUid: user?.uid || null,
  }

  let ref
  try {
    ref = await addDoc(collection(db, 'points'), payload)
  } catch (err) {
    const code = err?.code || err?.name
    const msg = err?.message || String(err)
    if (code === 'unauthenticated') {
      throw new Error('Veuillez vous connecter.')
    }
    if (code === 'permission-denied' || /insufficient permissions/i.test(msg)) {
      const authInfo = getAuthDebug()
      logDevError('[Firestore] Write permission denied', err, { authInfo, payload })
      throw new Error('Connexion refusée : pas de permission.')
    }
    logDevError('[Firestore] Write failed', err, { payload })
    throw new Error('Erreur de connexion. Réessaie plus tard.')
  }
  return { id: ref.id, ...payload }
}
