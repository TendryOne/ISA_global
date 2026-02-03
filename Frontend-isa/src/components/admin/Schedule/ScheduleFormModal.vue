<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-content">
          <Icon icon="material-symbols:calendar-add-on-outline" width="28" height="28" />
          <h3>{{ isEdit ? 'Modifier le cours' : 'Planifier un nouveau cours' }}</h3>
        </div>
        <button class="close-btn" @click="closeModal">
          <Icon icon="material-symbols:close-rounded" width="24" height="24" />
        </button>
      </div>

      <!-- Contenu du formulaire -->
      <div class="modal-content">
        <Form @submit="handleSubmit" class="schedule-form" :validation-schema="validationSchema"
          v-slot="{ values, isSubmitting, errors }" :initial-values="initialValues">
          <div>
            <!-- Sélection multiple des départements -->
            <div class="form-group full-width">
              <label class="static-label">Départements concernés *</label>
              <div class="checkbox-group">
                <label v-for="dept in departmentOptions" :key="dept.value" class="checkbox-label">
                  <Field name="department" type="checkbox" class="checkbox-input" :value="dept.value" />
                  <span class="checkbox-custom"></span>
                  {{ dept.label }}
                </label>
              </div>
            </div>
            <div>
              <label class="static-label">Niveau concerne *</label>
              <div class="checkbox-group">
                <label v-for="level in levels" :key="level.value" class="checkbox-label">
                  <Field name="level" type="checkbox" class="checkbox-input" :value="level.value" />
                  <span class="checkbox-custom"></span>
                  {{ level.label }}
                </label>
              </div>
            </div>
          </div>

          <!-- Section de vérification des promotions -->
          <div v-if="values.department && values.level && values.department.length > 0 && values.level.length > 0"
            class="promotion-check-section">
            <div class="promotion-status">
              <h5 class="status-title">
                <Icon icon="material-symbols:verified-user-outline" />
                Promotions concernées
              </h5>

              <div class="promotion-grid compact">
                <template v-for="dept in values.department" :key="dept">
                  <div v-for="level in values.level" :key="`${dept}-${level}`" class="promotion-item">
                    <span class="promotion-name">
                      {{departmentOptions.find(d => d.value === dept)?.label || dept.toUpperCase()}}
                      - {{levels.find(l => l.value === level)?.label || level}}
                    </span>
                    <span v-if="isPromotionAvailable(dept, level)" class="status-badge available">
                      <Icon icon="material-symbols:check" />
                    </span>
                    <span v-else class="status-badge unavailable">
                      <Icon icon="material-symbols:close" />
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div v-if="values.department && values.level && values.department.length > 0 && values.level.length > 0"
            class="available-section">
            <div class="form-section">
              <h4 class="section-title">
                <Icon icon="material-symbols:info-outline" />
                Informations du cours
              </h4>

              <div class="form-grid">
                <InputField name="title" label="Titre de l'événement *" placeholder="Ex: Algorithmique Avancée"
                  rules="required" :floating="false" :error="!!errors.title" />

                <InputSelect name="module"
                  :label="(values.department?.length > 1 || values.level?.length > 1) || values.courseType === 'other' ? 'Module (optionnel)' : 'Module *'"
                  placeholder="Sélectionner un module"
                  :options="getFilteredModuleOptions(values.department, values.level)" :floating="false"
                  :errors="!!errors.module" :disabled="(values.department?.length > 1 || values.level?.length > 1)" />

                <!-- Message informatif UNIQUEMENT pour 1 département + 1 niveau sans modules -->
                <div
                  v-if="values.department?.length === 1 && values.level?.length === 1 && getFilteredModuleOptions(values.department, values.level).length === 1 && getFilteredModuleOptions(values.department, values.level)[0].value === ''"
                  class="no-modules-info compact">
                  <Icon icon="material-symbols:info-outline" class="info-icon" />
                  <div class="info-text">
                    <span class="info-details">
                      {{values.department.map((d: string) => departmentOptions.find(dept => dept.value ===
                        d)?.label).join(', ')}}
                      - {{values.level.map((l: string) => levels.find(lvl => lvl.value === l)?.label).join('')}}
                      (aucun module disponible ou promotion non créée)
                    </span>
                  </div>
                </div>

                <InputSelect name="courseType" label="Type d'événement *" placeholder="Sélectionner le type"
                  :options="courseTypeOptions" rules="required" :floating="false" :error="!!errors.courseType" />

                <InputSelect name="room" :label="values.type === 'distanciel' ? 'Salle (optionnel)' : 'Salle *'"
                  placeholder="Sélectionner une salle" :options="roomOptions" rules="required" :floating="false"
                  :error="!!errors.room" :disabled="values.type === 'distanciel'" />

                <InputSelect name="type" label="Mode d'enseignement *" placeholder="Sélectionner le mode"
                  :options="typeOptions" rules="required" :floating="false" :error="!!errors.type" />



                <InputField name="googleMeetLink"
                  :label="values.type !== 'presentiel' ? 'Lien Google Meet *' : 'Lien Google Meet (optionnel)'"
                  placeholder="https://meet.google.com/..." type="url" :floating="false"
                  :error="!!errors.googleMeetLink" />
              </div>
            </div>

            <!-- Planification -->
            <div class="form-section">
              <h4 class="section-title">
                <Icon icon="material-symbols:schedule-outline" />
                Planification
              </h4>

              <div class="form-grid">
                <InputField name="date" label="Date *" type="date" rules="required" :floating="false"
                  :error="!!errors.date" />

                <InputField name="startTime" label="Heure de début *" type="time" rules="required" :floating="false"
                  :model-value="selectedTime" :error="!!errors.startTime" />

                <InputSelect name="duration" label="Durée *" placeholder="Sélectionner la durée"
                  :options="durationOptions" rules="required" :floating="false" :error="!!errors.duration" />

                <div class="end-time-display">
                  <label class="end-time-label">Heure de fin</label>
                  <div class="end-time-value">
                    <Icon icon="material-symbols:schedule" class="clock-icon" />
                    <span class="time-text">
                      {{ values.startTime && values.duration ? calculatedEndTime(values.startTime, values.duration) :
                        '--:--' }}
                    </span>
                    <span class="duration-info" v-if="values.duration">
                      ({{ values.duration }}h)
                    </span>
                  </div>
                </div>


              </div>
            </div>

            <!-- Description -->
            <div class="form-section">
              <h4 class="section-title">
                <Icon icon="material-symbols:description-outline" />
                Description
              </h4>

              <div class="form-group">
                <TextAreaField name="description" label="description (optionnel)" :error="!!errors.description"
                  placeholder="Decrivez le contenu et les objectifs de cours" />
              </div>
            </div>
          </div>


          <!-- Actions -->
          <div class="form-actions">
            <ActionButton type="button" @click="closeModal" variant="outline">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="material-symbols:save"
              :disabled="isSubmitting || Object.keys(errors).length > 0">
              {{ isEdit ? 'Mettre à jour' : 'Planifier le cours' }}
            </ActionButton>
          </div>
        </Form>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { Field, Form, } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import InputField from '@/components/ui/InputField.vue'
