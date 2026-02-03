<template>
  <div class="professor-dashboard">
    <!-- Header avec profil professeur -->
    <div class="dashboard-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="profile-section">
          <div class="profile-avatar" :style="{ background: getAvatarGradient() }">
            {{ getInitials() }}
          </div>
          <div class="profile-info">
            <h1>Bonjour, {{ getProfessorTitle() }} {{ userStore.currentUser?.name }} 👋</h1>
            <div class="profile-details">
              <span class="detail-chip">
                <Icon icon="material-symbols:badge-outline" />
                {{ userStore.currentUser?.matricule || 'N/A' }}
              </span>
              <span class="detail-chip" v-for="dept in getDepartments()" :key="dept">
                <Icon icon="material-symbols:domain" />
                {{ formatDepartment(dept) }}
              </span>
              <span class="detail-chip status" :class="isPermanent ? 'permanent' : 'vacataire'">
                <Icon :icon="isPermanent ? 'material-symbols:verified' : 'material-symbols:schedule'" />
                {{ isPermanent ? 'Permanent' : 'Vacataire' }}
              </span>
            </div>
          </div>
        </div>
        <div class="header-date">
          <Icon icon="material-symbols:calendar-today" />
          <span>{{ formatCurrentDate() }}</span>
        </div>
      </div>
    </div>

    <!-- Chargement -->
    <SpinningLoader :loading="loading" />

    <!-- Erreur -->
    <ErrorComponent v-if="errorServer && !loading" :message="errorServer" @retry="fetchDashboardData" />

    <!-- Contenu principal -->
    <div v-if="!loading && !errorServer" class="dashboard-content">

      <!-- KPIs rapides -->
      <section class="quick-stats">
        <div class="stat-card modules">
          <div class="stat-icon">
            <Icon icon="material-symbols:menu-book-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalModules }}</span>
            <span class="stat-label">Modules enseignés</span>
          </div>
        </div>



        <div class="stat-card hours">
          <div class="stat-icon">
            <Icon icon="material-symbols:schedule-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.weeklyHours }}h</span>
            <span class="stat-label">Heures cette semaine</span>
          </div>
        </div>

        <div class="stat-card assignments">
          <div class="stat-icon">
            <Icon icon="material-symbols:assignment-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.pendingSubmissions }}</span>
            <span class="stat-label">Devoirs à corriger</span>
          </div>
          <RouterLink v-if="stats.pendingSubmissions > 0" to="/professor/modules" class="stat-action">
            Voir
            <Icon icon="material-symbols:arrow-forward" />
          </RouterLink>
        </div>
      </section>

      <!-- Grille principale -->
      <div class="main-grid">
        <!-- Colonne gauche -->
        <div class="left-column">

          <!-- Emploi du temps du jour -->
          <section class="schedule-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:calendar-today" />
                <span>Emploi du temps - Aujourd'hui</span>
              </h2>
              <RouterLink to="/professor/schedule" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="schedule-timeline">
              <div v-for="(course, index) in sortedTodaySchedule" :key="course._id || index" class="timeline-item">
                <div class="timeline-time">
                  <span class="time-start">{{ course.startTime }}</span>
                  <span class="time-end">{{ course.endTime }}</span>
                </div>
                <div class="timeline-connector">
                  <div class="connector-dot" :class="getCourseStatus(course)"></div>
                  <div class="connector-line" v-if="index < sortedTodaySchedule.length - 1"></div>
                </div>
                <div class="timeline-content" :class="getCourseStatus(course)">
                  <h4>{{ course.module ? course.module.code : course.title }}</h4>
                  <div class="course-details">
                    <span class="course-promo" v-if="course.promotions && course.promotions.length > 0">
                      <Icon icon="material-symbols:group" />
                      {{ formatPromotions(course.promotions) }}
                    </span>
                    <span class="course-room">
                      <Icon icon="material-symbols:location-on" />
                      {{ course.room }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-if="sortedTodaySchedule.length === 0" class="empty-schedule">
                <Icon icon="material-symbols:event-available" />
                <span>Aucun cours prévu aujourd'hui</span>
              </div>
            </div>
          </section>

          <!-- Progression de mes modules -->
          <section class="modules-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:trending-up" />
                <span>Progression de mes modules</span>
              </h2>
              <RouterLink to="/professor/modules" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="modules-progression-list">
              <div v-for="module in moduleProgression.slice(0, 4)" :key="module.moduleId"
                class="module-progression-item">
                <div class="module-progression-header">
                  <div class="module-info">
                    <div class="module-icon" :class="getModuleColorClass(module.code)">
                      <Icon icon="material-symbols:book-2" />
                    </div>
                    <div class="module-details">
                      <h4>{{ module.title }}</h4>
                      <span class="module-code">{{ module.code }}</span>
                    </div>
                  </div>
                  <div class="module-stats">
                    <span class="stat-badge">
                      <Icon icon="material-symbols:schedule" />
                      {{ module.hoursDone }}h / {{ module.hoursPlanned }}h
                    </span>
                    <span class="stat-badge">
                      <Icon icon="material-symbols:star" />
                      {{ module.credits }} crédits
                    </span>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-bar-wrapper">
                    <div class="progress-bar" :class="getProgressClass(module.hoursDone, module.hoursPlanned)"
                      :style="{ width: getProgressPercentage(module.hoursDone, module.hoursPlanned) + '%' }">
                    </div>
                  </div>
                  <span class="progress-label" :class="getProgressClass(module.hoursDone, module.hoursPlanned)">
                    {{ getProgressPercentage(module.hoursDone, module.hoursPlanned) }}%
                  </span>
                </div>
              </div>
              <div v-if="moduleProgression.length === 0" class="empty-modules">
                <Icon icon="material-symbols:book-2-outline" />
                <span>Aucun module assigné</span>
              </div>
            </div>
          </section>

          <!-- Devoirs récents à corriger -->
          <section class="submissions-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:assignment-turned-in" />
                <span>Devoirs à corriger</span>
              </h2>
            </div>
            <div class="submissions-list">
              <div v-for="assignment in pendingSubmissions" :key="assignment._id" class="submission-item"
                :class="assignment.type" @click="goToAssignment(assignment)">
                <div class="submission-icon" :class="assignment.type">
                  <Icon :icon="getAssignmentIcon(assignment.type)" />
                </div>
                <div class="submission-content">
                  <div class="submission-header">
                    <h4>{{ assignment.title }}</h4>
                    <span class="assignment-type-badge" :class="assignment.type">
                      {{ getAssignmentTypeLabel(assignment.type) }}
                    </span>
                  </div>
                  <div class="submission-meta">
                    <span class="submission-module">
                      <Icon icon="material-symbols:book" />
                      {{ assignment.module.code }}
                    </span>
                    <span class="submission-count">
                      <Icon icon="material-symbols:group" />
                      {{ assignment.submissionsCount }} soumission{{ assignment.submissionsCount > 1 ? 's' : '' }}
                    </span>
                    <span class="submission-location" :class="assignment.submissionLocation">
                      <Icon
                        :icon="assignment.submissionLocation === 'online' ? 'material-symbols:cloud' : 'material-symbols:location-on'" />
                      {{ assignment.submissionLocation === 'online' ? 'En ligne' : 'En personne' }}
                    </span>
                  </div>
                </div>
                <div class="submission-deadline" :class="{ urgent: isUrgent(assignment.dueDate) }">
                  <Icon icon="material-symbols:schedule" />
                  <span>{{ formatRelativeTime(assignment.dueDate) }}</span>
                </div>
              </div>
              <div v-if="pendingSubmissions.length === 0" class="empty-submissions">
                <Icon icon="material-symbols:check-circle" />
                <span>Aucun devoir en attente</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Colonne droite -->
        <div class="right-column">

          <!-- Actions rapides -->
          <section class="quick-actions-section">
            <h2 class="section-title">
              <Icon icon="material-symbols:bolt" />
              <span>Accès rapide</span>
            </h2>
            <div class="quick-actions-grid">
              <RouterLink to="/professor/modules" class="action-card">
                <div class="action-icon blue">
                  <Icon icon="material-symbols:menu-book-rounded" />
                </div>
                <span>Mes cours</span>
              </RouterLink>

              <RouterLink to="/professor/schedule" class="action-card">
                <div class="action-icon green">
                  <Icon icon="material-symbols:calendar-month-rounded" />
                </div>
                <span>Emploi du temps</span>
              </RouterLink>

              <RouterLink to="/professor/announcements" class="action-card">
                <div class="action-icon orange">
                  <Icon icon="material-symbols:campaign-rounded" />
                </div>
                <span>Annonces</span>
              </RouterLink>

              <RouterLink to="/settings" class="action-card">
                <div class="action-icon gray">
                  <Icon icon="material-symbols:settings-rounded" />
                </div>
                <span>Paramètres</span>
              </RouterLink>
            </div>
          </section>



          <!-- Notifications -->
          <section class="notifications-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:notifications-rounded" />
                <span>Notifications</span>
                <span v-if="unseenCount > 0" class="notif-count">{{ unseenCount }}</span>
              </h2>
            </div>
            <div class="notifications-list">
              <div v-for="notif in notifications.slice(0, 4)" :key="notif._id" class="notif-item" :class="[
                getNotifType(notif.informationType, notif.warningLevel),
                { clickable: notif.linkTo }
              ]" @click="handleNotificationClick(notif)">
                <div class="notif-indicator" :class="getNotifType(notif.informationType, notif.warningLevel)"></div>
                <div class="notif-icon" :class="getNotifType(notif.informationType, notif.warningLevel)">
                  <Icon :icon="getNotifIcon(notif.informationType)" />
                </div>
                <div class="notif-content">
                  <span class="notif-title" v-if="notif.title">{{ notif.title }}</span>
                  <span class="notif-message">{{ notif.message }}</span>
                  <span class="notif-time">
                    <Icon icon="material-symbols:schedule" />
                    {{ formatRelativeTime(notif.createdAt) }}
                  </span>
                </div>
                <Icon v-if="notif.linkTo" icon="material-symbols:arrow-forward" class="notif-arrow" />
              </div>
              <div v-if="notifications.length === 0" class="empty-notif">
                <Icon icon="material-symbols:notifications-off-outline" />
                <span>Aucune notification</span>
              </div>
            </div>
          </section>

          <!-- Prochains cours -->

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { useMyUserStore } from '@/stores/userStore';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import type ProfessorInterface from '@/interfaces/professor.interface';
import axios from 'axios';
import { UseNotificationStore } from '@/stores/notificationStore';
import type { NotificationInterface } from '@/interfaces/notification.interface';
import { storeToRefs } from 'pinia';

