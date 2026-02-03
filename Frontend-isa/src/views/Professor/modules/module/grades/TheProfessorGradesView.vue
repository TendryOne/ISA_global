<template>
  <div class="grades-container">
    <!-- En-tête premium -->
    <div class="grades-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:grade" />
        </div>
        <div class="header-text">
          <h1>Notes du Module</h1>
          <p>Consultez toutes les notes des étudiants par session</p>
        </div>
      </div>
      <div class="header-actions">
        <ActionButton icon="material-symbols:download" @click="exportGrades" variant="outline"
          :disabled="submissionGrades.length === 0">
          Exporter
        </ActionButton>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grades-stats" v-if="!loading">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="hugeicons:students" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ submissionGrades.length }}</span>
          <span class="stat-label">Étudiants</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:assignment" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ normalAssignmentsCount }}</span>
          <span class="stat-label">Examens normaux</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:refresh" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ ratrapageAssignmentsCount }}</span>
          <span class="stat-label">Rattrapages</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:calculate" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ averageGrade.toFixed(1) }}</span>
          <span class="stat-label">Moyenne générale</span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="grades-filters" v-if="!loading">
      <div class="filter-group">
        <input v-model="searchQuery" type="text" placeholder="Rechercher un étudiant..." class="search-input" />
      </div>
    </div>

    <!-- Tableau des notes -->
    <div class="grades-table-container" v-if="!loading">
      <div class="table-wrapper">
        <div class="table-content">
          <div class="table-header">
            <div class="table-row table-header-row">
              <div class="table-cell header-cell matricule-col">Matricule</div>
              <div class="table-cell header-cell student-col">Étudiant</div>
              <div class="table-cell header-cell examen-col">Examen</div>
              <div class="table-cell header-cell rattrapage-col">Rattrapage</div>
              <div class="table-cell header-cell final-col">Note retenue</div>
            </div>
          </div>

          <div class="table-body">
            <transition-group name="grade-fade">
              <div v-for="gradeData in filteredGrades" :key="gradeData.student._id" class="table-row grade-row">

                <!-- Matricule -->
                <div class="table-cell matricule-col">
                  <div class="matricule-badge">
                    {{ gradeData.student.matricule }}
                  </div>
                </div>

                <!-- Étudiant -->
                <div class="table-cell student-col">
                  <div class="student-info">
                    <div class="student-avatar">
                      <Icon icon="material-symbols:person" />
                    </div>
                    <div class="student-details">
                      <div class="student-name">{{ gradeData.student.name }} {{ gradeData.student.firstName }}</div>
                      <div class="student-email">{{ gradeData.student.email }}</div>
                    </div>
                  </div>
                </div>

                <!-- Examen (session normale) -->
                <div class="table-cell examen-col">
                  <div class="grade-display" v-if="getNormalGrade(gradeData) !== null">
                    <span class="grade-value" :class="{ 'failed': isFailedGrade(getNormalGrade(gradeData)) }">
                      {{ getNormalGrade(gradeData) }}/20
                    </span>
                  </div>
                  <div class="no-grade" v-else>
                    <span>-</span>
                  </div>
                </div>

                <!-- Rattrapage -->
                <div class="table-cell rattrapage-col">
                  <div class="grade-display" v-if="getRatrapageGrade(gradeData) !== null">
                    <span class="grade-value" :class="{ 'failed': isFailedGrade(getRatrapageGrade(gradeData)) }">
                      {{ getRatrapageGrade(gradeData) }}/20
                    </span>
                  </div>
                  <div class="no-grade" v-else>
                    <span>-</span>
                  </div>
                </div>

                <!-- Note retenue (la plus élevée) -->
                <div class="table-cell final-col">
                  <div class="grade-display" v-if="getFinalGrade(gradeData) !== null">
                    <span class="grade-value final-grade"
                      :class="{ 'failed': isFailedGrade(getFinalGrade(gradeData)) }">
                      {{ getFinalGrade(gradeData) }}/20
                    </span>
                  </div>
                  <div class="no-grade" v-else>
                    <span>-</span>
                  </div>
                </div>

              </div>
            </transition-group>
          </div>
        </div>
      </div>
    </div>

    <!-- États vides et chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon icon="material-symbols:progress-activity" class="spinner" />
      </div>
      <p>Chargement des notes...</p>
    </div>

    <div v-if="!loading && filteredGrades.length === 0 && submissionGrades.length > 0" class="empty-filter-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:filter-list-off" />
      </div>
      <h3>Aucune note trouvée</h3>
      <p>Aucune note ne correspond aux critères de recherche</p>
      <button @click="searchQuery = ''" class="reset-filter-btn">
        Réinitialiser la recherche
      </button>
    </div>

    <div v-if="!loading && submissionGrades.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:grade-outline" />
      </div>
      <h3>Aucune note</h3>
      <p>Aucune note n'a été trouvée pour ce module</p>
    </div>

    <!-- Toast -->
    <SuccessToast v-if="toast.show" :title="toast.title" @dismissed="toast.show = false" :message="toast.message"
      :type="toast.type" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import axios, { AxiosError } from 'axios';
