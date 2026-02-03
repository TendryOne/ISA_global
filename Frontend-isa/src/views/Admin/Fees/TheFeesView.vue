<template>
  <div>
    <Suspense>
      <template #default>
        <RouterView />
      </template>
      <template #fallback>
        <SpinningLoader />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import SpinningLoader from '@/components/loader/SpinningLoader.vue';

// Pas besoin d'import spécial, Suspense est global dans Vue 3
</script>

<style scoped></style>
