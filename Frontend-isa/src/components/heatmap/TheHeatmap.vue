<template>
    <div class="activity-heatmap-compact">
        <!-- En-tête avec statistiques -->
        <div class="heatmap-header">
            <div class="header-main">
                <h2 class="heatmap-title">Activité quotidienne</h2>
                <div class="year-selector">
                    <button @click="changeYear(-1)" class="nav-btn" :disabled="selectedYear <= minYear">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                    <span class="current-year">{{ selectedYear }}</span>
                    <button @click="changeYear(1)" class="nav-btn" :disabled="selectedYear >= maxYear">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">{{ totalActivities }}</div>
                    <div class="stat-label">Contributions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ currentStreak }}</div>
                    <div class="stat-label">Jours d'affilée</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{{ bestDayCount }}</div>
                    <div class="stat-label">Record journalier</div>
                </div>
            </div>
        </div>

        <!-- Heatmap principal - Version compacte -->
        <div class="compact-heatmap">
            <div class="heatmap-sidebar">
                <div class="weekday-labels">
                    <div class="weekday-label"></div>
                    <div class="weekday-label">Lun</div>
                    <div class="weekday-label"></div>
                    <div class="weekday-label">Mer</div>
                    <div class="weekday-label"></div>
                    <div class="weekday-label">Ven</div>
                    <div class="weekday-label"></div>
                </div>
            </div>

            <div class="heatmap-main">
                <div class="months-header">
                    <div v-for="month in compactMonths" :key="month.name" class="month-header"
                        :style="{ gridColumn: month.startColumn + ' / span ' + month.weeks }">
                        {{ month.name }}
                    </div>
                </div>

                <div class="days-grid">
                    <div v-for="(week, weekIndex) in compactWeeks" :key="weekIndex" class="week-column">
                        <template v-for="(day, dayIndex) in week" :key="`${weekIndex}-${dayIndex}`">
                            <div v-if="day" :class="['day-cell', `level-${day.level}`, { 'today': isToday(day.date) }]"
                                :style="{ backgroundColor: getColorForLevel(day.level) }"
                                @mouseenter="showDayTooltip(day, $event)" @mouseleave="hideDayTooltip"
                                @click="showDayDetails(day)"
                                :title="`${formatDay(day.date)}: ${day.count} activité${day.count !== 1 ? 's' : ''}`">
                                <div class="day-inner"></div>
                            </div>
                            <div v-else class="day-cell empty" :style="{ backgroundColor: getColorForLevel(0) }"></div>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Légende -->
        <div class="compact-legend">
            <span class="legend-text">Moins</span>
            <div class="legend-colors">
                <div v-for="level in [0, 1, 2, 3, 4]" :key="level" class="legend-color"
                    :style="{ backgroundColor: getColorForLevel(level) }"></div>
            </div>
            <span class="legend-text">Plus</span>
            <div class="legend-info">
                <span class="info-text">{{ activeDays }} jours actifs sur {{ totalDaysInYear }}</span>
            </div>
        </div>

        <!-- Tooltip jour -->
        <div v-if="hoveredDay && showDayTooltipElement" class="day-tooltip"
            :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }">
            <div class="tooltip-header">
                <strong>{{ formatFullDate(hoveredDay.date) }}</strong>
                <span class="tooltip-count">{{ hoveredDay.count }} activité{{ hoveredDay.count !== 1 ? 's' : ''
                    }}</span>
            </div>
            <div v-if="hoveredDay.activities.length > 0" class="tooltip-activities">
                <div v-for="activity in hoveredDay.activities.slice(0, 3)" :key="activity.id" class="tooltip-activity">
                    <span class="activity-time">{{ activity.time }}</span>
                    <span class="activity-name">{{ activity.name }}</span>
                </div>
                <div v-if="hoveredDay.activities.length > 3" class="more-activities">
                    +{{ hoveredDay.activities.length - 3 }} plus...
                </div>
            </div>
            <div v-else class="tooltip-empty">
                Aucune activité ce jour
            </div>
        </div>

        <!-- Panel détails jour -->
        <div v-if="selectedDay" class="day-details-panel" :class="{ 'show': selectedDay }">
            <div class="panel-header">
                <h3>Détails du {{ formatFullDate(selectedDay.date) }}</h3>
                <button @click="selectedDay = null" class="close-panel-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </button>
            </div>

            <div class="day-stats">
                <div class="day-stat">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-number">{{ selectedDay.count }}</div>
                        <div class="stat-text">Activités</div>
                    </div>
                </div>
                <div class="day-stat">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-info">
                        <div class="stat-number">{{ selectedDay.totalDuration }}</div>
                        <div class="stat-text">Minutes</div>
                    </div>
                </div>
                <div class="day-stat">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <div class="stat-number">{{ getDayLevelText(selectedDay.level) }}</div>
                        <div class="stat-text">Niveau d'activité</div>
                    </div>
                </div>
            </div>

            <div v-if="selectedDay.activities.length > 0" class="activities-timeline">
                <div class="timeline-title">Chronologie des activités</div>
                <div class="timeline-items">
                    <div v-for="activity in selectedDay.activities" :key="activity.id" class="timeline-item">
                        <div class="timeline-time">{{ activity.time }}</div>
                        <div class="timeline-content">
                            <div class="timeline-title">{{ activity.name }}</div>
                            <div class="timeline-meta">
                                <span class="timeline-type" :class="activity.type">{{ activity.type }}</span>
                                <span v-if="activity.duration" class="timeline-duration">{{ activity.duration }}
                                    min</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="empty-day">
                <div class="empty-icon">📭</div>
                <div class="empty-text">Aucune activité enregistrée ce jour</div>
            </div>
        </div>

        <!-- Overlay pour le panel -->
        <div v-if="selectedDay" class="panel-overlay" @click="selectedDay = null"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Activity {
    id: number
    date: Date
    time: string
    name: string
    type: 'travail' | 'sport' | 'apprentissage' | 'loisir' | 'autre'
    duration?: number
}

