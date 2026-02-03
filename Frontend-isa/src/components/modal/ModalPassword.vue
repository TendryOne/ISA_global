<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-icon">
          <Icon icon="mdi:form-textbox-password" width="24" height="24" />
        </div>
        <h2 class="modal-title">Sécurité du compte</h2>
        <p style="font-size: small; font-style: italic">
          Changez le mot de passe par défaut de votre compte (obligatoire)
        </p>
      </div>

      <Form @submit="handleSubmit" :validation-schema="validationSchema" class="modal-form"
        v-slot="{ values, errors, isSubmitting }">
        <div class="modal-content">
          <div class="form-fields">
            <div class="form-group">
              <InputField name="password" label="Nouveau mot de passe" type="password" floating
                icon="mdi:form-textbox-password" :error="!!errors.password" size="small" />
              <div class="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" :class="{
                    weak: values.password && values.password.length < 8,
                    medium:
                      values.password &&
                      values.password.length >= 8 &&
                      (!values.password.match(/[A-Z]/) ||
                        !values.password.match(/[a-z]/) ||
                        !values.password.match(/[0-9]/)),
                    strong:
                      values.password &&
                      values.password.length >= 8 &&
                      values.password.match(/[A-Z]/) &&
                      values.password.match(/[a-z]/) &&
                      values.password.match(/[0-9]/),
                  }"></div>
                </div>
                <span class="strength-text" :class="{
                  strong:
                    values.password &&
                    values.password.length >= 8 &&
                    values.password.match(/[A-Z]/) &&
                    values.password.match(/[a-z]/) &&
                    values.password.match(/[0-9]/),
                }">{{
                  values.password &&
                    values.password.length >= 8 &&
                    values.password.match(/[A-Z]/) &&
                    values.password.match(/[a-z]/) &&
                    values.password.match(/[0-9]/)
                    ? 'Fort'
                    : values.password && values.password.length >= 8
                      ? 'Moyen'
                      : 'Faible'
                }}</span>
              </div>
            </div>

            <div class="form-group">
              <InputField name="confirmPassword" label="Confirmer le mot de passe" type="password" floating
                :error="!!errors.confirmPassword" size="small" />
            </div>
          </div>

          <div class="password-requirements">
            <h4>Exigences de sécurité :</h4>
            <ul>
              <li :class="{ met: values.password && values.password.length >= 8 }">
                <span class="requirement-icon">{{
                  values.password && values.password.length >= 8 ? '✓' : '●'
                }}</span>
                Au moins 8 caractères
              </li>
              <li :class="{ met: values.password && values.password.match(/[A-Z]/) }">
                <span class="requirement-icon">{{
                  values.password && values.password.match(/[A-Z]/) ? '✓' : '●'
                }}</span>
                Une lettre majuscule
              </li>
              <li :class="{ met: values.password && values.password.match(/[a-z]/) }">
                <span class="requirement-icon">{{
                  values.password && values.password.match(/[a-z]/) ? '✓' : '●'
                }}</span>
                Une lettre minuscule
              </li>
              <li :class="{ met: values.password && values.password.match(/[0-9]/) }">
                <span class="requirement-icon">{{
                  values.password && values.password.match(/[0-9]/) ? '✓' : '●'
                }}</span>
                Un chiffre
              </li>
            </ul>
          </div>
        </div>
        <div class="modal-footer">
          <div class="form-actions">
            <ActionButton type="submit" class="submit-button" icon="ph:check-circle" iconPosition="right"
              :disabled="isSubmitting">
              <span>Changer le mot de passe</span>
            </ActionButton>
          </div>
        </div>
      </Form>
    </div>
    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />
  </div>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate'
import InputField from '../ui/InputField.vue'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import ActionButton from '../ui/ActionButton.vue'
import { Icon } from '@iconify/vue'
import SuccessToast from '../toast/successToast.vue'
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { useMyUserStore } from '@/stores/userStore'

const toast = ref<{ show: boolean; message: string; title: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  title: '',
  type: 'success',
})

const emit = defineEmits<{
  close: []
}>()

