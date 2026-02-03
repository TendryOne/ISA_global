<template>
  <div class="submissions-container">
    <!-- En-tête premium -->
    <div class="submissions-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:assignment-turned-in" />
        </div>
        <div class="header-text">
          <h1>Rendus du Devoir</h1>
          <p>Consultez et évaluez les soumissions des étudiants</p>
        </div>
      </div>
      <div class="header-actions">
        <ActionButton :disabled="!assignment || assignment.lockedGrade || !hasGradedSubmissions"
          icon="material-symbols:lock" @click="openLockGradesModal" variant="primary" v-if="!assignment?.lockedGrade">
          Verrouiller les notes
        </ActionButton>
        <ActionButton v-if="assignment && assignment.lockedGrade" icon="material-symbols:lock" variant="outline"
          disabled>
          Notes verrouillées
        </ActionButton>
        <ActionButton icon="material-symbols:download" @click="exportSubmissions" variant="outline">
          Exporter
        </ActionButton>
      </div>
    </div>

    <!-- Détails du devoir -->
    <div v-if="assignment" class="assignment-details">
      <div class="assignment-card">
        <div class="assignment-header">
          <div class="assignment-title">
            <Icon :icon="getAssignmentTypeIcon(assignment.type)" />
            <h2>{{ assignment.title }}</h2>
          </div>
          <div class="assignment-badges">
            <span class="type-badge" :class="assignment.type">
              {{ getAssignmentTypeLabel(assignment.type) }}
            </span>
            <span class="session-badge" :class="assignment.session">
              {{ assignment.session === 'normal' ? 'Session normale' : 'Rattrapage' }}
            </span>
            <span class="location-badge" :class="assignment.submissionLocation" v-if="assignment.submissionLocation">
              <Icon :icon="assignment.submissionLocation === 'online'
                ? 'material-symbols:cloud'
                : 'material-symbols:location-on'
                " />
              {{ assignment.submissionLocation === 'online' ? 'En ligne' : 'Présentiel' }}
            </span>
            <span class="status-badge" :class="assignment.isActive ? 'active' : 'cancelled'">
              <Icon :icon="assignment.isActive ? 'material-symbols:check-circle' : 'material-symbols:cancel'
                " />
              {{ assignment.isActive ? 'Actif' : 'Annulé' }}
            </span>
            <span v-if="assignment.lockedGrade" class="status-badge locked">
              <Icon icon="material-symbols:lock" />
              Notes verrouillées
            </span>
          </div>
        </div>
        <div class="assignment-content">
          <div class="assignment-description">
            <!-- <QuillContentViewerDemo /> -->
            <QuillContentViewer :content="assignment.description" :show-border="false" :downloadable="true"
              :document-title="assignment.title" max-height="100vh" :assignment="assignment" />
          </div>
          <div class="assignment-meta">
            <div class="meta-item">
              <Icon icon="material-symbols:schedule" />
              <span>Date limite: {{ formatFullDate(assignment.dueDate) }}</span>
            </div>
            <div class="meta-item" v-if="assignment.fileUrl">
              <Icon icon="material-symbols:attach-file" />
              <a :href="assignment.fileUrl" target="_blank" class="attachment-link">
                Fichier joint
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="submissions-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="hugeicons:students" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ submissions.length }}</span>
          <span class="stat-label">Étudiants</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:assignment-turned-in-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ submittedCount }}</span>
          <span class="stat-label">Soumis</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="ic:outline-grade" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ gradedCount }}</span>
          <span class="stat-label">Notés</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:schedule-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ lateCount }}</span>
          <span class="stat-label">En retard</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="mdi:close-circle-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ notSubmittedCount }}</span>
          <span class="stat-label">Non rendu</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon failure">
          <Icon icon="material-symbols:trending-down" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ failedCount }}</span>
          <span class="stat-label">Échecs (&lt; 10/20)</span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="submissions-filters">
      <div class="filter-group">
        <button v-for="filter in statusFilters" :key="filter.value" @click="activeFilter = filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]">
          <Icon :icon="filter.icon" />
          {{ filter.label }}
        </button>
      </div>
      <div class="search-container">
        <Icon icon="material-symbols:search" />
        <input v-model="searchQuery" type="text" placeholder="Rechercher un étudiant..." class="search-input" />
      </div>
    </div>

    <!-- Tableau des soumissions -->
    <div class="submissions-table-container">
      <div class="table-header">
        <div class="table-row table-header-row" :class="getTableLayoutClass()">
          <div class="table-cell header-cell matricule-col">Matricule</div>
          <div class="table-cell header-cell student-col">Étudiant</div>
          <div class="table-cell header-cell file-col" v-if="isOnlineSubmission">Fichier</div>
          <div class="table-cell header-cell date-col" v-if="isOnlineSubmission">
            Date de soumission
          </div>
          <div class="table-cell header-cell status-col" v-if="isOnlineSubmission">Statut</div>
          <div class="table-cell header-cell grade-col">Note</div>
          <div class="table-cell header-cell actions-col">Actions</div>
        </div>
      </div>

      <div class="table-body">
        <transition-group name="submission-fade">
          <div v-for="submission in filteredSubmissions" :key="submission.studentId" class="table-row submission-row"
            :class="[getRowClass(submission), getTableLayoutClass()]">
            <!-- Matricule -->
            <div class="table-cell matricule-col">
              <div class="matricule-badge">
                {{ submission.matricule }}
              </div>
            </div>

            <!-- Étudiant -->
            <div class="table-cell student-col">
              <div class="student-info">
                <div class="student-avatar">
                  <Icon icon="material-symbols:person" />
                </div>
                <div class="student-details">
                  <div class="student-name">{{ submission.name }} {{ submission.firstName }}</div>
                  <div class="student-email">{{ submission.email }}</div>
                </div>
              </div>
            </div>

            <!-- Fichier (seulement pour les devoirs en ligne) -->
            <div class="table-cell file-col" v-if="isOnlineSubmission">
              <div class="file-info" v-if="getSubmissionData(submission)?.fileUrl">
                <a :href="getSubmissionData(submission)?.fileUrl || '#'" target="_blank" class="file-link">
                  <Icon :icon="getFileIcon(getSubmissionData(submission)?.fileUrl)" />
                  <span>Voir le fichier</span>
                </a>
              </div>
              <div class="no-file" v-else>
                <Icon icon="material-symbols:attach-file-off" />
                <span>Aucun fichier</span>
              </div>
            </div>

            <!-- Date de soumission (seulement pour les devoirs en ligne) -->
            <div class="table-cell date-col" v-if="isOnlineSubmission">
              <div class="submission-date" v-if="getSubmissionData(submission)?.submittedAt">
                <Icon icon="material-symbols:schedule" />
                <span>{{ formatDate(getSubmissionData(submission)?.submittedAt) }}</span>
              </div>
              <div class="no-submission" v-else>
                <Icon icon="material-symbols:schedule-off" />
                <span>Non soumis</span>
              </div>
            </div>

            <!-- Statut (seulement pour les devoirs en ligne) -->
            <div class="table-cell status-col" v-if="isOnlineSubmission">
              <span class="status-badge" :class="getStatusClass(submission)">
                <Icon :icon="getStatusIcon(submission)" />
                {{ getStatusLabel(submission) }}
              </span>
            </div>

            <!-- Note -->
            <div class="table-cell grade-col">
              <div class="grade-display" v-if="getSubmissionData(submission)?.grade !== null">
                <span class="grade-value" :class="{ failed: isFailedGrade(submission) }">{{
                  getSubmissionData(submission)?.grade }}/20</span>
              </div>
              <div class="no-grade" v-else>
                <span>-</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="table-cell actions-col">
              <div class="action-buttons">
                <button class="action-btn detail-btn" @click="viewDetails(submission)" title="Voir les détails">
                  <Icon icon="material-symbols:visibility" />
                </button>
                <button class="action-btn grade-btn" @click="openGradeModal(submission)"
                  :disabled="assignment?.lockedGrade"
                  :title="assignment?.lockedGrade ? 'Notes verrouillées' : 'Ajouter/Modifier note'">
                  <Icon icon="material-symbols:grade" />
                </button>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- États vides et chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon icon="material-symbols:progress-activity" class="spinner" />
      </div>
      <p>Chargement des soumissions...</p>
    </div>

    <div v-if="!loading && filteredSubmissions.length === 0 && submissions.length > 0" class="empty-filter-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:filter-list-off" />
      </div>
      <h3>Aucune soumission trouvée</h3>
      <p>Aucune soumission ne correspond aux critères sélectionnés</p>
      <button @click=" activeFilter = 'all'; searchQuery = ''
        " class="reset-filter-btn">
        Réinitialiser les filtres
      </button>
    </div>

    <div v-if="!loading && submissions.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:assignment-outline" />
      </div>
      <h3>Aucune soumission</h3>
      <p>Aucun étudiant n'a encore soumis pour ce devoir</p>
    </div>

    <!-- Modal de détails -->
    <SubmissionDetailsModal :show="showDetailsModal" :submission="selectedSubmission" @close="closeDetailsModal" />

    <!-- Modal de notation -->
    <GradingModal :show="showGradeModal" :submission="selectedSubmission" @close="closeGradeModal"
      @submit="handleGradeSubmit" />

    <!-- Modal de verrouillage des notes -->
    <div v-if="showLockGradesModal" class="modal-overlay" @click.self="closeLockGradesModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-content">
            <Icon icon="material-symbols:lock" />
            <h3>Verrouiller les notes</h3>
          </div>
          <button class="close-btn" @click="closeLockGradesModal">
            <Icon icon="material-symbols:close" />
          </button>
        </div>
        <div class="modal-content">
          <div class="lock-confirmation">
            <div class="warning-section">
              <div class="warning-icon">
                <Icon icon="material-symbols:warning" />
              </div>
              <div class="warning-content">
                <h4>Attention</h4>
                <p>
                  Une fois les notes verrouillées, elles ne pourront plus être modifiées. Cette
                  action est irréversible.
                </p>
              </div>
            </div>

            <div class="grades-summary">
              <h4>Résumé des notes</h4>
              <div class="summary-stats">
                <div class="summary-item">
                  <span class="summary-label">Notes saisies:</span>
                  <span class="summary-value">{{ gradedCount }}/{{ submissions.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Notes manquantes:</span>
                  <span class="summary-value warning">{{ submissions.length - gradedCount }}</span>
                </div>
              </div>
            </div>

            <div class="confirmation-actions">
              <button type="button" @click="closeLockGradesModal" class="cancel-btn">
                Annuler
              </button>
              <button type="button" @click="lockGrades" class="confirm-btn" :disabled="gradedCount === 0">
                <Icon icon="material-symbols:lock" />
                Verrouiller définitivement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de succès -->
    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import axios, { AxiosError } from 'axios'
import type { SubmissionProfessorInterface } from '@/interfaces/submission.interface'
import type SubmissionInterface from '@/interfaces/submission.interface'
import ActionButton from '@/components/ui/ActionButton.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import SubmissionDetailsModal from '@/components/professor/SubmissionDetailsModal.vue'
import GradingModal from '@/components/professor/GradingModal.vue'
import QuillContentViewer from '@/components/EDITOR/QuillContentViewer.vue'
import type { AssignmentInterface } from '@/interfaces/assignment.interface'
import QuillContentViewerDemo from '@/components/EDITOR/QuillContentViewerDemo.vue'
import { useSocket } from '@/composables/useSocket'
import { PostEventLog } from '@/utils/eventLog'
import { useMyUserStore } from '@/stores/userStore'
import { link } from 'fs'

const route = useRoute()

// États réactifs
const submissions = ref<SubmissionProfessorInterface[]>([])
const loading = ref<boolean>(false)
const activeFilter = ref<string>('all')
const searchQuery = ref<string>('')
const showDetailsModal = ref<boolean>(false)
const showGradeModal = ref<boolean>(false)
const showLockGradesModal = ref<boolean>(false)
const selectedSubmission = ref<SubmissionProfessorInterface | null>(null)

// Toast notifications
const toast = ref<{ show: boolean; message: string; title: string; type: 'success' | 'error' }>({
  show: false,
  message: '',
  title: '',
  type: 'success',
})

// Filtres de statut
const statusFilters = [
  { value: 'all', label: 'Tous', icon: 'material-symbols:select-all' },
  { value: 'submitted', label: 'Soumis', icon: 'material-symbols:assignment-turned-in' },
  { value: 'graded', label: 'Notés', icon: 'material-symbols:grade' },
  { value: 'late', label: 'En retard', icon: 'material-symbols:schedule' },
  { value: 'not_submitted', label: 'Non rendus', icon: 'material-symbols:close-circle' },
]

// Statistiques calculées
const submittedCount = computed(() => {
  return submissions.value.filter((sub) => {
    const data = getSubmissionData(sub)
    return data?.status === 'submitted' || data?.status === 'graded' || data?.status === 'late'
  }).length
})

const gradedCount = computed(() => {
  return submissions.value.filter((sub) => {
    const data = getSubmissionData(sub)
    return data?.status === 'graded'
  }).length
})

const lateCount = computed(() => {
  return submissions.value.filter((sub) => {
    const data = getSubmissionData(sub)
    return data?.status === 'late'
  }).length
})

const notSubmittedCount = computed(() => {
  return submissions.value.filter((sub) => {
    const data = getSubmissionData(sub)
    return data?.status === 'not_submitted' || !data
  }).length
})

const failedCount = computed(() => {
  return submissions.value.filter((sub) => {
    const data = getSubmissionData(sub)
    return data?.grade !== null && data?.grade !== undefined && data.grade < 10
  }).length
})

// Computed properties pour le type de devoir
const isOnlineSubmission = computed(() => {
  return assignment.value?.submissionLocation === 'online' || !assignment.value?.submissionLocation
})

const getTableLayoutClass = () => {
  return isOnlineSubmission.value ? 'layout-online' : 'layout-inperson'
}

// Computed pour les notes notées
const hasGradedSubmissions = computed(() => {
  return submissions.value.some((sub) => {
    const data = getSubmissionData(sub)
    return data?.grade !== null && data?.grade !== undefined
  })
})

// Soumissions filtrées
const filteredSubmissions = computed(() => {
  let filtered = submissions.value

  // Filtre par statut
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter((submission) => {
      const data = getSubmissionData(submission)
      return (
        data?.status === activeFilter.value || (!data && activeFilter.value === 'not_submitted')
      )
    })
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (submission) =>
        submission.name.toLowerCase().includes(query) ||
        submission.firstName.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.matricule.toLowerCase().includes(query),
    )
  }

  return filtered
})