interface DayData {
    date: Date
    count: number
    level: number
    activities: Activity[]
    totalDuration: number
}

interface CompactMonth {
    name: string
    startColumn: number
    weeks: number
}

const props = defineProps<{
    activities?: Activity[]
}>()

// Année sélectionnée
const selectedYear = ref(new Date().getFullYear())
const minYear = 2020
const maxYear = new Date().getFullYear()

// États
const hoveredDay = ref<DayData | null>(null)
const showDayTooltipElement = ref(false)
const tooltipPosition = ref({ x: 0, y: 0 })
const selectedDay = ref<DayData | null>(null)

// Calcul des données pour le heatmap compact
const compactData = computed(() => {
    const startDate = new Date(selectedYear.value, 0, 1)
    const endDate = new Date(selectedYear.value, 11, 31)

    // Filtrer les activités de l'année
    const yearActivities = (props.activities || generateRealisticActivities()).filter(
        activity => activity.date.getFullYear() === selectedYear.value
    )

    // Groupement par jour
    const activitiesByDay: Record<string, Activity[]> = {}
    yearActivities.forEach(activity => {
        const dateKey = activity.date.toDateString()
        if (!activitiesByDay[dateKey]) {
            activitiesByDay[dateKey] = []
        }
        activitiesByDay[dateKey].push(activity)
    })

    // Calculer le max pour la normalisation
    const dayCounts = Object.values(activitiesByDay).map(arr => arr.length)
    const maxCount = Math.max(...dayCounts, 1)

    // Organiser par semaine (53 semaines)
    const weeks: (DayData | null)[][] = Array(53).fill(null).map(() => Array(7).fill(null))

    let currentDate = new Date(startDate)

    // Remplir toutes les semaines
    for (let week = 0; week < 53; week++) {
        for (let day = 0; day < 7; day++) {
            // Calculer la date pour cette case
            const date = new Date(startDate)
            const dayOffset = week * 7 + day - (startDate.getDay() + 6) % 7
            date.setDate(date.getDate() + dayOffset)

            // Vérifier si la date est dans l'année
            if (date >= startDate && date <= endDate) {
                const dateKey = date.toDateString()
                const dayActivities = activitiesByDay[dateKey] || []
                const count = dayActivities.length
                const totalDuration = dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0)

                // Niveau 0-4 basé sur l'intensité
                let level = 0
                if (count > 0) {
                    const normalized = count / maxCount
                    if (normalized < 0.2) level = 1
                    else if (normalized < 0.4) level = 2
                    else if (normalized < 0.6) level = 3
                    else level = 4
                }

                weeks[week][day] = {
                    date: new Date(date),
                    count,
                    level,
                    activities: dayActivities,
                    totalDuration
                }
            }
        }
    }

    return weeks
})

