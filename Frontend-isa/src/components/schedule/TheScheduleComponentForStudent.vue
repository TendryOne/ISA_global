<template>
  <div class="schedule-container">
    <!-- Header avec filtres et actions -->
    <div class="schedule-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <Icon icon="material-symbols:calendar-month-outline-rounded" />
            Emploi du Temps
          </h1>
          <p class="page-subtitle">Gestion des horaires et planifications par département</p>
        </div>

        <div class="header-actions">
          <div class="action-buttons">
            <button class="btn-secondary" :disabled="isRefreshing" @click="refreshSchedules">
              <Icon icon="material-symbols:refresh-rounded" :class="{ spin: isRefreshing }" />
              {{ isRefreshing ? 'Actualisation...' : 'Actualiser' }}
            </button>
            <button class="btn-secondary" @click="currentWeek = getCurrentWeek()">
              <Icon icon="material-symbols:today-outline" />
              Aujourd'hui
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation semaine/jour -->
      <div class="week-navigation">
        <button class="nav-btn" @click="previousWeek">
          <Icon icon="material-symbols:chevron-left-rounded" />
        </button>
        <div class="week-info">
          <h3 v-if="viewMode === 'week'">{{ formatWeekRange(currentWeek) }}</h3>
          <h3 v-else>{{ formatDayRange(currentWeek) }}</h3>
          <span class="week-number" v-if="viewMode === 'week'">Semaine {{ getWeekNumber(currentWeek) }}</span>
          <span class="week-number" v-else>{{ formatDayName(currentWeek) }}</span>
        </div>
        <button class="nav-btn" @click="nextWeek">
          <Icon icon="material-symbols:chevron-right-rounded" />
        </button>
      </div>

      <!-- Contrôles des emplois du temps -->
      <div class="schedule-controls">


        <div class="view-options">
          <!-- Sélecteur de vue Jour/Semaine -->
          <div class="view-selector">
            <label class="mode-label">Vue :</label>
            <div class="view-buttons">
              <button class="view-btn" :class="{ 'active': viewMode === 'day' }" @click="setViewMode('day')">
                <Icon icon="material-symbols:today-outline" />
                Jour
              </button>
              <button class="view-btn" :class="{ 'active': viewMode === 'week' }" @click="setViewMode('week')">
                <Icon icon="material-symbols:view-week-outline" />
                Semaine
              </button>
            </div>
          </div>

          <div class="display-mode">
            <label class="mode-label">Mode d'affichage :</label>
            <div class="mode-buttons">
              <button class="mode-btn" :class="{ 'active': displayMode === 'overlay' }"
                @click="displayMode = 'overlay'">
                <Icon icon="material-symbols:layers-outline" />
                Superposé
              </button>
              <button class="mode-btn" :class="{ 'active': displayMode === 'sideBySide' }"
                @click="displayMode = 'sideBySide'">
                <Icon icon="material-symbols:view-column-outline" />
                Côte à côte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Emploi du temps principal -->
    <div class="schedule-grid-container">
      <div class="schedule-grid" :class="{
        'side-by-side': displayMode === 'sideBySide',
        'day-view': viewMode === 'day',
        'week-view': viewMode === 'week'
      }">

        <!-- Barre d'heure actuelle -->
        <div v-if="isCurrentWeek() && getCurrentTimePosition() !== null" class="current-time-line"
          :style="{ top: `calc(${getCurrentTimePosition()}% + 60px)` }">
          <div class="current-time-indicator">
            <span class="current-time-text">{{ getCurrentTimeString() }}</span>
            <div class="current-time-dot"></div>
          </div>
          <div class="current-time-bar"></div>
        </div>

        <!-- Header des jours -->
        <div class="time-header"></div>
        <div v-for="day in weekDays" :key="day.key" class="day-header" :class="{
          'today': isToday(day.date),
          'saturday': day.key === 5
        }">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ formatDayDate(day.date) }}</div>
        </div>

        <!-- Lignes d'heures avec cours -->
        <template v-for="hour in timeSlots" :key="hour">
          <div class="time-slot">
            {{ hour }}
          </div>

          <div v-for="day in weekDays" :key="`${day.key}-${hour}`" class="schedule-cell" :class="{
            'cell-occupied': getCoursesForSlot(day.date, hour).length > 0,
            'cell-side-by-side': displayMode === 'sideBySide' && getCoursesForSlot(day.date, hour).length > 1,
            'cell-past': isPastDate(day.date) && getCoursesForSlot(day.date, hour).length === 0,
            'cell-disabled': isPastDate(day.date) && getCoursesForSlot(day.date, hour).length === 0
          }"
            @click="getCoursesForSlot(day.date, hour).length === 0 && !isPastDate(day.date) ? openAddModal(day.date, hour) : null"
            :style="{ cursor: isPastDate(day.date) && getCoursesForSlot(day.date, hour).length === 0 ? 'not-allowed' : 'pointer' }">

            <!-- Mode Superposé -->
            <template v-if="displayMode === 'overlay'">
              <div v-for="(schedule, index) in getCoursesForSlot(day.date, hour)" :key="schedule._id"
                v-show="hour === schedule.startTime" class="course-card overlaid-course" :class="[
                  getScheduleTypeClass(schedule),
                  `dept-${schedule.department[0]}`,
                  { 'course-conflict': false },
                  { 'course-past': isPastDate(day.date) }
                ]" :style="{
                  ...getOverlaidCourseStyle(schedule, index),
                  background: getScheduleBackground(schedule)
                }" @click.stop="openCourseDetails(schedule)">

                <!-- Indicateur MISSED au-dessus de tout, non affecté par l'opacité -->
                <div v-if="schedule.status === 'missed'" class="missed-course-indicator">
                  <div class="missed-icon">
                    <Icon icon="material-symbols:error" />
                  </div>
                </div>

                <!-- Indicateur DONE avec robot/humain selon approbation -->
                <div v-if="schedule.status === 'done'" class="done-course-indicator">
                  <!-- Robot vert si approuvé par cron -->
                  <div class="done-icon robot">
                    <Icon icon="mdi:check-decagram" />
                  </div>

                </div>

                <div class="course-header">
                  <div class="course-title-section">
                    <span class="course-code">{{ getScheduleCode(schedule) }}</span>
                    <span class="course-title">{{ schedule.title }}</span>
                  </div>
                  <div class="course-meta">
                    <span class="course-duration">{{ getDuration(schedule.duration) }}</span>
                    <div class="department-badges">
                      <span v-for="dept in schedule.department" :key="dept" class="department-badge"
                        :style="{ background: getDepartmentColor(dept) }">
                        {{ getDepartmentCode(dept) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="course-details">
                  <div class="course-info">
                    <Icon icon="material-symbols:person-outline" />
                    {{ getScheduleProfessor(schedule) }}
                  </div>
                  <div class="course-info">
                    <Icon icon="material-symbols:location-on-outline" />
                    {{ getScheduleLocation(schedule) }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Mode Côte à Côte -->
            <template v-else-if="displayMode === 'sideBySide'">
              <div class="courses-container">
                <div v-for="(schedule, index) in getCoursesForSlot(day.date, hour)" :key="schedule._id"
                  v-show="hour === schedule.startTime" class="course-card side-by-side-course" :class="[
                    getScheduleTypeClass(schedule),
                    `dept-${schedule.department[0]}`,
                    { 'course-past': isPastDate(day.date) }
                  ]" :style="{
                    ...getSideBySideStyle(schedule, index, getCoursesForSlot(day.date, hour).length),
                    background: getScheduleBackground(schedule)
                  }" @click.stop="openCourseDetails(schedule)">

                  <!-- Indicateur MISSED compact au-dessus de tout -->
                  <!-- Indicateur MISSED compact avec icône seulement -->
                  <div v-if="schedule.status === 'missed'" class="missed-course-indicator">
                    <div class="missed-icon" :class="{ 'compact': displayMode === 'sideBySide' }">
                      <Icon icon="material-symbols:error" />
                    </div>
                  </div>

                  <!-- Indicateur DONE compact avec robot/humain selon approbation -->
                  <div v-if="schedule.status === 'done'" class="done-course-indicator">
                    <!-- Robot vert si approuvé par cron -->
                    <div class="done-icon robot" :class="{ 'compact': displayMode === 'sideBySide' }">
                      <Icon icon="mdi:check-decagram" />
                    </div>
                  </div>

                  <div class="course-header compact">
                    <div class="course-title-section compact">
                      <span class="course-code small">{{ getScheduleCode(schedule) }}</span>
                      <span class="course-title">{{ schedule.title }}</span>
                    </div>
                    <span class="course-duration">{{ getDuration(schedule.duration) }}</span>
                  </div>


                  <div class="course-details compact">
                    <div class="course-info">
                      <Icon icon="material-symbols:person-outline" />
                      {{ getScheduleProfessor(schedule) }}
                    </div>
                    <div class="course-info">
                      <Icon icon="material-symbols:location-on-outline" />
                      {{ getScheduleLocation(schedule) }}
                    </div>
                    <div class="department-badges-compact">
                      <span v-for="dept in schedule.department" :key="dept" class="department-badge small"
                        :style="{ background: getDepartmentColor(dept) }">
                        {{ getDepartmentCode(dept) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Indicateur pour ajouter -->
            <!-- <div v-if="!getCoursesForSlot(day.date, hour).length" class="add-indicator">
              <Icon icon="material-symbols:add-circle-outline" />
            </div> -->
          </div>
        </template>
      </div>
    </div>

    <!-- Modal détails cours -->
    <TheScheduleModalViewForStudent :is-open="!!selectedSchedule" :course="selectedSchedule"
      @close="selectedSchedule = null" @report-absence="reportAbsence" />


    <!-- Légende des matières et départements -->
    <div class="schedule-legend">
      <div class="legend-section">
        <h4>Départements</h4>
        <div class="legend-items">
          <div v-for="dept in departments" :key="dept.id" class="legend-item">
            <div class="legend-color department-color" :style="{ background: getDepartmentColor(dept.id) }"></div>
            <span>{{ dept.name }}</span>
          </div>
        </div>
      </div>

      <div class="legend-section">
        <h4>Mode d'affichage</h4>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-color" style="background: var(--primary-color);"></div>
            <span>Mode Superposé</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--secondary-color);"></div>
            <span>Mode Côte à Côte</span>
          </div>
        </div>
      </div>


      <div class="legend-section">
        <h4>Indicateurs de statut</h4>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-indicator missed-demo">
              <Icon icon="material-symbols:error" />
            </div>
            <span>Cours manqué</span>
          </div>
          <div class="legend-item">
            <div class="legend-indicator done-human-demo">
              <Icon icon="mdi:check-decagram" />
            </div>
            <span>Cours terminé </span>
          </div>
        </div>
      </div>
    </div>
  </div>



  <SuccessToast v-if="toast.show" :message="toast.message" :type="toast.type" :title="toast.title"
    @dismissed="toast.show = false" />

</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import type ScheduleInterface from '@/interfaces/Schedule.interface'
import type ModuleInterface from '@/interfaces/module.interface'
import axios from 'axios'
import SuccessToast from '@/components/toast/successToast.vue'
import { useMyUserStore } from '@/stores/userStore'
import type StudentInterface from '@/interfaces/student.intefaces'
import TheScheduleModalViewForStudent from './TheScheduleModalViewForStudent.vue'
import type PromotionInterface from '@/interfaces/promotion.interface'


const toast = ref<{ show: boolean, message: string, type: 'success' | 'error', title: string }>({ show: false, message: '', type: 'success', title: 'Succès' })

interface Department {
  id: string
  name: string
  code: string
}




// Fonctions helper pour l'affichage
const getSubjectFromModule = (module: ModuleInterface): string => module.title

// Nouvelles fonctions pour gérer les types d'événements spéciaux
const getScheduleTypeClass = (schedule: ScheduleInterface): string => {
  // Si c'est un type "other" sans module, c'est un événement spécial
  if (schedule.courseType === 'other' && !schedule.module) {
    return 'special-event'
  }
  // Si c'est un type "other" avec module, c'est un cours spécial
  if (schedule.courseType === 'other' && schedule.module) {
    return 'special-course'
  }
  // Sinon, utiliser le module pour déterminer la classe
  if (schedule.module) {
    return `subject-${getSubjectFromModule(schedule.module)}`
  }
  return 'generic-schedule'
}

const getScheduleCode = (schedule: ScheduleInterface): string => {
  // Si pas de module (événement), afficher le type de cours
  if (!schedule.module) {
    return 'Event'
  }
  // Sinon afficher le code du module
  return schedule.module.code
}

const getScheduleLocation = (schedule: ScheduleInterface): string => {
  // Si c'est en distanciel, afficher "En ligne"
  if (schedule.type === 'distanciel' || !schedule.room) {
    return 'En ligne'
  }
  return schedule.room
}

const getScheduleProfessor = (schedule: ScheduleInterface): string => {
  // Si pas de professeur défini (cas des événements "other")
  if (!schedule.professor) {
    return 'Non assigné'
  }
  return `${schedule.professor.firstName} ${schedule.professor.name}`
}

const getScheduleBackground = (schedule: ScheduleInterface): string => {
  // Couleur spéciale pour les événements (type "other" sans module)
  if (schedule.courseType === 'other' && !schedule.module) {
    return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)'
  }

  // Couleur spéciale pour les cours spéciaux (type "other" avec module)
  if (schedule.courseType === 'other' && schedule.module) {
    return 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)'
  }

  // Couleur normale basée sur les départements
  return getMixedDepartmentColor(schedule.department)
}



const currentWeek = ref(new Date())
const selectedDepartment = ref('')
const selectedPromotion = ref('')
const selectedProfessor = ref('')
const selectedSchedule = ref<ScheduleInterface | null>(null)
const showFormModal = ref(false)
const selectedModalDate = ref<Date>()
const selectedModalTime = ref<string>()

const displayMode = ref<'overlay' | 'sideBySide'>('overlay')
const viewMode = ref<'day' | 'week'>('week')
const activeDepartments = ref(['info', 'gestion', 'btp']) // Tous actifs par défaut

// Variables pour la barre d'heure actuelle
const currentTime = ref(new Date())
let timeUpdateInterval: ReturnType<typeof setInterval> | null = null

// Mettre à jour l'heure actuelle toutes les minutes
timeUpdateInterval = setInterval(() => {
  currentTime.value = new Date()
}, 60000)

// Nettoyer l'interval lors de la destruction du composant
onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
    timeUpdateInterval = null
  }
})