const router = useRouter();
const userStore = useMyUserStore();

// États
const loading = ref(false);
const errorServer = ref('');


// Vérifier si permanent
const isPermanent = computed(() => {
  const prof = userStore.currentUser as ProfessorInterface | null;
  return prof?.isPermanent ?? false;
});

// Statistiques générales
const stats = ref({
  totalModules: 0,
  totalStudents: 0,
  weeklyHours: 0,
  pendingSubmissions: 0
});

// Emploi du temps du jour
interface ProfessorScheduleInterface {
  _id: string;
  promotions: Array<{
    _id: string;
    name: string;
    level: string;
    field: string;
  }>;
  module?: {
    _id: string;
    code: string;
    title: string;
  };
  title?: string;
  room: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const todaySchedule = ref<ProfessorScheduleInterface[]>([]);

// Progression des modules
interface ModuleProgressionInterface {
  moduleId: string;
  title: string;
  code: string;
  coefficient: number;
  credits: number;
  promotionId: string;
  hoursPlanned: number;
  hoursDone: number;
}

const moduleProgression = ref<ModuleProgressionInterface[]>([]);

// Devoirs à corriger
interface PendingAssignmentInterface {
  _id: string;
  title: string;
  dueDate: Date;
  promotion: string
  module: {
    _id: string;
    code: string;
    title: string;
    coefficient: number;
  };
  type: 'assignment' | 'exam' | 'quiz';
  session: 'normal' | 'rattrapage';
  submissionLocation: 'online' | 'in-person';
  createdAt: Date;
  submissionsCount: number;
}


const goToAssignment = (assignment: PendingAssignmentInterface) => {
  router.push(`/professor/modules/${assignment.module._id}/assignments/${assignment._id}/promotion/${assignment.promotion}`);
}

const pendingSubmissions = ref<PendingAssignmentInterface[]>([]);



const notificationStore = UseNotificationStore()
const { notifications, unseenCount } = storeToRefs(notificationStore);



// Fetch des données
const fetchDashboardData = async () => {
  loading.value = true;
  errorServer.value = '';

  try {
    const response = (await axios.get('/api/v1/dashboard/professor')).data;
    stats.value.weeklyHours = response.totalHoursThisWeek;
    stats.value.pendingSubmissions = response.numberOfAssignmentsToGrade.totalToGrade;
    stats.value.totalModules = response.numberOfModules;
    todaySchedule.value = response.scheduleOfToday || [];
    moduleProgression.value = response.profProgressionCourse || [];
    pendingSubmissions.value = response.numberOfAssignmentsToGrade.assignments || [];
  } catch (error: any) {
    errorServer.value = error.response?.data || 'Erreur lors du chargement des données';
  } finally {
    loading.value = false;
  }
};

// Fonctions utilitaires
const getInitials = () => {
  const user = userStore.currentUser;
  if (!user) return '';
  return `${user.name?.charAt(0) || ''}${user.firstName?.charAt(0) || ''}`.toUpperCase();
};

const getAvatarGradient = () => {
  const colors = [
    'linear-gradient(135deg, #5086c1, #1a252f)',
    'linear-gradient(135deg, #30a855, #1e7a3d)',
    'linear-gradient(135deg, #3498db, #5086c1)',
    'linear-gradient(135deg, #1a252f, #5086c1)'
  ];
  const name = userStore.currentUser?.name || '';
  return colors[name.charCodeAt(0) % colors.length];
};

const getProfessorTitle = () => {
  const prof = userStore.currentUser as ProfessorInterface | null;
  return prof?.isPermanent ? 'Pr.' : 'M.';
};

const getDepartments = () => {
  const prof = userStore.currentUser as ProfessorInterface | null;
  return prof?.department || [];
};

const formatDepartment = (dept: string) => {
  const labels: Record<string, string> = {
    informatique: 'Informatique',
    btp: 'BTP',
    gestion: 'Gestion'
  };
  return labels[dept] || dept;
};

const formatCurrentDate = () => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = new Date(date).getTime() - now.getTime();
  const absDiff = Math.abs(diff);
  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  if (diff < 0) {
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  } else {
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Demain';
    return `Dans ${days}j`;
  }
};

