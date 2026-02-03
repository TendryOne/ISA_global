<template>
  <div class="modal-overlay">
    <div
      class="modal-card premium-modal"
      role="dialog"
      aria-modal="true"
      :aria-label="isEdit ? 'Modifier le professeur' : 'Créer un nouveau professeur'"
    >
      >
      <header class="modal-header">
        <div class="header-content">
          <div class="header-icon">
            <Icon :icon="isEdit ? 'mdi:pencil' : 'mdi:plus'" />
          </div>
          <div class="header-text">
            <h3>{{ isEdit ? 'Modifier le professeur' : 'Nouveau professeur' }}</h3>
            <p>
              {{
                isEdit
                  ? 'Modifiez les informations du professeur'
                  : 'Ajoutez un nouveau membre au corps enseignant'
              }}
            </p>
          </div>
        </div>
        <button class="close-btn premium-close" @click="$emit('close')" aria-label="Fermer">
          <Icon icon="mdi:close" />
        </button>
      </header>

      <Form
        @submit="handleSubmit"
        :validation-schema="validationSchema"
        :initial-values="initialValues"
        v-slot="{ errors, isSubmitting }"
        class="modal-body"
      >
        <!-- Personal Information Section -->
        <div class="form-section">
          <div class="section-header">
            <Icon icon="mdi:account" class="section-icon" />
            <h4>Informations personnelles</h4>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <InputField
                name="name"
                label="Nom"
                floating
                icon="mdi:account"
                :error="!!errors.name"
              />
            </div>

            <div class="form-group">
              <InputField
                name="firstName"
                label="Prénom"
                floating
                icon="mdi:account"
                :error="!!errors.firstName"
              />
            </div>

            <div class="form-group full-width">
              <InputSelect
                name="gender"
                label="Genre"
                :options="genderOptions"
                icon="mdi:human-male-female"
                :error="!!errors.gender"
                floating
              />
            </div>
          </div>
        </div>

        <!-- Contact Information Section -->
        <div class="form-section">
          <div class="section-header">
            <Icon icon="mdi:email" class="section-icon" />
            <h4>Informations de contact</h4>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <InputField
                name="email"
                label="Email personnel"
                type="email"
                floating
                icon="mdi:email"
                :error="!!errors.email"
              />
            </div>

            <div class="form-group">
              <InputField
                name="emailProfessional"
                label="Email professionnel"
                type="email"
                floating
                icon="mdi:email-outline"
                :error="!!errors.emailProfessional"
              />
            </div>

            <div class="form-group">
              <InputField
                name="phone"
                label="Téléphone"
                type="tel"
                floating
                icon="mdi:phone"
                :error="!!errors.phone"
              />
            </div>

            <div class="form-group full-width">
              <TextAreaField
                name="address"
                label="Adresse"
                floating
                icon="mdi:home"
                :error="!!errors.address"
                :rows="2"
              />
            </div>
          </div>
        </div>

        <!-- Professional Information Section -->
        <div class="form-section">
          <div class="section-header">
            <Icon icon="mdi:briefcase" class="section-icon" />
            <h4>Informations professionnelles</h4>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label class="field-label">
                <Icon icon="mdi:domain" class="label-icon" />
                Départements d'enseignement
              </label>
              <div class="departments-selection">
                <div
                  v-for="dept in departmentOptions"
                  :key="dept.value"
                  class="department-checkbox-group"
                >
                  <label class="department-checkbox-label">
                    <Field
                      name="department"
                      type="checkbox"
                      :value="dept.value"
                      class="department-checkbox-input"
                    />
                    <div class="department-checkbox-custom">
                      <Icon icon="mdi:check" class="department-check-icon" />
                    </div>
                    <div class="department-checkbox-content">
                      <Icon :icon="dept.icon" class="department-checkbox-icon" />
                      <span class="department-checkbox-title">{{ dept.label }}</span>
                    </div>
                  </label>
                </div>
              </div>
              <div v-if="errors.department" class="error-message">{{ errors.department }}</div>
            </div>

            <div class="form-group full-width">
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <Field
                    name="isPermanent"
                    type="checkbox"
                    class="checkbox-input"
                    :value="true"
                    :unchecked-value="false"
                  />
                  <div class="checkbox-custom">
                    <Icon icon="mdi:check" class="check-icon" />
                  </div>
                  <div class="checkbox-content">
                    <span class="checkbox-title">Professeur permanent</span>
                    <span class="checkbox-subtitle"
                      >Le professeur fait partie du personnel permanent de l'établissement</span
                    >
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <div class="footer-actions">
            <ActionButton
              variant="outline"
              @click="$emit('close')"
              :disabled="isSubmitting || loading"
            >
              Annuler
            </ActionButton>
            <ActionButton type="submit" variant="primary" :disabled="isSubmitting || loading">
              {{ isEdit ? 'Modifier' : 'Créer' }} le professeur
            </ActionButton>
          </div>
        </footer>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Form, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import ActionButton from '@/components/ui/ActionButton.vue'
import InputField from '@/components/ui/InputField.vue'
import InputSelect from '@/components/ui/InputSelect.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import type ProfessorInterface from '@/interfaces/professor.interface'

interface ProfessorFormValues {
  name: string
  firstName: string
  gender: 'male' | 'female'
  email: string
  emailProfessional: string
  phone?: string
  address?: string
  department: ('informatique' | 'btp' | 'gestion')[]
  isPermanent: boolean
}

// Props
interface Props {
  professor?: ProfessorInterface
  isEdit?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  professor: undefined,
  isEdit: false,
})

// Emits
interface Emits {
  close: []
  submit: [data: Partial<ProfessorInterface>]
}

const emit = defineEmits<Emits>()

