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

    <div class="vlc-level-control">
      <div class="vlc-level-row">
        <span class="vlc-level-label">Niveau</span>
        <input
          class="vlc-level-number"
          type="number"
          min="1"
          max="10"
          step="1"
          v-model.number="level"
        />
      </div>
      <input
        class="vlc-level-range"
        type="range"
        min="1"
        max="10"
        step="1"
        v-model.number="level"
      />
      <div class="vlc-level-scale">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>

    <div class="vlc-legend-cards" :class="`vlc-level-${severityLevel}`">
      <div class="vlc-problem-card" :class="{ 'is-selected': level >= 1  && level <= 3 }">
        <span class="vlc-legend-dot vlc-dot-circle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Peu grave</div>
          <div class="vlc-problem-sub">Signalement léger</div>
        </div>
      </div>

      <div class="vlc-problem-card" :class="{ 'is-selected': level >= 4 && level <= 7 }">
        <span class="vlc-legend-dot vlc-dot-square" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Grave</div>
          <div class="vlc-problem-sub">Nécessite une intervention</div>
        </div>
      </div>

      <div class="vlc-problem-card" :class="{ 'is-selected': level >= 8 && level <= 10 }">
        <span class="vlc-legend-dot vlc-dot-triangle" aria-hidden="true"></span>
        <div class="vlc-problem-label">
          <div class="vlc-problem-title">Très grave</div>
          <div class="vlc-problem-sub">Danger immédiat</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  placementShape?: 'circle' | 'square' | 'triangle' | 'none'
}>()

const emit = defineEmits<{
  (e: 'select-shape', shape: 'circle' | 'square' | 'triangle' | 'none'): void
  (e: 'select-level', level: number): void
  (e: 'close'): void
}>()

import { computed, nextTick, ref, watch } from 'vue'

const currentShape = computed(() => props.placementShape ?? 'none')

const level = ref<number>(1)
const syncing = ref(false)

const severityLevel = computed(() => {
  const val = Number(level.value) || 1
  if (val >= 8) return 3
  if (val >= 4) return 2
  return 1
})

function shapeToLevel(shape: 'circle' | 'square' | 'triangle' | 'none'): number {
  if (shape === 'square') return 6
  if (shape === 'triangle') return 9
  return 2
}

function levelToShape(val: number): 'circle' | 'square' | 'triangle' {
  if (val >= 8) return 'triangle'
  if (val >= 4) return 'square'
  return 'circle'
}

function clampLevel(val: number): number {
  const num = Number(val)
  if (!Number.isFinite(num)) return 1
  if (num < 1) return 1
  if (num > 10) return 10
  return Math.round(num)
}

watch(
  () => props.placementShape,
  (shape) => {
    syncing.value = true
    level.value = shapeToLevel(shape ?? 'none')
    nextTick(() => {
      syncing.value = false
    })
  },
  { immediate: true }
)

watch(level, (val) => {
  if (syncing.value) return
  const nextLevel = clampLevel(val)
  if (nextLevel !== val) {
    level.value = nextLevel
    return
  }

  emit('select-level', nextLevel)
  const nextShape = levelToShape(nextLevel)
  if (nextShape !== currentShape.value) {
    emit('select-shape', nextShape)
  }
})
</script>

<style scoped>
.vlc-problem-list { grid-auto-rows: auto; }
.vlc-problem-label { display:flex; flex-direction:column }
.vlc-problem-title { font-weight:700; color:var(--vlc-text); font-size:13px }
.vlc-problem-sub { font-size:12px; color:var(--vlc-muted) }

.vlc-level-control {
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:10px;
}
.vlc-level-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.vlc-level-label {
  font-size:12px;
  font-weight:800;
  letter-spacing:0.05em;
  text-transform:uppercase;
  color:var(--vlc-muted);
}
.vlc-level-number {
  width:64px;
  border:1px solid var(--vlc-border);
  border-radius:10px;
  padding:6px 8px;
  font-size:13px;
  font-weight:700;
  color:var(--vlc-text);
  background:#fff;
}
.vlc-level-range {
  width:100%;
}
.vlc-level-scale {
  display:flex;
  justify-content:space-between;
  font-size:11px;
  color:var(--vlc-muted);
}

.vlc-legend-dot {
  width:18px;
  height:18px;
  background:#cbd5e1;
  border-radius:999px;
  box-shadow:none;
}
.vlc-legend-dot.vlc-dot-square { border-radius:4px; }
.vlc-legend-dot.vlc-dot-triangle { clip-path: polygon(50% 0, 100% 100%, 0 100%); }

.vlc-legend-cards { display:flex; flex-direction:column; gap:8px }
.vlc-problem-card {
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 10px;
  background:var(--vlc-card);
  border-radius:10px;
  border:1px solid var(--vlc-border);
  width:240px;
  text-align:left;
}
.vlc-problem-card.is-selected {
  border-color: rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.04);
}
.vlc-problem-card .vlc-legend-dot { flex:0 0 auto }
.vlc-problem-card .vlc-problem-label { flex:1 }

.vlc-legend-cards.vlc-level-1 .vlc-problem-card.is-selected .vlc-legend-dot { background:var(--vlc-blue); box-shadow:0 4px 8px rgba(59,130,246,0.18) }
.vlc-legend-cards.vlc-level-2 .vlc-problem-card.is-selected .vlc-legend-dot { background:var(--vlc-orange); box-shadow:0 4px 8px rgba(249,115,22,0.18) }
.vlc-legend-cards.vlc-level-3 .vlc-problem-card.is-selected .vlc-legend-dot { background:var(--vlc-red); box-shadow:0 4px 8px rgba(239,68,68,0.18) }

</style>
