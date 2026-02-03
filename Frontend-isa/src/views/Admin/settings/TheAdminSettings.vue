<template>

  <div class="admin-settings">
    <!-- Page Header avec breadcrumb et actions -->
    <div class="page-header">
      <div class="page-header__content">
        <div class="page-breadcrumb">
          <span class="breadcrumb-item">Administration</span>
          <Icon icon="material-symbols:chevron-right" class="breadcrumb-separator" />
          <span class="breadcrumb-item breadcrumb-item--current">Paramètres Système</span>
        </div>

        <div class="page-title-section">
          <div class="page-icon">
            <Icon icon="material-symbols:settings" />
          </div>
          <div class="page-info">
            <h1 class="page-title">Paramètres Système</h1>
            <p class="page-description">Configuration globale et gestion des fonctionnalités critiques</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Settings Grid Layout -->
    <div class="settings-layout">


      <!-- Main Content -->
      <div class="settings-main">
        <Form @submit="handleSubmit" class="settings-form" :validation-schema="validationSchema"
          v-slot="{ errors, values, isSubmitting }" :initial-values="initialValues" v-if="settings">

          <!-- Section Maintenance -->
          <section id="maintenance" class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <Icon icon="material-symbols:build" />
              </div>
              <div class="section-info">
                <h2 class="section-title">Mode Maintenance</h2>
                <p class="section-description">Contrôlez l'accès au système pendant les interventions techniques</p>
              </div>
            </div>

            <div class="settings-card settings-card--feature">
              <div class="feature-toggle">
                <div class="feature-content">
                  <div class="feature-header">
                    <h3 class="feature-title">Mode Maintenance Système</h3>
                    <span class="feature-status"
                      :class="values.maintenanceMode ? 'feature-status--active' : 'feature-status--inactive'">
                      {{ values.maintenanceMode ? 'Activé' : 'Désactivé' }}
                    </span>
                  </div>
                  <p class="feature-description">
                    Lorsque activé, seuls les administrateurs peuvent accéder au système.
                    Les utilisateurs verront une page de maintenance personnalisée.
                  </p>
                  <div class="feature-details">
                    <ul class="feature-list">
                      <li>
                        <Icon icon="material-symbols:check-circle" />Accès admin préservé
                      </li>
                      <li>
                        <Icon icon="material-symbols:check-circle" />Page de maintenance automatique
                      </li>
                      <li>
                        <Icon icon="material-symbols:check-circle" />Notification des utilisateurs
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="feature-control">
                  <ToggleButton name="maintenanceMode" :error="!!errors.maintenanceMode" />
                </div>
              </div>
            </div>
          </section>

          <!-- Section Automatisation -->
          <section id="automation" class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <Icon icon="material-symbols:auto-mode" />
              </div>
              <div class="section-info">
                <h2 class="section-title">Automatisation</h2>
                <p class="section-description">Configuration des processus automatiques du système</p>
              </div>
            </div>

            <div class="automation-grid">
              <div class="settings-card settings-card--feature">
                <div class="feature-toggle feature-toggle--compact">
                  <div class="feature-content">
                    <h3 class="feature-title">Gestion Automatique</h3>
                    <p class="feature-description">Ouverture/fermeture automatique des inscriptions</p>
                  </div>
                  <ToggleButton name="isAutomatic" :error="!!errors.isAutomatic" />
                </div>
              </div>

              <div class="settings-card settings-card--feature">
                <div class="feature-toggle feature-toggle--compact">
                  <div class="feature-content">
                    <h3 class="feature-title">Publication Manuelle</h3>
                    <p class="feature-description">Publication manuelle des résultats</p>
                  </div>
                  <ToggleButton name="isResultAvailable" :error="!!errors.isResultAvailable"
                    :disabled="values.isAutomatic ? true : false" />
                </div>
              </div>

              <div class="settings-card settings-card--feature">
                <div class="feature-toggle feature-toggle--compact">
                  <div class="feature-content">
                    <h3 class="feature-title">Ouverture Manuelle</h3>
                    <p class="feature-description">Ouverture manuelle des inscriptions</p>
                  </div>
                  <ToggleButton name="isInscriptionOpen" :error="!!errors.isInscriptionOpen"
                    :disabled="values.isAutomatic ? true : false" />
                </div>
              </div>
            </div>
          </section>

          <!-- Section Calendrier -->
          <section id="dates" class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <Icon icon="material-symbols:calendar-month" />
              </div>
              <div class="section-info">
                <h2 class="section-title">Calendrier Académique</h2>
                <p class="section-description">Définition des dates clés du processus d'admission</p>
              </div>
            </div>

            <div class="settings-card settings-card--dates">
              <div class="dates-timeline">
                <div class="timeline-item">
                  <div class="timeline-marker timeline-marker--start">
                    <Icon icon="material-symbols:play-circle" />
                  </div>
                  <div class="timeline-content">
                    <InputField name="registrationDate" label="Ouverture des Inscriptions" type="datetime-local"
                      :error="!!errors.registrationDate" :error-message="errors.registrationDate" class="timeline-input"
                      placeholder="Date à définir" />
                  </div>
                </div>

                <div class="timeline-connector"></div>

                <div class="timeline-item">
                  <div class="timeline-marker">
                    <Icon icon="material-symbols:assignment" />
                  </div>
                  <div class="timeline-content">
                    <InputField name="documentReviewDate" label="Revue des Documents" type="datetime-local"
                      :error="!!errors.documentReviewDate" :error-message="errors.documentReviewDate"
                      class="timeline-input" placeholder="Date à définir" />
                  </div>
                </div>

                <div class="timeline-connector"></div>

                <div class="timeline-item">
                  <div class="timeline-marker">
                    <Icon icon="material-symbols:pause-circle" />
                  </div>
                  <div class="timeline-content">
                    <InputField name="finalEnrollmentDate" label="Clôture des Inscriptions" type="datetime-local"
                      :error="!!errors.finalEnrollmentDate" :error-message="errors.finalEnrollmentDate"
                      class="timeline-input" placeholder="Date à définir" />
                  </div>
                </div>

                <div class="timeline-connector"></div>

                <div class="timeline-item">
                  <div class="timeline-marker timeline-marker--end">
                    <Icon icon="material-symbols:publish" />
                  </div>
                  <div class="timeline-content">
                    <InputField name="resultsPublicationDate" label="Publication des Résultats" type="datetime-local"
                      :error="!!errors.resultsPublicationDate" :error-message="errors.resultsPublicationDate"
                      class="timeline-input" placeholder="Date à définir" />
                  </div>
                </div>

                <div class="timeline-connector"></div>

                <div class="timeline-item">
                  <div class="timeline-marker timeline-marker--start">
                    <Icon icon="material-symbols:rocket-launch" />
                  </div>
                  <div class="timeline-content">
                    <InputField name="plannedStartDate" label="Date de Début Prévue" type="datetime-local"
                      :error="!!errors.plannedStartDate" :error-message="errors.plannedStartDate" class="timeline-input"
                      placeholder="Date à définir" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Section Status -->
          <section id="status" class="settings-section">
            <div class="section-header">
              <div class="section-icon">
                <Icon icon="material-symbols:monitoring" />
              </div>
              <div class="section-info">
                <h2 class="section-title">État du Système</h2>
                <p class="section-description">Aperçu en temps réel des fonctionnalités actives</p>
              </div>
            </div>

            <div class="status-dashboard">
              <div class="status-card">
                <div class="status-indicator"
                  :class="values.maintenanceMode ? 'status-indicator--warning' : 'status-indicator--success'">
                  <Icon :icon="values.maintenanceMode ? 'material-symbols:build' : 'material-symbols:check-circle'" />
                </div>
                <div class="status-info">
                  <h3 class="status-title">Système</h3>
                  <p class="status-value">{{ values.maintenanceMode ? 'Maintenance' : 'Opérationnel' }}</p>
                </div>
              </div>

              <div class="status-card">
                <div class="status-indicator"
                  :class="values.isInscriptionOpen ? 'status-indicator--success' : 'status-indicator--error'">
                  <Icon
                    :icon="values.isInscriptionOpen ? 'material-symbols:event-available' : 'material-symbols:event-busy'" />
                </div>
                <div class="status-info">
                  <h3 class="status-title">Inscriptions</h3>
                  <p class="status-value">{{ values.isInscriptionOpen ? 'Ouvertes' : 'Fermées' }}</p>
                </div>
              </div>

              <div class="status-card">
                <div class="status-indicator"
                  :class="values.isResultAvailable ? 'status-indicator--success' : 'status-indicator--neutral'">
                  <Icon :icon="values.isResultAvailable ? 'material-symbols:publish' : 'material-symbols:schedule'" />
                </div>
                <div class="status-info">
                  <h3 class="status-title">Résultats</h3>
                  <p class="status-value">{{ values.isResultAvailable ? 'Publiés' : 'En attente' }}</p>
                </div>
              </div>

              <div class="status-card">
                <div class="status-indicator"
                  :class="values.isAutomatic ? 'status-indicator--success' : 'status-indicator--neutral'">
                  <Icon :icon="values.isAutomatic ? 'material-symbols:auto-mode' : 'material-symbols:edit'" />
                </div>
                <div class="status-info">
                  <h3 class="status-title">Mode</h3>
                  <p class="status-value">{{ values.isAutomatic ? 'Automatique' : 'Manuel' }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Actions Footer -->
          <div class="settings-footer">
            <div class="footer-actions">
              <button type="button" class="btn btn--secondary" @click="resetForm">
                <Icon icon="material-symbols:refresh" />
                Réinitialiser
              </button>
              <ActionButton type="submit" :disabled="isSubmitting" variant="primary" icon="material-symbols:save">
                {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications' }}
              </ActionButton>
            </div>

            <div class="footer-info">
              <p class="save-info">
                <Icon icon="material-symbols:info" />
                Les modifications seront appliquées immédiatement après sauvegarde
              </p>
            </div>
          </div>
        </Form>
      </div>
    </div>
  </div>

  <SuccessToast v-if="toast.show" :message="toast.message" :type="toast.type" :title="toast.title"
    @dismissed="toast.show = false" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Form } from 'vee-validate'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Icon } from '@iconify/vue'
