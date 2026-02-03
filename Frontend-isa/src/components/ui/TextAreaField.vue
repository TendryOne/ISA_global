<template>
  <div class="form-group" :class="{ 'has-error': error, 'floating': floating, 'is-disabled': disabled }">
    <label v-if="!floating && label" :for="name" class="static-label">
      {{ label }}
    </label>
    <Field :id="name" :name="name" as="textarea" :value="modelValue" :rules="rules"
      :placeholder="floating ? ' ' : placeholder" :disabled="disabled" class="form-textarea" />
    <label v-if="floating && label" :for="name" class="floating-label">
      {{ label }}
    </label>

    <div class="input-border"></div>

    <ErrorMessage :name="name" class="error-message" />

    <div v-if="icon" class="input-icon">
      <Icon :icon="icon" width="20" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  name: string;
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  rules?: string | Record<string, unknown>;
  floating?: boolean;
  icon?: string;
  error?: boolean;
  disabled?: boolean;
  rows?: number;
}>();
</script>

<style scoped>
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--white);
  min-height: 100px;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
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

.form-textarea:focus+.floating-label,
.form-textarea:not(:placeholder-shown)+.floating-label {
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
.has-error .form-textarea {
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
  bottom: -1.25rem;
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

.form-textarea:focus~.input-border {
  width: 100%;
}

.input-icon {
  position: absolute;
  right: 1rem;
  top: 1.5rem;
  color: var(--tertiary-dark);
  pointer-events: none;
}

/* Disabled state */
.is-disabled .form-textarea {
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
</style>
