<template>
  <div class="vlc-legend" @click.stop>
    <div class="vlc-legend-header">
      <div class="vlc-legend-title">Choix problème</div>
      <button type="button" class="vlc-legend-close" @click.stop="$emit('close')" aria-label="Fermer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div class="vlc-legend-cards">
      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'circle' }"
        @click="$emit('select-shape', currentShape === 'circle' ? 'none' : 'circle')"
      >
        <span class="vlc-legend-dot vlc-dot-circle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Peu grave</div>
          <div class="vlc-problem-sub">Signalement léger</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'square' }"
        @click="$emit('select-shape', currentShape === 'square' ? 'none' : 'square')"
      >
        <span class="vlc-legend-dot vlc-dot-square" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Grave</div>
          <div class="vlc-problem-sub">Nécessite une intervention</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'triangle' }"
        @click="$emit('select-shape', currentShape === 'triangle' ? 'none' : 'triangle')"
      >
        <span class="vlc-legend-dot vlc-dot-triangle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Très grave</div>
          <div class="vlc-problem-sub">Danger immédiat</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placementShape?: 'circle' | 'square' | 'triangle' | 'none'
}>()

const emit = defineEmits<{
  (e: 'select-shape', shape: 'circle' | 'square' | 'triangle' | 'none'): void
  (e: 'close'): void
}>()

import { computed } from 'vue'

const currentShape = computed(() => props.placementShape ?? 'none')
</script>

<style scoped>
.vlc-problem-list { grid-auto-rows: auto; }
.vlc-problem-label { display:flex; flex-direction:column }
.vlc-problem-title { font-weight:700; color:var(--vlc-text); font-size:13px }
.vlc-problem-sub { font-size:12px; color:var(--vlc-muted) }
.vlc-legend-dot.vlc-dot-circle { width:18px; height:18px; background:var(--vlc-blue); border-radius:999px; box-shadow:0 4px 8px rgba(59,130,246,0.18) }
.vlc-legend-dot.vlc-dot-square { width:18px; height:18px; background:var(--vlc-orange); border-radius:4px; box-shadow:0 4px 8px rgba(249,115,22,0.18) }
.vlc-legend-dot.vlc-dot-triangle { width:18px; height:18px; background:var(--vlc-red); clip-path: polygon(50% 0, 100% 100%, 0 100%); box-shadow:0 4px 8px rgba(239,68,68,0.18) }
.vlc-legend-cards { display:flex; flex-direction:column; gap:8px }
.vlc-problem-card { display:flex; align-items:center; gap:12px; padding:10px; background:var(--vlc-card); border-radius:10px; border:1px solid var(--vlc-border); width:240px; text-align:left; cursor:pointer }
.vlc-problem-card:active { transform:scale(0.995) }
.vlc-problem-card--active { outline:2px solid rgba(59,130,246,0.12); box-shadow:0 8px 20px rgba(2,6,23,0.06) }
.vlc-problem-card .vlc-legend-dot { flex:0 0 auto }
.vlc-problem-card .vlc-problem-label { flex:1 }

</style>
