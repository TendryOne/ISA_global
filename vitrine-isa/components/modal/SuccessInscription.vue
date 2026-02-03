<template>
  <div class="success-modal">
    <div class="success-icon">
      <Icon name="mdi:check-circle" class="icon" />
      <div class="pulse-effect"></div>
    </div>

    <h3 class="modal-title">Inscription réussie !</h3>

    <p class="modal-message">
      Félicitations, votre inscription à l'ISA a été validée avec succès.
    </p>

    <div class="email-notification">
      <Icon name="mdi:email-outline" class="email-icon" />
      <p>Un email de confirmation vous a été envoyé.</p>
      <p class="spam-warning">(Pensez à vérifier vos courriers indésirables)</p>
    </div>

    <div class="registration-number">
      <span class="number-label">Votre numéro d'inscription :</span>
      <span class="number-value">{{ props.inscriptionNumber }}</span>
      <button class="copy-button" @click="copyNumber" :disabled="!isSupported">
        <span v-if="!copied">Copier
          <Icon name="mdi:clipboard-outline" />
        </span>
        <span v-else>Copié !
          <Icon name="mdi:check" />
        </span>
      </button>
    </div>

    <button class="close-button" @click="closeModal">
      <Icon name="mdi:close" />
    </button>
  </div>
</template>

<script lang="ts" setup>



const props = defineProps<{
  inscriptionNumber: string | null
}>()


const { copy, copied, isSupported } = useClipboard({ source: props.inscriptionNumber! })
const emit = defineEmits<{
  (e: 'closeModal'): void
}>()

const closeModal = () => {
  emit('closeModal');
};

const copyNumber = () => {
  copy();
};
</script>

<style scoped>
.email-notification {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  border-left: 4px solid var(--primary-color);
}

.email-icon {
  font-size: 1.8rem;
  color: var(--primary-color);
  margin-bottom: 10px;
}

.spam-warning {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
  margin-top: 5px;
}

.success-modal {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-out;
}

.success-icon {
  position: relative;
  margin: 0 auto 20px;
  width: 80px;
  height: 80px;
}

.icon {
  width: 100%;
  height: 100%;
  color: var(--primary-color);
  z-index: 2;
  position: relative;
}

.pulse-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 1;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-color-dark);
  margin-bottom: 15px;
}

.modal-message {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 25px;
  line-height: 1.6;
}

.registration-number {
  background: linear-gradient(135deg, #F9FAFB 0%, #F0F4F8 100%);
  border-radius: 10px;
  padding: 15px;
  margin: 25px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.number-label {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 5px;
}

.number-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: 1px;
  margin-bottom: 10px;
  word-break: break-all;
}

.copy-button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
}

.copy-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.copy-button span {
  display: flex;
  align-items: center;
  gap: 5px;
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

.primary {
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  color: white;
}

.secondary {
  background: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
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
  color: var(--primary-color);
}

.button-icon {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
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
  .success-modal {
    padding: 30px 20px;
    margin: 0 15px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .number-value {
    font-size: 1.3rem;
  }
}
</style>