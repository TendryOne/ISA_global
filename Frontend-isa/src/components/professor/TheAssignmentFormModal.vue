<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <Icon icon="material-symbols:assignment-outline" width="28" height="28" />
          <h3>{{ isEdit ? 'Modifier le devoir' : 'Créer un nouveau devoir' }}</h3>
        </div>
        <button class="close-btn" @click="closeModal">
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </button>
      </div>

      <!-- Contenu du formulaire -->
      <div class="modal-content">
        <Form @submit="handleSubmit" class="assignment-form" :validation-schema="validationSchema"
          v-slot="{ errors, isSubmitting, values }" :initial-values="initialValues">

          <!-- Section Informations principales -->
          <div class="form-section">
            <h4 class="section-title">
              <Icon icon="material-symbols:info-outline" />
              Informations du devoir
            </h4>

            <div class="form-grid">
              <div class="form-group full-width">
                <InputField name="title" label="Titre du devoir *" placeholder="Ex: Examen final d'algorithmique"
                  :floating="true" :error="!!errors.title" />
              </div>

              <div class="form-group full-width">
                <label class="form-label">Description *</label>
                <Field name="description" v-slot="{ field, errorMessage, handleChange }">
                  <QuillEditor :model-value="field.value || ''" @update:model-value="handleChange" />
                  <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
                </Field>
              </div>

              <InputSelect name="type" label="Type de devoir *" :options="typeOptions" :floating="true"
                :error="!!errors.type" :disabled="values.type === 'exam' && !!assignment" />

              <div class="form-group full-width">
                <InputField name="fileUrl" label="Fichier joint (optionnel)"
                  placeholder="https://exemple.com/fichier.pdf ou /uploads/devoir.docx" :floating="true"
                  :error="!!errors.fileUrl" />
                <small class="field-hint">
                  <Icon icon="material-symbols:info-outline" />
                  URL d'un fichier de consigne ou document de référence (optionnel)
                </small>
              </div>

              <InputSelect name="session" label="Session *" :options="sessionOptions" :floating="true"
                :error="!!errors.session" :disabled="values.type === 'exam' && !!assignment" />

              <InputSelect name="submissionLocation" label="Type de rendu *" :options="submissionLocationOptions"
                :floating="true" :error="!!errors.submissionLocation" />

              <div class="form-group full-width">
                <InputField name="dueDate" label="Date d'échéance *" type="datetime-local" :floating="true"
                  :error="!!errors.dueDate" />
              </div>


            </div>
          </div>


          <!-- Actions -->
          <div class="form-actions">
            <ActionButton type="button" @click="closeModal" variant="outline">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="material-symbols:save"
              :disabled="isSubmitting || Object.keys(errors).length > 0" :loading="loading">
              {{ isEdit ? 'Enregistrer les modifications' : 'Créer le devoir' }}
            </ActionButton>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Form, Field } from 'vee-validate';
import { z } from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import InputField from '@/components/ui/InputField.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import type { AssignmentInterface } from '@/interfaces/assignment.interface';
import QuillEditor from '../EDITOR/QuillEditor.vue';

interface Props {
  assignment?: AssignmentInterface | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'submit', values: Record<string, unknown>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const loading = ref(false);
const isEdit = ref(!!props.assignment);

// Options pour les selects
const typeOptions = [
  { label: 'Devoir', value: 'homework' },
  { label: 'Projet', value: 'project' },
  { label: 'Examen', value: 'exam' }
];

const sessionOptions = [
  { label: 'Session normale', value: 'normal' },
  { label: 'Session de rattrapage', value: 'rattrapage' }
];

const submissionLocationOptions = [
  { label: 'En ligne', value: 'online' },
  { label: 'En présentiel', value: 'in-person' }
];

// Schema de validation Zod
const assignmentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  type: z.enum(['homework', 'project', 'exam'], {
    required_error: 'Le type est requis',
    message: 'veuillez selectionner un type valide'
  }),
  session: z.enum(['normal', 'rattrapage'], {
    required_error: 'La session est requise',
    message: 'veuillez selectionner une session valide'
  }),
  submissionLocation: z.enum(['online', 'in-person'], {
    required_error: 'Le type de rendu est requis',
    message: 'veuillez selectionner un type de rendu valide'
  }),
  dueDate: z.string().min(1, 'La date d\'échéance est requise'),
  fileUrl: z.string().url('L\'URL doit être valide').optional().or(z.literal('')),
});

