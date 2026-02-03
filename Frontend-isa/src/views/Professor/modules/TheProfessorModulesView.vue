<template>
  <div class="professor-modules-container" v-if="route.params.moduleId === undefined">
    <!-- En-tête premium -->
    <div class="premium-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="mdi:book-education" />
        </div>
        <div class="header-text">
          <h1>Mes Modules d'Enseignement</h1>
          <p>Gérez et suivez vos modules et progressions</p>
        </div>
      </div>
      <div class="header-stats">
        <div class="stat-item">
          <Icon icon="mdi:bookshelf" />
          <span>{{ progressions.length }} Modules</span>
        </div>
        <div class="stat-item">
          <Icon icon="mdi:account-group" />
          <span>{{ filter.length }} Promotions</span>
        </div>
      </div>
    </div>

    <!-- Filtre premium -->
    <div class="filter-section">
      <div class="filter-card">
        <div class="filter-header">
          <Icon icon="mdi:filter" />
          <h3>Filtrer les modules</h3>
        </div>
        <div class="filter-content">
          <label class="filter-label">
            <Icon icon="mdi:account-group" />
            Par promotion
          </label>
          <div class="select-wrapper">
            <select
              id="promotion"
              v-model="filterPromotion"
              @change="chooseFilter(filterPromotion)"
              class="premium-select"
            >
              <option value="">Toutes les promotions</option>
              <option v-for="promo in filter" :key="promo._id" :value="promo._id">
                {{ promo.name }}
              </option>
            </select>
            <Icon icon="mdi:chevron-down" class="select-arrow" />
          </div>
        </div>
      </div>

      <!-- Statistiques de filtre -->
      <div class="filter-stats">
        <div class="stat-card">
          <Icon icon="mdi:clock-outline" />
          <div class="stat-info">
            <span class="stat-number">{{ totalHoursDone }}h</span>
            <span class="stat-label">Heures réalisées</span>
          </div>
        </div>
        <div class="stat-card">
          <Icon icon="mdi:clock-alert" />
          <div class="stat-info">
            <span class="stat-number">{{ totalHoursPlanned }}h</span>
            <span class="stat-label">Heures planifiées</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des modules -->
    <div class="modules-grid">
      <TheProfessorModuleItem
        v-for="progression in filteredPromotions"
        :key="progression.code"
        :module="progression"
        class="module-card"
      />
    </div>

    <!-- État vide -->
    <div v-if="!filteredPromotions.length" class="empty-state">
      <div class="empty-icon">
        <Icon icon="mdi:book-remove" />
      </div>
      <h3>Aucun module trouvé</h3>
      <p>Aucun module ne correspond aux critères de filtrage sélectionnés.</p>
    </div>
  </div>

  <RouterView />
</template>

<script setup lang="ts">
import ModuleItem from '@/components/modules/ModuleItem.vue'
import type ProggressionInterface from '@/interfaces/progressionModuleInterface'
import type PromotionInterface from '@/interfaces/promotion.interface'
import type ScheduleInterface from '@/interfaces/Schedule.interface'
import { useMyUserStore } from '@/stores/userStore'
import axios from 'axios'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { Icon } from '@iconify/vue'
import TheProfessorModuleItem from '@/components/modules/TheProfessorModuleItem.vue'
import { useRoute } from 'vue-router'

const progressions = ref<ProggressionInterface[]>([])
const user = useMyUserStore().currentUser
const filterPromotion = ref<string>('')
const route = useRoute()

const fetchModulesProgression = async () => {
  try {
    const response = await axios.get(`/api/v1/modules/progression/${user?._id}`)
    progressions.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression des modules :', error)
  }
}

const filter = computed(() => {
  if (!progressions.value) return []
  const promotionName = progressions.value.map((p) => p.promotion)
  return [...new Set(promotionName)]
})

function chooseFilter(filter: string) {
  filterPromotion.value = filter
}

const filteredPromotions = computed(() => {
  if (filterPromotion.value === '') return progressions.value
  return progressions.value.filter((p) => p.promotion._id === filterPromotion.value)
})

// Statistiques calculées
const totalHoursDone = computed(() => {
  return filteredPromotions.value.reduce((total, module) => total + module.hoursDone, 0)
})

const totalHoursPlanned = computed(() => {
  return filteredPromotions.value.reduce((total, module) => total + module.hoursPlanned, 0)
})

watchEffect(() => {
  if (route.params.moduleId === undefined) {
    fetchModulesProgression()
  }
})
</script>

<style scoped>
.professor-modules-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* En-tête premium */
.premium-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: 20px;
  padding: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(80, 134, 193, 0.3);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.header-icon svg {
  width: 32px;
  height: 32px;
}

.header-text h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
}

.header-text p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-item svg {
  width: 20px;
  height: 20px;
}

/* Section de filtre */
.filter-section {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.filter-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.filter-header svg {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.filter-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-dark);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.75rem;
}

.filter-label svg {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
}

.select-wrapper {
  position: relative;
}

.premium-select {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid var(--primary-extra-light);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  color: var(--text-dark);
  appearance: none;
  transition: all 0.3s ease;
}

.premium-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(80, 134, 193, 0.2);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--primary-color);
  pointer-events: none;
}

/* Statistiques de filtre */
.filter-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 252, 0.95) 100%);
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  min-width: 200px;
}

.stat-card svg {
  width: 32px;
  height: 32px;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Grille des modules */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

/* Animations */
.module-fade-enter-active,
.module-fade-leave-active {
  transition: all 0.4s ease;
}

.module-fade-enter-from,
.module-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* États vides */
.empty-state,
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.empty-state svg,
.loading-state svg {
  width: 64px;
  height: 64px;
  color: var(--primary-color);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-state h3,
.loading-state p {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.spinner {
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .filter-section {
    grid-template-columns: 1fr;
  }

  .filter-stats {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
  .professor-modules-container {
    padding: 1rem;
  }

  .premium-header {
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .filter-stats {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.75rem;
  }

  .header-icon {
    width: 60px;
    height: 60px;
  }

  .header-icon svg {
    width: 28px;
    height: 28px;
  }

  .filter-card,
  .stat-card {
    padding: 1.25rem;
  }
}
</style>