import InputSelect from '@/components/ui/InputSelect.vue'
import type ScheduleInterface from '@/interfaces/Schedule.interface'
import type ModuleInterface from '@/interfaces/module.interface'
import ActionButton from '@/components/ui/ActionButton.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import type ProfessorInterface from '@/interfaces/professor.interface'
import type PromotionInterface from '@/interfaces/promotion.interface'
import type TeachingUnitInterface from '@/interfaces/teachingUnit.interface'


const formatDate = (date?: Date | string) => {
  if (!date) return ''

  let dateObj: Date;
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Utiliser getFullYear, getMonth, getDate pour éviter les problèmes de fuseau horaire
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}







const calculatedEndTime = (time: string, duration: number): string => {
  if (!time && !duration) return '00:00'
  const [hours, minutes] = time.split(":").map(Number);

  const totalMinutes = Math.round(duration * 60);

  const end = new Date();
  end.setHours(hours, minutes + totalMinutes, 0, 0);

  const hh = String(end.getHours()).padStart(2, "0");
  const mm = String(end.getMinutes()).padStart(2, "0");

  return `${hh}:${mm}`;
};

const props = defineProps<{
  isOpen: boolean
  selectedDate?: Date
  selectedTime?: string
  Schedule: ScheduleInterface | null
  module: ModuleInterface[]
  professors: ProfessorInterface[]
  promotions: PromotionInterface[]
}>()

