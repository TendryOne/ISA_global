<template>
  <Form v-slot="{ errors, values }" @submit="handleLogin" class="auth-form" :validation-schema="validationSchema">
    <!-- Titre de bienvenue -->
    <div class="welcome-section">
      <h2 class="welcome-title">Bienvenue</h2>
      <p class="welcome-subtitle">Connectez-vous pour accéder à votre espace académique</p>
    </div>

    <!-- Champ Identifiant -->
    <div class="form-group" :class="{ 'has-error': errors.matricule, 'has-value': values.matricule }">
      <div class="input-wrapper">
        <div class="input-icon-container">
          <Icon icon="ph:identification-card-duotone" class="input-icon" />
        </div>
        <Field id="studentId" type="text" placeholder=" " required class="input-field" name="matricule"
          @keypress="(e) => limitInput(e, 10)" />
        <label for="studentId" class="floating-label">Identifiant universitaire</label>
        <div class="input-highlight"></div>
      </div>
      <span class="input-hint">Format : ISA-000000</span>
      <div class="error-message" v-if="errors.matricule">
        <Icon icon="ph:warning-circle-fill" />
        <ErrorMessage name="matricule" />
      </div>
    </div>

    <!-- Champ Mot de passe -->
    <div class="form-group" :class="{ 'has-error': errors.password || serverError }">
      <div class="input-wrapper">
        <div class="input-icon-container">
          <Icon icon="ph:lock-key-duotone" class="input-icon" />
        </div>
        <Field id="password" name="password" :type="showPassword ? 'text' : 'password'" required class="input-field"
          placeholder=" " />
        <label for="password" class="floating-label">Mot de passe</label>
        <button type="button" @click="showPassword = !showPassword" class="password-toggle"
          :aria-label="showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'">
          <Icon :icon="showPassword ? 'ph:eye-slash-duotone' : 'ph:eye-duotone'" />
        </button>
        <div class="input-highlight"></div>
      </div>
      <div class="error-message" v-if="errors.password">
        <Icon icon="ph:warning-circle-fill" />
        <ErrorMessage name="password" />
      </div>
      <div class="error-message server-error" v-if="serverError && Object.keys(errors).length === 0">
        <Icon icon="ph:x-circle-fill" />
        <span>{{ serverError }}</span>
      </div>
    </div>

    <!-- Options -->
    <div class="form-options">
      <RouterLink to="/forgot-password" class="forgot-password">
        <Icon icon="ph:key-duotone" class="forgot-icon" />
        <span>Mot de passe oublié ?</span>
      </RouterLink>
    </div>

    <!-- Bouton de soumission -->
    <button type="submit" class="submit-btn" :disabled="isLoading" :class="{ 'is-loading': isLoading }">
      <span class="btn-content" v-if="!isLoading">
        <span class="btn-text">Se connecter</span>
        <Icon icon="ph:sign-in-bold" class="btn-icon" />
      </span>
      <span v-else class="loading-content">
        <span class="loading-spinner"></span>
        <span>Connexion en cours...</span>
      </span>
      <div class="btn-shine"></div>
    </button>

    <!-- Séparateur -->

  </Form>
</template>

<script lang="ts" setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Icon } from '@iconify/vue'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useMyUserStore } from '@/stores/userStore'
import limitInput from '@/utils/limitInput'

const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref<string>('')


const validationSchema = toTypedSchema(z.object({
  matricule: z.string({ required_error: 'Ce champ ne peut pas être vide', invalid_type_error: 'ce champ ne peut pas être vide' }).nonempty({ message: 'ce champ ne peut pas être vide' }),
  password: z.string({ required_error: 'Ce champ ne peut pas être vide', invalid_type_error: 'ce champ ne peut pas être vide' }).nonempty({ message: 'ce champ ne peut pas être vide' }),
}))
const router = useRouter()

const handleLogin = async (values) => {
  isLoading.value = true
  serverError.value = ''
  try {
    await useMyUserStore().Login(values)
    // La socket sera connectée automatiquement par MainLayout
    router.push('/student')
  } catch (e: any) {

    serverError.value = e.response.data as string

  }
  finally {
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

/* Section de bienvenue */
.welcome-section {
  text-align: center;
  margin-bottom: 0.5rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.375rem;
  letter-spacing: -0.3px;
}

.welcome-subtitle {
  font-size: 0.875rem;
  color: var(--tertiary-dark);
  line-height: 1.5;
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

.form-group:focus-within .input-icon,
.form-group.has-value .input-icon {
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

.form-group.has-error .floating-label {
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

/* Hint */
.input-hint {
  display: block;
  font-size: 0.7rem;
  color: var(--tertiary-light);
  margin-top: 0.375rem;
  margin-left: 0.5rem;
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
  color: var(--tertiary-color);
  transition: all 0.2s ease;
  border-radius: 8px;
  z-index: 2;
}

.password-toggle:hover {
  color: var(--primary-color);
  background: rgba(80, 134, 193, 0.1);
}

/* Messages d'erreur */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  margin-left: 0.5rem;
  color: var(--error);
  font-size: 0.8rem;
  font-weight: 500;
  animation: errorShake 0.4s ease;
}

.error-message svg {
  font-size: 1rem;
  flex-shrink: 0;
}

.server-error {
  color: var(--error-dark);
  background: rgba(235, 77, 75, 0.08);
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  margin-left: 0;
  border-left: 3px solid var(--error);
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

/* Options */
.form-options {
  display: flex;
  justify-content: flex-end;
  margin-top: -0.5rem;
}

.forgot-password {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  padding: 0.375rem 0.625rem;
  border-radius: 8px;
}

.forgot-password:hover {
  background: rgba(80, 134, 193, 0.08);
  color: var(--primary-dark);
}

.forgot-icon {
  font-size: 1rem;
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
  margin-top: 0.5rem;
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
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.submit-btn:hover .btn-icon {
  transform: translateX(3px);
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

/* Notice sécurisé */
.secure-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(48, 168, 85, 0.08) 0%, rgba(48, 168, 85, 0.03) 100%);
  border-radius: 10px;
  font-size: 0.75rem;
  color: var(--secondary-dark);
  font-weight: 500;
  border: 1px solid rgba(48, 168, 85, 0.15);
}

.secure-icon {
  font-size: 1rem;
  color: var(--secondary-color);
}

/* Responsive */
@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.3rem;
  }

  .welcome-subtitle {
    font-size: 0.8rem;
  }

  .input-field {
    padding: 0.875rem 1rem 0.875rem 3rem;
    font-size: 16px;
    /* Évite le zoom sur iOS */
  }

  .floating-label {
    font-size: 0.875rem;
  }

  .submit-btn {
    padding: 0.875rem 1.25rem;
  }
}
</style>
