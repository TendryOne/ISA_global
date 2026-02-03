<template>
  <div class="toggle-group" :class="{ 'has-error': error, 'is-disabled': disabled }">
    <label v-if="label" :for="name" class="toggle-label">
      {{ label }}
    </label>

    <div class="toggle-wrapper">
      <Field :id="name" :name="name" type="checkbox" :value="true" :rules="rules" :disabled="disabled"
        class="toggle-input" :as="as" :uncheckedValue="false" />
      <label :for="name" class="toggle-switch"></label>
    </div>

    <div class="toggle-border"></div>

    <ErrorMessage :name="name" class="error-message" />

    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';


// Définition des props
interface Props {
  modelValue?: boolean
  name: string
  label?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
  rules?: string | Record<string, unknown>
  as?: string
  error: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  label: '',
  helpText: '',
  disabled: false,
  required: false,
  rules: '',
  as: 'input'
})


</script>

<style scoped>
.toggle-group {
  position: relative;
  margin-bottom: 1.5rem;
  width: 100%;
}

.toggle-label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
  font-size: 0.95rem;
  font-weight: 500;
}

.toggle-wrapper {
  position: relative;
  display: inline-block;
  width: auto;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  background-color: var(--tertiary-light);
  border-radius: 34px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.1);
}

.toggle-switch:after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: white;
  top: 2px;
  left: 2px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.toggle-input:checked+.toggle-switch {
  background-color: var(--secondary-color);
}

.toggle-input:checked+.toggle-switch:after {
  transform: translateX(24px);
}

.toggle-input:focus+.toggle-switch {
  outline: 2px solid var(--primary-light);
  outline-offset: 2px;
}

.toggle-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.toggle-input:focus~.toggle-border {
  width: 100%;
}

.error-message {
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  color: var(--error);
  font-size: 0.75rem;
  font-weight: 500;
}

.help-text {
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Disabled state */
.is-disabled .toggle-switch {
  background-color: var(--tertiary-extra-light);
  cursor: not-allowed;
  opacity: 0.7;
}

.is-disabled .toggle-label {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error state */
.has-error .toggle-border {
  background-color: var(--error);
  width: 100%;
}

.has-error .toggle-switch {
  background-color: var(--error-light);
}

.has-error .toggle-input:checked+.toggle-switch {
  background-color: var(--error);
}
</style>
