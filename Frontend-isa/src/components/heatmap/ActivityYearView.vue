<template>
    <div class="github-heatmap-vertical" v-if="!loading && !errorServer">
        <!-- En-tête -->
        <div class="heatmap-header">
            <div class="header-top">
                <h2 class="heatmap-title">Activité {{ selectedYear }}</h2>
                <div class="year-navigation">
                    <button @click="previousYear" class="nav-btn" :disabled="selectedYear <= minYear">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="current-year">{{ selectedYear }}</span>
                    <button @click="nextYear" class="nav-btn" :disabled="selectedYear >= maxYear">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value">{{ totalContributions }}</div>
                    <div class="stat-label">heures totales</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ currentStreak }}</div>
                    <div class="stat-label">jours d'affilée</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">{{ longestStreak }}</div>
                    <div class="stat-label">série record</div>
                </div>
            </div>
        </div>

        <!-- Heatmap vertical avec conteneur scrollable -->
        <div class="heatmap-scroll-container">
            <div class="heatmap-wrapper">
                <!-- En-tête des mois en haut -->
                <div class="months-header">
                    <div class="day-label-spacer"></div>
                    <div v-for="month in months" :key="month.name" class="month-label"
                        :style="{ gridColumn: month.startWeek + 2 + ' / span ' + month.weekCount }">
                        {{ month.name }}
                    </div>
                </div>

                <div class="heatmap-grid">
                    <!-- Jours de la semaine à gauche -->
                    <div class="weekday-labels">
                        <div class="weekday-label">Lun</div>
                        <div class="weekday-label">Mar</div>
                        <div class="weekday-label">Mer</div>
                        <div class="weekday-label">Jeu</div>
                        <div class="weekday-label">Ven</div>
                        <div class="weekday-label">Sam</div>
                        <div class="weekday-label">Dim</div>
                    </div>

                    <!-- Grille verticale : colonnes = semaines, lignes = jours de la semaine -->
                    <div class="heatmap-cells">
                        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="week-column">
                            <div v-for="(day, dayIndex) in week.days" :key="`${weekIndex}-${dayIndex}`"
                                :class="['day-cell', `level-${day.level}`, { 'today': isToday(day.date) }]"
                                :style="{ backgroundColor: getColorForLevel(day.level) }"
                                @mouseenter="showTooltip(day, $event)" @mouseleave="hideTooltip" @click="selectDay(day)"
                                :title="getDayTitle(day)">
                                <div class="day-inner">
                                    <span v-if="showDayNumbers" class="day-number">{{ day.date.getDate() }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Légende -->
        <div class="heatmap-legend">
            <div class="legend-content">
                <span class="legend-text">Moins</span>
                <div class="legend-colors">
                    <div v-for="level in [0, 1, 2, 3, 4]" :key="level" class="legend-color"
                        :style="{ backgroundColor: getColorForLevel(level) }" :title="getLevelDescription(level)"></div>
                </div>
                <span class="legend-text">Plus</span>
            </div>
            <div class="legend-info">
                <span>{{ activeDays }} jours actifs</span>
            </div>
        </div>

        <!-- Tooltip -->
        <div v-if="hoveredDay && showTooltipElement" class="day-tooltip"
            :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }">
            <div class="tooltip-date">{{ formatDate(hoveredDay.date) }}</div>
            <div class="tooltip-count">{{ Math.floor(hoveredDay.contributions) }}h {{
                Math.floor((hoveredDay.contributions % 1) * 60) }}m d'utilisation</div>
        </div>

        <!-- Panel détails -->
        <div v-if="selectedDay" class="day-details-panel">
            <div class="panel-header">
                <h3>{{ formatFullDate(selectedDay.date) }}</h3>
                <button @click="selectedDay = null; dayActivity = []" class="close-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>
            <div class="panel-content">
                <div class="day-summary">
                    <div class="summary-stat">
                        <span class="stat-value">{{ selectedDay.activities.length > 0 ? selectedDay.activities[0].time :
                            0 }}</span>
                        <span class="stat-label">heures total passées</span>
                    </div>
                    <div class="summary-stat">
                        <span class="stat-value">Niveau {{ selectedDay.level }}</span>
                        <span class="stat-label">Intensité</span>
                    </div>
                </div>
                <div class="activities-list" v-if="dayActivity.length > 0">
                    <h4>Activités</h4>
                    <div class="activities-scroll">
                        <div class="activities">
                            <div v-for="(activity, index) in dayActivity" :key="index" class="activity-item">
                                <span class="activity-time">{{ formatActivityTime(activity.timestamp) }}</span>
                                <span class="activity-name">{{ translateEventType(activity.eventType, activity.userId)
                                }}</span>
                                <span class="activity-type">{{ translateEntityType(activity.entityType) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="no-activities">
                    <p>Aucune activité ce jour</p>
                </div>
            </div>
        </div>
        <div v-if="selectedDay" class="panel-overlay" @click="selectedDay = null, dayActivity = []"></div>
    </div>

    <SpinningLoader :loading="loading" v-else-if="loading" />
    <ErrorComponent v-else-if="!loading && errorServer" :message="errorServer" @retry="fetchUsage" />


</template>

<script setup lang="ts">
import { useMyUserStore } from '@/stores/userStore'
import axios from 'axios'
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, watchEffect, watch } from 'vue'
import SpinningLoader from '../loader/SpinningLoader.vue'
import ErrorComponent from '../error/ErrorComponent.vue'
import type { UsageInterface } from '@/interfaces/usage.inteface'
import type { eventLogInterface } from '@/interfaces/eventLog.interface'
import type UserInterface from '@/interfaces/user.interfaces'
import HeatMapDetails from './heatMapDetails.vue'
import { checkApiForLogsEvent } from '@/utils/checkApiForLogsEvent'



// const userStore = useMyUserStore()
// const { currentUser } = storeToRefs(userStore)

const errorServer = ref<string>('')
const loading = ref<boolean>(false)

const usage = ref<UsageInterface[]>([])
const dayActivity = ref<eventLogInterface[]>([])



export interface ActivityInterface {
    id: number
    date: Date
    time: string
    name: string
    type: string
}

interface DayData {
    date: Date
    contributions: number
    level: number
    activities: ActivityInterface[]
}

interface WeekData {
    days: DayData[]
    weekNumber: number
}

interface MonthData {
    name: string
    startWeek: number
    weekCount: number
}

const props = defineProps<{
    user: UserInterface
}>()

// Configuration
const selectedYear = ref(new Date().getFullYear())
const minYear = new Date(props.user?.createdAt as Date).getFullYear()
const maxYear = new Date().getFullYear()
const showDayNumbers = ref(false)

// États
const hoveredDay = ref<DayData | null>(null)
const showTooltipElement = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const selectedDay = ref<DayData | null>(null)

const fetchDayActivity = async () => {
    try {
        const response = await axios.get(`/api/v1/eventLogs/${props.user?._id}`, {
            params: {
                date: selectedDay.value?.date
            }
        })
        dayActivity.value = response.data

    } catch (error) {
        console.error('Erreur lors de la récupération des activités du jour :', error)
    }
}



// Noms des mois
const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

// Préparer les données pour l'affichage vertical
const weeks = computed(() => {
    const startDate = new Date(selectedYear.value, 0, 1)
    const endDate = new Date(selectedYear.value, 11, 31)

    // Ajuster pour commencer le lundi
    const startDay = startDate.getDay()
    const daysToMonday = startDay === 0 ? 6 : startDay - 1
    startDate.setDate(startDate.getDate() - daysToMonday)

    // Créer un mapping des données d'usage par date
    const usageByDay: Record<string, number> = {}
    if (usage.value && usage.value.length > 0) {
        usage.value.forEach(u => {
            const date = new Date(u.date)
            if (date.getFullYear() === selectedYear.value) {
                const dateKey = date.toDateString()
                // hoursTracked est en ms, on le garde tel quel pour le calcul
                usageByDay[dateKey] = u.hoursTracked
            }
        })
    }

    // Générer les semaines (max 53 semaines)
    const weeksData: WeekData[] = []
    let currentDate = new Date(startDate)
    let weekNumber = 1

    while (weeksData.length < 53) {
        const weekDays: DayData[] = []

        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate)
            const dateKey = date.toDateString()

            // Récupérer les heures trackées pour ce jour (en ms)
            const hoursTracked = usageByDay[dateKey] || 0

            // Convertir en heures pour l'affichage (ms / 1000 / 60 / 60)
            const hoursInHours = hoursTracked / 1000 / 60 / 60
            const contributions = Math.round(hoursInHours * 10) / 10 // arrondi à 1 décimale

            // Calculer le niveau (0-4) basé sur des seuils absolus en ms
            // Niveau 0: 0 ms
            // Niveau 1: 1ms - 30 minutes (1800000 ms)
            // Niveau 2: 30 minutes - 1 heure (3600000 ms)
            // Niveau 3: 1 heure - 2 heures (7200000 ms)
            // Niveau 4: 2 heures et plus
            let level = 0
            if (hoursTracked > 0) {
                if (hoursTracked < 1800000) level = 1 // < 30 min
                else if (hoursTracked < 3600000) level = 2 // < 1h
                else if (hoursTracked < 7200000) level = 3 // < 2h
                else level = 4 // >= 2h
            }

            weekDays.push({
                date: new Date(date),
                contributions,
                level,
                activities: hoursTracked > 0 ? [{
                    id: 1,
                    date: new Date(date),
                    time: `${Math.floor(hoursInHours)}h ${Math.floor((hoursInHours % 1) * 60)}m`,
                    name: `Temps d'utilisation`,
                    type: 'usage'
                }] : []
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        weeksData.push({
            days: weekDays,
            weekNumber: weekNumber++
        })

        // Arrêter si on dépasse la fin de l'année
        if (currentDate > endDate && weeksData.length > 48) break
    }

    return weeksData
})

// Calculer les mois pour l'en-tête
const months = computed(() => {
    const monthsData: MonthData[] = []
    let currentMonth = -1
    let monthStartWeek = 0
    let monthWeeks = 0

    weeks.value.forEach((week, weekIndex) => {
        // Trouver le premier jour de la semaine
        const firstDay = week.days[0] // Lundi
        if (!firstDay) return

        const weekMonth = firstDay.date.getMonth()

        if (weekMonth !== currentMonth) {
            if (currentMonth !== -1) {
                monthsData.push({
                    name: monthNames[currentMonth],
                    startWeek: monthStartWeek,
                    weekCount: monthWeeks
                })
            }
            currentMonth = weekMonth
            monthStartWeek = weekIndex
            monthWeeks = 1
        } else {
            monthWeeks++
        }
    })

    // Ajouter le dernier mois
    if (currentMonth !== -1) {
        monthsData.push({
            name: monthNames[currentMonth],
            startWeek: monthStartWeek,
            weekCount: monthWeeks
        })
    }

    return monthsData
})



// Statistiques
const totalContributions = computed(() => {
    const totalHours = usage.value.reduce((total, u) => {
        if (new Date(u.date).getFullYear() === selectedYear.value) {
            return total + (u.hoursTracked / 1000 / 60 / 60) // Convertir ms en heures
        }
        return total
    }, 0).toFixed(1)
    const [hours, decimal] = totalHours.split('.')
    const minutes = Math.round(parseFloat('0.' + decimal) * 60)
    return `${hours}h ${minutes}m`
})

const currentStreak = computed(() => {
    const today = new Date()
    let streak = 0
    const allDays = weeks.value
        .flatMap(week => week.days)
        .filter(day => day.date <= today)
        .sort((a, b) => b.date.getTime() - a.date.getTime())

    for (const day of allDays) {
        if (day.contributions > 0) {
            streak++
        } else {
            break
        }
    }
    return streak
})

const longestStreak = computed(() => {
    let longest = 0
    let current = 0

    weeks.value
        .flatMap(week => week.days)
        .forEach(day => {
            if (day.contributions > 0) {
                current++
                longest = Math.max(longest, current)
            } else {
                current = 0
            }
        })

    return longest
})

const activeDays = computed(() => {
    return weeks.value
        .flatMap(week => week.days)
        .filter(day => day.contributions > 0).length
})

// Méthodes
const previousYear = () => {
    if (selectedYear.value > minYear) {
        selectedYear.value--
        selectedDay.value = null
    }
}

const nextYear = () => {
    if (selectedYear.value < maxYear) {
        selectedYear.value++
        selectedDay.value = null
    }
}

const getColorForLevel = (level: number) => {
    const colors = [
        '#ebedf0',                     // Niveau 0
        'var(--primary-extra-light)',  // Niveau 1
        'var(--primary-color-light)',  // Niveau 2
        'var(--primary-color)',        // Niveau 3
        'var(--primary-dark)'          // Niveau 4
    ]
    return colors[level] || colors[0]
}

const showTooltip = (day: DayData, event: MouseEvent) => {
    hoveredDay.value = day
    showTooltipElement.value = true
    tooltipPosition.value = {
        x: event.clientX + 10,
        y: event.clientY + 10
    }
}

const hideTooltip = () => {
    showTooltipElement.value = false
    setTimeout(() => {
        if (!showTooltipElement.value) {
            hoveredDay.value = null
        }
    }, 100)
}

const selectDay = async (day: DayData) => {
    if (props.user.role === 'admin' || props.user.role === 'superAdmin') {
        return
    }
    selectedDay.value = day

    if (day.activities.length === 0) {
        return
    }
    await fetchDayActivity()
}

const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

const getDayTitle = (day: DayData) => {
    const hours = Math.floor(day.contributions)
    const minutes = Math.floor((day.contributions % 1) * 60)
    return `${formatDate(day.date)}: ${hours}h ${minutes}m d'utilisation`
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
}

const getLevelDescription = (level: number) => {
    const descriptions = [
        'Aucune activité',
        'Moins de 30 minutes',
        'Entre 30 minutes et 1 heure',
        'Entre 1 heure et 2 heures',
        'Plus de 2 heures'
    ]
    return descriptions[level] || ''
}

const formatActivityTime = (timestamp: Date) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
}
const { currentUser } = useMyUserStore()
const translateEventType = (eventType: string, userId: string) => {
    const isCurrentUser = userId === currentUser!._id
    const subject = isCurrentUser ? 'Vous avez' : 'L\'utilisateur a'
    const subjectForConnect = isCurrentUser ? 'Vous vous êtes' : 'L\'utilisateur s\'est'
    const translations: Record<string, string> = {
        // STUDENT
        'STUDENT_LOGIN': `${subjectForConnect} connecté`,
        'STUDENT_LOGOUT': `${subjectForConnect} déconnecté`,
        'STUDENT_PASSWORD_CHANGED': `${subject} changé le mot de passe`,
        'STUDENT_PROFILE_UPDATED': `${subject} mis à jour le profil`,
        'STUDENT_ENROLLED': `${subjectForConnect} inscrit`,
        'STUDENT_ADMISSION_REQUESTED': `${subject} demandé l'admission`,
        'STUDENT_SCHEDULE_VIEWED': `${subject} consulté l'emploi du temps`,
        'STUDENT_RESOURCE_DOWNLOADED': `${subject} téléchargé une ressource`,
        'STUDENT_OFFICIAL_RESOURCE_DOWNLOADED': `${subject} téléchargé une ressource officielle`,
        'STUDENT_ASSIGNMENT_VIEWED': `${subject} consulté un devoir`,
        'STUDENT_ASSIGNMENT_SUBMITTED': `${subject} soumis un devoir`,
        'STUDENT_ASSIGNMENT_DOWNLOADED': `${subject} téléchargé un devoir`,
        'STUDENT_SUBMISSION_UPDATED': `${subject} mis à jour une soumission`,
        'STUDENT_GRADES_VIEWED': `${subject} consulté les notes`,
        'STUDENT_PAYMENT_SENT': `${subject} envoyé un paiement`,
        'STUDENT_FEES_VIEWED': `${subject} consulté les frais`,
        'STUDENT_REPORT_SUBMITTED': `${subject} soumis un rapport`,
        'STUDENT_REQUEST_SUBMITTED': `${subject} soumis une demande`,
        'STUDENT_MESSAGE_SENT': `${subject} envoyé un message`,

        // PROFESSOR
        'PROFESSOR_LOGIN': `${subjectForConnect} connecté`,
        'PROFESSOR_LOGOUT': `${subjectForConnect} déconnecté`,
        'PROFESSOR_PASSWORD_CHANGED': `${subject} changé le mot de passe`,
        'PROFESSOR_PROFILE_UPDATED': `${subject} mis à jour le profil`,
        'PROFESSOR_RESOURCE_UPLOADED': `${subject} uploadé une ressource`,
        'PROFESSOR_RESOURCE_UPDATED': `${subject} mis à jour une ressource`,
        'PROFESSOR_RESOURCE_DELETED': `${subject} supprimé une ressource`,
        'PROFESSOR_ASSIGNMENT_CREATED': `${subject} créé un devoir`,
        'PROFESSOR_ASSIGNMENT_UPDATED': `${subject} mis à jour un devoir`,
        'PROFESSOR_ASSIGNMENT_DELETED': `${subject} supprimé un devoir`,
        'PROFESSOR_ASSIGNMENT_LOCKED_GRADED': `${subject} verrouillé et noté un devoir`,
        'PROFESSOR_ASSIGNMENT_EXAM_RESCHEDULED': `${subject} reporté un examen`,
        'PROFESSOR_ASSIGNMENT_EXAM_CANCELLED': `${subject} annulé un examen`,
        'PROFESSOR_GRADES_DOWNLOADED': `${subject} téléchargé les notes`,
        'PROFESSOR_GRADE_UPDATED': `${subject} mis à jour une note`,
        'PROFESSOR_ASSIGNMENT_VIEWED': `${subject} consulté un devoir`,
        'PROFESSOR_SUBMISSION_LIST_DOWNLOADED': `${subject} téléchargé la liste des soumissions`,
        'PROFESSOR_GRADE_ENTERED': `${subject} saisi une note`,
    }

    return translations[eventType] || eventType
}

const translateEntityType = (entityType: string) => {
    const translations: Record<string, string> = {
        'module': 'Module',
        'assignment': 'Devoir',
        'submission': 'Soumission',
        'grade': 'Note',
        'user': 'Utilisateur',
        'payment': 'Paiement',
        'schedule': 'Emploi du temps',
        'resource': 'Ressource',
        'administrativeRequest': 'Demande administrative',
        'BugReport': 'Rapport de bug'
    }

    return translations[entityType] || entityType
}

// Générer des données d'exemple
const generateSampleActivities = (): ActivityInterface[] => {
    const activities: ActivityInterface[] = []
    const currentYear = selectedYear.value

    // Types d'activités
    const types = ['work', 'sport', 'study', 'personal']
    const workNames = ['Réunion', 'Code', 'Design', 'Documentation', 'Présentation']
    const sportNames = ['Course', 'Yoga', 'Muscu', 'Natation', 'Vélo']
    const studyNames = ['Cours', 'Lecture', 'Recherche', 'Exercices', 'Projet']
    const personalNames = ['Cuisine', 'Musique', 'Jeux', 'Social', 'Méditation']

    // Générer des activités pour toute l'année
    for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(currentYear, month + 1, 0).getDate()

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, month, day)
            const isWeekend = date.getDay() === 0 || date.getDay() === 6

            // Moins d'activités le weekend
            const activityCount = isWeekend ?
                (Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0) :
                Math.floor(Math.random() * 8)

            for (let i = 0; i < activityCount; i++) {
                const type = types[Math.floor(Math.random() * types.length)]
                let name = ''

                switch (type) {
                    case 'work': name = workNames[Math.floor(Math.random() * workNames.length)]; break
                    case 'sport': name = sportNames[Math.floor(Math.random() * sportNames.length)]; break
                    case 'study': name = studyNames[Math.floor(Math.random() * studyNames.length)]; break
                    case 'personal': name = personalNames[Math.floor(Math.random() * personalNames.length)]; break
                }

                // Heure aléatoire
                const hour = 8 + Math.floor(Math.random() * 10)
                const minute = Math.floor(Math.random() * 60)
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

                activities.push({
                    id: activities.length + 1,
                    date: new Date(date),
                    time,
                    name: `${name} #${Math.floor(Math.random() * 100)}`,
                    type
                })
            }
        }
    }

    return activities
}




