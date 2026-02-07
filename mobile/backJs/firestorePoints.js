import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'

/**
 * Loads Firebase (app + firestore) via CDN (no npm dependency).
 * Exposes `window.firebase`.
 */
function ensureFirebaseAssets() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Firebase can only be loaded in a browser context'))
  }

  // app
  const appId = 'firebase-app-compat'
  if (!document.getElementById(appId)) {
    const script = document.createElement('script')
    script.id = appId
    script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)
  }

  // firestore
  const fsId = 'firebase-firestore-compat'
  if (!document.getElementById(fsId)) {
    const script = document.createElement('script')
    script.id = fsId
    script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js'
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)
  }

  // auth (needed for projects with locked-down security rules)
  const authId = 'firebase-auth-compat'
  if (!document.getElementById(authId)) {
    const script = document.createElement('script')
    script.id = authId
    script.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
    script.crossOrigin = 'anonymous'
    document.body.appendChild(script)
  }

  return new Promise((resolve, reject) => {
    const check = () => {
      const firebase = window.firebase
      if (firebase && firebase.firestore && firebase.auth) {
        resolve()
        return
      }
      setTimeout(check, 25)
    }

    const fsScript = document.getElementById(fsId)
    if (!fsScript) {
      reject(new Error('Firebase Firestore script not found'))
      return
    }

    fsScript.addEventListener('error', () => reject(new Error('Failed to load Firebase Firestore')))
    check()
  })
}

function logDevError(label, err, extra = undefined) {
  try {
    const code = err?.code || err?.name
    const message = err?.message || String(err)
    console.error(label, { code, message, err, ...(extra ? { extra } : {}) })
  } catch {
    // ignore
  }
}

async function ensureSignedIn() {
  getOrInitFirebaseApp()
  const firebase = window.firebase

  // If auth is unavailable, just proceed (Firestore rules may still allow public read).
  if (!firebase?.auth) return

  const auth = firebase.auth()
  if (auth.currentUser) return

  try {
    await auth.signInAnonymously()

    // Wait until auth state is actually established.
    await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 5000)
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          clearTimeout(timeout)
          unsubscribe?.()
          resolve(user)
        }
      })
    })
  } catch (err) {
    // Keep details for developers, show a short message to users.
    logDevError('[Firebase] Anonymous auth failed', err)
    throw new Error('Connexion impossible. Réessaie plus tard.')
  }
}

function getAuthDebug() {
  try {
    const firebase = window.firebase
    const auth = firebase?.auth ? firebase.auth() : null
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

function getOrInitFirebaseApp() {
  const config = getFirebaseConfig()
  try {
    assertFirebaseConfig(config)
  } catch (err) {
    logDevError('[Firebase] Invalid config', err, { config })
    throw new Error('Connexion impossible.')
  }

  const firebase = window.firebase
  if (!firebase) {
    throw new Error('Firebase not loaded')
  }

  if (firebase.apps && firebase.apps.length) {
    return firebase.app()
  }

  return firebase.initializeApp(config)
}

function getFirestore() {
  getOrInitFirebaseApp()
  const firebase = window.firebase
  return firebase.firestore()
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
  await ensureFirebaseAssets()
  await ensureSignedIn()

  const db = getFirestore()
  let snap
  try {
    snap = await db.collection('points').get()
  } catch (err) {
    const code = err?.code || err?.name
    const msg = err?.message || String(err)
    if (code === 'permission-denied' || /insufficient permissions/i.test(msg)) {
      const authInfo = getAuthDebug()
      logDevError('[Firestore] Read permission denied', err, { authInfo })
      throw new Error('Connexion refusée : pas de permission.')
    }
    logDevError('[Firestore] Read failed', err)
    throw new Error('Erreur de connexion. Réessaie plus tard.')
  }

  const points = []
  snap.forEach((doc) => {
    points.push({ id: doc.id, ...doc.data() })
  })

  return points
}

/**
 * Create a new point in `points` collection.
 * @param {{ latitude: number, longitude: number }} coordinates
 * @param {number} point_type_id
 * @returns {Promise<{ id: string } & Record<string, any>>}
 */
export async function createFirestorePoint({ coordinates, point_type_id }) {
  await ensureFirebaseAssets()
  await ensureSignedIn()

  const db = getFirestore()
  let localUserId = null
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    const id = Number(u?.id)
    if (Number.isFinite(id)) localUserId = id
  } catch {
    // ignore
  }

  const firebase = window.firebase
  const GeoPoint = firebase?.firestore?.GeoPoint
  const Timestamp = firebase?.firestore?.Timestamp

  if (!GeoPoint) {
    logDevError('[Firestore] GeoPoint unavailable', new Error('GeoPoint unavailable'))
    throw new Error('Connexion impossible. Réessaie plus tard.')
  }

  const typeId = Number(point_type_id)
  const typeLabel = typeId === 2 ? 'grave' : typeId === 3 ? 'très grave' : 'peu grave'

  const now = new Date()
  const date_ = Timestamp?.fromDate ? Timestamp.fromDate(now) : now

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
  }

  let ref
  try {
    ref = await db.collection('points').add(payload)
  } catch (err) {
    const code = err?.code || err?.name
    const msg = err?.message || String(err)
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