const levelEdit = computed(() => {
  const promotions = props.promotions.filter((p) => props.Schedule?.promotions.find((s) => s === p._id))
  return [... new Set(promotions.map((s) => s.level))]

})




const initialValues = computed(() => ({
  courseType: props.Schedule ? props.Schedule.courseType : 'cm',
  title: props.Schedule ? props.Schedule.title : '',
  module: props.Schedule ? props.Schedule.module ? props.Schedule.module._id : '' : '',
  room: props.Schedule ? props.Schedule.room : '',
  type: props.Schedule ? props.Schedule.type : 'presentiel',
  date: props.Schedule ? formatDate(props.Schedule.date) : (props.selectedDate ? formatDate(props.selectedDate) : ''),
  startTime: props.Schedule ? props.Schedule.startTime : (props.selectedTime || ''),
  duration: props.Schedule ? props.Schedule.duration : 0.5,
  level: props.Schedule ? levelEdit.value : [],
  department: props.Schedule ? props.Schedule.department : [],
  description: props.Schedule ? props.Schedule.description : '',
  googleMeetLink: props.Schedule ? props.Schedule.googleMeetLink : '',

}))



// Types
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

// Props et émissions


const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', schedule: ScheduleInterface): void
}>()



// Données de référence avec vraies structures
const moduleOptions = computed(() => {
  return props.module.map(mod => ({
    value: mod._id,
    label: `${mod.code} - ${mod.title}`
  }))
})

// Fonction pour filtrer les modules selon les départements et niveaux sélectionnés
const getFilteredModuleOptions = (selectedDepartments: string[] = [], selectedLevels: string[] = []) => {
  // Si aucune sélection de département ou niveau, retourner tous les modules
  if (!selectedDepartments?.length || !selectedLevels?.length) {
    return moduleOptions.value
  }

  // RÈGLE STRICTE: Les modules ne sont disponibles QUE si exactement 1 département ET 1 niveau sont sélectionnés
  if (selectedDepartments.length !== 1 || selectedLevels.length !== 1) {
    return [{
      value: '',
      label: 'Mode événement - Aucun module requis pour les événements multi-départements/niveaux',
      disabled: true
    }]
  }

  const selectedDepartment = selectedDepartments[0]
  const selectedLevel = selectedLevels[0]

  const filteredModules = props.module
    .filter(mod => {
      // Vérifier si le module a une teachingUnit et si elle est populée
      if (!mod.teachingUnit || typeof mod.teachingUnit === 'string') {
        return false // Exclure les modules sans teachingUnit populée
      }

      const teachingUnit = mod.teachingUnit as TeachingUnitInterface

      // Le module doit correspondre EXACTEMENT au département ET niveau sélectionnés
      return teachingUnit.field.toLowerCase() === selectedDepartment.toLowerCase() &&
        teachingUnit.level === selectedLevel
    })
    .map(mod => ({
      value: mod._id,
      label: `${mod.code} - ${mod.title}`
    }))

  // Si aucun module trouvé pour cette combinaison unique
  if (filteredModules.length === 0) {
    return [{
      value: '',
      label: `Mode événement - Aucun module disponible pour ${selectedDepartment.toUpperCase()} ${selectedLevel}`,
      disabled: true
    }]
  }

  return filteredModules
}



const roomOptions: SelectOption[] = [
  { value: 'A101', label: 'A101' },
  { value: 'A102', label: 'A102' },
  { value: 'B201', label: 'B201' },
  { value: 'B202', label: 'B202' },
  { value: 'Lab Info 1', label: 'Lab Info 1' },
  { value: 'Lab Info 2', label: 'Lab Info 2' },
  { value: 'ISA', label: 'ISA' }
]

const courseTypeOptions: SelectOption[] = [
  { value: 'cm', label: 'Cours Magistral (CM)' },
  { value: 'td', label: 'Travaux Dirigés (TD)' },
  { value: 'tp', label: 'Travaux Pratiques (TP)' },
  { value: 'exam', label: 'Examen' },
  { value: 'other', label: 'Autre' }
]

const typeOptions: SelectOption[] = [
  { value: 'presentiel', label: 'Présentiel' },
  { value: 'distanciel', label: 'Distanciel' },
  { value: 'hybride', label: 'Hybride' }
]