const fetchUsage = async () => {
    loading.value = true
    try {
        const response = await axios.get(`/api/v1/usage/${props.user?._id}`, {
            params: {
                year: selectedYear.value
            }
        })
        usage.value = response.data
    } catch (error) {
        errorServer.value = error.response.data

    } finally {
        loading.value = false
    }
}

const debouncedFetchUsage = debounce(fetchUsage, 300)

watch([selectedYear], async () => {
    if (props.user) {
        await debouncedFetchUsage()
    }
})

onMounted(async () => {
    await fetchUsage()
    selectedYear.value = new Date().getFullYear()
})
</script>
<style scoped>
.github-heatmap-vertical {
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 100px;
}

/* En-tête */
.heatmap-header {
    margin-bottom: 1.5rem;
    flex-shrink: 0;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.heatmap-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
    flex: 1;
    min-width: 200px;
}

.year-navigation {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--background-light);
    padding: 0.5rem;
    border-radius: var(--radius);
    flex-shrink: 0;
}

.nav-btn {
    background: none;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.nav-btn:hover:not(:disabled) {
    background: var(--gray-extra-light);
    color: var(--primary-color);
}

.nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.current-year {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-dark);
    min-width: 60px;
    text-align: center;
    flex-shrink: 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

/* Container principal du heatmap avec scroll */
.heatmap-scroll-container {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    margin-bottom: 1.5rem;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-light) var(--border-light);
    /* min-height: 200px; */
    position: relative;
}

