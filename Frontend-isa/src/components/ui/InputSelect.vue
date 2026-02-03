<template>
  <div class="form-group" :class="{ 'has-error': error, 'floating': floating }">
    <label v-if="!floating && label" :for="name" class="static-label">
      {{ label }}
    </label>
    <Field :id="name" :name="name" as="select" :rules="rules" class="form-select" :disabled="disabled">
      <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled">
        {{ option.label }}
      </option>
    </Field>

    <label v-if="floating && label" :for="name" class="floating-label">
      {{ label }}
    </label>

    <div class="input-border"></div>
    <div class="select-arrow">
      <Icon icon="mdi:chevron-down" width="20" />
    </div>

    <ErrorMessage :name="name" class="error-message" />
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';
import { Icon } from '@iconify/vue';


interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

const props = defineProps<{
  name: string;
  label?: string;
  placeholder?: string;
  rules?: string | Record<string, unknown>;
  floating?: boolean;
  options: SelectOption[];
  error?: boolean
  disabled?: boolean;
}>()






</script>

<style scoped>
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-select {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--white);
  appearance: none;
  cursor: pointer;
}

/* Floating label style */
.floating-label {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: var(--tertiary-dark);
  transition: all 0.3s ease;
  pointer-events: none;
  font-size: 1rem;
  background-color: var(--white);
  padding: 0 0.25rem;
  transform-origin: left center;
}

.form-select:focus+.floating-label,
.form-select:not([value=""])+.floating-label {
  transform: translateY(-1.75rem) scale(0.85);
  color: var(--primary-color);
}

/* Static label style */
.static-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--tertiary-dark);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Error state */
.has-error .form-select {
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
  /* décale le message un peu plus bas */
  left: 0;
  color: var(--error);
  font-size: 0.75rem;
  line-height: 1.2;
  margin-top: 0.25rem;
  /* espace supplémentaire si nécessaire */
  white-space: normal;
  /* pour que le texte puisse aller à la ligne si long */
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

.form-select:focus~.input-border {
  width: 100%;
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--tertiary-dark);
  pointer-events: none;
}

/* Style pour les options */
.form-select option {
  padding: 0.5rem;
}

.form-select option:disabled {
  color: var(--gray-light);
}
</style>
