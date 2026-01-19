<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tab 1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <ExploreContainer name="Tab 1 page" />

      <div style="padding: 16px;">
        <h3>Examples from backend</h3>
        <ul>
          <li v-for="ex in examples" :key="ex.id">
            {{ ex.column1 || `#${ex.id}` }}
          </li>
        </ul>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';

export default defineComponent({
  name: 'Tab1Page',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainer },
  data() {
    return {
      examples: [] as Array<{ id: number; column1?: string }>,
    };
  },
  computed: {
    examplesComputed(): Array<{ id: number; column1?: string }> {
      return this.examples;
    },
  },
  methods: {
    fetchExamples() {
      fetch('http://localhost:1234/some-endpoint')
        .then((r) => r.json())
        .then((data) => {
          console.log(data);
          this.examples = data;
        })
        .catch((e) => console.error('fetch /some-endpoint failed', e));
    },
  },
  created() {
    this.fetchExamples();
  },
});
</script>
