<template>
  <div class="error-modal-overlay" @click.self="closeModal">
    <div class="error-modal">
      <div class="error-icon">
        <Icon name="mdi:close-circle" class="icon" />
        <div class="pulse-effect"></div>
      </div>

      <h3 class="modal-title">Échec de l'inscription</h3>

      <p class="modal-message">
        Désolé, votre inscription n'a pas pu être finalisée. Veuillez réessayer ultérieurement.
      </p>

      <div class="error-details">
        <Icon name="mdi:alert-circle" class="details-icon" />
        <span>{{ message }}</span>
      </div>

      <div class="modal-actions">
        <button class="action-button retry" @click="retryAction">
          <Icon name="mdi:refresh" class="button-icon" />
          Réessayer maintenant
        </button>
        <button class="action-button contact" @click="contactAction">
          <Icon name="mdi:headset" class="button-icon" />
          Contacter le support
        </button>
      </div>

      <button class="close-button" @click="closeModal">
        <Icon name="mdi:close" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>

defineProps<{
  message: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>();

const closeModal = () => {
  emit('close');
};

const retryAction = () => {
  emit('close')
};

const contactAction = () => {
  navigateTo('/contact')
};
</script>

<style scoped>
.error-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.error-modal {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

.error-icon {
  position: relative;
  margin: 0 auto 20px;
  width: 80px;
  height: 80px;
}

.icon {
  width: 100%;
  height: 100%;
  color: #e74c3c;
  /* Rouge d'erreur */
  z-index: 2;
  position: relative;
}

.pulse-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 1;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e74c3c;
  margin-bottom: 15px;
}

.modal-message {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 20px;
  line-height: 1.6;
}

.error-details {
  background-color: #fef2f2;
  border-left: 4px solid #e74c3c;
  padding: 12px 15px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 25px 0;
  font-size: 0.9rem;
  color: #7f1d1d;
  text-align: start;
}

.details-icon {
  color: #e74c3c;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
}

.action-button {
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.retry {
  background: linear-gradient(90deg, #e74c3c, #f39c12);
  color: white;
}

.contact {
  background: white;
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  font-size: 1.2rem;
  transition: color 0.2s;
}

.close-button:hover {
  color: #e74c3c;
}

.button-icon {
  font-size: 1.2rem;
}

@keyframes shake {

  10%,
  90% {
    transform: translateX(-1px);
  }

  20%,
  80% {
    transform: translateX(2px);
  }

  30%,
  50%,
  70% {
    transform: translateX(-4px);
  }

  40%,
  60% {
    transform: translateX(4px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }

  70% {
    transform: scale(1.1);
    opacity: 0.3;
  }

  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}

@media (max-width: 600px) {
  .error-modal {
    padding: 30px 20px;
    margin: 0 15px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .error-details {
    flex-direction: column;
    text-align: center;
  }
}
</style>