// Fonctions utilitaires
const getSubmissionData = (submission: SubmissionProfessorInterface) => {
  // Retourne la première soumission ou crée une soumission par défaut
  if (submission.submission && submission.submission.grade !== null) {
    return submission.submission as SubmissionInterface
  }

  // Soumission par défaut si aucune soumission
  return {
    fileUrl: null,
    submittedAt: null,
    grade: null,
    status: 'not_submitted' as const,
    feedback: null,
  }
}

const getStatusClass = (submission: SubmissionProfessorInterface) => {
  const data = getSubmissionData(submission)
  return data?.status || 'not_submitted'
}

const getStatusLabel = (submission: SubmissionProfessorInterface) => {
  const data = getSubmissionData(submission)
  const status = data?.status || 'not_submitted'

  switch (status) {
    case 'submitted':
      return 'Soumis'
    case 'graded':
      return 'Noté'
    case 'late':
      return 'En retard'
    case 'missing':
      return 'Manquant'
    case 'not_submitted':
    default:
      return 'Non rendu'
  }
}

const getStatusIcon = (submission: SubmissionProfessorInterface) => {
  const data = getSubmissionData(submission)
  const status = data?.status || 'not_submitted'

  switch (status) {
    case 'submitted':
      return 'material-symbols:assignment-turned-in'
    case 'graded':
      return 'material-symbols:grade'
    case 'late':
      return 'material-symbols:schedule'
    case 'missing':
      return 'material-symbols:error'
    case 'not_submitted':
    default:
      return 'material-symbols:close-circle'
  }
}

