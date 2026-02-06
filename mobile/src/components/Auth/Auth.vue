<template>
  <div class="auth-root">
    <div class="auth-card">
      <header class="auth-header">
        <h1 class="auth-title">Connexion / Inscription</h1>
        <nav class="auth-tabs">
          <button :class="{active: mode === 'login'}" @click="mode = 'login'">Se connecter</button>
          <button :class="{active: mode === 'register'}" @click="mode = 'register'">S'inscrire</button>
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
import FormAuth from './FormAuth.vue'

const mode = ref<'login' | 'register'>('login')

function onSuccess(payload: any) {
  // payload contains { user } on success. Up to the caller to navigate or persist.
  // Keep this minimal: emit a custom event or handle routing here.
  console.log('Auth success', payload)
}
</script>

<style src="./Auth.css"></style>