const validationSchema = toTypedSchema(
  z
    .object({
      password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
      confirmPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    }),
)

const handleSubmit = async (values: Record<string, unknown>) => {
  try {
    await useMyUserStore().updateUserDefaultPassword({ password: values.password })
    toast.value = {
      show: true,
      message: 'Votre mot de passe a été changé avec succès.',
      title: 'Succès',
      type: 'success',
    }
  } catch (error) {
    toast.value = {
      show: true,
      message: ((error as AxiosError).response?.data as string) || 'Une erreur est survenue',
      title: 'Erreur',
      type: 'error',
    }
  }
}
</script>

<style scoped>
/* Modal adapté à 100vh avec design clair */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 1);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 2rem);
  position: relative;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

/* Header du modal */
.modal-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--background-light);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--rounded);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--white);
  box-shadow: var(--shadow-md);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Contenu principal */
.modal-content {
  padding: 2rem;
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 45vh;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-light);
  background: var(--background-light);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-xs);
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

/* Indicateur de force du mot de passe */
.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 2rem;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--gray-lighter);
  border-radius: var(--radius);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--radius);
  transition: all 0.3s ease;
  width: 0%;
}

.strength-fill.weak {
  background: var(--error);
  width: 33%;
}

.strength-fill.medium {
  background: var(--warning);
  width: 66%;
}

.strength-fill.strong {
  background: var(--success);
  width: 100%;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 50px;
  text-align: right;
}

.strength-text.strong {
  color: var(--success-dark);
}

/* Section des exigences */
.password-requirements {
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  border: 1px solid var(--border-secondary);
}

.password-requirements h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-requirements h4::before {
  content: '🔐';
  font-size: 1rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.password-requirements li {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius);
  background: var(--white);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.requirement-icon {
  font-size: 0.7rem;
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.password-requirements li.met {
  color: var(--success-dark);
  background: rgba(var(--success-rgb), 0.1);
  border-color: rgba(var(--success-rgb), 0.2);
}

.password-requirements li.met .requirement-icon {
  color: var(--success);
}

/* Actions du formulaire */
.form-actions {
  margin-top: 0.25rem;
}

.submit-button {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  width: 100%;
  cursor: pointer;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Bouton de fermeture */
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: var(--rounded);
  background: var(--gray-super-light);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-button:hover {
  background: rgba(var(--error-rgb), 0.1);
  color: var(--error);
  transform: scale(1.05);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive pour mobile */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 1rem;
  }

  .modal-container {
    max-height: calc(100vh - 1rem);
  }

  .modal-header {
    padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.375rem;
  }

  .modal-subtitle {
    font-size: 0.9rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .password-requirements ul {
    grid-template-columns: 1fr;
    gap: 0.4rem;
  }

  .close-button {
    width: 32px;
    height: 32px;
    top: 0.75rem;
    right: 0.75rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    border-radius: var(--radius-lg);
  }

  .modal-header {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    padding: 1.25rem 1.25rem 1rem 1.25rem;
  }

  .modal-content {
    padding: 1.25rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .header-icon {
    width: 44px;
    height: 44px;
  }

  .password-requirements {
    padding: 1rem;
  }

  .password-requirements li {
    font-size: 0.75rem;
    padding: 0.35rem 0.5rem;
  }

  .submit-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.85rem;
  }
}

/* Mode hauteur réduite */
@media (max-height: 600px) {
  .modal-header {
    padding: 1.25rem 2rem 1rem 2rem;
  }

  .modal-content {
    padding: 1.5rem 2rem;
  }

  .modal-form {
    gap: 1.25rem;
  }

  .form-fields {
    gap: 1rem;
  }

  .header-icon {
    width: 44px;
    height: 44px;
    margin-bottom: 0.75rem;
  }

  .modal-title {
    font-size: 1.375rem;
    margin-bottom: 0.25rem;
  }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {

  .modal-overlay,
  .modal-container,
  .submit-button,
  .close-button,
  .password-requirements li,
  .strength-fill {
    animation: none;
    transition: none;
  }
}
</style>
