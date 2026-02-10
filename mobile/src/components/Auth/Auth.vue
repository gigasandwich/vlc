<template>
  <div class="auth-root">
    <div class="auth-card">
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

    const expMins = payload?.sessionExpirationMinutes
    authStore.setSession(expMins)
  } catch (e) {
    console.warn('Failed to set user in store', e)
  }

  // navigate to map (tab1)
  router.replace('/tabs/tab1')
}
</script>

<style src="./Auth.css"></style>
