import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs, getDoc, getFirestore, setDoc, Timestamp } from 'firebase/firestore'

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
 * @param {number} level_
 * @returns {Promise<{ id: string } & Record<string, any>>}
 */
export async function createFirestorePoint({ coordinates, point_type_id, level_,photos }) {
  const user = await ensureSignedIn()
  let localUserId = null
  let localUser = null
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    localUser = u
    const id = Number(u?.id)
    if (Number.isFinite(id)) localUserId = id
  } catch {
    // ignore
  }

  const typeId = Number(point_type_id)
  const typeLabel = typeId === 2 ? 'grave' : typeId === 3 ? 'très grave' : 'peu grave'

  const now = new Date()
  const date_ = Timestamp.fromDate(now)

  // Keep an int-sized id (backend Point.id is Integer). This is used by the UI and for de-dup.
  // We can't safely use Date.now() (ms) because it exceeds Integer.MAX_VALUE.
  const safeIntId = Math.floor(now.getTime() / 1000)

  const roles = Array.isArray(localUser?.roles)
    ? localUser.roles
        .map((r) => ({
          label: r?.label != null ? String(r.label) : null,
          id: Number.isFinite(Number(r?.id)) ? Number(r.id) : null,
        }))
        .filter((r) => r.label)
    : localUser?.role
      ? [{
          label: String(localUser.role),
          id: Number.isFinite(Number(localUser?.roleId)) ? Number(localUser.roleId) : null,
        }]
      : []

  const userMap = {
    id: localUserId ?? null,
    email: localUser?.email ?? null,
    username: localUser?.username ?? null,
    // Never store passwords in Firestore from a client.
    password: null,
    userStateId: localUser?.userStateId ?? null,
    userState: localUser?.userState ?? null,
    fbId: user?.uid ?? localUser?.fbId ?? null,
    updatedAt: Timestamp.fromDate(now),
    roles,
  }

  const payload = {
    id: safeIntId,
    // Will be set to Firestore document id (see below)
    fbId: null,
    date_,
    level_: Number.isFinite(Number(level_)) ? Number(level_) : 1,
    surface: 0,
    budget: 0,
    coordinates: {
      longitude: Number(coordinates.longitude),
      latitude: Number(coordinates.latitude),
    },
    user: userMap,
    pointStateId: 1,
    pointState: {
      id: 1,
      label: 'nouveau',
    },
    pointTypeId: typeId,
    pointType: {
      id: typeId,
      label: typeLabel,
    },
    factories: [],
    level_:1,
    // photos: optional array of data URLs (base64) uploaded on client-side
}
  // Generate a document id first, so we can store it in `fbId`
  const ref = doc(collection(db, 'points'))
  payload.fbId = ref.id
  await setDoc(ref, payload)
  // Note: photo uploading is intentionally NOT handled here anymore.
  // Callers should upload compressed photos after the point is created using `addPhotoToPoint(pointId, dataUrl)`.
  return payload
}

/**
 * Add a photo document under points/{pointId}/photos
 * @param {string} pointId
 * @param {string} dataUrl
 */
export async function addPhotoToPoint(pointId, dataUrl) {
  const user = await ensureSignedIn()

  try {
    // Ensure parent point exists. If not, create a minimal point document similar to createFirestorePoint.
    const pointRef = doc(db, 'points', String(pointId))
    const pd = await getDoc(pointRef)
    if (!pd.exists()) {
      // build a minimal payload for the point so it adheres to expected schema
      const now = new Date()
      const date_ = Timestamp.fromDate(now)
      const safeIntId = Math.floor(now.getTime() / 1000)

      // try to get local user info for stored user map
      let localUserId = null
      let localUser = null
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null')
        localUser = u
        const id = Number(u?.id)
        if (Number.isFinite(id)) localUserId = id
      } catch {
        // ignore
      }

      const userMap = {
        id: localUserId ?? null,
        email: localUser?.email ?? null,
        username: localUser?.username ?? null,
        password: null,
        userStateId: localUser?.userStateId ?? null,
        userState: localUser?.userState ?? null,
        fbId: user?.uid ?? localUser?.fbId ?? null,
        updatedAt: Timestamp.fromDate(now),
        roles: Array.isArray(localUser?.roles) ? localUser.roles : [],
      }

      const payload = {
        id: safeIntId,
        fbId: String(pointId),
        date_,
        surface: 0,
        budget: 0,
        coordinates: { longitude: 0, latitude: 0 },
        user: userMap,
        pointStateId: 1,
        pointState: { id: 1, label: 'nouveau' },
        pointTypeId: 1,
        pointType: { id: 1, label: 'peu grave' },
        factories: [],
        level_:1,
      }

      try {
        await setDoc(pointRef, payload)
      } catch (err) {
        // If creating the point fails due to rules, log and rethrow a permission error
        const code = err?.code || err?.name
        const msg = err?.message || String(err)
        if (code === 'permission-denied' || /insufficient permissions/i.test(msg)) {
          const authInfo = getAuthDebug()
          logDevError('[Firestore] Create point permission denied while adding photo', err, { authInfo, pointId })
          throw new Error('Connexion refusée : pas de permission pour créer le point.')
        }
        logDevError('[Firestore] Failed to create parent point', err, { pointId })
        throw new Error('Impossible de créer le point parent.')
      }
    }

    // Now add the photo document under the point's photos subcollection
    const photoRef = doc(collection(db, 'points', String(pointId), 'photos'))
    await setDoc(photoRef, {
      data: dataUrl,
      uploadedAt: Timestamp.fromDate(new Date()),
      id: photoRef.id,
      userFbId: user?.uid ?? null,
    })
    return { id: photoRef.id }
  } catch (err) {
    const code = err?.code || err?.name
    const msg = err?.message || String(err)
    if (code === 'unauthenticated') {
      throw new Error('Veuillez vous connecter.')
    }
    if (code === 'permission-denied' || /insufficient permissions/i.test(msg)) {
      const authInfo = getAuthDebug()
      logDevError('[Firestore] Write photo permission denied', err, { authInfo, pointId })
      throw new Error('Connexion refusée : pas de permission.')
    }
    logDevError('[Firestore] Write photo failed', err, { pointId })
    throw new Error('Erreur de connexion. Réessaie plus tard.')
  }
}