const getRowClass = (submission: SubmissionProfessorInterface) => {
  const data = getSubmissionData(submission)
  const status = data?.status || 'not_submitted'
  return `status-${status}`
}

const isFailedGrade = (submission: SubmissionProfessorInterface) => {
  const data = getSubmissionData(submission)
  return data?.grade !== null && data?.grade !== undefined && data.grade < 10
}

const getAssignmentTypeIcon = (type: string) => {
  switch (type) {
    case 'homework':
      return 'material-symbols:assignment'
    case 'project':
      return 'material-symbols:folder-open'
    case 'exam':
      return 'material-symbols:quiz'
    default:
      return 'material-symbols:assignment'
  }
}

const getAssignmentTypeLabel = (type: string) => {
  switch (type) {
    case 'homework':
      return 'Devoir'
    case 'project':
      return 'Projet'
    case 'exam':
      return 'Examen'
    default:
      return 'Devoir'
  }
}

const getFileIcon = (fileUrl: string | null | undefined) => {
  if (!fileUrl) return 'material-symbols:attach-file-off'

  const url = fileUrl.toLowerCase()
  if (url.includes('github')) return 'material-symbols:code'
  if (url.includes('drive.google') || url.includes('docs.google')) return 'material-symbols:cloud'
  if (url.includes('.pdf')) return 'material-symbols:picture-as-pdf'
  if (url.includes('.doc') || url.includes('.docx')) return 'material-symbols:description'
  if (url.includes('.zip') || url.includes('.rar')) return 'material-symbols:folder-zip'

  return 'material-symbols:link'
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFullDate = (date: Date | string | null | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Actions

const exportSubmissions = async () => {
  try {

    const response = await axios.get(
      `/api/v1/submissions/promotion/${route.params.promotionId}/assignment/${route.params.assignmentId}/export`,
      { responseType: 'blob' }, // important
    )
    await PostEventLog({
      entityId: route.params.assignmentId as string,
      entityType: "assignment",
      eventType: "PROFESSOR_SUBMISSION_LIST_DOWNLOADED",
      timestamp: new Date(),
      userId: useMyUserStore().currentUser!._id,
      payload: {
        link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`
      },
    })

    // --- Téléchargement du fichier ---
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${assignment.value?.title}_submissions.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    toast.value = {
      show: true,
      message: 'Export réussi',
      title: 'Succès',
      type: 'success',
    }
  } catch (error) {
    console.error('Erreur:', error)

    let message = "Erreur lors de l'export"

    // Axios + blob → il faut le lire
    if (error instanceof AxiosError && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        message = json.message ?? message
      } catch {
        // si ce n'est pas du JSON, afficher brut
        message = await error.response.data.text()
      }
    }

    toast.value = {
      show: true,
      message,
      title: 'Erreur',
      type: 'error',
    }
  }
}


const viewDetails = (submission: SubmissionProfessorInterface) => {
  selectedSubmission.value = submission
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedSubmission.value = null
}

const openGradeModal = (submission: SubmissionProfessorInterface) => {
  if (assignment.value?.lockedGrade) {
    toast.value = {
      show: true,
      message: 'Les notes sont verrouillées et ne peuvent plus être modifiées',
      title: 'Notes verrouillées',
      type: 'error',
    }
    return
  }

  selectedSubmission.value = submission
  showGradeModal.value = true
}

const closeGradeModal = () => {
  showGradeModal.value = false
  selectedSubmission.value = null
}

const openLockGradesModal = () => {
  showLockGradesModal.value = true
}

const closeLockGradesModal = () => {
  showLockGradesModal.value = false
}

const lockGrades = async () => {
  if (!assignment.value) return

  try {
    // TODO: Appel API pour verrouiller les notes
    await axios.patch(
      `/api/v1/assignments/lock-grade/${assignment.value._id}/${route.params.promotionId}`,
    )

    await PostEventLog({
      entityId: assignment.value._id,
      entityType: "assignment",
      eventType: "PROFESSOR_ASSIGNMENT_LOCKED_GRADED",
      timestamp: new Date(),
      userId: useMyUserStore().currentUser!._id,
      payload: {
        link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`
      },
    })
    // Mettre à jour localement
    assignment.value.lockedGrade = true

    toast.value = {
      show: true,
      message: 'Notes verrouillées avec succès. Elles ne peuvent plus être modifiées.',
      title: 'Notes verrouillées',
      type: 'success',
    }

    emit("lockGradesNotificationByProfessor", { assignment: assignment.value, });

    closeLockGradesModal()
  } catch (error: unknown) {
    const errorMessage =
      error instanceof AxiosError ? error.response?.data : 'Erreur lors du verrouillage'
    toast.value = {
      show: true,
      message: errorMessage,
      title: 'Erreur',
      type: 'error',
    }
    console.error('Erreur:', error)
  }
}

const { emit } = useSocket()

const handleGradeSubmit = async (data: { grade: number; feedback: string }) => {
  if (!selectedSubmission.value) return

  if (assignment.value?.lockedGrade) {
    toast.value = {
      show: true,
      message: 'Les notes sont verrouillées et ne peuvent plus être modifiées',
      title: 'Notes verrouillées',
      type: 'error',
    }
    return
  }
  let response = null
  try {
    if (assignment.value?.submissionLocation === 'in-person') {
      if (selectedSubmission.value.submission.grade) {
        response = await axios.patch(
          `/api/v1/submissions/${selectedSubmission.value.submission._id}/in-person/professor`,
          {
            assignment: assignment.value!._id,
            grade: data.grade,
            feedback: data.feedback,
          },
        )
        toast.value = {
          show: true,
          message: 'Note mise à jour avec succès',
          title: 'Succès',
          type: 'success',
        }
        emit("gradesNotificationByProfessor", { submission: response.data, update: true });
        await PostEventLog({
          entityId: selectedSubmission.value.submission._id!,
          entityType: "submission",
          eventType: "PROFESSOR_GRADE_UPDATED",
          timestamp: new Date(),
          userId: useMyUserStore().currentUser!._id,
          payload: {
            link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`,
            info: {
              matricule: selectedSubmission.value.matricule,
              grade: data.grade,
              feedback: data.feedback
            }
          }
        })
      } else {
        response = await axios.post(`/api/v1/submissions/in-person/professor`, {
          student: selectedSubmission.value.studentId,
          assignment: assignment.value._id,
          grade: data.grade,
          feedback: data.feedback,
        })
        toast.value = {
          show: true,
          message: 'Note enregistrée avec succès',
          title: 'Succès',
          type: 'success',
        }
        emit("gradesNotificationByProfessor", { submission: response.data, update: false });
      }
      await PostEventLog({
        entityId: selectedSubmission.value.submission._id!,
        entityType: "submission",
        eventType: "PROFESSOR_GRADE_ENTERED",
        timestamp: new Date(),
        userId: useMyUserStore().currentUser!._id,
        payload: {
          link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`,
          info: {
            matricule: selectedSubmission.value.matricule,
            grade: data.grade,
            feedback: data.feedback
          }
        }
      })

    } else {
      response = await axios.patch(
        `/api/v1/submissions/${selectedSubmission.value.submission._id}/professor`,
        {
          student: selectedSubmission.value.studentId,
          assignment: assignment.value!._id,
          grade: data.grade,
          feedback: data.feedback,
        },
      )
      if (selectedSubmission.value.submission.status === "graded") {
        emit("gradesNotificationByProfessor", { submission: response.data, update: true });
        await PostEventLog({
          entityId: selectedSubmission.value.submission._id!,
          entityType: "submission",
          eventType: "PROFESSOR_GRADE_UPDATED",
          timestamp: new Date(),
          userId: useMyUserStore().currentUser!._id,
          payload: {
            link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`,
            info: {
              matricule: selectedSubmission.value.matricule,
              grade: data.grade,
              feedback: data.feedback
            }
          }
        })
      } else {
        emit("gradesNotificationByProfessor", { submission: response.data, update: false });
        await PostEventLog({
          entityId: selectedSubmission.value.submission._id!,
          entityType: "submission",
          eventType: "PROFESSOR_GRADE_ENTERED",
          timestamp: new Date(),
          userId: useMyUserStore().currentUser!._id,
          payload: {
            link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`,
            info: {
              matricule: selectedSubmission.value.matricule,
              grade: data.grade,
              feedback: data.feedback
            }
          }
        })

      }

    }


    // Mettre à jour localement
    const updatedSubmission = response.data as SubmissionInterface
    selectedSubmission.value.submission = updatedSubmission

    submissions.value = submissions.value.map((sub) =>
      sub.studentId === selectedSubmission.value?.studentId ? selectedSubmission.value! : sub,
    )





    // const submission = selectedSubmission.value
    // if (submission.submission) {
    //   const submissionData = submission.submission as SubmissionInterface
    //   submissionData.grade = data.grade
    //   submissionData.feedback = data.feedback
    //   submissionData.status = 'graded'
    //   submissionData.submittedAt = submissionData.submittedAt || new Date().toISOString()
    // }

    toast.value = {
      show: true,
      message: 'Note enregistrée avec succès',
      title: 'Succès',
      type: 'success',
    }

    closeGradeModal()
  } catch (error) {
    toast.value = {
      show: true,
      message:
        error instanceof AxiosError
          ? error.response?.data
          : 'Erreur lors de la soumission de la note',
      title: 'Erreur',
      type: 'error',
    }
  }
}

const assignment = ref<AssignmentInterface | null>(null)
// Récupération des données
const fetchUserForThisPromotion = async () => {
  loading.value = true
  try {
    const response = await axios.get(
      `/api/v1/submissions/promotion/${route.params.promotionId}/assignment/${route.params.assignmentId}`,
    )
    submissions.value = response.data.results
    assignment.value = response.data.assignment
    await PostEventLog({
      entityId: route.params.assignmentId as string,
      entityType: "assignment",
      eventType: "PROFESSOR_ASSIGNMENT_VIEWED",
      timestamp: new Date(),
      userId: useMyUserStore().currentUser!._id,
      payload: {
        link: `/professor/modules/${route.params.moduleId}/assignments/${route.params.assignmentId}/promotion/${route.params.promotionId}`
      },
    })
  } catch (error: unknown) {
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data
        : 'Erreur lors du chargement des soumissions'
    toast.value = {
      show: true,
      message: errorMessage,
      title: 'Erreur',
      type: 'error',
    }
  } finally {
    loading.value = false
  }
}

// Watchers
watchEffect(() => {
  if (route.params.promotionId && route.params.assignmentId) {
    fetchUserForThisPromotion()
  }
})
</script>

<style scoped>
.submissions-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: var(--background-light);
}

/* En-tête premium */
.submissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-light);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.header-icon svg {
  width: 26px;
  height: 26px;
}

.header-text h1 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.header-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Section des détails du devoir */
.assignment-details {
  margin-bottom: 1.5rem;
}

.assignment-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.assignment-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 1.5rem 2rem;
  color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.assignment-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.assignment-title svg {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.assignment-title h2 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 600;
  line-height: 1.3;
}

.assignment-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.type-badge,
.session-badge,
.location-badge,
.status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
}

