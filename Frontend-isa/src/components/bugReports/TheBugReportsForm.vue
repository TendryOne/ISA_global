<template>
  <div>
    <Form v-slot="{ errors }" @submit="handleSubmit">
      <InputField name="title" label="Objet" :error="!!errors.title" />
      <InputSelect name="priority" label="Priorité" :error="!!errors.priority" :options="priorityOptions" />
      <TextAreaField name="description" label="Description" :error="!!errors.description" />
      <ActionButton type="submit">Envoyer le rapport</ActionButton>
      <ActionButton type="button" variant="danger">Annuler</ActionButton>
    </Form>


  </div>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate';
import InputField from '../ui/InputField.vue';
import InputSelect from '../ui/InputSelect.vue';
import TextAreaField from '../ui/TextAreaField.vue';
import ActionButton from '../ui/ActionButton.vue';


const priorityOptions = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' }
];

const emit = defineEmits<{
  (e: 'submitted', values: any): void;
}>()

const handleSubmit = (values: any) => {
  emit('submitted', values);
};
</script>

<style scoped></style>
