<template>
  <div class="courses-container" v-if="!route.params.semester">
    <!-- En-tête élégant -->
    <div class="courses-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-main">
          <h1>Mes Cours</h1>
          <p class="header-subtitle">{{ getAcademicYear() }}</p>
        </div>
        <div class="header-badges">
          <div class="info-badge">
            <Icon icon="mdi:school" class="badge-icon" />
            <span class="badge-value">{{ currentLevel }}</span>
          </div>
          <div class="info-badge promotion" v-if="currentPromotion">
            <Icon icon="mdi:certificate" class="badge-icon" />
            <span class="badge-value">{{ currentPromotion }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Grille des semestres -->
    <div class="semesters-grid">
      <div v-for="sem in semesterUpdated" :key="sem.label" class="semester-card" :class="{
        locked: !isSemesterUnlocked(sem, currentLevel),
        unlocked: isSemesterUnlocked(sem, currentLevel),
      }">
        <!-- Badge de statut -->
        <div class="semester-status">
          <Icon v-if="isSemesterUnlocked(sem, currentLevel)" icon="mdi:lock-open-variant"
            class="status-icon unlocked" />
          <Icon v-else icon="mdi:lock" class="status-icon locked" />
        </div>

        <!-- En-tête du semestre -->
        <div class="semester-header">
          <h2 class="semester-title">{{ sem.label }}</h2>
          <div class="semester-subtitle">
            {{ getSemesterName(sem.label) }}
          </div>
        </div>

        <!-- Contenu -->
        <div class="semester-content">
          <template v-if="!isSemesterAvailable(sem.label)">
            <div class="locked-message">
              <Icon icon="mdi:clock-alert-outline" class="lock-icon" />
              <span>Pas encore disponible</span>
            </div>
            <div class="locked-info">
              Ce semestre sera disponible prochainement
            </div>
          </template>
          <template v-else-if="isSemesterUnlocked(sem, currentLevel)">
            <div class="unlocked-message">
              <Icon icon="mdi:check-circle" class="check-icon" />
              <span>Accessible</span>
            </div>
            <div class="promotion-info" v-if="sem.currentPromotion">
              <Icon icon="mdi:certificate-outline" class="promotion-icon" />
              <span class="promotion-name">{{ sem.currentPromotion.promotionName }}</span>
            </div>
            <button class="access-btn" @click="accessSemester(sem.label, sem.currentPromotion.promotionId!)">
              <Icon icon="mdi:book-open-page-variant" />
              <span>Accéder aux cours</span>
            </button>
          </template>
          <template v-else>
            <div class="locked-message">
              <Icon icon="mdi:lock-alert" class="lock-icon" />
              <span>Niveau requis: {{ getRequiredLevel(sem) }}</span>
            </div>
            <div class="locked-info">
              Passez en {{ getRequiredLevel(sem) }} pour débloquer ce semestre
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useMyUserStore } from '@/stores/userStore'
import type StudentInterface from '@/interfaces/student.intefaces'
import { useRoute, useRouter } from 'vue-router'
import { semesters } from '@/data/semester'
import type PromotionInterface from '@/interfaces/promotion.interface'
const route = useRoute()
interface SemesterInterface {
  unlocked: Array<string>
  label: string
}
const user = useMyUserStore().currentUser as StudentInterface
const currentLevel = ref<string>(user.level)
const router = useRouter()

// Récupérer le nom de la promotion actuelle
const currentPromotion = computed(() => {
  const activeParcours = user.parcours?.find((p) => p.status === 'in progress')
  return (activeParcours?.promotion as PromotionInterface)?.name || null
})

const getAcademicYear = (): string => {
  const year = new Date().getFullYear()
  return `${year}-${year + 1}`
}



const semester: SemesterInterface[] = [
  {
    label: 'S1',
    unlocked: ['L1', 'L2', 'L3', 'M1', 'M2'],
  },
  {
    label: 'S2',
    unlocked: ['L1', 'L2', 'L3', 'M1', 'M2'],
  },
  {
    label: 'S3',
    unlocked: ['L2', 'L3', 'M1', 'M2'],
  },
  {
    label: 'S4',
    unlocked: ['L2', 'L3', 'M1', 'M2'],
  },
  {
    label: 'S5',
    unlocked: ['L3', 'M1', 'M2'],
  },
  {
    label: 'S6',
    unlocked: ['L3', 'M1', 'M2'],
  },
  {
    label: 'S7',
    unlocked: ['M1', 'M2'],
  },
  {
    label: 'S8',
    unlocked: ['M1', 'M2'],
  },
  {
    label: 'S9',
    unlocked: ['M2'],
  },
  {
    label: 'S10',
    unlocked: ['M2'],
  },
]

const semesterUpdated = computed(() => {
  return semester.map((sem) => {
    const promotion = user.parcours.find((p) => sem.unlocked.includes((p.promotion as PromotionInterface).level) && p.status === 'in progress')
    return {
      ...sem,
      currentPromotion: {
        promotionId: promotion ? (promotion.promotion as PromotionInterface)._id : null,
        promotionName: promotion ? (promotion.promotion as PromotionInterface).name : null,
      },
    }
  })
})