.type-badge svg,
.session-badge svg,
.location-badge svg,
.status-badge svg {
  width: 14px;
  height: 14px;
}

.type-badge.homework {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.4);
}

.type-badge.project {
  background: rgba(155, 89, 182, 0.2);
  border-color: rgba(155, 89, 182, 0.4);
}

.type-badge.exam {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.4);
}

.session-badge.normal {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.4);
}

.session-badge.rattrapage {
  background: rgba(255, 165, 2, 0.2);
  border-color: rgba(255, 165, 2, 0.4);
}

.location-badge.online {
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.4);
}

.location-badge.in-person {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.4);
}

.status-badge.active {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.4);
}

.status-badge.cancelled {
  background: rgba(231, 76, 60, 0.2);
  border-color: rgba(231, 76, 60, 0.4);
}

.status-badge.locked {
  background: rgba(127, 140, 141, 0.2);
  border-color: rgba(127, 140, 141, 0.4);
}

.assignment-content {
  padding: 1.5rem 2rem;
}

.assignment-description {
  margin-bottom: 1.25rem;
}

.assignment-description p {
  margin: 0;
  color: var(--text-dark);
  line-height: 1.6;
  font-size: 0.9rem;
}

.assignment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.meta-item svg {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.attachment-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.attachment-link:hover {
  color: var(--primary-dark);
}

/* Layouts adaptatifs pour le tableau */
.table-row.layout-online {
  grid-template-columns: 120px 280px 160px 180px 120px 100px 120px;
}

.table-row.layout-inperson {
  grid-template-columns: 140px 320px 1fr 140px;
}

/* Statistiques */
.submissions-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--primary-extra-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.stat-icon.failure {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* Filtres */
.submissions-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--primary-extra-light);
  border-color: var(--primary-color-light);
  color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.filter-btn svg {
  width: 16px;
  height: 16px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.5rem 0.875rem;
  min-width: 250px;
}

.search-container svg {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 0.875rem;
  color: var(--text-dark);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Tableau */
.submissions-table-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow-x: auto;
}

.table-header {
  background: var(--background-secondary);
  border-bottom: 1px solid var(--border-light);
}

.table-row {
  display: grid;
  grid-template-columns: 120px 280px 160px 180px 120px 100px 120px;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.table-header-row {
  padding: 0.875rem 1.5rem;
}

.table-cell {
  display: flex;
  align-items: center;
  min-height: 40px;
}

.header-cell {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submission-row {
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.submission-row:hover {
  background: var(--background-light);
}

.submission-row:last-child {
  border-bottom: none;
}

/* Classes de statut pour les lignes */
.status-submitted {
  border-left: 4px solid var(--success);
}

.status-graded {
  border-left: 4px solid var(--primary-color);
}

.status-late {
  border-left: 4px solid var(--warning);
}

.status-not_submitted {
  border-left: 4px solid var(--error);
}

/* Contenu des cellules */
.matricule-badge {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.8rem;
}

.student-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--background-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.student-avatar svg {
  width: 20px;
  height: 20px;
}

.student-details {
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
}

.student-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.file-link:hover {
  color: var(--primary-dark);
}

.file-link svg {
  width: 18px;
  height: 18px;
}

.no-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.no-file svg {
  width: 16px;
  height: 16px;
}

.submission-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-dark);
}

.submission-date svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.no-submission {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.no-submission svg {
  width: 16px;
  height: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.submitted {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.status-badge.graded {
  background: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
}

.status-badge.late {
  background: rgba(255, 165, 2, 0.1);
  color: var(--warning);
}

.status-badge.not_submitted {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.status-badge svg {
  width: 14px;
  height: 14px;
}

.grade-display {
  font-weight: 600;
  color: var(--text-dark);
}

.grade-value {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
}

.grade-value.failed {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.no-grade {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.action-buttons {
  display: flex;
  gap: 0.375rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--background-light);
  color: var(--text-secondary);
}

.action-btn:hover {
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn:disabled:hover {
  transform: none;
  background: var(--background-light);
  color: var(--text-secondary);
}

.detail-btn:hover {
  background: var(--primary-color);
  color: var(--white);
}

.grade-btn:hover {
  background: var(--warning);
  color: var(--white);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

/* Modals */
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: var(--white);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header .header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-header .header-content svg {
  width: 24px;
  height: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
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
}

.modal-content {
  padding: 1.5rem 2rem 2rem;
  max-height: calc(90vh - 100px);
  overflow-y: auto;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn:hover {
  background: var(--background-light);
  border-color: var(--border-dark);
}

/* États vides */
.empty-state,
.empty-filter-state,
.loading-state {
  text-align: center;
  padding: 3rem 1.5rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin: 1.5rem 0;
}

.empty-icon,
.loading-spinner {
  margin-bottom: 1.25rem;
}

.empty-icon svg {
  width: 48px;
  height: 48px;
  opacity: 0.6;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1.5s linear infinite;
  width: 40px;
  height: 40px;
  color: var(--primary-color);
}

.empty-state h3,
.empty-filter-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
}

.empty-state p,
.empty-filter-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

.reset-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--white);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Modal de verrouillage des notes */
.lock-confirmation {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-section {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 165, 2, 0.1);
  border: 1px solid rgba(255, 165, 2, 0.3);
  border-radius: var(--radius);
}

.warning-icon {
  flex-shrink: 0;
}

.warning-icon svg {
  width: 24px;
  height: 24px;
  color: var(--warning);
}

.warning-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--warning);
  font-size: 1rem;
  font-weight: 600;
}

.warning-content p {
  margin: 0;
  color: var(--text-dark);
  font-size: 0.875rem;
  line-height: 1.5;
}

.grades-summary {
  background: var(--background-light);
  padding: 1rem;
  border-radius: var(--radius);
}

.grades-summary h4 {
  margin: 0 0 1rem 0;
  color: var(--text-dark);
  font-size: 1rem;
  font-weight: 600;
}

.summary-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.875rem;
}

.summary-value.warning {
  color: var(--warning);
}

.confirmation-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.confirm-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--warning);
  border: 1px solid var(--warning);
  color: var(--white);
}

.confirm-btn:hover:not(:disabled) {
  background: #e67e22;
  transform: translateY(-1px);
}

.confirm-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Toast */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1100;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  animation: toastSlideIn 0.3s ease-out;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid var(--success);
}

.toast.error {
  border-left: 4px solid var(--error);
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}

.toast-close:hover {
  background: var(--background-light);
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes overlayFadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.submission-fade-enter-active,
.submission-fade-leave-active {
  transition: all 0.4s ease;
}

.submission-fade-enter-from,
.submission-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .table-row {
    grid-template-columns: 100px 250px 140px 160px 110px 90px 110px;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
  }

  .table-header-row {
    padding: 0.75rem 1rem;
  }
}

@media (max-width: 768px) {
  .submissions-container {
    padding: 1rem;
  }

  .submissions-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .submissions-stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .submissions-filters {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-group {
    justify-content: center;
    gap: 0.375rem;
  }

  .search-container {
    min-width: auto;
    width: 100%;
  }

  .submissions-table-container {
    overflow-x: auto;
  }

  .table-row {
    grid-template-columns: 80px 200px 120px 140px 100px 80px 100px;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    min-width: 800px;
  }

  .modal-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .submissions-container {
    padding: 0.75rem;
  }

  .submissions-stats {
    grid-template-columns: 1fr;
  }

  .table-row {
    gap: 0.375rem;
    padding: 0.625rem 0.375rem;
  }

  .student-name {
    font-size: 0.8rem;
  }

  .student-email {
    font-size: 0.7rem;
  }

  .modal-container {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .confirmation-actions {
    flex-direction: column;
  }
}

/* Media queries spéciales pour sidebar étendu */
@media (min-width: 1200px) and (max-width: 1500px) {
  .submissions-container {
    max-width: calc(100vw - 280px);
    /* Espace pour sidebar étendu */
    margin-left: auto;
    margin-right: 0;
  }

  .table-row.layout-online {
    grid-template-columns: 90px 220px 130px 150px 100px 85px 100px;
  }

  .table-row.layout-inperson {
    grid-template-columns: 110px 250px 1fr 110px;
  }

  .assignment-header {
    flex-direction: column;
    gap: 1rem;
    text-align: left;
  }

  .assignment-badges {
    justify-content: flex-start;
  }
}

@media (min-width: 1500px) {
  .submissions-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}
</style>
