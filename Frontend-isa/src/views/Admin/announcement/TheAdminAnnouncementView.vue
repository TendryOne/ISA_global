<template>
  <div class="announcement-container">
    <!-- En-tête -->
    <div class="announcement-header">
      <div class="header-icon">
        <Icon icon="ph:megaphone-duotone" />
      </div>
      <div class="header-text">
        <h1 class="header-title">Annonces Globales</h1>
        <p class="header-subtitle">Envoyez des notifications importantes à tous les utilisateurs</p>
      </div>
    </div>

    <!-- Bannière d'information -->
    <div class="info-banner">
      <div class="info-icon">
        <Icon icon="ph:info-duotone" />
      </div>
      <div class="info-content">
        <h4>À propos des annonces</h4>
        <p>
          Les annonces sont envoyées instantanément sous forme de notifications push.
          Les utilisateurs seront notifiés selon le <strong>niveau de priorité</strong> choisi.
        </p>
      </div>
    </div>

    <!-- Boutons rapides de maintenance -->
    <div class="quick-actions-section">
      <div class="quick-actions-header">
        <Icon icon="ph:lightning-duotone" />
        <h3>Actions rapides</h3>
      </div>
      <div class="quick-actions-grid">
        <button class="quick-action-btn maintenance" @click="sendMaintenanceNotification" :disabled="loading">
          <Icon icon="ph:wrench-duotone" />
          <span>Maintenance programmée</span>
        </button>
        <button class="quick-action-btn urgent" @click="sendUrgentNotification" :disabled="loading">
          <Icon icon="ph:warning-duotone" />
          <span>Alerte urgente</span>
        </button>
        <button class="quick-action-btn schedule" @click="sendScheduleNotification" :disabled="loading">
          <Icon icon="ph:calendar-x-duotone" />
          <span>Modification emploi du temps</span>
        </button>
        <button class="quick-action-btn system" @click="sendSystemNotification" :disabled="loading">
          <Icon icon="ph:gear-duotone" />
          <span>Mise à jour système</span>
        </button>
      </div>
    </div>

    <!-- Formulaire d'annonce -->
    <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors, values, meta }">
      <div class="announcement-form">
        <!-- Carte du formulaire -->
        <div class="form-card">
          <div class="form-section">
            <div class="section-header">
              <Icon icon="ph:users-three-duotone" />
              <h3>Destinataires</h3>
            </div>

            <InputSelect name="targetAudience" label="Public cible" placeholder="Sélectionnez le public cible"
              :options="audienceOptions" :error="!!errors.targetAudience" floating />
          </div>

          <div class="form-section">
            <div class="section-header">
              <Icon icon="ph:chat-circle-text-duotone" />
              <h3>Contenu de l'annonce</h3>
            </div>

            <InputField name="title" label="Titre de l'annonce" placeholder="Ex: Nouvelle procédure administrative"
              :error="!!errors.title" floating />

            <div class="form-group">
              <label for="message" class="textarea-label">Message</label>
              <Field id="message" name="message" as="textarea" placeholder="Rédigez votre message ici..."
                class="form-textarea" :class="{ 'has-error': errors.message }" />
              <div class="char-counter" :class="{ warning: values.message?.length > 450 }">
                {{ values.message?.length || 0 }} / 500 caractères
              </div>
              <ErrorMessage name="message" class="error-message" />
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <Icon icon="ph:tag-duotone" />
              <h3>Catégorisation</h3>
            </div>

            <div class="form-row">
              <InputSelect name="informationType" label="Type d'information" placeholder="Sélectionnez un type"
                :options="informationTypeOptions" :error="!!errors.informationType" floating />

              <InputSelect name="warningLevel" label="Niveau de priorité" placeholder="Sélectionnez le niveau"
                :options="warningLevelOptions" :error="!!errors.warningLevel" floating />
            </div>
          </div>

          <div class="form-section">
            <div class="section-header">
              <Icon icon="ph:link-duotone" />
              <h3>Action (Optionnel)</h3>
            </div>

            <InputField name="linkTo" label="Lien de redirection"
              placeholder="/student/dashboard ou https://example.com" :error="!!errors.linkTo" floating />
            <span class="field-hint">
              <Icon icon="ph:info" />
              Lien vers lequel les utilisateurs seront redirigés en cliquant sur la notification
            </span>
          </div>
        </div>

        <!-- Aperçu de la notification -->
        <div class="preview-card">
          <div class="preview-header">
            <Icon icon="ph:eye-duotone" />
            <h3>Aperçu de la notification</h3>
          </div>

          <div class="notification-preview" :class="[
            `level-${values.warningLevel || 'info'}`,
            { 'has-content': values.title || values.message }
          ]">
            <div class="level-indicator" :class="`level-${values.warningLevel || 'info'}`"></div>

            <div class="preview-icon-wrapper" :class="`type-${values.informationType || 'announcement'}`">
              <Icon :icon="getInformationTypeIcon(values.informationType || 'announcement')" />
            </div>

            <div class="preview-body">
              <div class="preview-top">
                <h4 class="preview-title">{{ values.title || 'Titre de l\'annonce' }}</h4>
                <span v-if="values.warningLevel && values.warningLevel !== 'info'" class="preview-pill"
                  :class="`pill-${values.warningLevel}`">
                  <Icon :icon="getWarningIcon(values.warningLevel)" />
                  {{ getWarningLabel(values.warningLevel) }}
                </span>
              </div>

              <p class="preview-message">{{ values.message || 'Votre message apparaîtra ici...' }}</p>

              <div class="preview-meta">
                <span class="meta-category">
                  <Icon :icon="getInformationTypeIcon(values.informationType || 'announcement')" />
                  {{ getCategoryLabel(values.informationType || 'announcement') }}
                </span>
                <span class="meta-time">
                  <Icon icon="ph:clock" />
                  À l'instant
                </span>
              </div>
            </div>
          </div>

          <!-- Statistiques estimées -->
          <div class="preview-stats">

            <div class="stat-item">
              <Icon icon="ph:bell-ringing" />
              <div class="stat-content">
                <span class="stat-label">Mode d'envoi</span>
                <span class="stat-value">Instantané</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <ActionButton type="button" variant="outline" outline-color="prim" icon="ph:x">
          Réinitialiser
        </ActionButton>

        <ActionButton type="submit" variant="primary" icon="ph:paper-plane-tilt" :disabled="loading || !meta.valid">
          <template v-if="loading">
            <Icon icon="svg-spinners:270-ring" class="loading-icon" />
            Envoi en cours...
          </template>
          <template v-else>
            Envoyer l'annonce
          </template>
        </ActionButton>
      </div>
    </Form>

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Form, Field, ErrorMessage, } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Icon } from '@iconify/vue'
import InputField from '@/components/ui/InputField.vue'
import InputSelect from '@/components/ui/InputSelect.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import axios from 'axios'
import { useSocket } from '@/composables/useSocket'
import type { ToastInterface } from '@/interfaces/toast.interface'
import SuccessToast from '@/components/toast/successToast.vue'

