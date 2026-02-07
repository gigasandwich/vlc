<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Authentification</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Authentification</ion-title>
        </ion-toolbar>
      </ion-header>

      <div style="padding:16px; max-width:720px; margin:0 auto;">
        <!-- Reuse the Auth component created earlier -->
        <Auth />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Auth } from '@/components/Auth'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
</script>