.heatmap-wrapper {
    min-width: min-content;
    padding-bottom: 8px;
}

/* Scrollbar personnalisée */
.heatmap-scroll-container::-webkit-scrollbar {
    height: 8px;
}

.heatmap-scroll-container::-webkit-scrollbar-track {
    background: var(--border-light);
    border-radius: 4px;
}

.heatmap-scroll-container::-webkit-scrollbar-thumb {
    background: var(--primary-light);
    border-radius: 4px;
    transition: background 0.2s ease;
}

.heatmap-scroll-container::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
}

/* En-tête des mois */
.months-header {
    display: grid;
    grid-template-columns: 40px repeat(53, 12px);
    gap: 2px;
    margin-bottom: 0.5rem;
    margin-left: 40px;
    height: 20px;
    min-width: min-content;
    padding-right: 1rem;
}

.month-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.day-label-spacer {
    grid-column: 1;
}

/* Grille principale */
.heatmap-grid {
    display: flex;
    gap: 0.5rem;
    min-width: min-content;
}

.weekday-labels {
    width: 40px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
}

.weekday-label {
    height: 12px;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: right;
    padding-right: 0.5rem;
    line-height: 12px;
    white-space: nowrap;
}

.heatmap-cells {
    display: grid;
    grid-template-columns: repeat(53, 12px);
    grid-template-rows: repeat(7, 12px);
    gap: 2px;
    min-width: min-content;
    padding-right: 1rem;
}

