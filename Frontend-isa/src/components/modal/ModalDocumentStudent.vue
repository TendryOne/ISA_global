<template>
  <div class="overlay">
    <div class="upload-container">
      <div class="upload-card">
        <div class="upload-header">
          <div class="header-icon">
            <Icon icon="line-md:upload-loop" />
          </div>
          <h2>Relevé de Notes du Baccalauréat</h2>

          <p class="header-subtitle">
            Il semble que vous n'ayez pas encore rendu votre relevé de notes
          </p>
        </div>

        <Form @submit="handleSubmit" :validation-schema="validationSchema" class="upload-form">
          <div class="file-upload-section">
            <label for="bac" class="file-label">
              <div class="label-content">
                <span class="label-text">Téléverser votre relevé de notes du bac</span>
                <Icon icon="line-md:download-loop" class="download-icon" />
              </div>
              <span class="label-hint">Formats acceptés: JPG, PNG (max. 3MB)</span>
            </label>
            <div class="file-input-wrapper">
              <Field name="bacTranscript" v-slot="{ field, errorMessage }">
                <input type="file" id="bac" accept="image/png, image/jpeg" class="file-input"
                  @change="handleFileChange($event, field)" />
                <div class="file-drop-zone" :class="{ 'has-file': selectedFile, 'has-error': errorMessage }">
                  <div class="drop-zone-content">
                    <Icon :icon="selectedFile ? 'line-md:file' : 'line-md:upload-loop'" class="drop-zone-icon" />
                    <div class="drop-zone-text">
                      <p class="main-text">
                        {{
                          selectedFile
                            ? selectedFile.name
                            : 'Glissez-déposez votre fichier ici ou cliquez pour parcourir'
                        }}
                      </p>
                      <p class="file-info" v-if="selectedFile">
                        Taille: {{ formatFileSize(selectedFile.size) }}
                      </p>
                    </div>
                    <button v-if="selectedFile" type="button" class="remove-file-btn" @click="removeFile">
                      <Icon icon="line-md:close" />
                    </button>
                  </div>
                </div>
              </Field>
            </div>

            <ErrorMessage name="bacTranscript" class="error-message" />
          </div>

          <ActionButton full-width type="submit" class="submit-button" icon="ph:check-circle" iconPosition="right"
            :disabled="isSubmitting">
            <span>{{
              isSubmitting ? 'Téléversement en cours...' : 'Envoyer le relevé de note'
            }}</span>
          </ActionButton>
        </Form>
      </div>
    </div>

    <SuccessToast v-if="toast.show" :message="toast.message" :type="toast.type" :title="toast.title"
      @dismissed="toast.show = false" />
  </div>
</template>

<script setup lang="ts">
import ActionButton from '../ui/ActionButton.vue'
import { Icon } from '@iconify/vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import SuccessToast from '../toast/successToast.vue'
import { ref } from 'vue'
import type { ToastInterface } from '@/interfaces/toast.interface'
import axios from 'axios'
import { useMyUserStore } from '@/stores/userStore'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import TheImageVisualizer from '../images/TheImageVisualizer.vue'

const toast = ref<ToastInterface>({
  show: false,
  message: '',
  type: 'success',
  title: 'Succès',
})

const userStore = useMyUserStore()
const selectedFile = ref<File | null>(null)
const isSubmitting = ref(false)

const validationSchema = toTypedSchema(
  z.object({
    bacTranscript: z
      .any()
      .refine((file) => file instanceof File, 'Veuillez sélectionner un fichier.')
      .refine(
        (file) => file && file.size <= 3 * 1024 * 1024,
        'Le fichier doit être inférieur à 3MB.',
      )
      .refine(
        (file) => file && ['image/jpeg', 'image/png'].includes(file.type),
        'Le fichier doit être au format JPG ou PNG.',
      ),
  }),
)

const handleFileChange = (event: Event, field: any) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    field.onChange(target.files[0])
  }
}

const removeFile = () => {
  selectedFile.value = null
  const fileInput = document.getElementById('bac') as HTMLInputElement
  if (fileInput) {
    fileInput.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async (values: any) => {
  isSubmitting.value = true

  try {
    const formData = new FormData()
    formData.append('bacTranscript', values.bacTranscript)

    const response = await axios.post('/api/v1/students/uploadBacTranscript', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        matricule: userStore.currentUser?.matricule,
        studentId: userStore.currentUser?._id,
      },
    })

    userStore.UpdateUserLocally(response.data)

    toast.value = {
      show: true,
      message: 'Votre relevé de notes a été téléversé avec succès !',
      type: 'success',
      title: 'Succès',
    }
  } catch (error) {
    toast.value = {
      show: true,
      message: error.response?.data?.error || 'Une erreur est survenue lors du téléversement.',
      type: 'error',
      title: 'Erreur',
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 1);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.upload-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.upload-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.upload-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
  padding: 2.5rem 2rem;
  text-align: center;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.upload-header h2 {
  margin: 0 0 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.header-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.upload-form {
  padding: 2.5rem 2rem;
}

.file-upload-section {
  margin-bottom: 2rem;
}

.file-label {
  display: block;
  margin-bottom: 1rem;
}

.label-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.label-text {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.download-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.label-hint {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.file-input-wrapper {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
  z-index: 2;
}

.file-drop-zone {
  border: 2px dashed var(--border-secondary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  background: var(--background-secondary);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.file-drop-zone:hover {
  border-color: var(--primary-color);
  background: var(--primary-extra-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.file-drop-zone.has-file {
  border-color: var(--success);
  background: var(--success-light);
}

.file-drop-zone.has-error {
  border-color: var(--error);
  background: rgba(var(--error-rgb), 0.05);
}

.drop-zone-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.drop-zone-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.file-drop-zone.has-file .drop-zone-icon {
  color: var(--success);
}

.drop-zone-text {
  flex-grow: 1;
  min-width: 0;
}

.main-text {
  margin: 0 0 0.5rem;
  font-weight: 500;
  color: var(--text-dark);
  word-break: break-word;
}

.file-info {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.remove-file-btn {
  background: var(--error-light);
  border: none;
  border-radius: var(--radius);
  padding: 0.5rem;
  cursor: pointer;
  color: var(--error);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-file-btn:hover {
  background: var(--error);
  color: var(--white);
  transform: scale(1.1);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
}

.upload-info {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--background-light);
  border-radius: var(--radius);
  border-left: 4px solid var(--info);
  margin-bottom: 2rem;
}

.info-icon {
  flex-shrink: 0;
  color: var(--info);
  font-size: 1.5rem;
}

.info-content h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--text-dark);
}

.info-content p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.submit-btn {
  width: 100%;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.submit-btn:disabled {
  background: var(--tertiary-light);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-container {
    padding: 1rem;
  }

  .upload-header {
    padding: 2rem 1.5rem;
  }

  .upload-form {
    padding: 2rem 1.5rem;
  }

  .drop-zone-content {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .upload-info {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .upload-header h2 {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .file-drop-zone {
    padding: 1.5rem;
  }
}
</style>
