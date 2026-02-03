<template>
  <div class="student-dashboard">
    <!-- Header avec profil étudiant -->
    <div class="dashboard-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="profile-section">
          <div class="profile-avatar" :style="{ background: getAvatarGradient() }">
            {{ getInitials() }}
          </div>
          <div class="profile-info">
            <h1>Bonjour, {{ userStore.currentUser?.firstName }} 👋</h1>
            <div class="profile-details">
              <span class="detail-chip">
                <Icon icon="material-symbols:badge-outline" />
                {{ getStudentMatricule() }}
              </span>
              <span class="detail-chip">
                <Icon icon="material-symbols:school" />
                {{ getStudentField() }}
              </span>
              <span class="detail-chip">
                <Icon icon="material-symbols:workspace-premium" />
                {{ getStudentLevel() }}
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

      <!-- Alerte restriction (si étudiant restreint) -->
      <div v-if="isRestricted" class="restriction-alert">
        <div class="alert-icon">
          <Icon icon="material-symbols:warning-rounded" />
        </div>
        <div class="alert-content">
          <h3>Accès restreint</h3>
          <p>Votre compte est actuellement restreint. Veuillez régulariser votre situation auprès de l'administration.
          </p>
        </div>
        <RouterLink to="/student/fees" class="alert-action">
          Voir mes frais
          <Icon icon="material-symbols:arrow-forward" />
        </RouterLink>
      </div>

      <!-- KPIs rapides -->
      <section class="quick-stats">
        <div class="stat-card courses">
          <div class="stat-icon">
            <Icon icon="material-symbols:menu-book-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.totalCourses }}</span>
            <span class="stat-label">Cours ce semestre</span>
          </div>
        </div>


        <div class="stat-card fees">
          <div class="stat-icon">
            <Icon icon="material-symbols:payments-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ feesStats.paidPercentage }}%</span>
            <span class="stat-label">Frais payés</span>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: feesStats.paidPercentage + '%' }"></div>
          </div>
        </div>

        <div class="stat-card requests">
          <div class="stat-icon">
            <Icon icon="material-symbols:assignment-rounded" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.pendingRequests }}</span>
            <span class="stat-label">Demandes en attente</span>
          </div>
        </div>

        <div class="stat-card requests">
          <div class="stat-icon">
            <Icon icon="material-symbols:assignment-return" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ stats.recoverable }}</span>
            <span class="stat-label">Demandes récupérables</span>
          </div>
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
              <RouterLink to="/student/schedule" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="schedule-timeline">
              <div v-for="(course, index) in sortedTodaySchedule" :key="index" class="timeline-item">
                <div class="timeline-time">
                  <span class="time-start">{{ course.startTime }}</span>
                  <span class="time-end">{{ course.endTime }}</span>
                </div>
                <div class="timeline-connector">
                  <div class="connector-dot" :class="getCourseStatus(course)"></div>
                  <div class="connector-line" v-if="index < sortedTodaySchedule.length - 1"></div>
                </div>
                <div class="timeline-content" :class="getCourseStatus(course)">
                  <h4>{{ course.module ? course.module.code : course.title }} </h4>
                  <div class="course-details">
                    <span class="course-prof" v-if="course.professor">
                      <Icon icon="material-symbols:person" />
                      {{ course.professor.name }} {{ course.professor.firstName }}
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

          <!-- Prochains devoirs/examens -->
          <section class="assignments-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:assignment" />
                <span>Devoir/Examen à rendre prochainement</span>
              </h2>
            </div>
            <div class="assignments-list">
              <div v-for="assignment in upcomingAssignments" :key="assignment._id" class="assignment-item"
                :class="assignment.type">

                <div class="assignment-date">
                  <span class="date-day">{{ formatDay(assignment.dueDate) }}</span>
                  <span class="date-month">{{ formatMonth(assignment.dueDate) }}</span>
                </div>
                <div class="assignment-content">
                  <div class="assignment-type-badge" :class="assignment.type">
                    {{ getAssignmentTypeLabel(assignment.type) }}
                  </div>
                  <h4>{{ assignment.title }}</h4>
                  <span class="assignment-module">{{ assignment.module.code }}</span>
                </div>
                <div class="assignment-countdown"
                  :class="{ urgent: isUrgent(assignment.dueDate, assignment.submitted), submitted: assignment.submitted }">
                  <Icon icon="material-symbols:schedule" />
                  <span>{{ getCountdown(assignment.dueDate, assignment.submitted) }}</span>
                </div>
              </div>
              <div v-if="upcomingAssignments.length === 0" class="empty-assignments">
                <Icon icon="material-symbols:check-circle" />
                <span>Aucune échéance prochaine</span>
              </div>
            </div>
          </section>

          <!-- Notes récentes -->
          <section class="grades-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:grade" />
                <span>Notes récentes</span>
              </h2>
              <RouterLink to="/student/grades" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="grades-list">
              <div v-for="grade in recentGrades" :key="grade._id" class="grade-item">
                <div class="grade-module">
                  <span class="module-name">{{ grade.module.code }}</span>
                  <span class="grade-type">{{ grade.assignment.type }}</span>
                </div>
                <div class="grade-value" :class="getGradeClass(grade.grade)">
                  {{ grade.grade.toFixed(2) }}/20
                </div>
              </div>
              <div v-if="recentGrades.length === 0" class="empty-grades">
                <Icon icon="material-symbols:hourglass-empty" />
                <span>Aucune note pour le moment</span>
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
              <RouterLink to="/student/courses" class="action-card">
                <div class="action-icon blue">
                  <Icon icon="material-symbols:menu-book-rounded" />
                </div>
                <span>Mes cours</span>
              </RouterLink>

              <RouterLink to="/student/schedule" class="action-card">
                <div class="action-icon purple">
                  <Icon icon="material-symbols:calendar-month-rounded" />
                </div>
                <span>Emploi du temps</span>
              </RouterLink>

              <RouterLink to="/student/grades" class="action-card">
                <div class="action-icon green">
                  <Icon icon="material-symbols:grade-rounded" />
                </div>
                <span>Mes notes</span>
              </RouterLink>

              <RouterLink to="/student/fees" class="action-card">
                <div class="action-icon orange">
                  <Icon icon="material-symbols:payments-rounded" />
                </div>
                <span>Suivi des Frais de scolarité</span>
              </RouterLink>

              <RouterLink to="/student/administrative-requests" class="action-card">
                <div class="action-icon teal">
                  <Icon icon="material-symbols:description-rounded" />
                </div>
                <span>Demande document</span>
              </RouterLink>

              <RouterLink to="/settings" class="action-card">
                <div class="action-icon gray">
                  <Icon icon="material-symbols:settings-rounded" />
                </div>
                <span>Paramètres</span>
              </RouterLink>
            </div>
          </section>

          <!-- Situation financière -->
          <section class="fees-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:account-balance-wallet" />
                <span>Frais de scolarité</span>
              </h2>
              <RouterLink to="/student/fees" class="see-all">
                Détails
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="fees-overview">
              <div class="fees-progress-ring">
                <svg viewBox="0 0 120 120">
                  <circle class="progress-bg" cx="60" cy="60" r="50" />
                  <circle class="progress-fill" cx="60" cy="60" r="50" :stroke-dasharray="circumference"
                    :stroke-dashoffset="progressOffset" />
                </svg>
                <div class="progress-center">
                  <span class="progress-value">{{ feesStats.paidPercentage }}%</span>
                  <span class="progress-label">Payé</span>
                </div>
              </div>
              <div class="fees-details">
                <div class="fee-row">
                  <span class="fee-label">Montant total</span>
                  <span class="fee-value">{{ formatAmount(feesStats.totalAmount) }} Ar</span>
                </div>
                <div class="fee-row paid">
                  <span class="fee-label">
                    <Icon icon="material-symbols:check-circle" />
                    Payé
                  </span>
                  <span class="fee-value">{{ formatAmount(feesStats.paidAmount) }} Ar</span>
                </div>
                <div class="fee-row remaining">
                  <span class="fee-label">
                    <Icon icon="material-symbols:pending" />
                    Restant
                  </span>
                  <span class="fee-value">{{ formatAmount(feesStats.remainingAmount) }} Ar</span>
                </div>
              </div>
            </div>
            <div v-if="nextPayment" class="next-payment-alert" :class="getPaymentAlertClass()">
              <Icon :icon="getPaymentAlertIcon()" />
              <div class="alert-text">
                <span class="alert-title">{{ getPaymentAlertTitle() }}</span>
                <span class="alert-detail">
                  {{ formatAmount(nextPayment.amount) }} Ar - {{ formatDate(nextPayment.dueDate) }}
                </span>
                <span v-if="nextPayment.numberOfReminders > 0" class="alert-reminder">
                  <Icon icon="material-symbols:notification-important" />
                  {{ nextPayment.numberOfReminders }} rappel(s) • Dernier : {{ formatDate(nextPayment.lastReminderDate)
                  }}
                </span>
              </div>
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

          <!-- Demandes en cours -->
          <section class="requests-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:assignment-outline" />
                <span>Mes demandes</span>
              </h2>
              <RouterLink to="/student/administrative-requests" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="requests-list">
              <div v-for="request in myRequests" :key="request._id" class="request-item">
                <div class="request-icon" :class="request.status">
                  <Icon :icon="getRequestIcon(request.status)" />
                </div>
                <div class="request-content">
                  <span class="request-type">{{ getRequestLabel(request.requestType) }}</span>
                  <span class="request-date">{{ formatDate(request.createdAt) }}</span>
                </div>
                <div class="request-status" :class="request.status">
                  {{ getRequestStatusLabel(request.status) }}
                </div>
              </div>
              <div v-if="myRequests.length === 0" class="empty-requests">
                <Icon icon="material-symbols:inbox-outline" />
                <span>Aucune demande en cours</span>
              </div>
            </div>
          </section>
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
import type StudentInterface from '@/interfaces/student.intefaces';
import axios from 'axios';
import type ScheduleInterface from '@/interfaces/Schedule.interface';
import type { InstallmentsInterface } from '@/interfaces/tutionFees.interface';
import type { AssignmentInterface } from '@/interfaces/assignment.interface';
import type ModuleInterface from '@/interfaces/module.interface';
import { UseNotificationStore } from '@/stores/notificationStore';
import type { NotificationInterface } from '@/interfaces/notification.interface';
import { storeToRefs } from 'pinia';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';


