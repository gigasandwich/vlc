<template>
  <form class="form-auth" @submit.prevent="onSubmit" novalidate>
    <div class="form-logo" aria-hidden="true">
      <div class="form-logo-circle">
        <svg
          class="form-user-icon"
          viewBox="0 0 24 24"
          width="44"
          height="44"
          focusable="false"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
          />
        </svg>
      </div>
    </div>

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
import {
  assertUserNotDisabled,
  assertUserRole,
  fetchUserProfileByEmail,
  fetchUserProfileByFirebaseUid,
  resetAttemptByFirebaseUid,
} from '@backjs/firestoreUsers'
import { getAuthConfig } from '@backjs/firestoreConfig'
import { registerPushNotificationsForUser } from '@backjs/pushNotifications'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const emit = defineEmits<{
  (e: 'success', payload: any): void
}>()

const mode = toRef(props, 'mode')

const email = ref('user1@gmail.com')
const password = ref('pass123')
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

function normalizeEmailKey(v: string) {
  return String(v || '').trim().toLowerCase()
}

async function onSubmit() {
  error.value = null

  const emailKey = normalizeEmailKey(email.value)
  const cfg = await getAuthConfig().catch(() => ({
    tokenExpirationSeconds: 180,
    loginAttemptLimit: 3,
  }))

  // Best-effort: block disabled users before even trying Firebase login
  if (emailKey) {
    try {
      const profileByEmail = await fetchUserProfileByEmail(emailKey)
      if (profileByEmail) {
        assertUserNotDisabled(profileByEmail)
      }
    } catch (e: any) {
      if (String(e?.message || '') === 'Compte bloqué') {
        error.value = 'Compte bloqué.'
        return
      }
      // ignore (rules may forbid pre-auth lookup)
    }
  }

  loading.value = true
  try {
    // cfg already loaded above, reuse it

    // 1) Firebase login (email/password). Anonymous is not used.
    const maxAttempts = Math.max(1, Number(cfg.loginAttemptLimit || 3))
    const res = await login(email.value, password.value, maxAttempts)
    
    // Handle login failure with attempt tracking
    if (res.error) {
      console.error('[Auth] Login error:', res.error?.message, 'Disabled:', res.disabled, 'Attempt:', res.error?.attempt)
      
      // Check if account is disabled
      if (res.disabled === true) {
        error.value = 'Compte bloqué.'
        return
      }

      // Show attempt tracking feedback - ALWAYS SHOW MESSAGE
      const attempt = Number(res?.error?.attempt)
      const attemptsRemaining = Number(res?.error?.attemptsRemaining)
      
      if (Number.isFinite(attemptsRemaining)) {
        if (attemptsRemaining <= 0) {
          error.value = 'Compte bloqué après trop de tentatives.'
        } else if (attemptsRemaining <= 2) {
          error.value = `${res.error?.message || 'Connexion refusée'} (${attemptsRemaining} tentative${attemptsRemaining > 1 ? 's' : ''} restante${attemptsRemaining > 1 ? 's' : ''})`
        } else {
          error.value = res.error?.message || 'Connexion refusée'
        }
      } else {
        error.value = res.error?.message || 'Connexion refusée'
      }
      return
    }

    // 2) Role check using Firestore `users` collection
    const firebaseUser = res.user
    const profile = await fetchUserProfileByFirebaseUid(firebaseUser?.uid)
    assertUserNotDisabled(profile)
    assertUserRole(profile)

    const roles = Array.isArray(profile?.roles) ? profile.roles : []
    const userRole = roles.find((r: any) => String(r?.label || '').toUpperCase() === 'USER')
    const roleId = userRole?.id ?? roles?.[0]?.id ?? null

    // Persist user profile for filtering/profile page
    try {
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: profile?.id ?? null,
          userDocId: profile?._docId ?? null,
          email: profile?.email ?? firebaseUser?.email ?? email.value,
          name: profile?.username ?? profile?.name ?? null,
          role: 'USER',
          roleId,
          roles,
          fbId: profile?.fbId ?? firebaseUser?.uid ?? null,
        })
      )
    } catch {
      // ignore
    }

    // Best-effort: register push notifications for this user
    try {
      if (profile?._docId) {
        await registerPushNotificationsForUser({ userDocId: String(profile._docId) })
      }
    } catch {
      // ignore
    }

    // Reset attempt counter after successful login
    try {
      if (firebaseUser?.uid) {
        await resetAttemptByFirebaseUid(firebaseUser.uid)
      }
    } catch {
      // ignore
    }

    emit('success', {
      user: res.user,
      sessionExpirationSeconds: cfg.tokenExpirationSeconds,
    })
  }
  catch (err: any) {
    error.value = err?.message || 'Connexion refusée'
  } finally {
    loading.value = false
  }
}
</script>

<style src="./FormAuth.css" scoped></style>