const toast = ref<ToastInterface>({
  show: false,
  message: '',
  title: '',
  type: 'success'
})



const { emitWithAck } = useSocket()
// Schéma de validation Zod
const schema = toTypedSchema(
  z.object({
    targetAudience: z.string({
      required_error: 'Veuillez sélectionner un public cible'
    }).min(1, 'Veuillez sélectionner un public cible'),
    title: z.string({
      required_error: 'Le titre est requis'
    }).min(5, 'Le titre doit contenir au moins 5 caractères')
      .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    message: z.string({
      required_error: 'Le message est requis'
    }).min(10, 'Le message doit contenir au moins 10 caractères')
      .max(500, 'Le message ne peut pas dépasser 500 caractères'),
    informationType: z.string({
      required_error: 'Veuillez sélectionner un type d\'information'
    }).min(1, 'Veuillez sélectionner un type d\'information'),
    warningLevel: z.string({
      required_error: 'Veuillez sélectionner un niveau de priorité'
    }).min(1, 'Veuillez sélectionner un niveau de priorité'),
    linkTo: z.string().optional()
  })
)



const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Options pour le public cible
const audienceOptions = [
  { value: 'all', label: '🌍 Tous les utilisateurs' },
  { value: 'student', label: '🎓 Étudiants uniquement' },
  { value: 'professor', label: '👨‍🏫 Professeurs uniquement' },
  { value: 'admin', label: '⚙️ Administrateurs et super administrateurs' },
]

