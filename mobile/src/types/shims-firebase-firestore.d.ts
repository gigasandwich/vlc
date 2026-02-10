declare module 'firebase/firestore' {
  import type { FirebaseApp } from 'firebase/app'

  export type Firestore = any

  export function getFirestore(app?: FirebaseApp): Firestore

  export function collection(db: any, ...pathSegments: Array<string>): any

  export function query(source: any, ...queryConstraints: any[]): any

  export function orderBy(
    fieldPath: string,
    directionStr?: 'asc' | 'desc'
  ): any

  export function onSnapshot(
    query: any,
    onNext: (snapshot: any) => void,
    onError?: (error: any) => void
  ): () => void
}
