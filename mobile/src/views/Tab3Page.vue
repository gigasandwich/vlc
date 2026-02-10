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

      <div class="profile-page">
        <!-- Avatar header -->
        <div class="profile-hero">
          <div class="profile-avatar">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
            </svg>
          </div>
          <div class="profile-name">{{ backendUser?.name || firebaseEmail || 'Utilisateur' }}</div>
          <div class="profile-role-badge">{{ backendRole || 'USER' }}</div>
        </div>

        <!-- Info cards -->
        <div class="profile-cards">
          <div class="profile-card">
            <div class="profile-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="profile-card-body">
              <div class="profile-card-label">Email</div>
              <div class="profile-card-value">{{ firebaseEmail || '-' }}</div>
            </div>
          </div>

          <div class="profile-card">
            <div class="profile-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="profile-card-body">
              <div class="profile-card-label">Rôle</div>
              <div class="profile-card-value">{{ backendRole || '-' }}</div>
            </div>
          </div>

          <div class="profile-card">
            <div class="profile-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="profile-card-body">
              <div class="profile-card-label">ID utilisateur</div>
              <div class="profile-card-value">{{ backendUserId ?? '-' }}</div>
            </div>
          </div>
        </div>

        <!-- Logout -->
        <button class="profile-logout-btn" :disabled="loading" @click="onLogout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>{{ loading ? 'Déconnexion…' : 'Déconnexion' }}</span>
        </button>

        <p v-if="error" class="profile-error">{{ error }}</p>
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

<style scoped>
.profile-page {
  padding: 20px 18px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  max-width: 520px;
  margin: 0 auto;
}

.profile-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 0 22px;
}

.profile-avatar {
  width: 76px;
  height: 76px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
  margin-bottom: 12px;
}

.profile-name {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 6px;
}

.profile-role-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.profile-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 10px rgba(2, 6, 23, 0.04);
}

.profile-card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.profile-card-body {
  flex: 1;
  min-width: 0;
}

.profile-card-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.profile-card-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-logout-btn {
  width: 100%;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(180deg, #ef4444, #dc2626);
  color: #ffffff;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.22);
  transition: transform 120ms ease, filter 120ms ease;
}

.profile-logout-btn:active {
  transform: translateY(1px);
  filter: brightness(0.96);
}

.profile-logout-btn[disabled] {
  opacity: 0.65;
}

.profile-error {
  margin-top: 12px;
  color: #ef4444;
  text-align: center;
  font-size: 13px;
}
</style>