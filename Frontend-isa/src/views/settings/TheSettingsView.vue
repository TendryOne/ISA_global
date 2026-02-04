<template>
  <TheHeader />
  <div class="university-profile">
    <!-- Header avec bannière universitaire -->
    <div class="profile-header">
      <div class="student-identity">
        <div class="identity-photo">
          <img v-if="student.identityPhoto" :src="getDocumentUrl(student.identityPhoto)" alt="Photo étudiant">
          <div v-else class="photo-placeholder">
            <Icon icon="mdi:account-circle" />
          </div>
          <div class="verification-badge">
            <Icon icon="mdi:shield-check" />
          </div>
        </div>

        <div class="identity-info">
          <div class="identity-main">
            <h1 class="student-name">{{ userStore.currentUser?.name }} <span>{{
              userStore.currentUser?.firstName }}</span></h1>
            <div class="academic-id">
              <Icon icon="mdi:identifier" />
              <span>{{ userStore.currentUser?.matricule }}</span>
            </div>
          </div>

          <div class="identity-meta">
            <div class="meta-item" v-if="userStore.isStudent">
              <Icon icon="mdi:school" />
              <span>{{ (userStore.currentUser as StudentInterface).field}}</span>
            </div>
            <div class="meta-item">
              <Icon icon="mdi:account-tie" />
              <span>{{ userStore.currentUser?.role }}</span>
            </div>
            <div class="meta-item" v-if="userStore.isStudent">
              <Icon icon="mdi:calendar" />
              <span>Promotion {{ (userStore.currentUser as StudentInterface).promotionYear || "0000" }}</span>
            </div>
            <div class="meta-item" v-if="userStore.isStudent">
              <Icon icon="icon-park-outline:level" />
              <span>Niveau {{ (userStore.currentUser as StudentInterface).level || "L1" }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="profile-content">
      <!-- Menu latéral -->
      <div class="profile-sidebar">
        <div class="nav-group">
          <h3 class="nav-group-title">Profil Académique</h3>
          <nav class="sidebar-nav">
            <button class="nav-item" :class="{ active: activeSection === 'identity' }"
              @click="activeSection = 'identity'">
              <Icon icon="mdi:card-account-details" />
              <span>Identité</span>
            </button>
            <button class="nav-item" :class="{ active: activeSection === 'contact' }"
              @click="activeSection = 'contact'">
              <Icon icon="mdi:contacts" />
              <span>Coordonnées</span>
            </button>
            <button class="nav-item" :class="{ active: activeSection === 'documents' }"
              @click="activeSection = 'documents'" v-if="userStore.isStudent">
              <Icon icon="mdi:file-document-multiple" />
              <span>Documents</span>
            </button>
          </nav>
        </div>

        <div class="nav-group">
          <h3 class="nav-group-title">Paramètres du compte</h3>
          <nav class="sidebar-nav">
            <button class="nav-item" :class="{ active: activeSection === 'security' }"
              @click="activeSection = 'security'">
              <Icon icon="mdi:shield-lock" />
              <span>Sécurité du compte</span>
            </button>
            <button class="nav-item" :class="{ active: activeSection === 'data' }" @click="activeSection = 'data'">
              <Icon icon="mdi:database" />
              <span>Mes données</span>
            </button>
          </nav>
        </div>

        <div class="nav-group" v-if="!isAdmin">
          <h3 class="nav-group-title">Statistiques</h3>
          <nav class="sidebar-nav">
            <button class="nav-item" :class="{ active: activeSection === 'activity' }"
              @click="activeSection = 'activity'">
              <Icon icon="mdi:chart-box" />
              <span>Historique d'activité</span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Section active -->
      <div class="profile-main">
        <Transition name="fade" mode="out-in">
          <!-- Section Identité -->
          <IdentitySection v-if="activeSection === 'identity'" key="identity" />

          <!-- Section Contact -->
          <ContactSection v-else-if="activeSection === 'contact'" key="contact" />

          <!-- Section Documents -->
          <DocumentsSection v-else-if="activeSection === 'documents' && userStore.isStudent" key="documents" />

          <!-- Section Sécurité -->
          <SecuritySection v-else-if="activeSection === 'security'" key="security" />

          <!-- Section Données -->
          <DataSection v-else-if="activeSection === 'data'" key="data" />

          <!-- Section Activité -->
          <div v-else-if="activeSection === 'activity' && !isAdmin" key="activity" class="activity-section">
            <div class="section-header">
              <h2 class="section-title">Historique d'activité</h2>
              <p class="section-description">Visualisez votre activité sur la plateforme tout au long de l'année</p>
            </div>
            <ActivityYearView :user="useMyUserStore().currentUser!" />
          </div>

        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import TheHeader from '@/components/header/TheHeader.vue'
import SecuritySection from '@/components/Settings/profile/security/SecuritySection.vue'
import IdentitySection from '@/components/Settings/profile/identity/IdentitySection.vue'
import ContactSection from '@/components/Settings/profile/contact/ContactSection.vue'
import DocumentsSection from '@/components/Settings/profile/documents/DocumentsSection.vue'
import DataSection from '@/components/Settings/profile/data/DataSection.vue'
import ActivityYearView from '@/components/heatmap/ActivityYearView.vue'
import { useMyUserStore } from '@/stores/userStore'
import type StudentInterface from '@/interfaces/student.intefaces'

const userStore = useMyUserStore();
const activeSection = ref('identity')
const student = userStore.currentUser as StudentInterface

// Vérifier si l'utilisateur est admin ou super admin
const isAdmin = computed(() => {
  return userStore.currentUser?.role.includes('admin') ||
    userStore.currentUser?.role.includes('super admin')
})

const getDocumentUrl = (url: string | undefined): string => {
  if (!url) return '';
  return `/api/v1/document?fullPath=${url}`;
};

</script>

<style scoped>
.university-profile {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  color: #212529;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

/* Header */
.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.student-identity {
  display: flex;
  padding: 2rem;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.identity-photo {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.identity-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-placeholder svg {
  width: 80%;
  height: 80%;
  color: rgba(255, 255, 255, 0.3);
}

.verification-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: var(--success);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.identity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
}

.identity-main {
  margin-bottom: 0.5rem;
}

.student-name {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.student-name span {
  font-weight: 400;
  opacity: 0.9;
}

.academic-id {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
  gap: 0.5rem;
}

.identity-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  background-color: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* Contenu principal */
.profile-content {
  display: flex;
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.profile-sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 0;
  height: fit-content;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.nav-group {
  padding: 0 1rem;
}

.nav-group-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-dark);
  margin: 0 0 0.75rem 0.5rem;
  font-weight: 600;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  text-align: left;
  background: none;
  border: none;
  color: var(--gray-dark);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9375rem;
}

.nav-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-item:hover {
  background-color: var(--tertiary-extra-light);
  color: var(--gray-darker);
}

.nav-item.active {
  background-color: var(--primary-extra-light);
  color: var(--primary-color);
  font-weight: 500;
}

.profile-main {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 280px);
}

/* Section Activité */
.activity-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
}

.section-description {
  color: var(--gray-dark);
  margin: 0;
  font-size: 0.95rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Coming soon placeholder */
.payment-section {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.coming-soon-icon {
  font-size: 4rem;
  color: var(--primary-light);
  margin-bottom: 1.5rem;
}

.coming-soon h3 {
  font-size: 1.5rem;
  color: var(--gray-darker);
  margin: 0 0 0.5rem 0;
}

.coming-soon p {
  font-size: 0.9375rem;
  color: var(--gray-dark);
  margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-content {
    flex-direction: column;
  }

  .profile-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    position: relative;
    max-height: none;
    flex-direction: row;
    padding: 1rem;
    gap: 1rem;
    overflow-x: auto;
  }

  .nav-group {
    padding: 0;
    flex-shrink: 0;
  }

  .nav-group-title {
    display: none;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 0.5rem;
  }

  .nav-item {
    white-space: nowrap;
    padding: 0.625rem 1rem;
  }

  .nav-item span {
    display: none;
  }

  .nav-item svg {
    margin: 0;
  }

  .profile-main {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .student-identity {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }

  .identity-info {
    align-items: center;
  }

  .identity-meta {
    justify-content: center;
  }

  .student-name {
    font-size: 1.5rem;
  }
}
</style>
