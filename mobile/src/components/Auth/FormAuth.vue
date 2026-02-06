<template>
  <form class="form-auth" @submit.prevent="onSubmit" novalidate>
    <header class="form-header">
      <h2 class="form-title">{{ mode === 'login' ? 'Connexion' : "Inscription" }}</h2>
      <p class="form-sub">{{ mode === 'login' ? 'Connectez-vous pour continuer' : 'Créez un compte' }}</p>
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

      <label v-if="mode === 'register'" class="field">
        <span class="label-text">Confirmer mot de passe</span>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="Confirmez le mot de passe"
          required
          minlength="6"
        />
      </label>
    </div>

    <div class="form-actions">
      <button class="submit-btn" type="submit" :disabled="loading">
        <span v-if="!loading">{{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}</span>
        <span v-else>Chargement…</span>
      </button>
    </div>

    <div v-if="error" class="form-error">{{ error }}</div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch, toRef, onMounted } from 'vue'
import { login, register } from '../../../backJs/firebaseAuth.js'

const props = defineProps<{ mode?: 'login' | 'register' }>()
const emit = defineEmits<{
  (e: 'success', payload: any): void
}>()

const mode = toRef(props, 'mode')

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const emailInput = ref<HTMLInputElement | null>(null)

watch(mode, () => {
  // reset form when mode changes
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
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
  if (mode.value === 'register' && password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas"
    return
  }

  loading.value = true
  try {
    if (mode.value === 'register') {
      const res = await register(email.value, password.value)
      if (res.error) throw res.error
      emit('success', res)
    } else {
      const res = await login(email.value, password.value)
      if (res.error) throw res.error
      emit('success', res)
    }
  } catch (err: any) {
    error.value = err?.message || String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-auth {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-header {
  text-align: center;
  padding: 8px 0 6px;
}
.form-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}
.form-sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}
.fields { padding: 6px 0 0; display:flex; flex-direction:column; gap:12px }
.field { display:flex; flex-direction:column; gap:6px }
.label-text { font-size:13px; color:#475569 }
input[type="email"], input[type="password"] {
  width:100%;
  padding:12px 14px;
  border:1px solid #e5e7eb;
  border-radius:10px;
  font-size:15px;
  background:#fff;
}
.form-actions { padding-top:6px }
.submit-btn {
  width:100%;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:14px 16px;
  background:#6d28d9; /* violet */
  color:#fff;
  border:0;
  border-radius:12px;
  font-weight:700;
  font-size:16px;
  box-shadow:0 6px 18px rgba(109,40,217,0.18);
}
.submit-btn[disabled] { opacity:0.7 }
.form-error { color:#ef4444; font-size:13px; margin-top:8px; text-align:center }

@media (max-width: 480px) {
  .form-title { font-size:18px }
  .submit-btn { padding:12px; font-size:15px }
}
</style>
