<template>
  <div class="module-item-luxury" :class="{ 'completed': isCompleted }">
    <div class="luxury-card">
      <!-- En-tête avec titre et badge de statut -->
      <div class="module-header">
        <div class="title-section">
          <h3 class="module-title">{{ module.title }}</h3>
          <span class="module-code">{{ module.code }}</span>
        </div>
        <div class="status-badge" :class="statusClass">
          {{ statusText }}
        </div>
      </div>

      <!-- Barre de progression élégante -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Progression</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="elegant-progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="hours-info">
          <span>{{ module.hoursDone || 0 }}h consommées sur {{ module.hoursPlanned }}h totales</span>
        </div>
      </div>

      <!-- Détails du module -->
      <div class="details-grid">
        <div class="detail-item">
          <div class="detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <path d="M12 16s6-5.686 6-10A6 6 0 0 0 6 6c0 4.314 6 10 6 10z" />
              <circle cx="12" cy="6" r="2" />
            </svg>
          </div>
          <div class="detail-content">
            <span class="detail-label">Coefficient</span>
            <span class="detail-value">{{ module.coefficient }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </div>
          <div class="detail-content">
            <span class="detail-label">Crédits</span>
            <span class="detail-value">{{ module.credits }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <ActionButton icon="mdi:calendar" @click="openSessionModal" full-width>
          Voir les sessions
        </ActionButton>
        <ActionButton icon="mdi:eye" @click="router.push(`/professor/modules/${module.moduleId}`)" full-width
          variant="outline" outline-color="prim">
          Voir le module
        </ActionButton>
      </div>
    </div>

    <!-- Modal des sessions -->
    <div v-if="showSessionModal" class="modal-overlay" @click.self="closeSessionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Sessions de {{ module.title }}</h2>
          <button class="modal-close" @click="closeSessionModal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="sessions-summary">
            <div class="summary-item">
              <span class="summary-label">Total planifié</span>
              <span class="summary-value">{{ module.hoursPlanned }}h</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Total réalisé</span>
              <span class="summary-value">{{ module.hoursDone }}h</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Sessions</span>
              <span class="summary-value">{{ module.sessions.length }}</span>
            </div>
          </div>

          <div class="sessions-status-summary">
            <div class="status-summary-item done">
              <div class="status-summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <div class="status-summary-content">
                <span class="status-summary-label">Terminées</span>
                <span class="status-summary-count">{{ getSessionCountByStatus('done') }}</span>
              </div>
            </div>

            <div class="status-summary-item missed">
              <div class="status-summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div class="status-summary-content">
                <span class="status-summary-label">Manquées</span>
                <span class="status-summary-count">{{ getSessionCountByStatus('missed') }}</span>
              </div>
            </div>

            <div class="status-summary-item pending">
              <div class="status-summary-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m12 8v8" />
                </svg>
              </div>
              <div class="status-summary-content">
                <span class="status-summary-label">En attente</span>
                <span class="status-summary-count">{{ getSessionCountByStatus('pending') }}</span>
              </div>
            </div>
          </div>

          <div class="sessions-list">
            <h3>Détail des sessions</h3>
            <div v-for="(session, index) in module.sessions" :key="index" class="session-item"
              :class="getSessionClass(session.status)">
              <div class="session-date" :class="getSessionDateClass(session.status)">
                <div class="session-day">{{ formatDay(session.date) }}</div>
                <div class="session-month">{{ formatMonth(session.date) }}</div>
              </div>

              <div class="session-details">
                <div class="session-time">
                  {{ formatTime(session.startTime) }} - {{ formatTime(session.endTime) }}
                </div>
                <div class="session-duration">
                  {{ session.duration }} heures
                </div>
              </div>

              <div class="session-status">
                <div class="status-badge session-status-badge" :class="getSessionStatusClass(session.status)">
                  <div class="status-icon">
                    <svg v-if="session.status === 'done'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <svg v-else-if="session.status === 'missed'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m12 8v8" />
                    </svg>
                  </div>
                  <span class="status-text">{{ getSessionStatusText(session.status) }}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="luxury-button secondary" @click="closeSessionModal">
            Fermer
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type ProggressionInterface from '@/interfaces/progressionModuleInterface';
import { computed, ref } from 'vue'
import ActionButton from '../ui/ActionButton.vue';
import { useRouter } from 'vue-router';


const router = useRouter()

const props = defineProps<{
  module: ProggressionInterface
}>()
const showSessionModal = ref(false)

// Calcul de la progression
const progressPercentage = computed(() => {
  if (!props.module.hoursDone) return 0
  return Math.min(100, Math.round((props.module.hoursDone / props.module.hoursPlanned) * 100))
})

// Vérification si le module est terminé
const isCompleted = computed(() => {
  return progressPercentage.value >= 100
})

// Statut du module
const statusText = computed(() => {
  const progress = progressPercentage.value

  if (isCompleted.value || progress >= 100) return 'Terminé'
  if (progress >= 75) return 'En avance'
  if (progress >= 50) return 'En cours'
  if (progress > 0) return 'Débuté'   // 👈 dès qu’il y a un peu d’avancement
  return 'Non commencé'
})


// Classe CSS pour le statut
const statusClass = computed(() => {
  if (isCompleted.value) return 'status-completed'
  if (progressPercentage.value >= 75) return 'status-ahead'
  if (progressPercentage.value >= 50) return 'status-in-progress'
  if (progressPercentage.value > 0) return 'status-started'
  return 'status-not-started'
})

// Ouvrir le modal des sessions
const openSessionModal = () => {
  showSessionModal.value = true
}

// Fermer le modal des sessions
const closeSessionModal = () => {
  showSessionModal.value = false
}

// Formater la journée
const formatDay = (dateString: Date) => {
  const date = new Date(dateString)
  return date.getDate().toString().padStart(2, '0')
}

// Formater le mois
const formatMonth = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
}

// Formater l'heure
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

// Obtenir la classe CSS pour la session
const getSessionClass = (status: 'pending' | 'missed' | 'done') => {
  return `session-${status}`
}

// Obtenir la classe CSS pour la date de session
const getSessionDateClass = (status: 'pending' | 'missed' | 'done') => {
  return `session-date-${status}`
}

// Obtenir la classe CSS pour le badge de statut
const getSessionStatusClass = (status: 'pending' | 'missed' | 'done') => {
  return `session-status-${status}`
}

// Obtenir le texte du statut de session
const getSessionStatusText = (status: 'pending' | 'missed' | 'done') => {
  switch (status) {
    case 'done':
      return 'Terminée'
    case 'missed':
      return 'Manquée'
    case 'pending':
      return 'En attente'
    default:
      return 'En attente'
  }
}

// Compter les sessions par statut
const getSessionCountByStatus = (status: 'pending' | 'missed' | 'done') => {
  return props.module.sessions.filter(session => session.status === status).length
}
</script>

<style scoped>
.module-item-luxury {
  margin-bottom: 24px;
}

.luxury-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
  position: relative;
}

