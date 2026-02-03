<template>
  <BreadCrumbsBack />
  <div class="grades-container">
    <!-- Header Section -->
    <div class="grades-header">
      <div class="header-content">
        <Icon icon="material-symbols:grade-outline" class="header-icon" />
        <div class="header-text">
          <h1 class="header-title">Mes Notes</h1>
          <p class="header-subtitle">Consultez vos résultats d'examens pour le module</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <SpinningLoader v-if="loading" />

    <!-- Error State -->
    <ErrorComponent v-else-if="errorServer && !loading" :message="errorServer" />

    <!-- Empty State -->
    <div v-else-if="!loading && grades.length === 0" class="empty-state">
      <Icon icon="material-symbols:quiz-outline" class="empty-icon" />
      <h3>Aucune note disponible</h3>
      <p>Vos notes d'examens apparaîtront ici une fois qu'elles seront publiées.</p>
    </div>

    <!-- Grades List -->
    <div v-else class="grades-content">
      <div class="grades-grid">
        <div v-for="grade in grades" :key="grade._id" class="grade-card">

          <!-- Header -->
          <div class="card-header">
            <div class="header-left">
              <h3 class="assignment-title">{{ grade.assignmentInfo?.title || 'Sans titre' }}</h3>
              <span class="assignment-type-badge" :class="'type-' + grade.assignmentInfo?.type">
                {{ getTypeLabel(grade.assignmentInfo?.type) }}
              </span>
            </div>
            <div class="session-badge" :class="'session-' + (grade.assignmentInfo?.session || 'normal')">
              <Icon
                :icon="grade.assignmentInfo?.session === 'rattrapage' ? 'material-symbols:refresh' : 'material-symbols:star'" />
              {{ getSessionLabel(grade.assignmentInfo?.session) }}
            </div>
          </div>

          <!-- Note -->
          <div class="grade-body">
            <div v-if="grade.grade !== null" class="grade-display">
              <div class="grade-value" :class="getGradeClass(grade.grade)">
                <span class="grade-number">{{ grade.grade.toFixed(2) }}</span>
                <span class="grade-suffix">/20</span>
              </div>
              <div class="grade-info">
                <div class="appreciation" :class="getGradeClass(grade.grade)">
                  {{ getAppreciation(grade.grade) }}
                </div>
                <div class="validation-badge" :class="getStatusClass(grade.grade)">
                  <Icon :icon="getStatusIcon(grade.grade)" />
                  {{ getStatusText(grade.grade) }}
                </div>
              </div>
            </div>
            <div v-else class="grade-pending">
              <Icon icon="material-symbols:schedule" class="pending-icon" />
              <span>En attente de correction</span>
            </div>
          </div>

          <!-- Feedback -->
          <div v-if="grade.feedback" class="feedback-section">
            <div class="feedback-header">
              <Icon icon="material-symbols:comment" />
              Observations
            </div>
            <p class="feedback-text">{{ grade.feedback }}</p>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import type { SubmissionStudentInterface } from '@/interfaces/submission.interface';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';

const route = useRoute();
const loading = ref<boolean>(false);
const errorServer = ref<string>('');
const grades = ref<SubmissionStudentInterface[]>([]);

// Classe CSS pour la note
const getGradeClass = (grade: number | null) => {
  if (grade === null) return '';
  if (grade >= 16) return 'grade-excellent';
  if (grade >= 14) return 'grade-very-good';
  if (grade >= 12) return 'grade-good';
  if (grade >= 10) return 'grade-pass';
  return 'grade-fail';
};

// Classe CSS pour le statut
const getStatusClass = (grade: number) => {
  if (grade >= 10) return 'status-success';
  return 'status-fail';
};

// Icône du statut
const getStatusIcon = (grade: number) => {
  if (grade >= 10) return 'material-symbols:check-circle-outline';
  return 'material-symbols:cancel-outline';
};

// Texte du statut
const getStatusText = (grade: number) => {
  if (grade >= 10) return 'Validé';
  return 'Non validé';
};

// Appréciation académique
const getAppreciation = (grade: number) => {
  if (grade >= 18) return 'Excellent';
  if (grade >= 16) return 'Très bien';
  if (grade >= 14) return 'Bien';
  if (grade >= 12) return 'Assez bien';
  if (grade >= 10) return 'Passable';
  return 'Insuffisant';
};

// Label du type d'examen
const getTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    exam: 'Examen',
    homework: 'Devoir',
    project: 'Projet'
  };
  return labels[type || ''] || 'Examen';
};

