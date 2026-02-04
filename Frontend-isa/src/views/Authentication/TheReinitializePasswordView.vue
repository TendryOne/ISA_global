<template>
  <form @submit.prevent="handleReset" class="auth-form">
    <!-- En-tête du formulaire -->
    <div class="form-header">
      <div class="header-icon">
        <Icon icon="ph:shield-check-duotone" />
      </div>
      <h1 class="title">Nouveau mot de passe</h1>
      <p class="subtitle">Créez un mot de passe sécurisé pour protéger votre compte universitaire</p>
    </div>

    <!-- Champ Nouveau mot de passe -->
    <div class="form-group" :class="{ 'has-error': newPassword && passwordStrength < 2 }">
      <div class="input-wrapper">
        <div class="input-icon-container">
          <Icon icon="ph:lock-duotone" class="input-icon" />
        </div>
        <input id="newPassword" name="newPassword" :type="showNewPassword ? 'text' : 'password'" required
          class="input-field" placeholder=" " v-model="newPassword" autocomplete="new-password" />
        <label for="newPassword" class="floating-label">Nouveau mot de passe</label>
        <button type="button" @click="showNewPassword = !showNewPassword" class="password-toggle"
          :aria-label="showNewPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'">
          <Icon :icon="showNewPassword ? 'ph:eye-slash' : 'ph:eye'" />
        </button>
        <span class="input-highlight"></span>
      </div>

      <!-- Indicateur de force du mot de passe -->
      <div class="password-strength-container" v-if="newPassword">
        <div class="strength-bars">
          <div class="strength-bar" :class="{ active: passwordStrength >= 1, weak: passwordStrength === 1 }"></div>
          <div class="strength-bar" :class="{ active: passwordStrength >= 2, medium: passwordStrength === 2 }"></div>
          <div class="strength-bar" :class="{ active: passwordStrength >= 3, strong: passwordStrength >= 3 }"></div>
          <div class="strength-bar" :class="{ active: passwordStrength >= 4, 'very-strong': passwordStrength >= 4 }">
          </div>
        </div>
        <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
      </div>

      <!-- Critères du mot de passe -->
      <div class="password-criteria" v-if="newPassword">
        <div class="criteria-item" :class="{ valid: newPassword.length >= 8 }">
          <Icon :icon="newPassword.length >= 8 ? 'ph:check-circle-fill' : 'ph:circle'" />
          <span>8 caractères minimum</span>
        </div>
        <div class="criteria-item" :class="{ valid: /[A-Z]/.test(newPassword) }">
          <Icon :icon="/[A-Z]/.test(newPassword) ? 'ph:check-circle-fill' : 'ph:circle'" />
          <span>Une majuscule</span>
        </div>
        <div class="criteria-item" :class="{ valid: /[0-9]/.test(newPassword) }">
          <Icon :icon="/[0-9]/.test(newPassword) ? 'ph:check-circle-fill' : 'ph:circle'" />
          <span>Un chiffre</span>
        </div>
        <div class="criteria-item" :class="{ valid: /[^A-Za-z0-9]/.test(newPassword) }">
          <Icon :icon="/[^A-Za-z0-9]/.test(newPassword) ? 'ph:check-circle-fill' : 'ph:circle'" />
          <span>Un caractère spécial</span>
        </div>
      </div>
    </div>

    <!-- Champ Confirmation mot de passe -->
    <div class="form-group" :class="{ 'has-error': confirmPassword && !passwordsMatch }">
      <div class="input-wrapper">
        <div class="input-icon-container">
          <Icon icon="ph:lock-key-duotone" class="input-icon" />
        </div>
        <input id="confirmPassword" name="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required
          class="input-field" placeholder=" " v-model="confirmPassword" autocomplete="new-password" />
        <label for="confirmPassword" class="floating-label">Confirmer le mot de passe</label>
        <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="password-toggle"
          :aria-label="showConfirmPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'">
          <Icon :icon="showConfirmPassword ? 'ph:eye-slash' : 'ph:eye'" />
        </button>
        <span class="input-highlight"></span>
      </div>

      <!-- Indicateur de correspondance -->
      <div class="match-indicator" v-if="confirmPassword">
        <div v-if="passwordsMatch" class="match-success">
          <Icon icon="ph:check-circle-fill" />
          <span>Les mots de passe correspondent</span>
        </div>
        <div v-else class="match-error">
          <Icon icon="ph:x-circle-fill" />
          <span>Les mots de passe ne correspondent pas</span>
        </div>
      </div>
    </div>

    <!-- Message d'erreur serveur -->
    <div class="error-message" v-if="errorServer">
      <Icon icon="ph:warning-circle-fill" />
      <span>{{ errorServer }}</span>
    </div>

    <!-- Bouton de soumission -->
    <button type="submit" class="submit-btn" :disabled="isLoading || !isFormValid">
      <template v-if="!isLoading">
        <span class="btn-content">
          <Icon icon="ph:shield-check" class="btn-icon" />
          Réinitialiser mon mot de passe
        </span>
        <span class="btn-shine"></span>
      </template>
      <span v-else class="loading-content">
        <span class="loading-spinner"></span>
        Réinitialisation...
      </span>
    </button>

    <!-- Retour connexion -->
    <div class="back-to-login">
      <RouterLink to="/authentication/login" class="link">
        <Icon icon="ph:arrow-left" />
        Retour à la connexion
      </RouterLink>
    </div>

    <!-- Info sécurité -->
    <div class="security-info">
      <Icon icon="ph:info" />
      <span>Votre mot de passe sera chiffré de manière sécurisée</span>
    </div>

    <!-- Modal de succès -->
    <Teleport to="body" v-if="success">
      <ModalSuccessPassword />
    </Teleport>
  </form>
