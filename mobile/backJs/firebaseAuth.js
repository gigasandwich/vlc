/**
 * Simple Firebase auth helpers for the mobile app.
 *
 * Exports:
 *  - register(email, password) : creates a new user
 *  - login(email, password)    : signs in an existing user
 *
 * Uses `getFirebaseConfig` / `assertFirebaseConfig` from `firebaseConfig.js`.
 */
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { getFirebaseConfig, assertFirebaseConfig } from './firebaseConfig.js'

const firebaseConfig = getFirebaseConfig()
assertFirebaseConfig(firebaseConfig)

// Initialize app only once (works well with HMR)
if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const auth = getAuth()

/**
 * Register a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user?: import('firebase/auth').User, error?: any}>}
 */
/** register is not required to the mobile but may be useful later
  export async function register(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    return { user: userCredential.user }
  } catch (error) {
    return { error }
  }
}
*/

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user?: import('firebase/auth').User, error?: any}>}
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return { user: userCredential.user }
  } catch (error) {
    return { error }
  }
}

// Default export for convenience
export default { /*register,*/ login }