const formatDay = (date: Date) => {
  return new Date(date).getDate().toString().padStart(2, '0');
};

const formatMonth = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
};

// Calculer le statut d'un cours en fonction de l'heure actuelle
const getCourseStatus = (course: ProfessorScheduleInterface): 'past' | 'ongoing' | 'upcoming' => {
  const now = new Date();
  const courseDate = new Date(course.date);

  // Extraire les heures et minutes du startTime et endTime (format "HH:MM")
  const [startHour, startMinute] = course.startTime.split(':').map(Number);
  const [endHour, endMinute] = course.endTime.split(':').map(Number);

  // Créer les dates complètes pour le début et la fin du cours
  const courseStart = new Date(courseDate);
  courseStart.setHours(startHour, startMinute, 0, 0);

  const courseEnd = new Date(courseDate);
  courseEnd.setHours(endHour, endMinute, 0, 0);

  // Comparer avec l'heure actuelle
  if (now < courseStart) {
    return 'upcoming'; // Cours pas encore commencé
  } else if (now >= courseStart && now <= courseEnd) {
    return 'ongoing'; // Cours en cours
  } else {
    return 'past'; // Cours terminé
  }
};

// Trier les cours par ordre chronologique (startTime)
const sortedTodaySchedule = computed(() => {
  return [...todaySchedule.value].sort((a, b) => {
    const timeA = a.startTime.split(':').map(Number);
    const timeB = b.startTime.split(':').map(Number);

    // Comparer les heures puis les minutes
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }
    return timeA[1] - timeB[1];
  });
});