const isSemesterUnlocked = (sem: SemesterInterface, level: string): boolean => {
  return sem.unlocked.includes(level)
}

const isSemesterAvailable = (semesterLabel: string): boolean => {
  const semesterData = semesters.find((s) => s.code === semesterLabel)
  return semesterData?.available !== false
}

const getRequiredLevel = (sem: SemesterInterface): string => {
  return sem.unlocked[0] || 'N/A'
}

const getSemesterName = (label: string): string => {
  const names: Record<string, string> = {
    S1: 'Semestre 1',
    S2: 'Semestre 2',
    S3: 'Semestre 3',
    S4: 'Semestre 4',
    S5: 'Semestre 5',
    S6: 'Semestre 6',
    S7: 'Semestre 7',
    S8: 'Semestre 8',
    S9: 'Semestre 9',
    S10: 'Semestre 10',
  }
  return names[label] || label
}

const accessSemester = (semesterLabel: string, promotionId: string) => {
  if (!promotionId) return
  router.push(`/student/courses/${semesterLabel}/${promotionId}`)
}
</script>

<style scoped>
.courses-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  font-family: 'Roboto', sans-serif;
}

/* En-tête élégant */
.courses-header {
  height: 160px;
  position: relative;
  overflow: hidden;
  margin-bottom: 3rem;
  border-radius: var(--radius-xl);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg,
      var(--primary-dark) 0%,
      var(--primary-color) 50%,
      var(--primary-light) 100%);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  color: white;
}

.header-main h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 1.125rem;
  font-weight: 300;
  opacity: 0.9;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Badges groupés */
.header-badges {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.info-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.875rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-badge:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.info-badge.promotion {
  background: rgba(48, 168, 85, 0.2);
  border-color: rgba(48, 168, 85, 0.3);
}

.info-badge.promotion:hover {
  background: rgba(48, 168, 85, 0.25);
}

.badge-icon {
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
}

.badge-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}

/* Grille des semestres */
.semesters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Carte de semestre */
.semester-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 2px solid var(--gray-lighter);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.semester-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.semester-card.unlocked::before {
  transform: scaleX(1);
}

.semester-card.locked::before {
  background: linear-gradient(90deg, var(--gray), var(--gray-dark));
}

.semester-card.unlocked {
  border-color: var(--primary-light);
}

.semester-card.unlocked:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color);
}

.semester-card.locked {
  opacity: 0.7;
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
}

.semester-card.locked:hover {
  transform: translateY(-4px);
}

/* Badge de statut */
.semester-status {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.status-icon {
  font-size: 1.5rem;
}

.status-icon.unlocked {
  color: var(--success);
  background: var(--success-light);
  border-radius: 50%;
  padding: 0.5rem;
}

.status-icon.locked {
  color: var(--gray-dark);
  background: var(--gray-extra-light);
  border-radius: 50%;
  padding: 0.5rem;
}

/* En-tête du semestre */
.semester-header {
  margin-bottom: 1.5rem;
}

.semester-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0 0 0.5rem 0;
}

.semester-subtitle {
  font-size: 1rem;
  color: var(--gray-dark);
  font-weight: 500;
}

/* Contenu */
.semester-content {
  margin: 1.5rem 0;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.unlocked-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--success-light);
  border-radius: var(--radius);
  color: var(--success-dark);
  font-weight: 500;
  margin-bottom: 1rem;
}

.check-icon {
  font-size: 1.5rem;
  color: var(--success);
}

/* Info promotion */
.promotion-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(48, 168, 85, 0.08), rgba(255, 255, 255, 0.5));
  border-radius: var(--radius);
  border-left: 3px solid var(--secondary-color);
  margin-bottom: 1rem;
}

.promotion-icon {
  font-size: 1.5rem;
  color: var(--secondary-color);
  flex-shrink: 0;
}

.promotion-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-dark);
  line-height: 1.4;
}

.locked-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gray-extra-light);
  border-radius: var(--radius);
  color: var(--gray-dark);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.lock-icon {
  font-size: 1.5rem;
  color: var(--gray-dark);
}

.locked-info {
  font-size: 0.875rem;
  color: var(--gray);
  text-align: center;
  padding: 0.5rem;
  font-style: italic;
}

/* Bouton d'accès */
.access-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
}

.access-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
}

.access-btn:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 1024px) {
  .semesters-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .courses-container {
    padding: 0 1rem 2rem;
  }

  .courses-header {
    height: auto;
    margin-bottom: 2rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .header-main h1 {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .header-badges {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .info-badge {
    width: 100%;
    justify-content: center;
  }

  .semesters-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .semester-card {
    padding: 1.5rem;
  }

  .semester-title {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .header-main h1 {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 0.9375rem;
  }

  .badge-value {
    font-size: 1.125rem;
  }

  .semester-status {
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
  }

  .status-icon {
    font-size: 1.25rem;
  }

  .semester-title {
    font-size: 1.5rem;
  }
}
</style>
