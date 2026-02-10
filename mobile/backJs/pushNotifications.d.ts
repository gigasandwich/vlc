declare module '@backjs/pushNotifications' {
  export function registerPushNotificationsForUser(params: {
    userDocId: string
  }): Promise<void>
}

declare module '@backjs/pushNotifications.js' {
  export function registerPushNotificationsForUser(params: {
    userDocId: string
  }): Promise<void>
}
