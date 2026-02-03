<template>
  <BaseButton :variant="variant" :size="size" :icon="icon" :icon-size="iconSize" :type="type" :full-width="fullWidth"
    :outline-color="outlineColor" :icon-position="iconPosition" :disabled="disabled" class="action-button">
    <slot></slot>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

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
.action-button {
  /* Styles spécifiques aux boutons d'action si nécessaire */
}
</style>