// Format plat des semaines pour le rendu
const compactWeeks = computed(() => compactData.value)

// Mois pour l'en-tête compact - CORRIGÉ
const compactMonths = computed<CompactMonth[]>(() => {
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    const months: CompactMonth[] = []

    let currentMonth = -1
    let monthStartWeek = 0
    let currentMonthWeeks = 0

    // Parcourir les semaines
    for (let week = 0; week < compactWeeks.value.length; week++) {
        // Trouver le premier jour non-nul de la semaine pour déterminer le mois
        const firstDay = compactWeeks.value[week].find(day => day !== null)
        let weekMonth = -1

        if (firstDay) {
            weekMonth = firstDay.date.getMonth()
        }

        if (weekMonth !== -1) {
            if (weekMonth !== currentMonth) {
                // Si on change de mois et qu'on avait un mois en cours
                if (currentMonth !== -1 && currentMonthWeeks > 0) {
                    months.push({
                        name: monthNames[currentMonth],
                        startColumn: monthStartWeek + 1,
                        weeks: currentMonthWeeks
                    })
                }

                // Commencer un nouveau mois
                currentMonth = weekMonth
                monthStartWeek = week
                currentMonthWeeks = 1
            } else {
                // Même mois, continuer à compter les semaines
                currentMonthWeeks++
            }
        }
    }

    // Ajouter le dernier mois
    if (currentMonth !== -1 && currentMonthWeeks > 0) {
        months.push({
            name: monthNames[currentMonth],
            startColumn: monthStartWeek + 1,
            weeks: currentMonthWeeks
        })
    }

    return months
})

// Statistiques - CORRIGÉ avec gestion des null
const totalActivities = computed(() =>
    compactWeeks.value
        .flat()
        .filter(day => day !== null)
        .reduce((sum, day) => sum + (day?.count || 0), 0)
)

const currentStreak = computed(() => {
    const today = new Date()
    let streak = 0

    // Trier les jours par date décroissante
    const allDays = compactWeeks.value
        .flat()
        .filter(day => day !== null)
        .sort((a, b) => b!.date.getTime() - a!.date.getTime())

    for (const day of allDays) {
        if (day && day.date <= today) {
            if (day.count > 0) {
                streak++
            } else {
                break
            }
        }
    }

    return streak
})

const bestDayCount = computed(() =>
    Math.max(
        ...compactWeeks.value
            .flat()
            .filter(day => day !== null)
            .map(day => day?.count || 0),
        0
    )
)

const activeDays = computed(() =>
    compactWeeks.value
        .flat()
        .filter(day => day !== null && day.count > 0)
        .length
)

const totalDaysInYear = computed(() =>
    compactWeeks.value
        .flat()
        .filter(day => day !== null)
        .length
)

// Méthodes
const changeYear = (delta: number) => {
    const newYear = selectedYear.value + delta
    if (newYear >= minYear && newYear <= maxYear) {
        selectedYear.value = newYear
        selectedDay.value = null
    }
}

