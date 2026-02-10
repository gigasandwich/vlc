<template>
  <nav class="bottom-nav">
    <router-link
      to="/tabs/tab1"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
    >
      <div class="bottom-nav-icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 7m0 13V7" />
        </svg>
      </div>
      <span class="bottom-nav-label">Carte</span>
    </router-link>

    <router-link
      to="/tabs/tab2"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
    >
      <div class="bottom-nav-icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <span class="bottom-nav-label">Tableau</span>
    </router-link>

    <router-link
      v-if="isAdmin"
      to="/tabs/admin"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
    >
      <div class="bottom-nav-icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2l2 5 5 .5-3.5 3 1 5L12 14l-4.5 2.5 1-5L5 7.5 10 7 12 2z" />
        </svg>
      </div>
      <span class="bottom-nav-label">Admin</span>
    </router-link>

    <router-link
      to="/tabs/tab3"
      class="bottom-nav-item"
      active-class="bottom-nav-item--active"
    >
      <div class="bottom-nav-icon">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <span class="bottom-nav-label">Profil</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isAdmin = ref(false)

onMounted(() => {
  // Check if user is admin, similar to React version
  // For now, assume not, or implement user check
  // In React: if (user && user.role === 'admin') setIsAdmin(true)
  // Here, perhaps from localStorage or props
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user && user.role === 'admin') {
    isAdmin.value = true
  }
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  left: 12px;
  right: 12px;
  background: #ffffff;
  z-index: 2000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 62px;
  padding: 6px 8px;
  border-radius: 18px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  box-shadow: 0 8px 20px rgba(2, 6, 23, 0.08);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 12px;
  text-decoration: none;
  color: rgba(37, 99, 235, 0.75);
  transition: all 200ms ease;
}

.bottom-nav-item:hover {
  color: #1d4ed8;
}

.bottom-nav-item--active {
  color: #2563eb;
}

.bottom-nav-item--active .bottom-nav-icon {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  transform: translateY(-2px);
}

.bottom-nav-icon {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.05);
  color: inherit;
  transition: all 200ms ease;
  margin-bottom: 2px;
}

.bottom-nav-icon svg {
  width: 22px;
  height: 22px;
}

.bottom-nav-label {
  font-weight: 600;
  font-size: 11px;
  opacity: 0.9;
}

.bottom-nav-item--active .bottom-nav-label {
  opacity: 1;
  font-weight: 700;
}
</style>