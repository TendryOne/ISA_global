<template>
  <div class="security-section">
    <div class="section-header">
      <h2>
        <Icon icon="mdi:shield-lock" /> Sécurité du compte
      </h2>
    </div>

    <div class="section-content">
      <!-- Mot de passe -->
      <div class="security-group">
        <div class="group-header">
          <Icon icon="mdi:lock" />
          <h3>Mot de passe</h3>
        </div>
        <div class="security-card">
          <div class="security-item">
            <div class="item-info">
              <Icon icon="mdi:key" class="item-icon" />
              <div class="item-text">
                <h4>Mot de passe actuel</h4>
                <p>derniere modification : {{ user.configs.lastPasswordChange ?
                  new Date(user.configs.lastPasswordChange).toLocaleDateString() : 'Jamais' }}</p>
              </div>
            </div>
            <div class="item-value">
              <span class="password-dots">••••••••••••</span>
              <ActionButton variant="primary" size="small" @click="openPasswordModal" icon="mdi:pencil">
                Modifier
              </ActionButton>
            </div>
          </div>
        </div>
      </div>



    </div>

    <!-- Modal de changement de mot de passe -->
    <Transition name="modal">
      <div v-if="showPasswordModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <Form @submit="updatePassword" :validation-schema="passwordSchema" v-slot="{ errors, meta }" :key="formKey">
            <div class="modal-card">
              <div class="modal-header">
                <div class="modal-icon">
                  <Icon icon="mdi:lock-reset" />
                </div>
                <h3>Modification du mot de passe</h3>
                <button type="button" class="modal-close" @click="closeModal">
                  <Icon icon="mdi:close" />
                </button>
              </div>

              <div class="modal-body">
                <div class="password-form">
                  <!-- Ancien mot de passe -->
                  <div class="form-group">
                    <label>Ancien mot de passe</label>
                    <div class="input-wrapper">
                      <Icon icon="mdi:lock-outline" class="input-icon" />
                      <Field name="oldPassword" v-slot="{ field, meta: fieldMeta }">
                        <input v-bind="field" :type="showOldPassword ? 'text' : 'password'" class="form-input"
                          :class="{ 'has-error': fieldMeta.touched && errors.oldPassword }"
                          placeholder="Entrez votre ancien mot de passe" />
                      </Field>
                      <button type="button" class="toggle-password" @click="showOldPassword = !showOldPassword">
                        <Icon :icon="showOldPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                      </button>
                    </div>
                    <span class="error-text" v-if="errors.oldPassword">{{ errors.oldPassword }}</span>
                  </div>

                  <!-- Nouveau mot de passe -->
                  <div class="form-group">
                    <label>Nouveau mot de passe</label>
                    <div class="input-wrapper">
                      <Icon icon="mdi:lock-plus-outline" class="input-icon" />
                      <Field name="password" v-slot="{ field, meta: fieldMeta }">
                        <input v-bind="field" :type="showNewPassword ? 'text' : 'password'" class="form-input"
                          :class="{ 'has-error': fieldMeta.touched && errors.newPassword }"
                          placeholder="Entrez votre nouveau mot de passe" v-model="newPasswordValue" />
                      </Field>
                      <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
                        <Icon :icon="showNewPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                      </button>
                    </div>

                    <!-- Indicateur de force -->
                    <div class="password-strength" v-if="newPasswordValue">
                      <div class="strength-meter">
                        <div class="strength-bar" :class="passwordStrengthClass" :style="{ width: strengthWidth }">
                        </div>
                      </div>
                      <span class="strength-text" :class="passwordStrengthClass">{{ passwordStrengthText }}</span>
                    </div>
                    <span class="error-text" v-if="errors.newPassword">{{ errors.newPassword }}</span>
                  </div>

                  <!-- Confirmation -->
                  <div class="form-group">
                    <label>Confirmation</label>
                    <div class="input-wrapper">
                      <Icon icon="mdi:lock-check-outline" class="input-icon" />
                      <Field name="confirmPassword" v-slot="{ field, meta: fieldMeta }">
                        <input v-bind="field" :type="showConfirmPassword ? 'text' : 'password'" class="form-input"
                          :class="{ 'has-error': fieldMeta.touched && errors.confirmPassword }"
                          placeholder="Confirmez votre nouveau mot de passe" />
                      </Field>
                      <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                        <Icon :icon="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" />
                      </button>
                    </div>
                    <span class="error-text" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
                  </div>
                </div>

                <!-- Exigences de sécurité -->
                <div class="password-requirements">
                  <h4>Exigences de sécurité :</h4>
                  <ul>
                    <li :class="{ 'valid': hasMinLength }">
                      <Icon :icon="hasMinLength ? 'mdi:check-circle' : 'mdi:circle-outline'" />
                      Minimum 8 caractères
                    </li>
                    <li :class="{ 'valid': hasUppercase }">
                      <Icon :icon="hasUppercase ? 'mdi:check-circle' : 'mdi:circle-outline'" />
                      Au moins une majuscule
                    </li>
                    <li :class="{ 'valid': hasNumber }">
                      <Icon :icon="hasNumber ? 'mdi:check-circle' : 'mdi:circle-outline'" />
                      Au moins un chiffre
                    </li>
                  </ul>
                </div>
              </div>

              <div class="modal-footer">
                <ActionButton variant="outline" outline-color="prim" @click="closeModal" type="button">
                  Annuler
                </ActionButton>
                <ActionButton variant="primary" type="submit" :disabled="isSubmitting || !meta.valid">
                  <template v-if="isSubmitting">
                    <Icon icon="mdi:loading" class="spin" />
                    En cours...
                  </template>
                  <template v-else>
                    Mettre à jour
                  </template>
                </ActionButton>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </Transition>

    <SuccessToast v-if="toast.show" :title="toast.title" :message="toast.message" :type="toast.type"
      @dismissed="toast.show = false" />
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';
import { Form, Field } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';