const schedules = ref<ScheduleInterface[]>([]);
const editingSchedule = ref<ScheduleInterface | null>(null);

// Cache système pour éviter les requêtes inutiles
const scheduleCache = ref<Map<string, { data: ScheduleInterface[], timestamp: number }>>(new Map())
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes en millisecondes
const STALE_WHILE_REVALIDATE_DURATION = 15 * 60 * 1000 // 15 minutes (données utilisables mais à revalider)

const isRefreshing = ref(false)

// Fonction pour générer une clé de cache basée sur les dates
const generateCacheKey = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate || !endDate) return ''
  return `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`
}

// Fonction pour vérifier si le cache est valide (frais)
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION
}

// Fonction pour vérifier si les données sont utilisables (même si stale)
const isCacheUsable = (timestamp: number): boolean => {
  return Date.now() - timestamp < STALE_WHILE_REVALIDATE_DURATION
}







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

// Fonctions pour la barre d'heure actuelle
const getCurrentTimePosition = () => {
  const now = currentTime.value
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Convertir en heure décimale (ex: 14:30 = 14.5)
  const currentTimeDecimal = currentHour + (currentMinute / 60)

  // Heure de début et fin de la grille
  const startHour = 7  // 07:00
  const endHour = 18   // 18:00

  // Si on est en dehors des heures de cours, ne pas afficher la barre
  if (currentTimeDecimal < startHour || currentTimeDecimal > endHour) {
    return null
  }

  // Calculer la position en pourcentage
  const totalGridHours = endHour - startHour
  const positionFromStart = currentTimeDecimal - startHour
  const percentage = (positionFromStart / totalGridHours) * 100

  return percentage
}

