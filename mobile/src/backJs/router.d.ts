declare module '@/backJs/router.js' {
  export function fetchFirestorePoints(): Promise<any[]>

  export function createFirestorePoint(params: {
    coordinates: { latitude: number; longitude: number }
    point_type_id: number
    level_?: number
  }): Promise<any>

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