const router = useRouter();

// Interface pour les assignments du dashboard
interface DashboardAssignmentInterface {
  _id: string;
  title: string;
  description: string;
  dueDate: Date;
  module: Pick<ModuleInterface, '_id' | 'code' | 'title'>;
  type: 'homework' | 'project' | 'exam';
  session: 'normal' | 'rattrapage';
  submissionLocation: 'online' | 'in-person';
  createdAt: Date;
  submitted: boolean;
}

const userStore = useMyUserStore();
const notificationStore = UseNotificationStore()
const { notifications, unseenCount } = storeToRefs(notificationStore)

// États
const loading = ref(false);
const errorServer = ref('');

// Vérifier si l'étudiant est restreint
const isRestricted = computed(() => {
  const student = userStore.currentUser as StudentInterface | null;
  return student?.isRestricted ?? false;
});

// Statistiques générales
const stats = ref({
  totalCourses: 0,
  averageGrade: 0,
  pendingRequests: 0,
  recoverable: 0
});

// Statistiques frais de scolarité
const feesStats = ref({
  totalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  paidPercentage: 0
});

// Prochain paiement
const nextPayment = ref<InstallmentsInterface | null>(null);

// Emploi du temps du jour
const todaySchedule = ref<Array<ScheduleInterface
>>([]);

