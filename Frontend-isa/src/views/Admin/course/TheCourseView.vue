<template>
  <div class="layout-container">
    <BreadCrumbs class="breadcrumbs" />
    <router-view class="router-view" />
  </div>
</template>

<script setup lang="ts">
import BreadCrumbs from '@/components/ui/BreadCrumbs.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute()
const path = computed(() => {
  return route.path.split('/').slice(-1, 0);
})
</script>

<style scoped>
.layout-container {

  margin: 0 auto;
  padding: 20px;
}

.breadcrumbs {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eaeaea;
}

.router-view {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Animation pour les transitions de route */
.router-view {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
