import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { addPhotoToPoint as backAddPhotoToPoint } from '../../backJs/firestorePoints.js'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getFirebaseConfig, assertFirebaseConfig } from '../../backJs/firebaseConfig.js'

/**
 * Compress a File to a JPEG data URL.
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 */
export async function compressFileToDataUrl(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        try {
          let { width, height } = img
          if (width > maxWidth) {
            const ratio = maxWidth / width
            width = Math.round(maxWidth)
            height = Math.round(height * ratio)
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('Canvas not supported'))
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          const out = canvas.toDataURL('image/jpeg', quality)
          resolve(out)
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Image load error'))
      img.src = String(reader.result)
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsDataURL(file)
  })
}

/**
 * Wrapper around backend helper to add a photo to a point.
 * @param {string} pointId
 * @param {string} dataUrl
 */
export async function addPhotoToPoint(pointId: string, dataUrl: string) {
  // reuse server helper which performs auth checks and writes
  return backAddPhotoToPoint(pointId, dataUrl)
}

/**
 * Initialize a real-time listener for photos under points/{pointId}/photos.
 * Calls onUpdate with an array of photo docs ({ id, data, uploadedAt }).
 * Returns an unsubscribe function.
 */
export function initPhotosListener(pointId: string, onUpdate: (items: Array<any>) => void) {
  try {
    const config = getFirebaseConfig()
    assertFirebaseConfig(config)
    const app = !getApps().length ? initializeApp(config) : getApps()[0]
    const db = getFirestore(app)
    const photosCol = collection(db, 'points', String(pointId), 'photos')
    const q = query(photosCol, orderBy('uploadedAt', 'desc'))
    const unsub = onSnapshot(q, (snap: any) => {
      const items: any[] = []
      snap.forEach((doc: any) => {
        const d = doc.data() || {}
        items.push({ id: doc.id, data: d.data ?? null, uploadedAt: d.uploadedAt ?? null })
      })
      onUpdate(items)
    }, (err: any) => {
      console.debug('initPhotosListener snapshot error', err)
    })
    return unsub
  } catch (err) {
    console.debug('initPhotosListener error', err)
    return () => {}
  }
}

export default {
  compressFileToDataUrl,
  addPhotoToPoint,
  initPhotosListener,
}
