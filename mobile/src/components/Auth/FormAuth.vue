<template>
  <form class="form-auth" @submit.prevent="onSubmit" novalidate>
    <header class="form-header">
      <h2 class="form-title">{{ mode === 'login' ? 'Se connecter' : 'Sign-in'}}</h2>
    </header>

    <div class="fields">
      <label class="field">
        <span class="label-text">Adresse email</span>
        <input
          ref="emailInput"
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="exemple@domaine.com"
          required
        />
      </label>

      <label class="field">
        <span class="label-text">Mot de passe</span>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Entrez votre mot de passe"
          required
          minlength="6"
        />
      </label>
    </div>

    <div class="form-actions">
      <button class="submit-btn" type="submit" :disabled="loading">
        <span v-if="!loading">{{ mode === 'login' ? 'Se connecter' : 'Sign-in' }}</span>
        <span v-else>Chargement…</span>
      </button>
    </div>

    <div v-if="error" class="form-error">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, toRef, onMounted } from 'vue'
import { login } from '@backjs/firebaseAuth'
import { assertUserRole, fetchUserProfileByFirebaseUid } from '@backjs/firestoreUsers'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const emit = defineEmits<{
  (e: 'success', payload: any): void
}>()

const mode = toRef(props, 'mode')

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const emailInput = ref<HTMLInputElement | null>(null)

watch(mode, () => {
  // reset form when mode changes
  email.value = ''
  password.value = ''
  error.value = null
  // focus email when switching
  requestAnimationFrame(() => emailInput.value?.focus())
})

onMounted(() => {
  // focus email input when component mounts (mobile may require user interaction in some browsers)
  requestAnimationFrame(() => emailInput.value?.focus())
})

async function onSubmit() {
  error.value = null

  loading.value = true
  try {
    // 1) Firebase login (email/password). Anonymous is not used.
    const res = await login(email.value, password.value)
    if (res.error) throw res.error

    // 2) Role check using Firestore `users` collection
    const firebaseUser = res.user
    const profile = await fetchUserProfileByFirebaseUid(firebaseUser?.uid)
    assertUserRole(profile)

    // Persist user profile for filtering/profile page
    try {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: profile?.id ?? null,
          email: profile?.email ?? firebaseUser?.email ?? email.value,
          name: profile?.username ?? profile?.name ?? null,
          role: 'USER',
          fbId: profile?.fbId ?? firebaseUser?.uid ?? null,
        })
      )
    } catch {
      // ignore
    }

    emit('success', res)
  }
  catch (err: any) {
    error.value = err?.message || 'Connexion refusée'
  } finally {
    loading.value = false
  }
}
</script>

<style src="./FormAuth.css" scoped></style>