// Prochains devoirs
const upcomingAssignments = ref<DashboardAssignmentInterface[]>([]);

// Notes récentes
const recentGrades = ref<Array<{
  _id: string
  assignment: Pick<AssignmentInterface, '_id' | 'type' | 'session'>
  grade: number
  module: Pick<ModuleInterface, '_id' | 'title' | 'code'>

}>>([]);



// Demandes
const myRequests = ref<Array<AdministrativeRequestInterface>>([]);

// Cercle de progression
const circumference = 2 * Math.PI * 50;
const progressOffset = computed(() => {
  return circumference - (feesStats.value.paidPercentage / 100) * circumference;
});

// Fetch des données
const fetchDashboardData = async () => {
  loading.value = true;
  errorServer.value = '';


  try {
    const response = (await axios.get('/api/v1/dashboard/student')).data;
    todaySchedule.value = response.scheduleOfToday
    stats.value.totalCourses = response.teachingUnits
    stats.value.pendingRequests = response.administrativeRequests.statusCounts.pending
    stats.value.recoverable = response.administrativeRequests.statusCounts.recoverable
    feesStats.value.paidAmount = response.tutionFees.totalPaid
    feesStats.value.totalAmount = response.tutionFees.amount
    feesStats.value.remainingAmount = response.tutionFees.remainingAmount
    feesStats.value.paidPercentage = response.tutionFees.percentagePaid
    nextPayment.value = response.tutionFees.nextInstallment
    upcomingAssignments.value = response.lastAssignments
    recentGrades.value = response.lastGrade
    myRequests.value = response.administrativeRequests.recentRequests
  } catch (error: unknown) {
    errorServer.value = (error as { response?: { data?: string } })?.response?.data || 'Erreur lors du chargement des données';
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
    'linear-gradient(135deg, #5086c1, #30a855)'
  ];
  const name = userStore.currentUser?.name || '';
  return colors[name.charCodeAt(0) % colors.length];
};

