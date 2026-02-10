<template>
  <div class="splash" role="status" aria-live="polite">
    <div class="splash-card">
      <img class="splash-logo" src="/vlc_logo.png" alt="VLC" />
      <div class="splash-spinner" aria-hidden="true" />
      <div class="splash-text">Chargement…</div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.splash {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--app-bg);
}

.splash-card {
  width: min(420px, 92vw);
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
  padding: 22px 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.splash-logo {
  width: min(180px, 50vw);
  height: auto;
  object-fit: contain;
}

.splash-text {
  font-weight: 800;
  letter-spacing: 0.01em;
  color: var(--app-text);
}

.splash-spinner {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid rgba(148, 163, 184, 0.45);
  border-top-color: var(--app-primary);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