import * as XLSX from 'xlsx';

import SuccessToast from '@/components/toast/successToast.vue';
import ActionButton from '@/components/ui/ActionButton.vue';

import type { AssignmentInterface } from '@/interfaces/assignment.interface';
import type { SubmissionGradesInterface } from '@/interfaces/submission.interface';
import type { ToastInterface } from '@/interfaces/toast.interface';
import { PostEventLog } from '@/utils/EventLog';
import { useMyUserStore } from '@/stores/userStore';

// États réactifs
const submissionGrades = ref<SubmissionGradesInterface[]>([]);
const assignments = ref<AssignmentInterface[]>([]);
const loading = ref(true);
const searchQuery = ref('');

const route = useRoute();
const toast = ref<ToastInterface>({
  show: false,
  message: '',
  title: '',
  type: 'success'
});

// Propriétés calculées pour les statistiques
const normalAssignmentsCount = computed(() => {
  return assignments.value.filter(assignment => assignment.session === 'normal').length;
});

const ratrapageAssignmentsCount = computed(() => {
  return assignments.value.filter(assignment => assignment.session === 'rattrapage').length;
});

const averageGrade = computed(() => {
  const allGrades: number[] = [];

  submissionGrades.value.forEach(gradeData => {
    gradeData.submissions.forEach(submission => {
      if (submission.grade !== null && submission.grade !== undefined) {
        allGrades.push(submission.grade);
      }
    });
  });

  if (allGrades.length === 0) return 0;
  return allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length;
});

// Filtrage des notes
const filteredGrades = computed(() => {
  if (!searchQuery.value) return submissionGrades.value;

  const query = searchQuery.value.toLowerCase();
  return submissionGrades.value.filter(gradeData => {
    const student = gradeData.student;
    return (
      student.name.toLowerCase().includes(query) ||
      student.firstName.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.matricule.toLowerCase().includes(query)
    );
  });
});

// Fonctions utilitaires
const getNormalGrade = (gradeData: SubmissionGradesInterface): number | null => {
  const normalAssignment = assignments.value.find(assignment => assignment.session === 'normal');
  if (!normalAssignment) return null;

  const submission = gradeData.submissions.find(sub =>
    sub.assignment === normalAssignment._id
  );

  return submission?.grade ?? null;
};

const getRatrapageGrade = (gradeData: SubmissionGradesInterface): number | null => {
  const ratrapageAssignment = assignments.value.find(assignment => assignment.session === 'rattrapage');
  if (!ratrapageAssignment) return null;

  const submission = gradeData.submissions.find(sub =>
    sub.assignment === ratrapageAssignment._id
  );

  return submission?.grade ?? null;
};

const isFailedGrade = (grade: number | null): boolean => {
  return grade !== null && grade < 10;
};

// Fonction pour obtenir la note finale (la plus élevée)
const getFinalGrade = (gradeData: SubmissionGradesInterface): number | null => {
  const normalGrade = getNormalGrade(gradeData);
  const ratrapageGrade = getRatrapageGrade(gradeData);

  if (normalGrade === null && ratrapageGrade === null) return null;
  if (normalGrade === null) return ratrapageGrade;
  if (ratrapageGrade === null) return normalGrade;

  return Math.max(normalGrade, ratrapageGrade);
};

// Actions
const exportGrades = async () => {
  try {
    const workbook = generateExcel();
    const filename = `notes_examen_${new Date().getFullYear()}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.value = {
      show: true,
      message: 'Export Excel réussi',
      title: 'Succès',
      type: 'success'
    };

    await PostEventLog({
      entityId: route.params.moduleId as string,
      entityType: "module",
      eventType: "PROFESSOR_GRADES_DOWNLOADED",
      timestamp: new Date(),
      userId: useMyUserStore().currentUser!._id,
      payload: {
        info: {
          filename: filename,
          exportDate: new Date()
        }
      }
    })

  } catch (exportError) {
    console.error('Erreur lors de l\'export Excel:', exportError);
    toast.value = {
      show: true,
      message: 'Erreur lors de l\'export Excel',
      title: 'Erreur',
      type: 'error'
    };
  }
};

const generateExcel = (): XLSX.WorkBook => {
  // Créer un nouveau classeur
  const workbook = XLSX.utils.book_new();

  // Préparer les données avec typage strict
  const data: (string | number)[][] = [];

  // En-têtes
  data.push(['Matricule', 'Nom', 'Prénom', 'Email', 'Examen', 'Rattrapage', 'Note Retenue']);

  // Données des étudiants
  submissionGrades.value.forEach(gradeData => {
    const normalGrade = getNormalGrade(gradeData);
    const ratrapageGrade = getRatrapageGrade(gradeData);
    const finalGrade = getFinalGrade(gradeData);

    data.push([
      gradeData.student.matricule,
      gradeData.student.name,
      gradeData.student.firstName,
      gradeData.student.email,
      normalGrade !== null ? normalGrade : '-',
      ratrapageGrade !== null ? ratrapageGrade : '-',
      finalGrade !== null ? finalGrade : '-'
    ]);
  });

  // Créer la feuille de calcul
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Définir les largeurs des colonnes
  const columnWidths = [
    { wch: 12 }, // Matricule
    { wch: 15 }, // Nom
    { wch: 15 }, // Prénom
    { wch: 25 }, // Email
    { wch: 10 }, // Examen
    { wch: 12 }, // Rattrapage
    { wch: 15 }  // Note Retenue
  ];
  worksheet['!cols'] = columnWidths;

  // Ajouter la feuille au classeur
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes');

  return workbook;
};

// API
const getGrades = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/v1/submissions/grades/${route.params.moduleId}`);
    submissionGrades.value = response.data.submissions;
    assignments.value = response.data.assignments;

  } catch (error) {
    toast.value = {
      show: true,
      message: error instanceof AxiosError && error.response ? error.response.data : 'Une erreur est survenue',
      title: 'Erreur',
      type: 'error'
    };
  } finally {
    loading.value = false;
  }
};

