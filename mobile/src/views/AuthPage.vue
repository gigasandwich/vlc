<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <img class="nav-logo" src="/vlc_logo.png" alt="VLC" />
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">
            <img class="nav-logo nav-logo--large" src="/vlc_logo.png" alt="VLC" />
          </ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="auth-page-content">
        <Auth />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { Auth } from '@/components/Auth'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
</script>

<style scoped>
.auth-page-content {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.nav-logo {
  height: 50px;
  width: auto;
  display: block;
  margin: 0 auto;
}

.nav-logo--large {
  height: 32px;
}
</style>
