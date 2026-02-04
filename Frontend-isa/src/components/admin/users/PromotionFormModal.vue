<template>
  <div class="elite-modal-overlay" @click.self="closeModal">
    <div class="elite-modal-container">
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ promotion ? `Modification de la promotion` : 'Créer une promotion' }}</h2>
          <p class="modal-subtitle">{{ route.params.level }} • {{ route.params.filiere }} </p>
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
        <Form @submit="submitForm" :validation-schema="validationSchema" :initial-values="initialValues"
          v-slot="{ values }">
          <div class="form-grid">



            <div class="form-group">
              <InputField name="level" label="Niveau" floating :model-value="String(route.params.level)" disabled
                icon="mdi:stairs" />
            </div>

            <div class="form-group">
              <InputField name="field" label="Filière" floating :model-value="String(route.params.filiere)" disabled
                icon="mdi:book-education" />
            </div>


            <div class="form-group full-width">
              <label class="form-label">Période de la promotion</label>
              <div class="date-range-container">
                <InputField type="date" name="startDate" floating label="Date de début" rules="required"
                  icon="mdi:calendar-start" />
                <div class="date-separator">→</div>
                <InputField type="date" name="endDate" floating label="Date de fin" rules="required"
                  icon="mdi:calendar-end" />
              </div>
            </div>

            <div class="form-group full-width">
              <div class="promotion-name-card" aria-live="polite">
                <div class="promo-icon" aria-hidden="true">
                  <Icon icon="mdi:tag-outline" />
                </div>
                <div class="promo-content">
                  <div class="promo-label">Nom de la promotion</div>
                  <div class="promo-title">
                    <span class="promo-level">{{ route.params.level }}</span>
                    <span class="promo-sep">•</span>
                    <span class="promo-field">{{ route.params.filiere }}</span>
                    <span class="promo-years" v-if="hasYears(values.startDate, values.endDate)">
                      ({{ formatPromotionYears(values.startDate, values.endDate) }})
                    </span>
                    <span class="promo-years muted" v-else>
                      Sélectionnez une période
                    </span>
                  </div>
                </div>
                <div class="promo-badge" v-if="hasYears(values.startDate, values.endDate)">
                  {{ formatPromotionYears(values.startDate, values.endDate) }}
                </div>
              </div>
            </div>



          </div>

          <div class="modal-actions">
            <ActionButton type="button" variant="danger" @click="closeModal">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="mdi:plus-box" v-if="!promotion">
              Créer
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
import { useRoute } from 'vue-router'
import InputField from '@/components/ui/InputField.vue'
import { Form } from 'vee-validate'
import ActionButton from '@/components/ui/ActionButton.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type PromotionInterface from '@/interfaces/promotion.interface'
import { Icon } from '@iconify/vue'


const props = defineProps<{
  promotion: PromotionInterface | null
}>()

const route = useRoute()

// Valeurs initiales pour le formulaire
const initialValues = {
  startDate: props.promotion ? formatDateForInput(props.promotion.startDate) : '',
  endDate: props.promotion ? formatDateForInput(props.promotion.endDate) : '',

}


function formatDateForInput(date: Date | string): string {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

// Schéma de validation avec Zod
const validationSchema = toTypedSchema(
  z.object({

    startDate: z
      .string({
        required_error: "La date de début est requise."
      })
      .min(1, "La date de début est requise."),

    endDate: z
      .string({
        required_error: "La date de fin est requise."
      })
      .min(1, "La date de fin est requise."),

  }).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "La date de fin doit être postérieure à la date de début.",
    path: ["endDate"]
  })
    .refine((data) => new Date(data.startDate) > new Date(), {
      message: "La date de début doit être postérieure à la date actuelle.",
      path: ["startDate"],
    })
)

const emit = defineEmits(['close', 'submit'])



const closeModal = () => {
  emit('close')
}

const submitForm = (values: unknown) => {
  const v = values as { startDate: string; endDate: string;[k: string]: unknown }
  emit('submit', {
    ...v,
    name: `${route.params.level} • ${route.params.filiere} ${hasYears(v.startDate, v.endDate) ? `(${formatPromotionYears(v.startDate, v.endDate)})` : ''}`,
    level: route.params.level,
    field: route.params.filiere,
    startDate: new Date(v.startDate),
    endDate: new Date(v.endDate)
  })
}

// Helpers d'affichage pour le nom de promotion
function getYears(start: string | Date | undefined, end: string | Date | undefined): { start?: number, end?: number } {
  if (!start || !end) return {}
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return {}
  const sameYear = s.getFullYear() === e.getFullYear()
  const startYear = sameYear ? s.getFullYear() - 1 : s.getFullYear()
  const endYear = e.getFullYear()
  return { start: startYear, end: endYear }
}

function hasYears(start?: string, end?: string) {
  const y = getYears(start, end)
  return typeof y.start === 'number' && typeof y.end === 'number'
}

function formatPromotionYears(start?: string, end?: string) {
  const y = getYears(start, end)
  return y.start && y.end ? `${y.start} - ${y.end}` : ''
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
  max-width: 800px;
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

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: var(--gray-dark);
  font-size: 0.9rem;
}

.date-range-container {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: end;
}

.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  color: var(--gray);
  font-weight: 500;
  padding-bottom: 0.5rem;
}

/* Promotion name card */
.promotion-name-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--gray-lighter);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9) 0%, #fff 100%);
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.06);
}

.promo-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.promo-content {
  min-width: 0;
}

.promo-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--gray);
  margin-bottom: 4px;
  font-weight: 600;
}

.promo-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  color: var(--black);
}

.promo-level {
  font-weight: 700;
}

.promo-sep {
  color: var(--gray);
}

.promo-field {
  font-weight: 600;
}

.promo-years {
  color: var(--gray-dark);
}

.promo-years.muted {
  color: var(--gray);
  font-style: italic;
}

.promo-badge {
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  font-weight: 600;
  font-size: 12px;
  border: 1px solid rgba(var(--primary-color-rgb), 0.25);
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

  .date-range-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .date-separator {
    height: auto;
    padding: 0.5rem 0;
    transform: rotate(90deg);
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
