<template>
  <span>{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  value: number
  duration: number
}>()

const displayValue = ref(0)

const animate = () => {
  const start = 0
  const end = props.value
  const duration = props.duration
  let startTime: number | null = null

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const progress = Math.min((timestamp - startTime) / duration, 1)
    displayValue.value = Math.floor(progress * (end - start) + start)
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

onMounted(animate)
watch(() => props.value, animate)
</script>
