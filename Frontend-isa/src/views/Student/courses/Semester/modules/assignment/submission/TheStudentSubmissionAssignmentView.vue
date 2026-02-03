<template>
    <div class="submission-container">
        <!-- Navigation -->
        <div class="navigation-header">
            <BreadCrumbsBack />
            <BreadCrumbs />
        </div>

        <!-- Loading State -->
        <SpinningLoader v-if="loading" />

        <!-- Error State -->
        <ErrorComponent v-else-if="errorServer && !loading" :message="errorServer" />

        <!-- Main Content -->
        <div v-else-if="!loading && assignmentsWithSubmissions" class="submission-content">
            <!-- Assignment Header -->
            <div class="assignment-header-card">
                <div class="header-top">
                    <div class="assignment-info">
                        <div class="assignment-icon" :class="getAssignmentTypeClass(assignmentsWithSubmissions.type)">
                            <Icon :icon="getAssignmentIcon(assignmentsWithSubmissions.type)" />
                        </div>
                        <div class="assignment-details">
                            <h1 class="assignment-title">{{ assignmentsWithSubmissions.title }}</h1>
                            <div class="assignment-meta">
                                <span class="meta-badge type-badge"
                                    :class="getAssignmentTypeClass(assignmentsWithSubmissions.type)">
                                    <Icon :icon="getAssignmentIcon(assignmentsWithSubmissions.type)" />
                                    {{ getAssignmentTypeLabel(assignmentsWithSubmissions.type) }}
                                </span>
                                <span class="meta-badge session-badge">
                                    <Icon icon="material-symbols:schedule-outline" />
                                    {{
                                        assignmentsWithSubmissions.session === 'rattrapage'
                                            ? 'Rattrapage'
                                            : 'Session normale'
                                    }}
                                </span>
                                <span class="meta-badge location-badge">
                                    <Icon :icon="assignmentsWithSubmissions.submissionLocation === 'online'
                                        ? 'material-symbols:cloud-upload'
                                        : 'material-symbols:location-on-outline'
                                        " />
                                    {{
                                        assignmentsWithSubmissions.submissionLocation === 'online'
                                            ? 'Soumission en ligne'
                                            : 'Soumission présentielle'
                                    }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="assignment-status-badge" :class="getSubmissionStatusClass()">
                        <Icon :icon="getSubmissionStatusIcon()" />
                        <span>{{ getSubmissionStatusLabel() }}</span>
                    </div>
                </div>

                <!-- Due Date Banner -->
                <div class="due-date-banner" :class="{ urgent: isUrgent(), overdue: isOverdue() }">
                    <Icon icon="material-symbols:schedule-outline" />
                    <span>
                        <strong>Échéance :</strong> {{ formatDate(assignmentsWithSubmissions.dueDate) }}
                        <span v-if="isOverdue()" class="overdue-text"> - Échéance dépassée</span>
                        <span v-else-if="isUrgent()" class="urgent-text"> - Date limite proche</span>
                    </span>
                </div>
            </div>

            <!-- Two Column Layout -->
            <div class="content-layout">
                <!-- Left Column: Assignment Description -->
                <div class="left-column">
                    <div class="description-card">
                        <div class="card-header">
                            <Icon icon="material-symbols:description-outline" />
                            <h2>Consignes du devoir</h2>
                        </div>
                        <div class="card-content">
                            <QuillContentViewer :content="assignmentsWithSubmissions.description" :watermark="true"
                                :downloadable="true" :assignment="assignmentsWithSubmissions" />
                        </div>
                    </div>

                    <!-- Assignment File if exists -->
                    <div v-if="assignmentsWithSubmissions.fileUrl" class="attachment-card">
                        <div class="card-header">
                            <Icon icon="material-symbols:attachment" />
                            <h2>Fichier joint par l'enseignant</h2>
                        </div>
                        <div class="card-content">
                            <a :href="assignmentsWithSubmissions.fileUrl" target="_blank" class="file-link">
                                <Icon icon="material-symbols:insert-drive-file-outline" />
                                <span>Télécharger le fichier du devoir</span>
                                <Icon icon="material-symbols:download" />
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Submission Panel -->
                <div class="right-column">
                    <!-- Submission Card: Already Submitted -->
                    <div v-if="assignmentsWithSubmissions.submission" class="submission-card submitted">
                        <div class="card-header success">
                            <Icon icon="material-symbols:check-circle-outline" />
                            <h2>Votre soumission</h2>
                        </div>

                        <div class="card-content">
                            <!-- Submission Details -->
                            <div class="submission-info">
                                <div class="info-row">
                                    <Icon icon="material-symbols:calendar-today-outline" />
                                    <div class="info-content">
                                        <span class="info-label">Date de soumission</span>
                                        <span class="info-value">{{
                                            formatDate(assignmentsWithSubmissions.submission.submittedAt)
                                            }}</span>
                                    </div>
                                </div>

                                <!-- Show file link only for online submissions -->
                                <div class="info-row" v-if="assignmentsWithSubmissions.submissionLocation === 'online'">
                                    <Icon icon="material-symbols:link" />
                                    <div class="info-content">
                                        <span class="info-label">Fichier soumis</span>
                                        <a :href="assignmentsWithSubmissions.submission.fileUrl" target="_blank"
                                            class="submission-link">
                                            Voir mon fichier
                                            <Icon icon="material-symbols:open-in-new" />
                                        </a>
                                    </div>
                                </div>

                                <!-- In-person submission confirmation -->
                                <div class="info-row"
                                    v-if="assignmentsWithSubmissions.submissionLocation === 'in-person'">
                                    <Icon icon="material-symbols:location-on-outline" />
                                    <div class="info-content">
                                        <span class="info-label">Mode de soumission</span>
                                        <span class="info-value in-person-badge">Remis en main propre</span>
                                    </div>
                                </div>

                                <div class="info-row"
                                    v-if="assignmentsWithSubmissions.submission.grade !== null && assignmentsWithSubmissions.submission.grade !== undefined">
                                    <Icon icon="material-symbols:star-outline" />
                                    <div class="info-content">
                                        <span class="info-label">Note</span>
                                        <span class="info-value grade" :class="getGradeClass()">{{
                                            assignmentsWithSubmissions.submission.grade }}
                                            / 20</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Feedback Section -->
                            <div v-if="assignmentsWithSubmissions.submission.grade && assignmentsWithSubmissions.submission.feedback"
                                class="feedback-section">
                                <div class="feedback-header">
                                    <Icon icon="material-symbols:comment-outline" />
                                    <h3>Commentaires de l'enseignant</h3>
                                </div>
                                <div class="feedback-content">
                                    {{ assignmentsWithSubmissions.submission.feedback }}
                                </div>
                            </div>

                            <div v-else-if="assignmentsWithSubmissions.submission.status === 'graded' && !assignmentsWithSubmissions.submission.feedback"
                                class="no-feedback">
                                <Icon icon="material-symbols:comment-outline" />
                                <p>Le professeur n'a pas laissé de commentaires</p>
                            </div>

                            <div v-if="assignmentsWithSubmissions.submission.status !== 'graded'" class="no-feedback">
                                <Icon icon="material-symbols:pending-actions" />
                                <p>En cours d'évaluation</p>
                            </div>

                            <!-- Edit Submission Button (only for online submissions) -->
                            <button class="edit-submission-btn" @click="showEditForm = true" v-if="
                                !showEditForm &&
                                !isOverdue() &&
                                assignmentsWithSubmissions.submissionLocation === 'online' &&
                                (assignmentsWithSubmissions.submission.grade === null || assignmentsWithSubmissions.submission.grade === undefined)
                            ">
                                <Icon icon="material-symbols:edit-outline" />
                                <span>Modifier ma soumission</span>
                            </button>

                            <!-- Edit Form -->
                            <div v-if="showEditForm" class="edit-form-section">
                                <div class="form-header">
                                    <Icon icon="material-symbols:edit-document-outline" />
                                    <h3>Modifier le lien de soumission</h3>
                                </div>
                                <Form :validation-schema="schemaValidation" @submit="handleEditSubmit">
                                    <InputField label="Nouveau lien vers votre fichier (Google Drive, OneDrive, etc.)"
                                        name="fileUrl" placeholder="https://drive.google.com/..."
                                        :modelValue="assignmentsWithSubmissions.submission.fileUrl" />
                                    <div class="form-actions">
                                        <button type="button" class="btn-cancel" @click="showEditForm = false">
                                            <Icon icon="material-symbols:close" />
                                            Annuler
                                        </button>
                                        <button type="submit" class="btn-submit">
                                            <Icon icon="material-symbols:save-outline" />
                                            Enregistrer
                                        </button>
                                    </div>
                                </Form>
                            </div>
                        </div>
                    </div>

                    <!-- Submission Card: Not Yet Submitted -->
                    <div v-else class="submission-card pending">
                        <div class="card-header warning">
                            <Icon icon="material-symbols:pending-actions" />
                            <h2>Rendre le devoir</h2>
                        </div>

                        <div class="card-content">
                            <!-- Online Submission -->
                            <template v-if="assignmentsWithSubmissions.submissionLocation === 'online'">
                                <div class="submission-instructions">
                                    <Icon icon="material-symbols:info-outline" />
                                    <p>Soumettez le lien vers votre fichier (Google Drive, OneDrive, etc.)</p>
                                </div>

                                <Form :validation-schema="schemaValidation" @submit="handleSubmit" v-slot="{ errors }">
                                    <InputField label="Lien vers votre fichier" name="fileUrl"
                                        placeholder="https://drive.google.com/..." :error="!!errors.fileUrl" />
                                    <div class="submission-note">
                                        <Icon icon="material-symbols:lightbulb-outline" />
                                        <div>
                                            <p>
                                                <strong>Conseil :</strong> Assurez-vous que le lien est accessible et
                                                que
                                                les permissions de partage sont correctement configurées.
                                            </p>
                                            <p class="naming-convention">
                                                <strong>Nommage du fichier :</strong> Utilisez le format
                                                <code>CodeModule_Matricule</code> (ex:
                                                <code>INF101_ETU-000000</code>)
                                            </p>
                                            <p class="file-format">
                                                Pour plusieurs fichiers, regroupez-les dans un fichier
                                                <strong>RAR</strong> ou <strong>ZIP</strong>.
                                            </p>
                                        </div>
                                    </div>

                                    <!-- Warning if submitting late -->
                                    <div v-if="isOverdue()" class="late-warning">
                                        <Icon icon="material-symbols:warning-outline" />
                                        <p>
                                            <strong>Attention :</strong> L'échéance est dépassée. Votre soumission sera
                                            marquée comme étant en retard.
                                        </p>
                                    </div>

                                    <button type="submit" class="btn-submit-work" :class="{ 'btn-late': isOverdue() }">
                                        <Icon icon="material-symbols:upload" />
                                        <span>{{ isOverdue() ? 'Soumettre en retard' : 'Soumettre le devoir' }}</span>
                                    </button>
                                </Form>
                            </template>

                            <!-- In-Person Submission -->
                            <template v-else>
                                <div class="in-person-notice">
                                    <Icon icon="material-symbols:location-on-outline" />
                                    <div class="notice-content">
                                        <h3>Soumission présentielle requise</h3>
                                        <p>
                                            Ce devoir doit être rendu en main propre. La soumission en ligne n'est pas
                                            autorisée pour ce type de devoir.
                                        </p>
                                    </div>
                                </div>

                                <!-- Message if deadline passed -->
                                <div v-if="isOverdue()" class="overdue-message">
                                    <Icon icon="material-symbols:info-outline" />
                                    <div>
                                        <p>
                                            <strong>L'échéance est dépassée.</strong>
                                        </p>
                                        <p>
                                            Si vous avez déjà remis votre devoir au professeur, veuillez patienter
                                            pour la publication de votre note.
                                        </p>
                                    </div>
                                </div>

                                <!-- Deadline reminder if not overdue -->
                                <div v-else class="deadline-reminder">
                                    <Icon icon="material-symbols:schedule-outline" />
                                    <div>
                                        <strong>Date limite :</strong>
                                        {{ formatDate(assignmentsWithSubmissions.dueDate) }}
                                        <br />
                                        <span class="reminder-text">Remettez votre devoir directement à l'enseignant
                                            avant cette
                                            date.</span>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import QuillContentViewer from '@/components/EDITOR/QuillContentViewer.vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import BreadCrumbs from '@/components/ui/BreadCrumbs.vue'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import type { AssigmentsSubmissionInterface } from '@/interfaces/assignment.interface'
import axios from 'axios'
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form } from 'vee-validate'
import InputField from '@/components/ui/InputField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useSocket } from '@/composables/useSocket'
import { useMyUserStore } from '@/stores/userStore'
import type StudentInterface from '@/interfaces/student.intefaces'
import { update } from 'lodash'
import { PostEventLog } from '@/utils/eventLog'

