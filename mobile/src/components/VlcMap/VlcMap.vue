<template>
  <div class="vlc-map-root">
    <PointDetail
      v-if="selectedPoint"
      :point="(selectedPoint as any)"
      @close="selectedPoint = null"
    />
    
    <main class="vlc-map-main">
      <div ref="mapEl" class="vlc-leaflet" />

      <div v-if="isLoading || errorMessage || placementStatus || placementError" class="vlc-map-status">
        <div v-if="isLoading" class="vlc-map-status__line">Chargement des points…</div>
        <div v-else-if="errorMessage" class="vlc-map-status__line vlc-map-status__line--error">
          {{ errorMessage }}
        </div>
        <div v-if="placementStatus" class="vlc-map-status__line">{{ placementStatus }}</div>
        <div v-if="placementError" class="vlc-map-status__line vlc-map-status__line--error">
          {{ placementError }}
        </div>
      </div>

      <div v-if="pendingPlacement" class="vlc-confirm" @click.stop>
        <div class="vlc-confirm__title">Confirmer le placement ?</div>
        <div class="vlc-confirm__text">
          Type: <b>{{ pendingPlacementLabel }}</b>
          <span v-if="pendingPlacementCoords" class="vlc-confirm__coords">
            ({{ pendingPlacementCoords.lat.toFixed(5) }}, {{ pendingPlacementCoords.lng.toFixed(5) }})
          </span>
        </div>

        <div class="vlc-confirm__body">
          <div class="vlc-confirm__photos">
            <label class="vlc-photo-input">
              <input id="photo-input" type="file" accept="image/*" capture="camera" multiple @change="onPhotoFilesSelected" />
              <span class="vlc-photo-input__btn">Ajouter une photo</span>
            </label>

            <div class="vlc-photo-list">
              <div v-for="(p, idx) in selectedPhotos" :key="p.id" class="vlc-photo-item">
                <img :src="p.dataUrl" alt="photo" class="vlc-photo-thumb" />
                <button type="button" class="vlc-photo-remove" @click="removePhoto(idx)">✕</button>
              </div>
            </div>
          </div>

        </div>

        <div class="vlc-confirm__actions">
          <button type="button" class="vlc-confirm__btn" :disabled="isPlacing" @click="cancelPendingPlacement">
            Annuler
          </button>
          <button type="button" class="vlc-confirm__btn vlc-confirm__btn--primary" :disabled="isPlacing" @click="confirmPendingPlacement">
            {{ isPlacing ? 'Enregistrement…' : 'Valider' }}
          </button>
        </div>
      </div>

      <div class="vlc-legend-wrap">
        <ProblemChooser
          v-if="isLegendOpen"
          :placement-shape="placementShape"
          @select-shape="onSelectShape"
          @close="isLegendOpen = false"
          @click="(e:any) => e.stopPropagation()"
        />

        <FilterChooser
          v-if="isFilterOpen"
          :filter-shape="filterShape"
          :filter-mine="filterMine"
          @set-filter-shape="onSetFilterShape"
          @set-filter-mine="onSetFilterMine"
          @close="isFilterOpen = false"
        />

        <button
          v-if="!isLegendOpen"
          type="button"
          class="vlc-add-open-btn vlc-glow"
          title="Ajouter un point"
          @click.prevent.stop="isLegendOpen = true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="color:#fff">
            <rect x="10" y="4" width="4" height="16" rx="2" />
            <rect x="4" y="10" width="16" height="4" rx="2" />
          </svg>
        </button>

        <button
          v-if="!isFilterOpen"
          type="button"
          class="vlc-filter-open-btn"
          title="Ouvrir les filtres"
          @click.prevent.stop="isFilterOpen = true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:#334155">
            <path d="M3 4h18l-7 8v6l-4 2v-8L3 4z" />
          </svg>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createFirestorePoint } from '@/backJs/router.js'
import { compressFileToDataUrl, addPhotoToPoint } from '@/composables/usePhoto'
import authStore from '@/stores/authStore'
import { assertUserRole, fetchUserProfileByFirebaseUid } from '@backjs/firestoreUsers'
import PointDetail from './PointDetail.vue'
import ProblemChooser from './ProblemChooser.vue'
import FilterChooser from './FilterChooser.vue'
type PointType = 'circle' | 'square' | 'triangle' | 'all'
type PlacementType = 'circle' | 'square' | 'triangle' | 'none'

