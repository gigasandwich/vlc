<template>
  <div class="recap-root">
    <div class="recap-cards">
      <div class="card">
        <div class="card-icon card-icon--blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Points signalés</div>
          <div class="card-value">{{ nbPoints }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon card-icon--purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Surface totale</div>
          <div class="card-value">{{ formattedTotalSurface }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon card-icon--green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Avancement moyen</div>
          <div class="card-value">{{ formattedAvgProgress }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-icon card-icon--orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </div>
        <div class="card-body">
          <div class="card-label">Budget total</div>
          <div class="card-value">{{ formattedTotalBudget }}</div>
        </div>
      </div>
    </div>

    <div class="recap-panel">
      <h3 class="panel-title">Délai de traitement des travaux</h3>
      <div class="table-wrap">
        <table class="min-w-full text-left text-sm" role="table">
          <thead>
            <tr>
              <th class="py-2 pr-4">Point</th>
              <th class="py-2 pr-4">Nouveau → En cours</th>
              <th class="py-2 pr-4">En cours → Terminé</th>
              <th class="py-2 pr-4">Nouveau → Terminé</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="w in workDelays" :key="w?.pointDTO?.id" class="border-t">
              <td class="py-3 pr-4">#{{ w?.pointDTO?.id }} — {{ w?.pointDTO?.point_type_label || '' }} — {{ w?.pointDTO?.point_state_label || '' }}</td>
              <td class="py-3 pr-4">{{ w?.newDelaytoInProgressLabel ?? '—' }}</td>
              <td class="py-3 pr-4">{{ w?.inProgressDelaytofinishedLabel ?? '—' }}</td>
              <td class="py-3 pr-4">{{ w?.totalDelayLabel ?? '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t font-semibold">
              <td class="py-3 pr-4">Moyennes</td>
              <td class="py-3 pr-4">{{ avgNewLabel ?? '—' }}</td>
              <td class="py-3 pr-4">{{ avgInProgLabel ?? '—' }}</td>
              <td class="py-3 pr-4">{{ avg0to1Label ?? '—' }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - local JS module without type declaration
import { getDashboardSnapshot } from '../../../backJs/firestoreRecap.js'

const nbPoints = ref<number>(0)
const totalSurface = ref<number>(0)
const avgProgress = ref<number | null>(null)
const totalBudget = ref<number>(0)

const workDelays = ref<any[]>([])

const avgNewLabel = ref<string | null>(null)
const avgInProgLabel = ref<string | null>(null)
const avg0to1Label = ref<string | null>(null)

const formattedTotalSurface = computed(() => (Number(totalSurface.value) || 0).toFixed(2) + ' m²')
const formattedAvgProgress = computed(() => (Number(avgProgress.value) || 0).toFixed(2) + ' %')
const formattedTotalBudget = computed(() => {
  try { return Number(totalBudget.value).toLocaleString() + ' Ar' } catch { return String(totalBudget.value) }
})

onMounted(async () => {
    try {
      const snap = await getDashboardSnapshot()
      if (snap?.summary) {
        const s = snap.summary
        // Support both legacy keys (count/surface/budget) and server-side DTO keys (nbPoints/totalSurface/totalBudget)
        nbPoints.value = s.nbPoints
        totalSurface.value = s.totalSurface
        // avgProgress uses the same key on both sides (avgProgress)
        avgProgress.value = (s.avgProgress)
        totalBudget.value = s.totalBudget
      }

      if (snap?.workDelay && Array.isArray(snap.workDelay.workTreatments)) {
        workDelays.value = snap.workDelay.workTreatments
        avgNewLabel.value = snap.workDelay.average0to05Label ?? null
        avgInProgLabel.value = snap.workDelay.average05to1Label ?? null
        avg0to1Label.value = snap.workDelay.average0to1Label ?? null
      }
    } catch (err) {
      console.error('[Recap] getDashboardSnapshot failed', err)
    }
})
</script>

<style src="./Recap.css"></style>