import ActionButton from '@/components/ui/ActionButton.vue';
import SuccessToast from '@/components/toast/successToast.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import axios from 'axios';
import { useMyUserStore } from '@/stores/userStore';
import type UserInterface from '@/interfaces/user.interfaces';
import { PostEventLog } from '@/utils/eventLog';

const user = useMyUserStore().currentUser as UserInterface


const showPasswordModal = ref(false);
const isSubmitting = ref(false);
const formKey = ref(0);

// Password visibility toggles
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password value for strength calculation
const newPasswordValue = ref('');

// Toast
const toast = ref<ToastInterface>({
  show: false,
  message: '',
  type: 'success',
  title: ''
});

// Validation schema
const passwordSchema = toTypedSchema(z.object({
  oldPassword: z.string({ required_error: 'Ce champ est requis' }).min(1, 'Ce champ est requis'),
  password: z.string({ required_error: 'Ce champ est requis' })
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
  confirmPassword: z.string({ required_error: 'Ce champ est requis' })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
}));

// Password strength indicators
const hasMinLength = computed(() => newPasswordValue.value.length >= 8);
const hasUppercase = computed(() => /[A-Z]/.test(newPasswordValue.value));
const hasNumber = computed(() => /[0-9]/.test(newPasswordValue.value));


const passwordStrength = computed(() => {
  let score = 0;
  if (newPasswordValue.value.length > 0) score += 1;
  if (hasMinLength.value) score += 1;
  if (hasUppercase.value) score += 1;
  if (hasNumber.value) score += 1;
  return score;
});

const passwordStrengthClass = computed(() => {
  if (passwordStrength.value <= 2) return 'weak';
  if (passwordStrength.value <= 4) return 'medium';
  return 'strong';
});

const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 2) return 'Faible';
  if (passwordStrength.value <= 4) return 'Moyen';
  return 'Fort';
});

const strengthWidth = computed(() => `${(passwordStrength.value / 5) * 100}%`);

