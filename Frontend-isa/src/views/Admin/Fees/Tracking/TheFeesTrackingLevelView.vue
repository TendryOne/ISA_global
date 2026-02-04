<template>
  <div class="level-promotions-container"
    v-if="route.params.filiere && route.params.level && !route.params.promotionId">
    <BreadCrumbsBack title="Retour au choix de niveau" />

    <header class="header">
      <div class="header-content">
        <div class="header-badge">
          <Icon icon="mdi:school-outline" class="header-icon" />
          {{ displayFiliere }} • {{ displayLevel }}
        </div>
        <h1>Promotions disponibles</h1>
        <p class="subtitle">Gérez et suivez les frais de scolarité par promotion</p>
      </div>
      <div class="header-actions">
        <button class="refresh-btn" @click="fetchPromotions" :disabled="isLoading" title="Rafraîchir">
          <Icon icon="mdi:refresh" class="refresh-icon" :class="{ 'spinning': isLoading }" />
          <span class="btn-text">Rafraîchir</span>
        </button>
        <button class="create-promotion-btn" @click="createNewPromotion" title="Créer une promotion">
          <Icon icon="mdi:plus" class="create-icon" />
          <span class="btn-text">Nouvelle promotion</span>
        </button>
      </div>
    </header>

    <div class="content-container">
      <!-- Stats Cards -->
      <div class="stats-grid" v-if="!isLoading && !isError">
        <div class="stat-card">
          <div class="stat-icon-container active">
            <Icon icon="mdi:account-group" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-number">{{promotions.filter(p => p.isActive).length}}</span>
            <span class="stat-label">Promotions actives</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container inactive">
            <Icon icon="mdi:pause-circle" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-number">{{promotions.filter(p => !p.isActive).length}}</span>
            <span class="stat-label">Promotions inactives</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-container total">
            <Icon icon="mdi:view-list" class="stat-icon" />
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ promotions.length }}</span>
            <span class="stat-label">Total promotions</span>
          </div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="search-filter-section" v-if="promotions.length > 0 && !isLoading && !isError">
        <div class="search-container">
          <Icon icon="mdi:magnify" class="search-icon" />
          <input v-model="searchQuery" type="text" placeholder="Rechercher une promotion..." class="search-input" />
        </div>
        <div class="filter-container">
          <select v-model="statusFilter" class="filter-select">
            <option value="">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="card">
        <div class="table-header">
          <div class="table-info">
            <h3 class="table-title">Liste des promotions</h3>
            <span class="table-count">{{ filteredPromotions.length }} promotion(s) {{ filteredPromotions.length !==
              promotions.length ? `sur ${promotions.length}` : '' }}</span>
          </div>
          <div class="table-actions">
            <button class="view-toggle-btn" @click="toggleView" :title="isCardView ? 'Vue tableau' : 'Vue cartes'">
              <Icon :icon="isCardView ? 'mdi:view-list' : 'mdi:view-grid'" class="toggle-icon" />
              <span class="btn-text">{{ isCardView ? 'Tableau' : 'Cartes' }}</span>
            </button>
          </div>
        </div>

        <!-- Card View -->
        <div v-if="isCardView" class="cards-grid" v-show="!isLoading && !isError && filteredPromotions.length">
          <div v-for="p in filteredPromotions" :key="p._id" class="promotion-card" @click="openTracking(p)">
            <div class="card-header">
              <div class="card-title-section">
                <h4 class="card-title">{{ p.name }}</h4>
                <span :class="['card-status', p.isActive ? 'active' : 'inactive']">
                  <span class="status-dot"></span>
                  {{ p.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="card-actions">
                <button class="card-action-btn" @click.stop="openTracking(p)" title="Voir le suivi">
                  <Icon icon="mdi:eye" class="action-icon" />
                </button>
              </div>
            </div>
            <div class="card-content">
              <div class="card-info-item">
                <Icon icon="mdi:calendar-range" class="info-icon" />
                <span class="info-text">{{ formatDateRange(p.startDate, p.endDate) }}</span>
              </div>
              <div class="card-info-item" v-if="p.createdAt">
                <Icon icon="mdi:calendar-plus" class="info-icon" />
                <span class="info-text">Créée le {{ formatDate(p.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="!isCardView" class="table-container">
          <table class="table" role="grid" aria-label="Promotions disponibles">
            <thead>
              <tr>
                <th>
                  <button class="sort-btn" @click="toggleSort('name')">
                    Promotion
                    <Icon :icon="getSortIcon('name')" class="sort-icon" />
                  </button>
                </th>
                <th>
                  <button class="sort-btn" @click="toggleSort('startDate')">
                    Période
                    <Icon :icon="getSortIcon('startDate')" class="sort-icon" />
                  </button>
                </th>
                <th>
                  <button class="sort-btn" @click="toggleSort('isActive')">
                    Statut
                    <Icon :icon="getSortIcon('isActive')" class="sort-icon" />
                  </button>
                </th>
                <th>
                  <button class="sort-btn" @click="toggleSort('createdAt')">
                    Créée le
                    <Icon :icon="getSortIcon('createdAt')" class="sort-icon" />
                  </button>
                </th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody v-if="!isLoading && !isError && filteredPromotions.length">
              <tr v-for="p in sortedPromotions" :key="p._id" class="table-row" @click="openTracking(p)">
                <td class="name">
                  <div class="name-content">
                    <span class="name-text">{{ p.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-range">
                    {{ formatDateRange(p.startDate, p.endDate) }}
                  </div>
                </td>
                <td>
                  <span :class="['status', p.isActive ? 'active' : 'inactive']">
                    <span class="status-dot"></span>
                    {{ p.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <span class="created-date">{{ p.createdAt ? formatDate(p.createdAt) : '—' }}</span>
                </td>
                <td class="actions">
                  <button class="action-btn primary" @click.stop="openTracking(p)" title="Voir le suivi">
                    <Icon icon="mdi:eye" class="action-icon" />
                    <span class="btn-text">Suivi</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && !isError && !filteredPromotions.length" class="empty-state">
          <div class="empty-box">
            <div class="empty-icon-container">
              <Icon icon="mdi:folder-open-outline" class="empty-icon" />
            </div>
            <div class="empty-text">
              <h3>{{ promotions.length === 0 ? 'Aucune promotion trouvée' : 'Aucun résultat' }}</h3>
              <p>{{ promotions.length === 0 ? `Il n'existe pas encore de promotion pour ${displayFiliere} •
                ${displayLevel}.` : 'Aucune promotion ne correspond à vos critères de recherche.' }}</p>
            </div>
            <button v-if="promotions.length === 0" class="create-btn" @click="createNewPromotion">
              <Icon icon="mdi:plus" class="create-icon" />
              Aller vers la page de création d'une promotion
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-if="!isLoading && isError" class="error-state">
          <div class="error-content">
            <Icon icon="mdi:alert-circle" class="error-icon" />
            <div>
              <h3>Erreur de chargement</h3>
              <p>{{ isError }}</p>
            </div>
            <button class="retry-btn" @click="fetchPromotions">Réessayer</button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <div class="loading-content">
            <span class="spinner" aria-hidden="true"></span>
            <span>Chargement des promotions…</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import { Icon } from '@iconify/vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, ref, watch } from 'vue'
import axios from 'axios'
import type PromotionInterface from '@/interfaces/promotion.interface'

const route = useRoute()
const router = useRouter()

const displayFiliere = computed(() => {
  const f = String(route.params.filiere || '')
  return f ? f.charAt(0).toUpperCase() + f.slice(1).toLowerCase() : ''
})
const displayLevel = computed(() => String(route.params.level || '').toUpperCase())

// Data
const promotions = ref<PromotionInterface[]>([])
const isLoading = ref(false)
const isError = ref('')

// UI State
const searchQuery = ref('')
const statusFilter = ref('')
const isCardView = ref(false)
const sortField = ref<keyof PromotionInterface>('name')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed properties
const filteredPromotions = computed(() => {
  let filtered = promotions.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter(p => p.isActive === isActive)
  }

  return filtered
})

const sortedPromotions = computed(() => {
  const sorted = [...filteredPromotions.value]

  return sorted.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]

    let comparison = 0

    if (sortField.value === 'startDate' || sortField.value === 'createdAt') {
      const aDate = new Date(aVal as Date)
      const bDate = new Date(bVal as Date)
      comparison = aDate.getTime() - bDate.getTime()
    } else if (sortField.value === 'isActive') {
      comparison = (aVal ? 1 : 0) - (bVal ? 1 : 0)
    } else {
      comparison = String(aVal || '').localeCompare(String(bVal || ''))
    }

    return sortDirection.value === 'desc' ? -comparison : comparison
  })
})

// Functions
async function fetchPromotions() {
  isLoading.value = true
  isError.value = ''
  try {
    const res = await axios.get('/api/v1/promotions', {
      params: {
        field: route.params.filiere,
        level: route.params.level,
      }
    })
    promotions.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
  } catch (err) {
    const message = (axios.isAxiosError && axios.isAxiosError(err) && err.response?.data) ? String(err.response.data) : (err as Error).message
    isError.value = message || 'Erreur lors du chargement des promotions.'
  } finally {
    isLoading.value = false
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateRange(startDate: Date, endDate: Date): string {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return `${formatDate(start as unknown as Date)} — ${formatDate(end as unknown as Date)}`
}

function toggleView() {
  isCardView.value = !isCardView.value
}

function toggleSort(field: keyof PromotionInterface) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function getSortIcon(field: keyof PromotionInterface): string {
  if (sortField.value !== field) return 'mdi:unfold-more-horizontal'
  return sortDirection.value === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down'
}

function openTracking(p: PromotionInterface) {
  const filiere = String(route.params.filiere || '')
  const level = String(route.params.level || '')
  const id = p._id as string
  if (id) {
    router.push(`/admin/suivi-paiements/${filiere}/${level}/${id}`)
  } else {
    router.push({ query: { promotionName: p.name } })
  }
}

function createNewPromotion() {
  const filiere = String(route.params.filiere || '')
  const level = String(route.params.level || '')
  router.push(`/admin/promotions/${filiere}/${level}`)
}

// Detect mobile device for default view
onMounted(() => {
  fetchPromotions()
  isCardView.value = window.innerWidth <= 768
})

watch(() => [route.params.filiere, route.params.level], () => {
  fetchPromotions()
})

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768 && !isCardView.value) {
    isCardView.value = true
  }
})

</script>

<style scoped>
/* Container */
.level-promotions-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: var(--background-light, #f8fafc);
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color, #3b82f6);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.header-icon {
  width: 18px;
  height: 18px;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark, #1f2937);
  line-height: 1.2;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  font-size: 1rem;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.refresh-btn,
.create-promotion-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.refresh-btn {
  border: 1px solid var(--border-light, #e5e7eb);
  background: white;
  color: var(--text-secondary, #6b7280);
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.refresh-btn:hover:not(:disabled) {
  background: var(--background-light, #f9fafb);
  border-color: var(--border-dark, #d1d5db);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-promotion-btn {
  border: 1px solid var(--primary-color, #3b82f6);
  background: var(--primary-color, #3b82f6);
  color: white;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.create-promotion-btn:hover {
  background: var(--primary-dark, #2563eb);
  border-color: var(--primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.refresh-icon.spinning {
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

/* Content Container */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
}

.stat-icon-container {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon-container.active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.stat-icon-container.inactive {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.stat-icon-container.total {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.stat-icon {
  width: 24px;
  height: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--text-dark, #1f2937);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

/* Search and Filter */
.search-filter-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--text-secondary, #6b7280);
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.75rem;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-container {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card */
.card {
  background: white;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 12px;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--background-light, #f9fafb);
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}

.table-info h3.table-title {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark, #1f2937);
}

.table-count {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.table-actions {
  display: flex;
  gap: 0.75rem;
}

.view-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 8px;
  background: white;
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-toggle-btn:hover {
  background: var(--background-light, #f9fafb);
  border-color: var(--primary-color, #3b82f6);
  color: var(--primary-color, #3b82f6);
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.promotion-card {
  background: white;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 10px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
}

.promotion-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  border-color: var(--primary-color, #3b82f6);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-title-section {
  flex: 1;
}

.card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark, #1f2937);
  line-height: 1.3;
}

.card-status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card-status.active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.card-status.inactive {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-action-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-light, #e5e7eb);
  border-radius: 6px;
  background: white;
  color: var(--text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-action-btn:hover {
  background: var(--primary-color, #3b82f6);
  border-color: var(--primary-color, #3b82f6);
  color: white;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 1rem 1.5rem;
  background: var(--background-light, #f9fafb);
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-secondary, #6b7280);
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.sort-btn:hover {
  color: var(--primary-color, #3b82f6);
}

.sort-icon {
  width: 14px;
  height: 14px;
}

.text-right {
  text-align: right;
}

.table-row {
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

.table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
  vertical-align: middle;
}

.name-content {
  display: flex;
  flex-direction: column;
}

.name-text {
  font-weight: 600;
  color: var(--text-dark, #1f2937);
  font-size: 0.875rem;
}

.date-range,
.created-date {
  font-size: 0.875rem;
  color: var(--text-secondary, #6b7280);
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status.active {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.status.active .status-dot {
  background: rgb(34, 197, 94);
}

.status.inactive {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.status.inactive .status-dot {
  background: rgb(249, 115, 22);
}

.actions {
  text-align: right;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--primary-color, #3b82f6);
  background: var(--primary-color, #3b82f6);
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-dark, #2563eb);
  border-color: var(--primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* Empty State */
.empty-state {
  padding: 3rem 1.5rem;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon-container {
  padding: 1.5rem;
  border-radius: 16px;
  background: var(--background-light, #f9fafb);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--text-secondary, #6b7280);
}

.empty-text h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text-dark, #1f2937);
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-text p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--primary-color, #3b82f6);
  border-radius: 8px;
  background: var(--primary-color, #3b82f6);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.create-btn:hover {
  background: var(--primary-dark, #2563eb);
  border-color: var(--primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
}

.create-icon {
  width: 18px;
  height: 18px;
}

/* Error State */
.error-state {
  padding: 3rem 1.5rem;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: rgb(239, 68, 68);
}

.error-content h3 {
  margin: 0 0 0.5rem 0;
  color: rgb(239, 68, 68);
  font-size: 1.25rem;
  font-weight: 600;
}

.error-content p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.retry-btn {
  padding: 0.75rem 1.25rem;
  border: 1px solid rgb(239, 68, 68);
  border-radius: 8px;
  background: rgb(239, 68, 68);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgb(220, 38, 38);
  border-color: rgb(220, 38, 38);
}

/* Loading State */
.loading {
  padding: 3rem 1.5rem;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-secondary, #6b7280);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(59, 130, 246, 0.25);
  border-left-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .level-promotions-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    min-width: auto;
  }

  .filter-container {
    justify-content: flex-start;
  }

  .filter-select {
    min-width: auto;
    flex: 1;
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .table-actions {
    justify-content: flex-start;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .promotion-card {
    padding: 1rem;
  }

  .table th,
  .table td {
    padding: 0.75rem;
  }

  .action-btn .btn-text {
    display: none;
  }

  .action-btn {
    padding: 0.5rem;
    min-width: 36px;
    justify-content: center;
  }

  .view-toggle-btn .btn-text,
  .refresh-btn .btn-text,
  .create-promotion-btn .btn-text {
    display: none;
  }

  .refresh-btn,
  .create-promotion-btn,
  .view-toggle-btn {
    padding: 0.75rem;
    min-width: 44px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .level-promotions-container {
    padding: 0.75rem;
  }

  .header-content h1 {
    font-size: 1.25rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .header-badge {
    font-size: 0.75rem;
    padding: 0.375rem 0.75rem;
  }

  .card {
    border-radius: 8px;
  }

  .table-header {
    padding: 1rem;
  }

  .cards-grid {
    padding: 0.75rem;
  }

  .promotion-card {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .empty-state,
  .error-state,
  .loading {
    padding: 2rem 1rem;
  }
}

@media (max-width: 360px) {
  .header-actions {
    gap: 0.5rem;
  }

  .refresh-btn,
  .create-promotion-btn,
  .view-toggle-btn {
    min-width: 40px;
    padding: 0.625rem;
  }

  .search-input {
    font-size: 16px;
    /* Prevent zoom on iOS */
  }

  .filter-select {
    font-size: 16px;
    /* Prevent zoom on iOS */
  }
}
</style>
