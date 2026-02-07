/**
 * Path router for code living outside `src/`.
 *
 * Purpose: allow imports like `@/backJs/router.js` (Vite alias `@` -> `src`).
 */

export { fetchFirestorePoints, createFirestorePoint } from '../../backJs/firestorePoints.js'
export { getFirebaseConfig, assertFirebaseConfig } from '../../backJs/firebaseConfig.js'
