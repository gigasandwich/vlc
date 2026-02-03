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

  return new Promise((resolve, reject) => {
    const check = () => {
      const firebase = window.firebase
      if (firebase && firebase.firestore) {
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

function getOrInitFirebaseApp() {
  const config = getFirebaseConfig()
  assertFirebaseConfig(config)

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

  const db = getFirestore()
  const snap = await db.collection('points').get()

  const points = []
  snap.forEach((doc) => {
    points.push({ id: doc.id, ...doc.data() })
  })

  return points
}
