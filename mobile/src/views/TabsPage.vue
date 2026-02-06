<template>
  <ion-page>
    <ion-router-outlet></ion-router-outlet>
    <BottomNav />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonRouterOutlet } from '@ionic/vue';
import BottomNav from '@/components/BottomNav.vue';
</script>
