<template>
  <div class="breadcrumb-nav">
    <span class="back-link" @click="router.back()">
      <svg class="back-icon" viewBox="0 0 24 24">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      {{ title || 'Retour' }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps<{
  title?: string;
}>()

const router = useRouter()
</script>

<style scoped>
.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--primary-dark);
}

.back-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
</style>
