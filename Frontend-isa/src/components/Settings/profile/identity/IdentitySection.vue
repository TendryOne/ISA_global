<template>
  <div class="identity-section">
    <div class="section-header">
      <h2>
        <Icon icon="mdi:card-account-details" /> Informations personnelles
      </h2>
      <div class="header-badge">
        <Icon icon="mdi:shield-check" />
        <span>Vérifié</span>
      </div>
    </div>

    <div class="section-content">
      <div class="info-grid">
        <!-- État civil -->
        <div class="info-group">
          <div class="group-header">
            <Icon icon="mdi:account" />
            <h3>État civil</h3>
          </div>
          <div class="info-cards">
            <div class="info-card">
              <label>Nom</label>
              <div class="value-display locked">
                <span>{{ userStore.currentUser?.name || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Prénom</label>
              <div class="value-display locked">
                <span>{{ userStore.currentUser?.firstName || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Date de naissance</label>
              <div class="value-display locked">
                <span>{{ formatDate((userStore.currentUser as StudentInterface)?.birthDate) }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Lieu de naissance</label>
              <div class="value-display locked">
                <span>{{ (userStore.currentUser as StudentInterface)?.birthPlace || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Genre</label>
              <div class="value-display locked">
                <span>{{ getGenderLabel(userStore.currentUser?.gender) }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>CIN/Passport</label>
              <div class="value-display locked">
                <span>{{ (userStore.currentUser as StudentInterface)?.cin || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
          </div>
        </div>

        <!-- Informations académiques (pour les étudiants) -->
        <div class="info-group" v-if="userStore.isStudent">
          <div class="group-header">
            <Icon icon="mdi:school" />
            <h3>Parcours académique</h3>
          </div>
          <div class="info-cards">
            <div class="info-card">
              <label>Matricule</label>
              <div class="value-display locked">
                <span>{{ userStore.currentUser?.matricule || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Filière</label>
              <div class="value-display locked">
                <span>{{ (userStore.currentUser as StudentInterface)?.field || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
            <div class="info-card">
              <label>Niveau</label>
              <div class="value-display locked">
                <span>{{ (userStore.currentUser as StudentInterface)?.level || 'Non renseigné' }}</span>
                <Icon icon="mdi:lock" class="lock-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Note informative -->
      <div class="info-notice">
        <Icon icon="mdi:information" />
        <p>
          Ces informations sont verrouillées pour des raisons de sécurité.
          Pour toute modification, veuillez contacter le service de scolarité.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type StudentInterface from '@/interfaces/student.intefaces';
import { useMyUserStore } from '@/stores/userStore';
import { Icon } from '@iconify/vue';

const userStore = useMyUserStore();

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Non renseigné';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getGenderLabel = (gender: string | undefined) => {
  if (!gender) return 'Non renseigné';
  const genderMap: Record<string, string> = {
    'male': 'Masculin',
    'female': 'Féminin',
    'M': 'Masculin',
    'F': 'Féminin'
  };
  return genderMap[gender] || gender;
};
</script>

<style scoped>
.identity-section {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(var(--secondary-rgb), 0.05));
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-dark);
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--success-extra-light);
  color: var(--success-dark);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.section-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-group {
  background: var(--tertiary-extra-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.group-header svg {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.group-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: white;
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-card label {
  display: block;
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--gray-dark);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.value-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  color: var(--gray-darker);
}

.value-display.locked {
  color: var(--gray-dark);
}

.lock-icon {
  color: var(--gray-light);
  font-size: 0.875rem;
}

.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--primary-extra-light);
  border-radius: var(--radius);
  border-left: 3px solid var(--primary-color);
}

.info-notice svg {
  color: var(--primary-color);
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.info-notice p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-darker);
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
