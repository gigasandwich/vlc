declare module '@/backJs/router.js' {
  export function fetchFirestorePoints(): Promise<any[]>

  export function getFirebaseConfig(): {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }

  export function assertFirebaseConfig(config: {
    apiKey: string
    authDomain: string
    projectId: string
  }): void
}
