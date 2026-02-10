import { reactive, computed } from 'vue'

const STORAGE_KEY = 'vlc_auth'

const state = reactive({
	// raw firebase user object (in-memory only)
	auth: null,
	// app-level session
	sessionStartedAt: null,
	sessionExpiresAt: null,
	// persisted fields
	accessToken: null,
	uid: null,
	displayName: null,
	email: null,
	emailVerified: false,
	isAnonymous: false,
	metadata: null,
	phoneNumber: null,
	photoURL: null,
	providerData: [],
	providerId: null,
	reloadUserInfo: null,
	stsTokenManager: null,
	refreshToken: null,
})

function saveToStorage() {
	try {
		const toSave = {
			sessionStartedAt: state.sessionStartedAt,
			sessionExpiresAt: state.sessionExpiresAt,
			accessToken: state.accessToken,
			uid: state.uid,
			displayName: state.displayName,
			email: state.email,
			emailVerified: state.emailVerified,
			isAnonymous: state.isAnonymous,
			metadata: state.metadata,
			phoneNumber: state.phoneNumber,
			photoURL: state.photoURL,
			providerData: state.providerData,
			providerId: state.providerId,
			reloadUserInfo: state.reloadUserInfo,
			stsTokenManager: state.stsTokenManager,
			refreshToken: state.refreshToken,
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
	} catch (e) {
		console.warn('Failed to save auth state', e)
	}
}

function loadFromStorage() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return
		const obj = JSON.parse(raw)
		state.sessionStartedAt = obj.sessionStartedAt || null
		state.sessionExpiresAt = obj.sessionExpiresAt || null
		state.accessToken = obj.accessToken || null
		state.uid = obj.uid || null
		state.displayName = obj.displayName || null
		state.email = obj.email || null
		state.emailVerified = !!obj.emailVerified
		state.isAnonymous = !!obj.isAnonymous
		state.metadata = obj.metadata || null
		state.phoneNumber = obj.phoneNumber || null
		state.photoURL = obj.photoURL || null
		state.providerData = obj.providerData || []
		state.providerId = obj.providerId || null
		state.reloadUserInfo = obj.reloadUserInfo || null
		state.stsTokenManager = obj.stsTokenManager || null
		state.refreshToken = obj.refreshToken || null
	} catch (e) {
		console.warn('Failed to load auth state', e)
	}
}

/**
 * Set the store from a Firebase user object
 * Accepts the raw user returned by Firebase SDK.
 */
function setUser(firebaseUser) {
	if (!firebaseUser) return clearUser()
	state.auth = firebaseUser

	// extract common fields (be defensive)
	try {
		state.accessToken = firebaseUser.stsTokenManager?.accessToken || null
		state.stsTokenManager = firebaseUser.stsTokenManager || null
		state.refreshToken = firebaseUser.stsTokenManager?.refreshToken || firebaseUser.refreshToken || null
		state.uid = firebaseUser.uid || null
		state.displayName = firebaseUser.displayName || null
		state.email = firebaseUser.email || null
		state.emailVerified = !!firebaseUser.emailVerified
		state.isAnonymous = !!firebaseUser.isAnonymous
		state.metadata = firebaseUser.metadata || null
		state.phoneNumber = firebaseUser.phoneNumber || null
		state.photoURL = firebaseUser.photoURL || null
		state.providerData = firebaseUser.providerData || []
		state.providerId = firebaseUser.providerId || null
		state.reloadUserInfo = firebaseUser.reloadUserInfo || null
	} catch (e) {
		console.warn('Failed to extract firebase user fields', e)
	}

	saveToStorage()
}

function clearUser() {
	state.auth = null
	state.sessionStartedAt = null
	state.sessionExpiresAt = null
	state.accessToken = null
	state.uid = null
	state.displayName = null
	state.email = null
	state.emailVerified = false
	state.isAnonymous = false
	state.metadata = null
	state.phoneNumber = null
	state.photoURL = null
	state.providerData = []
	state.providerId = null
	state.reloadUserInfo = null
	state.stsTokenManager = null
	state.refreshToken = null
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch (e) {
		console.warn('Failed to remove auth storage', e)
	}
}

function setSession(expirationMinutes) {
	const mins = Number(expirationMinutes)
	if (!Number.isFinite(mins) || mins <= 0) {
		state.sessionStartedAt = Date.now()
		state.sessionExpiresAt = null
		saveToStorage()
		return
	}
	state.sessionStartedAt = Date.now()
	state.sessionExpiresAt = Date.now() + mins * 60 * 1000
	saveToStorage()
}

function isSessionExpired() {
	if (!state.uid) return false
	// If session info is missing, treat as expired to force re-login after update.
	if (!state.sessionExpiresAt) return true
	const exp = Number(state.sessionExpiresAt)
	if (!Number.isFinite(exp)) return true
	return Date.now() >= exp
}

const isAuthenticated = computed(() => !!state.uid && !isSessionExpired())

// initialize from storage
loadFromStorage()

export default {
	state,
	setUser,
	setSession,
	isSessionExpired,
	clearUser,
	isAuthenticated,
}