// Formater les promotions pour l'affichage
const formatPromotions = (promotions: Array<{ name: string; level: string; field: string }>) => {
  if (promotions.length === 0) return '';
  if (promotions.length === 1) return promotions[0].name;
  return `${promotions.length} promotions`;
};

const isUrgent = (date: Date) => {
  const diff = new Date(date).getTime() - Date.now();
  return diff < 2 * 24 * 60 * 60 * 1000; // < 2 jours
};

const getModuleColorClass = (code: string) => {
  const colors = ['blue', 'green', 'orange', 'teal'];
  const index = code.charCodeAt(0) % colors.length;
  return colors[index];
};

// Obtenir l'icône selon le type d'assignment
const getAssignmentIcon = (type: string): string => {
  const icons: Record<string, string> = {
    assignment: 'material-symbols:assignment',
    exam: 'material-symbols:quiz',
    quiz: 'material-symbols:help'
  };
  return icons[type] || 'material-symbols:description';
};

// Obtenir le label du type d'assignment
const getAssignmentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    assignment: 'Devoir',
    exam: 'Examen',
    quiz: 'Quiz'
  };
  return labels[type] || type;
};

// Calculer le pourcentage de progression
const getProgressPercentage = (hoursDone: number, hoursPlanned: number): number => {
  if (hoursPlanned === 0) return 0;
  return Math.min(Math.round((hoursDone / hoursPlanned) * 100), 100);
};

