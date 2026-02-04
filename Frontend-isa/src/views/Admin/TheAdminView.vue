<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-info">
          <h1>
            <Icon icon="material-symbols:dashboard-rounded" class="header-icon" />
            <span>Tableau de Bord</span>
          </h1>
          <p class="header-subtitle">
            Bienvenue, <strong>{{ userStore.currentUser?.firstName }} {{ userStore.currentUser?.name }}</strong>
            <span class="role-badge" :class="isSuperAdmin ? 'super-admin' : 'admin'">
              {{ isSuperAdmin ? 'Super Admin' : 'Administrateur' }}
            </span>
          </p>
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
      <!-- KPIs Principaux -->
      <section class="kpi-section">
        <h2 class="section-title">
          <Icon icon="material-symbols:analytics" />
          <span>Vue d'ensemble</span>
        </h2>
        <div class="kpi-grid">
          <div class="kpi-card students">
            <div class="kpi-icon">
              <Icon icon="material-symbols:school-rounded" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ adminDashboard.counts.students }}</span>
              <span class="kpi-label">Étudiants inscrits</span>
            </div>
            <!-- <div class="kpi-trend up">
              <Icon icon="material-symbols:trending-up" />
              <span>+{{ adminDashboard.counts.newStudentsThisMonth }}</span>
            </div> -->
          </div>

          <div class="kpi-card teachers">
            <div class="kpi-icon">
              <Icon icon="fluent:person-ribbon-20-filled" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ adminDashboard.counts.professors }}</span>
              <span class="kpi-label">Enseignants</span>
            </div>
          </div>

          <div class="kpi-card unverified">
            <div class="kpi-icon">
              <Icon icon="material-symbols:person-alert-rounded" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ adminDashboard.counts.unverifiedStudents }}</span>
              <span class="kpi-label">Inscrits non vérifiés</span>
            </div>
            <RouterLink to="/admin/subscribed" class="kpi-action">
              Voir
              <Icon icon="material-symbols:arrow-forward" />
            </RouterLink>
          </div>

          <div class="kpi-card pending">
            <div class="kpi-icon">
              <Icon icon="material-symbols:pending-actions" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ adminDashboard.counts.pendingStudents }}</span>
              <span class="kpi-label">Admissions en attente</span>
            </div>
            <RouterLink to="/admin/pre-inscription" class="kpi-action">
              Voir
              <Icon icon="material-symbols:arrow-forward" />
            </RouterLink>
          </div>

          <div class="kpi-card payments">
            <div class="kpi-icon">
              <Icon icon="material-symbols:payments-rounded" />
            </div>
            <div class="kpi-content">
              <span class="kpi-value">{{ adminDashboard.counts.pendingPayments }}</span>
              <span class="kpi-label">Paiements à valider</span>
            </div>
            <RouterLink to="/admin/suivi-paiements" class="kpi-action">
              Voir
              <Icon icon="material-symbols:arrow-forward" />
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Section Admin & SuperAdmin -->
      <div class="main-grid">
        <!-- Colonne gauche - Admin -->
        <div class="left-column">
          <!-- Actions rapides Admin -->
          <section class="quick-actions-section">
            <h2 class="section-title">
              <Icon icon="material-symbols:bolt" />
              <span>Actions rapides</span>
              <span class="badge admin-badge">Admin</span>
            </h2>
            <div class="quick-actions-grid">
              <RouterLink to="/admin/pre-inscription" class="action-card">
                <div class="action-icon blue">
                  <Icon icon="material-symbols:person-add-rounded" />
                </div>
                <span>Pré-inscriptions</span>
              </RouterLink>

              <RouterLink to="/admin/admission" class="action-card">
                <div class="action-icon green">
                  <Icon icon="mdi:account-check-outline" />
                </div>
                <span>Admissions</span>
              </RouterLink>

              <RouterLink to="/admin/schedule" class="action-card">
                <div class="action-icon purple">
                  <Icon icon="material-symbols:calendar-month-rounded" />
                </div>
                <span>Emploi du temps</span>
              </RouterLink>

              <RouterLink to="/admin/fees" class="action-card">
                <div class="action-icon orange">
                  <Icon icon="material-symbols:money-bag" />
                </div>
                <span>Frais scolarité</span>
              </RouterLink>

              <RouterLink to="/admin/grades" class="action-card">
                <div class="action-icon teal">
                  <Icon icon="mdi:note-outline" />
                </div>
                <span>Notes</span>
              </RouterLink>

              <RouterLink to="/admin/promotions" class="action-card">
                <div class="action-icon pink">
                  <Icon icon="mdi:school-outline" />
                </div>
                <span>Promotions</span>
              </RouterLink>

              <RouterLink to="/admin/users/students" class="action-card">
                <div class="action-icon indigo">
                  <Icon icon="material-symbols:group-rounded" />
                </div>
                <span>Étudiants</span>
              </RouterLink>

              <RouterLink to="/admin/users/teachers" class="action-card">
                <div class="action-icon cyan">
                  <Icon icon="fluent:person-ribbon-20-filled" />
                </div>
                <span>Enseignants</span>
              </RouterLink>
            </div>
          </section>

          <!-- Dernières admissions -->
          <section class="recent-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:recent-actors" />
                <span>Dernières pré-inscriptions</span>
              </h2>
              <RouterLink to="/admin/pre-inscription" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="recent-list">
              <div v-for="admission in adminDashboard.recentPendingStudents" :key="admission._id" class="recent-item">
                <div class="recent-avatar" :style="{ background: getAvatarGradient(admission.lastName) }">
                  {{ getInitials(admission.lastName, admission.firstName) }}
                </div>
                <div class="recent-info">
                  <span class="recent-name">{{ admission.lastName }} {{ admission.firstName }}</span>
                  <span class="recent-meta">{{ admission.field }} • {{ admission.levelAsked }}</span>
                </div>
                <div class="recent-status" :class="admission.status">
                  {{ getStatusLabel(admission.status) }}
                </div>
              </div>
              <div v-if="adminDashboard.recentPendingStudents.length === 0" class="empty-recent">
                <Icon icon="material-symbols:inbox-outline" />
                <span>Aucune pré-inscription récente</span>
              </div>
            </div>
          </section>

          <!-- Statistiques financières -->
          <section class="finance-section">
            <h2 class="section-title">
              <Icon icon="material-symbols:account-balance-wallet" />
              <span>Finances</span>
            </h2>
            <div class="finance-cards">
              <div class="finance-card collected">
                <div class="finance-icon">
                  <Icon icon="material-symbols:check-circle" />
                </div>
                <div class="finance-content">
                  <span class="finance-label">Collectés</span>
                  <span class="finance-value">{{ formatAmount(adminDashboard.finance.collected) }} Ar</span>
                </div>
              </div>
              <div class="finance-card pending">
                <div class="finance-icon">
                  <Icon icon="material-symbols:schedule" />
                </div>
                <div class="finance-content">
                  <span class="finance-label">En attente</span>
                  <span class="finance-value">{{ formatAmount(adminDashboard.finance.pending) }} Ar</span>
                </div>
              </div>
              <div class="finance-card overdue">
                <div class="finance-icon">
                  <Icon icon="material-symbols:warning" />
                </div>
                <div class="finance-content">
                  <span class="finance-label">En retard</span>
                  <span class="finance-value">{{ formatAmount(adminDashboard.finance.overdue) }} Ar</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Colonne droite -->
        <div class="right-column">
          <!-- Section SuperAdmin uniquement -->
          <section v-if="isSuperAdmin" class="superadmin-section">
            <h2 class="section-title">
              <Icon icon="material-symbols:shield-person" />
              <span>Super Admin</span>
              <span class="badge superadmin-badge">Exclusif</span>
            </h2>

            <div class="superadmin-actions">
              <RouterLink to="/admin/bug-reports" class="superadmin-card bugs">
                <div class="superadmin-icon">
                  <Icon icon="mdi:bug-outline" />
                </div>
                <div class="superadmin-content">
                  <span class="superadmin-title">Rapports de Bugs</span>
                  <span class="superadmin-count" v-if="adminDashboard.counts.unresolvedBugs > 0">
                    {{ adminDashboard.counts.unresolvedBugs }} nouveaux
                  </span>
                </div>
                <Icon icon="material-symbols:arrow-forward" class="superadmin-arrow" />
              </RouterLink>

              <RouterLink to="/admin/logs" class="superadmin-card logs">
                <div class="superadmin-icon">
                  <Icon icon="material-symbols:list-alt-outline" />
                </div>
                <div class="superadmin-content">
                  <span class="superadmin-title">Logs Techniques</span>
                  <span class="superadmin-desc">Surveillance système</span>
                </div>
                <Icon icon="material-symbols:arrow-forward" class="superadmin-arrow" />
              </RouterLink>

              <RouterLink to="/admin/settings" class="superadmin-card settings">
                <div class="superadmin-icon">
                  <Icon icon="material-symbols:settings-rounded" />
                </div>
                <div class="superadmin-content">
                  <span class="superadmin-title">Paramètres Système</span>
                  <span class="superadmin-desc">Configuration globale</span>
                </div>
                <Icon icon="material-symbols:arrow-forward" class="superadmin-arrow" />
              </RouterLink>

              <RouterLink to="/admin/users/departments" class="superadmin-card departments">
                <div class="superadmin-icon">
                  <Icon icon="material-symbols:badge-outline-rounded" />
                </div>
                <div class="superadmin-content">
                  <span class="superadmin-title">Personnel Administratif</span>
                  <span class="superadmin-count">{{ adminDashboard.counts.admins }} utilisateurs</span>
                </div>
                <Icon icon="material-symbols:arrow-forward" class="superadmin-arrow" />
              </RouterLink>
            </div>

            <!-- Activité récente SuperAdmin -->
            <div class="activity-log">
              <h3 class="subsection-title">
                <Icon icon="material-symbols:history" />
                <span>Activité récente</span>
                <span v-if="adminDashboard.recentActivities.length > 0" class="activity-badge">{{
                  adminDashboard.recentActivities.length }}</span>
              </h3>
              <div class="activity-list">
                <div v-for="(activity, index) in adminDashboard.recentActivities" :key="index" class="activity-item">
                  <div class="activity-left">
                    <div class="activity-icon" >
                      <Icon :icon="'material-symbols:info'" />
                    </div>
                    <div class="activity-line"></div>
                  </div>
                  <div class="activity-right">
                    <div class="activity-content">
                      <span class="activity-text">{{ activity.action }}</span>
                      <span class="activity-time">
                        <Icon icon="material-symbols:schedule" />
                        {{ formatRelativeTime(activity.createdAt) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-if="adminDashboard.recentActivities.length === 0" class="empty-activity">
                  <Icon icon="material-symbols:check-circle" />
                  <span>Aucune activité récente</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Notifications pour tous les admins -->
          <section class="notifications-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:notifications-active-rounded" />
                <span>Notifications</span>
                <span v-if="notificationStore.unseenCount > 0" class="notif-count">{{ notificationStore.unseenCount
                }}</span>
              </h2>

            </div>
            <div class="notifications-list">
              <div v-for="notif in notifications.slice(0, 5)" :key="notif._id" class="notif-item" :class="[
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

          <!-- Demandes administratives -->
          <section class="requests-section">
            <div class="section-header">
              <h2 class="section-title">
                <Icon icon="material-symbols:assignment-outline" />
                <span>Demandes administratives</span>
              </h2>
              <RouterLink to="/admin/administrative-requests" class="see-all">
                Voir tout
                <Icon icon="material-symbols:arrow-forward" />
              </RouterLink>
            </div>
            <div class="requests-summary">
              <div class="request-stat">
                <span class="stat-value">{{ adminDashboard.administrativeRequests.pending }}</span>
                <span class="stat-label">En attente</span>
              </div>
              <div class="request-stat">
                <span class="stat-value">{{ adminDashboard.administrativeRequests.inProgress }}</span>
                <span class="stat-label">En cours</span>
              </div>
              <div class="request-stat">
                <span class="stat-value">{{ adminDashboard.administrativeRequests.cancelled }}</span>
                <span class="stat-label">Refusées</span>
              </div>
            </div>
          </section>

          <!-- Répartition par filière -->
          <section class="distribution-section">
            <h2 class="section-title">
              <Icon icon="material-symbols:pie-chart" />
              <span>Répartition étudiants</span>
            </h2>
            <div class="distribution-bars">
              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Informatique</span>
                  <span class="distribution-count">{{ adminDashboard.studentsDistribution.informatique }}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill info" :style="{ width: getDistributionPercent('informatique') + '%' }">
                  </div>
                </div>
              </div>
              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">Gestion</span>
                  <span class="distribution-count">{{ adminDashboard.studentsDistribution.gestion }}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill gestion" :style="{ width: getDistributionPercent('gestion') + '%' }">
                  </div>
                </div>
              </div>
              <div class="distribution-item">
                <div class="distribution-header">
                  <span class="distribution-label">BTP</span>
                  <span class="distribution-count">{{ adminDashboard.studentsDistribution.btp }}</span>
                </div>
                <div class="distribution-bar">
                  <div class="distribution-fill btp" :style="{ width: getDistributionPercent('btp') + '%' }"></div>
                </div>
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
import axios from 'axios';
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface';
import type { ReportInterface } from '@/interfaces/report.interface';
import { UseNotificationStore } from '@/stores/notificationStore';
import { storeToRefs } from 'pinia';
import type { NotificationInterface } from '@/interfaces/notification.interface';

const userStore = useMyUserStore();
const router = useRouter();

// États
const loading = ref(false);
const errorServer = ref('');

// Vérification du rôle SuperAdmin
const isSuperAdmin = computed(() => {
  return userStore.currentUser?.role?.includes('superAdmin') ?? false;
});

interface admindahsboardResponse {
  counts: {
    unverifiedStudents: number;
    students: number;
    professors: number;
    pendingStudents: number;
    pendingPayments: number;
    unresolvedBugs: number;
    admins: number;
  }
  finance: {
    collected: number;
    pending: number;
    overdue: number;
  }

  recentPendingStudents: Array<Pick<UserPendingInterface, '_id' | 'lastName' | 'firstName' | 'field' | 'levelAsked' | 'status' | 'inscriptionId' | 'createdAt'>>;
  recentActivities: Array<ReportInterface>;
  administrativeRequests: {
    pending: number;
    approved: number;
    inProgress: number;
    cancelled: number;
    rejected: number;
  },
  studentsDistribution: {
    informatique: number;
    gestion: number;
    btp: number;
  }
}

const adminDashboard = ref<admindahsboardResponse>({
  counts: {
    unverifiedStudents: 0,
    admins: 0,
    students: 0,
    professors: 0,
    pendingStudents: 0,
    pendingPayments: 0,
    unresolvedBugs: 0
  },
  finance: {
    collected: 0,
    pending: 0,
    overdue: 0
  },
  recentPendingStudents: [],
  recentActivities: [],
  administrativeRequests: {
    pending: 0,
    approved: 0,
    inProgress: 0,
    cancelled: 0,
    rejected: 0
  },
  studentsDistribution: {
    informatique: 0,
    gestion: 0,
    btp: 0
  }
});

const notificationStore = UseNotificationStore();
const { notifications } = storeToRefs(notificationStore);



// Fetch des données du dashboard
const fetchDashboardData = async () => {
  loading.value = true;
  errorServer.value = '';


  try {

    const response = await axios.get<admindahsboardResponse>('/api/v1/dashboard/admin');
    adminDashboard.value = response.data;





  } catch (error: any) {
    errorServer.value = error.response?.data || 'Erreur lors du chargement des données';
  } finally {
    loading.value = false;
  }
};

// Fonctions utilitaires
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

const getInitials = (lastName: string, firstName: string) => {
  return `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase();
};

const getAvatarGradient = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a8edea, #fed6e3)'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Refusé'
  };
  return labels[status] || status;
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
    payment: 'material-symbols:payments',
    request: 'material-symbols:assignment',
    admission: 'material-symbols:person-add'
  };
  return icons[informationType || ''] || 'material-symbols:notifications';
};

const getNotifType = (informationType?: string, warningLevel?: "warning" | "info" | "critical" | null) => {
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



const getDistributionPercent = (field: string) => {
  const total = adminDashboard.value.studentsDistribution.informatique +
    adminDashboard.value.studentsDistribution.gestion +
    adminDashboard.value.studentsDistribution.btp;
  if (total === 0) return 0;

  const count = adminDashboard.value.studentsDistribution[field as keyof typeof adminDashboard.value.studentsDistribution];
  return (count / total) * 100;
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1440px;
  margin: 0 auto;
  font-family: 'Roboto', system-ui, sans-serif;
  min-height: 100vh;
  background: var(--tertiary-extra-light, #f5f5f5);
}

/* Header */
.dashboard-header {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-darker, #0e161e) 0%, var(--primary-dark, #1a252f) 50%, var(--primary-color, #5086c1) 100%);
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

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.header-icon {
  font-size: 2.5rem;
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.role-badge.super-admin {
  background: linear-gradient(135deg, var(--secondary-color, #30a855), var(--secondary-dark, #1e7a3d));
  color: white;
}

.header-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

/* Dashboard Content */
.dashboard-content {
  padding: 1.5rem 2rem 2rem;
}

/* Section Titles */
.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
  margin: 0 0 1rem 0;
}

.section-title svg {
  font-size: 1.25rem;
  color: var(--primary-color, #5086c1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header .section-title {
  margin: 0;
}

.see-all {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--primary-color, #5086c1);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: gap 0.3s;
}

.see-all:hover {
  gap: 0.5rem;
}

/* Badges */
.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-badge {
  background: var(--primary-color, #5086c1);
  color: white;
}

.superadmin-badge {
  background: linear-gradient(135deg, var(--secondary-color, #30a855), var(--secondary-dark, #1e7a3d));
  color: white;
}

/* KPI Section */
.kpi-section {
  margin-bottom: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.25rem;
}

.kpi-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.kpi-card.students::before {
  background: var(--primary-color, #5086c1);
}

.kpi-card.teachers::before {
  background: var(--secondary-color, #30a855);
}

.kpi-card.unverified::before {
  background: var(--error, #eb4d4b);
}

.kpi-card.pending::before {
  background: var(--warning, orange);
}

.kpi-card.payments::before {
  background: var(--accent-color, #3498db);
}

.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.kpi-card.students .kpi-icon {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.kpi-card.teachers .kpi-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.kpi-card.unverified .kpi-icon {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.kpi-card.pending .kpi-icon {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.kpi-card.payments .kpi-icon {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.kpi-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
}

.kpi-label {
  font-size: 0.875rem;
  color: var(--gray, #6b7280);
  margin-top: 0.25rem;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.kpi-trend.up {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.kpi-action {
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

.kpi-card:hover .kpi-action {
  opacity: 1;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 2rem;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
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
  font-size: 0.8rem;
  color: var(--gray-darker, #1f2937);
  text-align: center;
  font-weight: 500;
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.action-icon.blue {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.action-icon.green {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-color, #30a855);
}

.action-icon.purple {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-dark, #1a252f);
}

.action-icon.orange {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning, orange);
}

.action-icon.teal {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

.action-icon.pink {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.action-icon.indigo {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
}

.action-icon.cyan {
  background: rgba(52, 152, 219, 0.15);
  color: var(--accent-color, #3498db);
}

/* Recent Section */
.recent-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 10px;
  background: var(--gray-lightest, #f8fafc);
  transition: background 0.3s;
}

.recent-item:hover {
  background: var(--gray-lighter, #f1f5f9);
}

.recent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recent-name {
  font-weight: 600;
  color: var(--gray-darker, #1f2937);
  font-size: 0.9rem;
}

.recent-meta {
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
}

.recent-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.recent-status.pending {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.recent-status.approved {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.recent-status.rejected {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.empty-recent {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  color: var(--gray, #6b7280);
}

.empty-recent svg {
  font-size: 2rem;
  opacity: 0.5;
}

/* Finance Section */
.finance-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.finance-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.finance-card {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.finance-card.collected {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.finance-card.pending {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.finance-card.overdue {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.finance-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.finance-card.collected .finance-icon {
  background: var(--secondary-extra-light, #30a8552f);
  color: var(--secondary-dark, #1e7a3d);
}

.finance-card.pending .finance-icon {
  background: rgba(255, 165, 0, 0.15);
  color: var(--warning-dark, #d35400);
}

.finance-card.overdue .finance-icon {
  background: rgba(235, 77, 75, 0.15);
  color: var(--error, #eb4d4b);
}

.finance-content {
  display: flex;
  flex-direction: column;
}

.finance-label {
  font-size: 0.75rem;
  color: var(--gray-dark, #4b5563);
}

.finance-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
}

/* SuperAdmin Section */
.superadmin-section {
  background: linear-gradient(135deg, var(--primary-darker, #0e161e), var(--primary-dark, #1a252f));
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
}

.superadmin-section .section-title {
  color: white;
}

.superadmin-section .section-title svg {
  color: var(--secondary-color, #30a855);
}

.superadmin-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.superadmin-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  text-decoration: none;
  color: white;
  transition: all 0.3s;
}

.superadmin-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.superadmin-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.superadmin-card.bugs .superadmin-icon {
  background: rgba(235, 77, 75, 0.2);
  color: var(--error-light, #ff6b6b);
}

.superadmin-card.logs .superadmin-icon {
  background: rgba(80, 134, 193, 0.2);
  color: var(--primary-lighter, #5aa8e8);
}

.superadmin-card.settings .superadmin-icon {
  background: rgba(80, 134, 193, 0.2);
  color: var(--primary-light, #3498db);
}

.superadmin-card.departments .superadmin-icon {
  background: rgba(48, 168, 85, 0.2);
  color: var(--secondary-lighter, #6fd487);
}

.superadmin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.superadmin-title {
  font-weight: 600;
  font-size: 0.9rem;
}

.superadmin-count {
  font-size: 0.75rem;
  color: var(--secondary-color, #30a855);
}

.superadmin-desc {
  font-size: 0.75rem;
  opacity: 0.7;
}

.superadmin-arrow {
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.3s;
}

.superadmin-card:hover .superadmin-arrow {
  opacity: 1;
  transform: translateX(4px);
}

/* Activity Log */
.subsection-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-badge {
  background: rgba(48, 168, 85, 0.3);
  color: var(--secondary-lighter, #6fd487);
  padding: 0.15rem 0.45rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: auto;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity-item {
  display: flex;
  gap: 0;
  padding: 0;
  position: relative;
  animation: fadeInUp 0.4s ease-out;
}

.activity-item:last-child .activity-line {
  display: none;
}

.activity-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.activity-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  transform: scale(1.1);
}

.activity-icon.user {
  background: rgba(80, 134, 193, 0.25);
  color: var(--primary-lighter, #5aa8e8);
  box-shadow: 0 0 0 4px rgba(80, 134, 193, 0.1);
}

.activity-icon.settings {
  background: rgba(80, 134, 193, 0.25);
  color: var(--primary-light, #3498db);
  box-shadow: 0 0 0 4px rgba(80, 134, 193, 0.1);
}

.activity-icon.bug {
  background: rgba(48, 168, 85, 0.25);
  color: var(--secondary-lighter, #6fd487);
  box-shadow: 0 0 0 4px rgba(48, 168, 85, 0.1);
}

.activity-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  flex: 1;
  margin-top: 0.25rem;
}

.activity-right {
  flex: 1;
  padding: 0.5rem 0 1.25rem 1rem;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 10px;
  border-left: 3px solid rgba(48, 168, 85, 0.4);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-content {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: var(--secondary-color, #30a855);
}

.activity-text {
  font-size: 0.82rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.95);
}

.activity-time {
  font-size: 0.7rem;
  opacity: 0.6;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.activity-time svg {
  font-size: 0.75rem;
}

.empty-activity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
  opacity: 0.7;
  font-size: 0.85rem;
  justify-content: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Notifications Section */
.notifications-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.notifications-section .section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.notif-count {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(235, 77, 75, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.mark-all-read {
  background: var(--gray-lightest, #f8fafc);
  border: none;
  color: var(--gray-dark, #4b5563);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.mark-all-read:hover {
  background: var(--primary-extra-light, #5087c12f);
  color: var(--primary-color, #5086c1);
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

.notif-action {
  background: transparent;
  border: none;
  color: var(--gray, #6b7280);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0;
  font-size: 1rem;
}

.notif-item:hover .notif-action {
  opacity: 1;
}

.notif-action:hover {
  background: var(--gray-lightest, #f8fafc);
  color: var(--error, #eb4d4b);
}

.empty-notif {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: var(--gray, #6b7280);
}

.empty-notif svg {
  font-size: 3rem;
  opacity: 0.3;
}

/* Requests Section */
.requests-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.requests-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.request-stat {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 10px;
  background: var(--gray-lightest, #f8fafc);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-darker, #1f2937);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray, #6b7280);
}

/* Distribution Section */
.distribution-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distribution-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-darker, #1f2937);
}

.distribution-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray, #6b7280);
}

.distribution-bar {
  height: 8px;
  background: var(--gray-lighter, #e5e7eb);
  border-radius: 4px;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.distribution-fill.info {
  background: linear-gradient(90deg, var(--primary-color, #5086c1), var(--primary-lighter, #5aa8e8));
}

.distribution-fill.gestion {
  background: linear-gradient(90deg, var(--secondary-color, #30a855), var(--secondary-lighter, #6fd487));
}

.distribution-fill.btp {
  background: linear-gradient(90deg, var(--warning, orange), var(--warning-light, #ffa502));
}

/* Responsive */
@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    height: 140px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.5rem 1.25rem;
  }

  .header-info h1 {
    font-size: 1.5rem;
  }

  .header-date {
    display: none;
  }

  .dashboard-content {
    padding: 1rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .finance-cards {
    grid-template-columns: 1fr;
  }

  .requests-summary {
    grid-template-columns: 1fr;
  }
}
</style>