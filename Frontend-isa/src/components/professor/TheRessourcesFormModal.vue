<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <Icon icon="material-symbols:library-books-outline" width="28" height="28" />
          <h3>{{ resource ? 'Modifier le support de cours' : 'Ajouter un nouveau support de cours' }}</h3>
        </div>
        <button class="close-btn" @click="closeModal">
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </button>
      </div>

      <!-- Contenu du formulaire -->
      <div class="modal-content">
        <Form @submit="handleSubmit" class="resource-form" :validation-schema="schemaValidation"
          v-slot="{ errors, isSubmitting, meta }" :initial-values="initialValues">

          <!-- Section Informations principales -->
          <div class="form-section">
            <h4 class="section-title">
              <Icon icon="material-symbols:info-outline" />
              Informations de la ressource
            </h4>

            <div class="form-grid">
              <div class="form-group full-width">
                <InputField name="title" label="Titre de la ressource *" placeholder="Ex: Cours d'algorithmique avancée"
                  :floating="true" :error="!!errors.title" />
              </div>

              <div class="form-group full-width">
                <TextAreaField name="description" label="Description *"
                  placeholder="Décrivez le contenu et l'utilité de cette ressource..." :error="!!errors.description"
                  floating />
              </div>

              <InputField name="link" label="Lien de la ressource *" placeholder="https://exemple.com/ressource"
                type="url" :floating="true" :error="!!errors.link" />

              <InputSelect name="type" label="Type de ressource *" placeholder="Sélectionner le type"
                :options="resourceTypes" :floating="true" :error="!!errors.type" />
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <ActionButton type="button" @click="closeModal" variant="outline">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="material-symbols:save"
              :disabled="isSubmitting || Object.keys(errors).length > 0">
              {{ resource ? 'Enregistrer les modifications' : 'Ajouter un nouveau support de cours' }}
            </ActionButton>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Form } from 'vee-validate';
import InputField from '../ui/InputField.vue';
import InputSelect from '../ui/InputSelect.vue';
import TextAreaField from '../ui/TextAreaField.vue';
import ActionButton from '../ui/ActionButton.vue';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import type ResourcesInterface from '@/interfaces/resources.interface';

const schemaValidation = toTypedSchema(
  z.object({
    title: z.string()
      .min(3, 'Le titre doit contenir au moins 3 caractères')
      .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: z.string()
      .min(10, 'La description doit contenir au moins 10 caractères')
      .max(500, 'La description ne peut pas dépasser 500 caractères'),
    link: z.string()
      .url('Le lien doit être une URL valide'),
    type: z.enum(['video', 'document', 'external_link'], {
      message: 'Type de ressource invalide'
    }),
  })
);

const props = defineProps<{
  resource: ResourcesInterface | null
}>()

const initialValues = props.resource ? {
  title: props.resource.title,
  description: props.resource.description,
  link: props.resource.link,
  type: props.resource.type,
} : {
  title: '',
  description: '',
  link: '',
  type: 'document',
};

const resourceTypes = [
  { label: 'Vidéo', value: 'video' },
  { label: 'Document', value: 'document' },
  { label: 'Lien externe', value: 'external_link' },
];

const emit = defineEmits<{
  (e: 'submit', values: Record<string, unknown>): void;
  (e: 'close'): void;
}>();

const handleSubmit = (values: Record<string, unknown>) => {
  emit('submit', values);
};

const closeModal = () => {
  emit('close');
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

.resource-form {
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
