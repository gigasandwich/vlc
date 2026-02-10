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
  signOut,
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


export async function login(email, password, maxAttempts = 3) {
  const MAX_ATTEMPTS = Math.max(1, Number(maxAttempts))
  
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    return { user: userCredential.user }
  } catch (error) { // On login failure, attempt++
    console.error('[Auth] Login failed:', error?.message)
    
    const emailKey = String(email || '').trim().toLowerCase()
    if (emailKey) {
      try {
        // Lazy import (avoid circular dependencies)
        const { incrementAttemptByEmail, disableUserByEmail } = await import('./firestoreUsers.js')
        
        console.log('[Auth] Incrementing attempt for:', emailKey)
        const result = await incrementAttemptByEmail(emailKey)
        const attempt = Number(result?.attempt)
        console.log('[Auth] New attempt count:', attempt)
        
        // Disable user if max attempts exceeded
        if (Number.isFinite(attempt) && attempt >= MAX_ATTEMPTS) {
          console.warn('[Auth] Max attempts reached, disabling user:', emailKey)
          try {
            await disableUserByEmail(emailKey)
          } catch (disableErr) {
            console.error('[Auth] Failed to disable user after max attempts', disableErr)
          }
          return { error, disabled: true, attempt }
        }
        
        // Add attempt info to error for UI feedback
        return { 
          error: {
            ...error,
            attempt,
            attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempt)
          },
          disabled: false
        }
      } catch (trackErr) {
        console.error('[Auth] Error tracking login attempt:', trackErr?.message, trackErr)
        // Still return the original error even if tracking failed
        return { error }
      }
    }
    
    return { error }
  }
}

/**
 * Sign out current Firebase user.
 * @returns {Promise<{success?: true, error?: any}>}
 */
export async function logout() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { error }
  }
}

// Default export for convenience
export default { /*register,*/ login, logout }
