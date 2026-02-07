declare module '@/stores/authStore' {
  import type { ComputedRef } from 'vue'

  const authStore: {
    state: {
      uid: string | null
      email: string | null
      isAnonymous: boolean
      [key: string]: any
    }
    setUser: (firebaseUser: any) => void
    clearUser: () => void
    isAuthenticated: ComputedRef<boolean>
  }

  export default authStore
}
