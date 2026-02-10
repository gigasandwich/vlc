import { createApp } from 'vue'
import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import authStore from '@/stores/authStore'
import { logout } from '@backjs/firebaseAuth'

const app = createApp(App)
  .use(IonicVue)
  .use(router);

router.isReady().then(() => {
  app.mount('#app');

  // Auto-enforce app session expiration even without navigation.
  setInterval(() => {
    try {
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
        try {
          void logout()
        } catch {
          // ignore
        }

        const path = String(router.currentRoute.value?.path || '')
        if (path.startsWith('/tabs')) {
          void router.replace('/auth')
        }
      }
    } catch {
      // ignore
    }
  }, 15_000)
});
