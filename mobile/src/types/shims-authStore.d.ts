declare module '@/stores/authStore' {
  import type { ComputedRef } from 'vue'

  const authStore: {
    state: {
      uid: string | null
      email: string | null
      isAnonymous: boolean
      sessionStartedAt?: number | null
      sessionExpiresAt?: number | null
      [key: string]: any
    }
    setUser: (firebaseUser: any) => void
    setSession: (expirationMinutes: number | string | null | undefined) => void
    isSessionExpired: () => boolean
    clearUser: () => void
    isAuthenticated: ComputedRef<boolean>
  }

  export default authStore
}
