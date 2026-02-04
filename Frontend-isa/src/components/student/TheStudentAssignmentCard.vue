<template>
  <div
    class="assignment-card"
    :class="{
      'assignment-cancelled': !assignment.isActive,
      'assignment-missed': isMissed,
    }"
  >
    <div class="assignment-header">
      <div class="assignment-icon" :class="getAssignmentTypeClass(assignment.type)">
        <Icon :icon="getAssignmentIcon(assignment.type)" />
      </div>
    </div>

    <div class="assignment-content">
      <h3 class="assignment-title">{{ assignment.title }}</h3>

      <div class="assignment-meta">
        <span class="assignment-type-badge" :class="getAssignmentTypeClass(assignment.type)">
          <Icon :icon="getAssignmentIcon(assignment.type)" />
          {{ getAssignmentTypeLabel(assignment.type) }}
        </span>
        <span class="assignment-session-badge" :class="assignment.session">
          <Icon
            :icon="
              assignment.session === 'rattrapage'
                ? 'material-symbols:replay-outline'
                : 'material-symbols:schedule-outline'
            "
          />
          {{ assignment.session === 'rattrapage' ? 'Rattrapage' : 'Normal' }}
        </span>
        <span class="assignment-location-badge" :class="assignment.submissionLocation">
          <Icon
            :icon="
              assignment.submissionLocation === 'online'
                ? 'material-symbols:cloud-download-rounded'
                : 'material-symbols:location-on-outline'
            "
          />
          {{ assignment.submissionLocation === 'online' ? 'En ligne' : 'Présentiel' }}
        </span>
        <span
          class="assignment-status-badge"
          :class="{
            submitted: assignment.submitted,
            missed: isMissed,
            pending: !assignment.submitted && !isMissed,
          }"
        >
          <Icon
            :icon="
              assignment.submitted 
                ? 'material-symbols:schedule-outline'
                : assignment.submitted
                  ? 'material-symbols:check-circle-outline'
                  : isMissed
                    ? 'material-symbols:event-busy'
                    : 'material-symbols:pending-actions'
            "
          />
          {{ assignment.submitted ? 'Rendu en retard' : assignment.submitted ? 'Rendu' : isMissed ? 'Manquée' : 'À rendre' }}
        </span>
      </div>

      <div class="assignment-dates">
        <div class="due-date" :class="{ missed: isMissed }">
          <Icon icon="material-symbols:schedule-outline" />
          <span>Échéance: {{ formatDate(assignment.dueDate) }}</span>
        </div>
        <div class="created-date">
          <Icon icon="material-symbols:calendar-add-on-outline" />
          <span>Créé le {{ formatDate(assignment.createdAt) }}</span>
        </div>
        <div v-if="assignment.fileUrl" class="file-attachment">
          <Icon icon="material-symbols:attachment" />
          <a :href="assignment.fileUrl" target="_blank" class="file-link"> Fichier joint </a>
        </div>
        <div v-else class="no-file">
          <Icon icon="material-symbols:attach-file-off" />
          <span>Aucun fichier joint</span>
        </div>
      </div>
    </div>

    <div class="assignment-footer">
      <div class="assignment-status" :class="getAssignmentStatusClass()">
        {{ getAssignmentStatusLabel() }}
      </div>
      <button class="view-button" @click="handleViewAssignment" :disabled="!assignment.isActive">
        <Icon icon="material-symbols:visibility-outline" />
        <span>Voir le devoir</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import type { AssignmentStudentInterface } from '@/interfaces/assignment.interface'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  assignment: AssignmentStudentInterface
}>()

// Computed: Vérifier si le devoir est manqué
const isMissed = computed(() => {
  return (
    !props.assignment.submitted &&
    props.assignment.isActive &&
    new Date(props.assignment.dueDate) < new Date()
  )
})

const getAssignmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    homework: 'material-symbols:assignment-outline',
    project: 'material-symbols:folder-open-outline',
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

const formatDate = (date: Date): string => {
  if (!date) return 'Non définie'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getAssignmentStatusClass = (): string => {
  if (!props.assignment.isActive) return 'cancelled'
  if (isMissed.value) return 'missed'
  if (props.assignment.submitted) {
    return 'completed'
  }
  return 'pending'
}

const getAssignmentStatusLabel = (): string => {
  if (!props.assignment.isActive) return 'Annulé'
  if (isMissed.value) return 'Échéance dépassée'
  if (props.assignment.submitted) {
    return 'Rendu'
  }
  return 'En attente de soumission'
}

const handleViewAssignment = () => {
  if (props.assignment.isActive) {
    router.push(
      `/student/courses/${route.params.semester}/${route.params.promotionId}/${route.params.moduleId}/assignments/${props.assignment._id}`,
    )
  }
}
</script>

<style scoped>
.assignment-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color-light);
}