const getCurrentTimeString = () => {
  return currentTime.value.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isCurrentWeek = () => {
  const now = new Date()
  const weekStart = new Date(currentWeek.value)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return now >= weekStart && now <= weekEnd
}



const departments: Department[] = [
  { id: 'info', name: 'Informatique', code: 'INFO' },
  { id: 'gestion', name: 'Gestion', code: 'GEST' },
  { id: 'btp', name: 'BTP', code: 'BTP' }
]


// Modules disponibles (après les professeurs)


const timeSlots = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
]

// Cours avec conflits d'horaires entre départements




const weekDays = computed(() => {
  const startOfWeek = new Date(currentWeek.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1) // Lundi

  if (viewMode.value === 'day') {
    // Mode jour : afficher seulement le jour actuel
    const currentDayIndex = currentWeek.value.getDay() === 0 ? 6 : currentWeek.value.getDay() - 1
    const currentDate = new Date(currentWeek.value)
    return [{
      key: currentDayIndex,
      name: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][currentDayIndex],
      date: currentDate
    }]
  }

  // Mode semaine : afficher tous les jours
  return Array.from({ length: 6 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    return {
      key: i,
      name: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][i],
      date
    }
  })
})

// Méthodes
const getCurrentWeek = () => new Date()

const nextWeek = () => {
  const newWeek = new Date(currentWeek.value)
  if (viewMode.value === 'day') {
    newWeek.setDate(newWeek.getDate() + 1)
  } else {
    newWeek.setDate(newWeek.getDate() + 7)
  }
  currentWeek.value = newWeek
}

const previousWeek = () => {
  const newWeek = new Date(currentWeek.value)
  if (viewMode.value === 'day') {
    newWeek.setDate(newWeek.getDate() - 1)
  } else {
    newWeek.setDate(newWeek.getDate() - 7)
  }
  currentWeek.value = newWeek
}

const setViewMode = (mode: 'day' | 'week') => {
  viewMode.value = mode
}

const formatWeekRange = (date: Date) => {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 5) // Jusqu'au samedi maintenant

  return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

// Fonction simplifiée pour passer à la semaine suivante si nécessaire
const checkAndAdvanceWeek = () => {
  const now = new Date()

  // Si on est dimanche, passer à la semaine suivante seulement si on n'y est pas déjà
  if (now.getDay() === 0) {
    const mondayOfCurrentDisplayedWeek = new Date(currentWeek.value)
    mondayOfCurrentDisplayedWeek.setDate(mondayOfCurrentDisplayedWeek.getDate() - mondayOfCurrentDisplayedWeek.getDay() + 1)

    const mondayOfThisWeek = new Date(now)
    mondayOfThisWeek.setDate(mondayOfThisWeek.getDate() - mondayOfThisWeek.getDay() + 1)

    // Si la semaine affichée n'est pas la semaine courante, l'ajuster
    if (mondayOfCurrentDisplayedWeek.getTime() !== mondayOfThisWeek.getTime()) {
      currentWeek.value = mondayOfThisWeek
    }
  }
}

const endDate = ref<Date | null>(null)
const startDate = ref<Date | null>(null)

const getWeekRangeForDB = () => {
  if (viewMode.value === "day") {

  }
  const start = new Date(currentWeek.value)
  start.setDate(start.getDate() - start.getDay() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 5) // Jusqu'au samedi

  endDate.value = end
  startDate.value = start
}

const getWeekNumber = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + start.getDay() + 1) / 7)
}

const formatDayRange = (date: Date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatDayName = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { weekday: 'long' })
}

const formatDayDate = (date: Date) => {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const isToday = (date: Date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isPastDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  const compareDate = new Date(date)
  compareDate.setHours(0, 0, 0, 0)
  return compareDate < today
}



const getDepartmentColor = (deptId: string) => {
  const colors = {
    'informatique': 'var(--primary-color)',   // Bleu primaire
    'gestion': 'var(--secondary-color)',      // Vert secondaire
    'administration': 'var(--tertiary-color)', // Gris tertiaire
    'info': 'var(--primary-color)',          // Alias pour informatique
    'admin': 'var(--tertiary-color)',        // Alias pour administration
    'gest': 'var(--secondary-color)'         // Alias pour gestion
  }
  return colors[deptId.toLowerCase() as keyof typeof colors] || 'var(--gray)'
}

// Nouvelle fonction pour gérer les couleurs mixtes
const getMixedDepartmentColor = (departments: string[]) => {
  if (departments.length === 1) {
    const dept = departments[0].toLowerCase();
    // Utiliser un gradient avec la couleur principale et sa variante dark
    if (dept === 'informatique' || dept === 'info') {
      return 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)';
    } else if (dept === 'gestion' || dept === 'gest') {
      return 'linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%)';
    } else if (dept === 'administration' || dept === 'admin') {
      return 'linear-gradient(135deg, var(--tertiary-color) 0%, var(--tertiary-dark) 100%)';
    }
    return 'linear-gradient(135deg, var(--gray) 0%, var(--gray-dark) 100%)';
  }

  // Pour les départements multiples, on crée des gradients avec les couleurs bold
  if (departments.length === 2) {
    const dept1 = departments[0].toLowerCase();
    const dept2 = departments[1].toLowerCase();

    const getColorPair = (dept: string) => {
      if (dept === 'informatique' || dept === 'info') return ['var(--primary-color)', 'var(--primary-dark)'];
      if (dept === 'gestion' || dept === 'gest') return ['var(--secondary-color)', 'var(--secondary-dark)'];
      if (dept === 'administration' || dept === 'admin') return ['var(--tertiary-color)', 'var(--tertiary-dark)'];
      return ['var(--gray)', 'var(--gray-dark)'];
    };

    const [color1, dark1] = getColorPair(dept1);
    const [color2, dark2] = getColorPair(dept2);

    return `linear-gradient(45deg, ${color1} 0%, ${dark1} 25%, ${color2} 75%, ${dark2} 100%)`;
  } else if (departments.length === 3) {
    const dept1 = departments[0].toLowerCase();
    const dept2 = departments[1].toLowerCase();
    const dept3 = departments[2].toLowerCase();

    const getColorPair = (dept: string) => {
      if (dept === 'informatique' || dept === 'info') return ['var(--primary-color)', 'var(--primary-dark)'];
      if (dept === 'gestion' || dept === 'gest') return ['var(--secondary-color)', 'var(--secondary-dark)'];
      if (dept === 'administration' || dept === 'admin') return ['var(--tertiary-color)', 'var(--tertiary-dark)'];
      return ['var(--gray)', 'var(--gray-dark)'];
    };

    const [color1, dark1] = getColorPair(dept1);
    const [color2, dark2] = getColorPair(dept2);
    const [color3, dark3] = getColorPair(dept3);

    return `linear-gradient(120deg, ${color1} 0%, ${dark1} 16%, ${color2} 33%, ${dark2} 50%, ${color3} 66%, ${dark3} 100%)`;
  }

  return getDepartmentColor(departments[0])
}

