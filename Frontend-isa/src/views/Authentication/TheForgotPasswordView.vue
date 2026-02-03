<template>
  <form @submit.prevent="handleRecover" class="auth-form">
    <!-- En-tête -->
    <div class="form-header">
      <div class="header-icon">
        <Icon icon="ph:key-duotone" />
      </div>
      <h1 class="title">Mot de passe oublié</h1>
      <p class="subtitle">Entrez votre identifiant universitaire pour recevoir un lien de réinitialisation par email</p>
    </div>

    <!-- Message de succès -->
    <div class="success-message" v-if="response && !errorServer">
      <div class="success-icon">
        <Icon icon="ph:check-circle-fill" />
      </div>
      <div class="success-content">
        <h4>Email envoyé avec succès !</h4>
        <p>{{ response }}</p>
      </div>
    </div>

    <!-- Champ Identifiant -->
    <div class="form-group" :class="{ 'has-error': errorServer }" v-if="!response">
      <div class="input-wrapper">
        <div class="input-icon-container">
          <Icon icon="ph:identification-card-duotone" class="input-icon" />
        </div>
        <input id="studentId" type="text" placeholder=" " required class="input-field" name="matricule"
          @keypress="(e) => limitInput(e, 10)" v-model="matricule" />
        <label for="studentId" class="floating-label">Identifiant universitaire</label>
        <div class="input-highlight"></div>
      </div>
      <span class="input-hint">Format : ISA-000000</span>
    </div>

    <!-- Message d'erreur -->
    <div class="error-message" v-if="errorServer">
      <Icon icon="ph:x-circle-fill" />
      <span>{{ errorServer }}</span>
    </div>

    <!-- Bouton de soumission -->
    <button type="submit" class="submit-btn" :disabled="isLoading" v-if="!response">
      <span class="btn-content" v-if="!isLoading">
        <Icon icon="ph:paper-plane-tilt-fill" class="btn-icon" />
        <span>Envoyer le lien</span>
      </span>
      <span v-else class="loading-content">
        <span class="loading-spinner"></span>
        <span>Envoi en cours...</span>
      </span>
      <div class="btn-shine"></div>
    </button>

    <!-- Lien retour -->
    <div class="back-to-login">
      <RouterLink to="/login" class="link">
        <Icon icon="ph:arrow-left-bold" />
        <span>Retour à la connexion</span>
      </RouterLink>
    </div>

    <!-- Info sécurité -->
    <div class="security-info">
      <Icon icon="ph:info-fill" />
      <span>Le lien expirera après 24 heures pour votre sécurité</span>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import limitInput from '@/utils/limitInput'
import axios from 'axios'
import { ref } from 'vue'
const response = ref<string>('')
const errorServer = ref<string>('')
const matricule = ref<string>('')
const isLoading = ref(false)

const handleRecover = async () => {
  // Réinitialiser les messages
  response.value = ''
  errorServer.value = ''

  // Validation simple
  if (!matricule.value.trim()) {
    errorServer.value = "L'identifiant universitaire est requis";
    return;
  } else if (!/^[A-Za-z]{3}-\d{6}$/.test(matricule.value.trim())) {
    errorServer.value = "Votre matricule  est invalide";
    return;
  }

  isLoading.value = true
  try {
    const { data } = await axios.post("/api/v1/auth/forgot-password", {
      matricule: matricule.value.trim()
    })
    response.value = data.message || data
  } catch (e: any) {
    errorServer.value = e.response?.data?.message ||
      e.response?.data ||
      "Une erreur est survenue. Veuillez réessayer."
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

/* En-tête du formulaire */
.form-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.15) 0%, rgba(80, 134, 193, 0.05) 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid rgba(80, 134, 193, 0.2);
}

.header-icon svg {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  letter-spacing: -0.3px;
}

.subtitle {
  font-size: 0.875rem;
  color: var(--tertiary-dark);
  line-height: 1.6;
  max-width: 320px;
  margin: 0 auto;
}

