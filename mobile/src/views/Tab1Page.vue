<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />

      <!-- Map (similar UI to web front) -->
      <div class="map-shell">
        <div class="map-header">
          <div class="map-header-row">
            <div class="map-title">VLC Serve</div>

            <div class="shape-switch" :class="selectedShape">
              <button class="shape-btn" :class="btnClass('circle')" @click="selectedShape = 'circle'" title="Peu grave">
                <span class="shape-icon circle"></span>
                <span class="shape-label">Peu grave</span>
              </button>
              <button class="shape-btn" :class="btnClass('square')" @click="selectedShape = 'square'" title="Grave">
                <span class="shape-icon square"></span>
                <span class="shape-label">Grave</span>
              </button>
              <button class="shape-btn" :class="btnClass('triangle')" @click="selectedShape = 'triangle'" title="Très grave">
                <span class="shape-icon triangle"></span>
                <span class="shape-label">Très grave</span>
              </button>
            </div>
          </div>
        </div>

        <div class="map-main">
          <div ref="mapEl" class="leaflet-host"></div>

          <div class="legend-wrap">
            <div v-if="isLegendOpen" class="legend-card" @click.stop="isLegendOpen = false">
              <div class="legend-top">
                <div class="legend-title">Légende (Cliquez pour fermer)</div>
                <div class="legend-close">✕</div>
              </div>
              <ul class="legend-list">
                <li class="legend-item"><span class="legend-dot circle"></span><span>Peu grave</span></li>
                <li class="legend-item"><span class="legend-dot square"></span><span>Grave</span></li>
                <li class="legend-item"><span class="legend-dot triangle"></span><span>Très grave</span></li>
              </ul>
            </div>

            <button v-else class="legend-fab" @pointerdown.stop.prevent="isLegendOpen = true" title="Ouvrir la légende">
              <span class="dots"></span>
            </button>
          </div>
        </div>
      </div>

      <div style="padding: 16px;">
        <h3>Examples from backend</h3>
        <ul>
          <li v-for="ex in examples" :key="ex.id">
            {{ ex.column1 || `#${ex.id}` }}
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import L from 'leaflet';

type PointType = 'circle' | 'square' | 'triangle'

interface BackendPointData {
  id: number
  date: string
  surface: number
  budget: number
  coordinates: [number, number]
  point_type_label: string
  point_state_label: string
  factories: string[]
  assigned_user: string
}

interface MapPoint {
  id: number
  lat: number
  lng: number
  type: PointType
  backendData: BackendPointData
  marker?: L.Marker
}

export default defineComponent({
  name: 'Tab1Page',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainer },
  data() {
    return {
      examples: [] as Array<{ id: number; column1?: string }>,

      // Map state
      map: null as L.Map | null,
      points: [] as MapPoint[],
      selectedShape: 'circle' as PointType,
      isLegendOpen: true,
      tileUrl: 'http://localhost:8081/styles/basic-preview/{z}/{x}/{y}.png',
    };
  },
  computed: {
    examplesComputed(): Array<{ id: number; column1?: string }> {
      return this.examples;
    },
  },
  methods: {
    btnClass(type: PointType) {
      const base = 'shape-btn'
      if (this.selectedShape !== type) return base + ' inactive'
      return base + ' active ' + type
    },

    createIcon(color: string, shape: PointType) {
      let svgContent = ''
      if (shape === 'circle') svgContent = `<circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>`
      else if (shape === 'square') svgContent = `<rect x="4" y="4" width="16" height="16" fill="${color}" stroke="white" stroke-width="2"/>`
      else svgContent = `<polygon points="12,3 21,20 3,20" fill="${color}" stroke="white" stroke-width="2"/>`

      return L.divIcon({
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        html: `<svg width="24" height="24" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">${svgContent}</svg>`,
      })
    },

    simulateBackendFetch(id: number, type: PointType, lat: number, lng: number): BackendPointData {
      return {
        id,
        date: new Date().toISOString(),
        surface: Math.floor(Math.random() * 500) + 50,
        budget: Math.floor(Math.random() * 10000) + 1000,
        coordinates: [lat, lng],
        point_type_label: type === 'circle' ? 'Peu grave' : type === 'square' ? 'Grave' : 'Très grave',
        point_state_label: 'En attente',
        factories: ['Usine Alpha', 'Zone B'],
        assigned_user: 'mobile_user',
      }
    },

    ensureMap() {
      if (this.map) return
      const el = (this.$refs.mapEl as unknown as HTMLElement) || null
      if (!el) return

      const tanaPosition: [number, number] = [-18.9101, 47.5251]
      this.map = L.map(el, { zoomControl: true }).setView(tanaPosition, 13)

      L.tileLayer(this.tileUrl, {
        attribution: '&copy; Local TileServer',
      }).addTo(this.map)

      this.map.on('click', (e: any) => {
        this.handleMapClick(e.latlng.lat, e.latlng.lng)
      })

      // Ionic/Vue: ensure correct sizing after mount
      setTimeout(() => this.map?.invalidateSize(), 250)
    },

    handleMapClick(lat: number, lng: number) {
      const backendData = this.simulateBackendFetch(Date.now(), this.selectedShape, lat, lng)
      const p: MapPoint = {
        id: backendData.id,
        lat,
        lng,
        type: this.selectedShape,
        backendData,
      }
      this.points.push(p)
      this.addMarker(p)
      // eslint-disable-next-line no-console
      console.log('📡 BACKEND POST: Point ajouté', backendData)
    },

    addMarker(point: MapPoint) {
      if (!this.map) return

      let icon
      if (point.type === 'circle') icon = this.createIcon('#3b82f6', 'circle')
      else if (point.type === 'square') icon = this.createIcon('#f97316', 'square')
      else icon = this.createIcon('#ef4444', 'triangle')

      const marker = L.marker([point.lat, point.lng], { icon }).addTo(this.map)

      // Popup with delete
      const popup = document.createElement('div')
      popup.style.minWidth = '140px'
      popup.style.textAlign = 'center'

      const title = document.createElement('div')
      title.textContent = `Point #${point.id}`
      title.style.fontWeight = '700'
      title.style.color = '#334155'
      title.style.marginBottom = '4px'
      popup.appendChild(title)

      const subtitle = document.createElement('div')
      subtitle.textContent = point.backendData.point_type_label
      subtitle.style.fontSize = '12px'
      subtitle.style.color = '#64748b'
      subtitle.style.marginBottom = '10px'
      popup.appendChild(subtitle)

      const btn = document.createElement('button')
      btn.textContent = 'Supprimer'
      btn.className = 'leaflet-delete-btn'
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        this.deletePoint(point.id)
      })
      popup.appendChild(btn)

      marker.bindPopup(popup)

      // Tooltip
      const tip = document.createElement('div')
      tip.className = 'leaflet-tip'
      tip.innerHTML = `
        <div class="leaflet-tip-title">Détails Backend</div>
        <ul class="leaflet-tip-list">
          <li><b>Surface:</b> ${point.backendData.surface} m²</li>
          <li><b>Budget:</b> ${point.backendData.budget} Ar</li>
          <li><b>Usines:</b> ${point.backendData.factories.join(', ')}</li>
        </ul>
      `
      marker.bindTooltip(tip, { direction: 'top', offset: [0, -20], opacity: 1 })

      point.marker = marker
    },

    deletePoint(id: number) {
      const idx = this.points.findIndex(p => p.id === id)
      if (idx < 0) return
      const p = this.points[idx]
      if (p.marker && this.map) {
        this.map.removeLayer(p.marker)
      }
      this.points.splice(idx, 1)
      this.map?.closePopup()
      // eslint-disable-next-line no-console
      console.log(`🗑️ BACKEND DELETE: Point ID ${id} supprimé`)
    },

    fetchExamples() {
      fetch('http://localhost:1234/some-endpoint')
        .then((r) => r.json())
        .then((data) => {
          console.log(data);
          this.examples = data;
        })
        .catch((e) => console.error('fetch /some-endpoint failed', e));
    },
  },
  created() {
    this.fetchExamples();
  },
  mounted() {
    this.ensureMap()
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },
});
</script>

