<template>
  <div class="vlc-filter" @click.stop>
    <div class="vlc-legend-header">
      <div class="vlc-legend-title">Filtre</div>
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
        :class="{ 'vlc-problem-card--active': currentShape === 'all' }"
        @click="$emit('set-filter-shape', 'all')"
      >
        <span class="vlc-legend-dot vlc-dot-all"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Tous</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'circle' }"
        @click="$emit('set-filter-shape', 'circle')"
      >
        <span class="vlc-legend-dot vlc-dot-circle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Peu grave</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'square' }"
        @click="$emit('set-filter-shape', 'square')"
      >
        <span class="vlc-legend-dot vlc-dot-square" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Grave</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentShape === 'triangle' }"
        @click="$emit('set-filter-shape', 'triangle')"
      >
        <span class="vlc-legend-dot vlc-dot-triangle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Très grave</div>
        </div>
      </button>

      <button
        type="button"
        class="vlc-problem-card"
        :class="{ 'vlc-problem-card--active': currentMine }"
        @click="$emit('set-filter-mine', !currentMine)"
      >
        <span class="vlc-legend-dot vlc-dot-mine" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Mes points</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  filterShape?: 'all' | 'circle' | 'square' | 'triangle'
  filterMine?: boolean
}>()

const emit = defineEmits<{
  (e: 'set-filter-shape', shape: 'all' | 'circle' | 'square' | 'triangle'): void
  (e: 'set-filter-mine', value: boolean): void
  (e: 'close'): void
}>()

import { computed } from 'vue'

const currentShape = computed(() => props.filterShape ?? 'all')
const currentMine = computed(() => !!props.filterMine)
</script>

<style scoped>
/* reuse the same card styles used for ProblemChooser */
.vlc-legend-cards { display:flex; flex-direction:column; gap:8px }
.vlc-problem-card { display:flex; align-items:center; gap:12px; padding:10px; background:var(--vlc-card); border-radius:10px; border:1px solid var(--vlc-border); width:240px; text-align:left; cursor:pointer }
.vlc-problem-card:active { transform:scale(0.995) }
.vlc-problem-card--active { outline:2px solid rgba(15,23,42,0.06); box-shadow:0 8px 20px rgba(2,6,23,0.06) }
.vlc-problem-card .vlc-legend-dot { flex:0 0 auto }
.vlc-problem-card .vlc-problem-label { flex:1 }

/* match ProblemChooser text/dot styles exactly */
.vlc-problem-label { display:flex; flex-direction:column }
.vlc-problem-title { font-weight:700; color:var(--vlc-text); font-size:13px }
.vlc-problem-sub { font-size:12px; color:var(--vlc-muted) }
.vlc-legend-dot.vlc-dot-circle { width:18px; height:18px; background:var(--vlc-blue); border-radius:999px; box-shadow:0 4px 8px rgba(59,130,246,0.18) }
.vlc-legend-dot.vlc-dot-square { width:18px; height:18px; background:var(--vlc-orange); border-radius:4px; box-shadow:0 4px 8px rgba(249,115,22,0.18) }
.vlc-legend-dot.vlc-dot-triangle { width:18px; height:18px; background:var(--vlc-red); clip-path: polygon(50% 0, 100% 100%, 0 100%); box-shadow:0 4px 8px rgba(239,68,68,0.18) }
.vlc-legend-dot.vlc-dot-mine { width:18px; height:18px; background:var(--vlc-mine); border-radius:6px; box-shadow:0 4px 8px rgba(16,185,129,0.12) }
.vlc-legend-dot.vlc-dot-all { width:18px; height:18px; background:#f1f5f9; border-radius:6px; border:1px solid var(--vlc-border) }
</style>