import ToggleButton from '@/components/ui/ToggleButton.vue'
import InputField from '@/components/ui/InputField.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import axios from 'axios'
import type SettingsInterface from '@/interfaces/settings.interface'
import { watch } from 'vue'
import SuccessToast from '@/components/toast/successToast.vue'

const toast = ref<{ show: boolean, message: string, type: 'success' | 'error', title: string }>({
  show: false,
  message: '',
  type: 'success',
  title: 'Succès'
})

interface SettingsFormData {
  maintenanceMode: boolean
  isAutomatic: boolean
  isResultAvailable: boolean
  isInscriptionOpen: boolean
  registrationDate: string
  finalEnrollmentDate: string
  documentReviewDate: string
  resultsPublicationDate: string
  plannedStartDate?: string
}

const settings = ref<SettingsInterface | null>(null);

onMounted(async () => {
  if (!settings.value) {
    await fetchSettings();
  }
});



const initialValues = ref<SettingsFormData>({
  maintenanceMode: false,
  isAutomatic: false,
  isResultAvailable: false,
  isInscriptionOpen: false,
  registrationDate: new Date().toISOString().slice(0, 16), // Valeur par défaut à la date actuelle
  finalEnrollmentDate: new Date().toISOString().slice(0, 16),
  documentReviewDate: new Date().toISOString().slice(0, 16),
  resultsPublicationDate: new Date().toISOString().slice(0, 16),
  plannedStartDate: new Date().toISOString().slice(0, 16),
})