// Obtenir la classe CSS selon la progression
const getProgressClass = (hoursDone: number, hoursPlanned: number): string => {
  const percentage = getProgressPercentage(hoursDone, hoursPlanned);
  if (percentage >= 100) return 'completed';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  if (percentage >= 25) return 'low';
  return 'very-low';
};



const getNotifIcon = (informationType?: string) => {
  const icons: Record<string, string> = {
    schedule: 'material-symbols:calendar-clock',
    academic: 'material-symbols:school',
    administrative: 'material-symbols:assignment',
    financial: 'material-symbols:payments',
    announcement: 'material-symbols:campaign',
    pedagogical: 'material-symbols:menu-book',
    alert: 'material-symbols:warning',
    account: 'material-symbols:account-circle',
    system: 'material-symbols:settings',
    // Ancienne compatibilité
    submission: 'material-symbols:assignment-turned-in',
    reminder: 'material-symbols:alarm',
    grade: 'material-symbols:grade',
    message: 'material-symbols:mail'
  };
  return icons[informationType || ''] || 'material-symbols:notifications';
};

const getNotifType = (informationType?: string, warningLevel?: string | null) => {
  // Prioriser le niveau d'avertissement pour la classe
  if (warningLevel === 'critical') return 'alert';
  if (warningLevel === 'warning') return 'warning';

  // Sinon utiliser le type d'information
  const typeMapping: Record<string, string> = {
    financial: 'payment',
    administrative: 'request',
    academic: 'admission',
    alert: 'alert'
  };
  return typeMapping[informationType || ''] || informationType || 'info';
};