<style scoped>
.map-shell {
  margin: 16px;
  border-radius: 14px;
  overflow: hidden;
  background: #f3f4f6;
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.map-header {
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.map-header-row {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.map-title {
  font-weight: 700;
  color: #334155;
}

.shape-switch {
  display: flex;
  gap: 8px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.shape-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #94a3b8;
  transition: all 150ms ease;
}

.shape-btn .shape-label {
  font-size: 12px;
  font-weight: 600;
}

.shape-btn.inactive:hover {
  background: #f8fafc;
  color: #64748b;
}

.shape-btn.active.circle {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.shape-btn.active.square {
  background: #ffedd5;
  border-color: #f97316;
  color: #c2410c;
}

.shape-btn.active.triangle {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
}

.shape-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background: currentColor;
}

.shape-icon.circle {
  border-radius: 999px;
}

.shape-icon.square {
  border-radius: 3px;
}

.shape-icon.triangle {
  width: 0;
  height: 0;
  background: transparent;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-bottom: 18px solid currentColor;
}

.map-main {
  position: relative;
  background: #e2e8f0;
}

.leaflet-host {
  height: 65vh;
  width: 100%;
}

.legend-wrap {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.legend-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
}

.legend-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.legend-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #334155;
}

.legend-close {
  font-size: 12px;
  color: #94a3b8;
}

.legend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
  font-size: 12px;
  color: #334155;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 14px;
  height: 14px;
  display: inline-block;
}

.legend-dot.circle {
  border-radius: 999px;
  background: #3b82f6;
}

.legend-dot.square {
  border-radius: 2px;
  background: #f97316;
}

.legend-dot.triangle {
  width: 0;
  height: 0;
  border-left: 7px solid transparent;
  border-right: 7px solid transparent;
  border-bottom: 14px solid #ef4444;
}

.legend-fab {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  border: 2px solid rgba(100, 116, 139, 0.45);
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
}

.legend-fab .dots {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #334155;
  box-shadow: 0 -10px 0 #334155, 0 10px 0 #334155;
  display: inline-block;
}

/* Popup button styling (re-using front look) */
:deep(.leaflet-delete-btn) {
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: #ef4444;
}

:deep(.leaflet-delete-btn:hover) {
  background: #dc2626;
}

:deep(.leaflet-tip) {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  color: #334155;
}

:deep(.leaflet-tip-title) {
  font-weight: 800;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

:deep(.leaflet-tip-list) {
  margin: 0;
  padding-left: 16px;
}

@media (min-width: 768px) {
  .map-header-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .leaflet-host {
    height: 70vh;
  }
  .shape-btn .shape-label {
    display: inline;
  }
}
</style>
