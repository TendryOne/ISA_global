<template>
  <div class="elite-modal-overlay">
    <div class="elite-modal-container">
      <div class="modal-header">
        <div class="header-content">
          <h2 class="modal-title">{{ module ? `Modification du module ${module.code}` : 'Créer un module' }}</h2>
          <p class="modal-subtitle">UE {{ teachingUnit?.code }} - {{ teachingUnit?.name }}</p>
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
          v-slot="{ errors, }">
          <div class="form-grid">
            <div class="form-group">
              <InputField name="code" floating label="Code du module" icon="mdi:identifier" :error="!!errors.code" />
            </div>

            <div class="form-group">
              <InputField name="title" floating label="Intitulé du module" icon="mdi:book-education"
                :error="!!errors.title" />
            </div>

            <div class="form-group">
              <InputSelect name="type" label="Type de module" icon="mdi:format-list-checks" :options="[
                { value: 'Cours Magistral', label: 'Cours Magistral (CM)' },
                { value: 'Travaux Dirigés', label: 'Travaux Dirigés (TD)' },
                { value: 'TP', label: 'Travaux Pratiques (TP)' }
              ]" floating :error="!!errors.type" />
            </div>

            <div class="form-group">
              <InputField type="number" name="hours" floating label="Volume horaire (heures)" icon="mdi:clock-outline"
                :error="!!errors.hours" />
            </div>


            <div class="form-group">
              <InputField type="number" name="credits" floating :label="`Crédits ECTS `" icon="mdi:weight"
                :error="!!errors.credits" />
            </div>

            <div class="form-group">
              <InputField type="number" name="coefficient" floating label="Coefficient" icon="mdi:scale"
                :error="!!errors.coefficient" />
            </div>

            <div class="form-group full-width">
              <InputSelect name="teacher" label="Enseignant responsable (optionnel)" icon="mdi:account-tie"
                :options="teachers.map(t => ({ value: t._id, label: `${t.firstName} ${t.name}` }))" floating
                :error="!!errors.teacher" />
              <p class="note">La désignation de l’enseignant responsable pourra être effectuée ultérieurement.</p>
            </div>

            <div class="form-group full-width">
              <TextAreaField name="description" label="Description pédagogique" floating icon="mdi:text-box"
                :error="!!errors.description" />
            </div>

            <!-- Fichiers existants en mode édition -->
            <div v-if="module && existingFilesState.length" class="form-group full-width premium-existing-files">
              <label class="premium-section-label">
                <Icon icon="mdi:file-document-multiple" class="label-icon" />
                Fichiers existants
              </label>

              <ul class="premium-existing-files-list">
                <li v-for="(f, i) in existingFilesState" :key="f.name + '_' + i" class="premium-file-item">
                  <div class="premium-file-chip" :class="{ 'has-link': f.url }">
                    <div class="file-icon-container">
                      <Icon icon="mdi:file-pdf-box" class="file-icon" />
                    </div>

                    <div class="file-info">
                      <a v-if="f.url" :href="f.url" target="_blank" rel="noopener" class="file-link" :title="f.name">
                        <span class="file-name">{{ truncateFileName(f.name, 28) }}</span>
                        <Icon icon="mdi:open-in-new" class="external-link-icon" />
                      </a>
                      <span v-else class="file-name">{{ truncateFileName(f.name, 28) }}</span>
                      <span class="file-status">Enregistré</span>
                    </div>

                    <button class="remove-existing-btn" type="button" @click="openDeleteConfirm(f, i)"
                      :disabled="deletingIndexes.has(i) || !f.url" aria-label="Supprimer le fichier"
                      data-tooltip="Supprimer">
                      <Icon v-if="!deletingIndexes.has(i)" icon="mdi:close-circle" />
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.3" />
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                          stroke-linejoin="round">
                          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12"
                            dur="1s" repeatCount="indefinite" />
                        </path>
                      </svg>
                    </button>
                  </div>

                  <div class="file-actions" v-if="f.url">
                    <button class="download-btn" @click="downloadFile(f)" data-tooltip="Télécharger">
                      <Icon icon="mdi:download" />
                    </button>
                    <button class="preview-btn" @click="previewFile(f)" data-tooltip="Aperçu">
                      <Icon icon="mdi:eye" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <!-- Nouvelle section d'upload avec design premium -->
          <div class="form-group full-width premium-file-upload">
            <label class="premium-label">Ajouter des fichiers PDF</label>
            <div class="premium-upload-container" :class="{ 'has-files': files.length, 'drag-over': isDragOver }"
              @dragover.prevent="handleDragOver" @dragleave="handleDragLeave" @drop.prevent="handleDrop">

              <input id="premium-files" type="file" multiple accept="application/pdf" @change="handleFilesChange"
                class="premium-file-input" />

              <label for="premium-files" class="upload-content" v-if="!files.length">
                <div class="upload-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                      stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    <path d="M14 2V8H20" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M16 13H8" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M16 17H8" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                    <path d="M10 9H9H8" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <div class="upload-text">
                  <p class="upload-title">Glissez-déposez vos fichiers ici</p>
                  <p class="upload-subtitle">ou <span class="browse-link">parcourir</span></p>
                </div>
                <p class="upload-requirements">PDF uniquement • 5MB max par fichier</p>
              </label>

              <div class="files-preview" v-else>
                <div class="preview-header">
                  <span class="files-count">{{ files.length }} fichier(s) sélectionné(s)</span>
                  <button type="button" class="clear-all-btn" @click.stop="files = []">
                    Tout effacer
                  </button>
                </div>

                <div class="files-grid">
                  <div v-for="(file, index) in files" :key="getFileKey(file, index)" class="file-preview-card">
                    <div class="file-preview-content">
                      <div class="file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                            fill="var(--danger-color)" fill-opacity="0.2" stroke="var(--danger-color)"
                            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M14 2V8H20" stroke="var(--danger-color)" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                          <text x="7" y="16" fill="var(--danger-color)" font-size="10" font-weight="bold">PDF</text>
                        </svg>
                      </div>
                      <div class="file-info">
                        <p class="file-name" :title="file.name">{{ truncateFileName(file.name, 25) }}</p>
                        <p class="file-size">{{ formatFileSize(file.size) }}</p>
                      </div>
                      <button type="button" class="remove-file-btn" @click.stop="removeFile(index)"
                        aria-label="Supprimer ce fichier">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                          <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <div class="upload-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: '100%' }"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="fileError" class="premium-error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ fileError }}</span>
            </div>

            <p class="premium-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 16H12.01M12 8V12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Formats acceptés: PDF. Taille maximale: 5MB par fichier.
            </p>
          </div>

          <div class="modal-actions">
            <ActionButton type="button" variant="danger" @click="closeModal">
              Annuler
            </ActionButton>
            <ActionButton type="submit" icon="mdi:plus-box" v-if="!module" :disabled="!!fileError || loading">

              {{ loading ? 'Création en cours ...' : 'Créer le module' }}
            </ActionButton>
            <ActionButton type="submit" icon="material-symbols:save" v-else :disabled="!!fileError || loading">

              {{ loading ? 'Enregistrement en cours ...' : 'Enregistrer' }}
            </ActionButton>
          </div>

        </Form>
      </div>
    </div>
  </div>
  <ConfirmModal :show="!!urlModal" message="Supprimer ce fichier ?" title="Confirmation"
    @confirm="handleDeleteExistingFile" @cancel="() => { urlModal = ''; urlIndex = null }" />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Form } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import InputField from '@/components/ui/InputField.vue'