// Options pour le type d'information
const informationTypeOptions = [
  { value: 'announcement', label: '📢 Annonce générale' },
  { value: 'academic', label: '🎓 Académique' },
  { value: 'administrative', label: '📋 Administratif' },
  { value: 'schedule', label: '📅 Emploi du temps' },
  { value: 'financial', label: '💰 Financier' },
  { value: 'pedagogical', label: '📚 Pédagogique' },
  { value: 'alert', label: '⚠️ Alerte' },
  { value: 'system', label: '⚙️ Système' }
]

// Options pour le niveau d'avertissement
const warningLevelOptions = [
  { value: 'info', label: 'ℹ️ Information' },
  { value: 'warning', label: '⚠️ Important' },
  { value: 'critical', label: '🚨 Urgent' }
]





// Icônes par type d'information
const getInformationTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    schedule: 'ph:calendar-check-duotone',
    academic: 'ph:graduation-cap-duotone',
    administrative: 'ph:file-text-duotone',
    financial: 'ph:currency-circle-dollar-duotone',
    announcement: 'ph:megaphone-duotone',
    pedagogical: 'ph:book-open-duotone',
    alert: 'ph:warning-circle-duotone',
    account: 'ph:user-circle-duotone',
    system: 'ph:gear-duotone'
  }
  return icons[type] || 'ph:bell-duotone'
}

// Icônes par niveau d'avertissement
const getWarningIcon = (level: string) => {
  const icons: Record<string, string> = {
    critical: 'ph:warning-octagon-fill',
    warning: 'ph:warning-fill',
    info: 'ph:info-fill'
  }
  return icons[level] || 'ph:info-fill'
}

// Labels pour les niveaux d'avertissement
const getWarningLabel = (level: string) => {
  const labels: Record<string, string> = {
    critical: 'Urgent',
    warning: 'Important',
    info: 'Info'
  }
  return labels[level] || 'Info'
}

// Labels pour les catégories
const getCategoryLabel = (type: string) => {
  const labels: Record<string, string> = {
    schedule: 'Emploi du temps',
    academic: 'Académique',
    administrative: 'Administratif',
    financial: 'Financier',
    announcement: 'Annonce',
    pedagogical: 'Pédagogique',
    alert: 'Alerte',
    account: 'Compte',
    system: 'Système'
  }
  return labels[type] || 'Général'
}

// Fonctions pour les boutons rapides
const sendMaintenanceNotification = async () => {
  const maintenanceData = {
    targetAudience: 'all',
    title: '🔧 Maintenance programmée',
    message: 'Une maintenance système est prévue ce soir de 22h à 23h. La plateforme sera temporairement indisponible pendant cette période.',
    informationType: 'system',
    warningLevel: 'warning',
    linkTo: ''
  }
  await sendQuickNotification(maintenanceData)
}

const sendUrgentNotification = async () => {
  const urgentData = {
    targetAudience: 'all',
    title: '🚨 Alerte urgente',
    message: 'Information importante nécessitant une attention immédiate de la part de tous les utilisateurs.',
    informationType: 'alert',
    warningLevel: 'critical',
    linkTo: ''
  }
  await sendQuickNotification(urgentData)
}