const getColorForLevel = (level: number) => {
    const colors = [
        '#ebedf0',           // Niveau 0 - Très clair
        'var(--primary-extra-light)',
        'var(--primary-color-light)',
        'var(--primary-color)',
        'var(--primary-dark)' // Niveau 4 - Très foncé
    ]
    return colors[Math.min(level, colors.length - 1)]
}

const showDayTooltip = (day: DayData, event: MouseEvent) => {
    hoveredDay.value = day
    showDayTooltipElement.value = true
    tooltipPosition.value = {
        x: event.clientX + 10,
        y: event.clientY + 10
    }
}

const hideDayTooltip = () => {
    showDayTooltipElement.value = false
    setTimeout(() => {
        if (!showDayTooltipElement.value) {
            hoveredDay.value = null
        }
    }, 100)
}

const showDayDetails = (day: DayData) => {
    selectedDay.value = day
}

const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

const formatDay = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
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

const getDayLevelText = (level: number) => {
    const texts = ['Aucune', 'Faible', 'Modérée', 'Élevée', 'Très élevée']
    return texts[level]
}

// Génération d'activités réalistes
const generateRealisticActivities = (): Activity[] => {
    const activities: Activity[] = []
    const currentYear = selectedYear.value

    const activityTypes = [
        { type: 'travail' as const, names: ['Réunion', 'Code', 'Design', 'Documentation', 'Présentation'] },
        { type: 'sport' as const, names: ['Course', 'Yoga', 'Muscu', 'Natation', 'Vélo'] },
        { type: 'apprentissage' as const, names: ['Cours', 'Lecture', 'Tutoriel', 'Recherche', 'Pratique'] }
    ]

    // Générer des activités pour chaque jour de l'année
    for (let day = 0; day < 365; day++) {
        const date = new Date(currentYear, 0, 1)
        date.setDate(date.getDate() + day)

        // Moins d'activités le weekend (30% de chances)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6
        const baseActivityCount = isWeekend ?
            (Math.random() < 0.3 ? Math.floor(Math.random() * 3) : 0) :
            Math.floor(Math.random() * 5)

        // Ajouter des "journées chargées" aléatoires
        const isBusyDay = Math.random() < 0.1 // 10% de chances d'une journée chargée
        const activityCount = isBusyDay ? Math.floor(Math.random() * 8) + 3 : baseActivityCount

        for (let j = 0; j < activityCount; j++) {
            const typeIndex = Math.floor(Math.random() * activityTypes.length)
            const type = activityTypes[typeIndex]
            const nameIndex = Math.floor(Math.random() * type.names.length)

            // Heure aléatoire pendant la journée
            const hour = 8 + Math.floor(Math.random() * 10)
            const minute = Math.floor(Math.random() * 60)
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

            activities.push({
                id: activities.length + 1,
                date: new Date(date),
                time,
                name: type.names[nameIndex],
                type: type.type,
                duration: 30 + Math.floor(Math.random() * 120)
            })
        }
    }

    return activities
}

onMounted(() => {
    // Initialisation
})
</script>

<style scoped>
.activity-heatmap-compact {
    background: var(--white);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    position: relative;
}

/* En-tête compact */
.heatmap-header {
    margin-bottom: 1.5rem;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.heatmap-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
}

.year-selector {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: var(--background-light);
    padding: 0.5rem;
    border-radius: var(--radius);
}