const schemaValidation = toTypedSchema(
    z.object({
        fileUrl: z.string({ required_error: 'Ce champ est requis.' })
            .url('Veuillez entrer une URL valide.')
            .min(1, "Ce champ est requis.")
    }),
)

const loading = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const errorServer = ref<string>('')
const assignmentsWithSubmissions = ref<AssigmentsSubmissionInterface | null>(null)
const showEditForm = ref<boolean>(false)

const fetchAssignmentsWithSubmissions = async () => {
    try {
        const response = await axios.get(`/api/v1/assignments/student/${route.params.assignmentId}`)
        assignmentsWithSubmissions.value = response.data
        await PostEventLog({
            entityId: response.data._id,
            entityType: "assignment",
            eventType: "STUDENT_ASSIGNMENT_VIEWED",
            timestamp: new Date(),
            userId: useMyUserStore().currentUser!._id,
        })
    } catch (error: any) {
        errorServer.value =
            error.response?.data || 'Une erreur est survenue lors de la récupération des devoirs.'
    } finally {
        loading.value = false
    }
}
const { emit } = useSocket();
const currentUser = useMyUserStore().currentUser as StudentInterface
const handleSubmit = async (values: any) => {
    try {
        await axios.post(`/api/v1/submissions/online/${route.params.assignmentId}`, values)
        await fetchAssignmentsWithSubmissions()
        emit("submissionNotificationByStudent", { assignment: assignmentsWithSubmissions.value, user: currentUser.matricule, update: false })
    } catch (error: any) {
        console.error('Erreur lors de la soumission:', error)
    }
}