import TextAreaField from '@/components/ui/TextAreaField.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import InputSelect from '@/components/ui/InputSelect.vue'
import { Icon } from '@iconify/vue'
import type ModuleInterface from '@/interfaces/module.interface'
import type TeachingUnitInterface from '@/interfaces/teachingUnit.interface'
import type ProfessorInterface from '@/interfaces/professor.interface'
import ConfirmModal from '../Admission/confirmModal.vue'

const urlModal = ref<string | undefined>('');
const urlIndex = ref<number | null>(null);
const files = ref<File[]>([])
const fileError = ref<string>('')
const deletingIndexes = ref<Set<number>>(new Set())

const handleFilesChange = (event: Event) => {
  fileError.value = ''
  const input = event.target as HTMLInputElement
  if (input.files) {
    const selectedFiles = Array.from(input.files)
    const invalidType = selectedFiles.some(f => f.type !== 'application/pdf')
    const tooLarge = selectedFiles.some(f => f.size > 5 * 1024 * 1024)
    if (invalidType) {
      fileError.value = 'Seuls les fichiers PDF sont acceptés.'
      files.value = []
      return
    }
    if (tooLarge) {
      fileError.value = 'Un ou plusieurs fichiers dépassent 5MB.'
      files.value = []
      return
    }
    files.value = selectedFiles
  }
}

const isDragOver = ref(false)

const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false
  if (e.dataTransfer?.files) {
    const input = document.getElementById('premium-files') as HTMLInputElement
    if (input) {
      input.files = e.dataTransfer.files
      const event = new Event('change', { bubbles: true })
      input.dispatchEvent(event)
    }
  }
}