const getDepartmentCode = (departmentName: string): string => {
  const codes = {
    'Informatique': 'INFO',
    'informatique': 'INFO',
    'Gestion': 'GEST',
    'gestion': 'GEST',
    'BTP': 'BTP',
    'btp': 'BTP'
  }
  return codes[departmentName as keyof typeof codes] || departmentName.substring(0, 4).toUpperCase()
}

const getSideBySideStyle = (schedule: ScheduleInterface, index: number, totalCourses: number) => {
  const startTime = timeToMinutes(schedule.startTime)
  const endTime = timeToMinutes(schedule.endTime)
  const durationInHours = (endTime - startTime) / 60

  const baseHeight = (durationInHours * 60) + ((durationInHours - 1) * 1)
  const width = totalCourses > 1 ? `${98 / totalCourses}%` : '98%'
  const left = totalCourses > 1 ? `${(index * 100) / totalCourses}%` : '1%'

  return {
    height: `${baseHeight}px`,
    width: width,
    left: left,
    position: 'absolute' as const,
    top: '2px',
    zIndex: 10 + index
  }
}

const getCoursesForSlot = (date: Date, hour: string) => {
  return schedules.value.filter(schedule => {
    const scheduleDate = new Date(schedule.date).toDateString()
    const slotDate = date.toDateString()

    // Vérifier si c'est le même jour
    if (scheduleDate !== slotDate) return false

    // Filtrer par département si sélectionné
    if (selectedDepartment.value && !schedule.department.includes(getDepartmentName(selectedDepartment.value).toLowerCase() as 'informatique' | 'btp' | 'gestion')) {
      return false
    }

    // Filtrer par promotion si sélectionnée
    if (selectedPromotion.value && !schedule.promotions.includes(selectedPromotion.value)) {
      return false
    }

    // Filtrer par professeur si sélectionné
    if (selectedProfessor.value && schedule.professor._id !== selectedProfessor.value) {
      return false
    }

    // Filtrer par départements actifs
    const activeDeptNames = activeDepartments.value.map(deptId => {
      const dept = departments.find(d => d.id === deptId)
      return dept?.name?.toLowerCase()
    }).filter(Boolean)

    if (!activeDeptNames.some(activeDept => schedule.department.includes(activeDept as 'informatique' | 'btp' | 'gestion'))) {
      return false
    }

    // Convertir les heures en minutes pour faciliter la comparaison
    const slotTime = timeToMinutes(hour)
    const scheduleStartTime = timeToMinutes(schedule.startTime)
    const scheduleEndTime = timeToMinutes(schedule.endTime)

    // Vérifier si le créneau horaire est dans la plage du cours
    return slotTime >= scheduleStartTime && slotTime < scheduleEndTime
  })
}

const getDepartmentName = (deptId: string) => {
  const dept = departments.find(d => d.id === deptId)
  return dept?.name || ''
}

// Helper function pour convertir une heure "HH:mm" en minutes
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper function pour calculer le style des cours superposés
const getOverlaidCourseStyle = (schedule: ScheduleInterface, index: number) => {
  const startTime = timeToMinutes(schedule.startTime)
  const endTime = timeToMinutes(schedule.endTime)
  const durationInHours = (endTime - startTime) / 60

  const baseHeight = (durationInHours * 60) + ((durationInHours - 1) * 1)
  const offsetX = index * 6 // Décalage horizontal pour la superposition
  const offsetY = index * 4 // Décalage vertical pour la superposition

  return {
    height: `${baseHeight}px`,
    transform: `translate(${offsetX}px, ${offsetY}px)`,
    zIndex: 10 + index,
    boxShadow: index > 0 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
  }
}

const openCourseDetails = (schedule: ScheduleInterface) => {
  selectedSchedule.value = schedule
}

const openAddModal = (date?: Date, hour?: string) => {
  selectedModalDate.value = date
  selectedModalTime.value = hour
  editingSchedule.value = null
  showFormModal.value = true
}







// Fonction pour revalider en arrière-plan (stale-while-revalidate)
const revalidateInBackground = async (cacheKey: string, startDateStr: string, endDateStr: string) => {
  try {
    const response = (await axios.get("/api/v1/schedules/by-range", {
      params: {
        startDate: startDateStr,
        endDate: endDateStr
      }
    })).data

    // Mettre à jour le cache avec les nouvelles données
    scheduleCache.value.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    // Mettre à jour les données affichées si c'est toujours la même période
    const currentCacheKey = generateCacheKey(startDate.value, endDate.value)
    if (cacheKey === currentCacheKey) {
      schedules.value = response
    }

    // Nettoyer les anciens caches
    cleanupOldCache()
  } catch (error) {
    console.log('❌ Erreur lors de la revalidation en arrière-plan:', error)
  }
}

const userStore = useMyUserStore();
const user = useMyUserStore().currentUser as StudentInterface

const activePromotion = computed(() => {
  return user.parcours?.find(p => p.status === 'in progress');
})

const getWeekSchedules = async () => {
  try {
    if (!userStore.currentUser || !userStore.currentUser._id) {
      return
    }


    // Générer la clé de cache pour cette période
    const cacheKey = generateCacheKey(startDate.value, endDate.value)

    // Vérifier si nous avons des données en cache
    if (cacheKey && scheduleCache.value.has(cacheKey)) {
      const cachedData = scheduleCache.value.get(cacheKey)!

      if (isCacheValid(cachedData.timestamp)) {
        // Cache frais - utiliser directement
        schedules.value = cachedData.data
        return
      } else if (isCacheUsable(cachedData.timestamp)) {
        schedules.value = cachedData.data

        revalidateInBackground(cacheKey, startDate.value!.toISOString().split('T')[0], endDate.value!.toISOString().split('T')[0])
        return
      } else {
        // Cache trop ancien - le supprimer
        scheduleCache.value.delete(cacheKey)
      }
    }
    const response = (await axios.get(`/api/v1/schedules/promotion/${(activePromotion.value?.promotion as PromotionInterface)._id}`, {
      params: {
        startDate: startDate.value,
        endDate: endDate.value
      }
    })).data

    schedules.value = response

    // Mettre en cache les nouvelles données
    if (cacheKey) {
      scheduleCache.value.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      })

      // Nettoyer les anciens caches (garder seulement les 10 plus récents)
      cleanupOldCache()
    }

  } catch (error) {
    console.log(error);
  }
}

