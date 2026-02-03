<template>
  <div class="professor-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement des données du professeur...</p>
    </div>

    <!-- Professor Details Content -->
    <div v-else-if="professor" class="detail-content">
      <!-- Breadcrumbs -->
      <div class="breadcrumbs">
        <router-link to="/admin" class="breadcrumb-link">Administration</router-link>
        <span class="breadcrumb-separator">•</span>
        <router-link to="/admin/users/teachers" class="breadcrumb-link">Professeurs</router-link>
        <span class="breadcrumb-separator">•</span>
        <span class="breadcrumb-current">{{ professor.firstName }} {{ professor.name }}</span>
      </div>

      <!-- Professor Header -->
      <div class="professor-header-card">
        <div class="header-gradient">
          <div class="header-content">
            <div class="professor-main-info">
              <!-- Avatar -->
              <div class="professor-avatar">
                <span class="avatar-text">
                  {{ professor.firstName.charAt(0) }}{{ professor.name.charAt(0) }}
                </span>
              </div>

              <!-- Professor Info -->
              <div class="professor-info-section">
                <h1 class="professor-name">{{ professor.firstName }} {{ professor.name }}</h1>
                <p class="professor-departments">{{ departmentLabels }}</p>
                <div class="professor-badges">
                  <span class="matricule-badge">
                    {{ professor.matricule }}
                  </span>
                  <span class="status-badge" :class="professor.isPermanent ? 'permanent' : 'temporary'">
                    {{ professor.isPermanent ? 'Permanent' : 'Contractuel' }}
                  </span>
                </div>
              </div>
            </div>


          </div>
        </div>

        <!-- Quick Stats -->
        <div class="quick-stats">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon stat-primary">
                <Icon icon="heroicons:academic-cap" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalModules }}</div>
                <div class="stat-label">{{ totalModules === 0 ? 'Aucun module' : 'Total modules' }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon stat-success">
                <Icon icon="heroicons:star" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalCredits }}</div>
                <div class="stat-label">{{ totalCredits === 0 ? 'Aucun crédit' : 'Total crédits' }}</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon stat-accent">
                <Icon icon="heroicons:clock" />
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ totalHours }}</div>
                <div class="stat-label">{{ totalHours === 0 ? 'Aucune heure' : 'Heures totales' }}</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <div class="tabs-header">
          <nav class="tabs-nav">
            <button @click="activeTab = 'personal'" :class="['tab-button', { 'active': activeTab === 'personal' }]">
              <Icon icon="heroicons:user" class="tab-icon" />
              <span class="tab-text">
                <span class="tab-text-full">Informations personnelles</span>
                <span class="tab-text-short">Infos</span>
              </span>
            </button>
            <button @click="activeTab = 'tracking'" :class="['tab-button', { 'active': activeTab === 'tracking' }]">
              <Icon icon="fluent-mdl2:issue-tracking" class="tab-icon" />
              <span class="tab-text">
                <span class="tab-text-full">suivi des modules</span>
                <span class="tab-text-short">Modules</span>
              </span>
            </button>
            <button @click="activeTab = 'modules'" :class="['tab-button', { 'active': activeTab === 'modules' }]">
              <Icon icon="heroicons:academic-cap" class="tab-icon" />
              <span class="tab-text">
                <span class="tab-text-full">Modules enseignés</span>
                <span class="tab-text-short">Modules</span>
              </span>
            </button>
            <button @click="activeTab = 'usage'" :class="['tab-button', { 'active': activeTab === 'usage' }]">
              <Icon icon="heroicons:academic-cap" class="tab-icon" />
              <span class="tab-text">
                <span class="tab-text-full">Historique d'utilisation</span>
                <span class="tab-text-short">Usage</span>
              </span>
            </button>

          </nav>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'" class="tab-panel">
            <div class="info-grid">
              <div class="info-section">
                <h3 class="section-title">
                  <Icon icon="heroicons:envelope" class="title-icon" />
                  Informations de contact
                </h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">Email principal:</span>
                    <span class="info-value">{{ professor.email }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Email professionnel:</span>
                    <span class="info-value">{{ professor.emailProfessional }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Téléphone:</span>
                    <span class="info-value">{{ professor.phone }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Adresse:</span>
                    <span class="info-value">{{ professor.address }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h3 class="section-title">
                  <Icon icon="heroicons:building-office" class="title-icon" />
                  Informations professionnelles
                </h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">Date d'embauche:</span>
                    <span class="info-value">{{ formatDate(professor.hireDate) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Statut:</span>
                    <span class="info-value">{{ professor.isPermanent ? 'Permanent' : 'Contractuel' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Département(s):</span>
                    <div class="departments-list">
                      <span v-for="dept in professor.department" :key="dept" class="department-badge"
                        :class="`dept-${dept}`">
                        {{ dept.charAt(0).toUpperCase() + dept.slice(1) }}
                      </span>
                    </div>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Genre:</span>
                    <span class="info-value">{{ professor.gender === 'male' ? 'Masculin' : 'Féminin' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modules Tab -->
          <div v-if="activeTab === 'tracking'" class="tab-panel">
            <div class="section-header">
              <h3 class="section-title">
                <Icon icon="heroicons:academic-cap" class="title-icon" />
                Suivi des modules enseignés pour cette année
              </h3>

              <!-- Filtres élégants -->
              <div class="filters-container">
                <div class="filter-label">Filtrer par promotion :</div>
                <div class="filter-options">
                  <button @click="chooseFilter('')" :class="['filter-btn', { 'active': filterPromotion === '' }]">
                    <Icon icon="heroicons:squares-2x2" class="filter-icon" />
                    Tous ({{ progression.length }})
                  </button>
                  <button v-for="f in filter" :key="f._id" @click="chooseFilter(f._id)"
                    :class="['filter-btn', { 'active': filterPromotion === f._id }]">
                    <Icon icon="heroicons:user-group" class="filter-icon" />
                    {{ f.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Résultats -->
            <div class="modules-results">
              <div class="results-header">
                <span class="results-count">
                  {{ filteredPromotions.length }} module(s) affiché(s)
                  <span v-if="filterPromotion !== ''" class="filter-info">
                    pour la promotion "{{filter.find(f => f._id === filterPromotion)?.name}}"
                  </span>
                </span>
              </div>

              <!-- État vide - Aucun module -->
              <div v-if="progression.length === 0" class="empty-state">
                <div class="empty-state-icon">
                  <Icon icon="heroicons:academic-cap" />
                </div>
                <div class="empty-state-content">
                  <h4 class="empty-state-title">Aucun module assigné</h4>
                  <p class="empty-state-description">
                    Ce professeur n'est encore inscrit à aucun module d'enseignement.
                    <br>Contactez l'administration pour assigner des modules à ce professeur.
                  </p>
                </div>
              </div>

              <!-- Grille des modules -->
              <div v-else class="modules-grid">
                <ModuleItem v-for="p in filteredPromotions" :key="p.moduleId" :module="p" />
              </div>
            </div>
          </div>
          <!---- modules tab-->
          <div v-if="activeTab === 'modules'" class="tab-panel">
            <div class="section-header">
              <h3 class="section-title">
                <Icon icon="heroicons:academic-cap" class="title-icon" />
                Modules enseignés
              </h3>

            </div>
            <div class="modules-grid">
              <ModulesLearnedCard v-for="module in modulesLearned" :key="module._id" :module="module" />
            </div>
          </div>
          <div v-if="activeTab === 'usage'" class="tab-panel">
            <div class="section-header">
              <h3 class="section-title">
                <Icon icon="heroicons:academic-cap" class="title-icon" />
                Historique d'utilisation
              </h3>

            </div>
            <div>
              <ActivityYearView :user="professor" />
            </div>
          </div>


          <!-- Error State -->
          <div v-else class="error-state">
            <div class="error-content">
              <Icon icon="heroicons:exclamation-triangle" class="error-icon" />
              <div class="error-text">
                <h3>Erreur de chargement</h3>
                <p>Impossible de charger les données du professeur.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import type ProfessorInterface from '@/interfaces/professor.interface'
import axios from 'axios'
import ModuleItem from '@/components/modules/ModuleItem.vue'
import type ScheduleInterface from '@/interfaces/Schedule.interface'
import type PromotionInterface from '@/interfaces/promotion.interface'
import type ProggressionInterface from '@/interfaces/progressionModuleInterface'
import { useMyUserStore } from '@/stores/userStore'
import type ModuleInterface from '@/interfaces/module.interface'
import ModulesLearnedCard from '@/components/modules/ModulesLearnedCard.vue'
import ActivityYearView from '@/components/heatmap/ActivityYearView.vue'








const route = useRoute()
const professorId = route.params.id as string
const userStore = useMyUserStore()

// Computed pour vérifier les permissions
const isSuperAdmin = computed(() => {
  return userStore.currentUser?.role?.includes('superAdmin') ?? false
})

// Données réactives
const professor = ref<ProfessorInterface | null>(null)
const loading = ref(true)
const activeTab = ref('personal')

// Données des modules enseignés
const schedules = ref<ScheduleInterface[]>([])
const progression = computed(() => {
  if (!schedules.value || schedules.value.length === 0) return []

  // Vérifier si les données sont déjà formatées (ProggressionInterface)
  // ou si ce sont des ScheduleInterface à transformer
  const firstItem = schedules.value[0] as any

  // Si on reçoit déjà des ProggressionInterface (avec moduleId et promotion._id)
  if (firstItem.moduleId && firstItem.promotion?._id) {
    return schedules.value as any as ProggressionInterface[]
  }

  // Sinon, on transforme des ScheduleInterface
  const grouped: Record<string, {
    moduleId: string;
    title: string;
    code: string;
    coefficient: number;
    credits: number;
    promotion: {
      _id: string;
      name: string;
    };
    hoursPlanned: number;
    hoursDone: number;
    sessions: Array<{
      _id: string;
      date: Date;
      duration: number;
      startTime: string;
      endTime: string;
      status: 'pending' | 'missed' | 'done';
    }>;
  }> = {}

  for (const s of schedules.value) {
    const m = s.module
    const promo = s.promotions?.[0] as Partial<PromotionInterface>

    if (!grouped[m._id]) {
      grouped[m._id] = {
        moduleId: m._id,
        title: m.title,
        code: m.code,
        coefficient: m.coefficient,
        credits: m.credits,
        promotion: {
          _id: promo._id || '',
          name: promo.name || ''
        },
        hoursPlanned: m.hours,
        hoursDone: 0,
        sessions: []
      }
    }

    grouped[m._id].hoursDone += s.duration || 0
    grouped[m._id].sessions.push({
      _id: s._id,
      date: s.date,
      duration: s.duration,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status || 'pending'
    })
  }
  const groupedObject = Object.values(grouped) as ProggressionInterface[]
  return groupedObject
})






// Fonction pour récupérer les modules du professeur
const fetchProfessorModules = async () => {
  try {
    const response = await axios.get(`/api/v1/modules/progression/${professorId}`)
    schedules.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des modules:', error)

  }
}

const filter = computed(() => {
  if (!progression.value) return []
  const promotionName = progression.value.map(p => p.promotion)

  return [... new Set(promotionName)]
})

const filterPromotion = ref<string>("");

function chooseFilter(filter: string) {
  filterPromotion.value = filter
}

const filteredPromotions = computed(() => {
  if (filterPromotion.value === '') return progression.value
  const promFiltered = progression.value.filter(p => p.promotion._id === filterPromotion.value)
  return promFiltered
})


// Propriétés calculées
const departmentLabels = computed(() => {
  if (!professor.value) return ''
  const departments = {
    'informatique': 'Informatique',
    'gestion': 'Gestion',
    'btp': 'BTP'
  }
  return professor.value.department.map(dept => departments[dept as keyof typeof departments]).join(', ')
})


// Statistiques calculées
const totalModules = computed(() => progression.value.length)

const totalHours = computed(() => {
  return progression.value.reduce((total, module) => total + (module.hoursPlanned || 0), 0)
})

const totalCredits = computed(() => {
  return progression.value.reduce((total, module) => total + (module.credits || 0), 0)
})

// Méthodes
const fetchProfessorData = async () => {
  loading.value = true
  try {
    const response = await axios.get(`/api/v1/professor/${professorId}`)
    professor.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    loading.value = false
  }
}



const viewSchedule = () => {
  console.log('Voir l\'emploi du temps')
}



const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const modulesLearned = ref<ModuleInterface[]>([])

const fetchModulesLearned = async () => {
  try {
    const response = await axios.get(`/api/v1/modules/professor/${professorId}`)
    modulesLearned.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des modules:', error)
  }
}

onMounted(async () => {
  await fetchProfessorData()
  await fetchProfessorModules()
  await fetchModulesLearned()
})
</script>

<style scoped>
/* Base container */
.professor-detail-container {
  min-height: 100vh;
  background: var(--background-light);
  padding: 1rem 2rem 2rem 2rem;
  font-family: 'Roboto', sans-serif;
}

/* Responsive container padding */
@media (max-width: 1200px) {
  .professor-detail-container {
    padding: 1rem 1.5rem 2rem 1.5rem;
  }
}

@media (max-width: 768px) {
  .professor-detail-container {
    padding: 0.75rem 1rem 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .professor-detail-container {
    padding: 0.5rem 0.75rem 1rem 0.75rem;
  }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Content */
.detail-content {
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: hidden;
}

/* Breadcrumbs */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  flex-wrap: wrap;
}

/* Responsive breadcrumbs */
@media (max-width: 768px) {
  .breadcrumbs {
    font-size: 0.85rem;
    margin-bottom: 1rem;
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .breadcrumbs {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }

  .breadcrumb-current {
    width: 100%;
    margin-top: 0.25rem;
    padding-left: 0;
  }
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--primary-color);
}

.breadcrumb-separator {
  color: var(--text-tertiary);
}

.breadcrumb-current {
  color: var(--text-dark);
  font-weight: 500;
}

/* Professor Header Card */
.professor-header-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-light);
}

/* Responsive header card */
@media (max-width: 768px) {
  .professor-header-card {
    margin-bottom: 1rem;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 480px) {
  .professor-header-card {
    border-radius: var(--radius);
    margin-bottom: 0.75rem;
  }
}

.header-gradient {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  position: relative;
  overflow: hidden;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.header-content {
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

/* Responsive header content */
@media (max-width: 1024px) {
  .header-content {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 1.25rem;
    gap: 1.25rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
    gap: 1rem;
  }
}

.professor-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Responsive professor main info */
@media (max-width: 1024px) {
  .professor-main-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .professor-main-info {
    gap: 0.75rem;
  }
}

.professor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Responsive avatar */
@media (max-width: 768px) {
  .professor-avatar {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 480px) {
  .professor-avatar {
    width: 60px;
    height: 60px;
  }
}

.avatar-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--white);
}

/* Responsive avatar text */
@media (max-width: 768px) {
  .avatar-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .avatar-text {
    font-size: 1.1rem;
  }
}

.professor-info-section {
  color: var(--white);
}

.professor-name {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0.5rem;
}

/* Responsive professor name */
@media (max-width: 1024px) {
  .professor-name {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .professor-name {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
  }
}

@media (max-width: 480px) {
  .professor-name {
    font-size: 1.25rem;
    line-height: 1.2;
  }
}

.professor-departments {
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

/* Responsive departments */
@media (max-width: 768px) {
  .professor-departments {
    font-size: 1rem;
    margin: 0 0 0.75rem 0;
  }
}

@media (max-width: 480px) {
  .professor-departments {
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
  }
}

.professor-badges {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Responsive badges */
@media (max-width: 768px) {
  .professor-badges {
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .professor-badges {
    gap: 0.5rem;
    flex-direction: column;
  }
}

.matricule-badge,
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  color: var(--white);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.status-badge.permanent {
  background: rgba(var(--success-rgb), 0.8);
}

.status-badge.temporary {
  background: rgba(var(--warning-rgb), 0.8);
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* Responsive header actions */
@media (max-width: 1024px) {
  .header-actions {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .header-actions {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }
}

.action-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--white);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

/* Responsive action buttons */
@media (max-width: 768px) {
  .action-btn {
    padding: 0.6rem 1.25rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.tab-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Responsive tab icons */
@media (max-width: 768px) {
  .tab-icon {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .tab-icon {
    width: 18px;
    height: 18px;
  }
}

/* Quick Stats */
.quick-stats {
  background: var(--background-secondary);
  padding: 2rem;
  border-top: 1px solid var(--border-light);
}

/* Responsive quick stats */
@media (max-width: 768px) {
  .quick-stats {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .quick-stats {
    padding: 1rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

/* Responsive stats grid */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    grid-template-rows: auto;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}

.stat-card {
  background: var(--white);
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

/* Responsive stat cards */
@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem;
    border-radius: var(--radius-lg);
    gap: 0.75rem;
    min-width: 0;
    overflow: hidden;
  }
}

@media (max-width: 600px) {
  .stat-card {
    padding: 1rem;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

/* Responsive stat icons */
@media (max-width: 768px) {
  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.1rem;
  }
}

.stat-icon.stat-primary {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.stat-icon.stat-success {
  background: rgba(var(--secondary-color-rgb), 0.1);
  color: var(--secondary-color);
}

.stat-icon.stat-accent {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--accent-color);
}

.stat-icon.stat-warning {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning);
}

.stat-content {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: var(--text-dark);
}

/* Responsive stat values */
@media (max-width: 768px) {
  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.25rem;
    margin-bottom: 0.15rem;
  }
}

.stat-value.stat-blue {
  color: var(--primary-color);
}

.stat-value.stat-green {
  color: var(--secondary-color);
}

.stat-value.stat-purple {
  color: var(--accent-color);
}

.stat-value.stat-orange {
  color: var(--warning);
}

/* Salary specific styles */
.salary-value {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.salary-amount {
  font-weight: 700;
  font-size: 1.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.salary-type {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.locked-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary) !important;
  font-size: 0.9rem !important;
  font-weight: 500;
}

.lock-icon {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Responsive salary value */
@media (max-width: 768px) {
  .salary-amount {
    font-size: 1.5rem;
  }

  .locked-value {
    font-size: 0.85rem !important;
  }
}

@media (max-width: 480px) {
  .salary-amount {
    font-size: 1.25rem;
  }

  .salary-type {
    font-size: 0.8rem;
  }

  .locked-value {
    font-size: 0.8rem !important;
  }
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  word-break: break-word;
  hyphens: auto;
}

/* Responsive stat labels */
@media (max-width: 480px) {
  .stat-label {
    font-size: 0.85rem;
  }
}

/* Tabs Container */
.tabs-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
}

/* Responsive tabs container */
@media (max-width: 768px) {
  .tabs-container {
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 480px) {
  .tabs-container {
    border-radius: var(--radius);
  }
}

.tabs-header {
  border-bottom: 1px solid var(--border-light);
  background: var(--background-secondary);
}

.tabs-nav {
  display: flex;
  padding: 0 2rem;
  gap: 2rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-height: 60px;
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

/* Responsive tabs navigation */
@media (max-width: 1024px) {
  .tabs-nav {
    padding: 0 1.5rem;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .tabs-nav {
    padding: 0 1rem;
    gap: 1rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    min-height: 56px;
  }
}

@media (max-width: 480px) {
  .tabs-nav {
    padding: 0;
    flex-direction: column;
    overflow-x: visible;
    min-height: auto;
  }
}

.tab-button {
  padding: 1rem 0.5rem;
  border: none;
  background: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
  min-width: fit-content;
  text-align: center;
  justify-content: center;
  flex: 1;
  max-width: 140px;
}

.tab-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: var(--text-disabled);
}

.lock-indicator {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

/* Tab text responsive design */
.tab-text-full {
  display: inline;
}

.tab-text-short {
  display: none;
}

/* Responsive tab buttons */
@media (max-width: 768px) {
  .tab-button {
    padding: 1rem 0.3rem;
    font-size: 0.8rem;
    min-width: 80px;
    max-width: 120px;
    flex-direction: column;
    gap: 0.2rem;
  }

  .tab-text-full {
    display: none;
  }

  .tab-text-short {
    display: inline;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding: 1rem;
    justify-content: flex-start;
    border-bottom: none;
    border-left: 3px solid transparent;
    width: 100%;
    min-width: auto;
    max-width: none;
    text-align: left;
    flex-direction: row;
    gap: 0.5rem;
  }

  .tab-text-full {
    display: inline;
  }

  .tab-text-short {
    display: none;
  }

  .tab-button.active {
    border-bottom: none;
    border-left-color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.05);
  }
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

/* Tab Content */
.tab-content {
  padding: 2rem;
}

/* Responsive tab content */
@media (max-width: 768px) {
  .tab-content {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .tab-content {
    padding: 1rem;
  }
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  overflow: hidden;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

/* Filters Container */
.filters-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
  min-width: 0;
  flex: 1;
}

.filter-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-align: right;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-end;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-options::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  background: var(--white);
  border: 2px solid var(--border-light);
  color: var(--text-secondary);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
  min-width: max-content;
}

.filter-btn:hover {
  background: var(--background-secondary);
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-color: var(--primary-color);
  color: var(--white);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.filter-btn.active:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
}

.filter-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Results Section */
.modules-results {
  animation: fadeIn 0.3s ease;
}

.results-header {
  background: var(--background-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.results-count {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-info {
  color: var(--primary-color);
  font-weight: 600;
  background: rgba(var(--primary-color-rgb), 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.8rem;
}

.premium-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: var(--white);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: var(--shadow);
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 3rem;
}

/* Responsive info grid */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .info-grid {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .info-grid {
    gap: 1rem;
  }
}

.info-section {
  background: var(--background-secondary);
  padding: 2rem;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
}

/* Responsive info sections */
@media (max-width: 768px) {
  .info-section {
    padding: 1.5rem;
    border-radius: var(--radius-lg);
  }
}

@media (max-width: 480px) {
  .info-section {
    padding: 1rem;
    border-radius: var(--radius);
  }
}

.info-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
}

/* Responsive info items */
@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    padding: 0.6rem 0;
  }
}

@media (max-width: 480px) {
  .info-item {
    padding: 0.5rem 0;
    gap: 0.25rem;
  }
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 140px;
}

/* Responsive info labels */
@media (max-width: 768px) {
  .info-label {
    min-width: auto;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .info-label {
    font-size: 0.85rem;
    font-weight: 600;
  }
}

.info-value {
  color: var(--text-dark);
  font-weight: 500;
  text-align: right;
  flex: 1;
}

/* Responsive info values */
@media (max-width: 768px) {
  .info-value {
    text-align: left;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .info-value {
    font-size: 0.85rem;
  }
}

/* Department badges */
.departments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Responsive departments list */
@media (max-width: 768px) {
  .departments-list {
    justify-content: flex-start;
    gap: 0.25rem;
  }
}

.department-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

/* Responsive department badges */
@media (max-width: 480px) {
  .department-badge {
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
  }
}

.department-badge.dept-informatique {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
  border-color: rgba(66, 153, 225, 0.2);
}

.department-badge.dept-gestion {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
  border-color: rgba(102, 126, 234, 0.2);
}

.department-badge.dept-btp {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
  border-color: rgba(237, 137, 54, 0.2);
}

/* Modules Grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.empty-state-icon svg {
  width: 40px;
  height: 40px;
  color: var(--primary-color);
}

.empty-state-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.empty-state-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 500px;
}

/* Access Restricted Styles */
.access-restricted {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 300px;
}

.restricted-icon {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.restricted-icon svg {
  width: 40px;
  height: 40px;
  color: #ef4444;
}

.restricted-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.restricted-description {
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 500px;
}

/* Responsive modules grid */
@media (max-width: 1200px) {
  .modules-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .modules-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
    min-height: 250px;
  }

  .empty-state-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1.25rem;
  }

  .empty-state-icon svg {
    width: 35px;
    height: 35px;
  }

  .empty-state-title {
    font-size: 1.3rem;
  }

  .empty-state-description {
    font-size: 0.95rem;
  }

  .access-restricted {
    padding: 3rem 1.5rem;
    min-height: 250px;
  }

  .restricted-icon {
    width: 70px;
    height: 70px;
    margin-bottom: 1.25rem;
  }

  .restricted-icon svg {
    width: 35px;
    height: 35px;
  }

  .restricted-title {
    font-size: 1.3rem;
  }

  .restricted-description {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .modules-grid {
    gap: 0.75rem;
  }

  .empty-state {
    padding: 2.5rem 1rem;
    min-height: 200px;
  }

  .empty-state-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }

  .empty-state-icon svg {
    width: 30px;
    height: 30px;
  }

  .empty-state-title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .empty-state-description {
    font-size: 0.9rem;
  }

  .access-restricted {
    padding: 2.5rem 1rem;
    min-height: 200px;
  }

  .restricted-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }

  .restricted-icon svg {
    width: 30px;
    height: 30px;
  }

  .restricted-title {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }

  .restricted-description {
    font-size: 0.9rem;
  }
}

.module-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.module-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.15);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.module-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.module-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.module-code {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.module-details {
  margin: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #64748b;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #1e293b;
}

.module-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.module-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.edit-btn {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #475569;
  flex: 1;
  justify-content: center;
}

.edit-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.delete-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

/* Status badges */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid;
}

.status-active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
  border-color: #86efac;
}

.status-completed {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  border-color: #93c5fd;
}

.status-suspended {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border-color: #fca5a5;
}

.status-default {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
  border-color: #cbd5e1;
}

/* Salary Cards */
.current-salary-card {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #86efac;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

/* Responsive salary cards */
@media (max-width: 768px) {
  .current-salary-card {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .current-salary-card {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 8px;
  }
}

.salary-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #15803d;
  margin: 0 0 1.5rem 0;
}

/* Responsive salary title */
@media (max-width: 480px) {
  .salary-card-title {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
  }
}

.salary-breakdown {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
}

/* Responsive salary breakdown */
@media (max-width: 768px) {
  .salary-breakdown {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .salary-breakdown {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

.salary-item {
  text-align: center;
}

.salary-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* Responsive salary amounts */
@media (max-width: 768px) {
  .salary-amount {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .salary-amount {
    font-size: 1.1rem;
    margin-bottom: 0.25rem;
  }
}

.salary-amount.salary-gross {
  color: #16a34a;
}

.salary-amount.salary-bonus {
  color: #3b82f6;
}

.salary-amount.salary-deduction {
  color: #dc2626;
}

.salary-amount.salary-net {
  color: #1e293b;
}

.salary-label {
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Responsive salary labels */
@media (max-width: 480px) {
  .salary-label {
    font-size: 0.85rem;
  }
}

.salary-history-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.salary-history-list {
  max-height: 400px;
  overflow-y: auto;
}

.salary-entry {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s ease;
}

.salary-entry:hover {
  background: #f8fafc;
}

.salary-entry:last-child {
  border-bottom: none;
}

.entry-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entry-info h5 {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.entry-month {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.entry-breakdown {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #64748b;
}

.breakdown-item {
  display: inline;
}

.entry-total {
  text-align: right;
}

.total-amount {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
}

.total-label {
  font-size: 0.8rem;
  color: #64748b;
}

/* Performance Overview */
.performance-overview-card {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.overview-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d4ed8;
  margin: 0 0 1.5rem 0;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.overview-stat {
  text-align: center;
}

.overview-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.overview-label {
  color: #1e40af;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Performance Reviews */
.performance-reviews {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.review-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.review-info h5 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.review-period {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.review-reviewer {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.review-score {
  text-align: right;
}

.score-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.score-label {
  color: #64748b;
  font-size: 0.8rem;
}

/* Performance Metrics */
.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.metric-value {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.metric-label {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Review Feedback */
.review-feedback {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.feedback-title {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
}

.feedback-text {
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

/* Rating Colors */
.rating-excellent {
  color: #16a34a;
}

.rating-good {
  color: #3b82f6;
}

.rating-average {
  color: #f59e0b;
}

.rating-poor {
  color: #dc2626;
}

/* Amélioration de l'accessibilité et de l'UX mobile */
@media (max-width: 768px) {

  /* Amélioration du touch target */
  .action-btn,
  .filter-btn,
  .tab-button {
    min-height: 44px;
    touch-action: manipulation;
  }

  /* Espacement pour le scroll */
  .detail-content {
    padding-bottom: 2rem;
  }

  /* Amélioration de la lisibilité */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* Indication de scroll horizontal */
  .tabs-nav::after,
  .filter-options::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8));
    pointer-events: none;
  }

  .tabs-header {
    position: relative;
  }

  .filters-container {
    position: relative;
  }
}

@media (max-width: 480px) {

  /* Optimisation pour les très petits écrans */
  .professor-name {
    word-break: break-word;
    hyphens: auto;
  }

  .info-value {
    word-break: break-word;
  }

  /* Amélioration du scroll horizontal */
  .tabs-nav,
  .filter-options {
    -webkit-overflow-scrolling: touch;
  }
}

/* Améliorations générales pour l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Mode sombre responsive (si supporté) */
@media (prefers-color-scheme: dark) {
  .professor-detail-container {
    color-scheme: dark;
  }
}

.error-content {
  text-align: center;
  color: white;
}

.error-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem auto;
}

.error-text h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.error-text p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .professor-detail-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .professor-main-info {
    flex-direction: column;
    text-align: center;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .tabs-nav {
    flex-wrap: wrap;
    gap: 0;
  }

  .tab-button {
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .salary-breakdown {
    grid-template-columns: repeat(2, 1fr);
  }

  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  /* Filters responsive */
  .filters-container {
    align-items: stretch;
    width: 100%;
    overflow: hidden;
  }

  .filter-label {
    text-align: left;
    margin-bottom: 0.5rem;
  }

  .filter-options {
    justify-content: flex-start;
    gap: 0.5rem;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .filter-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    min-width: 120px;
    justify-content: center;
  }

  .results-header {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .salary-breakdown {
    grid-template-columns: 1fr;
  }

  .overview-stats {
    grid-template-columns: 1fr;
  }

  .performance-metrics {
    grid-template-columns: 1fr;
  }

  .entry-main {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .entry-total {
    text-align: left;
  }

  /* Filters small screens */
  .filter-options {
    flex-direction: row;
    gap: 0.5rem;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }

  .filter-btn {
    width: auto;
    min-width: 100px;
    flex-shrink: 0;
    justify-content: center;
  }

  .results-header {
    padding: 0.75rem 1rem;
  }

  .results-count {
    font-size: 0.85rem;
    flex-direction: column;
    gap: 0.25rem;
    text-align: center;
  }

  .filter-info {
    align-self: stretch;
    text-align: center;
  }
}
</style>
