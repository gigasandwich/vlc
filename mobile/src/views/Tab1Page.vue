<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <VlcMap :points="points" :is-loading="isLoading" :error-message="errorMessage" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, onIonViewDidEnter } from '@ionic/vue'
import { ref } from 'vue'
import { VlcMap } from '@/components/VlcMap'

import { fetchFirestorePoints } from '@/backJs/router.js'

const points = ref<any[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

async function refreshPoints() {
  isLoading.value = true
  errorMessage.value = null
  try {
    points.value = await fetchFirestorePoints()
    console.log(points.value)
  } catch (err: any) {
    errorMessage.value = err?.message || 'Erreur lors du chargement des points'
    points.value = []
  } finally {
    isLoading.value = false
  }
}

onIonViewDidEnter(() => {
  refreshPoints()
})
</script>