.week-column {
    display: contents;
}

.day-cell {
    width: 12px;
    height: 12px;
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
}

.day-cell:hover {
    transform: scale(1.3);
    z-index: 10;
    box-shadow: 0 0 0 2px var(--white), 0 2px 8px rgba(0, 0, 0, 0.2);
}

.day-cell.today {
    box-shadow: 0 0 0 2px var(--primary-color);
    z-index: 5;
}

.day-inner {
    width: 100%;
    height: 100%;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.day-number {
    font-size: 0.5rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.6);
}

/* Légende */
.heatmap-legend {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
    flex-shrink: 0;
}

.legend-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.legend-colors {
    display: flex;
    gap: 2px;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.legend-text {
    font-size: 0.75rem;
    color: var(--text-secondary);
    white-space: nowrap;
}

.legend-info {
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-align: center;
    width: 100%;
}

/* Tooltip */
.day-tooltip {
    position: fixed;
    background: var(--white);
    border-radius: var(--radius);
    padding: 0.75rem;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-light);
    z-index: 1000;
    pointer-events: none;
    min-width: 180px;
    animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tooltip-date {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 0.25rem;
}

.tooltip-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
}

/* Panel détails */
.day-details-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    background: var(--white);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    z-index: 1002;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translate(-50%, -60%);
    }

    to {
        opacity: 1;
        transform: translate(-50%, -50%);
    }
}

.panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1001;
    animation: fadeIn 0.3s ease;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
}

.panel-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-dark);
    flex: 1;
    padding-right: 1rem;
}

.close-btn {
    background: none;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: var(--rounded);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.close-btn:hover {
    background: var(--background-light);
    color: var(--error);
}

.panel-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.day-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-light);
    flex-shrink: 0;
}

.summary-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.activities-list {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.activities-list h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    color: var(--text-dark);
    flex-shrink: 0;
}

.activities-scroll {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding-right: 0.5rem;
}

.activities-scroll::-webkit-scrollbar {
    width: 6px;
}

.activities-scroll::-webkit-scrollbar-track {
    background: var(--border-light);
    border-radius: 3px;
}

.activities-scroll::-webkit-scrollbar-thumb {
    background: var(--primary-light);
    border-radius: 3px;
}

.activities {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--background-light);
    border-radius: var(--radius);
    border: 1px solid var(--border-light);
    flex-shrink: 0;
}

.activity-time {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
    min-width: 60px;
    flex-shrink: 0;
}

.activity-name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--text-dark);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.activity-type {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius);
    background: var(--gray-extra-light);
    color: var(--gray-dark);
    text-transform: uppercase;
    font-weight: 600;
    flex-shrink: 0;
}

.no-activities {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    font-style: italic;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
    .github-heatmap-vertical {
        padding: 1rem;
        min-height: 400px;
    }

    .header-top {
        flex-direction: column;
        align-items: stretch;
    }

    .heatmap-title {
        text-align: center;
        min-width: auto;
    }

    .year-navigation {
        justify-content: center;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 480px) {
    .github-heatmap-vertical {
        padding: 0.75rem;
        min-height: 350px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .stat-value {
        font-size: 1.5rem;
    }

    .heatmap-scroll-container {
        min-height: 150px;
    }

    .legend-content {
        justify-content: center;
    }

    .day-details-panel {
        width: 95%;
        max-height: 90vh;
    }

    .panel-header {
        padding: 1rem;
    }

    .panel-content {
        padding: 1rem;
    }

    .day-summary {
        gap: 1rem;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }

    .activity-item {
        padding: 0.5rem;
        gap: 0.5rem;
    }

    .activity-time {
        min-width: 50px;
        font-size: 0.8rem;
    }

    .activity-name {
        font-size: 0.8rem;
    }
}

/* Support tactile amélioré */
@media (hover: none) and (pointer: coarse) {
    .day-cell:hover {
        transform: none;
    }

    .day-cell:active {
        transform: scale(1.3);
    }

    .nav-btn,
    .close-btn {
        min-height: 44px;
        min-width: 44px;
    }
}
</style>