const getFileKey = (file: File, index: number) => {
  return `${file.name}_${file.size}_${file.lastModified}_${index}`
}

const truncateFileName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name
  const extension = name.split('.').pop()
  const baseName = name.substring(0, name.length - extension!.length - 1)
  return `${baseName.substring(0, maxLength - extension!.length - 3)}...${extension}`
}

const downloadFile = (file: { name: string; url?: string }) => {
  if (!file.url) return

  const a = document.createElement('a')
  a.href = file.url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const previewFile = (file: { name: string; url?: string }) => {
  if (!file.url) return
  window.open(file.url, '_blank')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const removeFile = (index: number) => {
  files.value.splice(index, 1)
}

const props = defineProps<{
  module: ModuleInterface | null
  teachingUnit: TeachingUnitInterface | null
  teachers: ProfessorInterface[]
  loading: boolean
  remainingCredits: number
}>()

// Types locaux pour la gestion des fichiers existants côté module (sans modifier l'interface globale)
type ModuleFileObject = {
  name?: string
  url?: string
  path?: string
  location?: string
  link?: string
  originalName?: string
  filename?: string
  fileName?: string
}
type ModuleWithFiles = ModuleInterface & { files?: Array<string | ModuleFileObject> }

const RealRemainingCredits = computed(() => {
  if (!props.module) return props.remainingCredits
  return props.remainingCredits + (props.module.credits || 0)
})

// Normalise les fichiers existants venant du module pour l'affichage
const existingFiles = computed((): { name: string; url?: string }[] => {
  const mod = props.module as ModuleWithFiles | null
  const raw = (mod?.files ?? []) as Array<string | ModuleFileObject>
  if (!Array.isArray(raw)) return []
  return raw.map((f: string | ModuleFileObject) => {
    if (typeof f === 'string') {
      const url = f
      const parts = f.split(/[\\/]/) // gère \ et /
      const name = (parts.pop() || f).split('?')[0]
      return { name, url }
    }
    const name = f.name || f.originalName || f.filename || f.fileName || 'document.pdf'
    const url = f.url || f.path || f.location || f.link
    return { name, url }
  })
})

// État local modifiable pour permettre la suppression visuelle avant envoi
const existingFilesState = ref<{ name: string; url?: string }[]>([])

// Synchronise quand les fichiers existants changent (ex: après suppression serveur)
watch(existingFiles, (list) => {
  existingFilesState.value = [...list]
  deletingIndexes.value = new Set()
}, { immediate: true })

const openDeleteConfirm = (f: { name: string; url?: string }, index: number) => {
  urlModal.value = f.url
  urlIndex.value = index
}

const handleDeleteExistingFile = async () => {
  // Retirer immédiatement côté UI et marquer l'index comme en suppression
  if (urlIndex.value !== null) {
    deletingIndexes.value.add(urlIndex.value)
    existingFilesState.value.splice(urlIndex.value, 1)
  }
  // Prévenir le parent pour suppression serveur
  emit('remove-existing-file', urlModal.value, props.module)
  // Reset état modal
  urlModal.value = ''
  urlIndex.value = null
}

const initialValues = computed(() => ({
  code: props.module?.code || '',
  title: props.module?.title || '',
  type: props.module?.type || 'Cours Magistral',
  hours: props.module?.hours || 24,
  credits: props.module?.credits || RealRemainingCredits.value,
  coefficient: props.module?.coefficient || 1,
  description: props.module?.description || '',
  teacher: props.module?.teacher._id || '',
  teachingUnit: props.teachingUnit?._id || '',
  files: [] as File[]
}))

const validationSchema = toTypedSchema(
  z.object({
    code: z.string().min(1, 'Le code est obligatoire').max(20, 'Le code est trop long'),
    title: z.string().min(3, "L'intitulé doit contenir au moins 3 caractères").max(100, "L'intitulé est trop long"),
    type: z.string().min(1, 'Le type est obligatoire'),
    hours: z.number().min(10, 'Le volume horaire minimum est de 10h').max(120, 'Le volume horaire maximum est de 120h'),
    credits: z.number({ required_error: 'Le nombre de crédits est obligatoire', invalid_type_error: 'Le nombre de crédits doit être un nombre' })
      .min(1, 'Le nombre minimum de crédits est 1')
      .max(10, 'Le nombre maximum de crédits est 10')
      .refine((val) => val <= RealRemainingCredits.value, {
        message: `Le nombre de crédits ne peut pas dépasser ${RealRemainingCredits.value} (crédits restants)`,
      }),

    coefficient: z.number().min(1, 'Le coefficient minimum est 1').max(5, 'Le coefficient maximum est 5'),
    teacher: z.string().optional().nullable(),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères').max(1000, 'La description est trop longue'),
  })
)

const emit = defineEmits(['close', 'submit', 'remove-existing-file'])

const closeModal = () => {
  emit('close')
}

const submitForm = (values: Record<string, unknown>) => {
  emit('submit', {
    ...values,
    files: files.value,
    teachingUnit: props.teachingUnit?._id
  })
}
</script>

<style scoped>
.note {
  font-size: 12px;
  font-style: italic;
  color: var(--gray);
}


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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--gray-lighter);
}