const handleEditSubmit = async (values: any) => {
    try {
        await axios.patch(
            `/api/v1/submissions/online/${assignmentsWithSubmissions.value?.submission?._id}`,
            values,
        )
        showEditForm.value = false
        await fetchAssignmentsWithSubmissions()
        emit("submissionNotificationByStudent", { assignment: assignmentsWithSubmissions.value, matricule: currentUser.matricule, update: true })
    } catch (error: any) {
        console.error('Erreur lors de la modification:', error)
    }
}

// Utility Functions
const getAssignmentIcon = (type: string): string => {
    const icons: Record<string, string> = {
        homework: 'material-symbols:assignment-outline',
        project: 'material-symbols:folder-special-outline',
        exam: 'material-symbols:quiz-outline',
    }
    return icons[type] || 'material-symbols:assignment-outline'
}

const getAssignmentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
        homework: 'Devoir',
        project: 'Projet',
        exam: 'Examen',
    }
    return labels[type] || type
}

const getAssignmentTypeClass = (type: string): string => {
    return type
}

const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const isOverdue = (): boolean => {
    if (!assignmentsWithSubmissions.value) return false
    return new Date() > new Date(assignmentsWithSubmissions.value.dueDate)
}

const isUrgent = (): boolean => {
    if (!assignmentsWithSubmissions.value) return false
    const now = new Date()
    const dueDate = new Date(assignmentsWithSubmissions.value.dueDate)
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays <= 2 && diffDays > 0
}

