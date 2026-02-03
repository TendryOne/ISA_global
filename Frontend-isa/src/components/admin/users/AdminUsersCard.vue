<template>
  <div class="elite-modal-overlay" @click.self="closeModal">
    <div class="elite-modal-container">
      <!-- Header avec effet verre -->
      <div class="modal-header-glass">
        <div class="header-content">
          <div class="title-wrapper">
            <h2 class="modal-title">{{ user.firstName }} {{ user.name }}</h2>
            <div class="user-badges">
              <div class="badge role-badge" :class="user.role">
                <Icon :icon="getRoleIcon(user.role)" width="16" height="16" />
                {{ user.role }}
              </div>
              <div class="badge id-badge">
                <Icon icon="mdi:identifier" width="14" height="14" />
                {{ user.matricule }}
              </div>
            </div>
          </div>
        </div>
        <button class="close-button-luxury" @click="closeModal">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="modal-content-luxury">
        <!-- Avatar et informations principales -->
        <div class="luxury-card user-profile-card">
          <div class="card-border-glow"></div>
          <div class="card-content">
            <div class="user-avatar-section">
              <div class="user-avatar-luxury">
                <Icon :icon="user.gender === 'female' ? 'mdi:account-circle' : 'mdi:account-circle-outline'" width="80"
                  height="80" />
              </div>
              <div class="user-main-info">
                <h3 class="user-fullname">{{ user.firstName }} {{ user.name }}</h3>
                <p class="user-role">{{ user.role }}</p>
              </div>
            </div>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <Icon icon="mdi:email-outline" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ user.email }}</div>
                  <div class="stat-label">Email</div>
                </div>
              </div>

              <div class="stat-item" v-if="user.phone">
                <div class="stat-icon">
                  <Icon icon="mdi:phone" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ user.phone }}</div>
                  <div class="stat-label">Téléphone</div>
                </div>
              </div>

              <div class="stat-item" v-if="user.function">
                <div class="stat-icon">
                  <Icon icon="mdi:briefcase-outline" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ user.function }}</div>
                  <div class="stat-label">Fonction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations détaillées -->
        <div class="section-luxury">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:information-outline" width="22" height="22" />
            Informations Personnelles
          </h3>

          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-label">
                <Icon icon="mdi:card-account-details-outline" width="18" height="18" />
                Matricule
              </div>
              <div class="detail-value">{{ user.matricule }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">
                <Icon icon="mdi:gender-male-female" width="18" height="18" />
                Genre
              </div>
              <div class="detail-value">{{ user.gender === 'male' ? 'Homme' : 'Femme' }}</div>
            </div>

            <div class="detail-item" v-if="user.address">
              <div class="detail-label">
                <Icon icon="mdi:map-marker-outline" width="18" height="18" />
                Adresse
              </div>
              <div class="detail-value">{{ user.address }}</div>
            </div>

            <div class="detail-item">
              <div class="detail-label">
                <Icon icon="mdi:calendar" width="18" height="18" />
                Date de création
              </div>
              <div class="detail-value">{{ formatDate(user.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Rôles et permissions -->
        <div class="section-luxury">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:shield-account-outline" width="22" height="22" />
            Rôles et Permissions
          </h3>

          <div class="roles-container">
            <div class="role-pill" :class="user.role">
              <Icon :icon="getRoleIcon(role)" width="16" height="16" />
              {{ user.role }}
            </div>
          </div>
        </div>
        <div class="section-luxury">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:history" width="22" height="22" />
            Suivi d'Activité
          </h3>

          <div>
            <ActivityYearView :user="user" />
          </div>
        </div>

      </div>

      <!-- Actions -->
      <div class="modal-actions-luxury">
        <button class="action-btn-luxury secondary" @click="closeModal">
          <Icon icon="mdi:close" width="18" height="18" />
          Fermer
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type AdminInterface from '@/interfaces/admin.interface';
import ActivityYearView from '@/components/heatmap/ActivityYearView.vue';
// Interface utilisateur


// Props avec valeur par défaut
const props = defineProps<{
  user: AdminInterface
}>()

const emit = defineEmits(['close', 'edit'])

const closeModal = () => {
  emit('close')
}



const getRoleLabel = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrateur',
    'student': 'Étudiant',
    'professor': 'Professeur',
    'superAdmin': 'Super Administrateur'
  }
  return roleMap[role] || role
}

const getRoleIcon = (role: string) => {
  const iconMap: Record<string, string> = {
    'admin': 'mdi:shield-account',
    'student': 'mdi:school-outline',
    'professor': 'mdi:teach',
    'superAdmin': 'mdi:shield-crown'
  }
  return iconMap[role] || 'mdi:account'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* Variables de couleurs */
:root {
  --primary-color: #4361ee;
  --primary-dark: #3a56d4;
  --primary-darker: #3046b9;
  --primary-light: #627efe;
  --primary-lighter: #829dff;
  --primary-lightest: #eef2ff;
  --gray-darker: #2d3748;
  --gray-dark: #4a5568;
  --gray: #718096;
  --gray-light: #e2e8f0;
  --gray-lighter: #f1f5f9;
  --gray-lightest: #f8fafc;
  --danger: #e53e3e;
  --success: #38a169;
}

.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 22, 31, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(15px);
  animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.elite-modal-container {
  width: 100%;
  max-width: 800px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header-glass {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary-darker), var(--primary-color));
  color: white;
  position: relative;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff, #e6e9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.role-badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.role-badge.admin {
  background: rgba(103, 58, 183, 0.7);
}

.role-badge.superAdmin {
  background: rgba(233, 30, 99, 0.7);
}

.role-badge.student {
  background: rgba(0, 150, 136, 0.7);
}

.role-badge.professor {
  background: rgba(3, 169, 244, 0.7);
}

.id-badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.close-button-luxury {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: 1rem;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.close-button-luxury:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.modal-content-luxury {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.luxury-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.user-profile-card {
  text-align: center;
}

.card-border-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(67, 97, 238, 0.1);
  pointer-events: none;
}

.user-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.user-avatar-luxury {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-lightest), var(--primary-lighter));
  color: var(--primary-color);
  margin-bottom: 1rem;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-main-info {
  text-align: center;
}

.user-fullname {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-darker);
  margin: 0 0 0.25rem 0;
}

.user-role {
  color: var(--gray);
  margin: 0;
  font-size: 0.95rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--primary-lightest);
  border-radius: 12px;
  border: 1px solid var(--primary-lighter);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 10px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-darker);
  line-height: 1.2;
  word-break: break-word;
}

