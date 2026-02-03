<template>
  <div class="assignments-container" v-if="!route.params.assignmentId">
    <BreadCrumbsBack />
    <!-- En-tête premium -->
    <div class="assignments-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:assignment-outline" />
        </div>
        <div class="header-text">
          <h1>Devoirs et Évaluations</h1>
          <p>Consultez vos devoirs, projets et examens</p>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="assignments-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:assignment-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ assignments.length }}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <Icon icon="material-symbols:pending-actions" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ pendingAssignments.length }}</span>
          <span class="stat-label">À rendre</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <Icon icon="material-symbols:check-circle" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ submittedAssignments.length }}</span>
          <span class="stat-label">Rendus</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon missed">
          <Icon icon="material-symbols:event-busy" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ missedAssignments.length }}</span>
          <span class="stat-label">Manquées</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:quiz-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ examCount }}</span>
          <span class="stat-label">Examens</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:folder-special-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ projectCount }}</span>
          <span class="stat-label">Projets</span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="assignments-filters">
      <div class="filter-group">
        <button v-for="filter in assignmentFilters" :key="filter.value" @click="activeFilter = filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]">
          <Icon :icon="filter.icon" />
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <SpinningLoader />
      </div>
      <p>Chargement des devoirs...</p>
    </div>

    <!-- Error -->
    <div v-if="errorMessage && !loading" class="error-state">
      <ErrorComponent :message="errorMessage" @retry="fetchAssignments" />
    </div>

    <!-- Liste des devoirs -->
    <div v-if="!loading && !errorMessage" class="assignments-grid">
      <transition-group name="assignment-fade">
        <TheStudentAssignmentCard v-for="assignment in filteredAssignments" :key="assignment._id"
          :assignment="assignment" @view="handleViewAssignment" />
      </transition-group>
    </div>

    <!-- États vides -->
    <div v-if="!loading && !errorMessage && filteredAssignments.length === 0 && assignments.length > 0"
      class="empty-filter-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:filter-list-off" />
      </div>
      <h3>Aucun devoir trouvé</h3>
      <p>Aucun devoir ne correspond au filtre sélectionné</p>
      <button @click="activeFilter = 'all'" class="reset-filter-btn">
        Afficher tous les devoirs
      </button>
    </div>

    <div v-if="!loading && !errorMessage && assignments.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:assignment-outline" />
      </div>
      <h3>Aucun devoir</h3>
      <p>Il n'y a aucun devoir pour ce module actuellement</p>
    </div>
  </div>

  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import TheStudentAssignmentCard from '@/components/student/TheStudentAssignmentCard.vue'