const getSubmissionStatusClass = (): string => {
    if (!assignmentsWithSubmissions.value) return 'pending'
    if (assignmentsWithSubmissions.value.submission) {
        // Vérifier si la note existe et n'est pas null/undefined
        const hasGrade =
            assignmentsWithSubmissions.value.submission.grade !== null &&
            assignmentsWithSubmissions.value.submission.grade !== undefined
        if (hasGrade) return 'graded'

        // Vérifier le statut de la soumission (provient du backend)
        if (assignmentsWithSubmissions.value.submission.status === 'late') return 'late'

        return 'submitted'
    }
    if (isOverdue()) return 'overdue'
    return 'pending'
}

const getSubmissionStatusIcon = (): string => {
    const status = getSubmissionStatusClass()
    const icons: Record<string, string> = {
        graded: 'material-symbols:grade',
        submitted: 'material-symbols:check-circle-outline',
        late: 'material-symbols:schedule-outline',
        overdue: 'material-symbols:event-busy',
        pending: 'material-symbols:pending-actions',
    }
    return icons[status] || 'material-symbols:pending-actions'
}

const getSubmissionStatusLabel = (): string => {
    const status = getSubmissionStatusClass()
    const labels: Record<string, string> = {
        graded: 'Noté',
        submitted: 'Soumis',
        late: 'Soumis en retard',
        overdue: 'Échéance dépassée',
        pending: 'À rendre',
    }
    return labels[status] || 'À rendre'
}

