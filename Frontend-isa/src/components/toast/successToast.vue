<template>
  <Transition name="modern-toast">
    <div v-if="isVisible" class="modern-toast" :class="`modern-toast--${type}`"
      :style="{ '--duration': `${duration}ms` }">

      <!-- Background patterns -->
      <div class="modern-toast__background">
        <div class="modern-toast__pattern"></div>
        <div class="modern-toast__shimmer"></div>
      </div>

      <!-- Border gradient -->
      <div class="modern-toast__border"></div>

      <div class="modern-toast__content">
        <!-- Enhanced icon container -->
        <div class="modern-toast__icon-wrapper">
          <div class="modern-toast__icon-container" :class="type">
            <div class="modern-toast__icon-ring"></div>
            <Icon :icon="icon" class="modern-toast__icon" />
            <div class="modern-toast__icon-pulse"></div>
          </div>
        </div>

        <!-- Enhanced text content -->
        <div class="modern-toast__text">
          <h3 class="modern-toast__title">{{ title }}</h3>
          <p class="modern-toast__message">{{ message }}</p>
        </div>

        <!-- Enhanced close button -->
        <button class="modern-toast__close" @click="dismiss" aria-label="Fermer la notification">
          <div class="modern-toast__close-bg"></div>
          <Icon icon="mdi:close" class="modern-toast__close-icon" />
        </button>
      </div>

      <!-- Enhanced progress bar -->
      <div class="modern-toast__progress-track">
        <div class="modern-toast__progress-bar"></div>
        <div class="modern-toast__progress-glow"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

type SnackbarType = 'success' | 'error' | 'warning' | 'info'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String as () => SnackbarType,
    default: 'success',
    validator: (value: string) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  }
})

const isVisible = ref(true)

const icon = computed(() => {
  return {
    success: 'heroicons:check-circle-20-solid',
    error: 'heroicons:x-circle-20-solid',
    warning: 'heroicons:exclamation-triangle-20-solid',
    info: 'heroicons:information-circle-20-solid'
  }[props.type]
})


const emit = defineEmits(['dismissed'])


onMounted(() => {
  setTimeout(() => dismiss(), props.duration)
})

const dismiss = () => {
  isVisible.value = false
  emit('dismissed') // informe le parent que le toast s’est terminé
}

</script>

<style scoped>
/* Modern Toast Container */
.modern-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  min-width: 400px;
  max-width: 540px;
  width: 90%;
  background: rgba(248, 250, 252, 0.95);
  border-radius: 16px;
  overflow: hidden;
  z-index: 10000;
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.08),
    0 8px 16px rgba(15, 23, 42, 0.04),
    0 0 0 1px rgba(148, 163, 184, 0.1);
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* Background Effects */
.modern-toast__background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}

.modern-toast__pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image:
    radial-gradient(circle at 25% 25%, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 75% 75%, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

.modern-toast__shimmer {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }

  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

/* Enhanced Border */
.modern-toast__border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 16px 16px 0 0;
}

.modern-toast--success .modern-toast__border {
  background: linear-gradient(90deg, #0f766e, #14b8a6, #5eead4, #14b8a6, #0f766e);
  background-size: 200% 100%;
  animation: borderFlow 2s ease-in-out infinite;
}

.modern-toast--error .modern-toast__border {
  background: linear-gradient(90deg, #dc2626, #ef4444, #fca5a5, #ef4444, #dc2626);
  background-size: 200% 100%;
  animation: borderFlow 2s ease-in-out infinite;
}

.modern-toast--warning .modern-toast__border {
  background: linear-gradient(90deg, #d97706, #f59e0b, #fcd34d, #f59e0b, #d97706);
  background-size: 200% 100%;
  animation: borderFlow 2s ease-in-out infinite;
}

.modern-toast--info .modern-toast__border {
  background: linear-gradient(90deg, #1e40af, #3b82f6, #93c5fd, #3b82f6, #1e40af);
  background-size: 200% 100%;
  animation: borderFlow 2s ease-in-out infinite;
}

@keyframes borderFlow {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

/* Content Layout */
.modern-toast__content {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  position: relative;
  z-index: 2;
  gap: 1rem;
}

/* Enhanced Icon Container */
.modern-toast__icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.modern-toast__icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.modern-toast__icon-container.success {
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.1), rgba(20, 184, 166, 0.15));
  color: #0f766e;
  border: 2px solid rgba(15, 118, 110, 0.25);
}

.modern-toast__icon-container.error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(239, 68, 68, 0.15));
  color: #dc2626;
  border: 2px solid rgba(220, 38, 38, 0.25);
}

.modern-toast__icon-container.warning {
  background: linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(245, 158, 11, 0.15));
  color: #d97706;
  border: 2px solid rgba(217, 119, 6, 0.25);
}