function formatDateForInput(dateString: Date | null | undefined, withTime = false): string {
  if (!dateString) return ""
  const date = new Date(dateString)

  if (isNaN(date.getTime())) return ""

  if (withTime) {
    // Convertir en heure locale pour éviter le décalage UTC
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } else {
    // YYYY-MM-DD
    return date.toISOString().slice(0, 10)
  }
}

watch(settings, (newVal) => {
  if (newVal) {
    initialValues.value = {
      maintenanceMode: newVal.maintenanceMode,
      isAutomatic: newVal.isAutomatic,
      isResultAvailable: newVal.isResultAvailable,
      isInscriptionOpen: newVal.isInscriptionOpen,
      registrationDate: formatDateForInput(newVal.registrationDate, true),
      finalEnrollmentDate: formatDateForInput(newVal.finalEnrollmentDate, true),
      documentReviewDate: formatDateForInput(newVal.documentReviewDate, true),
      resultsPublicationDate: formatDateForInput(newVal.resultsPublicationDate, true),
      plannedStartDate: formatDateForInput(newVal.plannedStartDate, true),
    }
  }
}, { immediate: true })





const fetchSettings = async () => {
  try {
    const response = await axios.get('/api/v1/settings');
    settings.value = response.data;
  } catch (error) {
    console.log(error);

  }
}




