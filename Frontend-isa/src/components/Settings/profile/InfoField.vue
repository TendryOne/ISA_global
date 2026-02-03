<template>
  <div class="info-field">
    <label>{{ label }}</label>
    <div class="field-value" :class="{ locked, editable, error: error && editable }">
      <template v-if="editable">
        <span v-if="type === 'tel'" class="phone-prefix">+261</span>
        <Field v-if="type === 'select'" :name="name || 'default'" as="select">
          <option value="" disabled>Sélectionnez...</option>
          <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </Field>
        <Field v-else :name="name || 'default'" :type="type || 'text'" :placeholder="`${label}`"
          @keypress="(e: any) => blockNumber && limitInput(e, blockNumber)" />
      </template>
      <span v-else>{{ type === 'tel' && value ? '+261 ' + value : getDisplayValue() }}</span>
      <Icon v-if="locked" icon="mdi:lock" class="lock-icon" />
    </div>
    <ErrorMessage :name="name || 'default'" class="error-message" v-if="editable" />
  </div>
</template>

<script setup lang="ts">

import limitInput from '@/utils/limitInput';
import { Icon } from '@iconify/vue'
import { ErrorMessage, Field } from 'vee-validate'

const props = defineProps({
  label: String,
  locked: Boolean,
  editable: Boolean,
  type: String,
  name: String,
  value: String,
  error: Boolean,
  blockNumber: Number,
  options: Array as () => { label: string; value: string }[],
})

const getDisplayValue = () => {
  if (props.type === 'select' && props.options && props.value) {
    const option = props.options.find(opt => opt.value === props.value);
    return option?.label || props.value;
  }
  return props.value || 'Non renseigné';
}

</script>

<style scoped>
.info-field {
  margin-bottom: 1rem;
}

.info-field label {
  display: block;
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.field-value {
  padding: 0.75rem 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  font-size: 0.9375rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-value.locked {
  background-color: #edf2f7;
  color: #4a5568;
}

.field-value.editable {
  padding: 0;
  background-color: white;
  border-color: #cbd5e0;
  display: flex;
  align-items: center;
}

.phone-prefix {
  padding: 0.75rem 0 0.75rem 1rem;
  font-weight: 600;
  color: #4a5568;
  border-right: 1px solid #e2e8f0;
  background-color: #f8f9fa;
  white-space: nowrap;
}

.field-value input,
.field-value select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  font-size: 0.9375rem;
  cursor: pointer;
}

.field-value input:focus,
.field-value select:focus {
  outline: none;
}

.field-value select {
  background-color: white;
  cursor: pointer;
}

.lock-icon {
  color: #a0aec0;
  flex-shrink: 0;
}

.field-value.error {
  border: 1px solid var(--error);
}

.error-message {
  font-size: 13px;
  margin-left: 2px;
  color: var(--error);
}
</style>