const refreshSchedules = async () => {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    getWeekRangeForDB()

    const cacheKey = generateCacheKey(startDate.value, endDate.value)
    if (cacheKey) {
      scheduleCache.value.delete(cacheKey)
    }

    await getWeekSchedules()

    toast.value = {
      show: true,
      message: 'Emploi du temps actualisé.',
      type: 'success',
      title: 'Actualisé'
    }
  } catch {
    toast.value = {
      show: true,
      message: "Une erreur est survenue lors de l'actualisation.",
      type: 'error',
      title: 'Erreur'
    }
  } finally {
    isRefreshing.value = false
  }
}

// Fonction pour nettoyer les anciens caches
const cleanupOldCache = () => {
  const cacheEntries = Array.from(scheduleCache.value.entries())

  // Si nous avons plus de 10 entrées, garder seulement les 10 plus récentes
  if (cacheEntries.length > 10) {
    const sortedEntries = cacheEntries.sort((a, b) => b[1].timestamp - a[1].timestamp)
    const entriesToKeep = sortedEntries.slice(0, 10)

    // Recréer le cache avec seulement les entrées récentes
    scheduleCache.value.clear()
    entriesToKeep.forEach(([key, value]) => {
      scheduleCache.value.set(key, value)
    })

  }
}



// Watcher pour réinitialiser la sélection de promotion quand le département change
watch(selectedDepartment, (newDepartment, oldDepartment) => {
  // Si le département a changé (et n'est pas juste initialisé)
  if (oldDepartment !== undefined && newDepartment !== oldDepartment) {
    selectedPromotion.value = '' // Réinitialise à "Toutes les promotions"
  }
})

watch(
  [currentWeek, viewMode, () => (activePromotion.value?.promotion as PromotionInterface)._id],
  async () => {
    getWeekRangeForDB()
    await getWeekSchedules()
  },
  { immediate: true }
)



const reportAbsence = async (schedule: ScheduleInterface) => {
  try {
    const response = await axios.patch(`/api/v1/schedules/reclamation/${schedule._id}`);
    if (response.data) {
      // Mettre à jour le statut localement
      const index = schedules.value.findIndex(s => s._id === schedule._id)
      if (index !== -1) {
        schedules.value[index].studentReclamations.push({
          matricule: user.matricule,
          role: 'student',
        })
        selectedSchedule.value?.studentReclamations.push({
          matricule: user.matricule,
          role: 'student',
        })
      }
    }


    toast.value = {
      show: true,
      message: `Absence signalée pour le cours ${getScheduleCode(schedule)} le ${new Date(schedule.date).toLocaleDateString('fr-FR')}.`,
      type: 'success',
      title: 'Absence signalée'
    }
  } catch (error: unknown) {
    const serverMessage = axios.isAxiosError(error) ? error.response?.data : undefined
    const message = typeof serverMessage === 'string'
      ? serverMessage
      : "Une erreur est survenue lors du signalement de l'absence."

    toast.value = {
      show: true,
      message,
      type: 'error',
      title: 'Erreur'
    }
  }

}


onMounted(() => {
  checkAndAdvanceWeek()

  const weekCheckInterval = setInterval(() => {
    checkAndAdvanceWeek()
  }, 1000 * 60 * 60)

  onUnmounted(() => {
    clearInterval(weekCheckInterval)
  })
})
</script>

<style scoped>
.schedule-container {
  min-height: 100vh;
  background: var(--background-light);
  padding: 1.5rem;
}

.schedule-header {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-dark);
}

.page-title .iconify {
  color: var(--primary-color);
  font-size: 2rem;
}

.page-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;
}

.filters-group {
  display: flex;
  gap: 1rem;
}

.elite-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius);
  background: white;
  font-size: 0.9rem;
  min-width: 180px;
  transition: all 0.2s ease;
}

.elite-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--gray-light);
  color: var(--text-dark);
  border: 2px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--gray);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: var(--error-dark);
}

.week-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border-light);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.1);
}

.week-info {
  text-align: center;
}

.week-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.4rem;
  color: var(--text-dark);
}

.week-number {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.schedule-grid-container {
  background: white;
  border-radius: var(--radius-lg);
  overflow-x: auto;
  /* Permettre le scroll horizontal si nécessaire */
  overflow-y: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
}

.schedule-grid {
  display: grid;
  grid-template-columns: 70px repeat(6, minmax(110px, 1fr));
  /* Largeur minimale plus importante */
  min-height: 600px;
  min-width: 700px;
  /* Largeur minimale pour assurer la visibilité du samedi */
  border: 1px solid var(--border-light);
  position: relative;
}

/* Mode jour - affichage d'une seule colonne */
.schedule-grid.day-view {
  grid-template-columns: 80px minmax(300px, 1fr);
  min-width: 400px;
}

/* Barre d'heure actuelle */
.current-time-line {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 100;
  pointer-events: none;
  display: flex;
  align-items: center;
}

.current-time-indicator {
  position: relative;
  display: flex;
  align-items: center;
  background: #ea4335;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
  box-shadow: 0 2px 8px rgba(234, 67, 53, 0.3);
  z-index: 101;
}

.current-time-text {
  margin-right: 0.5rem;
  letter-spacing: 0.5px;
}

.current-time-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: current-time-pulse 2s ease-in-out infinite;
}

.current-time-bar {
  flex: 1;
  height: 2px;
  background: #ea4335;
  margin-left: 0.5rem;
  box-shadow: 0 1px 3px rgba(234, 67, 53, 0.3);
}

@keyframes current-time-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
}

.time-header {
  background: var(--background-light);
  border-right: 1px solid var(--border-light);
}

.day-header {
  background: var(--background-light);
  padding: 1rem 0.75rem;
  text-align: center;
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}

.day-header.today {
  background: var(--primary-color);
  color: white;
}

.day-header.saturday {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #4a148c;
  border-left: 3px solid #9c27b0;
}

.day-name {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.day-date {
  font-size: 0.75rem;
  opacity: 0.8;
}

.time-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-light);
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  font-weight: 500;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.schedule-cell {
  position: relative;
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  min-height: 60px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background:
    linear-gradient(to right, var(--border-light) 1px, transparent 1px),
    linear-gradient(to bottom, var(--border-light) 1px, transparent 1px);
  background-size: 100% 100%;
}

.schedule-cell:hover {
  background: var(--background-light);
}

.schedule-cell.cell-occupied {
  cursor: default;
}

.schedule-cell.cell-occupied:hover {
  background: inherit;
}

.schedule-cell.cell-past {
  background: var(--gray-extra-light);
  opacity: 1;
  cursor: not-allowed;
}

.schedule-cell.cell-disabled {
  pointer-events: none;
}

.schedule-cell.cell-past:hover {
  background: var(--gray-super-light);
}

