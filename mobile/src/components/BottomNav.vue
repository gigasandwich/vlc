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
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.02);
  z-index: 2000;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
  padding: 8px;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 12px;
  text-decoration: none;
  color: #9ca3af;
  transition: all 200ms ease;
}

.bottom-nav-item:hover {
  color: #6b7280;
}

.bottom-nav-item--active {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.05);
}

.bottom-nav-item--active .bottom-nav-icon {
  transform: translateY(-4px);
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  padding: 6px;
}

.bottom-nav-icon {
  transition: transform 200ms ease;
  margin-bottom: 4px;
}

.bottom-nav-label {
  font-weight: 500;
  font-size: 14px;
  opacity: 0.9;
}

.bottom-nav-item--active .bottom-nav-label {
  opacity: 1;
}
</style>