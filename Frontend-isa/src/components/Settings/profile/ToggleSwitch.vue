<template>
  <button class="toggle-switch" :class="{ active: value }" @click="$emit('toggle')" type="button">
    <span class="toggle-handle"></span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  value: Boolean
})

defineEmits(['toggle'])
</script>

<style scoped>
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: #cbd5e0;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background-color: #4299e1;
}

.toggle-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;
  transition: transform 0.2s;
}

.toggle-switch.active .toggle-handle {
  transform: translateX(20px);
}
</style>
