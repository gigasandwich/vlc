/**
 * Firebase Functions client helpers.
 *
 * Requires deploying Cloud Functions (see `mobile/functions`).
 */

import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions'

function getOrInitFirebaseApp() {
  const config = getFirebaseConfig()
  assertFirebaseConfig(config)
  if (!getApps().length) {
    return initializeApp(config)
  }
  return getApps()[0]
}

const app = getOrInitFirebaseApp()

export async function trackFailedLoginAttempt(email) {
  const functions = getFunctions(app)
  const call = httpsCallable(functions, 'trackFailedLoginAttempt')
  const res = await call({ email })
  return res?.data || null
}

export async function resetLoginAttempt(uid) {
  const functions = getFunctions(app)
  const call = httpsCallable(functions, 'resetLoginAttempt')
  const res = await call({ uid })
  return res?.data || null
}
