/**
 * Firestore config helpers.
 *
 * Expected collection: `config`
 * Document shape example:
 *  - key: "TOKEN_EXPIRATION"
 *  - type: "integer"
 *  - value_: "180"
 *  - date_: Timestamp
 */

import { assertFirebaseConfig, getFirebaseConfig } from './firebaseConfig.js'
import { initializeApp, getApps } from 'firebase/app'
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from 'firebase/firestore'

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

const cache = new Map()
const CACHE_TTL_MS = 30_000

function nowMs() {
  return Date.now()
}

function normalizeKey(key) {
  return String(key || '').trim()
}

function parseIntegerLike(value) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value)
  const s = String(value).trim()
  if (!s) return null
  const n = Number.parseInt(s, 10)
  return Number.isFinite(n) ? n : null
}

function timestampToMs(ts) {
  if (!ts) return null
  try {
    if (typeof ts.toMillis === 'function') return ts.toMillis()
    if (typeof ts.toDate === 'function') return ts.toDate().getTime()
    if (typeof ts.seconds === 'number') return ts.seconds * 1000
  } catch {
    // ignore
  }
  return null
}

function getDocDateMs(doc) {
  // Prefer `date_` as requested; tolerate common alternatives.
  return (
    timestampToMs(doc?.date_) ??
    timestampToMs(doc?.date) ??
    timestampToMs(doc?.updatedAt) ??
    timestampToMs(doc?.createdAt) ??
    null
  )
}

async function fetchConfigDocByKey(key) {
  const k = normalizeKey(key)
  if (!k) return null

  const cached = cache.get(k)
  if (cached && nowMs() - cached.at < CACHE_TTL_MS) {
    return cached.doc
  }

  let normalized = null

  // Primary strategy: order by date_ desc (most recent config wins)
  try {
    const q1 = query(collection(db, 'config'), where('key', '==', k), orderBy('date_', 'desc'), limit(1))
    const snap1 = await getDocs(q1)
    const doc1 = snap1.docs[0]
    const data1 = doc1 ? (doc1.data() || {}) : null
    normalized = data1 ? { _docId: doc1.id, ...data1 } : null
  } catch {
    // Fallback: no ordering/index available; read all for this key and pick latest by date_.
    try {
      const q2 = query(collection(db, 'config'), where('key', '==', k), limit(50))
      const snap2 = await getDocs(q2)
      const candidates = snap2.docs
        .map((d) => ({ id: d.id, data: d.data() || {} }))
        .map((x) => ({ _docId: x.id, ...x.data }))

      let best = null
      let bestMs = -1
      for (const c of candidates) {
        const ms = getDocDateMs(c)
        if (ms != null && ms > bestMs) {
          best = c
          bestMs = ms
        }
      }

      // If no date_ present anywhere, fall back to the first doc returned.
      normalized = best || (candidates[0] || null)
    } catch {
      normalized = null
    }
  }

  cache.set(k, { at: nowMs(), doc: normalized })
  return normalized
}

/**
 * Get an integer config value from Firestore config collection.
 * Reads `value_` by default, but also tolerates `value`.
 */
export async function getConfigInt(key, defaultValue = null) {
  try {
    const doc = await fetchConfigDocByKey(key)
    const raw = doc?.value_ ?? doc?.value ?? null
    const parsed = parseIntegerLike(raw)
    return parsed == null ? defaultValue : parsed
  } catch (err) {
    // Let callers decide fallback behavior; keep it quiet here.
    return defaultValue
  }
}

/**
 * Convenience: fetch auth-related configuration.
 * All values are in minutes unless specified otherwise.
 */
export async function getAuthConfig() {
  const tokenExpirationMinutes = await getConfigInt('TOKEN_EXPIRATION', 180)
  const loginAttemptLimit = await getConfigInt('LOGIN_ATTEMPT_LIMIT', 3)

  return {
    tokenExpirationMinutes,
    loginAttemptLimit,
  }
}