type FirestorePoint = {
  id: string
  coordinates?: { latitude: number; longitude: number } | any
  point_type_id?: number
  point_type?: { id: number; label?: string }
  pointTypeId?: number
  pointType?: { id: number; label?: string }
  user_id?: number
  user?: { id?: number; fbId?: string; [key: string]: any }
  [key: string]: any
}

const props = defineProps<{
  points?: FirestorePoint[]
  isLoading?: boolean
  errorMessage?: string | null
}>()

const isLoading = computed(() => !!props.isLoading)
const errorMessage = computed(() => props.errorMessage || null)

const placementShape = ref<PlacementType>('none')
const filterShape = ref<PointType>('all')
const filterMine = ref(false)

const isLegendOpen = ref(true)
const isFilterOpen = ref(false)

const extraPoints = ref<FirestorePoint[]>([])
const selectedPoint = ref<FirestorePoint | null>(null)
const placementStatus = ref<string | null>(null)
const placementError = ref<string | null>(null)

const isPlacing = ref(false)

const pendingPlacement = ref<{
  lat: number
  lng: number
  typeId: number
  shape: PlacementType
} | null>(null)

// photos selected for the pending placement (client-side only)
const selectedPhotos = ref<Array<{ id: string; dataUrl: string }>>([])

async function onPhotoFilesSelected(ev: Event) {
  const input = ev.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  // Read files, compress and store data URLs
  for (const f of Array.from(files)) {
    try {
      const compressed = await compressFileToDataUrl(f) 
      selectedPhotos.value.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, dataUrl: compressed })
    } catch (err) {
      // fallback: read original as dataUrl
    }
  }

  // reset input so the same file can be re-selected if needed
  input.value = ''
}

function removePhoto(idx: number) {
  selectedPhotos.value.splice(idx, 1)
}

const placementShapeLabel = computed(() => {
  if (placementShape.value === 'circle') return 'Peu grave'
  if (placementShape.value === 'square') return 'Grave'
  if (placementShape.value === 'triangle') return 'Très grave'
  return ''
})

const pendingPlacementLabel = computed(() => {
  const shape = pendingPlacement.value?.shape
  if (shape === 'circle') return 'Peu grave'
  if (shape === 'square') return 'Grave'
  if (shape === 'triangle') return 'Très grave'
  return ''
})

const pendingPlacementCoords = computed(() => {
  if (!pendingPlacement.value) return null
  return { lat: pendingPlacement.value.lat, lng: pendingPlacement.value.lng }
})

const currentUserId = computed<number | null>(() => {
  try {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    const id = Number(u?.id)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
})

const firebaseUid = computed(() => authStore.state.uid)

const lastPlaceValidation = ref<{ uid: string | null; ok: boolean; at: number }>({
  uid: null,
  ok: false,
  at: 0,
})

async function validateBeforePlacement(): Promise<boolean> {
  // Must be authenticated & not anonymous
  const uid = firebaseUid.value
  if (!uid || authStore.state.isAnonymous) {
    placementError.value = 'Veuillez vous connecter.'
    return false
  }

  // Cache validation briefly to avoid querying on every map click
  const now = Date.now()
  if (lastPlaceValidation.value.uid === uid && lastPlaceValidation.value.ok && now - lastPlaceValidation.value.at < 60_000) {
    return true
  }

  try {
    const profile = await fetchUserProfileByFirebaseUid(uid)
    assertUserRole(profile)

    // Keep local storage in sync for filtering/profile
    try {
      const existing = JSON.parse(localStorage.getItem('user') || 'null')
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...(existing && typeof existing === 'object' ? existing : {}),
          id: profile?.id ?? (existing?.id ?? null),
          email: profile?.email ?? (existing?.email ?? authStore.state.email ?? null),
          name: profile?.username ?? profile?.name ?? (existing?.name ?? null),
          role: 'USER',
          fbId: profile?.fbId ?? uid,
        })
      )
    } catch {
      // ignore
    }

    lastPlaceValidation.value = { uid, ok: true, at: now }
    return true
  } catch (err) {
    console.error('[Auth] Placement role validation failed', err)
    lastPlaceValidation.value = { uid, ok: false, at: now }
    placementError.value = 'Accès refusé.'
    return false
  }
}

