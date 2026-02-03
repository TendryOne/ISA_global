<template>
  <div class="elite-modal-overlay">
    <div class="elite-modal-container">
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ ue ? `Modification de L' ${ue.code}` : 'Créer une UE' }}</h2>
          <p class="modal-subtitle">Semestre {{ semester }} - {{ route.params.filiere }}</p>
        </div>
        <button class="close-button" @click="closeModal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <div class="modal-content">
        <Form @submit="submitForm" :validation-schema="validationSchema" :initial-values="initialValues">
          <div class="form-grid">
            <div class="form-group">
              <InputField name="code" floating label="Code de l'UE" rules="required|min:3" icon="mdi:identifier" />
            </div>

            <div class="form-group">
              <InputField name="name" floating label="Nom de l'UE" rules="required|min:5" icon="mdi:book-education" />
            </div>

            <div class="form-group">
              <InputField name="level" label="Niveau" floating :model-value="levelValue" disabled icon="mdi:stairs" />
            </div>

            <div class="form-group">
              <InputField type="number" label="Crédits" name="credits" floating
                rules="required|min_value:1|max_value:30" icon="mdi:weight" />
            </div>

            <div class="form-group full-width">
              <TextAreaField name="description" label="Description" floating rules="required|min:10|max:500"
                icon="mdi:text-box" />
            </div>

          </div>

          <div class="modal-actions">
            <ActionButton type="button" variant="danger" @click="closeModal">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="mdi:plus-box" v-if="!ue">
              creer
            </ActionButton>
            <ActionButton type="submit" icon="material-symbols:save" v-else>
              Enregistrer
            </ActionButton>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InputField from '@/components/ui/InputField.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import { Form } from 'vee-validate'
import ActionButton from '@/components/ui/ActionButton.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type TeachingUnitInterface from '@/interfaces/teachingUnit.interface'
import InputFiles from '@/components/ui/InputFiles.vue'

const props = defineProps<{
  ue: TeachingUnitInterface | null
}>()



const initialValues = {
  code: props.ue ? props.ue.code : '',
  credits: props.ue ? props.ue.credits : 0,
  name: props.ue ? props.ue.name : '',
  description: props.ue ? props.ue.description : '',

}

const validationSchema = toTypedSchema(
  z.object({
    code: z
      .string({
        required_error: "Le code est requis.",
        invalid_type_error: "Le code doit être une chaîne de caractères."
      })
      .min(1, "Le code ne peut pas être vide."),

    name: z
      .string({
        required_error: "Le nom est requis.",
        invalid_type_error: "Le nom doit être une chaîne de caractères."
      })
      .min(1, "Le nom ne peut pas être vide."),

    credits: z
      .number({
        required_error: "Le nombre de crédits est requis.",
        invalid_type_error: "Les crédits doivent être un nombre valide."
      })
      .min(1, "Les crédits doivent être au moins égaux à 1."),

    description: z
      .string({
        required_error: "La description est requise.",
        invalid_type_error: "La description doit être une chaîne de caractères."
      })
      .min(1, "La description ne peut pas être vide."),
  })
)

const emit = defineEmits(['close', 'submit'])

const route = useRoute()
const semester = route.params.semester as string

const levelValue = computed(() => {
  const semesterNumber = parseInt(semester?.slice(1)) // "S4" → 4
  if (!semesterNumber || semesterNumber < 1 || semesterNumber > 10) return ''

  const levelMap = ['L1', 'L1', 'L2', 'L2', 'L3', 'L3', 'M1', 'M1', 'M2', 'M2']
  return levelMap[semesterNumber - 1]
})

const closeModal = () => {
  emit('close')
}

const submitForm = (values: any) => {
  emit('submit', {
    ...values,
    semester,
    level: levelValue.value,
    field: route.params.filiere
  })
}


</script>

<style scoped>
.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 22, 31, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
  animation: fadeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.elite-modal-container {
  width: 100%;
  max-width: 720px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary-darker), var(--primary-color));
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.625rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.5px;
}

.modal-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 400;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 1rem;
  flex-shrink: 0;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-content {
  padding: 2.25rem 2.5rem;
  overflow-y: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.75rem;
}

.form-group {
  margin-bottom: 0.5rem;
}

.full-width {
  grid-column: span 2;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--gray-lighter);
}

.cancel-button,
.submit-button {
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cancel-button {
  background: none;
  border: 1px solid var(--gray-light);
  color: var(--gray-dark);
}

.cancel-button:hover {
  background: var(--gray-lighter);
  border-color: var(--gray);
}

.submit-button {
  background: var(--primary-color);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
  position: relative;
  overflow: hidden;
}

.submit-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(var(--primary-color-rgb), 0.25);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button svg {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.submit-button:hover svg {
  transform: translateX(2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(12px);
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .elite-modal-container {
    max-width: 95%;
    margin: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: span 1;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .modal-content {
    padding: 1.75rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.875rem;
  }

  .cancel-button,
  .submit-button {
    width: 100%;
    padding: 0.875rem;
  }
}
</style>