const departmentOptions: SelectOption[] = [
  { value: 'informatique', label: 'Informatique' },
  { value: 'gestion', label: 'Gestion' },
  { value: 'btp', label: 'BTP' }
]

const levels: SelectOption[] = [
  { value: 'L1', label: 'L1' },
  { value: 'L2', label: 'L2' },
  { value: 'L3', label: 'L3' },
  { value: 'M1', label: 'M1' },
  { value: 'M2', label: 'M2' }
]





const durationOptions: SelectOption[] = [
  { value: 0.5, label: '30 minutes' },
  { value: 1, label: '1 heure' },
  { value: 1.5, label: '1h30' },
  { value: 2, label: '2 heures' },
  { value: 2.5, label: '2h30' },
  { value: 3, label: '3 heures' },
  { value: 4, label: '4 heures' }
]






// Schema de validation avec Zod
const validationSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Le titre est requis'),
    module: z.string().optional(),
    courseType: z.string().min(1, 'Le type de cours est requis'),
    room: z.string().optional(),
    type: z.string().min(1, 'Le mode d\'enseignement est requis'),
    date: z.string().min(1, 'La date est requise')
      .refine((date) => {
        const today = new Date();
        // Remet l'heure à 00:00 pour comparer uniquement la date
        today.setHours(0, 0, 0, 0);
        const dateTransformed = new Date(date);
        dateTransformed.setHours(0, 0, 0, 0);
        return dateTransformed > today;
      }, {
        message: "La date doit être celui de demain ou plus tard",
      }),
    startTime: z.string().min(1, 'L\'heure de début est requise'),
    duration: z.number(),
    level: z.array(z.string()).min(1, 'Au moins un niveau est requis'),
    department: z.array(z.string()).min(1, 'Au moins un département est requis'),
    description: z.string().optional(),
    googleMeetLink: z.string().url('URL invalide').optional().nullable().or(z.literal('')),
  }).superRefine((data, ctx) => {
    if (data.type !== 'presentiel' && !data.googleMeetLink) {
      ctx.addIssue({
        path: ['googleMeetLink'],
        code: 'custom',
        message: 'Un lien Google Meet est requis pour les cours en ligne ou hybride',
      })
    }
    if ((data.level.length === 1 && data.department.length === 1) && (!data.module || data.module === '') && data.courseType !== 'other') {
      ctx.addIssue({
        path: ['module'],
        code: 'custom',
        message: 'Le module est requis lorsque un seul niveau et un seul département sont sélectionnés.',
      });
    }
    if ((data.level.length > 1 || data.department.length > 1) && data.courseType !== 'other') {
      ctx.addIssue({
        path: ['courseType'],
        code: 'custom',
        message: "Le type d'événement doit être 'Autre' lorsque des niveaux et départements sont sélectionnés"
      })
    }
    if (data.type === 'presentiel' && (data.level.length === 1 && data.department.length === 1) && (!data.room || data.room === '')) {
      ctx.addIssue({
        path: ['room'],
        code: 'custom',
        message: 'un salle est requise lorsque un seul niveau ou un seul département est sélectionné.'
      })
    }
    if (data.type === 'hybride' && (data.level.length === 1 && data.department.length === 1) && (!data.room || data.room === '')) {
      ctx.addIssue({
        path: ['room'],
        code: 'custom',
        message: 'un salle est requise lorsque hybride est sélectionné.'
      })
    }
  }
  ))

const handleSubmit = (values: Record<string, unknown>) => {

  const professor = props.module.find((s) => props.professors.find((p) => p._id === s.teacher))
  const isOptionnal = (values.level && values.level.length > 1) || (values.department && values.department.length > 1) || values.courseType === 'other'

  if (isOptionnal) {
    values.module = null
  }

  if (values.type === 'distanciel') {
    values.room = null
  }

  const schedule = {
    ...values,
    endTime: calculatedEndTime(values.startTime as string, values.duration as number),
    professor: isOptionnal ? null : professor?.teacher
  }




  emit('save', schedule as unknown as ScheduleInterface)


}

const isPromotionAvailable = (department: string, level: string) => {
  return props.promotions.some(
    (p) => p.field === department && p.level === level
  );
};




const isEdit = computed(() => !!props.Schedule)


