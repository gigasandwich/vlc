import type { ComputedRef } from 'vue'

declare const authStore: {
  state: {
    auth: any
    accessToken: string | null
    uid: string | null
    displayName: string | null
    email: string | null
    emailVerified: boolean
    isAnonymous: boolean
    metadata: any
    phoneNumber: string | null
    photoURL: string | null
    providerData: any[]
    providerId: string | null
    reloadUserInfo: any
    stsTokenManager: any
    refreshToken: string | null
    [key: string]: any
  }
  setUser: (firebaseUser: any) => void
  clearUser: () => void
  isAuthenticated: ComputedRef<boolean>
}

export default authStore
