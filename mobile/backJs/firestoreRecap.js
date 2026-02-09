import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { collection, doc, getDocs, getFirestore, setDoc, Timestamp } from 'firebase/firestore'
import { fetchFirestorePoints } from './firestorePoints.js'

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
 * Compute summary similar to backend PointsSummaryRepository.getSummary()
 * - count: number of documents in `points` collection
 * - surface: sum of `surface` fields from each point's `history` subcollection where pointState.label == 'nouveau'
 * - avgProgress: average of current point.pointState.progress values (if present)
 * - budget: sum of `budget` fields from all history rows (approx full-join aggregation)
 *
 * @returns {Promise<{count:number, surface:number, avgProgress:number|null, budget:number}>}
 */
export async function getSummary() {
  await ensureSignedIn()

  // fetch points from helper (ensures auth and consistent shape)
  const points = await fetchFirestorePoints()

  const count = Array.isArray(points) ? points.length : 0

  // compute avg progress from current point documents
  // Firestore does not store `progress` numeric field; infer from state label:
  // 'nouveau' => 0, 'en cours' => 50, 'termine' => 100
  const progressVals = (points || [])
    .map((p) => {
      const label = (p?.pointState?.label ?? p?.point_state?.label ?? p?.pointStateLabel ?? p?.point_state_label ?? '')
      const key = String(label).toLowerCase().trim()
      if (key === 'nouveau') return 0
      if (key === 'en cours' || key === 'encours' || key === 'en_cours') return 50
      if (key === 'termine' || key === 'terminé' || key === 'termine' ) return 100
      // unknown state: skip
      return null
    })
    .filter((v) => v !== null)

  const avgProgress = progressVals.length ? progressVals.reduce((a, b) => a + b, 0) / progressVals.length : null

  // iterate histories to compute surface (where state label == 'nouveau') and budget (sum all historic budgets)
  let surfaceSum = 0
  let budgetSum = 0
  for (const p of points) {
    try {
      // resolve Firestore document id safely: fetchFirestorePoints may set p.id to a number if the document
      // data contains an `id` property. Prefer a string doc id when available.
      const docId = (typeof p.id === 'string' && p.id) ? p.id : (p.__docId ?? p.fbId ?? String(p.id ?? ''))
      if (!docId) {
        // fallback to values on the point document itself
        surfaceSum += Number(p?.surface)
        budgetSum += Number(p?.budget)
        continue
      }

      const histSnap = await getDocs(collection(db, 'points', docId, 'history'))
      surfaceSum += Number(p?.surface) ?? 0
      budgetSum += Number(p?.budget) ?? 0
      if (!histSnap.empty) {
        histSnap.forEach((h) => {
          const data = h.data() ?? null
          const stateLabel = data?.pointState?.label ?? data?.point_state?.label ?? data?.pointStateLabel ?? data?.point_state_label
          const surface = Number(data?.surface) || 0
          const budget = Number(data?.budget) || 0
          if (String(stateLabel || '').toLowerCase() === 'nouveau') {
            surfaceSum += surface
          }
          budgetSum += budget
        })
      }
    } catch (err) {
      // log and continue; history may be missing or protected by rules
      logDevError('[firestoreRecap] failed to fetch history for point ' + (p.__docId ?? p.id), err)
      // fallback to point-level values when history cannot be read
      surfaceSum += Number(p?.surface) || 0
      budgetSum += Number(p?.budget) || 0
    }
  }

  return {
    count,
    surface: surfaceSum,
    avgProgress,
    budget: budgetSum,
  }
}