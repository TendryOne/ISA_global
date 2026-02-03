<template>
  <div class="elite-loading-container">
    <div class="elite-loading-content">
      <div class="elite-loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>
      <h3 class="elite-loading-title">{{ title }}</h3>
      <p class="elite-loading-message" v-if="message">{{ message }}</p>
      <div class="elite-loading-progress" v-if="showProgress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps({
  title: {
    type: String,
    default: 'Chargement en cours'
  },
  message: {
    type: String,
    default: ''
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0 && value <= 100
  }
})
</script>

<style scoped>
.elite-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-light);
  border: 1px solid var(--gray-lighter);
}

.elite-loading-content {
  text-align: center;
  max-width: 500px;
}

.elite-loading-spinner {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.spinner-circle {
  width: 16px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.spinner-circle:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-circle:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.elite-loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
}

.elite-loading-message {
  font-size: 1rem;
  color: var(--gray-dark);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.elite-loading-progress {
  height: 6px;
  background-color: var(--gray-extra-light);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 2rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary-color));
  border-radius: 3px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .elite-loading-container {
    padding: 1.5rem;
  }

  .elite-loading-title {
    font-size: 1.25rem;
  }
}
</style>