.schedule-cell.cell-occupied-extended {
  /* Cellule occupée par un cours qui commence ailleurs */
  background: rgba(0, 0, 0, 0.02);
}

.schedule-cell.cell-occupied-extended:hover {
  background: rgba(0, 0, 0, 0.02);
}

/* Indicateur spécial pour cours manqués - TOUJOURS VISIBLE */
/* Indicateur MISSED amélioré */
.missed-course-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1000;
  pointer-events: none;
  opacity: 1 !important;
  filter: none !important;
}

.missed-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ff1744 0%, #d50000 100%);
  color: white;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow:
    0 0 0 2px #ff1744,
    0 2px 6px rgba(0, 0, 0, 0.5);
  animation: missed-pulse 2s ease-in-out infinite;
}

.missed-icon.compact {
  width: 16px;
  height: 16px;
  border-width: 1.5px;
}

.missed-icon .iconify {
  width: 12px;
  height: 12px;
}

.missed-icon.compact .iconify {
  width: 10px;
  height: 10px;
}

@keyframes missed-pulse {

  0%,
  100% {
    box-shadow:
      0 0 0 2px #ff1744,
      0 2px 6px rgba(0, 0, 0, 0.5);
    transform: scale(1);
  }

  50% {
    box-shadow:
      0 0 0 3px #ff5722,
      0 4px 10px rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
}

/* S'assurer que l'indicateur reste visible même quand le cours est grisé */
.course-card.course-past .missed-course-indicator {
  opacity: 1 !important;
  filter: none !important;
}

.course-card.course-past .missed-badge {
  opacity: 1 !important;
  filter: none !important;
}

/* Indicateur DONE - même position et style que MISSED mais en vert */
.done-course-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 1000;
  pointer-events: none;
  opacity: 1 !important;
  filter: none !important;
}

.done-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  height: 25px;
  color: white;
  border-radius: 50%;
  border: 2px solid white;
  /* Box-shadow sera définie individuellement pour chaque type */
}

.done-icon.robot {
  background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  box-shadow:
    0 0 0 2px #00e676,
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.done-icon.human {
  background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  box-shadow:
    0 0 0 2px #00e676,
    0 2px 6px rgba(0, 0, 0, 0.5);
}

.done-icon.compact {
  width: 20px;
  height: 20px;
  border-width: 1.5px;
}

.done-icon .iconify {
  width: 12px;
  height: 12px;
}

.done-icon.compact .iconify {
  width: 10px;
  height: 10px;
}

/* S'assurer que l'indicateur DONE reste visible même quand le cours est grisé */
.course-card.course-past .done-course-indicator {
  opacity: 1 !important;
  filter: none !important;
}

.course-card.course-past .done-icon {
  opacity: 1 !important;
  filter: none !important;
}

.course-card {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border-radius: var(--radius);
  padding: 0.75rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: visible;
  /* Permet aux indicateurs de déborder */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.course-card.extended-course {
  /* Le cours étendu garde sa hauteur calculée dynamiquement */
  bottom: auto;
  z-index: 10;
}

.course-card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}

.course-card.extended-course:hover {
  transform: none;
  /* Pas de scale pour les cours étendus pour éviter les chevauchements */
  box-shadow: var(--shadow-lg);
}

.course-card.course-past {
  filter: contrast(0.7);
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.course-title {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.course-duration {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.4rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.course-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.course-info .iconify {
  width: 12px;
  height: 12px;
}

/* Styles spéciaux pour les événements */
.course-card.special-event {
  border: 2px solid rgba(139, 92, 246, 0.8);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
  animation: special-event-pulse 3s ease-in-out infinite;
}

.course-card.special-course {
  border: 2px solid rgba(245, 158, 11, 0.8);
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
}

@keyframes special-event-pulse {

  0%,
  100% {
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
    transform: scale(1);
  }

  50% {
    box-shadow: 0 0 25px rgba(139, 92, 246, 0.6);
    transform: scale(1.01);
  }
}

.course-card.special-event .course-code {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.course-card.special-course .course-code {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
}

.add-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-tertiary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.schedule-cell:hover .add-indicator {
  opacity: 1;
}

.add-indicator .iconify {
  font-size: 1.5rem;
}

/* Contrôles des emplois du temps */
.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 0;
  border-top: 1px solid var(--border-light);
  margin-top: 0.75rem;
}

.schedule-tabs {
  display: flex;
  gap: 1rem;
}

.department-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  position: relative;
}

.department-tab:hover {
  border-color: var(--dept-color);
  color: var(--text-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.department-tab.active {
  background: var(--dept-color);
  border-color: var(--dept-color);
  color: white;
  box-shadow: var(--shadow-lg);
}

.tab-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0.75rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  margin: 0 0.75rem;
}

.view-selector,
.display-mode {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.2s ease;
}

.view-selector:hover,
.display-mode:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.mode-label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
  white-space: nowrap;
  margin-right: 0.25rem;
}

.mode-buttons,
.view-buttons {
  display: flex;
  gap: 0.25rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
  border: 1px solid var(--border-light);
}

.mode-btn,
.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.mode-btn:hover,
.view-btn:hover {
  color: var(--text-dark);
  background: rgba(var(--primary-rgb), 0.1);
  transform: translateY(-1px);
}

.mode-btn.active,
.view-btn.active {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.mode-btn .iconify,
.view-btn .iconify {
  font-size: 1.1rem;
  transition: transform 0.2s ease;
}

.mode-btn:hover .iconify,
.view-btn:hover .iconify {
  transform: scale(1.1);
}

.mode-btn.active .iconify,
.view-btn.active .iconify {
  transform: scale(1.05);
}

/* Styles pour l'affichage côte à côte */
.schedule-grid.side-by-side .schedule-cell {
  overflow: visible;
}

.cell-side-by-side {
  position: relative;
  overflow: visible;
}

.courses-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.side-by-side-course {
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: var(--radius);
  padding: 0.4rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.side-by-side-course:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
  z-index: 100 !important;
}

.course-header.compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.3rem;
  gap: 0.3rem;
}

.course-header.compact .course-title {
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.1;
  flex: 1;
}

.course-header.compact .course-duration {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.1rem 0.3rem;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 600;
  white-space: nowrap;
}

.course-details.compact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.course-details.compact .course-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.65rem;
  opacity: 0.95;
}

.course-details.compact .course-info .iconify {
  width: 10px;
  height: 10px;
}

/* Styles pour les badges de département */
.department-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  display: inline-block;
  margin-left: 0.5rem;
}

.department-badges {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  align-items: center;
}

.department-badges-compact {
  display: flex;
  gap: 0.2rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.3rem;
}

.department-badge.small {
  padding: 0.1rem 0.3rem;
  border-radius: 8px;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: white;
  margin: 0;
}

/* Styles pour l'affichage du code de cours */
.course-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.course-title-section.compact {
  gap: 0.1rem;
}

.course-code {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.15);
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  align-self: flex-start;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.course-code.small {
  font-size: 0.6rem;
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}

.course-title {
  font-weight: 600;
  color: white;
  line-height: 1.2;
}

/* Couleurs des départements avec variables CSS */
.dept-informatique {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-darker) 100%);
}

.dept-gestion {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-darker) 100%);
}

.dept-btp {
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-dark) 100%);
}

.department-select {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  border-color: var(--primary-color);
  font-weight: 600;
}

