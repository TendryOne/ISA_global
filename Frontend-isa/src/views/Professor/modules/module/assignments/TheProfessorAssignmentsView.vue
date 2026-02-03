<template>
  <div class="assignments-container" v-if="!route.params.assignmentId">
    <!-- En-tête premium -->
    <div class="assignments-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:assignment-outline" />
        </div>
        <div class="header-text">
          <h1>Devoirs et Évaluations</h1>
          <p>Gérez les devoirs, projets et examens de votre module</p>
        </div>
      </div>
      <ActionButton icon="material-symbols:add-circle-outline" @click="openCreateModal" class="create-button">
        Créer un devoir
      </ActionButton>
    </div>

    <!-- Statistiques -->
    <div class="assignments-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:assignment-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ assignments.length }}</span>
          <span class="stat-label">Devoirs</span>
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
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:replay-circle-filled-sharp" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ rattrapageCount }}</span>
          <span class="stat-label">Rattrapages</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:cancel-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ cancelledCount }}</span>
          <span class="stat-label">Annulés</span>
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

    <!-- Liste des devoirs -->
    <div class="assignments-grid">
      <transition-group name="assignment-fade">
        <div v-for="assignment in filteredAssignments" :key="assignment._id" class="assignment-card"
          :class="{ 'assignment-cancelled': !assignment.isActive }">
          <div class="assignment-header">
            <div class="assignment-icon" :class="getAssignmentTypeClass(assignment.type)">
              <Icon :icon="getAssignmentIcon(assignment.type)" />
            </div>
            <div class="assignment-actions">
              <button class="action-btn view-btn" @click="viewSubmissions(assignment)" title="Voir les rendus"
                v-if="assignment.isActive">
                <Icon icon="material-symbols:visibility-outline" />
              </button>
              <button class="action-btn edit-btn" @click="editAssignment(assignment)" title="Modifier"
                v-if="assignment.isActive">
                <Icon icon="material-symbols:edit-outline" />
              </button>
              <button class="action-btn toggle-btn" v-if="assignment.type === 'exam'"
                @click="toggleAssignmentStatus(assignment)"
                :title="assignment.isActive ? 'Annuler le devoir' : 'Réactiver le devoir'">
                <Icon
                  :icon="assignment.isActive ? 'material-symbols:cancel-outline' : 'material-symbols:check-circle-outline'" />
              </button>
              <button class="action-btn delete-btn" @click="deleteAssignment(assignment)" title="Supprimer">
                <Icon icon="material-symbols:delete-outline" />
              </button>
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
                  :icon="assignment.session === 'rattrapage' ? 'material-symbols:replay-outline' : 'material-symbols:schedule-outline'" />
                {{ assignment.session === 'rattrapage' ? 'Rattrapage' : 'Normal' }}
              </span>
              <span class="assignment-location-badge" :class="assignment.submissionLocation">
                <Icon
                  :icon="assignment.submissionLocation === 'online' ? 'material-symbols:cloud-download-rounded' : 'material-symbols:location-on-outline'" />
                {{ assignment.submissionLocation === 'online' ? 'En ligne' : 'Présentiel' }}
              </span>
              <span class="assignment-status-badge"
                :class="{ 'cancelled': !assignment.isActive, 'active': assignment.isActive }">
                <Icon
                  :icon="assignment.isActive ? 'material-symbols:check-circle-outline' : 'material-symbols:cancel-outline'" />
                {{ assignment.isActive ? 'Actif' : 'Annulé' }}
              </span>
            </div>

            <div class="assignment-dates">
              <div class="due-date">
                <Icon icon="material-symbols:schedule-outline" />
                <span>Échéance: {{ formatDate(assignment.dueDate) }}</span>
              </div>
              <div class="created-date">
                <Icon icon="material-symbols:calendar-add-on-outline" />
                <span>Créé le {{ formatDate(assignment.createdAt) }}</span>
              </div>
              <div v-if="assignment.fileUrl" class="file-attachment">
                <Icon icon="material-symbols:attachment" />
                <a :href="assignment.fileUrl" target="_blank" class="file-link">
                  Fichier joint
                </a>
              </div>
              <div v-else class="no-file">
                <Icon icon="material-symbols:attach-file-off" />
                <span>Aucun fichier joint</span>

              </div>
            </div>
          </div>

          <div class="assignment-footer">
            <div class="submission-stats">
              <div class="stat-item">
                <Icon icon="material-symbols:people-outline" />
                <span>{{ assignment.numberOfSubmissions }} rendus</span>
              </div>
              <div class="stat-item">
                <Icon icon="material-symbols:pending-actions" />
                <span>{{ getPendingCount(assignment) }} en attente</span>
              </div>
            </div>
            <div class="assignment-status" :class="getAssignmentStatus(assignment)">
              {{ getAssignmentStatusLabel(assignment) }}
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- États vides et chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon icon="material-symbols:progress-activity" class="spinner" />
      </div>
      <p>Chargement des devoirs...</p>
    </div>

    <div v-if="!loading && filteredAssignments.length === 0 && assignments.length > 0" class="empty-filter-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:filter-list-off" />
      </div>
      <h3>Aucun devoir trouvé</h3>
      <p>Aucun devoir ne correspond au filtre sélectionné</p>
      <button @click="activeFilter = 'all'" class="reset-filter-btn">
        Afficher tous les devoirs
      </button>
    </div>

    <div v-if="!loading && assignments.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:assignment-outline" />
      </div>
      <h3>Aucun devoir</h3>
      <p>Commencez par créer votre premier devoir ou évaluation</p>
      <ActionButton icon="material-symbols:add-circle-outline" @click="openCreateModal" class="empty-action-button">
        Créer un devoir
      </ActionButton>
    </div>

    <div v-if="errorServer" class="error-state">
      <div class="error-icon">
        <Icon icon="material-symbols:error-outline" />
      </div>
      <h3>Erreur de chargement</h3>
      <p>{{ errorServer }}</p>
      <button class="retry-button" @click="fetchAssignments">
        <Icon icon="material-symbols:refresh" />
        Réessayer
      </button>
    </div>

    <!-- Modal de création/édition -->
    <div v-if="showModal">
      <TheAssignmentFormModal :assignment="currentAssignment" @close="closeModal" @submit="handleSubmit" />
    </div>

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />

    <ConfirmModal :show="!!assignmentToDelete" @cancel="assignmentToDelete = null"
      message="Êtes-vous sûr de vouloir supprimer ce devoir ? Cette action est irréversible."
      @confirm="handleDeleteAssignment" title="Confirmer la suppression" />
  </div>

  <RouterView />
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue';
import type { AssignmentInterface } from '@/interfaces/assignment.interface';
import { useMyUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import TheAssignmentFormModal from '@/components/professor/TheAssignmentFormModal.vue';
import SuccessToast from '@/components/toast/successToast.vue';
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue';
import { useSocket } from '@/composables/useSocket';
import { PostEventLog } from '@/utils/eventLog';
import { number } from 'zod';
import { link } from 'fs';

const toast = ref<{ show: boolean, message: string, title: string, type: 'success' | 'error' }>({
  show: false, message: '', title: '', type: 'success'
});

interface professorAssignmentInterface extends AssignmentInterface {
  numberOfSubmissions: number;
}


const loading = ref<boolean>(false);
const errorServer = ref<string | null>(null);
const assignments = ref<professorAssignmentInterface[]>([]);
const route = useRoute();
const router = useRouter();
const user = useMyUserStore().currentUser;
const showModal = ref<boolean>(false);
const currentAssignment = ref<AssignmentInterface | null>(null);
const activeFilter = ref<string>('all');
const assignmentToDelete = ref<AssignmentInterface | null>(null);

// Filtres de devoirs
const assignmentFilters = [
  { value: 'all', label: 'Tout', icon: 'material-symbols:select-all' },
  { value: 'homework', label: 'Devoirs', icon: 'material-symbols:assignment-outline' },
  { value: 'project', label: 'Projets', icon: 'material-symbols:folder-special-outline' },
  { value: 'exam', label: 'Examens', icon: 'material-symbols:quiz-outline' },
  { value: 'normal', label: 'Session normale', icon: 'material-symbols:schedule-outline' },
  { value: 'rattrapage', label: 'Rattrapage', icon: 'material-symbols:replay-circle-filled-sharp' },
  { value: 'active', label: 'Actifs', icon: 'material-symbols:check-circle-outline' },
  { value: 'cancelled', label: 'Annulés', icon: 'material-symbols:cancel-outline' }
];

// Statistiques calculées
const examCount = computed(() => {
  return assignments.value.filter(a => a.type === 'exam').length;
});

const projectCount = computed(() => {
  return assignments.value.filter(a => a.type === 'project').length;
});

const rattrapageCount = computed(() => {
  return assignments.value.filter(a => a.session === 'rattrapage').length;
});

const cancelledCount = computed(() => {
  return assignments.value.filter(a => !a.isActive).length;
});

const filteredAssignments = computed(() => {
  if (activeFilter.value === 'all') return assignments.value;

  return assignments.value.filter(assignment => {
    switch (activeFilter.value) {
      case 'homework':
      case 'project':
      case 'exam':
        return assignment.type === activeFilter.value;
      case 'normal':
      case 'rattrapage':
        return assignment.session === activeFilter.value;
      case 'active':
        return assignment.isActive;
      case 'cancelled':
        return !assignment.isActive;
      default:
        return true;
    }
  });
});

const numberOfStudents = ref<number>(0);

const fetchAssignments = async () => {
  loading.value = true;
  errorServer.value = null;
  try {
    const response = await axios.get(`/api/v1/assignments/module/${route.params.moduleId}/professor/${user?._id}/promotion/${null}`);
    assignments.value = response.data.assignments;
    numberOfStudents.value = response.data.numberOfStudents;
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des devoirs';
    errorServer.value = errorMsg;
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  currentAssignment.value = null;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  currentAssignment.value = null;
};

const editAssignment = (assignment: AssignmentInterface) => {
  currentAssignment.value = assignment;
  showModal.value = true;
};

const deleteAssignment = async (assignment: AssignmentInterface) => {
  assignmentToDelete.value = assignment;

};

const handleDeleteAssignment = async () => {
  try {
    if (assignmentToDelete.value) {
      const response = await axios.delete(`/api/v1/assignments/${assignmentToDelete.value._id}`);
      assignments.value = assignments.value.filter(a => a._id !== assignmentToDelete.value!._id);
      toast.value = { show: true, message: 'Devoir supprimé avec succès !', title: 'Succès', type: 'success' };
    }
    emit("assignmentNotificationByProfessor", { assignment: assignmentToDelete.value, type: 'delete' });
    await PostEventLog({
      entityId: assignmentToDelete.value!._id,
      entityType: "assignment",
      eventType: "PROFESSOR_ASSIGNMENT_DELETED",
      timestamp: new Date(),
      userId: user!._id,
      payload: {
        info: {
          title: assignmentToDelete.value!.title,
          type: assignmentToDelete.value!.type,
          session: assignmentToDelete.value!.session
        }
      }
    })
    assignmentToDelete.value = null;
  } catch (error) {
    toast.value = { show: true, message: error.response.data, title: 'Erreur', type: 'error' };
  }
};

const viewSubmissions = (assignment: AssignmentInterface) => {
  router.push(`/professor/modules/${route.params.moduleId}/assignments/${assignment._id}/promotion/${assignment.promotion}`);
};

const toggleAssignmentStatus = async (assignment: AssignmentInterface) => {
  try {
    if (assignment.isActive) {
      await axios.patch(`/api/v1/assignments/cancel-exam/${assignment._id}`);
      toast.value = { show: true, message: 'Examen annulé avec succès !', title: 'Succès', type: 'success' };
      assignment.isActive = false;
      emit("assignmentNotificationByProfessor", { assignment, type: 'cancel' });
      await PostEventLog({
        entityId: assignment._id,
        entityType: "assignment",
        eventType: "PROFESSOR_ASSIGNMENT_EXAM_CANCELLED",
        timestamp: new Date(),
        userId: user!._id,
        payload: {
          info: {
            title: assignment.title,
            type: assignment.type,
            session: assignment.session
          }
        }
      })

    } else {
      await axios.patch(`/api/v1/assignments/active/${assignment._id}`);
      emit("assignmentNotificationByProfessor", { assignment, type: 'reactivate' });
      await PostEventLog({
        entityId: assignment._id,
        entityType: "assignment",
        eventType: "PROFESSOR_ASSIGNMENT_EXAM_RESCHEDULED",
        timestamp: new Date(),
        userId: user!._id,
        payload: {
          info: {
            title: assignment.title,
            type: assignment.type,
            session: assignment.session
          },
          link: `/professor/modules/${route.params.moduleId}/assignments/${assignment._id}/promotion/${assignment.promotion}`
        }
      })
      toast.value = { show: true, message: 'Examen réactivé avec succès !', title: 'Succès', type: 'success' };
      assignment.isActive = true;
    }
  } catch (error) {
    toast.value = { show: true, message: error.response.data, title: 'Erreur', type: 'error' };
  }

};

// Fonctions utilitaires
const getAssignmentIcon = (type: string) => {
  switch (type) {
    case 'homework':
      return 'material-symbols:assignment-outline';
    case 'project':
      return 'material-symbols:folder-special-outline';
    case 'exam':
      return 'material-symbols:quiz-outline';
    default:
      return 'material-symbols:assignment-outline';
  }
};

const getAssignmentTypeClass = (type: string) => {
  return type; // homework, project, exam
};

const getAssignmentTypeLabel = (type: string) => {
  switch (type) {
    case 'homework':
      return 'Devoir';
    case 'project':
      return 'Projet';
    case 'exam':
      return 'Examen';
    default:
      return 'Devoir';
  }
};

const getAssignmentStatus = (assignment: AssignmentInterface) => {
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);

  if (now > dueDate) {
    return 'expired';
  } else if (now.getTime() + (24 * 60 * 60 * 1000) > dueDate.getTime()) {
    return 'urgent';
  } else {
    return 'active';
  }
};

const getAssignmentStatusLabel = (assignment: AssignmentInterface) => {
  const status = getAssignmentStatus(assignment);
  switch (status) {
    case 'expired':
      return 'Expiré';
    case 'urgent':
      return 'Urgent';
    case 'active':
      return 'Actif';
    default:
      return 'Actif';
  }
};

const getSubmissionCount = (_assignment: AssignmentInterface) => {
  // TODO: Implémenter le comptage réel des rendus
  return Math.floor(Math.random() * 20) + 5;
};

const getPendingCount = (assignment: professorAssignmentInterface) => {
  return numberOfStudents.value - assignment.numberOfSubmissions;
};

const formatDate = (dateString: Date | string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const { emit } = useSocket()

const handleSubmit = async (values: Record<string, unknown>) => {
  try {
    if (currentAssignment.value) {
      const response = await axios.patch(`/api/v1/assignments/${currentAssignment.value._id}`, values);
      emit("assignmentNotificationByProfessor", { assignment: response.data, type: 'update' });
      assignments.value = assignments.value.map(assignment =>
        assignment._id === currentAssignment.value!._id ? {
          numberOfSubmissions: assignment.numberOfSubmissions,
          ...response.data
        } : assignment
      );
      await PostEventLog({
        entityId: currentAssignment.value!._id,
        entityType: "assignment",
        eventType: "PROFESSOR_ASSIGNMENT_UPDATED",
        timestamp: new Date(),
        userId: user!._id,
        payload: {
          info: {
            title: response.data.title,
            type: response.data.type,
            session: response.data.session
          },
          link: `/professor/modules/${route.params.moduleId}/assignments/${currentAssignment.value!._id}/promotion/${currentAssignment.value!.promotion}`
        }
      })

      toast.value = { show: true, message: 'Devoir modifié avec succès !', title: 'Succès', type: 'success' };
    } else {
      // Création

      const response = await axios.post('/api/v1/assignments', {
        module: route.params.moduleId,
        ...values
      });
      emit("assignmentNotificationByProfessor", { assignment: response.data, type: 'new' });
      await PostEventLog({
        entityId: response.data._id,
        entityType: "assignment",
        eventType: "PROFESSOR_ASSIGNMENT_CREATED",
        timestamp: new Date(),
        userId: user!._id,
        payload: {
          info: {
            title: response.data.title,
            type: response.data.type,
            session: response.data.session
          },
          link: `/professor/modules/${route.params.moduleId}/assignments/${response.data._id}/promotion/${response.data.promotion}`
        }
      })

      assignments.value.unshift(response.data);
      toast.value = { show: true, message: 'Devoir créé avec succès !', title: 'Succès', type: 'success' };
    }
    closeModal();
  } catch (error: unknown) {
    toast.value = { show: true, message: error.response.data, title: 'Erreur', type: 'error' };
  }
};

watchEffect(() => {
  if (!route.params.assignmentId) {
    fetchAssignments();
  }
});
</script>

<style scoped>
.assignments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: var(--background-light);
}

/* En-tête optimisé */
.assignments-header {
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

.create-button {
  background: var(--primary-color);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--white);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.create-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Statistiques optimisées */
.assignments-stats {
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.25rem;
}

.assignment-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
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
  background: repeating-linear-gradient(45deg,
      transparent,
      transparent 10px,
      rgba(235, 77, 75, 0.05) 10px,
      rgba(235, 77, 75, 0.05) 20px);
  border-radius: var(--radius-xl);
  pointer-events: none;
}

.assignment-card.assignment-cancelled:hover {
  transform: none;
  box-shadow: var(--shadow-sm);
  border-color: var(--error-light);
}

.assignment-card.assignment-cancelled .assignment-title,
.assignment-card.assignment-cancelled .assignment-description {
  color: var(--text-secondary);
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.assignment-icon {
  width: 44px;
  height: 44px;
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
  width: 22px;
  height: 22px;
}

.assignment-actions {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
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

.view-btn:hover {
  background: var(--primary-color);
  color: var(--white);
}

.edit-btn:hover {
  background: var(--warning);
  color: var(--white);
}

.toggle-btn:hover {
  background: var(--info);
  color: var(--white);
}

.delete-btn:hover {
  background: var(--error);
  color: var(--white);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.assignment-content {
  margin-bottom: 1rem;
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

.assignment-description {

  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.assignment-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.assignment-type-badge,
.assignment-session-badge,
.assignment-location-badge,
.assignment-status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  flex-shrink: 0;
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

.assignment-status-badge.active {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.assignment-status-badge.cancelled {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.assignment-type-badge svg,
.assignment-session-badge svg,
.assignment-location-badge svg,
.assignment-status-badge svg {
  width: 14px;
  height: 14px;
}

.assignment-dates {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
  margin-top: auto;
}

.due-date,
.created-date,
.no-file,
.file-attachment {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.due-date svg,
.created-date svg,
.no-file svg,
.file-attachment svg {
  width: 14px;
  height: 14px;
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

.assignment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  margin: auto -1.25rem -1.25rem -1.25rem;
  margin-top: auto;
}

.submission-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-item svg {
  width: 14px;
  height: 14px;
}

.assignment-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
}

.assignment-status.active {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success);
}

.assignment-status.urgent {
  background: rgba(255, 165, 2, 0.1);
  color: var(--warning);
}

.assignment-status.expired {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

/* États */
.empty-state,
.empty-filter-state,
.loading-state,
.error-state {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin: 1.5rem 0;
}

.empty-icon,
.loading-spinner,
.error-icon {
  margin-bottom: 1.25rem;
}

.empty-icon svg,
.error-icon svg {
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
.empty-filter-state h3,
.error-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
}

.empty-state p,
.empty-filter-state p,
.error-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

.empty-action-button,
.reset-filter-btn {
  margin-top: 0.75rem;
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

.retry-button {
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

.retry-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.retry-button svg {
  width: 16px;
  height: 16px;
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

.assignment-fade-enter-active,
.assignment-fade-leave-active {
  transition: all 0.4s ease;
}

.assignment-fade-enter-from,
.assignment-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .assignments-container {
    padding: 1rem;
  }

  .assignments-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-text h1 {
    font-size: 1.375rem;
  }

  .create-button {
    width: 100%;
    justify-content: center;
  }

  .assignments-stats {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .filter-group {
    justify-content: center;
    gap: 0.375rem;
  }

  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .filter-btn svg {
    width: 14px;
    height: 14px;
  }

  .assignments-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .assignment-card {
    padding: 1rem;
    min-height: 280px;
  }

  .assignment-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .assignment-actions {
    order: -1;
    align-self: flex-end;
  }

  .assignment-icon {
    order: 1;
    margin: 0 auto;
  }

  .assignment-title {
    font-size: 1rem;
    text-align: center;
  }

  .assignment-description {
    font-size: 0.8rem;
    text-align: center;
  }

  .assignment-meta {
    justify-content: center;
    gap: 0.5rem;
  }

  .assignment-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
  }

  .submission-stats {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .assignments-container {
    padding: 0.75rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .header-text p {
    font-size: 0.8rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .header-icon svg {
    width: 22px;
    height: 22px;
  }

  .assignments-stats {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-btn {
    justify-content: center;
  }

  .assignment-card {
    padding: 0.875rem;
    min-height: 260px;
  }

  .assignment-icon {
    width: 40px;
    height: 40px;
  }

  .assignment-icon svg {
    width: 20px;
    height: 20px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .assignment-title {
    font-size: 0.95rem;
  }

  .assignment-description {
    font-size: 0.75rem;
  }

  .assignment-type-badge,
  .assignment-session-badge,
  .assignment-location-badge,
  .assignment-status-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }
}

@media (max-width: 360px) {
  .assignments-container {
    padding: 0.5rem;
  }

  .header-content {
    gap: 0.5rem;
  }

  .assignments-stats {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .filter-btn {
    padding: 0.3rem 0.6rem;
  }

  .assignment-card {
    padding: 0.75rem;
    min-height: 240px;
  }

  .assignment-actions {
    gap: 0.25rem;
  }
}
</style>