.luxury-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-light);
}

.title-section {
  flex: 1;
}

.module-title {
  margin: 0 0 6px;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.3;
}

.module-code {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-completed {
  background-color: rgba(var(--success-rgb), 0.1);
  color: var(--success-dark);
}

.status-ahead {
  background-color: rgba(var(--secondary-color-rgb), 0.1);
  color: var(--secondary-dark);
}

.status-in-progress {
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-dark);
}

.status-started {
  background-color: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
}

.status-not-started {
  background-color: var(--gray-extra-light);
  color: var(--text-secondary);
}

.progress-section {
  padding: 20px 24px;
  background: linear-gradient(to right, var(--gray-extra-light) 0%, transparent 100%);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.progress-percentage {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
}

.elegant-progress-bar {
  height: 6px;
  background: var(--gray-lighter);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-light) 100%);
  transition: width 0.8s cubic-bezier(0.22, 0.61, 0.36, 1);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-image: linear-gradient(-45deg,
      rgba(255, 255, 255, 0.2) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.2) 75%,
      transparent 75%,
      transparent);
  z-index: 1;
  background-size: 10px 10px;
  animation: move 2s linear infinite;
  border-radius: 3px;
}

@keyframes move {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 10px 0;
  }
}

.hours-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px 24px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  flex-shrink: 0;
}

.detail-icon svg {
  width: 20px;
  height: 20px;
}

.detail-content {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.actions-section {
  display: flex;
  padding: 20px 24px;
  gap: 12px;
}

.luxury-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  flex: 1;
}