// Validation Schema
const validationSchema = toTypedSchema(
  z.object({
    maintenanceMode: z.boolean().default(false),
    isAutomatic: z.boolean().default(false),
    isResultAvailable: z.boolean().default(false),
    isInscriptionOpen: z.boolean().default(false),

    registrationDate: z.string().optional().refine(
      (val) => {
        // Accepter les valeurs vides (null/undefined)
        if (!val || val === '') return true;
        if (!isNaN(Date.parse(val))) {
          const dateValue = new Date(val);
          const initialDate = initialValues.value.registrationDate;
          // Si la date n'a pas changé, pas d'erreur
          if (val === initialDate) return true;
          // Si elle a changé, elle doit être dans le futur
          return dateValue > new Date();
        }
        return false;
      },
      { message: "Date d'ouverture doit être dans le futur" }
    ),

    finalEnrollmentDate: z.string().optional().refine(
      (val) => {
        if (!val || val === '') return true;
        if (!isNaN(Date.parse(val))) {
          const dateValue = new Date(val);
          const initialDate = initialValues.value.finalEnrollmentDate;
          if (val === initialDate) return true;
          return dateValue > new Date();
        }
        return false;
      },
      { message: "Date de fermeture doit être dans le futur" }
    ),

    documentReviewDate: z.string().optional().refine(
      (val) => {
        if (!val || val === '') return true;
        if (!isNaN(Date.parse(val))) {
          const dateValue = new Date(val);
          const initialDate = initialValues.value.documentReviewDate;
          if (val === initialDate) return true;
          return dateValue > new Date();
        }
        return false;
      },
      { message: "Date de revue doit être dans le futur" }
    ),

    resultsPublicationDate: z.string().optional().refine(
      (val) => {
        if (!val || val === '') return true;
        if (!isNaN(Date.parse(val))) {
          const dateValue = new Date(val);
          const initialDate = initialValues.value.resultsPublicationDate;
          if (val === initialDate) return true;
          return dateValue > new Date();
        }
        return false;
      },
      { message: "Date de publication doit être dans le futur" }
    ),

    plannedStartDate: z.string().optional().refine(
      (val) => {
        if (!val || val === '') return true;
        if (!isNaN(Date.parse(val))) {
          const dateValue = new Date(val);
          const initialDate = initialValues.value.plannedStartDate;
          if (val === initialDate) return true;
          return dateValue > new Date();
        }
        return false;
      },
      { message: "Date de début prévue doit être dans le futur" }
    ),
  }).superRefine((data, ctx) => {
    // Ne valider que si les dates sont définies
    if (!data.registrationDate || !data.finalEnrollmentDate || !data.documentReviewDate ||
      !data.resultsPublicationDate || !data.plannedStartDate) {
      return; // Pas de validation croisée si des dates manquent
    }

    const regDate = new Date(data.registrationDate);
    const finalEnroll = new Date(data.finalEnrollmentDate);
    const reviewDate = new Date(data.documentReviewDate);
    const resultsDate = new Date(data.resultsPublicationDate);
    const plannedStart = new Date(data.plannedStartDate);

    // Vérifier si les dates ont été modifiées
    const regDateChanged = data.registrationDate !== initialValues.value.registrationDate;
    const finalEnrollChanged = data.finalEnrollmentDate !== initialValues.value.finalEnrollmentDate;
    const reviewDateChanged = data.documentReviewDate !== initialValues.value.documentReviewDate;
    const resultsDateChanged = data.resultsPublicationDate !== initialValues.value.resultsPublicationDate;
    const plannedStartChanged = data.plannedStartDate !== initialValues.value.plannedStartDate;

    // La fermeture doit être après l'ouverture (seulement si l'une des deux a changé)
    if ((regDateChanged || finalEnrollChanged) && finalEnroll <= regDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["finalEnrollmentDate"],
        message: "La date de fermeture doit être après la date d'ouverture",
      });
    }

    // La revue des documents doit être après la fermeture et avant la publication des résultats
    if ((reviewDateChanged || finalEnrollChanged || resultsDateChanged) &&
      (reviewDate <= finalEnroll || reviewDate >= resultsDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentReviewDate"],
        message: "La date de revue doit être après la fermeture et avant la publication des résultats",
      });
    }

    // La publication des résultats doit être après la fermeture
    if ((resultsDateChanged || finalEnrollChanged) && resultsDate <= finalEnroll) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resultsPublicationDate"],
        message: "La date de publication des résultats doit être après la fermeture",
      });
    }

    // La date de début prévue doit être après la publication des résultats
    if ((plannedStartChanged || resultsDateChanged) && plannedStart <= resultsDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["plannedStartDate"],
        message: "La date de début prévue doit être après la publication des résultats",
      });
    }
  })
)

