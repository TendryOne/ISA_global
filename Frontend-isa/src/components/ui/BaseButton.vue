<template>
  <button :class="['base-button', variant, size, outlineColor, { 'full-width': fullWidth, 'disabled': disabled }]"
    :type="type" :disabled="disabled">
    <Icon v-if="icon && iconPosition === 'left'" :icon="icon" :width="iconSize" />
    <span v-if="$slots.default">
      <slot></slot>
    </span>
    <Icon v-if="icon && iconPosition === 'right'" :icon="icon" :width="iconSize" />
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconSize?: string | number;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  outlineColor?: "red" | "prim" | "sec";
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  iconSize: 20,
  iconPosition: 'right',
  disabled: false
});
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

/* Variantes */
.primary {
  background: var(--primary-color);
  color: var(--white);
  box-shadow: var(--shadow-light);
}

.secondary {
  background: var(--secondary-color);
  color: var(--white);
  box-shadow: var(--shadow-light);
}

.outline {
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.danger {
  background-color: var(--error-light);
  color: var(--white);
}

.danger:hover {
  background-color: var(--error);
}

.warning {
  background-color: var(--warning);
  color: var(--white);
}

.warning:hover {
  background-color: var(--warning-dark);
}

.text {
  background-color: transparent;
  color: var(--primary-color);
  box-shadow: none;
}

/* Tailles */
.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.medium {
  padding: 0.75rem 1.5rem;
}

.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.red {
  color: var(--error-light);
  border: 1px solid var(--error-light);
}

.prim {
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.sec {
  color: var(--secondary-color);
  border: 1px solid var(--secondary-color);
}

/* États */
.base-button:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.red:hover:not(.disabled) {
  background-color: var(--error);
  color: var(--white);
}

.prim:hover:not(.disabled) {
  background-color: var(--primary-color);
  color: var(--white);
}

.sec:hover:not(.disabled) {
  background-color: var(--secondary-color);
  color: var(--white);
}

.text:hover:not(.disabled) {
  transform: none;
  box-shadow: none;
  text-decoration: underline;
}

.full-width {
  width: 100%;
}

/* Style désactivé */
.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}
</style>
