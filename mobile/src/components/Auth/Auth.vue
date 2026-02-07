<template>
  <div class="auth-root">
    <div class="auth-card">
      <header class="auth-header">
        <h1 class="auth-title">Connexion</h1>
        <nav class="auth-tabs">
          <button :class="{active: mode === 'login'}" @click="mode = 'login'">Se connecter</button>
        </nav>
      </header>

      <main class="auth-main">
        <FormAuth :mode="mode" @success="onSuccess" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormAuth from './FormAuth.vue'
import authStore from '@/stores/authStore'

const mode = ref<'login'>('login')
const router = useRouter()

function onSuccess(payload: any) {
  // payload contains { user }
  const firebaseUser = payload?.user
  if (!firebaseUser) return

  // store user in auth store
  try {
    authStore.setUser(firebaseUser)
  } catch (e) {
    console.warn('Failed to set user in store', e)
  }

  // navigate to map (tab1)
  router.replace('/tabs/tab1')
}
</script>

<style src="./Auth.css"></style>
