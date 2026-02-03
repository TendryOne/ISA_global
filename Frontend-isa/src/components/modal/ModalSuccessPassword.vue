<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isVisible">
      <Transition name="zoom">
        <div class="modal-container " v-if="isVisible">
          <div class="modal-content">
            <div class="icon-wrapper">
              <Icon icon="ph:check-circle" class="success-icon" />
            </div>
            <h2 class="modal-title">Mot de passe modifié avec succès</h2>
            <p class="modal-message">
              Redirection automatique dans
              <span class="countdown">{{ countdown }}s</span>
            </p>

            <div class="progress-container">
              <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
            </div>

            <button class="action-btn" @click="redirectNow">
              <span>Continuer maintenant</span>
              <Icon icon="ph:arrow-right" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const isVisible = ref(true)
const progress = ref(100)
const countdown = ref(5)
const router = useRouter()
let timer: number | undefined

const redirectNow = () => {
  if (timer) clearInterval(timer)
  router.push('/login')
}


onMounted(() => {
  timer = window.setInterval(() => {
    countdown.value--
    progress.value = (countdown.value / 5) * 100

    if (countdown.value <= 0) {
      redirectNow()
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* Style moderne */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.modal-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--success) 0%, var(--primary-color) 100%);
}

.icon-wrapper {
  margin: 0 auto 1.5rem;
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  background: rgba(var(--secondary-color-rgb), 0.1);
  border-radius: 50%;
  padding: 1rem;
}

.success-icon {
  font-size: 2.5rem;
  color: var(--success);
  animation: bounceIn 0.6s ease;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.modal-message {
  color: var(--gray-dark);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  font-size: 1rem;
}

.countdown {
  font-weight: 700;
  color: var(--primary-color);
}

.progress-container {
  height: 6px;
  background: var(--gray-super-light);
  border-radius: 3px;
  overflow: hidden;
  margin: 2rem 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--success) 0%, var(--secondary-color) 100%);
  transition: width 1s linear;
  border-radius: 3px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.action-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
}

.action-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .modal-container {
    padding: 1.75rem;
  }

  .modal-title {
    font-size: 1.3rem;
  }
}
</style>