// Form handling
const handleSubmit = async (values: Record<string, unknown>) => {
  const realValues = {
    ...values,
    isInscriptionOpen: values.isAutomatic ? false : values.isInscriptionOpen,
    isResultAvailable: values.isAutomatic ? false : values.isResultAvailable,
  }

  const formData = realValues as unknown as SettingsFormData
  try {
    await axios.patch('/api/v1/settings', formData);
    await fetchSettings(); // Recharger les paramètres

    toast.value = {
      show: true,
      message: 'Les paramètres système ont été enregistrés avec succès.',
      type: 'success',
      title: 'Paramètres enregistrés'
    }
  } catch (error) {
    console.error(error);

    toast.value = {
      show: true,
      message: 'Une erreur est survenue lors de l\'enregistrement des paramètres.',
      type: 'error',
      title: 'Erreur'
    }
  }
}

const resetForm = () => {
  // Logique de réinitialisation du formulaire
  console.log('Formulaire réinitialisé')
}
</script>

<style scoped>
/* Layout principal */
.admin-settings {
  min-height: 100vh;
  background: var(--background-light);
}

/* Page Header */
.page-header {
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.page-header__content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.breadcrumb-item--current {
  color: var(--primary-color);
  font-weight: 500;
}

.breadcrumb-separator {
  font-size: 1rem;
  color: var(--text-tertiary);
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-lg);
  color: white;
  font-size: 1.5rem;
}

.page-info {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
}

.page-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
  align-self: flex-start;
}

/* Settings Layout */
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar */
.settings-sidebar {
  position: sticky;
  top: 2rem;
}

.settings-nav {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.nav-section__title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  margin: 0 0 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.nav-link:hover {
  background: var(--background-secondary);
  color: var(--text-dark);
}

.nav-link--active {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.nav-link .iconify {
  font-size: 1.25rem;
}

/* Main Content */
.settings-main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Sections */
.settings-section {
  scroll-margin-top: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--primary-extra-light);
  border-radius: var(--radius);
  color: var(--primary-color);
  font-size: 1.25rem;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
}

.section-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

/* Settings Cards */
.settings-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  overflow: hidden;
}

.settings-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.settings-card--feature {
  padding: 2rem;
}

.settings-card--dates {
  padding: 2.5rem;
}

