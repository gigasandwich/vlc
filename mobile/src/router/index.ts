import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import authStore from '@/stores/authStore'
import { logout } from '@backjs/firebaseAuth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    component: () => import('@/views/AuthPage.vue')
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  // Enforce app-level session expiration
  if (authStore.state?.uid && authStore.isSessionExpired?.()) {
    try {
      authStore.clearUser()
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('user')
    } catch {
      // ignore
    }
    // Best-effort Firebase sign out (do not block navigation)
    try {
      void logout()
    } catch {
      // ignore
    }
  }

  const isAuthed = !!authStore.isAuthenticated?.value

  // If not authenticated, only allow /auth
  if (!isAuthed && to.path.startsWith('/tabs')) {
    return { path: '/auth' }
  }

  // If authenticated, keep users out of the login screen
  if (isAuthed && to.path === '/auth') {
    return { path: '/tabs/tab1' }
  }

  return true
})

export default router