// Classe du badge de type
const getTypeBadgeClass = (type?: string) => {
  return `type-${type || 'exam'}`;
};

// Label de la session
const getSessionLabel = (session?: string) => {
  const labels: Record<string, string> = {
    normal: 'Session normale',
    rattrapage: 'Rattrapage'
  };
  return labels[session || ''] || 'Session normale';
};

// Classe du badge de session
const getSessionBadgeClass = (session?: string) => {
  return `session-${session || 'normal'}`;
};

// Formater la date
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchGrades = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/v1/submissions/student/grades/${route.params.moduleId}/promotion/${route.params.promotionId}`);
    grades.value = response.data;
  } catch (error: any) {
    errorServer.value = error.response?.data || 'Erreur lors du chargement des notes';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchGrades();
});
</script>

<style scoped>
.grades-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.grades-header {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
  box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.95;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 5rem;
  color: var(--text-secondary);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
}

.empty-state p {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Grades Content */
.grades-content {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Grades Grid */
.grades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
}

/* Grade Card */
.grade-card {
  background: white;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.grade-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: var(--primary-color);
}

/* Header de la card */
.card-header {
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.assignment-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}

.assignment-type-badge {
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.assignment-type-badge.type-exam {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.assignment-type-badge.type-homework {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
}

.assignment-type-badge.type-project {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success-dark);
}

/* Badge de session */
.session-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.session-badge.session-normal {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.session-badge.session-rattrapage {
  background: rgba(var(--warning-rgb), 0.15);
  color: var(--warning-dark);
}

.session-badge svg {
  font-size: 1.1rem;
}



/* Body de la card (note) */
.grade-body {
  padding: 3rem 2rem;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.grade-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.grade-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.grade-number {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
}

.grade-value.grade-excellent .grade-number,
.grade-value.grade-very-good .grade-number {
  color: var(--success-dark);
}

.grade-value.grade-good .grade-number {
  color: var(--primary-color);
}

.grade-value.grade-pass .grade-number {
  color: var(--warning-dark);
}

.grade-value.grade-fail .grade-number {
  color: var(--error);
}

.grade-suffix {
  font-size: 1.75rem;
  font-weight: 700;
  color: #64748b;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.appreciation {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.75px;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
}

.appreciation.grade-excellent,
.appreciation.grade-very-good {
  color: var(--success-dark);
  background: rgba(var(--success-rgb), 0.15);
}

.appreciation.grade-good {
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.15);
}

.appreciation.grade-pass {
  color: var(--warning-dark);
  background: rgba(var(--warning-rgb), 0.15);
}

.appreciation.grade-fail {
  color: var(--error);
  background: rgba(var(--error-rgb), 0.15);
}

.validation-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.85rem;
}

.validation-badge.status-success {
  background: rgba(var(--success-rgb), 0.15);
  color: var(--success-dark);
}

.validation-badge.status-fail {
  background: rgba(var(--error-rgb), 0.15);
  color: var(--error);
}

.validation-badge svg {
  font-size: 1.1rem;
}

.grade-pending {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 600;
}

.pending-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Section feedback */
.feedback-section {
  padding: 1.5rem 2rem;
  background: #fffbeb;
  border-top: 2px solid #fde047;
}

.feedback-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feedback-header svg {
  font-size: 1rem;
}

.feedback-text {
  margin: 0;
  color: #451a03;
  font-size: 0.9rem;
  line-height: 1.6;
}



/* Responsive */
@media (max-width: 1024px) {
  .grades-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .grades-container {
    padding: 1rem;
  }

  .grades-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .assignment-title {
    font-size: 1.1rem;
  }

  .assignment-type-badge {
    padding: 0.4rem 0.85rem;
    font-size: 0.75rem;
  }

  .grades-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
  }

  .header-left {
    width: 100%;
  }

  .session-badge {
    width: 100%;
    justify-content: center;
  }

  .grade-body {
    padding: 2rem 1.5rem;
  }

  .grade-number {
    font-size: 3rem;
  }

  .grade-suffix {
    font-size: 1.5rem;
  }

  .grade-info {
    flex-direction: column;
    width: 100%;
  }

  .appreciation,
  .validation-badge {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .grade-title {
    font-size: 1.1rem;
  }

  .score-value {
    font-size: 2rem;
  }

  .score-unit {
    font-size: 1rem;
  }
}
</style>