/* Feature Toggles */
.feature-toggle {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.feature-toggle--compact {
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.feature-content {
  flex: 1;
}

.feature-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.feature-status {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.feature-status--active {
  background: var(--success-light);
  color: var(--success-dark);
}

.feature-status--inactive {
  background: var(--gray-extra-light);
  color: var(--text-secondary);
}

.feature-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1rem 0;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.feature-list .iconify {
  color: var(--success);
  font-size: 1rem;
}

.feature-control {
  flex-shrink: 0;
}

/* Automation Grid */
.automation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Timeline pour les dates */
.dates-timeline {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  position: relative;
}

.timeline-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--background-secondary);
  border: 3px solid var(--border-light);
  border-radius: var(--rounded);
  color: var(--text-secondary);
  font-size: 1.25rem;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-marker--start {
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  border-color: var(--success);
  color: white;
}

.timeline-marker--end {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-color: var(--primary-color);
  color: white;
}

.timeline-content {
  flex: 1;
  padding-top: 0.5rem;
}

.timeline-input {
  max-width: 400px;
}

.timeline-connector {
  position: absolute;
  left: 1.4rem;
  top: 3rem;
  bottom: -2rem;
  width: 2px;
  background: linear-gradient(to bottom, var(--border-light), var(--background-secondary));
}

.timeline-item:last-of-type .timeline-connector {
  display: none;
}

/* Status Dashboard */
.status-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.status-card {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.status-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--rounded);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.status-indicator--success {
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: white;
}

.status-indicator--warning {
  background: linear-gradient(135deg, var(--warning), var(--warning-dark));
  color: white;
}

.status-indicator--error {
  background: linear-gradient(135deg, var(--error), var(--error-dark));
  color: white;
}

.status-indicator--neutral {
  background: var(--tertiary-extra-light);
  color: var(--text-secondary);
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

/* Footer */
.settings-footer {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-top: 2rem;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.footer-info {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.save-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.save-info .iconify {
  color: var(--primary-color);
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--background-secondary);
  color: var(--text-dark);
  border-color: var(--text-secondary);
}

.btn--secondary {
  background: var(--background-secondary);
  color: var(--text-dark);
  border: 1px solid var(--border-light);
}

.btn--secondary:hover:not(:disabled) {
  background: var(--tertiary-extra-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* Responsive Design - Version améliorée */

/* Large tablets et petits desktops */
@media (max-width: 1200px) {
  .settings-layout {
    grid-template-columns: 250px 1fr;
    gap: 1.5rem;
  }

  .page-header__content {
    padding: 0 1.5rem;
  }

  .settings-layout {
    padding: 0 1.5rem 3rem;
  }
}

/* Tablettes */
@media (max-width: 1024px) {
  .settings-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 900px;
  }

  .settings-sidebar {
    position: relative;
    top: auto;
    order: -1;
  }

  .settings-nav {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
  }

  .nav-section__title {
    margin-bottom: 0.75rem;
    font-size: 0.7rem;
  }

  .nav-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    border-radius: var(--radius);
    text-align: center;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 80px;
    justify-content: center;
  }

  .nav-link .iconify {
    font-size: 1.5rem;
  }
}

/* Grandes tablettes et petits écrans */
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 0;
  }

  .page-header__content {
    padding: 0 1rem;
    gap: 1rem;
  }

  .settings-layout {
    padding: 0 1rem 2rem;
    gap: 1.5rem;
  }

  .page-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  /* Navigation en grid compact */
  .nav-list {
    grid-template-columns: repeat(2, 1fr);
  }

  .nav-link {
    min-height: 70px;
    font-size: 0.85rem;
  }

  /* Sections plus compactes */
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .section-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  /* Feature toggles empilés avec espacement optimisé */
  .feature-toggle {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .feature-toggle--compact {
    flex-direction: row;
    align-items: center;
    padding: 1.25rem;
    gap: 1rem;
  }

  .feature-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  /* Grilles adaptatives */
  .automation-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .status-dashboard {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  /* Timeline plus compacte */
  .dates-timeline {
    gap: 1.5rem;
  }

  .timeline-item {
    gap: 1rem;
  }

  .timeline-marker {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .timeline-connector {
    left: 1.15rem;
  }

  /* Cards avec padding réduit */
  .settings-card--feature {
    padding: 1.5rem;
  }

  .settings-card--dates {
    padding: 1.75rem;
  }

  /* Footer optimisé */
  .footer-actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    align-items: center;
  }

  .btn {
    justify-content: center;
  }
}

/* Mobiles */
@media (max-width: 580px) {
  .page-header {
    padding: 1rem 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-actions {
    grid-template-columns: 1fr;
  }

  /* Navigation en liste verticale compacte */
  .nav-list {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .nav-link {
    flex-direction: row;
    min-height: auto;
    padding: 0.75rem 1rem;
    text-align: left;
    gap: 0.75rem;
  }

  .nav-link .iconify {
    font-size: 1.25rem;
  }

  /* Sections ultra-compactes */
  .section-header {
    gap: 0.5rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  /* Feature toggles complètement empilés */
  .feature-toggle--compact {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 1rem;
  }

  /* Status dashboard en une colonne */
  .status-dashboard {
    grid-template-columns: 1fr;
  }

  /* Timeline simplifiée */
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .timeline-marker {
    align-self: flex-start;
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }

  .timeline-connector {
    display: none;
  }

  .timeline-content {
    padding-top: 0;
    width: 100%;
  }

  .timeline-input {
    max-width: 100%;
  }

  /* Cards très compactes */
  .settings-card--feature,
  .settings-card--dates {
    padding: 1.25rem;
  }

  /* Footer en colonne */
  .footer-actions {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .save-info {
    font-size: 0.8rem;
  }
}

/* Très petits écrans */
@media (max-width: 380px) {

  .page-header__content,
  .settings-layout {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .page-title {
    font-size: 1.375rem;
  }

  .settings-card--feature,
  .settings-card--dates {
    padding: 1rem;
  }

  .feature-title {
    font-size: 1rem;
  }

  .status-indicator {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }

  .status-value {
    font-size: 1rem;
  }
}

/* Animations et transitions */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section {
  animation: slideInUp 0.6s ease-out;
}

.settings-section:nth-child(2) {
  animation-delay: 0.1s;
}

.settings-section:nth-child(3) {
  animation-delay: 0.2s;
}

.settings-section:nth-child(4) {
  animation-delay: 0.3s;
}

.settings-section:nth-child(5) {
  animation-delay: 0.4s;
}

/* Effet de focus amélioré */
.settings-card:focus-within {
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}
</style>