.nav-btn {
    background: none;
    border: none;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
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
    font-weight: 600;
    color: var(--text-dark);
    min-width: 60px;
    text-align: center;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: var(--background-light);
    padding: 1rem;
    border-radius: var(--radius);
    border: 1px solid var(--border-light);
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

/* Heatmap compact */
.compact-heatmap {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.heatmap-sidebar {
    width: 40px;
}

.weekday-labels {
    display: flex;
    flex-direction: column;
    gap: 2px;
    height: 100%;
    margin-top: 30px;
    /* Pour aligner avec les jours */
}

.weekday-label {
    height: 12px;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-align: right;
    padding-right: 0.5rem;
    line-height: 12px;
}

.heatmap-main {
    flex: 1;
    overflow-x: auto;
}

.months-header {
    display: grid;
    grid-template-columns: repeat(53, 12px);
    gap: 2px;
    margin-bottom: 0.5rem;
    height: 20px;
}

.month-header {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
    white-space: nowrap;
}

.days-grid {
    display: grid;
    grid-template-columns: repeat(53, 12px);
    grid-template-rows: repeat(7, 12px);
    gap: 2px;
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

.day-cell.empty {
    cursor: default;
    opacity: 0.3;
}

.day-cell.empty:hover {
    transform: none;
    box-shadow: none;
}

.day-inner {
    width: 100%;
    height: 100%;
    border-radius: 2px;
}

/* Légende compacte */
.compact-legend {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-light);
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
}

.legend-info {
    margin-left: auto;
    font-size: 0.75rem;
    color: var(--text-secondary);
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
    min-width: 200px;
    max-width: 250px;
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

.tooltip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-light);
}

.tooltip-header strong {
    font-size: 0.875rem;
    color: var(--text-dark);
}

.tooltip-count {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
    background: var(--primary-extra-light);
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius);
}

.tooltip-activities {
    max-height: 120px;
    overflow-y: auto;
}

.tooltip-activity {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--border-light);
}

.tooltip-activity:last-child {
    border-bottom: none;
}

.activity-time {
    color: var(--text-secondary);
    font-weight: 500;
}

.activity-name {
    color: var(--text-dark);
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tooltip-empty {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-style: italic;
    text-align: center;
    padding: 0.5rem;
}

.more-activities {
    font-size: 0.75rem;
    color: var(--primary-color);
    text-align: center;
    margin-top: 0.25rem;
    font-style: italic;
}

/* Panel détails */
.day-details-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 380px;
    height: 100vh;
    background: var(--white);
    box-shadow: var(--shadow-dark);
    z-index: 1001;
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
}

.day-details-panel.show {
    right: 0;
}

.panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-light);
}

.panel-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--text-dark);
}

.close-panel-btn {
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
}

.close-panel-btn:hover {
    background: var(--background-light);
    color: var(--error);
}

.day-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-light);
}

.day-stat {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.stat-icon {
    font-size: 1.5rem;
    width: 48px;
    height: 48px;
    background: var(--primary-extra-light);
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-dark);
}

.stat-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.activities-timeline {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
}

.timeline-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.timeline-items {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.timeline-item {
    display: flex;
    gap: 1rem;
    padding: 0.75rem;
    background: var(--background-light);
    border-radius: var(--radius);
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
}

.timeline-item:hover {
    transform: translateX(4px);
    border-color: var(--primary-color-light);
}

.timeline-time {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--primary-color);
    min-width: 60px;
}

.timeline-content {
    flex: 1;
}

.timeline-title {
    font-weight: 500;
    color: var(--text-dark);
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
}

.timeline-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
}

.timeline-type {
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius);
    font-weight: 600;
    text-transform: uppercase;
}

.timeline-type.travail {
    background: var(--primary-extra-light);
    color: var(--primary-color);
}

.timeline-type.sport {
    background: var(--secondary-extra-light);
    color: var(--secondary-color);
}

.timeline-type.apprentissage {
    background: var(--warning-light);
    color: var(--warning-dark);
}

.timeline-duration {
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.empty-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    text-align: center;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-text {
    color: var(--text-secondary);
    font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .activity-heatmap-compact {
        padding: 1rem;
    }

    .compact-heatmap {
        overflow-x: auto;
    }

    .days-grid {
        min-width: 700px;
    }

    .months-header {
        min-width: 700px;
    }

    .stats-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .day-details-panel {
        width: 100%;
        right: -100%;
    }

    .day-stats {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .header-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .year-selector {
        align-self: stretch;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .compact-legend {
        flex-wrap: wrap;
        justify-content: center;
    }

    .legend-info {
        margin-left: 0;
        width: 100%;
        text-align: center;
        margin-top: 0.5rem;
    }
}
</style>