// Fonction pour obtenir la classe de couleur selon la note
const getGradeClass = (): string => {
    if (!assignmentsWithSubmissions.value?.submission?.grade) return ''
    const grade = assignmentsWithSubmissions.value.submission.grade
    // Mauvaise note: < 10 (rouge)
    if (grade < 10) return 'grade-poor'
    // Bonne note: >= 10 (couleur normal/primaire)
    return ''
}

watchEffect(() => {
    if (route.params.assignmentId) {
        fetchAssignmentsWithSubmissions()
    }
})
</script>

<style scoped>
.submission-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    background: var(--background-light);
    min-height: 100vh;
}

.navigation-header {
    margin-bottom: 1.5rem;
}

.submission-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Assignment Header Card */
.assignment-header-card {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-xl);
    padding: 2rem;
    box-shadow: var(--shadow-xl);
    color: var(--white);
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    margin-bottom: 1.5rem;
}

.assignment-info {
    display: flex;
    gap: 1.5rem;
    flex: 1;
}

.assignment-icon {
    width: 72px;
    height: 72px;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    flex-shrink: 0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.assignment-icon svg {
    width: 36px;
    height: 36px;
}

.assignment-details {
    flex: 1;
}

.assignment-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 1rem 0;
    line-height: 1.2;
    color: var(--white);
}

.assignment-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.meta-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-lg);
    font-size: 0.875rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.meta-badge svg {
    width: 18px;
    height: 18px;
}

.assignment-status-badge {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
}

.assignment-status-badge svg {
    width: 24px;
    height: 24px;
}

.assignment-status-badge.submitted {
    color: var(--success);
}

.assignment-status-badge.late {
    color: var(--warning);
}

.assignment-status-badge.graded {
    color: var(--primary-color);
}

.assignment-status-badge.pending {
    color: var(--warning);
}

.assignment-status-badge.overdue {
    color: var(--error);
}

/* Due Date Banner */
.due-date-banner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 1rem;
}

