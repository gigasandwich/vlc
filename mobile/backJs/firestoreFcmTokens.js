import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'

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

export async function upsertUserFcmToken({ userDocId, token, platform }) {
  if (!userDocId || !token) return

  const ref = doc(db, 'users', String(userDocId), 'fcmTokens', String(token))
  await setDoc(
    ref,
    {
      token: String(token),
      platform: platform ? String(platform) : null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
