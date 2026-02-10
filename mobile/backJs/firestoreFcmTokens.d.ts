declare module '@backjs/firestoreFcmTokens' {
  export function upsertUserFcmToken(params: {
    userDocId: string
    token: string
    platform?: string | null
  }): Promise<void>
}

declare module '@backjs/firestoreFcmTokens.js' {
  export function upsertUserFcmToken(params: {
    userDocId: string
    token: string
    platform?: string | null
  }): Promise<void>
}