.due-date-banner svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}

.due-date-banner.urgent {
    background: rgba(255, 165, 0, 0.2);
    border-color: rgba(255, 165, 0, 0.4);
}

.due-date-banner.overdue {
    background: rgba(235, 77, 75, 0.2);
    border-color: rgba(235, 77, 75, 0.4);
}

.urgent-text,
.overdue-text {
    font-weight: 700;
}

/* Two Column Layout */
.content-layout {
    display: grid;
    grid-template-columns: 1fr 450px;
    gap: 1.5rem;
    align-items: start;
}

.left-column,
.right-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Cards */
.description-card,
.attachment-card,
.submission-card,
.quick-info-card {
    background: var(--white);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--border-light);
    overflow: hidden;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    background: var(--background-secondary);
    border-bottom: 1px solid var(--border-light);
}

.card-header svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    flex-shrink: 0;
}

.card-header h2,
.card-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.card-header.success {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.05));
    border-bottom-color: rgba(46, 204, 113, 0.2);
}

.card-header.success svg {
    color: var(--success);
}

.card-header.warning {
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(230, 126, 34, 0.05));
    border-bottom-color: rgba(243, 156, 18, 0.2);
}

.card-header.warning svg {
    color: var(--warning);
}

.card-content {
    padding: 1.5rem;
}

/* Description Card */
.description-card .card-content {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-dark);
}

/* Attachment Card */
.file-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, var(--primary-extra-light), rgba(99, 102, 241, 0.05));
    border: 2px dashed var(--primary-color-light);
    border-radius: var(--radius-lg);
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.file-link svg {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
}

.file-link:hover {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: var(--white);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

/* Submission Card */
.submission-info {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-bottom: 1.5rem;
}

.info-row {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.info-row svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.info-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.info-value {
    font-size: 1rem;
    color: var(--text-dark);
    font-weight: 600;
}

.info-value.grade {
    font-size: 1.5rem;
    color: var(--primary-color);
    font-weight: 700;
}

/* Grade poor color (< 10) */
.info-value.grade.grade-poor {
    color: var(--error);
}

.info-value.in-person-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: linear-gradient(135deg, var(--primary-extra-light), rgba(99, 102, 241, 0.1));
    border: 1px solid var(--primary-color-light);
    border-radius: var(--radius-lg);
    color: var(--primary-color);
    font-size: 0.9375rem;
    font-weight: 600;
}

.submission-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
}

.submission-link svg {
    width: 18px;
    height: 18px;
}

.submission-link:hover {
    color: var(--primary-dark);
    gap: 0.75rem;
}

/* Feedback Section */
.feedback-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid var(--border-light);
}

.feedback-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.feedback-header svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
}

.feedback-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.feedback-content {
    padding: 1.25rem;
    background: linear-gradient(135deg, var(--background-secondary), var(--background-light));
    border-left: 4px solid var(--primary-color);
    border-radius: var(--radius);
    font-size: 1rem;
    line-height: 1.7;
    color: var(--text-dark);
    white-space: pre-wrap;
}

.no-feedback {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.25rem;
    background: var(--background-secondary);
    border-radius: var(--radius-lg);
    color: var(--text-secondary);
    font-style: italic;
    margin-top: 1.5rem;
}

.no-feedback svg {
    width: 24px;
    height: 24px;
}

/* Edit Submission Button */
.edit-submission-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    width: 100%;
    padding: 0.875rem;
    background: var(--background-secondary);
    border: 2px solid var(--border-light);
    border-radius: var(--radius-lg);
    color: var(--primary-color);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 1.5rem;
}

.edit-submission-btn svg {
    width: 20px;
    height: 20px;
}

.edit-submission-btn:hover {
    background: var(--primary-extra-light);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

/* Edit Form Section */
.edit-form-section {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid var(--border-light);
}

.form-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
}

.form-header svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
}

.form-header h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.btn-cancel,
.btn-submit {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem;
    border-radius: var(--radius-lg);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
}

