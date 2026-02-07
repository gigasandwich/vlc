<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Profil</ion-title>
        </ion-toolbar>
      </ion-header>

      <div style="padding:16px; max-width:720px; margin:0 auto;">
        <ion-list inset>
          <ion-item>
            <ion-label>
              <h2>Email</h2>
              <p>{{ firebaseEmail || '-' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h2>UID Firebase</h2>
              <p style="word-break: break-all;">{{ firebaseUid || '-' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h2>Rôle</h2>
              <p>{{ backendRole || '-' }}</p>
            </ion-label>
          </ion-item>
          <ion-item>
            <ion-label>
              <h2>ID utilisateur</h2>
              <p>{{ backendUserId ?? '-' }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <div style="margin-top: 12px; display:flex; gap:12px;">
          <ion-button expand="block" color="danger" :disabled="loading" @click="onLogout">
            {{ loading ? 'Déconnexion…' : 'Déconnexion' }}
          </ion-button>
        </div>

        <p v-if="error" style="margin-top: 12px; color: var(--ion-color-danger);">{{ error }}</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import authStore from '@/stores/authStore'
import { logout } from '@backjs/firebaseAuth'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
} from '@ionic/vue'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

const backendUser = ref<any | null>(null)
onMounted(() => {
  try {
    backendUser.value = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    backendUser.value = null
  }
})

const firebaseEmail = computed(() => authStore.state.email)
const firebaseUid = computed(() => authStore.state.uid)
const backendRole = computed(() => backendUser.value?.role || null)
const backendUserId = computed(() => backendUser.value?.id ?? null)

async function onLogout() {
  error.value = null
  loading.value = true
  try {
    const res = await logout()
    if (res?.error) {
      console.error('[Auth] Firebase logout failed', res.error)
    }
    authStore.clearUser()
    try {
      localStorage.removeItem('vlc_backend_token')
      localStorage.removeItem('user')
    } catch {
      // ignore
    }
    await router.replace('/auth')
  } catch (e: any) {
    console.error('[Auth] Logout failed', e)
    error.value = 'Déconnexion impossible. Réessaie plus tard.'
  } finally {
    loading.value = false
  }
}
</script>