const getStudentMatricule = () => {
  const student = userStore.currentUser as StudentInterface | null;
  return student?.matricule || 'N/A';
};

const getStudentField = () => {
  const student = userStore.currentUser as StudentInterface | null;
  return student?.field || 'N/A';
};

const getStudentLevel = () => {
  const student = userStore.currentUser as StudentInterface | null;
  return student?.level || 'N/A';
};

const formatCurrentDate = () => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const formatDay = (date: Date) => {
  return new Date(date).getDate().toString().padStart(2, '0');
};

const formatMonth = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

// Calculer le statut d'un cours en fonction de l'heure actuelle
const getCourseStatus = (course: ScheduleInterface): 'past' | 'ongoing' | 'upcoming' => {
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

const getGradeClass = (value: number) => {
  if (value >= 16) return 'excellent';
  if (value >= 14) return 'good';
  if (value >= 10) return 'average';
  return 'low';
};

const getAssignmentTypeLabel = (type: 'homework' | 'project' | 'exam') => {
  const labels: Record<string, string> = {
    homework: 'Devoir',
    project: 'Projet',
    exam: 'Examen'
  };
  return labels[type] || type;
};

const isUrgent = (date: Date, submitted: boolean) => {
  if (submitted) return false; // Pas urgent si déjà soumis
  const diff = new Date(date).getTime() - Date.now();
  return diff < 3 * 24 * 60 * 60 * 1000; // < 3 jours
};

const getCountdown = (date: Date, submitted: boolean) => {
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  // Si soumis, afficher "Rendu"
  if (submitted) return 'Rendu';

  // Sinon, afficher l'état normal
  if (days < 0) return 'En retard';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  return `${days} jours`;
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
    course: 'material-symbols:menu-book',
    exam: 'material-symbols:quiz',
    grade: 'material-symbols:grade',
    payment: 'material-symbols:payments',
    request: 'material-symbols:assignment'
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

const getRequestIcon = (status: string) => {
  const icons: Record<string, string> = {
    pending: 'material-symbols:hourglass-empty',
    approved: 'material-symbols:check-circle',
    rejected: 'material-symbols:cancel',
    ready: 'material-symbols:download'
  };
  return icons[status] || 'material-symbols:assignment';
};

const getRequestLabel = (label: string) => {
  const labels: Record<string, string> = {
    transcript: 'Relevé de notes',
    "enrollment_certificate": "Certificat de scolarité",
    diploma: 'Attestation de diplôme',
  };
  return labels[label] || label;
}

const getRequestStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    "in-progress": 'En attente de traitement',
    cancelled: 'Refusée',
    delivered: 'Livrée',
    recoverable: 'Récupérable'

  };
  return labels[status] || status;
};

const isPaymentOverdue = (): boolean => {
  if (!nextPayment.value) return false;
  const dueDate = new Date(nextPayment.value.dueDate);
  const now = new Date();
  return now > dueDate;
};

