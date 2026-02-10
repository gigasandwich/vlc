import { computed, reactive } from 'vue'

type BootState = {
  minSplashDone: boolean
  pointsLoading: boolean
}

const state = reactive<BootState>({
  minSplashDone: false,
  pointsLoading: false,
})

let minSplashTimerId: ReturnType<typeof setTimeout> | null = null

function startMinSplash(ms: number = 3000) {
  if (state.minSplashDone) return
  if (minSplashTimerId != null) return

  minSplashTimerId = setTimeout(() => {
    state.minSplashDone = true
    minSplashTimerId = null
  }, ms)
}

function setPointsLoading(v: boolean) {
  state.pointsLoading = !!v
}

const showSplash = computed(() => !state.minSplashDone || state.pointsLoading)

const bootStore = {
  state,
  startMinSplash,
  setPointsLoading,
  showSplash,
}

export default bootStore
