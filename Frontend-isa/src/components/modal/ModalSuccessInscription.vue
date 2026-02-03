<template>
  <div class="luxury-modal-overlay" @click.self="closeModal">
    <div class="luxury-modal-container">
      <div class="modal-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
      </div>

      <div class="modal-header">
        <div class="success-icon">
          <svg width="60" height="60" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12l1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div class="icon-glow"></div>
        </div>
        <h2>Inscription <span class="highlight">finalisée</span> avec succès</h2>
        <p class="modal-subtitle">Votre compte a été créé avec succès. Voici vos identifiants :</p>
      </div>

      <div class="credentials-container">
        <div class="credential-item">
          <div class="credential-label">
            <Icon icon="mdi:identifier" width="20" />
            <span>Matricule</span>
          </div>
          <div class="credential-value">
            <span>{{ credentials.matricule }}</span>
            <button type="button" @click="copyToClipboard(credentials.matricule, 'matricule')" class="copy-btn"
              :class="{ 'copied': copiedItem === 'matricule' }" aria-label="Copier le matricule">
              <Icon v-if="copiedItem !== 'matricule'" icon="mdi:content-copy" width="18" />
              <Icon v-else icon="mdi:check" width="18" />
            </button>
          </div>
        </div>


        <div class="credential-item">
          <div class="credential-label">
            <Icon icon="mdi:form-textbox-password" width="20" />
            <span>Mot de passe</span>
          </div>
          <div class="credential-value">
            <span>{{ credentials.password }}</span>
            <button type="button" @click="copyToClipboard(credentials.password, 'password')" class="copy-btn"
              :class="{ 'copied': copiedItem === 'password' }" aria-label="Copier le mot de passe">
              <Icon v-if="copiedItem !== 'password'" icon="mdi:content-copy" width="18" />
              <Icon v-else icon="mdi:check" width="18" />
            </button>
          </div>
        </div>
      </div>

      <div class="modal-notice">
        <Icon icon="mdi:email-fast" width="24" class="notice-icon" />
        <p>Ces informations ont également été envoyées à votre adresse email.</p>
      </div>

      <div class="modal-actions">
        <ActionButton @click="closeModal" icon="mdi:login" iconPosition="right" class="login-btn" type="button">
          Se connecter maintenant
        </ActionButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import ActionButton from '@/components/ui/ActionButton.vue'

const router = useRouter()

const props = defineProps({
  credentials: {
    type: Object,
    required: true,
    default: () => ({
      matricule: '',
      password: ''
    })
  }
})

const emit = defineEmits(['close'])

const copiedItem = ref<string | null>(null)
const copyTimeout = ref<number | null>(null)

const closeModal = () => {
  emit('close')
  router.push('/login')
}

const copyToClipboard = (text: string, itemName: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      copiedItem.value = itemName

      // Clear previous timeout if exists
      if (copyTimeout.value) {
        clearTimeout(copyTimeout.value)
      }
      // Reset after 2 seconds
      copyTimeout.value = window.setTimeout(() => {
        copiedItem.value = null
      }, 2000)
    })
    .catch(err => {
      console.error('Erreur lors de la copie :', err)
      // Optional: show error feedback
    })
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
  background: var(--primary-light);
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: var(--secondary-light);
  bottom: -30px;
  left: -30px;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.success-icon {
  position: relative;
  margin: 0 auto 1rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon svg {
  color: var(--secondary-light);
  z-index: 1;
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--secondary-extra-light);
  animation: pulse 2s infinite alternate;
}

.modal-header h2 {
  font-size: 1.8rem;
  margin: 0 0 0.5rem;
  color: var(--white);
}

.highlight {
  color: var(--secondary-light);
  position: relative;
}

.modal-subtitle {
  color: var(--gray-lighter);
  margin: 0;
  font-size: 0.95rem;
}

.credentials-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.credential-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.credential-item:last-child {
  border-bottom: none;
}

.credential-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-lighter);
  font-size: 0.9rem;
}

.credential-value {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.credential-value span {
  font-family: monospace;
  color: var(--white);
  font-size: 0.95rem;
}

.copy-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-lighter);
  transition: all 0.3s ease;
  position: relative;
}

.copy-btn:hover {
  background: var(--primary-color-light);
  color: var(--white);
}

.copy-btn.copied {
  background: var(--secondary-color);
  color: var(--white);
  animation: bounce 0.5s;
}

.copy-btn::after {
  content: 'Copié !';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--secondary-color);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.copy-btn.copied::after {
  opacity: 1;
}

.modal-notice {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: rgba(80, 134, 193, 0.1);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 2rem;
  border-left: 3px solid var(--primary-light);
}

.notice-icon {
  color: var(--primary-light);
  flex-shrink: 0;
}

.modal-notice p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-lighter);
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.login-btn {
  background: linear-gradient(to right, var(--secondary-color), var(--secondary-light));
  padding: 0.8rem 2rem;
  font-weight: 500;
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

@keyframes bounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

@media (max-width: 768px) {
  .luxury-modal-container {
    padding: 1.5rem;
  }

  .modal-header h2 {
    font-size: 1.5rem;
  }

  .credential-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .credential-value {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