const getPaymentAlertClass = () => {
  if (!nextPayment.value) return '';

  // Vérifier si en attente de vérification
  if (isPaymentPendingVerification()) return 'pending-verification';

  if (isPaymentOverdue()) return 'overdue';
  const daysUntil = Math.floor((new Date(nextPayment.value.dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (daysUntil <= 7) return 'warning';
  return 'info';
};

const getPaymentAlertIcon = () => {
  if (!nextPayment.value) return 'material-symbols:info';

  // Vérifier si en attente de vérification
  if (isPaymentPendingVerification()) return 'material-symbols:hourglass-empty';

  if (isPaymentOverdue()) return 'material-symbols:error';
  return 'material-symbols:schedule';
};

const getPaymentAlertTitle = () => {
  if (!nextPayment.value) return '';

  // Vérifier si en attente de vérification
  if (isPaymentPendingVerification()) return 'En attente de vérification';

  if (isPaymentOverdue()) return 'Paiement en retard';
  return `Prochaine échéance: ${nextPayment.value.label}`;
};

// Fonction pour vérifier si le paiement est en attente de vérification
const isPaymentPendingVerification = (): boolean => {
  if (!nextPayment.value) return false;

  // Vérifier si proofFile ou transactionRef existe ET n'est pas vérifié
  const hasProof = !!(nextPayment.value.proofFile && nextPayment.value.proofFile.trim() !== '');
  const hasTransaction = !!(nextPayment.value.transactionRef && nextPayment.value.transactionRef.trim() !== '');
  const isNotVerified = nextPayment.value.verified === false;

  return (hasProof || hasTransaction) && isNotVerified;
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.student-dashboard {
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
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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

.header-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

/* Restriction Alert */
.restriction-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #f87171;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.restriction-alert .alert-icon {
  width: 48px;
  height: 48px;
  background: #dc2626;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.restriction-alert .alert-content {
  flex: 1;
}

.restriction-alert h3 {
  margin: 0 0 0.25rem 0;
  color: #dc2626;
  font-size: 1rem;
}

.restriction-alert p {
  margin: 0;
  color: #7f1d1d;
  font-size: 0.875rem;
}

.restriction-alert .alert-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background 0.3s;
}

.restriction-alert .alert-action:hover {
  background: #b91c1c;
}

/* Dashboard Content */
.dashboard-content {
  padding: 1.5rem 2rem 2rem;
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card.courses::before {
  background: var(--primary-color, #5086c1);
}

.stat-card.average::before {
  background: var(--secondary-color, #30a855);
}

.stat-card.fees::before {
  background: var(--warning, orange);
}

.stat-card.requests::before {
  background: var(--accent-color, #3498db);
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

.stat-card.courses .stat-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.stat-card.average .stat-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.stat-card.fees .stat-icon {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.stat-card.requests .stat-icon {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--gray, #6b7280);
}

.stat-trend {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.stat-trend.up {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.stat-trend.down {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gray-lighter, #e0e0e0);
}

.stat-progress .progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--warning, orange), var(--warning-light, #ffa502));
  border-radius: 0 2px 2px 0;
  transition: width 0.5s ease;
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
  box-shadow: var(--shadow-light, 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 8px rgba(0, 0, 0, 0.05));
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  min-height: 80px;
}

.timeline-time {
  width: 60px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-top: 0.5rem;
  transition: all 0.3s ease;
}

/* Temps des cours passés - grisé */
.timeline-item:has(.timeline-content.past) .timeline-time {
  opacity: 0.5;
}

.timeline-item:has(.timeline-content.past) .timeline-time .time-start,
.timeline-item:has(.timeline-content.past) .timeline-time .time-end {
  color: var(--gray, #6b7280);
}

/* Temps des cours en cours - vert */
.timeline-item:has(.timeline-content.ongoing) .timeline-time .time-start {
  color: var(--secondary-dark, #1e7a3d);
  font-weight: 700;
}

.timeline-item:has(.timeline-content.ongoing) .timeline-time .time-end {
  color: var(--secondary-color, #30a855);
}

.time-start {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-darker, #1f2937);
}

.time-end {
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
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
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
}

.course-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.course-prof,
.course-room {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--gray, #6b7280);
}

.course-prof svg,
.course-room svg {
  font-size: 0.9rem;
}

.empty-schedule {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--gray, #6b7280);
}

.empty-schedule svg {
  font-size: 2.5rem;
  color: var(--secondary-color, #30a855);
}

/* Assignments Section */
.assignments-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-lightest, #f8fafc);
  border-radius: 12px;
  transition: transform 0.3s;
}

.assignment-item:hover {
  transform: translateX(4px);
}

.assignment-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.date-day {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
}

.date-month {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--gray, #6b7280);
}

.assignment-content {
  flex: 1;
}

.assignment-type-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
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
  color: var(--warning-dark, #d35400);
}

.assignment-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
}

.assignment-module {
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
}

.assignment-countdown {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: #f3f4f6;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-dark, #4b5563);
}

.assignment-countdown.urgent {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.assignment-countdown.submitted {
  background: rgba(48, 168, 85, 0.15);
  color: var(--secondary-dark, #1e7a3d);
}

.empty-assignments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--tertiary-color, gray);
}

.empty-assignments svg {
  font-size: 2rem;
  color: var(--secondary-color, #30a855);
}

/* Grades Section */
.grades-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.grades-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--gray-lightest, #f8fafc);
  border-radius: 10px;
}

.grade-module {
  display: flex;
  flex-direction: column;
}

.module-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-darker, #1f2937);
}

.grade-type {
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
}

.grade-value {
  font-weight: 700;
  font-size: 1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
}

.grade-value.excellent {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.grade-value.good {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.grade-value.average {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.grade-value.low {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.empty-grades {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--gray, #6b7280);
}

/* Quick Actions */
.quick-actions-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.5rem;
  border-radius: 12px;
  background: var(--gray-lightest, #f8fafc);
  text-decoration: none;
  transition: all 0.3s;
}

.action-card:hover {
  background: var(--gray-lighter, #f1f5f9);
  transform: translateY(-2px);
}

.action-card span {
  font-size: 0.75rem;
  color: var(--gray-darker, #1f2937);
  text-align: center;
  font-weight: 500;
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.action-icon.blue {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.action-icon.purple {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.action-icon.green {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.action-icon.orange {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.action-icon.teal {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.action-icon.gray {
  background: var(--tertiary-extra-light, #f5f5f5);
  color: var(--tertiary-dark, #5e5e5e);
}

/* Fees Section */
.fees-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.fees-overview {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1rem;
}

.fees-progress-ring {
  position: relative;
  width: 100px;
  height: 100px;
}

.fees-progress-ring svg {
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 10;
}

.progress-fill {
  fill: none;
  stroke: url(#gradient) #10b981;
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.5s ease;
}

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
  display: block;
}

.progress-label {
  font-size: 0.7rem;
  color: var(--gray, #6b7280);
}

.fees-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.fee-row:last-child {
  border-bottom: none;
}

.fee-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--gray, #6b7280);
}

.fee-label svg {
  font-size: 1rem;
}

.fee-row.paid .fee-label svg {
  color: var(--secondary-color, #30a855);
}

.fee-row.remaining .fee-label svg {
  color: var(--warning, orange);
}

.fee-value {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--gray-darker, #1f2937);
}

.next-payment-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
}

.next-payment-alert.info {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.next-payment-alert.warning {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.next-payment-alert.overdue {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.next-payment-alert.pending-verification {
  background: rgba(59, 130, 246, 0.1);
  color: #1e40af;
  border-left: 4px solid #3b82f6;
}

.next-payment-alert svg {
  font-size: 1.25rem;
}

.next-payment-alert .alert-text {
  display: flex;
  flex-direction: column;
}

.next-payment-alert .alert-title {
  font-weight: 600;
}

.next-payment-alert .alert-detail {
  font-size: 0.75rem;
  opacity: 0.8;
}

.next-payment-alert .alert-reminder {
  font-size: 0.7rem;
  opacity: 0.9;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.next-payment-alert .alert-reminder svg {
  font-size: 0.9rem;
}

/* Notifications Section */
.notifications-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
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

.notif-item.course .notif-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.notif-item.exam .notif-icon {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.notif-item.grade .notif-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
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
  color: var(--gray, #6b7280);
}

/* Requests Section */
.requests-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.request-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--gray-lightest, #f8fafc);
  border-radius: 10px;
}

.request-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.request-icon.pending {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.request-icon.approved {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.request-icon.rejected {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.request-icon.ready {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.request-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.request-type {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--gray-darker, #1f2937);
}

.request-date {
  font-size: 0.7rem;
  color: var(--gray, #6b7280);
}

.request-status {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.request-status.pending {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.request-status.approved {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.request-status.rejected {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.request-status.ready {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.empty-requests {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--gray, #6b7280);
}

/* Responsive */
@media (max-width: 1200px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
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

  .fees-overview {
    flex-direction: column;
  }

  .restriction-alert {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>