// Modal functions
const openPasswordModal = () => {
  showPasswordModal.value = true;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  showPasswordModal.value = false;
  formKey.value++;
  newPasswordValue.value = '';
  showOldPassword.value = false;
  showNewPassword.value = false;
  showConfirmPassword.value = false;
  document.body.style.overflow = '';
};

// Form submission
const updatePassword = async (values: any) => {
  isSubmitting.value = true;

  try {

    await axios.patch("/api/v1/user/update-password", {
      oldPassword: values.oldPassword,
      password: values.password
    });

    toast.value = {
      show: true,
      message: 'Votre mot de passe a été mis à jour avec succès.',
      type: 'success',
      title: 'Mot de passe modifié'
    };

    if (useMyUserStore().currentUser!.role === 'professor') {
      PostEventLog({
        entityId: useMyUserStore().currentUser!._id!,
        entityType: "user",
        eventType: "PROFESSOR_PASSWORD_CHANGED",
        timestamp: new Date(),
        userId: useMyUserStore().currentUser!._id,
      })
    } else if (useMyUserStore().currentUser!.role === 'student') {
      PostEventLog({
        entityId: useMyUserStore().currentUser!._id!,
        entityType: "user",
        eventType: "STUDENT_PASSWORD_CHANGED",
        timestamp: new Date(),
        userId: useMyUserStore().currentUser!._id,
      })
    }

    closeModal();
  } catch (error) {
    toast.value = {
      show: true,
      message: error.response?.data || "Une erreur est survenue lors de la mise à jour du mot de passe.",
      type: 'error',
      title: 'Erreur'
    };
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.security-section {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(var(--secondary-rgb), 0.05));
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-dark);
}

.section-content {
  padding: 1.5rem;
}

.security-group {
  margin-bottom: 1.5rem;
}

.security-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.group-header svg {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.group-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0;
}

.security-card {
  background: var(--tertiary-extra-light);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.security-item,
.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: var(--radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.item-info,
.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-icon,
.session-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.item-text h4,
.session-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-darker);
}

.item-text p,
.session-text p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--gray-dark);
}

.item-value {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.password-dots {
  font-family: monospace;
  letter-spacing: 2px;
  color: var(--gray-dark);
}

.session-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 500;
}

.session-badge.current {
  background: var(--success-extra-light);
  color: var(--success-dark);
}

/* Modal styles */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  width: 100%;
  max-width: 500px;
}

.modal-card {
  background: white;
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-dark);
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  flex: 1;
}

.modal-icon {
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon svg {
  font-size: 1.25rem;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 1.5rem;
}

.password-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--gray-darker);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray-light);
  font-size: 1.125rem;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 2.75rem 0.875rem 2.75rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.form-input.has-error {
  border-color: var(--error);
}

.form-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(235, 77, 75, 0.2);
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--gray-light);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: var(--gray-dark);
}

.error-text {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8rem;
  color: var(--error);
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.strength-meter {
  flex: 1;
  height: 4px;
  background: var(--gray-lighter);
  border-radius: 2px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.strength-bar.weak {
  background: var(--error);
}

.strength-bar.medium {
  background: var(--warning);
}

.strength-bar.strong {
  background: var(--success);
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-text.weak {
  color: var(--error);
}

.strength-text.medium {
  color: var(--warning-dark);
}

.strength-text.strong {
  color: var(--success-dark);
}

.password-requirements {
  background: var(--tertiary-extra-light);
  padding: 1rem;
  border-radius: var(--radius);
}

.password-requirements h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-darker);
}

.password-requirements ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.password-requirements li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  color: var(--gray-dark);
  transition: color 0.2s ease;
}

.password-requirements li:last-child {
  margin-bottom: 0;
}

.password-requirements li.valid {
  color: var(--success-dark);
}

.password-requirements li svg {
  font-size: 1rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-super-light);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {

  .security-item,
  .session-item {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .item-value {
    width: 100%;
    justify-content: space-between;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer>* {
    width: 100%;
  }
}
</style>
