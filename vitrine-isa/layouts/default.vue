<template>

  <div>
    <div class="fixed">
      <HeaderNav />
    </div>
    <slot />
    <div>
      <TheFooter />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TheFooter from '~/components/TheFooter.vue';


</script>

<style scoped>
.fixed {
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
}
</style>