// Lifecycle
watchEffect(() => {
  getGrades();
});
</script>

<style scoped>
.grades-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* En-tête premium */
.grades-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: var(--radius-xl);
  margin-bottom: 2rem;
  color: white;
  box-shadow: var(--shadow-lg);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  font-size: 2rem;
}

.header-text h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.header-text p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Statistiques */
.grades-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: var(--primary-extra-light);
  border-radius: var(--radius-lg);
  color: var(--primary-color);
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

/* Filtres */
.grades-filters {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin-bottom: 2rem;
}

.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

/* Tableau des notes */
.grades-table-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

/* Wrapper avec overflow horizontal pour mobile */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  /* Smooth scrolling sur iOS */
}

.table-content {
  min-width: 820px;
  /* Largeur minimum pour éviter l'écrasement */
}

/* Scrollbar personnalisée pour le tableau */
.table-wrapper::-webkit-scrollbar {
  height: 6px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: var(--background-light);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}

.table-header {
  background: var(--gray-extra-light);
  border-bottom: 1px solid var(--border-light);
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr 120px 120px 160px;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.table-header-row {
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grade-row {
  border-bottom: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.grade-row:hover {
  background: var(--gray-extra-light);
}

.grade-row:last-child {
  border-bottom: none;
}

/* Cellules du tableau */
.table-cell {
  display: flex;
  align-items: center;
}

.matricule-col {
  justify-content: flex-start;
}

.student-col {
  justify-content: flex-start;
}

.examen-col,
.rattrapage-col,
.final-col {
  justify-content: center;
}

/* Badges matricule */
.matricule-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

/* Info étudiant */
.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.student-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--gray-light);
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 1.2rem;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.student-email {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* Affichage des notes */
.grade-display {
  display: flex;
  justify-content: center;
}

.grade-value {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
  font-weight: 500;
}

.grade-value.failed {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

/* Style pour la note finale (un peu plus mise en évidence) */
.grade-value.final-grade {
  padding: 0.375rem 0.75rem;
  font-weight: 600;
  font-size: 0.85rem;
}

.no-grade {
  display: flex;
  justify-content: center;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 0.9rem;
}

/* États vides et chargement */
.loading-state,
.empty-state,
.empty-filter-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.loading-spinner {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.spinner {
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

.empty-icon {
  font-size: 4rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3,
.empty-filter-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-dark);
  font-size: 1.5rem;
}

.empty-state p,
.empty-filter-state p {
  margin: 0 0 1.5rem 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.reset-filter-btn {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Animations */
.grade-fade-enter-active,
.grade-fade-leave-active {
  transition: all 0.3s ease;
}

.grade-fade-enter-from,
.grade-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .grades-container {
    padding: 1rem;
  }

  .grades-header {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .table-row {
    grid-template-columns: 100px 1fr 100px 100px 140px;
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.85rem;
  }

  .student-name {
    font-size: 0.85rem;
  }

  .student-email {
    font-size: 0.75rem;
  }

  .matricule-badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }

  .grade-value {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
}

@media (max-width: 640px) {
  .table-row {
    grid-template-columns: 80px 1fr 80px 80px 120px;
    gap: 0.25rem;
    padding: 0.75rem;
  }

  .grades-stats {
    grid-template-columns: 1fr;
  }

  /* Indication de scroll horizontal sur mobile */
  .table-content::after {
    content: "← Glissez pour voir plus →";
    display: block;
    text-align: center;
    padding: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--gray-extra-light);
    border-top: 1px solid var(--border-light);
    width: 100%;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .header-text p {
    font-size: 1rem;
  }
}
</style>