.stat-label {
  text-align: left;
  font-size: 0.8rem;
  color: var(--gray);
  font-weight: 500;
}

.section-luxury {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-title-luxury {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-light);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: var(--gray-lightest);
  border-radius: 10px;
  border: 1px solid var(--gray-lighter);
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--gray);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.detail-value {
  font-weight: 600;
  color: var(--gray-darker);
  word-break: break-word;
}

.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--primary-lightest);
  color: var(--primary-dark);
  border: 1px solid var(--primary-lighter);
}

.role-pill.admin {
  background: rgba(103, 58, 183, 0.1);
  color: #673ab7;
  border-color: rgba(103, 58, 183, 0.2);
}

.role-pill.superAdmin {
  background: rgba(233, 30, 99, 0.1);
  color: #e91e63;
  border-color: rgba(233, 30, 99, 0.2);
}

.role-pill.student {
  background: rgba(0, 150, 136, 0.1);
  color: #009688;
  border-color: rgba(0, 150, 136, 0.2);
}

.role-pill.professor {
  background: rgba(3, 169, 244, 0.1);
  color: #03a9f4;
  border-color: rgba(3, 169, 244, 0.2);
}

.modal-actions-luxury {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(10px);
}

.action-btn-luxury {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid;
}

.action-btn-luxury.secondary {
  background: white;
  border-color: var(--gray-light);
  color: var(--gray-dark);
}

.action-btn-luxury.secondary:hover {
  background: var(--gray-lightest);
  border-color: var(--gray);
}

.action-btn-luxury.primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
}

.action-btn-luxury.primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(67, 97, 238, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(15px);
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .elite-modal-container {
    max-width: 95%;
    margin: 1rem;
  }

  .modal-header-glass {
    padding: 1.5rem;
  }

  .modal-content-luxury {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .roles-container {
    justify-content: center;
  }

  .user-avatar-luxury {
    width: 80px;
    height: 80px;
  }

  .modal-actions-luxury {
    flex-direction: column;
  }

  .action-btn-luxury {
    width: 100%;
    justify-content: center;
  }
}
</style>