.modern-toast__icon-container.info {
  background: linear-gradient(135deg, rgba(30, 64, 175, 0.1), rgba(59, 130, 246, 0.15));
  color: #1e40af;
  border: 2px solid rgba(30, 64, 175, 0.25);
}

.modern-toast__icon {
  font-size: 1.5rem;
  z-index: 2;
  position: relative;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.modern-toast__icon-ring {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
  animation: iconRing 2s ease-in-out infinite;
}

.modern-toast__icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.1;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconRing {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  50% {
    opacity: 0.3;
    transform: scale(1.1);
  }

  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

@keyframes iconPulse {
  0% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1.05);
  }

  100% {
    opacity: 0.1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Enhanced Text Content */
.modern-toast__text {
  flex-grow: 1;
  min-width: 0;
}

.modern-toast__title {
  margin: 0 0 0.375rem 0;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.4;
  background: linear-gradient(135deg, #0f172a, #334155);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modern-toast--success .modern-toast__title {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modern-toast--error .modern-toast__title {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modern-toast--warning .modern-toast__title {
  background: linear-gradient(135deg, #d97706, #f59e0b);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modern-toast--info .modern-toast__title {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modern-toast__message {
  margin: 0;
  color: #475569;
  line-height: 1.6;
  font-size: 0.925rem;
  font-weight: 400;
  opacity: 0.9;
}

/* Enhanced Close Button */
.modern-toast__close {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  color: #64748b;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-toast__close-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.05);
  opacity: 0;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.modern-toast__close:hover .modern-toast__close-bg {
  opacity: 1;
  transform: scale(1);
}

.modern-toast__close:hover {
  color: #334155;
  transform: rotate(90deg) scale(1.1);
}

.modern-toast__close-icon {
  font-size: 1.125rem;
  z-index: 2;
  position: relative;
}

/* Enhanced Progress Bar */
.modern-toast__progress-track {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.modern-toast__progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: progressBar var(--duration) linear forwards;
}

.modern-toast__progress-glow {
  position: absolute;
  top: -2px;
  right: -20px;
  width: 20px;
  height: 8px;
  border-radius: 50%;
  filter: blur(4px);
  animation: progressGlow var(--duration) linear forwards;
}

.modern-toast--success .modern-toast__progress-bar {
  background: linear-gradient(90deg, #0f766e, #14b8a6);
}

.modern-toast--success .modern-toast__progress-glow {
  background: #14b8a6;
  box-shadow: 0 0 12px #14b8a6;
}

.modern-toast--error .modern-toast__progress-bar {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.modern-toast--error .modern-toast__progress-glow {
  background: #ef4444;
  box-shadow: 0 0 12px #ef4444;
}

.modern-toast--warning .modern-toast__progress-bar {
  background: linear-gradient(90deg, #d97706, #f59e0b);
}

.modern-toast--warning .modern-toast__progress-glow {
  background: #f59e0b;
  box-shadow: 0 0 12px #f59e0b;
}

.modern-toast--info .modern-toast__progress-bar {
  background: linear-gradient(90deg, #1e40af, #3b82f6);
}

.modern-toast--info .modern-toast__progress-glow {
  background: #3b82f6;
  box-shadow: 0 0 12px #3b82f6;
}

@keyframes progressBar {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

@keyframes progressGlow {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(-100%);
    opacity: 0;
  }
}

/* Enhanced Animations */
.modern-toast-enter-from,
.modern-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(60px) scale(0.9);
}

.modern-toast-enter-active {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modern-toast-leave-active {
  transition: all 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045);
}

.modern-toast-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

/* Responsive Design */
@media (max-width: 600px) {
  .modern-toast {
    min-width: auto;
    width: calc(100% - 2rem);
    bottom: 1rem;
    border-radius: 12px;
  }

  .modern-toast__content {
    padding: 1.25rem;
    gap: 0.875rem;
  }

  .modern-toast__icon-container {
    width: 42px;
    height: 42px;
  }

  .modern-toast__icon {
    font-size: 1.375rem;
  }

  .modern-toast__title {
    font-size: 1rem;
  }

  .modern-toast__message {
    font-size: 0.875rem;
  }

  .modern-toast__close {
    width: 28px;
    height: 28px;
    padding: 0.375rem;
  }
}

@media (max-width: 480px) {
  .modern-toast {
    width: calc(100% - 1rem);
    bottom: 0.5rem;
  }

  .modern-toast__content {
    padding: 1rem;
    gap: 0.75rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .modern-toast {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(55, 65, 81, 0.3);
  }

  .modern-toast__title {
    background: linear-gradient(135deg, #f9fafb, #e5e7eb);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .modern-toast__message {
    color: #9ca3af;
  }

  .modern-toast__close {
    color: #6b7280;
  }

  .modern-toast__close:hover {
    color: #d1d5db;
  }

  .modern-toast__progress-track {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