.btn-cancel {
    background: var(--background-secondary);
    color: var(--text-secondary);
    border: 2px solid var(--border-light);
}

.btn-cancel:hover {
    background: var(--background-light);
    color: var(--text-dark);
}

.btn-submit {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: var(--white);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.btn-cancel svg,
.btn-submit svg {
    width: 20px;
    height: 20px;
}

/* Submission Instructions */
.submission-instructions {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1.125rem;
    background: linear-gradient(135deg, var(--primary-extra-light), rgba(99, 102, 241, 0.05));
    border-left: 4px solid var(--primary-color);
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
}

.submission-instructions svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.submission-instructions p {
    margin: 0;
    color: var(--text-dark);
    font-size: 0.9375rem;
    line-height: 1.6;
}

.submission-note {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1rem;
    background: var(--background-secondary);
    border-radius: var(--radius);
    margin-top: 2rem;
    margin-bottom: 1.25rem;

}

.submission-note svg {
    width: 22px;
    height: 22px;
    color: var(--warning);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.submission-note p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.6;
}

.submission-note p+p {
    margin-top: 0.625rem;
}

.submission-note code {
    background: var(--primary-extra-light);
    color: var(--primary-color);
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius);
    font-size: 0.8125rem;
    font-weight: 600;
    font-family: 'Courier New', monospace;
}

.naming-convention,
.file-format {
    color: var(--text-dark);
}

/* Late Warning */
.late-warning {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1.125rem;
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.15), rgba(243, 156, 18, 0.05));
    border: 2px solid rgba(243, 156, 18, 0.3);
    border-radius: var(--radius-lg);
    margin-top: 1rem;
    margin-bottom: 1.25rem;
}

.late-warning svg {
    width: 24px;
    height: 24px;
    color: var(--warning);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.late-warning p {
    margin: 0;
    color: var(--text-dark);
    font-size: 0.9375rem;
    line-height: 1.6;
}

.late-warning strong {
    color: var(--warning);
}

/* In-Person Submission Styles */
.in-person-notice {
    display: flex;
    gap: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
    border: 2px solid var(--primary-color-light);
    border-radius: var(--radius-lg);
    margin-bottom: 1.5rem;
}

.in-person-notice>svg {
    width: 48px;
    height: 48px;
    color: var(--primary-color);
    flex-shrink: 0;
}

.notice-content h3 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--primary-dark);
    margin: 0 0 0.75rem 0;
}

.notice-content p {
    margin: 0;
    color: var(--text-dark);
    font-size: 0.9375rem;
    line-height: 1.6;
}

/* Overdue Message for In-Person Submission */
.overdue-message {
    display: flex;
    gap: 1.25rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(243, 156, 18, 0.05));
    border: 2px solid rgba(243, 156, 18, 0.3);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.15);
    margin-bottom: 1.5rem;
}

.overdue-message>svg {
    width: 36px;
    height: 36px;
    color: var(--warning);
    flex-shrink: 0;
}

.overdue-message div {
    flex: 1;
}

.overdue-message p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-dark);
}

.overdue-message p+p {
    margin-top: 0.625rem;
}

.overdue-message strong {
    color: var(--warning);
    font-weight: 700;
}

.deadline-reminder {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(235, 77, 75, 0.1), rgba(235, 77, 75, 0.05));
    border: 2px solid rgba(235, 77, 75, 0.3);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 12px rgba(235, 77, 75, 0.15);
}

.deadline-reminder>svg {
    width: 32px;
    height: 32px;
    color: var(--error);
    flex-shrink: 0;
}

.deadline-reminder div {
    flex: 1;
    font-size: 1rem;
    color: var(--text-dark);
    line-height: 1.5;
}

.deadline-reminder strong {
    color: var(--error);
    font-weight: 700;
}

.reminder-text {
    font-size: 0.9375rem;
    color: var(--text-secondary);
    font-style: italic;
    margin-top: 0.375rem;
    display: inline-block;
}