function cancelPendingPlacement() {
  pendingPlacement.value = null
  selectedPhotos.value = []
}

async function confirmPendingPlacement() {
  if (!pendingPlacement.value) return

  placementStatus.value = 'Enregistrement du point…'
  placementError.value = null
  isPlacing.value = true

  const { lat, lng, typeId } = pendingPlacement.value

  try {
    const created = await createFirestorePoint({
      coordinates: { latitude: lat, longitude: lng },
      point_type_id: typeId,
    })

    // Upload compressed photos (if any) using addPhotoToPoint so stored photos match compression output
    const pointId = (created as any)?.fbId ?? (created as any)?.id ?? null
    if (pointId && Array.isArray(selectedPhotos.value) && selectedPhotos.value.length > 0) {
  const uploads = selectedPhotos.value.map((p: { id: string; dataUrl: string }) => addPhotoToPoint(String(pointId), p.dataUrl))
  const settled = await Promise.allSettled(uploads)
  const failed = settled.filter((r: PromiseSettledResult<unknown>) => r.status !== 'fulfilled')
      if (failed.length > 0) {
        console.warn('Some photo uploads failed', failed)
        placementStatus.value = 'Point ajouté (certaines photos ont échoué)'
      } else {
        placementStatus.value = 'Point et photos ajoutés.'
      }
    } else {
      placementStatus.value = 'Point ajouté.'
    }

    extraPoints.value.push(created as FirestorePoint)
    pendingPlacement.value = null
    // clear selected photos after successful upload attempt
    selectedPhotos.value = []
    renderPoints()
    setTimeout(() => {
      placementStatus.value = null
    }, 1800)
  } catch (err: any) {
    placementStatus.value = null
    placementError.value = err?.message || "Erreur lors de l'enregistrement du point"
    setTimeout(() => {
      placementError.value = null
    }, 4000)
  } finally {
    isPlacing.value = false
  }
}

function onSelectShape(shape: PlacementType | 'none') {
  placementShape.value = shape as PlacementType
}

function onSetFilterShape(shape: PointType | 'all') {
  // normalize 'all' to filterShape 'all'
  if (shape === 'all') {
    filterShape.value = 'all'
    // ensure 'Tous' shows all points regardless of previous "Mes points" toggle
    filterMine.value = false
  } else filterShape.value = shape as PointType
}


function onSetFilterMine(v: boolean) {
  filterMine.value = !!v
}

const mapEl = ref<HTMLDivElement | null>(null)

declare global {
  interface Window {
    // injected by https://unpkg.com/leaflet
    L?: any
  }
}

let L: any = null
let map: any = null
let pointsLayer: any = null

function ensureLeafletAssets() {
  // CSS
  const cssId = 'leaflet-css'
  if (!document.getElementById(cssId)) {
    const link = document.createElement('link')
    link.id = cssId
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)
  }

  // JS
  const jsId = 'leaflet-js'
  if (!document.getElementById(jsId)) {
    const script = document.createElement('script')
    script.id = jsId
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    document.body.appendChild(script)
  }

  return new Promise<void>((resolve, reject) => {
    const check = () => {
      if (window.L) {
        L = window.L
        resolve()
        return
      }
      setTimeout(check, 25)
    }

    const script = document.getElementById(jsId) as HTMLScriptElement | null
    if (!script) {
      reject(new Error('Leaflet script not found'))
      return
    }

    script.addEventListener('error', () => reject(new Error('Failed to load Leaflet')))
    check()
  })
}