const handleNotificationClick = (notification: NotificationInterface) => {
  if (notification.linkTo) {
    router.push(notification.linkTo);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.professor-dashboard {
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Roboto', system-ui, sans-serif;
  min-height: 100vh;
  background: var(--tertiary-extra-light, #f5f5f5);
}

/* Header */
.dashboard-header {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-dark, #1a252f) 0%, var(--primary-color, #5086c1) 50%, var(--primary-light, #3498db) 100%);
}

.header-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 2rem 1.5rem;
  color: white;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl, 16px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.profile-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.profile-details {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-chip {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.detail-chip svg {
  font-size: 0.9rem;
}

.detail-chip.status.permanent {
  background: var(--secondary-color, #30a855);
}

.detail-chip.status.vacataire {
  background: var(--warning, orange);
}

.header-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: var(--radius, 8px);
}

/* Dashboard Content */
.dashboard-content {
  padding: 1.5rem 2rem 2rem;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-light);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card.modules::before {
  background: var(--primary-color, #5086c1);
}

.stat-card.students::before {
  background: var(--secondary-color, #30a855);
}

.stat-card.hours::before {
  background: var(--accent-color, #3498db);
}

.stat-card.assignments::before {
  background: var(--warning, orange);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-card.modules .stat-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.stat-card.students .stat-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.stat-card.hours .stat-icon {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.stat-card.assignments .stat-icon {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--black, #2d3436);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--tertiary-color, gray);
}

.stat-action {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--primary-color, #5086c1);
  text-decoration: none;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover .stat-action {
  opacity: 1;
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--black, #2d3436);
  margin: 0;
}

.section-title svg {
  font-size: 1.2rem;
  color: var(--primary-color, #5086c1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.see-all {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary-color, #5086c1);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: gap 0.3s;
}

.see-all:hover {
  gap: 0.5rem;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Schedule Section */
.schedule-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  min-height: 90px;
}

.timeline-time {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 0.5rem;
}

.time-start {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--black, #2d3436);
}

.time-end {
  font-size: 0.75rem;
  color: var(--tertiary-color, gray);
}

.timeline-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.connector-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e5e7eb;
  border: 2px solid white;
  box-shadow: 0 0 0 2px #e5e7eb;
  z-index: 1;
  transition: all 0.3s ease;
}

/* Cours passé - gris */
.connector-dot.past {
  background: var(--gray, #6b7280);
  box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.2);
  opacity: 0.6;
}

/* Cours en cours - vert avec animation */
.connector-dot.ongoing {
  background: var(--secondary-color, #30a855);
  box-shadow: 0 0 0 3px rgba(48, 168, 85, 0.3);
  animation: pulse-ongoing 2s ease-in-out infinite;
}

@keyframes pulse-ongoing {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 3px rgba(48, 168, 85, 0.3);
  }

  50% {
    transform: scale(1.2);
    box-shadow: 0 0 0 6px rgba(48, 168, 85, 0.5);
  }
}

/* Cours à venir - gris clair */
.connector-dot.upcoming {
  background: var(--gray-light, #e5e7eb);
  box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.5);
}

.connector-line {
  flex: 1;
  width: 2px;
  background: #e5e7eb;
  margin: 4px 0;
}

.timeline-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  border-left: 3px solid #e5e7eb;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  position: relative;
}

/* Cours passé - grisé */
.timeline-content.past {
  border-left-color: var(--gray, #6b7280);
  background: var(--gray-lightest, #f9fafb);
  opacity: 0.5;
}

.timeline-content.past h4 {
  color: var(--gray, #6b7280);
  text-decoration: line-through;
}

.timeline-content.past .course-details {
  opacity: 0.7;
}

/* Cours en cours - vert avec badge */
.timeline-content.ongoing {
  border-left-color: var(--secondary-color, #30a855);
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  box-shadow: 0 4px 16px rgba(48, 168, 85, 0.2);
}

.timeline-content.ongoing h4 {
  color: var(--secondary-dark, #1e7a3d);
  font-weight: 700;
  padding-right: 80px;
}

.timeline-content.ongoing::after {
  content: '● EN COURS';
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--secondary-color, #30a855);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  animation: blink-badge 2s ease-in-out infinite;
}

@keyframes blink-badge {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.timeline-content.ongoing .course-details {
  color: var(--secondary-dark, #1e7a3d);
}

/* Cours à venir - style normal/blanc */
.timeline-content.upcoming {
  border-left-color: var(--primary-color, #5086c1);
  background: white;
}

.timeline-content.upcoming h4 {
  color: var(--gray-darker, #1f2937);
}

.timeline-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
  line-height: 1.4;
}

.course-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.course-promo,
.course-room,
.course-prof {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--gray, #6b7280);
}

.course-promo svg,
.course-room svg,
.course-prof svg {
  font-size: 0.9rem;
}

.empty-schedule {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

.empty-schedule svg {
  font-size: 2.5rem;
  color: var(--secondary-color, #30a855);
}

/* Modules Section */
/* Modules Progression Section */
.modules-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.modules-progression-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.module-progression-item {
  background: var(--gray-lightest, #f8fafc);
  border-radius: 12px;
  padding: 1.25rem;
  border-left: 4px solid var(--gray-light, #e5e7eb);
  transition: all 0.3s ease;
}

.module-progression-item:hover {
  border-left-color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.module-progression-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.module-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.module-progression-item:hover .module-icon {
  transform: scale(1.1) rotate(5deg);
}

.module-icon.blue {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.module-icon.green {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
  box-shadow: 0 4px 12px rgba(48, 168, 85, 0.2);
}

.module-icon.orange {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.2);
}

.module-icon.teal {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.2);
}

.module-details {
  display: flex;
  flex-direction: column;
}

.module-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
  line-height: 1.3;
}

.module-code {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray, #6b7280);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-stats {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-dark, #4b5563);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-badge svg {
  font-size: 0.9rem;
}

/* Progress Bar */
.progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar-wrapper {
  flex: 1;
  height: 10px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  border-radius: 10px;
  transition: width 0.6s ease, background 0.3s ease;
  position: relative;
  background: linear-gradient(90deg, var(--secondary-color, #30a855) 0%, var(--secondary-light, #4ec972) 100%);
}

/* Classes de progression */
.progress-bar.completed {
  background: linear-gradient(90deg, var(--secondary-color, #30a855) 0%, var(--secondary-dark, #1e7a3d) 100%);
  animation: pulse-success 2s ease-in-out infinite;
}

.progress-bar.high {
  background: linear-gradient(90deg, var(--secondary-color, #30a855) 0%, var(--secondary-light, #4ec972) 100%);
}

.progress-bar.medium {
  background: linear-gradient(90deg, var(--primary-color, #5086c1) 0%, var(--primary-light, #6ba3d4) 100%);
}

.progress-bar.low {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.progress-bar.very-low {
  background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
}

@keyframes pulse-success {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 45px;
  text-align: right;
  color: var(--gray-darker, #1f2937);
}

.progress-label.completed {
  color: var(--secondary-color, #30a855);
}

.progress-label.high {
  color: var(--secondary-color, #30a855);
}

.progress-label.medium {
  color: var(--primary-color, #5086c1);
}

.progress-label.low {
  color: #f59e0b;
}

.progress-label.very-low {
  color: #ef4444;
}

.empty-modules {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

.empty-modules svg {
  font-size: 2.5rem;
  opacity: 0.5;
}

/* Submissions Section */
.submissions-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.submission-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--gray-lightest, #f8fafc);
  border-radius: 12px;
  border-left: 4px solid var(--gray-light, #e5e7eb);
  transition: all 0.3s ease;
  cursor: pointer;
}

.submission-item:hover {
  border-left-color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.submission-item.exam {
  border-left-color: rgba(235, 77, 75, 0.3);
}

.submission-item.exam:hover {
  border-left-color: var(--error, #eb4d4b);
}

.submission-item.quiz {
  border-left-color: rgba(255, 165, 0, 0.3);
}

.submission-item.quiz:hover {
  border-left-color: var(--warning, orange);
}

.submission-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.submission-item:hover .submission-icon {
  transform: scale(1.1) rotate(5deg);
}

.submission-icon.assignment {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.submission-icon.exam {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
  box-shadow: 0 4px 12px rgba(235, 77, 75, 0.2);
}

.submission-icon.quiz {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.2);
}

.submission-content {
  flex: 1;
  min-width: 0;
}

.submission-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.submission-content h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
  line-height: 1.3;
}

.assignment-type-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.assignment-type-badge.assignment {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.assignment-type-badge.exam {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.assignment-type-badge.quiz {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.submission-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
}

.submission-meta>span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.submission-meta svg {
  font-size: 0.9rem;
}

.submission-module {
  font-weight: 600;
  color: var(--gray-dark, #4b5563);
}

.submission-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.submission-location {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.submission-location.online {
  color: var(--primary-color, #5086c1);
}

.submission-location.in-person {
  color: var(--secondary-color, #30a855);
}

.submission-deadline {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  background: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-dark, #4b5563);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}

.submission-deadline.urgent {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
  font-weight: 600;
}

.submission-deadline svg {
  font-size: 0.9rem;
}

.empty-submissions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

.empty-submissions svg {
  font-size: 2.5rem;
  color: var(--secondary-color, #30a855);
  opacity: 0.5;
}

/* Quick Actions */
.quick-actions-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border-radius: var(--radius-lg, 12px);
  background: var(--tertiary-extra-light, #f5f5f5);
  text-decoration: none;
  transition: all 0.3s;
}

.action-card:hover {
  background: var(--gray-lighter, #e0e0e0);
  transform: translateY(-2px);
}

.action-card span {
  font-size: 0.75rem;
  color: var(--black, #2d3436);
  text-align: center;
  font-weight: 500;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.action-icon.blue {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.action-icon.green {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.action-icon.orange {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.action-icon.gray {
  background: var(--tertiary-extra-light, #f5f5f5);
  color: var(--tertiary-dark, #5e5e5e);
}

/* Module Stats Section */
.module-stats-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.module-stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-stat-item {
  padding: 0.75rem;
  background: var(--tertiary-extra-light, #f5f5f5);
  border-radius: var(--radius, 8px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-module-name {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--black, #2d3436);
}

.stat-average {
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.stat-average.excellent {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.stat-average.good {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.stat-average.average {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.stat-average.low {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.stat-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-bar {
  height: 6px;
  background: var(--gray-lighter, #e0e0e0);
  border-radius: 3px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-bar-fill.excellent {
  background: var(--secondary-color, #30a855);
}

.stat-bar-fill.good {
  background: var(--primary-color, #5086c1);
}

.stat-bar-fill.average {
  background: var(--warning, orange);
}

.stat-bar-fill.low {
  background: var(--error, #eb4d4b);
}

.stat-details {
  display: flex;
  gap: 1rem;
  font-size: 0.7rem;
  color: var(--tertiary-color, gray);
}

.stat-details span {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.empty-stats {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

/* Notifications Section */
.notifications-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.notif-count {
  background: var(--error, #eb4d4b);
  color: var(--white, white);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--gray-lightest, #f8fafc);
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  animation: slideIn 0.4s ease-out;
}

.notif-item.clickable {
  cursor: pointer;
}

.notif-item.clickable:hover {
  transform: translateX(6px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notif-item:hover {
  background: white;
  border-color: var(--gray-light, #e5e7eb);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateX(4px);
}

.notif-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}

.notif-indicator.payment {
  background: linear-gradient(180deg, var(--secondary-color, #30a855), var(--secondary-dark, #1e7a3d));
}

.notif-indicator.request {
  background: linear-gradient(180deg, var(--primary-color, #5086c1), var(--primary-dark, #2e5a8a));
}

.notif-indicator.admission {
  background: linear-gradient(180deg, var(--primary-light, #3498db), var(--primary-color, #5086c1));
}

.notif-indicator.alert {
  background: linear-gradient(180deg, #ff6b6b, #ee5a6f);
}

.notif-indicator.warning {
  background: linear-gradient(180deg, #f59e0b, #d97706);
}

.notif-indicator.info {
  background: linear-gradient(180deg, var(--primary-light, #3498db), var(--primary-color, #5086c1));
}

.notif-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.notif-item:hover .notif-icon {
  transform: scale(1.1) rotate(5deg);
}

.notif-item.payment .notif-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
  box-shadow: 0 4px 12px rgba(48, 168, 85, 0.2);
}

.notif-item.request .notif-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.notif-item.admission .notif-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.notif-item.alert .notif-icon {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
  box-shadow: 0 4px 12px rgba(235, 77, 75, 0.2);
}

.notif-item.warning .notif-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.notif-item.info .notif-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.notif-item.submission .notif-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.notif-item.reminder .notif-icon {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.notif-item.grade .notif-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.notif-item.schedule .notif-icon {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.notif-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-right: 0.5rem;
}

.notif-title {
  font-size: 0.9rem;
  color: var(--gray-darker, #1f2937);
  font-weight: 600;
  line-height: 1.3;
}

.notif-message {
  font-size: 0.82rem;
  color: var(--gray-dark, #4b5563);
  line-height: 1.5;
  font-weight: 400;
}

.notif-arrow {
  color: var(--gray, #6b7280);
  font-size: 1.2rem;
  opacity: 0;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.notif-item.clickable:hover .notif-arrow {
  opacity: 1;
  transform: translateX(4px);
}

.notif-time {
  font-size: 0.72rem;
  color: var(--gray, #6b7280);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.notif-time svg {
  font-size: 0.8rem;
  opacity: 0.7;
}

.empty-notif {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

.empty-notif svg {
  font-size: 2.5rem;
  opacity: 0.5;
}

/* Upcoming Section */
.upcoming-section {
  background: var(--white, white);
  border-radius: var(--radius-xl, 16px);
  padding: 1.5rem;
  box-shadow: var(--shadow-light);
}

.upcoming-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upcoming-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--tertiary-extra-light, #f5f5f5);
  border-radius: var(--radius, 10px);
}

.upcoming-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 45px;
  padding: 0.35rem;
  background: var(--white, white);
  border-radius: var(--radius, 8px);
  box-shadow: var(--shadow-sm);
}

.date-day {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--black, #2d3436);
}

.date-month {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--tertiary-color, gray);
}

.upcoming-content {
  flex: 1;
}

.upcoming-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--black, #2d3436);
}

.upcoming-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--tertiary-color, gray);
}

.upcoming-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.empty-upcoming {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

/* Responsive */
@media (max-width: 1200px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    height: auto;
    min-height: 160px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem 1.5rem 1.5rem;
  }

  .profile-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }

  .profile-info h1 {
    font-size: 1.25rem;
  }

  .profile-details {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-date {
    display: none;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .quick-stats {
    grid-template-columns: 1fr 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>