</template>

<script lang="ts" setup>
import ModalSuccessPassword from '@/components/modal/ModalSuccessPassword.vue';
import { Icon } from '@iconify/vue';
import axios from 'axios'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
const success = ref<boolean>(false);
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const routes = useRoute();
const errorServer = ref<string>('')

// Vérification de la force du mot de passe
const passwordStrength = computed(() => {
  if (!newPassword.value) return 0
  let strength = 0
  if (newPassword.value.length >= 8) strength++
  if (newPassword.value.match(/[A-Z]/)) strength++
  if (newPassword.value.match(/[0-9]/)) strength++
  if (newPassword.value.match(/[^A-Za-z0-9]/)) strength++
  return strength
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return 'Très faible'
  if (strength === 1) return 'Faible'
  if (strength === 2) return 'Moyen'
  if (strength === 3) return 'Fort'
  return 'Très fort'
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value
  if (strength <= 1) return 'weak'
  if (strength <= 3) return 'medium'
  return 'strong'
})

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value
})

const isFormValid = computed(() => {
  return newPassword.value &&
    confirmPassword.value &&
    passwordsMatch.value &&
    passwordStrength.value >= 2 &&
    routes.query.tkn
})

const handleReset = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    const tkn = routes.query.tkn;
    const response = await axios.patch(`/api/v1/auth/reinitialise-password/${tkn}`, { password: newPassword.value });
    if (response) {
      success.value = true
    }
  } catch (e) {
    errorServer.value = axios.isAxiosError(e) && e.response ? e.response.data: 'Une erreur est survenue. Veuillez réessayer plus tard.'
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
  background: linear-gradient(135deg, rgba(48, 168, 85, 0.15) 0%, rgba(48, 168, 85, 0.05) 100%);
  border-radius: 16px;
  margin-bottom: 1rem;
  border: 1px solid rgba(48, 168, 85, 0.2);
}

.header-icon svg {
  font-size: 1.75rem;
  color: var(--secondary-color);
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
  padding: 1rem 3rem 1rem 3.25rem;
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

.form-group.has-error .input-field:focus~.floating-label,
.form-group.has-error .input-field:not(:placeholder-shown)~.floating-label {
  color: var(--error);
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

/* Toggle mot de passe */
.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tertiary-color);
  transition: all 0.2s ease;
  border-radius: 8px;
  z-index: 2;
}

.password-toggle:hover {
  color: var(--primary-color);
  background: rgba(80, 134, 193, 0.08);
}

.password-toggle svg {
  font-size: 1.25rem;
}

/* Indicateur de force du mot de passe */
.password-strength-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
  padding: 0 0.25rem;
}

.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.strength-bar {
  height: 4px;
  flex: 1;
  background: var(--gray-lighter);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.active.weak {
  background: #e74c3c;
}

.strength-bar.active.medium {
  background: #f39c12;
}

.strength-bar.active.strong {
  background: #27ae60;
}

.strength-bar.active.very-strong {
  background: #2ecc71;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.strength-text.weak {
  color: #e74c3c;
}

.strength-text.medium {
  color: #f39c12;
}

.strength-text.strong {
  color: #27ae60;
}

/* Critères du mot de passe */
.password-criteria {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(80, 134, 193, 0.03);
  border-radius: 10px;
  border: 1px solid rgba(80, 134, 193, 0.08);
}

.criteria-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--tertiary-color);
  transition: all 0.2s ease;
}

.criteria-item svg {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.criteria-item.valid {
  color: var(--secondary-color);
}

.criteria-item.valid svg {
  color: var(--secondary-color);
}

/* Indicateur de correspondance */
.match-indicator {
  margin-top: 0.5rem;
}

.match-success,
.match-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.match-success {
  color: var(--secondary-color);
  background: rgba(48, 168, 85, 0.08);
}

.match-error {
  color: var(--error);
  background: rgba(235, 77, 75, 0.08);
}

.match-success svg,
.match-error svg {
  font-size: 1rem;
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
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-light) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(48, 168, 85, 0.3);
  overflow: hidden;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(48, 168, 85, 0.4);
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
  background: rgba(48, 168, 85, 0.05);
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--tertiary-dark);
  border: 1px solid rgba(48, 168, 85, 0.1);
}

.security-info svg {
  font-size: 0.875rem;
  color: var(--secondary-color);
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

  .password-criteria {
    grid-template-columns: 1fr;
  }
}
</style>