.premium-file-upload {
  margin-top: 1.5rem;
}

.premium-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.premium-upload-container {
  border: 2px dashed var(--gray-light);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  transition: all 0.3s ease;
  background: rgba(249, 250, 251, 0.5);
  position: relative;
  overflow: hidden;
}

.premium-upload-container:hover {
  border-color: var(--primary-color);
  background: rgba(79, 70, 229, 0.03);
}

.premium-upload-container.drag-over {
  border-color: var(--primary-color);
  background: rgba(79, 70, 229, 0.08);
  transform: scale(1.01);
}

.premium-upload-container.has-files {
  padding: 1.5rem;
  border-style: solid;
  background: white;
}

.premium-file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.upload-content {
  text-align: center;
  color: var(--gray);


}

.upload-icon {
  margin-bottom: 1rem;
  opacity: 0.8;
}

.upload-title {
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
  font-size: 1.125rem;
}

.upload-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 0.95rem;
}

.browse-link {
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}

.upload-requirements {
  font-size: 0.8rem;
  margin: 0;
  opacity: 0.7;
}

.files-preview {
  width: 100%;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.files-count {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.9rem;
}

.clear-all-btn {
  background: none;
  border: none;
  color: var(--danger-color);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.file-preview-card {
  background: white;
  border: 1px solid var(--gray-lighter);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.file-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.file-preview-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 0.75rem;
}

.file-icon {
  flex-shrink: 0;
}

.file-info {
  flex-grow: 1;
  min-width: 0;
}

.file-info .file-name {
  margin: 0 0 0.25rem 0;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info .file-size {
  margin: 0;
  font-size: 0.75rem;
  color: var(--gray);
}

.remove-file-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

.upload-progress {
  padding: 0 1rem 1rem;
}

.progress-bar {
  height: 4px;
  background: var(--gray-lighter);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.premium-error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: var(--error);
  font-size: 0.85rem;
  font-weight: 500;
}

.premium-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--gray);
}

/* Styles premium pour les fichiers existants */
.premium-existing-files {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-lighter);
}

.premium-section-label {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.95rem;
  gap: 0.5rem;
}

.label-icon {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.premium-existing-files-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.premium-file-item {
  background: white;
  border: 1px solid var(--gray-lighter);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.premium-file-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-light);
}

.premium-file-chip {
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  gap: 0.875rem;
  position: relative;
}

.file-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 10px;
  flex-shrink: 0;
}

.file-icon {
  color: var(--danger-color);
  font-size: 1.5rem;
}

.file-info {
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;
}

.file-link:hover {
  color: var(--primary-color);
}

.file-link:hover .external-link-icon {
  transform: translate(2px, -2px);
}

.external-link-icon {
  color: var(--primary-color);
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.file-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-status {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
  border-radius: 100px;
  font-weight: 500;
  width: fit-content;
}

.remove-existing-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  font-size: 1.25rem;
}

.remove-existing-btn:hover {
  color: var(--error);
  background: rgba(239, 68, 68, 0.1);
}

.remove-existing-btn::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
}

.remove-existing-btn:hover::before {
  opacity: 1;
  visibility: visible;
  bottom: -35px;
}

.file-actions {
  display: flex;
  border-top: 1px solid var(--gray-lightest);
  padding: 0.75rem 1.25rem;
  background: rgba(249, 250, 251, 0.5);
  gap: 0.5rem;
}

.download-btn,
.preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  font-size: 1.1rem;
}

.download-btn:hover,
.preview-btn:hover {
  background: rgba(79, 70, 229, 0.1);
}

.download-btn::before,
.preview-btn::before {
  content: attr(data-tooltip);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s;
  pointer-events: none;
}

.download-btn:hover::before,
.preview-btn:hover::before {
  opacity: 1;
  visibility: visible;
  bottom: -35px;
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

  .premium-upload-container {
    padding: 1.5rem;
  }

  .files-grid {
    grid-template-columns: 1fr;
  }

  .upload-title {
    font-size: 1rem;
  }
}
</style>