.btn-submit-work {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, var(--success), #27ae60);
    color: var(--white);
    border: none;
    border-radius: var(--radius-lg);
    font-size: 1.125rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(46, 204, 113, 0.3);
}

.btn-submit-work svg {
    width: 24px;
    height: 24px;
}

.btn-submit-work:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(46, 204, 113, 0.4);
}

.btn-submit-work.btn-late {
    background: linear-gradient(135deg, var(--warning), #e67e22);
    box-shadow: 0 4px 16px rgba(243, 156, 18, 0.3);
}

.btn-submit-work.btn-late:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(243, 156, 18, 0.4);
}

.btn-submit-work:disabled {
    background: var(--gray-light);
    color: var(--gray);
    cursor: not-allowed;
    box-shadow: none;
}

/* Quick Info Card */
.quick-info-card {
    padding: 1.25rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--background-secondary);
    border-radius: var(--radius-lg);
    margin-bottom: 0.75rem;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item svg {
    width: 24px;
    height: 24px;
    color: var(--primary-color);
    flex-shrink: 0;
}

.info-item div {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-item .info-label {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.info-item .info-value {
    font-size: 0.9375rem;
    color: var(--text-dark);
    font-weight: 600;
}

/* Responsive */
@media (max-width: 1024px) {
    .content-layout {
        grid-template-columns: 1fr;
    }

    .right-column {
        order: -1;
    }
}

@media (max-width: 768px) {
    .submission-container {
        padding: 1rem;
    }

    .assignment-header-card {
        padding: 1.5rem;
    }

    .header-top {
        flex-direction: column;
        gap: 1.5rem;
    }

    .assignment-info {
        flex-direction: column;
        gap: 1rem;
    }

    .assignment-icon {
        width: 60px;
        height: 60px;
    }

    .assignment-icon svg {
        width: 30px;
        height: 30px;
    }

    .assignment-title {
        font-size: 1.5rem;
    }

    .assignment-status-badge {
        width: 100%;
        justify-content: center;
    }

    .card-content {
        padding: 1.25rem;
    }

    .form-actions {
        flex-direction: column;
    }

    .in-person-notice {
        flex-direction: column;
        gap: 1rem;
    }

    .in-person-notice>svg {
        width: 40px;
        height: 40px;
    }

    .overdue-message {
        flex-direction: column;
        gap: 1rem;
    }

    .overdue-message>svg {
        width: 32px;
        height: 32px;
    }

    .late-warning {
        flex-direction: column;
        gap: 0.75rem;
    }

    .late-warning svg {
        width: 28px;
        height: 28px;
    }

    .deadline-reminder {
        flex-direction: column;
        gap: 0.75rem;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .assignment-title {
        font-size: 1.25rem;
    }

    .assignment-meta {
        gap: 0.5rem;
    }

    .meta-badge {
        font-size: 0.8125rem;
        padding: 0.375rem 0.75rem;
    }

    .card-header {
        padding: 1rem 1.25rem;
    }

    .card-header h2 {
        font-size: 1rem;
    }

    .in-person-notice>svg {
        width: 36px;
        height: 36px;
    }

    .notice-content h3 {
        font-size: 1rem;
    }

    .notice-content p {
        font-size: 0.875rem;
    }

    .overdue-message>svg {
        width: 28px;
        height: 28px;
    }

    .overdue-message p {
        font-size: 0.875rem;
    }

    .late-warning {
        padding: 1rem;
    }

    .late-warning svg {
        width: 22px;
        height: 22px;
    }

    .late-warning p {
        font-size: 0.875rem;
    }

    .deadline-reminder>svg {
        width: 28px;
        height: 28px;
    }

    .deadline-reminder div {
        font-size: 0.875rem;
    }

    .submission-note {
        padding: 0.75rem;
    }

    .submission-note code {
        font-size: 0.75rem;
    }
}
</style>
