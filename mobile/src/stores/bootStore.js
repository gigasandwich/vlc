import { computed, reactive } from 'vue'

const state = reactive({
  minSplashDone: false,
  pointsLoading: false,
})

let minSplashTimerId = null

function startMinSplash(ms = 3000) {
  if (state.minSplashDone) return
  if (minSplashTimerId != null) return

  minSplashTimerId = setTimeout(() => {
    state.minSplashDone = true
    minSplashTimerId = null
  }, ms)
}

function setPointsLoading(v) {
  state.pointsLoading = !!v
}

const showSplash = computed(() => !state.minSplashDone || state.pointsLoading)

export default {
  state,
  startMinSplash,
  setPointsLoading,
  showSplash,
}
