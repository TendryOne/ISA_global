<template>
  <div v-if="isOpen && course" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content schedule-detail-modal">
      <!-- Header avec informations principales -->
      <div class="modal-header" :class="{
        'online': course.type === 'distanciel',
        'hybride': course.type === 'hybride'
      }">
        <div class="header-content">
          <div class="title-section">
            <h3 class="course-title">{{ course.title }}</h3>
            <p v-if="course.module" class="module-info">{{ course.module.code }} - {{ course.module.title }}</p>
            <p v-else class="module-info event-info">
              <Icon icon="lucide:calendar" />
              Événement - {{ getCourseTypeLabel(course.courseType) }}
            </p>
          </div>

          <!-- Bouton Rejoindre Google Meet pour les cours en ligne ou hybrides -->
          <div v-if="(course.type === 'distanciel' || course.type === 'hybride') && course.googleMeetLink"
            class="meet-action-header">
            <a :href="course.googleMeetLink" target="_blank" class="meet-btn-header">
              <Icon icon="logos:google-meet" width="20" height="20" />
              Rejoindre Google Meet
            </a>
          </div>
        </div>

        <div class="header-badges">
          <span class="department-badge" :style="{ background: getDepartmentColor(course.department[0]) }">
            {{ getDepartmentDisplay(course.department) }}
          </span>
          <span class="type-badge" :class="course.type">
            <Icon :icon="getTypeIcon(course.type)" />
            {{ getTypeLabel(course.type) }}
          </span>

          <!-- Indicateur de statut -->
          <span v-if="course.status === 'missed'" class="status-indicator missed">
            <Icon icon="material-symbols:error" />
            Manqué
          </span>

          <!-- Indicateur d'approbation pour status done -->
          <span v-if="course.status === 'done' && course.approvedByCron" class="status-indicator approved-robot">
            <Icon icon="material-symbols:android" />
            Validation automatique
          </span>

          <span v-if="course.status === 'done' && !course.approvedByCron && course.approvedManuallyAfterCronBy"
            class="status-indicator approved-human">
            <Icon icon="material-symbols:verified-user" />
            Validation manuelle
          </span>
        </div>

        <!-- Bouton fermer à droite -->
        <button @click="closeModal" class="close-button">
          <Icon icon="lucide:x" />
        </button>
      </div>

      <!-- Corps du modal avec sections détaillées -->
      <div class="modal-body">
        <div class="detail-sections">
          <!-- Section Informations principales -->
          <div class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:info" width="22" height="22" />
              <span>Informations principales</span>
            </div>
            <div class="info-card-content">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-icon">
                    <Icon icon="lucide:calendar" />
                  </div>
                  <div class="info-text">
                    <div class="info-label">Date</div>
                    <div class="info-value">{{ formatDate(course.date) }}</div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <Icon icon="lucide:clock" />
                  </div>
                  <div class="info-text">
                    <div class="info-label">Horaire</div>
                    <div class="info-value">{{ course.startTime }} - {{ course.endTime }} ({{
                      getDuration(course.duration) }})</div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <Icon icon="lucide:map-pin" />
                  </div>
                  <div class="info-text">
                    <div class="info-label">Lieu</div>
                    <div class="info-value"
                      :class="{ 'online-room': course.type === 'distanciel' || course.type === 'hybride' }">
                      {{ course.room }}
                      <span v-if="course.type === 'distanciel'" class="online-indicator">En ligne</span>
                      <span v-if="course.type === 'hybride'" class="hybrid-indicator">Hybride</span>
                    </div>
                  </div>
                </div>

                <div class="info-item">
                  <div class="info-icon">
                    <Icon icon="lucide:tag" />
                  </div>
                  <div class="info-text">
                    <div class="info-label">Type</div>
                    <div class="info-value">{{ getCourseTypeLabel(course.courseType) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Module (uniquement si c'est un cours avec module) -->
          <div v-if="course.module" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:book-open" width="22" height="22" />
              <span>Module</span>
            </div>
            <div class="info-card-content">
              <div class="module-display">
                <div class="module-header">
                  <div class="module-code">{{ course.module.code }}</div>
                  <div class="module-title">{{ course.module.title }}</div>
                </div>
                <div class="module-details">
                  <div class="module-info-grid">
                    <div class="module-info-item">
                      <Icon icon="lucide:award" width="16" height="16" />
                      <span>{{ course.module.credits }} crédits</span>
                    </div>
                    <div class="module-info-item">
                      <Icon icon="lucide:percent" width="16" height="16" />
                      <span>Coefficient {{ course.module.coefficient }}</span>
                    </div>
                    <div class="module-info-item">
                      <Icon icon="lucide:clock" width="16" height="16" />
                      <span>{{ course.module.hours }}h volume</span>
                    </div>
                    <div class="module-info-item">
                      <Icon icon="lucide:layers" width="16" height="16" />
                      <span>{{ course.module.type }}</span>
                    </div>
                  </div>
                  <div v-if="course.module.description" class="module-description">
                    <Icon icon="lucide:file-text" width="16" height="16" />
                    <span>{{ course.module.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Professeur (uniquement s'il y a un professeur) -->
          <div v-if="course.professor" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:user" width="22" height="22" />
              <span>Enseignant</span>
            </div>
            <div class="info-card-content">
              <div class="professor-display">
                <div class="professor-avatar">
                  {{ course.professor.firstName.charAt(0) }}{{ course.professor.name.charAt(0) }}
                </div>
                <div class="professor-details">
                  <div class="professor-name">{{ course.professor.firstName }} {{ course.professor.name }}</div>
                  <div class="professor-meta">
                    <div class="professor-email">
                      <Icon icon="lucide:mail" />
                      {{ course.professor.email }}
                    </div>
                    <div v-if="course.professor.phone" class="professor-phone">
                      <Icon icon="lucide:phone" />
                      {{ course.professor.phone }}
                    </div>
                    <span class="status-chip" :class="course.professor.isPermanent ? 'permanent' : 'temporary'">
                      {{ course.professor.isPermanent ? 'Permanent' : 'Vacataire' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Statut (uniquement pour les statuts done et missed) -->
          <div v-if="course.status === 'done' || course.status === 'missed'" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:activity" width="22" height="22" />
              <span>Statut du cours</span>
            </div>
            <div class="info-card-content">
              <div class="status-display">
                <div class="status-badge" :class="course.status">
                  <Icon :icon="getStatusIcon(course.status)" width="18" height="18" />
                  {{ getStatusText(course.status) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section Approbation automatique (si approuvé par le système) -->
          <div v-if="course.approvedByCron" class="info-card system-approval">
            <div class="info-card-header">
              <Icon icon="lucide:robot" width="22" height="22" />
              <span>vérification automatique</span>
            </div>
            <div class="info-card-content">
              <div class="approval-display">
                <div class="approval-badge">
                  <Icon icon="lucide:check-circle" width="20" height="20" />
                  <div class="approval-text">
                    <div class="approval-title">vérifié automatiquement</div>
                    <div class="approval-subtitle">Le système a vérifié ce statut de façon automatique</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Approbation manuelle (si approuvé manuellement) -->
          <div v-if="!course.approvedByCron && course.approvedManuallyAfterCronBy" class="info-card manual-approval">
            <div class="info-card-header">
              <Icon icon="material-symbols:verified-user" width="22" height="22" />
              <span>Validation manuelle</span>
            </div>
            <div class="info-card-content">
              <div class="approval-display">
                <div class="approval-badge manual">
                  <Icon icon="lucide:user-check" width="20" height="20" />
                  <div class="approval-text">
                    <div class="approval-title">Validé par un administrateur</div>
                    <div class="approval-subtitle">
                      Approuvé par : <strong>{{ course.approvedManuallyAfterCronBy.firstName }} {{
                        course.approvedManuallyAfterCronBy.name }}</strong>
                    </div>
                    <div class="approval-matricule">
                      Matricule : {{ course.approvedManuallyAfterCronBy.matricule }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Réclamations (uniquement pour missed) -->
          <div v-if="course.status === 'missed' && course.studentReclamations?.length" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:alert-triangle" width="22" height="22" />
              <span>Réclamations étudiantes ({{ course.studentReclamations.length }})</span>
            </div>
            <div class="info-card-content">
              <div class="reclamations-display">
                <div class="reclamations-grid">
                  <span v-for="student in course.studentReclamations" :key="student.matricule" class="matricule-chip">
                    {{ student.matricule }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Section Promotions -->
          <div v-if="promotionsAvailable.length" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:users" width="22" height="22" />
              <span>Promotions ({{ promotionsAvailable.length }})</span>
            </div>
            <div class="info-card-content">
              <div class="chips-container">
                <span v-for="promotion in promotionsAvailable" :key="promotion._id" class="info-chip promotion">
                  {{ promotion.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Section Départements -->
          <div class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:building" width="22" height="22" />
              <span>Départements ({{ course.department.length }})</span>
            </div>
            <div class="info-card-content">
              <div class="chips-container">
                <span v-for="dept in course.department" :key="dept" class="info-chip department"
                  :style="{ '--dept-color': getDepartmentColor(dept) }">
                  {{ getDepartmentName(dept) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Section Description -->
          <div v-if="course.description" class="info-card">
            <div class="info-card-header">
              <Icon icon="lucide:file-text" width="22" height="22" />
              <span>Description</span>
            </div>
            <div class="info-card-content">
              <p class="description-text">{{ course.description }}</p>
            </div>
          </div>

          <!-- Section Informations système - En bas -->
          <div class="info-card system-info">
            <div class="info-card-header">
              <Icon icon="lucide:database" width="22" height="22" />
              <span>Historique et traçabilité</span>
            </div>
            <div class="info-card-content">
              <div class="system-grid" :class="{ 'no-modifications': !course.modifiedBy }">
                <!-- Créé par -->
                <div v-if="course.createdBy" class="system-item creation-info">
                  <div class="system-icon">
                    <Icon icon="lucide:user-plus" width="18" height="18" />
                  </div>
                  <div class="system-text">
                    <div class="system-label">Créé par</div>
                    <div class="system-value">{{ course.createdBy.firstName }} {{ course.createdBy.name }}</div>
                    <div class="system-email">{{ course.createdBy.email }}</div>
                  </div>
                </div>

                <!-- Date de création -->
                <div class="system-item creation-info">
                  <div class="system-icon">
                    <Icon icon="lucide:calendar-plus" width="18" height="18" />
                  </div>
                  <div class="system-text">
                    <div class="system-label">Créé le</div>
                    <div class="system-value">{{ formatDateTime(course.createdAt) }}</div>
                  </div>
                </div>

                <!-- Modifié par -->
                <div v-if="course.modifiedBy" class="system-item modification-info">
                  <div class="system-icon">
                    <Icon icon="lucide:user-check" width="18" height="18" />
                  </div>
                  <div class="system-text">
                    <div class="system-label">Modifié par</div>
                    <div class="system-value">{{ course.modifiedBy.firstName }} {{ course.modifiedBy.name }}</div>
                    <div class="system-email">{{ course.modifiedBy.email }}</div>
                  </div>
                </div>

                <!-- Dernière modification -->
                <div class="system-item modification-info">
                  <div class="system-icon">
                    <Icon icon="lucide:calendar-clock" width="18" height="18" />
                  </div>
                  <div class="system-text">
                    <div class="system-label">Modifié le</div>
                    <div class="system-value">{{ formatDateTime(course.updatedAt) }}</div>
                    <div v-if="!course.modifiedBy" class="system-note">Aucune modification manuelle</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions du modal -->
      <div class="modal-footer">
        <div class="footer-actions">
          <ActionButton icon="mdi:check-circle" variant="primary" full-width @click="approveCourseManually"
            v-if="course.approvedByCron && course.studentReclamations.length > 0">
            Approuver manuellement
          </ActionButton>
          <ActionButton @click="editCourse" icon="lucide:edit" variant="outline" outline-color="prim" full-width>
            Modifier
          </ActionButton>
          <ActionButton @click="deleteCourse" variant="danger" full-width icon="lucide:trash">
            Supprimer
          </ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type ScheduleInterface from '@/interfaces/Schedule.interface'
import type PromotionInterface from '@/interfaces/promotion.interface';
import { computed } from 'vue';
import ActionButton from '@/components/ui/ActionButton.vue';

const getDuration = (duration: number): string => {
  const hours = Math.floor(duration);
  const minutes = (duration - hours) * 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes}`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}min`;
  }
};

// Props
const props = defineProps<{
  isOpen: boolean
  course: ScheduleInterface | null
  promotions: PromotionInterface[]
}>()

const promotionsAvailable = computed(() => {
  return props.promotions.filter((p) => props.course?.promotions.find(c => c === p._id))
})



const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', course: ScheduleInterface): void
  (e: 'delete', course: ScheduleInterface): void
  (e: 'approved', id: string): void
}>()

// Méthodes
const closeModal = () => {
  emit('close')
}

const editCourse = () => {
  if (props.course) {
    emit('edit', props.course)
  }
}

const deleteCourse = () => {
  if (props.course) {
    emit('delete', props.course)
  }
}

const approveCourseManually = () => {
  if (props.course) {
    emit('approved', props.course._id)
  }
}

// Fonctions utilitaires existantes
const getDepartmentColor = (dept: string) => {
  const colors = {
    'informatique': 'var(--primary-color)',
    'gestion': 'var(--secondary-color)',
    'btp': 'var(--tertiary-color)'
  }
  return colors[dept as keyof typeof colors] || 'var(--gray)'
}

const getDepartmentDisplay = (departments: ('informatique' | 'btp' | 'gestion')[]): string => {
  const names = {
    'informatique': 'Informatique',
    'gestion': 'Gestion',
    'btp': 'BTP'
  }
  return names[departments[0]] || ''
}

const getDepartmentName = (dept: string): string => {
  const names = {
    'informatique': 'Informatique',
    'gestion': 'Gestion',
    'btp': 'BTP'
  }
  return names[dept as keyof typeof names] || dept.toUpperCase()
}

const getCourseTypeLabel = (type: string) => {
  const labels = {
    'cm': 'Cours Magistral',
    'td': 'Travaux Dirigés',
    'tp': 'Travaux Pratiques',
    'exam': 'Examen',
    'other': 'Autre'
  }
  return labels[type as keyof typeof labels] || type.toUpperCase()
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getStatusText = (status: string) => {
  if (status === 'done') return 'Terminé'
  if (status === 'missed') return 'Manqué'
  return 'En attente'
}

const getStatusIcon = (status: string) => {
  if (status === 'done') return 'lucide:check-circle'
  if (status === 'missed') return 'lucide:x-circle'
  return 'lucide:clock'
}

const getTypeIcon = (type: string) => {
  if (type === 'presentiel') return 'lucide:school'
  if (type === 'distanciel') return 'lucide:video'
  if (type === 'hybride') return 'lucide:laptop'
  return 'lucide:help-circle'
}

const getTypeLabel = (type: string) => {
  if (type === 'presentiel') return 'Présentiel'
  if (type === 'distanciel') return 'Distanciel'
  if (type === 'hybride') return 'Hybride'
  return type.charAt(0).toUpperCase() + type.slice(1)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
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

.schedule-detail-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  padding: 1.5rem 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  gap: 1rem;
}

.modal-header.online {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-dark) 100%);
}

.modal-header.hybride {
  background: linear-gradient(135deg, var(--tertiary-color) 0%, var(--primary-dark) 100%);
}

.header-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-right: 1rem;
}

.title-section {
  flex: 1;
}

.course-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.module-info {
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  font-size: 0.95rem;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meet-action-header {
  margin-left: 1.5rem;
}

.meet-btn-header {
  background: white;
  color: var(--secondary-color);
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.meet-btn-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.header-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.department-badge,
.type-badge,
.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Styles spécifiques pour les indicateurs de statut */
.status-indicator.missed {
  background: linear-gradient(135deg, #ff1744 0%, #d50000 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(255, 23, 68, 0.3);
}

.status-indicator.approved-robot {
  background: linear-gradient(135deg, #00bfff 0%, #0099cc 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 191, 255, 0.3);
}

.status-indicator.approved-human {
  background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 8px rgba(0, 230, 118, 0.3);
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: var(--background-light);
}

.detail-sections {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Info Card Styles */
.info-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
}

.info-card-header {
  background: var(--background-light);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--text-dark);
  border-bottom: 1px solid var(--border-light);
}

.info-card-content {
  padding: 1.5rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-icon {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: var(--text-dark);
}

.online-room {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.online-indicator {
  background: var(--secondary-extra-light);
  color: var(--secondary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.hybrid-indicator {
  background: var(--tertiary-extra-light);
  color: var(--tertiary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Professor Display */
.professor-display {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.professor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.professor-details {
  flex: 1;
}

.professor-name {
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.professor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.professor-email,
.professor-phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-chip {
  padding: 0.35rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-chip.permanent {
  background: var(--success-light);
  color: var(--success-dark);
}

.status-chip.temporary {
  background: var(--warning-light);
  color: var(--warning-dark);
}

/* Created By Display */
.created-by-display {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.created-by-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--tertiary-color) 0%, var(--tertiary-dark) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.created-by-details {
  flex: 1;
}

.created-by-name {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.created-by-email {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Status Display */
.status-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-badge {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: fit-content;
}

.status-badge.done {
  background: var(--success-light);
  color: var(--success-dark);
}

.status-badge.missed {
  background: var(--error-light);
  color: var(--error-dark);
}

/* System Approval Styles */
.system-approval {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
}

.approval-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.approval-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #bae6fd;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.1);
  width: 100%;
}

.approval-badge svg {
  color: #0ea5e9;
  flex-shrink: 0;
}

.approval-text {
  flex: 1;
}

.approval-title {
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.25rem;
}

.approval-subtitle {
  font-size: 0.85rem;
  color: #0369a1;
  opacity: 0.8;
}

/* Manual Approval Styles */
.manual-approval {
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
}

.approval-badge.manual {
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
}

.approval-badge.manual svg {
  color: #22c55e;
}

.manual-approval .approval-title {
  color: #14532d;
}

.manual-approval .approval-subtitle {
  color: #166534;
}

.approval-matricule {
  font-size: 0.8rem;
  color: #166534;
  opacity: 0.7;
  margin-top: 0.25rem;
  font-family: 'Courier New', monospace;
}

/* Reclamations Styles */
.reclamations-display {
  margin-top: 0;
}

.reclamations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
}

.matricule-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
  transition: all 0.2s ease;
}

.matricule-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
}

/* Chips */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.info-chip {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-chip.promotion {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-color-light);
}

.info-chip.department {
  background: color-mix(in srgb, var(--dept-color) 10%, transparent);
  color: var(--dept-color);
  border: 1px solid color-mix(in srgb, var(--dept-color) 30%, transparent);
}

/* Description */
.description-text {
  color: var(--text-dark);
  line-height: 1.6;
  margin: 0;
}

/* Module Display */
.module-display {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
}

.module-header {
  margin-bottom: 1rem;
}

.module-code {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.module-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
}

.module-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.module-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: var(--text-dark);
}

.module-description {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* System Info */
.system-info {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
}

.system-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Si pas de modifiedBy, ajuster la grille pour 2 colonnes */
.system-grid.no-modifications {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Responsive pour système grid */
@media (max-width: 1024px) {
  .system-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .system-grid.no-modifications {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

.system-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.system-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.system-item.creation-info {
  border-left: 4px solid var(--primary-color);
}

.system-item.modification-info {
  border-left: 4px solid var(--secondary-color);
}

.system-icon {
  color: var(--text-secondary);
  margin-top: 0.1rem;
}

.system-text {
  flex: 1;
}

.system-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.system-value {
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
}

.system-email {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.system-note {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  opacity: 0.7;
}

.system-id {
  font-family: monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .module-info-grid {
    grid-template-columns: 1fr;
  }

  .system-grid {
    grid-template-columns: 1fr;
  }
}

/* Footer */
.modal-footer {
  background: var(--background-light);
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-btn {
  background: var(--primary-color);
  color: white;
}

.edit-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.delete-btn {
  background: var(--error);
  color: white;
}

.delete-btn:hover {
  background: var(--error-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.close-modal-btn {
  background: var(--gray);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-modal-btn:hover {
  background: var(--gray-dark);
  transform: translateY(-1px);
}

.close-modal-btn {
  width: 100%;
  padding: 0.75rem;
}

/* Mobile styles for new sections */
.approval-badge {
  padding: 0.75rem 1rem;
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
}

.approval-title {
  font-size: 0.9rem;
}

.approval-subtitle {
  font-size: 0.8rem;
}

.reclamations-grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.4rem;
}

.matricule-chip {
  font-size: 0.75rem;
  padding: 0.4rem 0.6rem;
}


/* Responsive Design - Mobile First */
@media (max-width: 768px) {
  .schedule-detail-modal {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    max-height: none;
  }

  .modal-overlay {
    padding: 0;
  }

  .modal-header {
    padding: 0.75rem 1rem;
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .close-button {
    margin-right: 0;
    padding: 0.5rem;
    font-size: 1.2rem;
  }

  .header-content {
    flex: 1;
    margin-right: 0;
    gap: 0.75rem;
  }

  .course-title {
    font-size: 1.1rem;
    line-height: 1.2;
    margin-bottom: 0.25rem;
  }

  .module-info {
    font-size: 0.8rem;
  }

  .header-badges {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
  }

  .department-badge,
  .type-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
  }

  .meet-action-header {
    margin-left: 0;
  }

  .meet-btn-header {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .detail-sections {
    padding: 1rem;
  }

  .info-card {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .info-card-header {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .info-item {
    padding: 0.75rem;
  }

  .info-label {
    font-size: 0.75rem;
  }

  .info-value {
    font-size: 0.85rem;
  }

  .professor-display,
  .created-by-display {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .professor-avatar,
  .created-by-avatar {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }

  .professor-name,
  .created-by-name {
    font-size: 0.9rem;
  }

  .professor-email,
  .professor-phone,
  .created-by-email {
    font-size: 0.8rem;
  }

  .professor-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .status-chip {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .chips-container {
    gap: 0.5rem;
  }

  .info-chip {
    font-size: 0.75rem;
    padding: 0.4rem 0.7rem;
  }

  .description-text {
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .module-code {
    font-size: 1rem;
  }

  .module-title {
    font-size: 0.9rem;
  }

  .module-info-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .module-info-item {
    padding: 0.5rem;
    font-size: 0.8rem;
  }

  .system-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .system-item {
    padding: 0.75rem;
  }

  .system-label {
    font-size: 0.7rem;
  }

  .system-value {
    font-size: 0.8rem;
  }

  .system-email {
    font-size: 0.75rem;
  }

  .modal-footer {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .footer-actions {
    width: 100%;
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .close-modal-btn {
    width: 100%;
    font-size: 0.9rem;
    padding: 0.75rem;
  }

  /* Mobile styles for new sections */
  .approval-badge {
    padding: 0.75rem 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .approval-title {
    font-size: 0.9rem;
  }

  .approval-subtitle {
    font-size: 0.8rem;
  }

  .reclamations-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.4rem;
  }

  .matricule-chip {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }
}
</style>
