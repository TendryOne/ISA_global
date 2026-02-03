<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-content">
          <Icon icon="material-symbols:grade" />
          <h3>{{ submission?.submission.grade !== null ? 'Modifier la note' : 'Ajouter une note' }}</h3>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
      <div class="modal-content">
        <div class="grade-form" v-if="submission">
          <div class="student-summary">
            <h4>{{ submission.name }} {{ submission.firstName }}</h4>
            <p>{{ submission.matricule }} - {{ submission.email }}</p>
          </div>

          <Form @submit="handleSubmit" class="grading-form" :validation-schema="validationSchema"
            v-slot="{ errors, isSubmitting }" :initial-values="initialValues">

            <div class="form-section">
              <div class="form-grid">
                <div class="form-group full-width">
                  <InputField name="grade" label="Note (sur 20) *" type="number" :floating="true" placeholder="Ex: 15.5"
                    :error="!!errors.grade" />
                  <small class="field-hint">
                    <Icon icon="material-symbols:info-outline" />
                    <div style="width: 100%;"> Note sur 20 (décimales autorisées: 0.5, 1.0, etc.)</div>
                  </small>
                </div>

                <div class="form-group full-width">
                  <TextAreaField name="feedback" label="Commentaire (optionnel)"
                    placeholder="Ajoutez vos commentaires sur le travail de l'étudiant..." :floating="true" :rows="4"
                    :error="!!errors.feedback" />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <ActionButton type="button" @click="$emit('close')" variant="outline">
                Annuler
              </ActionButton>
              <ActionButton type="submit" icon="material-symbols:save"
                :disabled="isSubmitting || Object.keys(errors).length > 0" :loading="isSubmitting">
                {{ submission?.submission.grade !== null ? 'Mettre à jour la note' : 'Enregistrer la note' }}
              </ActionButton>
            </div>
          </Form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Form } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import InputField from '@/components/ui/InputField.vue';
import TextAreaField from '@/components/ui/TextAreaField.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import type { SubmissionProfessorInterface } from '@/interfaces/submission.interface';



interface GradeData {
  grade: number;
  feedback: string;
}

const props = defineProps<{
  show: boolean;
  submission: SubmissionProfessorInterface | null;
}>()



const emit = defineEmits<{
  close: [];
  submit: [data: GradeData];
}>();

// Validation schema with Zod
const gradingSchema = z.object({
  grade: z
    .number({ required_error: 'La note est requise' })
    .min(0, 'La note doit être comprise entre 0 et 20')
    .max(20, 'La note doit être comprise entre 0 et 20'),
  feedback: z
    .string()
    .optional()
    .transform(val => val || '')
});

const validationSchema = toTypedSchema(gradingSchema);



const initialValues = computed(() => {
  return {
    grade: props.submission?.submission.grade !== null ? props.submission?.submission.grade : null,
    feedback: props.submission?.submission.feedback || ''
  };
});

// Handle form submission
const handleSubmit = (values: Record<string, unknown>) => {
  const validatedData = gradingSchema.parse(values);
  emit('submit', {
    grade: validatedData.grade,
    feedback: validatedData.feedback
  });
};
</script>

<style scoped>
/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
  animation: overlayFadeIn 0.3s ease-out;
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
  border: 1px solid var(--border-light);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: var(--white);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header .header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header .header-content svg {
  width: 24px;
  height: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--white);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-content {
  padding: 1.5rem 2rem 2rem;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

/* Modal de notation */
.grade-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.student-summary {
  background: var(--background-light);
  padding: 1rem;
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

.student-summary h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-dark);
  font-size: 1rem;
}

.student-summary p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Form Sections */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.field-hint svg {
  width: 14px;
  height: 14px;
  color: var(--primary-color);
}

@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 2fr;
    align-items: start;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

/* Form styling overrides for modals */
.grading-form :deep(.input-field),
.grading-form :deep(.textarea-field) {
  margin-bottom: 0;
}

/* Animations */
@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