.luxury-button.primary {
  background: var(--primary-color);
  color: white;
}

.luxury-button.primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.luxury-button.primary:disabled {
  background: var(--tertiary-light);
  cursor: not-allowed;
}

.luxury-button.secondary {
  background: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.luxury-button.secondary:hover {
  background: rgba(var(--primary-color-rgb), 0.05);
}

.button-icon {
  display: flex;
  align-items: center;
}

.button-icon svg {
  width: 16px;
  height: 16px;
}

.completed .progress-fill {
  background: linear-gradient(90deg, var(--success) 0%, var(--success-light) 100%);
}

.completed .progress-percentage {
  color: var(--success-dark);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-light);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-extra-light);
  color: var(--text-dark);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.sessions-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: var(--gray-extra-light);
  border-radius: 12px;
}

.sessions-status-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: 12px;
}

.status-summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.status-summary-item.done {
  background: rgba(var(--success-rgb), 0.05);
  border: 1px solid rgba(var(--success-rgb), 0.1);
}

.status-summary-item.missed {
  background: rgba(var(--error-rgb), 0.05);
  border: 1px solid rgba(var(--error-rgb), 0.1);
}

.status-summary-item.pending {
  background: rgba(var(--warning-rgb), 0.05);
  border: 1px solid rgba(var(--warning-rgb), 0.1);
}

.status-summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
}

.status-summary-item.done .status-summary-icon {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success-dark);
}

.status-summary-item.missed .status-summary-icon {
  background: rgba(var(--error-rgb), 0.1);
  color: var(--error-dark);
}

.status-summary-item.pending .status-summary-icon {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
}

.status-summary-icon svg {
  width: 16px;
  height: 16px;
}

.status-summary-content {
  display: flex;
  flex-direction: column;
}

.status-summary-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.status-summary-count {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-dark);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-color);
}

.sessions-list h3 {
  margin: 0 0 16px;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.session-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.session-item:hover {
  border-color: var(--primary-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Styles spécifiques pour les différents statuts de session */
.session-done {
  border-color: var(--success-light);
  background: rgba(var(--success-rgb), 0.02);
}

.session-done:hover {
  border-color: var(--success);
  box-shadow: 0 4px 12px rgba(var(--success-rgb), 0.15);
}

.session-missed {
  border-color: var(--error-light);
  background: rgba(var(--error-rgb), 0.02);
}

.session-missed:hover {
  border-color: var(--error);
  box-shadow: 0 4px 12px rgba(var(--error-rgb), 0.15);
}

.session-pending {
  border-color: var(--warning-light);
  background: rgba(var(--warning-rgb), 0.02);
}

.session-pending:hover {
  border-color: var(--warning);
  box-shadow: 0 4px 12px rgba(var(--warning-rgb), 0.15);
}

.session-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--primary-extra-light);
  border-radius: 10px;
  margin-right: 16px;
  flex-shrink: 0;
}

/* Styles spécifiques pour les dates selon le statut */
.session-date-done {
  background: rgba(var(--success-rgb), 0.1);
}

.session-date-done .session-day,
.session-date-done .session-month {
  color: var(--success-dark);
}

.session-date-missed {
  background: rgba(var(--error-rgb), 0.1);
}

.session-date-missed .session-day,
.session-date-missed .session-month {
  color: var(--error-dark);
}

.session-date-pending {
  background: rgba(var(--warning-rgb), 0.1);
}

.session-date-pending .session-day,
.session-date-pending .session-month {
  color: var(--warning-dark);
}

.session-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.session-month {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.session-details {
  flex: 1;
}

.session-time {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.session-duration {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Section de statut de session */
.session-status {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.session-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon svg {
  width: 14px;
  height: 14px;
}

/* Styles spécifiques pour les badges de statut */
.session-status-done {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success-dark);
}

.session-status-missed {
  background: rgba(var(--error-rgb), 0.1);
  color: var(--error-dark);
}

.session-status-pending {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
}

.session-actions {
  margin-left: 12px;
}

.session-action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.session-action-btn:hover {
  background: var(--gray-extra-light);
  color: var(--primary-color);
}

.session-action-btn svg {
  width: 16px;
  height: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-light);
  background: var(--gray-extra-light);
}
</style>
