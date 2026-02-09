<template>
  <div class="point-detail-container" @click="$emit('close')">
    <div class="point-detail-card" @click.stop>
      <div class="point-detail-header">
        <div class="point-detail-title">Point #{{ point.id }}</div>
        <button type="button" class="point-detail-close" @click="$emit('close')">✕</button>
      </div>

      <div class="point-detail-content">
        <div class="point-detail-progress-section">
          <div class="progress-label">Progression: <span class="progress-value">{{ progress }}%</span></div>
          <div class="progress-bar">
            <div class="progress-bar-fill" :style="{ width: `${progress}%`, backgroundColor: progressColor }"></div>
          </div>
        </div>

        <div class="point-detail-row">
          <div class="point-detail-label">
            <svg class="point-detail-icon" style="color: #3b82f6;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <path d="M16 2v4M8 2v4M3 10h18"></path>
            </svg>
            <span>Date:</span>
          </div>
          <span class="point-detail-value">{{ formattedDate }}</span>
        </div>

        <div class="point-detail-row">
          <div class="point-detail-label">
            <svg class="point-detail-icon" style="color: #10b981;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            <span>État:</span>
          </div>
          <span class="point-detail-value">{{ pointStateName }}</span>
        </div>

        <div class="point-detail-row">
          <div class="point-detail-label">
            <svg class="point-detail-icon" style="color: #8b5cf6;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M21 6H3m18 0v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6m18 0V4a2 2 0 00-2-2H5a2 2 0 00-2 2v2"></path>
            </svg>
            <span>Surface:</span>
          </div>
          <span class="point-detail-value">{{ formatNumber(point.surface) ?? '-' }} m²</span>
        </div>

        <div class="point-detail-row">
          <div class="point-detail-label">
            <svg class="point-detail-icon" style="color: #eab308;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path>
            </svg>
            <span>Budget:</span>
          </div>
          <span class="point-detail-value">{{ formatNumber(point.budget) ?? '-' }} Ar</span>
        </div>

        <div class="point-detail-row">
          <div class="point-detail-label">
            <svg class="point-detail-icon" style="color: #ef4444;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <span>Usines:</span>
          </div>
          <span class="point-detail-value truncate">{{ factoriesLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PointData = {
  id: string | number
  fbId?: string
  date?: string
  date_?: any // Firebase Timestamp
  surface?: number | null
  budget?: number | null
  coordinates?: { latitude: number; longitude: number } | any
  pointType?: { id: number; label: string }
  pointTypeId?: number
  pointState?: { id: number; label: string }
  pointStateId?: number
  factories?: Array<{ id: number; label: string }> | any[]
  typeLabel?: string
  type_label?: string
  stateLabel?: string
  state_label?: string
  factoryLabels?: string
  [key: string]: any
}

const props = defineProps<{
  point: PointData
}>()

defineEmits<{
  close: []
}>()

const formattedDate = computed(() => {
  try {
    let dateObj: Date | null = null
    
    // Handle Firebase Timestamp
    if (props.point.date_) {
      const ts = props.point.date_
      if (ts.toDate && typeof ts.toDate === 'function') {
        dateObj = ts.toDate()
      } else if (ts.seconds) {
        dateObj = new Date(ts.seconds * 1000)
      }
    }
    
    // Fallback to string date
    if (!dateObj && props.point.date) {
      dateObj = new Date(props.point.date)
    }
    
    if (!dateObj) return '-'
    
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return '-'
  }
})

const pointTypeName = computed(() => {
  if (props.point.pointType?.label) return props.point.pointType.label
  if (props.point.typeLabel) return props.point.typeLabel
  if (props.point.type_label) return props.point.type_label
  return '-'
})

const pointStateName = computed(() => {
  if (props.point.pointState?.label) return props.point.pointState.label
  if (props.point.stateLabel) return props.point.stateLabel
  if (props.point.state_label) return props.point.state_label
  return '-'
})

const factoriesLabel = computed(() => {
  if (props.point.factoryLabels) return props.point.factoryLabels
  
  if (Array.isArray(props.point.factories) && props.point.factories.length > 0) {
    return props.point.factories
      .map((f: any) => f.label || f.name || String(f))
      .filter((x: string) => x)
      .join(', ')
  }
  
  return '-'
})

const progress = computed(() => {
  return props.point.stateProgress ? Math.round(props.point.stateProgress * 100) : 0;
});

const progressColor = computed(() => {
  if (progress.value > 66) return '#22c55e';
  if (progress.value > 33) return '#f97316';
  return '#ef4444';
});

const formatNumber = (num: number | null | undefined) => {
  if (num == null) return '-';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
</script>

<style scoped>
.point-detail-container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.4);
  padding: 1rem;
}

.point-detail-card {
  background: linear-gradient(to bottom right, #ffffff, #f8fafc);
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  max-width: 22rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.point-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.point-detail-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: #0f172a;
}

.point-detail-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.point-detail-close:hover {
  color: #64748b;
}

.point-detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.point-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #0f172a;
}

.point-detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.point-detail-icon {
  width: 1rem;
  height: 1rem;
  stroke: currentColor;
  flex-shrink: 0;
}

.point-detail-value {
  margin-left: 0.5rem;
  text-align: right;
  max-width: 50%;
  flex-shrink: 1;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unknown-value {
  color: #9ca3af;
  font-style: italic;
}

.point-detail-progress-section {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: linear-gradient(to right, #f8fafc, #ffffff);
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.progress-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  text-align: center;
}

.progress-value {
  font-weight: 700;
  color: #1f2937;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background-color: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 6px;
}
</style>