onMounted(async () => {
  if (!mapEl.value) return

  await ensureLeafletAssets()
  if (!L) return

  map = L.map(mapEl.value, {
    zoomControl: true,
  }).setView([-18.9101, 47.5251], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  pointsLayer = L.layerGroup().addTo(map)
  renderPoints()

  map.on('click', async (e: any) => {
    if (!e?.latlng) return
    if (placementShape.value === 'none') return
    if (pendingPlacement.value) return

    // Validate before attempting to write
    placementError.value = null
    const ok = await validateBeforePlacement()
    if (!ok) {
      placementStatus.value = null
      setTimeout(() => {
        placementError.value = null
      }, 4000)
      return
    }

    placementStatus.value = 'Enregistrement du point…'

    const typeId = shapeToTypeId(placementShape.value)
    if (!typeId) {
      placementStatus.value = null
      return
    }

    // Open confirmation window instead of writing immediately
    placementStatus.value = null
    pendingPlacement.value = {
      lat: Number(e.latlng.lat),
      lng: Number(e.latlng.lng),
      typeId,
      shape: placementShape.value,
    }
  })
})

function shapeToTypeId(shape: PlacementType): number | null {
  if (shape === 'circle') return 1
  if (shape === 'square') return 2
  if (shape === 'triangle') return 3
  return null
}

function normalizeLatLng(point: FirestorePoint): { lat: number; lng: number } | null {
  const gp = point.coordinates
  if (!gp) return null

  const lat = Number(gp.latitude)
  const lng = Number(gp.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function markerColor(point: FirestorePoint): string {
  // heuristic colors by type id: 1=blue, 2=orange, 3=red
  const typeId = Number(
    (point as any).pointType?.id ??
      (point as any).pointTypeId ??
      point.point_type?.id ??
      point.point_type_id
  )
  if (typeId === 2) return '#f97316'
  if (typeId === 3) return '#ef4444'
  return '#3b82f6'
}

function getPointShape(point: FirestorePoint): 'circle' | 'square' | 'triangle' {
  const typeId = Number(
    (point as any).pointType?.id ??
      (point as any).pointTypeId ??
      point.point_type?.id ??
      point.point_type_id
  )
  if (typeId === 2) return 'square'
  if (typeId === 3) return 'triangle'
  return 'circle'
}

function createIcon(color: string, shape: 'circle' | 'square' | 'triangle') {
  let svgContent = ''
  if (shape === 'circle') svgContent = `<circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>`
  else if (shape === 'square') svgContent = `<rect x="4" y="4" width="16" height="16" fill="${color}" stroke="white" stroke-width="2"/>`
  else if (shape === 'triangle') svgContent = `<polygon points="12,3 21,20 3,20" fill="${color}" stroke="white" stroke-width="2"/>`

  return L.divIcon({
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    html: `<svg width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">${svgContent}</svg>`
  })
}

function renderPoints() {
  if (!map || !L || !pointsLayer) return

  pointsLayer.clearLayers()
  const pts = [...(props.points || []), ...(extraPoints.value || [])]

  const uid = firebaseUid.value
  const filteredPts = pts
    .filter((p: FirestorePoint) => {
      if (!filterMine.value) return true
      const localId = currentUserId.value
      if (localId != null) return Number((p as any).user?.id ?? p.user_id) === localId

      // fallback: if user_id isn't available in client, try matching Firebase uid
      if (uid) return (p as any).createdByUid === uid || String((p as any).user?.fbId ?? '') === uid
      return false
    })
    .filter((p: FirestorePoint) => {
      if (filterShape.value === 'all') return true
      const typeId = Number(
        (p as any).pointType?.id ??
          (p as any).pointTypeId ??
          p.point_type?.id ??
          p.point_type_id
      )
      if (filterShape.value === 'circle') return typeId === 1
      if (filterShape.value === 'square') return typeId === 2
      if (filterShape.value === 'triangle') return typeId === 3
      return true
    })
  for (const p of filteredPts) {
    const ll = normalizeLatLng(p)
    if (!ll) continue

    const color = markerColor(p)
    const shape = getPointShape(p)
    const icon = createIcon(color, shape)
    const marker = L.marker([ll.lat, ll.lng], { icon })

    marker.on('click', () => {
      selectedPoint.value = p
    })

    marker.addTo(pointsLayer)
  }
}

watch(
  () => props.points,
  () => {
    // Drop locally-added points once they appear in the server list.
    const ids = new Set((props.points || []).map((p: any) => p.id))
    extraPoints.value = (extraPoints.value || []).filter((p: any) => !ids.has(p.id))
    renderPoints()
  },
  { deep: true }
)

watch([filterShape, filterMine], () => {
  renderPoints()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
  pointsLayer = null
})
</script>

<style src="./VlcMap.css"></style>