.department-select option {
  background: white;
  color: var(--text-dark);
}

/* Styles pour la superposition de cours */
.cell-overlay {
  position: relative;
  overflow: visible;
}

.overlaid-course {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: auto;
  border-radius: var(--radius);
  padding: 0.6rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.overlaid-course.course-secondary {
  opacity: 0.85;
  border-style: dashed;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.schedule-indicator {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.4rem;
  border-radius: 8px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.department-info {
  font-style: italic;
  opacity: 0.9;
}

/* Styles pour les types d'emploi du temps */
.schedule-primary .course-card {
  border-left: 4px solid #3B82F6;
}

.schedule-secondary .course-card {
  border-left: 4px solid #EF4444;
  opacity: 0.9;
}

/* Couleurs des matières mises à jour avec variables CSS */
.subject-math {
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-dark) 100%);
}

.subject-info {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-darker) 100%);
}

.subject-physics {
  background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%);
}

.subject-english {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%);
}

.subject-management {
  background: linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary-darker) 100%);
}

.subject-project {
  background: linear-gradient(135deg, var(--tertiary-light) 0%, var(--tertiary-darker) 100%);
}

.subject-construction {
  background: linear-gradient(135deg, var(--warning) 0%, var(--warning-dark) 100%);
}

.subject-economics {
  background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
}

.subject-accounting {
  background: linear-gradient(135deg, var(--warning-light) 0%, var(--warning-dark) 100%);
}

.subject-law {
  background: linear-gradient(135deg, var(--tertiary-color) 0%, var(--tertiary-darker) 100%);
}

.course-conflict {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.8;
  }
}

/* Légende */
.schedule-legend {
  background: white;
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.legend-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-dark);
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-dark);
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: var(--radius);
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

