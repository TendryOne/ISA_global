<template>
  <div class="form-group" :class="{
    'has-error': error,
    'floating': floating,
    'is-disabled': disabled,
    [`size-${size}`]: size
  }">
    <label v-if="!floating && label" :for="name" class="static-label">
      {{ label }}
    </label>
    <Field :id="name" :name="name" :type="actualType" :value="modelValue" :rules="rules"
      :placeholder="floating ? ' ' : placeholder" :disabled="disabled" class="form-input" :as="as" />
    <label v-if="floating && label" :for="name" class="floating-label">
      {{ label }}
    </label>

    <div class="input-border"></div>

    <ErrorMessage :name="name" class="error-message" />

    <!-- Icon générique ou toggle password -->
    <div v-if="icon || type === 'password'" class="input-icon">
      <button v-if="type === 'password'" type="button" @click="togglePasswordVisibility" class="password-toggle"
        :aria-label="showPassword ? 'Cacher le mot de passe' : 'Montrer le mot de passe'">
        <Icon :icon="showPassword ? 'mdi:eye-off' : 'mdi:eye'" width="20" />
      </button>
      <Icon v-else-if="icon" :icon="icon" width="20" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';
import { Icon } from '@iconify/vue';
import { ref, computed } from 'vue';

interface Props {
  name: string;
  modelValue?: string | number;
  type?: string;
  label?: string;
  placeholder?: string;
  rules?: string | Record<string, unknown>;
  floating?: boolean;
  icon?: string;
  error?: boolean;
  disabled?: boolean;
  as?: string;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium'
});

// État pour l'affichage du mot de passe
const showPassword = ref(false);

// Type dynamique pour les champs password
const actualType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password';
  }
  return props.type;
});

// Fonction pour basculer la visibilité du mot de passe
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<style scoped>
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

/* Tailles des inputs */
.form-input {
  width: 100%;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--white);
  padding: 1rem;
  /* taille par défaut (medium) */
}

/* Tailles spécifiques */
.size-small .form-input {
  padding: 0.75rem;
  font-size: 0.875rem;
}

.size-medium .form-input {
  padding: 1rem;
  font-size: 1rem;
}

.size-large .form-input {
  padding: 1.25rem;
  font-size: 1.125rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Floating label style */
.floating-label {
  position: absolute;
  color: var(--tertiary-dark);
  transition: all 0.3s ease;
  pointer-events: none;
  background-color: var(--white);
  padding: 0 0.25rem;
  transform-origin: left center;
}

/* Ajustements du floating label selon la taille */
.size-small .floating-label {
  top: 0.75rem;
  left: 0.75rem;
  font-size: 0.875rem;
}

.size-medium .floating-label {
  top: 1rem;
  left: 1rem;
  font-size: 1rem;
}

.size-large .floating-label {
  top: 1.25rem;
  left: 1.25rem;
  font-size: 1.125rem;
}

.form-input:focus+.floating-label,
.form-input:not(:placeholder-shown)+.floating-label {
  transform: translateY(-1.75rem) scale(0.85);
  color: var(--primary-color);
}

/* Static label style */
.static-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--tertiary-dark);
  font-weight: 500;
}

.size-small .static-label {
  font-size: 0.8rem;
}

.size-medium .static-label {
  font-size: 0.9rem;
}

.size-large .static-label {
  font-size: 1rem;
}

/* Error state */
.has-error .form-input {
  border-color: var(--error);
}

.has-error .input-border {
  background-color: var(--error);
}

.has-error .floating-label,
.has-error .static-label {
  color: var(--error);
}

.error-message {
  position: absolute;
  bottom: -2rem;
  left: 0;
  color: var(--error);
  font-size: 0.75rem;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.form-input:focus~.input-border {
  width: 100%;
}

.input-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--tertiary-dark);
  pointer-events: none;
}

/* Positionnement de l'icône selon la taille */
.size-small .input-icon {
  right: 0.75rem;
}

.size-medium .input-icon {
  right: 1rem;
}

.size-large .input-icon {
  right: 1.25rem;
}

/* Bouton toggle password */
.password-toggle {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.25rem;
  border-radius: var(--radius);
  transition: all 0.3s ease;
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.password-toggle:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Icône normale (non interactive) */
.input-icon:not(:has(.password-toggle)) {
  pointer-events: none;
}

/* Disabled state */
.is-disabled .form-input {
  background-color: var(--tertiary-extra-light);
  cursor: not-allowed;
  opacity: 0.7;
}

.is-disabled .floating-label,
.is-disabled .static-label,
.is-disabled .input-icon {
  opacity: 0.7;
  cursor: not-allowed;
}

.is-disabled .password-toggle {
  cursor: not-allowed;
  opacity: 0.5;
}

/* For select inputs */
.form-input[type="select"] {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.size-small .form-input[type="select"] {
  background-position: right 0.75rem center;
  background-size: 0.875rem;
}

.size-large .form-input[type="select"] {
  background-position: right 1.25rem center;
  background-size: 1.25rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .size-large .form-input {
    padding: 1rem;
    font-size: 1rem;
  }

  .size-large .floating-label {
    top: 1rem;
    left: 1rem;
    font-size: 1rem;
  }

  .size-large .input-icon {
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .form-group {
    margin-bottom: 1.25rem;
  }

  .error-message {
    bottom: -1.75rem;
    font-size: 0.7rem;
  }
}
</style>