const sendSystemNotification = async () => {
  const systemData = {
    targetAudience: 'all',
    title: '⚙️ Mise à jour système',
    message: 'Une nouvelle version de la plateforme est disponible. Veuillez actualiser votre page pour bénéficier des dernières améliorations.',
    informationType: 'system',
    warningLevel: 'info',
    linkTo: ''
  }
  await sendQuickNotification(systemData)
}

const sendQuickNotification = async (data: any) => {
  loading.value = true
  try {
    const response = await emitWithAck("sendAnnouncementNotificationToAllUsers", data)

    toast.value = {
      show: true,
      title: 'Annonce envoyée',
      message: response.message || 'L\'annonce a été envoyée avec succès.',
      type: response.success ? 'success' : 'error'
    }
  } catch (error) {
    toast.value = {
      show: true,
      title: 'Erreur',
      message: 'Une erreur est survenue lors de l\'envoi de l\'annonce.',
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (values) => {
  loading.value = true


  try {
    const response = await emitWithAck("sendAnnouncementNotificationToAllUsers", values)

    toast.value = {
      show: true,
      title: 'Annonce envoyée',
      message: response.message || 'L\'annonce a été envoyée avec succès à tous les utilisateurs.',
      type: response.success ? 'success' : 'error'
    }


    setTimeout(() => {
      successMessage.value = ''
    }, 5000)

  } catch (error) {
    toast.value = {
      show: true,
      title: 'Erreur',
      message: 'Une erreur est survenue lors de l\'envoi de l\'annonce.',
      type: 'error'
    }

  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.announcement-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* En-tête */
.announcement-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-lighter);
  margin-bottom: 1.5rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.15) 0%, rgba(80, 134, 193, 0.05) 100%);
  border-radius: 14px;
  border: 1px solid rgba(80, 134, 193, 0.2);
}

.header-icon svg {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
  letter-spacing: -0.3px;
}

.header-subtitle {
  font-size: 0.9rem;
  color: var(--tertiary-color);
  margin: 0.25rem 0 0 0;
}

/* Bannière d'information */
.info-banner {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.08) 0%, rgba(80, 134, 193, 0.02) 100%);
  border: 1px solid rgba(80, 134, 193, 0.15);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  margin-bottom: 1.5rem;
}

.info-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 0.125rem;
}

.info-icon svg {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.info-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.info-content p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--tertiary-dark);
  line-height: 1.6;
}

.info-content strong {
  color: var(--secondary-color);
}

/* Boutons rapides */
.quick-actions-section {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-lighter);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.quick-actions-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.quick-actions-header svg {
  font-size: 1.5rem;
  color: var(--warning-color);
}

.quick-actions-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid var(--gray-lighter);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-dark);
}

.quick-action-btn svg {
  font-size: 2rem;
  transition: transform 0.2s ease;
}

.quick-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-action-btn.maintenance {
  border-color: rgba(80, 134, 193, 0.3);
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.05) 0%, rgba(80, 134, 193, 0.02) 100%);
}

.quick-action-btn.maintenance svg {
  color: var(--primary-color);
}

.quick-action-btn.maintenance:hover:not(:disabled) {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.1) 0%, rgba(80, 134, 193, 0.05) 100%);
}

.quick-action-btn.urgent {
  border-color: rgba(220, 38, 38, 0.3);
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%);
}

.quick-action-btn.urgent svg {
  color: #dc2626;
}

.quick-action-btn.urgent:hover:not(:disabled) {
  border-color: #dc2626;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
}

.quick-action-btn.schedule {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
}

.quick-action-btn.schedule svg {
  color: var(--warning-color);
}

.quick-action-btn.schedule:hover:not(:disabled) {
  border-color: var(--warning-color);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
}

.quick-action-btn.system {
  border-color: rgba(79, 70, 229, 0.3);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(79, 70, 229, 0.02) 100%);
}

.quick-action-btn.system svg {
  color: #4f46e5;
}

.quick-action-btn.system:hover:not(:disabled) {
  border-color: #4f46e5;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%);
}