const closeModal = () => {
  emit('close')
}

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
  max-width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
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
  color: white;
  position: relative;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-content .iconify {
  font-size: 1.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
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
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
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
  max-height: calc(90vh - 80px);
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

.schedule-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: var(--background-light);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  transition: box-shadow 0.2s ease;
}

.form-section:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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
  border-radius: 8px;
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

.form-group label {
  font-weight: 500;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.875rem 1rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  background: white;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-input[readonly] {
  background: var(--background-light);
  color: var(--text-secondary);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-dark);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-light);
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.checkbox-input:checked+.checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: var(--gray-light);
  color: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: var(--text-dark);
  border: 2px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--background-light);
  border-color: var(--primary-color);
}

/* Styles pour les checkboxes personnalisées et validation */
.static-label {
  display: block;
  margin-bottom: 0.75rem;
  color: var(--text-dark);
  font-size: 0.95rem;
  font-weight: 600;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-dark);
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  background: white;
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  border-color: var(--primary-color);
  background: var(--primary-extra-light);
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-light);
  border-radius: 4px;
  background: white;
  transition: all 0.2s ease;
  position: relative;
  flex-shrink: 0;
}

.checkbox-input:checked+.checkbox-custom {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-input:checked+.checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 11px;
}

.checkbox-input:checked+.checkbox-custom+span {
  color: var(--primary-color);
  font-weight: 600;
}

.error-message {
  color: var(--error);
  font-size: 0.85rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(var(--error-rgb), 0.1);
  border-radius: 6px;
  border-left: 3px solid var(--error);
}

/* Styles pour le message d'information sur l'absence de modules - Version compacte */
.no-modules-info.compact {
  grid-column: 1 / -1;
  margin: 0.5rem 0;
  padding: 0.75rem 1rem;
  background: rgba(255, 193, 7, 0.08);
  border-radius: 6px;
  border-left: 3px solid #f59e0b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.no-modules-info.compact .info-icon {
  color: #d97706;
  font-size: 1rem;
  flex-shrink: 0;
}

.no-modules-info.compact .info-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.no-modules-info.compact .info-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #92400e;
}

.no-modules-info.compact .info-details {
  margin: 0;
  font-size: 0.8rem;
  color: #a16207;
  font-weight: 500;
}

.no-promotions {
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--radius);
  border: 1px dashed var(--border-light);
  text-align: center;
}

/* Styles pour les champs readonly */
.form-input[readonly] {
  background: var(--background-light);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}

/* Scrollbar */
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

/* Styles pour la section de vérification des promotions - Version compacte */
.promotion-check-section {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--background-light);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.promotion-status {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-dark);
}

.status-title .iconify {
  color: var(--primary-color);
  font-size: 1rem;
}

.promotion-grid.compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.promotion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.promotion-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.promotion-name {
  font-weight: 500;
  color: var(--text-dark);
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.status-badge.available {
  background: var(--success);
  color: white;
}

.status-badge.unavailable {
  background: #f59e0b;
  color: white;
}

/* Styles pour l'affichage de l'heure de fin */
.end-time-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.end-time-label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.end-time-value {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--background-light);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.clock-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.time-text {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-dark);
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.duration-info {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  background: var(--primary-extra-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: auto;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .header-content h3 {
    font-size: 1.1rem;
  }

  .header-content .iconify {
    font-size: 1.25rem;
    padding: 0.4rem;
  }

  .form-section {
    padding: 1rem;
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

  .checkbox-group {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .checkbox-label {
    padding: 0.5rem;
    font-size: 0.85rem;
  }

  .promotion-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .status-header {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .promotion-info {
    align-items: flex-start;
  }

  .end-time-value {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .duration-info {
    margin-left: 0;
    align-self: flex-start;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .static-label {
    font-size: 0.9rem;
  }

  .promotion-label {
    font-size: 0.9rem;
  }

  .status-text {
    font-size: 0.8rem;
  }

  .warning-message {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .modal-container {
    margin: 0.25rem;
    max-height: calc(100vh - 0.5rem);
  }

  .header-content h3 {
    font-size: 1rem;
  }

  .section-title {
    font-size: 0.95rem;
  }

  .checkbox-label {
    font-size: 0.8rem;
  }

  .form-grid {
    gap: 0.75rem;
  }
}
</style>