// Options
const genderOptions = [
  { value: 'male', label: 'Homme' },
  { value: 'female', label: 'Femme' },
]

const departmentOptions = [
  { value: 'informatique', label: 'Informatique', icon: 'mdi:monitor' },
  { value: 'btp', label: 'BTP (Bâtiment et Travaux Publics)', icon: 'mdi:hammer-wrench' },
  { value: 'gestion', label: 'Gestion', icon: 'mdi:briefcase' },
]

// Initial values
const initialValues = computed(() => {
  if (props.professor && props.isEdit) {
    return {
      name: props.professor.name || '',
      firstName: props.professor.firstName || '',
      gender: props.professor.gender || '',
      email: props.professor.email || '',
      emailProfessional: props.professor.emailProfessional || '',
      phone: props.professor.phone || '',
      address: props.professor.address || '',
      department: props.professor.department || [],
      isPermanent: props.professor.isPermanent || false,
    }
  }
  return {
    name: '',
    firstName: '',
    gender: '',
    email: '',
    emailProfessional: '',
    phone: '',
    address: '',
    department: [],
    isPermanent: false,
  }
})

// Validation schema with Zod
const validationSchema = computed(() => {
  const baseSchema = {
    name: z
      .string({ required_error: 'Le nom est requis' })
      .min(1, 'Le nom ne peut pas être vide')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),

    firstName: z
      .string({ required_error: 'Le prénom est requis' })
      .min(1, 'Le prénom ne peut pas être vide')
      .min(2, 'Le prénom doit contenir au moins 2 caractères'),

    gender: z.enum(['male', 'female'], {
      message: "Le genre doit être l'un des suivants : male, female",
      required_error: 'Le genre est requis',
    }),

    email: z
      .string({ required_error: "L'email personnel est requis" })
      .email("Format d'email invalide"),

    emailProfessional: z
      .string({ required_error: "L'email professionnel est requis" })
      .email("Format d'email invalide"),

    phone: z.string().max(10, 'Le numéro de téléphone ne peut pas dépasser 10 caractères'),

    address: z
      .string()
      .min(1, "L'adresse ne peut pas être vide")
      .max(255, "L'adresse ne peut pas dépasser 255 caractères"),

    department: z
      .array(z.enum(['informatique', 'btp', 'gestion']))
      .min(1, 'Au moins un département doit être sélectionné')
      .max(3, 'Un professeur ne peut enseigner dans plus de 3 départements'),

    isPermanent: z.boolean().optional().default(false),
  }

  return toTypedSchema(z.object(baseSchema))
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSubmit = async (values: any) => {
  try {
    const formValues = values as ProfessorFormValues

    const submitData: Partial<ProfessorInterface> = {
      name: formValues.name,
      firstName: formValues.firstName,
      gender: formValues.gender,
      email: formValues.email,
      emailProfessional: formValues.emailProfessional,
      phone: formValues.phone || undefined,
      address: formValues.address || undefined,
      department: formValues.department,
      isPermanent: formValues.isPermanent,
    }

    emit('submit', submitData)
  } catch (error) {
    console.error('Form submission error:', error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.premium-modal {
  width: min(800px, 95vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%);
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: linear-gradient(135deg, #4299e1, #3182ce);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.header-text h3 {
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  font-weight: 700;
  font-size: 1.25rem;
}

.header-text p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.premium-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: #a0aec0;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.premium-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

/* Body */
.modal-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 200px);
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f1f3f7;
}

.section-icon {
  font-size: 1.25rem;
  color: #4299e1;
}

.section-header h4 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  font-size: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

.form-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.field-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.checkbox-group:hover {
  border-color: #d1d5db;
}

.checkbox-input {
  display: none;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: white;
}

.checkbox-input:checked + .checkbox-custom {
  background: #4299e1;
  border-color: #4299e1;
}

.check-icon {
  color: white;
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom .check-icon {
  opacity: 1;
}

.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.checkbox-subtitle {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Department Selection */
.field-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.label-icon {
  font-size: 1rem;
  color: #4299e1;
}

.departments-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.department-checkbox-group {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.department-checkbox-group:hover {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.department-checkbox-input:checked + .department-checkbox-custom + .department-checkbox-content {
  background: rgba(66, 153, 225, 0.05);
}

.department-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  width: 100%;
}

.department-checkbox-input {
  display: none;
}

.department-checkbox-custom {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  background: white;
}

.department-checkbox-input:checked + .department-checkbox-custom {
  background: #4299e1;
  border-color: #4299e1;
}

.department-check-icon {
  color: white;
  font-size: 0.875rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.department-checkbox-input:checked + .department-checkbox-custom .department-check-icon {
  opacity: 1;
}

.department-checkbox-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.department-checkbox-icon {
  font-size: 1.25rem;
  color: #4299e1;
}

.department-checkbox-title {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

/* Footer */
.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
  background: #fafbfc;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }

  .premium-modal {
    width: 100%;
    max-height: 95vh;
    border-radius: 12px;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .header-content {
    gap: 0.75rem;
  }

  .header-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }

  .header-text h3 {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .form-section {
    margin-bottom: 1.5rem;
  }

  .modal-footer {
    padding: 1rem 1.5rem;
  }

  .footer-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 0.25rem;
  }

  .modal-header {
    padding: 1rem;
  }

  .header-text h3 {
    font-size: 1rem;
  }

  .header-text p {
    font-size: 0.8125rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .section-header {
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }

  .section-icon {
    font-size: 1.125rem;
  }

  .section-header h4 {
    font-size: 0.9375rem;
  }

  .form-grid {
    gap: 0.75rem;
  }

  .checkbox-group {
    padding: 0.75rem;
  }

  .modal-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