.quick-action-btn:hover:not(:disabled) svg {
  transform: scale(1.1);
}

/* Formulaire */
.announcement-form {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-card,
.preview-card {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-lighter);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-card {
  padding: 1.5rem;
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
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.section-header svg {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Textarea personnalisé */
.form-group {
  position: relative;
  margin-bottom: 1.5rem;
}

.textarea-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-dark);
}

.form-textarea {
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  border: 2px solid var(--gray-lighter);
  border-radius: 12px;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.3s ease;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
}

.form-textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(80, 134, 193, 0.1);
  outline: none;
  background: white;
}

.form-textarea.has-error {
  border-color: var(--error);
  box-shadow: 0 0 0 4px rgba(235, 77, 75, 0.1);
}

.char-counter {
  position: absolute;
  bottom: -1.5rem;
  right: 0;
  font-size: 0.75rem;
  color: var(--tertiary-color);
}

.char-counter.warning {
  color: var(--warning-color);
  font-weight: 600;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--error);
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--tertiary-color);
  font-style: italic;
}

.field-hint svg {
  font-size: 0.875rem;
}

/* Carte de prévisualisation */
.preview-card {
  padding: 1.5rem;
  position: sticky;
  top: 1.5rem;
  max-height: fit-content;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.preview-header svg {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.preview-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-dark);
}

/* Notification preview */
.notification-preview {
  position: relative;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-lighter);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;
}

.notification-preview.has-content {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-preview.level-critical {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
}

.notification-preview.level-warning {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fde68a;
}

.notification-preview.level-info {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-color: #bae6fd;
}

.level-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

.level-indicator.level-critical {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
}

.level-indicator.level-warning {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
}

.level-indicator.level-info {
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
}

.preview-icon-wrapper {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.375rem;
}

.preview-icon-wrapper.type-announcement {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.preview-icon-wrapper.type-schedule {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.preview-icon-wrapper.type-academic {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
}

.preview-icon-wrapper.type-administrative {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
}

.preview-icon-wrapper.type-financial {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.preview-icon-wrapper.type-pedagogical {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #db2777;
}

.preview-icon-wrapper.type-alert {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #dc2626;
}

.preview-icon-wrapper.type-system {
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  color: #6b7280;
}

.preview-body {
  flex: 1;
  min-width: 0;
}

.preview-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.preview-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-dark);
  line-height: 1.4;
}

.preview-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.preview-pill.pill-critical {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.preview-pill.pill-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.preview-message {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-category,
.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-category {
  background: #f3f4f6;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 500;
}

/* Statistiques */
.preview-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(80, 134, 193, 0.04);
  border-radius: 10px;
  border: 1px solid rgba(80, 134, 193, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.stat-item svg {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--tertiary-color);
}

.stat-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--primary-dark);
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-lighter);
}

.loading-icon {
  font-size: 1.125rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Messages de succès et erreur */
.success-banner,
.error-banner {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9375rem;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 400px;
}

.success-banner {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.success-banner svg {
  font-size: 1.5rem;
  color: #059669;
}

.error-banner {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.error-banner svg {
  font-size: 1.5rem;
  color: #dc2626;
}

/* Animations */
.success-fade-enter-active,
.success-fade-leave-active,
.error-fade-enter-active,
.error-fade-leave-active {
  transition: all 0.3s ease;
}

.success-fade-enter-from,
.error-fade-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.success-fade-leave-to,
.error-fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Responsive */
@media (max-width: 1200px) {
  .announcement-form {
    grid-template-columns: 1fr;
  }

  .preview-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .announcement-container {
    padding: 1rem;
  }

  .announcement-header {
    flex-direction: column;
    text-align: center;
  }

  .info-banner {
    flex-direction: column;
    text-align: center;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .success-banner,
  .error-banner {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .quick-action-btn span {
    font-size: 0.8125rem;
  }

  .form-card,
  .preview-card {
    padding: 1rem;
  }
}
</style>
