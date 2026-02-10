import { PushNotifications } from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import { upsertUserFcmToken } from './firestoreFcmTokens.js'

let listenersReady = false
let activeUserDocId = null

function safeId() {
  const base = Date.now() % 2147483647
  return base <= 0 ? Math.abs(base) + 1 : base
}

async function ensureLocalNotificationsPermission() {
  try {
    const perm = await LocalNotifications.checkPermissions()
    if (perm?.display !== 'granted') {
      await LocalNotifications.requestPermissions()
    }
  } catch {
    // ignore
  }
}

function setupListeners() {
  if (listenersReady) return
  listenersReady = true

  PushNotifications.addListener('registration', async (token) => {
    const t = token?.value
    if (!t || !activeUserDocId) return
    try {
      await upsertUserFcmToken({
        userDocId: activeUserDocId,
        token: t,
        platform: 'android',
      })
    } catch {
      // ignore
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.debug('[Push] registrationError', err)
  })

  // Foreground: show a system notification using LocalNotifications
  PushNotifications.addListener('pushNotificationReceived', async (notification) => {
    try {
      const title = notification?.title || 'Notification'
      const body = notification?.body || ''
      await ensureLocalNotificationsPermission()
      await LocalNotifications.schedule({
        notifications: [
          {
            id: safeId(),
            title,
            body,
            extra: notification?.data || {},
          },
        ],
      })
    } catch (err) {
      console.debug('[Push] foreground notify failed', err)
    }
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (evt) => {
    console.debug('[Push] actionPerformed', evt)
  })
}

export async function registerPushNotificationsForUser({ userDocId }) {
  if (!userDocId) return
  activeUserDocId = String(userDocId)

  const perm = await PushNotifications.checkPermissions()
  if (perm?.receive !== 'granted') {
    const req = await PushNotifications.requestPermissions()
    if (req?.receive !== 'granted') return
  }

  await ensureLocalNotificationsPermission()
  setupListeners()
  await PushNotifications.register()
}