/* Indicateurs pour la légende */
.legend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.missed-demo {
  background: linear-gradient(135deg, #ff1744 0%, #d50000 100%);
  color: white;
}

.done-robot-demo {
  background: linear-gradient(135deg, #00bfff 0%, #0099cc 100%);
  color: white;
}

.done-human-demo {
  background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
  color: white;
}

.legend-indicator .iconify {
  width: 12px;
  height: 12px;
}

/* Responsive */
/* Large screens */
@media (min-width: 1400px) {
  .schedule-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .schedule-grid {
    grid-template-columns: 80px repeat(6, minmax(180px, 1fr));
    min-width: 1200px;
  }

  .schedule-grid.day-view {
    grid-template-columns: 80px minmax(400px, 1fr);
    min-width: 500px;
  }

  .course-card {
    padding: 1rem;
  }

  .course-title {
    font-size: 1rem;
  }

  .course-details {
    gap: 0.75rem;
  }
}

/* Medium-large screens - quand la sidebar est ouverte */
@media (min-width: 1200px) and (max-width: 1399px) {
  .schedule-grid {
    grid-template-columns: 80px repeat(6, minmax(140px, 1fr));
    min-width: 1000px;
  }

  .schedule-grid.day-view {
    grid-template-columns: 80px minmax(350px, 1fr);
    min-width: 450px;
  }
}

@media (max-width: 1200px) {
  .schedule-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .schedule-tabs {
    justify-content: center;
    flex-wrap: wrap;
  }

  .department-tab {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .view-options {
    justify-content: center;
  }

  .schedule-grid {
    grid-template-columns: 70px repeat(6, minmax(120px, 1fr));
    min-width: 850px;
  }
}

@media (max-width: 1024px) {
  .schedule-container {
    padding: 1.5rem;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .filters-group {
    flex-direction: column;
    gap: 0.75rem;
  }

  .action-buttons {
    justify-content: center;
    flex-direction: row;
    gap: 1rem;
  }

  .view-options {
    flex-direction: column;
    gap: 1rem;
    margin: 0 0.5rem;
    padding: 0.75rem;
  }

  .view-selector,
  .display-mode {
    justify-content: center;
    padding: 0.5rem 0.75rem;
  }

  .mode-label {
    font-size: 0.85rem;
  }

  .mode-btn,
  .view-btn {
    padding: 0.45rem 0.75rem;
    font-size: 0.8rem;
  }

  .schedule-grid {
    grid-template-columns: 60px repeat(6, minmax(100px, 1fr));
  }

  .schedule-grid.day-view {
    grid-template-columns: 60px minmax(280px, 1fr);
    min-width: 350px;
  }

  .course-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
  }

  .course-meta {
    align-self: flex-end;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .schedule-container {
    padding: 1rem;
  }

  .schedule-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }

  .page-title {
    font-size: 1.5rem;
    text-align: center;
  }

  .page-title .iconify {
    font-size: 2rem;
  }

  .page-subtitle {
    text-align: center;
    font-size: 1rem;
  }

  .header-actions {
    align-items: stretch;
  }

  .filters-group {
    flex-direction: column;
  }

  .elite-select {
    min-width: auto;
    width: 100%;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-primary,
  .btn-secondary {
    justify-content: center;
    padding: 1rem 1.5rem;
  }

  .week-navigation {
    gap: 1rem;
    padding: 1rem 0;
    flex-wrap: wrap;
    justify-content: center;
  }

  .week-info {
    order: 2;
    text-align: center;
  }

  .week-info h3 {
    font-size: 1.2rem;
  }

  .nav-btn {
    padding: 0.75rem;
  }

  .schedule-tabs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .department-tab {
    padding: 0.75rem 1rem;
    text-align: center;
  }

  .view-options {
    flex-direction: column;
    gap: 1rem;
    margin: 0;
    padding: 1rem 0.5rem;
  }

  .view-selector,
  .display-mode {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .mode-buttons,
  .view-buttons {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .mode-btn,
  .view-btn {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
  }

  .schedule-grid-container {
    margin-bottom: 1.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 0 0.5rem;
    /* Indicateurs de scroll */
    background:
      linear-gradient(90deg, white 30%, transparent),
      linear-gradient(90deg, transparent, white 70%) 100% 0,
      radial-gradient(farthest-side at 0 50%, rgba(0, 0, 0, .2), transparent),
      radial-gradient(farthest-side at 100% 50%, rgba(0, 0, 0, .2), transparent) 100% 0;
    background-repeat: no-repeat;
    background-color: white;
    background-size: 40px 100%, 40px 100%, 14px 100%, 14px 100%;
    background-attachment: local, local, scroll, scroll;
  }

  .schedule-grid {
    grid-template-columns: 50px repeat(6, minmax(95px, 1fr));
    min-width: 650px;
  }

  .time-slot {
    font-size: 0.75rem;
    padding: 0.25rem;
    writing-mode: horizontal-tb;
  }

  .day-header {
    padding: 0.75rem 0.25rem;
  }

  .day-name {
    font-size: 0.85rem;
  }

  .day-date {
    font-size: 0.7rem;
  }

  .schedule-cell {
    min-height: 50px;
  }

  .course-card {
    padding: 0.5rem;
  }

  .course-card.extended-course {
    padding: 0.4rem;
  }

  .course-header {
    margin-bottom: 0.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .course-title-section {
    width: 100%;
  }

  .course-code {
    font-size: 0.6rem;
    padding: 0.05rem 0.3rem;
  }

  .course-title {
    font-size: 0.75rem;
    line-height: 1.1;
  }

  .course-meta {
    align-self: flex-end;
    flex-direction: row;
    gap: 0.3rem;
  }

  .course-duration {
    font-size: 0.6rem;
  }

  .department-badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem;
  }

  .course-details {
    gap: 0.25rem;
  }

  .course-info {
    font-size: 0.7rem;
  }

  .course-info .iconify {
    width: 12px;
    height: 12px;
  }

  /* Mode côte à côte responsive */
  .course-header.compact {
    gap: 0.2rem;
  }

  .course-title-section.compact {
    gap: 0.05rem;
  }

  .course-code.small {
    font-size: 0.55rem;
    padding: 0.05rem 0.25rem;
  }

  .course-header.compact .course-title {
    font-size: 0.7rem;
  }

  .course-header.compact .course-duration {
    font-size: 0.55rem;
    padding: 0.05rem 0.25rem;
  }

  .department-badge.small {
    font-size: 0.5rem;
    padding: 0.05rem 0.2rem;
  }

  .course-details.compact .course-info {
    font-size: 0.6rem;
  }

  .course-details.compact .course-info .iconify {
    width: 10px;
    height: 10px;
  }

  /* Légende responsive */
  .schedule-legend {
    padding: 1.5rem;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .legend-items {
    gap: 0.75rem;
  }

  .legend-item {
    font-size: 0.8rem;
  }

  .legend-color {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .schedule-container {
    padding: 0.75rem;
  }

  .schedule-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.3rem;
  }

  .page-title .iconify {
    font-size: 1.5rem;
  }

  .header-actions {
    gap: 0.75rem;
  }

  .action-buttons {
    gap: 0.5rem;
  }

  .week-navigation {
    gap: 0.5rem;
    padding: 0.75rem 0;
  }

  .week-info h3 {
    font-size: 1rem;
  }

  .week-number {
    font-size: 0.8rem;
  }

  .nav-btn {
    padding: 0.5rem;
    min-width: 40px;
    min-height: 40px;
  }

  .schedule-tabs {
    gap: 0.25rem;
  }

  .department-tab {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .mode-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }

  .view-options {
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0.75rem 0.25rem;
  }

  .view-selector,
  .display-mode {
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.5rem;
  }

  .mode-label {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .mode-buttons,
  .view-buttons {
    width: 100%;
    max-width: 250px;
    margin: 0 auto;
    padding: 0.2rem;
  }

  .mode-btn,
  .view-btn {
    padding: 0.6rem 0.5rem;
    font-size: 0.75rem;
    gap: 0.3rem;
  }

  .mode-btn .iconify,
  .view-btn .iconify {
    font-size: 0.9rem;
  }

  .schedule-grid {
    grid-template-columns: 35px repeat(6, minmax(70px, 1fr));
    min-width: 480px;
    gap: 1px;
  }

  .time-slot {
    font-size: 0.6rem;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    padding: 0.2rem;
    transform: rotate(180deg);
  }

  .day-header {
    padding: 0.5rem 0.1rem;
  }

  .day-name {
    font-size: 0.7rem;
    writing-mode: horizontal-tb;
  }

  .day-date {
    font-size: 0.6rem;
  }

  .schedule-cell {
    min-height: 40px;
  }

  .course-card {
    padding: 0.25rem;
    min-height: 35px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Touch feedback amélioré */
    touch-action: manipulation;
    -webkit-tap-highlight-color: rgba(255, 255, 255, 0.3);
  }

  .course-card:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  /* Styles responsive pour l'indicateur de cours manqué */
  .missed-course-indicator {
    top: -2px;
  }

  .missed-course-indicator.compact {
    top: -1px;
  }

  .missed-badge {
    padding: 3px 6px;
    font-size: 8px;
    gap: 2px;
    border-radius: 8px;
    border: 1.5px solid #ffffff;
  }

  .missed-badge.compact {
    padding: 2px 4px;
    font-size: 7px;
    gap: 2px;
    border-radius: 6px;
    border: 1px solid #ffffff;
  }

  /* Styles responsive pour l'indicateur DONE - même pattern que MISSED */
  .done-course-indicator {
    top: -2px;
  }

  .done-icon {
    padding: 3px 6px;
    font-size: 8px;
    gap: 2px;
    border-radius: 8px;
    border: 1.5px solid #ffffff;
  }

  .done-icon.compact {
    padding: 2px 4px;
    font-size: 7px;
    gap: 2px;
    border-radius: 6px;
    border: 1px solid #ffffff;
  }

  /* Désactivation de l'animation sur mobile pour économiser la batterie */
  @media (prefers-reduced-motion: reduce) {
    .missed-badge {
      animation: none;
    }
  }

  .course-header {
    margin-bottom: 0.1rem;
    gap: 0.1rem;
  }

  .course-title-section {
    gap: 0.05rem;
  }

  .course-code {
    font-size: 0.5rem;
    padding: 0.02rem 0.2rem;
    border-radius: 3px;
  }

  .course-title {
    font-size: 0.65rem;
    line-height: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .course-meta {
    gap: 0.2rem;
    align-items: center;
  }

  .course-duration {
    font-size: 0.5rem;
    padding: 0.02rem 0.2rem;
  }

  .department-badge {
    font-size: 0.5rem;
    padding: 0.05rem 0.2rem;
    border-radius: 6px;
  }

  .course-details {
    display: none;
    /* Masquer complètement sur très petit écran */
  }

  /* Mode côte à côte ultra responsive */
  .course-header.compact {
    gap: 0.1rem;
    margin-bottom: 0.05rem;
  }

  .course-title-section.compact {
    gap: 0.02rem;
  }

  .course-code.small {
    font-size: 0.45rem;
    padding: 0.02rem 0.15rem;
  }

  .course-header.compact .course-title {
    font-size: 0.6rem;
    line-height: 0.9;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }

  .course-header.compact .course-duration {
    font-size: 0.45rem;
    padding: 0.02rem 0.15rem;
  }

  .department-badge.small {
    font-size: 0.4rem;
    padding: 0.02rem 0.15rem;
    border-radius: 4px;
  }

  .course-details.compact {
    display: none;
  }

  .btn-primary,
  .btn-secondary {
    font-size: 0.8rem;
    padding: 0.75rem 1rem;
  }

  /* Ajustements pour les modals sur mobile */
  .schedule-legend {
    padding: 1rem;
    margin: 1rem 0;
  }

  .legend-section h4 {
    font-size: 1rem;
  }

  .legend-item {
    font-size: 0.75rem;
  }

  .legend-color {
    width: 14px;
    height: 14px;
  }
}

/* Très petits écrans (moins de 360px) */
@media (max-width: 360px) {
  .view-options {
    padding: 0.5rem 0.125rem;
    gap: 0.5rem;
  }

  .view-selector,
  .display-mode {
    padding: 0.375rem;
    gap: 0.25rem;
  }

  .mode-label {
    font-size: 0.7rem;
  }

  .mode-buttons,
  .view-buttons {
    max-width: 200px;
    padding: 0.15rem;
  }

  .mode-btn,
  .view-btn {
    padding: 0.5rem 0.375rem;
    font-size: 0.7rem;
    gap: 0.2rem;
  }

  .mode-btn .iconify,
  .view-btn .iconify {
    font-size: 0.8rem;
  }
}
</style>
