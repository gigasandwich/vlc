<template>
  <ion-app>
    <SplashScreen v-if="bootStore.showSplash.value" />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted } from 'vue'
import SplashScreen from '@/components/Splash/SplashScreen.vue'
import bootStore from '@/stores/bootStore.ts'

onMounted(() => {
  bootStore.startMinSplash(3000)
})
</script>
