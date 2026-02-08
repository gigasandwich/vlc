<template>
  <div class="vlc-map-root">
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

      <div class="vlc-legend-wrap">
        <div v-if="isLegendOpen" class="vlc-legend" @click.stop>
          <div class="vlc-legend-header">
            <div class="vlc-legend-title">Choix problème</div>
            <button type="button" class="vlc-legend-close" @click.stop="isLegendOpen = false">✕</button>
          </div>

          <ul class="vlc-legend-list">
            <li class="vlc-legend-item">
              <span class="vlc-legend-dot">
                <svg width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#3b82f6" /></svg>
              </span>
              <span>Peu grave</span>
            </li>
            <li class="vlc-legend-item">
              <span class="vlc-legend-dot">
                <svg width="16" height="16" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" fill="#f97316" /></svg>
              </span>
              <span>Grave</span>
            </li>
            <li class="vlc-legend-item">
              <span class="vlc-legend-dot">
                <svg width="16" height="16" viewBox="0 0 24 24"><polygon points="12,3 21,20 3,20" fill="#ef4444" /></svg>
              </span>
              <span>Très grave</span>
            </li>
          </ul>

          <!-- Placement buttons (do NOT filter the map) -->
          <div class="vlc-shape-select">
            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--circle',
                placementShape === 'circle' && 'vlc-shape-btn--active',
              ]"
              @click="placementShape = placementShape === 'circle' ? 'none' : 'circle'"
              title="Peu grave"
            >
              <span aria-hidden="true">●</span>
            </button>

            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--square',
                placementShape === 'square' && 'vlc-shape-btn--active',
              ]"
              @click="placementShape = placementShape === 'square' ? 'none' : 'square'"
              title="Grave"
            >
              <span aria-hidden="true">■</span>
            </button>

            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--triangle',
                placementShape === 'triangle' && 'vlc-shape-btn--active',
              ]"
              @click="placementShape = placementShape === 'triangle' ? 'none' : 'triangle'"
              title="Très grave"
            >
              <span aria-hidden="true">▲</span>
            </button>
          </div>

          <div class="vlc-placement-hint" @click.stop>
            <div class="vlc-placement-hint__title">Placer sur la carte</div>
            <div v-if="placementShape === 'none'" class="vlc-placement-hint__text">
              Sélectionne un type (● ■ ▲), puis touche la carte pour le placer.
            </div>
            <div v-else class="vlc-placement-hint__text">
              Mode placement actif: <b>{{ placementShapeLabel }}</b>. Touche la carte pour ajouter un point.
            </div>
          </div>
        </div>

        <div v-if="isFilterOpen" class="vlc-filter" @click.stop>
          <div class="vlc-legend-header">
            <div class="vlc-legend-title">Filtre</div>
            <button type="button" class="vlc-legend-close" @click.stop="isFilterOpen = false">✕</button>
          </div>

          <div class="vlc-filter-section">
            <div class="vlc-filter-label">Type de problème</div>
            <div class="vlc-filter-types">
              <button
                type="button"
                :class="['vlc-filter-type-btn', filterShape === 'all' && 'vlc-filter-type-btn--active']"
                @click="filterShape = 'all'"
              >
                Tous
              </button>
              <button
                type="button"
                :class="['vlc-filter-type-btn', filterShape === 'circle' && 'vlc-filter-type-btn--active']"
                @click="filterShape = 'circle'"
                title="Peu grave"
              >
                ●
              </button>
              <button
                type="button"
                :class="['vlc-filter-type-btn', filterShape === 'square' && 'vlc-filter-type-btn--active']"
                @click="filterShape = 'square'"
                title="Grave"
              >
                ■
              </button>
              <button
                type="button"
                :class="['vlc-filter-type-btn', filterShape === 'triangle' && 'vlc-filter-type-btn--active']"
                @click="filterShape = 'triangle'"
                title="Très grave"
              >
                ▲
              </button>
            </div>
          </div>

          <div class="vlc-filter-section">
            <label class="vlc-filter-mine">
              <input type="checkbox" v-model="filterMine" />
              <span>Mes points</span>
            </label>
            <div v-if="filterMine && currentUserId == null" class="vlc-filter-hint">
              Aucun user_id local détecté (localStorage). Filtrage utilisera le compte Firebase si disponible.
            </div>
          </div>
        </div>

        <button
          v-if="!isLegendOpen"
          type="button"
          class="vlc-legend-open-btn"
          title="Ouvrir la légende"
          @pointerdown.prevent.stop="isLegendOpen = true"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="color:#334155">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        <button
          v-if="!isFilterOpen"
          type="button"
          class="vlc-filter-open-btn"
          title="Ouvrir les filtres"
          @pointerdown.prevent.stop="isFilterOpen = true"
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
import authStore from '@/stores/authStore'
// test if it works
console.log(authStore?.state?.email ?? null)
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
const placementStatus = ref<string | null>(null)
const placementError = ref<string | null>(null)

const placementShapeLabel = computed(() => {
  if (placementShape.value === 'circle') return 'Peu grave'
  if (placementShape.value === 'square') return 'Grave'
  if (placementShape.value === 'triangle') return 'Très grave'
  return ''
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

function getFirebaseUid(): string | null {
  try {
    const fb = window.firebase
    const user = fb?.auth ? fb.auth().currentUser : null
    return user?.uid || null
  } catch {
    return null
  }
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

    placementStatus.value = 'Enregistrement du point…'
    placementError.value = null

    const typeId = shapeToTypeId(placementShape.value)
    if (!typeId) {
      placementStatus.value = null
      return
    }

    try {
      const created = await createFirestorePoint({
        coordinates: { latitude: e.latlng.lat, longitude: e.latlng.lng },
        point_type_id: typeId,
      })

      extraPoints.value.push(created as FirestorePoint)
      placementStatus.value = 'Point ajouté.'
      renderPoints()
      setTimeout(() => {
        placementStatus.value = null
      }, 1800)
    } catch (err: any) {
      placementStatus.value = null
      placementError.value = err?.message || 'Erreur lors de l\'enregistrement du point'
      setTimeout(() => {
        placementError.value = null
      }, 4000)
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

function renderPoints() {
  if (!map || !L || !pointsLayer) return

  pointsLayer.clearLayers()
  const pts = [...(props.points || []), ...(extraPoints.value || [])]

  const uid = getFirebaseUid()
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
    const marker = L.circleMarker([ll.lat, ll.lng], {
      radius: 8,
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.85,
    })

    marker.bindPopup(`Point ${p.id}`)
    marker.addTo(pointsLayer)
  }
}

watch(
  () => props.points,
  () => {
    // Drop locally-added points once they appear in the server list.
    const ids = new Set((props.points || []).map((p) => p.id))
    extraPoints.value = (extraPoints.value || []).filter((p) => !ids.has(p.id))
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
