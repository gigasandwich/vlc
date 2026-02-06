<template>
  <div class="vlc-map-root">
    <main class="vlc-map-main">
      <div ref="mapEl" class="vlc-leaflet" />

      <div v-if="isLoading || errorMessage" class="vlc-map-status">
        <div v-if="isLoading" class="vlc-map-status__line">Chargement des points…</div>
        <div v-else class="vlc-map-status__line vlc-map-status__line--error">{{ errorMessage }}</div>
      </div>

      <div class="vlc-legend-wrap">
        <div v-if="isLegendOpen" class="vlc-legend" @click.stop="isLegendOpen = false">
          <div class="vlc-legend-header">
            <div class="vlc-legend-title">Légende & Filtres</div>
            <div class="vlc-legend-close">✕</div>
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

          <!-- Filter buttons -->
          <div class="vlc-shape-select">
            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--circle',
                selectedShape === 'circle' && 'vlc-shape-btn--active',
              ]"
              @click="selectedShape = selectedShape === 'circle' ? 'all' : 'circle'"
              title="Peu grave"
            >
              <span aria-hidden="true">●</span>
            </button>

            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--square',
                selectedShape === 'square' && 'vlc-shape-btn--active',
              ]"
              @click="selectedShape = selectedShape === 'square' ? 'all' : 'square'"
              title="Grave"
            >
              <span aria-hidden="true">■</span>
            </button>

            <button
              type="button"
              :class="[
                'vlc-shape-btn',
                'vlc-shape-btn--triangle',
                selectedShape === 'triangle' && 'vlc-shape-btn--active',
              ]"
              @click="selectedShape = selectedShape === 'triangle' ? 'all' : 'triangle'"
              title="Très grave"
            >
              <span aria-hidden="true">▲</span>
            </button>
          </div>
        </div>

        <button
          v-else
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
type PointType = 'circle' | 'square' | 'triangle' | 'all'

type FirestorePoint = {
  id: string
  coordinates?: { latitude: number; longitude: number }
  point_type_id?: number
  point_state_id?: number
  [key: string]: any
}

const props = defineProps<{
  points?: FirestorePoint[]
  isLoading?: boolean
  errorMessage?: string | null
}>()

const isLoading = computed(() => !!props.isLoading)
const errorMessage = computed(() => props.errorMessage || null)

const selectedShape = ref<PointType>('all')
const isLegendOpen = ref(true)

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
})

function normalizeLatLng(point: FirestorePoint): { lat: number; lng: number } | null {
  const gp = point.coordinates
  if (!gp) return null

  const lat = Number(gp.latitude)
  const lng = Number(gp.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function markerColor(point: FirestorePoint): string {
  // heuristic colors by point_type_id: 1=blue, 2=orange, 3=red
  const typeId = Number(point.point_type_id)
  if (typeId === 2) return '#f97316'
  if (typeId === 3) return '#ef4444'
  return '#3b82f6'
}

function renderPoints() {
  if (!map || !L || !pointsLayer) return

  pointsLayer.clearLayers()
  const pts = props.points || []
  const filteredPts = selectedShape.value === 'all' ? pts : pts.filter((p: FirestorePoint) => {
    const typeId = Number(p.point_type_id)
    if (selectedShape.value === 'circle') return typeId === 1
    if (selectedShape.value === 'square') return typeId === 2
    if (selectedShape.value === 'triangle') return typeId === 3
    return false
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
    renderPoints()
  },
  { deep: true }
)

watch(selectedShape, () => {
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
