const admin = require('firebase-admin')
const { onCall, HttpsError } = require('firebase-functions/v2/https')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

async function getLatestConfigInt(key, defaultValue) {
  try {
    const snap = await db
      .collection('config')
      .where('key', '==', String(key))
      .orderBy('date_', 'desc')
      .limit(1)
      .get()

    const doc = snap.docs[0]
    const raw = doc ? (doc.data()?.value_ ?? doc.data()?.value ?? null) : null
    const n = Number.parseInt(String(raw ?? ''), 10)
    return Number.isFinite(n) ? n : defaultValue
  } catch {
    // Fallback: select the newest date_ among a handful
    try {
      const snap = await db.collection('config').where('key', '==', String(key)).limit(50).get()
      let best = null
      let bestMs = -1
      for (const d of snap.docs) {
        const data = d.data() || {}
        const ms = data?.date_ && typeof data.date_.toMillis === 'function' ? data.date_.toMillis() : -1
        if (ms > bestMs) {
          bestMs = ms
          best = data
        }
      }
      const raw = best?.value_ ?? best?.value ?? null
      const n = Number.parseInt(String(raw ?? ''), 10)
      return Number.isFinite(n) ? n : defaultValue
    } catch {
      return defaultValue
    }
  }
}

async function findUserDocByEmail(email) {
  const e = String(email || '').trim().toLowerCase()
  if (!e) return null
  const snap = await db.collection('users').where('email', '==', e).limit(1).get()
  const doc = snap.docs[0]
  if (!doc) return null
  return { ref: doc.ref, data: doc.data() || {} }
}

exports.trackFailedLoginAttempt = onCall(async (request) => {
  const email = request.data?.email
  const e = String(email || '').trim().toLowerCase()
  if (!e) throw new HttpsError('invalid-argument', 'email required')

  const attemptLimit = await getLatestConfigInt('LOGIN_ATTEMPT_LIMIT', 3)

  const userDoc = await findUserDocByEmail(e)
  if (!userDoc) {
    // Do not leak whether a user exists
    return { attempt: null, disabled: false }
  }

  const prevAttempt = Number(userDoc.data.attempt)
  const nextAttempt = (Number.isFinite(prevAttempt) ? prevAttempt : 0) + 1

  await userDoc.ref.set({ attempt: nextAttempt }, { merge: true })

  let disabled = false
  if (nextAttempt >= Math.max(1, attemptLimit)) {
    disabled = true

    await userDoc.ref.set({ disabled: true }, { merge: true })

    // Disable the Firebase Auth user (Admin SDK)
    try {
      const fbId = userDoc.data.fbId
      if (fbId) {
        await admin.auth().updateUser(String(fbId), { disabled: true })
      } else {
        const u = await admin.auth().getUserByEmail(e)
        await admin.auth().updateUser(u.uid, { disabled: true })
      }
    } catch {
      // keep Firestore disabled=true
    }
  }

  return { attempt: nextAttempt, disabled }
})

exports.resetLoginAttempt = onCall(async (request) => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'auth required')

  const uid = String(request.data?.uid || request.auth.uid)
  if (uid !== request.auth.uid) throw new HttpsError('permission-denied', 'cannot reset other user')

  const snap = await db.collection('users').where('fbId', '==', uid).limit(1).get()
  const doc = snap.docs[0]
  if (doc) {
    await doc.ref.set({ attempt: 0 }, { merge: true })
  }

  return { ok: true }
})