import type { AssignmentStudentInterface } from '@/interfaces/assignment.interface'
import axios from 'axios'
import { ref, computed, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'

const route = useRoute()
const router = useRouter()
const assignments = ref<AssignmentStudentInterface[]>([])
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')
const activeFilter = ref<string>('all')

// Filtres
const assignmentFilters = [
  { value: 'all', label: 'Tous', icon: 'material-symbols:select-all' },
  { value: 'pending', label: 'À rendre', icon: 'material-symbols:pending-actions' },
  { value: 'submitted', label: 'Rendus', icon: 'material-symbols:check-circle' },
  { value: 'missed', label: 'Manquées', icon: 'material-symbols:event-busy' },
  { value: 'homework', label: 'Devoirs', icon: 'material-symbols:assignment-outline' },
  { value: 'project', label: 'Projets', icon: 'material-symbols:folder-open-outline' },
  { value: 'exam', label: 'Examens', icon: 'material-symbols:quiz-outline' },
]

// Computed: Devoirs non rendus
const pendingAssignments = computed(() => {
  return assignments.value.filter((a) => !a.submitted && a.isActive)
})

// Computed: Devoirs rendus
const submittedAssignments = computed(() => {
  return assignments.value.filter((a) => a.submitted)
})

// Computed: Devoirs manqués (échéance dépassée et non rendus)
const missedAssignments = computed(() => {
  const now = new Date()
  return assignments.value.filter((a) => !a.submitted && a.isActive && new Date(a.dueDate) < now)
})

// Computed: Compteurs par type
const examCount = computed(() => {
  return assignments.value.filter((a) => a.type === 'exam').length
})

const projectCount = computed(() => {
  return assignments.value.filter((a) => a.type === 'project').length
})

// Computed: Devoirs filtrés
const filteredAssignments = computed(() => {
  let filtered = assignments.value

  if (activeFilter.value === 'pending') {
    filtered = pendingAssignments.value
  } else if (activeFilter.value === 'submitted') {
    filtered = submittedAssignments.value
  } else if (activeFilter.value === 'missed') {
    filtered = missedAssignments.value
  } else if (activeFilter.value === 'homework') {
    filtered = assignments.value.filter((a) => a.type === 'homework')
  } else if (activeFilter.value === 'project') {
    filtered = assignments.value.filter((a) => a.type === 'project')
  } else if (activeFilter.value === 'exam') {
    filtered = assignments.value.filter((a) => a.type === 'exam')
  }

  // Tri: non rendus d'abord, puis par date d'échéance
  return filtered.sort((a, b) => {
    if (a.submitted !== b.submitted) {
      return a.submitted ? 1 : -1
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
})

const fetchAssignments = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(
      `/api/v1/assignments/module/${route.params.moduleId}/student/promotion/${route.params.promotionId}`,
    )
    assignments.value = response.data
  } catch (error: any) {
    errorMessage.value =
      error.response?.data || 'Une erreur est survenue lors de la récupération des devoirs.'
  } finally {
    loading.value = false
  }
}

const handleViewAssignment = (assignment: AssignmentStudentInterface) => {
  router.push({
    name: 'student-assignment-detail',
    params: {
      ...route.params,
      assignmentId: assignment._id,
    },
  })
}

watchEffect(() => {
  if (
    route.params.moduleId &&
    route.params.promotionId &&
    route.path.includes('assignments') &&
    !route.params.assignmentId
  ) {
    fetchAssignments()
  }
})
</script>

<style scoped>
.assignments-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
  font-family: 'Roboto', sans-serif;
}

/* En-tête */
.assignments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
}

.header-icon svg {
  width: 32px;
  height: 32px;
}

.header-text {
  color: var(--white);
  min-width: 0;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.header-text p {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.95;
}

/* Statistiques */
.assignments-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color-light);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.pending {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.stat-icon.completed {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.stat-icon.missed {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
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
.assignments-filters {
  margin-bottom: 1.5rem;
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

/* Grille des devoirs */
.assignments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.25rem;
}

/* Animations */
.assignment-fade-enter-active,
.assignment-fade-leave-active {
  transition: all 0.3s ease;
}

.assignment-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.assignment-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  gap: 1rem;
}

.loading-state p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Error */
.error-state {
  margin-top: 1rem;
}

/* Empty states */
.empty-filter-state,
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--primary-extra-light);
  border-radius: 50%;
}

.empty-icon svg {
  width: 40px;
  height: 40px;
  color: var(--primary-color);
  opacity: 0.5;
}

.empty-filter-state h3,
.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
}

.empty-filter-state p,
.empty-state p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 1.5rem 0;
}

.reset-filter-btn {
  padding: 0.625rem 1.25rem;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive */
@media (max-width: 1024px) {
  .assignments-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 768px) {
  .assignments-container {
    padding: 0 1rem 1.5rem;
  }

  .assignments-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .header-text p {
    font-size: 0.85rem;
  }

  .assignments-stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }

  .assignments-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .assignments-container {
    padding: 0 0.75rem 1.25rem;
  }

  .assignments-header {
    padding: 1rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .header-icon svg {
    width: 28px;
    height: 28px;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .assignments-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.875rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .filter-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }
}
</style>
