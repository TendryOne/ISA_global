<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-content">
          <Icon icon="material-symbols:visibility" />
          <h3>Détails de la soumission</h3>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
      <div class="modal-content">
        <div class="detail-section" v-if="submission">
          <h4>Informations de l'étudiant</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Matricule:</label>
              <span>{{ submission.matricule }}</span>
            </div>
            <div class="detail-item">
              <label>Nom complet:</label>
              <span>{{ submission.name }} {{ submission.firstName }}</span>
            </div>
            <div class="detail-item">
              <label>Email:</label>
              <span>{{ submission.email }}</span>
            </div>
          </div>

          <h4>Détails de la soumission</h4>
          <div class="detail-grid" v-if="submissionData">
            <div class="detail-item">
              <label>Statut:</label>
              <span class="status-badge" :class="statusClass">
                {{ statusLabel }}
              </span>
            </div>
            <div class="detail-item" v-if="submissionData.submittedAt">
              <label>Date de soumission:</label>
              <span>{{ formatFullDate(submissionData.submittedAt) }}</span>
            </div>
            <div class="detail-item" v-if="submissionData.grade !== null">
              <label>Note:</label>
              <span class="grade-display" :class="{ 'failed': isFailedGrade }">{{ submissionData.grade }}/20</span>
            </div>
            <div class="detail-item" v-if="submissionData.feedback">
              <label>Commentaire:</label>
              <div class="feedback-content">{{ submissionData.feedback }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import type { SubmissionProfessorInterface } from '@/interfaces/submission.interface';
import type SubmissionInterface from '@/interfaces/submission.interface';

interface Props {
  show: boolean;
  submission: SubmissionProfessorInterface | null;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
}>();

// Computed properties
const submissionData = computed(() => {
  if (!props.submission) return null;

  if (props.submission.submission && props.submission.submission.grade !== null) {
    return props.submission.submission as SubmissionInterface;
  }

  return {
    fileUrl: null,
    submittedAt: null,
    grade: null,
    status: 'not_submitted' as const,
    feedback: null
  };
});

const statusClass = computed(() => {
  return submissionData.value?.status || 'not_submitted';
});

const statusLabel = computed(() => {
  const status = submissionData.value?.status || 'not_submitted';

  switch (status) {
    case 'submitted':
      return 'Soumis';
    case 'graded':
      return 'Noté';
    case 'late':
      return 'En retard';
    case 'missing':
      return 'Manquant';
    case 'not_submitted':
    default:
      return 'Non rendu';
  }
});

const isFailedGrade = computed(() => {
  return submissionData.value?.grade !== null &&
    submissionData.value?.grade !== undefined &&
    submissionData.value.grade < 10;
});

// Utility functions
const formatFullDate = (date: Date | string | null | undefined) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
/* Modal */
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

/* Modal de détails */
.detail-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-light);
}

.detail-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  background: var(--background-light);
  border-radius: var(--radius);
}

.detail-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.detail-item span {
  font-weight: 500;
  color: var(--text-dark);
  text-align: right;
}

.feedback-content {
  background: var(--white);
  padding: 0.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  max-width: 300px;
  word-wrap: break-word;
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

.grade-display {
  font-weight: 600;
  color: var(--text-dark);
}

.grade-display.failed {
  color: var(--error);
  background: rgba(235, 77, 75, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
}

/* Animations */
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

/* Responsive Design */
@media (max-width: 768px) {
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
  .modal-container {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }
}
</style>