/* Message de succès */
.success-message {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(48, 168, 85, 0.1) 0%, rgba(48, 168, 85, 0.03) 100%);
  border: 1px solid rgba(48, 168, 85, 0.2);
  border-radius: 12px;
  animation: successPulse 0.5s ease;
}

@keyframes successPulse {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-light) 100%);
  border-radius: 50%;
  flex-shrink: 0;
}

.success-icon svg {
  font-size: 1.5rem;
  color: white;
}

.success-content h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--secondary-dark);
  margin: 0 0 0.25rem 0;
}

.success-content p {
  font-size: 0.8125rem;
  color: var(--secondary-dark);
  margin: 0;
  line-height: 1.5;
  opacity: 0.85;
}

/* Groupe de formulaire */
.form-group {
  position: relative;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon-container {
  position: absolute;
  left: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  z-index: 2;
  pointer-events: none;
}

.input-icon {
  font-size: 1.25rem;
  color: var(--tertiary-color);
  transition: all 0.3s ease;
}

.form-group:focus-within .input-icon {
  color: var(--primary-color);
}

.form-group.has-error .input-icon {
  color: var(--error);
}

.input-field {
  width: 100%;
  padding: 1rem 1rem 1rem 3.25rem;
  border: 2px solid var(--gray-lighter);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--text-dark);
}

.input-field:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(80, 134, 193, 0.1);
  outline: none;
  background: white;
}

.form-group.has-error .input-field {
  border-color: var(--error);
  box-shadow: 0 0 0 4px rgba(235, 77, 75, 0.1);
}

/* Label flottant */
.floating-label {
  position: absolute;
  left: 3.25rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9375rem;
  color: var(--tertiary-color);
  pointer-events: none;
  transition: all 0.2s ease;
  background: white;
  padding: 0 0.25rem;
}

.input-field:focus~.floating-label,
.input-field:not(:placeholder-shown)~.floating-label {
  top: 0;
  left: 1rem;
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
}

/* Highlight animé */
.input-highlight {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 2px;
}

.input-field:focus~.input-highlight {
  width: calc(100% - 2rem);
}

/* Hint */
.input-hint {
  display: block;
  font-size: 0.7rem;
  color: var(--tertiary-light);
  margin-top: 0.375rem;
  margin-left: 0.5rem;
}

/* Message d'erreur */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(235, 77, 75, 0.08);
  border: 1px solid rgba(235, 77, 75, 0.2);
  border-radius: 10px;
  color: var(--error-dark);
  font-size: 0.8125rem;
  font-weight: 500;
  animation: errorShake 0.4s ease;
}

.error-message svg {
  font-size: 1.125rem;
  flex-shrink: 0;
  color: var(--error);
}

@keyframes errorShake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5px);
  }

  75% {
    transform: translateX(5px);
  }
}

/* Bouton de soumission */
.submit-btn {
  position: relative;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(80, 134, 193, 0.3);
  overflow: hidden;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(80, 134, 193, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: var(--gray-lighter);
  cursor: not-allowed;
  box-shadow: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.btn-icon {
  font-size: 1.125rem;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.submit-btn:hover .btn-shine {
  left: 100%;
}

/* Loading */
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Retour connexion */
.back-to-login {
  text-align: center;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.link:hover {
  background: rgba(80, 134, 193, 0.08);
  color: var(--primary-dark);
}

.link svg {
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.link:hover svg {
  transform: translateX(-3px);
}

/* Info sécurité */
.security-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(80, 134, 193, 0.05);
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--tertiary-dark);
  border: 1px solid rgba(80, 134, 193, 0.1);
}

.security-info svg {
  font-size: 0.875rem;
  color: var(--primary-color);
}

/* Responsive */
@media (max-width: 480px) {
  .title {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .header-icon {
    width: 50px;
    height: 50px;
  }

  .header-icon svg {
    font-size: 1.5rem;
  }

  .input-field {
    font-size: 16px;
  }
}
</style>