const validationSchema = toTypedSchema(assignmentSchema);

// Valeurs initiales pour le formulaire
const initialValues = computed(() => {
  if (props.assignment) {
    // Convertir la date en format local datetime-local
    const dueDate = new Date(props.assignment.dueDate);
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    const hours = String(dueDate.getHours()).padStart(2, '0');
    const minutes = String(dueDate.getMinutes()).padStart(2, '0');
    const localDateTimeString = `${year}-${month}-${day}T${hours}:${minutes}`;

    return {
      title: props.assignment.title,
      description: props.assignment.description,
      type: props.assignment.type,
      session: props.assignment.session,
      submissionLocation: props.assignment.submissionLocation || 'online',
      dueDate: localDateTimeString,
      fileUrl: props.assignment.fileUrl || '',
    };
  }
  return {
    title: '',
    description: '',
    type: '',
    session: '',
    submissionLocation: 'online',
    dueDate: '',
    fileUrl: '',
  };
});

// Watch pour initialiser le formulaire en mode édition
watch(() => props.assignment, (assignment) => {
  isEdit.value = !!assignment;
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSubmit = async (values: Record<string, unknown>) => {
  loading.value = true;
  try {
    const submissionData = {
      ...values,
      dueDate: new Date(values.dueDate as string)
    };

    emit('submit', submissionData);
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

.error-message {
  color: var(--error-color, #e74c3c);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.form-label {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: var(--white);
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content .iconify {
  font-size: 1.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
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
  transform: scale(1.05);
}

.modal-content {
  max-height: calc(90vh - 100px);
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: var(--background-light);
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--border-light);
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

.assignment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: var(--background-light);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  transition: box-shadow 0.2s ease;
}

.form-section:hover {
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-light);
}

.section-title .iconify {
  color: var(--primary-color);
  font-size: 1.25rem;
  background: var(--primary-extra-light);
  padding: 0.5rem;
  border-radius: var(--radius);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
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
  padding: 0.5rem;
  background: var(--primary-extra-light);
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
}

.field-hint .iconify {
  color: var(--primary-color);
  font-size: 0.875rem;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;
  background: var(--white);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.switch-container:hover {
  border-color: var(--primary-color-light);
  box-shadow: var(--shadow-sm);
}

.switch-input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 52px;
  height: 28px;
  background: var(--border-light);
  border-radius: 14px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.switch-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  background: var(--white);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch-input:checked+.switch-slider {
  background: var(--primary-color);
}

.switch-input:checked+.switch-slider::before {
  transform: translateX(24px);
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.switch-label .iconify {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    max-width: calc(100vw - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1.25rem;
  }

  .header-content h3 {
    font-size: 1.1rem;
  }

  .header-content .iconify {
    font-size: 1.5rem;
    padding: 0.4rem;
  }

  .form-section {
    padding: 1.25rem;
  }

  .section-title {
    font-size: 1rem;
    gap: 0.5rem;
  }

  .section-title .iconify {
    font-size: 1.1rem;
    padding: 0.4rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
    max-width: calc(100vw - 1rem);
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .header-content h3 {
    font-size: 1rem;
  }

  .header-content .iconify {
    font-size: 1.25rem;
    padding: 0.3rem;
  }

  .form-section {
    padding: 1rem;
  }

  .section-title {
    font-size: 0.95rem;
  }

  .form-grid {
    gap: 0.75rem;
  }

  .form-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 360px) {
  .modal-container {
    margin: 0.25rem;
    max-height: calc(100vh - 0.5rem);
    max-width: calc(100vw - 0.5rem);
  }

  .modal-header {
    padding: 0.75rem 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .header-content {
    gap: 0.5rem;
  }

  .header-content h3 {
    font-size: 0.9rem;
  }

  .close-btn {
    padding: 0.375rem;
  }

  .form-section {
    padding: 0.75rem;
  }

  .section-title {
    font-size: 0.9rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
}

/* Animation smooth pour l'ouverture/fermeture */
.modal-overlay {
  transition: opacity 0.3s ease;
}

.modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* États de focus et hover améliorés */
.close-btn:focus {
  outline: 2px solid var(--white);
  outline-offset: 2px;
}

.form-section:focus-within {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color-light);
}

/* Optimisation pour les écrans tactiles */
@media (hover: none) and (pointer: coarse) {
  .close-btn {
    padding: 0.75rem;
  }

  .form-actions {
    gap: 1rem;
  }
}
</style>
