<template>
  <div class="luxury-modal-overlay" @click.self="closeModal">
    <div class="luxury-modal-container error">
      <div class="modal-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
      </div>

      <div class="modal-header">
        <div class="error-icon">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
          <div class="icon-glow"></div>
        </div>
        <h2>Erreur lors de <span class="highlight">l'opération</span></h2>
        <p class="modal-subtitle">Une erreur est survenue lors du traitement de votre demande</p>
      </div>

      <div class="error-content">
        <div class="error-message">
          <Icon icon="mdi:alert-circle-outline" width="24" class="error-message-icon" />
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <div class="modal-actions">
        <ActionButton v-if="showRetry" @click="retryAction" icon="mdi:refresh" iconPosition="left" class="retry-btn"
          type="button">
          Réessayer
        </ActionButton>
        <ActionButton @click="closeModal" icon="mdi:close" iconPosition="left" class="close-btn" type="button">
          Fermer
        </ActionButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ActionButton from '@/components/ui/ActionButton.vue'

const props = defineProps({
  errorMessage: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'retry'])

const closeModal = () => {
  emit('close')
}

const retryAction = () => {
  emit('retry')
}
</script>

<style scoped>
.luxury-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.luxury-modal-container {
  position: relative;
  background: var(--primary-dark);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--primary-color-light);
  overflow: hidden;
}

.luxury-modal-container.error {
  border-color: var(--error);
}

.modal-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.2;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: var(--error);
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--error-dark);
  bottom: -30px;
  left: -30px;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.error-icon {
  position: relative;
  margin: 0 auto 1rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-icon svg {
  color: var(--error);
  z-index: 1;
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--error-light);
  animation: pulse 2s infinite alternate;
}

.modal-header h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem;
  color: var(--white);
}

.highlight {
  color: var(--error);
  position: relative;
}

.modal-subtitle {
  color: var(--gray-lighter);
  margin: 0;
  font-size: 0.95rem;
}

.error-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(235, 77, 75, 0.2);
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.error-message-icon {
  color: var(--error);
  flex-shrink: 0;
  margin-top: 2px;
}

.error-message p {
  margin: 0;
  color: var(--white);
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--error);
  color: var(--error);
}

.close-btn:hover {
  background: var(--error-dark);
}

.retry-btn {
  background: linear-gradient(to right, var(--primary-color), var(--primary-light));
}

@keyframes pulse {
  0% {
    opacity: 0.3;
    transform: scale(0.95);
  }

  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .luxury-modal-container {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .close-btn,
  .retry-btn {
    width: 100%;
  }
}
</style>