.assignment-card.assignment-cancelled {
  opacity: 0.75;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-color: var(--border-light);
  position: relative;
}

.assignment-card.assignment-cancelled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(235, 77, 75, 0.05) 10px,
    rgba(235, 77, 75, 0.05) 20px
  );
  border-radius: var(--radius-xl);
  pointer-events: none;
}

.assignment-card.assignment-cancelled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
  border-color: var(--error-light);
}

.assignment-card.assignment-cancelled .assignment-title {
  color: var(--text-secondary);
}

.assignment-card.assignment-missed {
  border-left: 3px solid #ff6b6b;
}

/* Header */
.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.assignment-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.assignment-icon.homework {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.assignment-icon.project {
  background: linear-gradient(135deg, #45b7d1 0%, #3498db 100%);
}

.assignment-icon.exam {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.assignment-icon svg {
  width: 20px;
  height: 20px;
}

/* Content */
.assignment-content {
  margin-bottom: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.assignment-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.assignment-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  flex-wrap: wrap;
}

.assignment-type-badge,
.assignment-session-badge,
.assignment-location-badge,
.assignment-status-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1875rem 0.5rem;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.assignment-type-badge svg,
.assignment-session-badge svg,
.assignment-location-badge svg,
.assignment-status-badge svg {
  width: 13px;
  height: 13px;
}

.assignment-type-badge.homework {
  background: rgba(78, 205, 196, 0.1);
  color: #4ecdc4;
}

.assignment-type-badge.project {
  background: rgba(69, 183, 209, 0.1);
  color: #45b7d1;
}

.assignment-type-badge.exam {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.assignment-session-badge.normal {
  background: var(--primary-extra-light);
  color: var(--primary-color);
}

.assignment-session-badge.rattrapage {
  background: rgba(255, 165, 2, 0.1);
  color: var(--warning);
}

.assignment-location-badge.online {
  background: rgba(34, 139, 34, 0.1);
  color: #228b22;
}

.assignment-location-badge.in-person {
  background: rgba(138, 43, 226, 0.1);
  color: #8a2be2;
}

.assignment-status-badge.submitted {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.assignment-status-badge.late {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning);
}

.assignment-status-badge.pending {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning);
}

.assignment-status-badge.missed {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

/* Dates */
.assignment-dates {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0;
  margin-top: auto;
}

.due-date,
.created-date,
.no-file,
.file-attachment {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.due-date svg,
.created-date svg,
.no-file svg,
.file-attachment svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.due-date {
  color: var(--text-dark);
  font-weight: 500;
}

.due-date.missed {
  color: #e74c3c;
  font-weight: 600;
}

.file-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.file-link:hover {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* Footer */
.assignment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  margin: 0.75rem -1rem -1rem -1rem;
}

.assignment-status {
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.assignment-status.pending {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning);
}

.assignment-status.completed {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.assignment-status.late {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning);
}

.assignment-status.missed {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.assignment-status.cancelled {
  background: rgba(149, 165, 166, 0.1);
  color: #7f8c8d;
}

.view-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.view-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.view-button:disabled {
  background: var(--gray-light);
  color: var(--gray);
  cursor: not-allowed;
}

.view-button svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .assignment-card {
    padding: 1rem;
    min-height: 260px;
  }

  .assignment-title {
    font-size: 1rem;
  }

  .assignment-meta {
    gap: 0.375rem;
  }

  .assignment-footer {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    margin: 0.75rem -1rem -1rem -1rem;
  }

  .assignment-status {
    text-align: center;
  }

  .view-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .assignment-card {
    padding: 0.875rem;
  }

  .assignment-icon {
    width: 36px;
    height: 36px;
  }

  .assignment-icon svg {
    width: 18px;
    height: 18px;
  }

  .assignment-title {
    font-size: 0.9375rem;
  }

  .assignment-type-badge,
  .assignment-session-badge,
  .assignment-location-badge,
  .assignment-status-badge {
    font-size: 0.625rem;
    padding: 0.1875rem 0.4375rem;
  }

  .assignment-type-badge svg,
  .assignment-session-badge svg,
  .assignment-location-badge svg,
  .assignment-status-badge svg {
    width: 11px;
    height: 11px;
  }
}
</style>
