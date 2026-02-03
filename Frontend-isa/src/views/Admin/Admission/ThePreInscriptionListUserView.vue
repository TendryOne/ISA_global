<template>
  <div class="elite-admin-container">
    <!-- Header avec effet gradient premium -->
    <div class="elite-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-text">
          <h1>Gestion des Préinscriptions</h1>
          <p class="subtitle">Tableau de bord administratif</p>
        </div>
      </div>
    </div>

    <!-- Cartes de statistiques premium -->
    <div class="elite-stats-grid">
      <div class="elite-stat-card total">
        <div class="stat-content">
          <h3>Nombre de préinscriptions{{ activeField && ` pour ${activeField}` }}</h3>
          <p class="stat-value">{{ totalStudent }}</p>
        </div>
        <div class="stat-icon">
          <Icon icon="mdi:account-group" />
        </div>
      </div>

      <div class="elite-stat-card pending">
        <div class="stat-content">
          <h3>En Attente</h3>
          <p class="stat-value">{{ studentsStatusCount.pending || 0 }}</p>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: `${(studentsStatusCount.pending / totalStudent) * 100}%` }">
            </div>
          </div>
        </div>
        <div class="stat-icon">
          <Icon icon="mdi:clock-outline" />
        </div>
      </div>

      <div class="elite-stat-card approved">
        <div class="stat-content">
          <h3>Approuvés</h3>
          <p class="stat-value">{{ studentsStatusCount.approved || 0 }}</p>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: `${(studentsStatusCount.approved / totalStudent) * 100}%` }">
            </div>
          </div>
        </div>
        <div class="stat-icon">
          <Icon icon="mdi:check-circle-outline" />
        </div>
      </div>

      <div class="elite-stat-card rejected">
        <div class="stat-content">
          <h3>Rejetés</h3>
          <p class="stat-value">{{ studentsStatusCount.rejected || 0 }}</p>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: `${(studentsStatusCount.rejected / totalStudent) * 100}%` }">
            </div>
          </div>
        </div>
        <div class="stat-icon">
          <Icon icon="mdi:close-circle-outline" />
        </div>
      </div>
    </div>

    <!-- Filtres premium par filière -->
    <div class="elite-filters-panel">
      <div class="panel-header">
        <h3>Filtres Avancés</h3>
        <div class="filter-controls">
          <div class="search-export-container">
            <div class="elite-search-container">
              <Icon icon="iconamoon:search-light" class="search-icon" />
              <input v-model="searchQuery" placeholder="Rechercher un étudiant..." class="elite-search-input" />
            </div>
            <a class="elite-export-btn" href="/api/v1/pendingUsers/export-data">
              <Icon icon="ph:export-bold" />
              <span>Exporter Excel</span>
            </a>
          </div>
          <div class="status-filter-container">
            <select v-model="statusFilter" class="elite-filter-select">
              <option value="">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
            </select>
            <button class="elite-reset-btn" @click="clearAllFilters"
              :disabled="!activeField && statusFilter === '' && !searchQuery">
              <Icon icon="mdi:filter-variant-remove" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>

      <div class="filiere-filters">
        <div v-for="field in fields" :key="field.value" class="filiere-filter-card"
          :class="{ active: activeField === field.value }" @click="toggleFieldFilter(field.value)">
          <div class="filiere-icon" :style="{ color: getFieldColor(field.value) }">
            <Icon :icon="getFieldIcon(field.value)" />
          </div>
          <div class="filiere-info">
            <h4>{{ field.label }}</h4>
          </div>
          <div class="selection-indicator" v-if="activeField === field.value">
            <Icon icon="mdi:check-circle" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau data grid premium -->
    <div class="elite-datagrid">
      <div class="grid-header">
        <div class="results-info">
          <span class="results-count">{{ totalStudent }} résultats</span>
          <span class="results-divider">|</span>
          <span class="sort-indicator">
            Tri:
            {{
              sortColumn === 'inscriptionId'
                ? 'ID'
                : sortColumn === 'lastName'
                  ? 'Nom'
                  : sortColumn === 'firstName'
                    ? 'Prénom'
                    : sortColumn === 'field'
                      ? 'Filière'
                      : sortColumn === 'submissionDate'
                        ? 'Date'
                        : 'Statut'
            }}
            ({{ sortDirection === 'asc' ? 'A-Z' : 'Z-A' }})
          </span>
        </div>
        <div class="grid-actions">
          <button class="grid-action-btn refresh" @click="fetchStudents">
            <Icon icon="mdi:reload" />
          </button>
        </div>
      </div>

      <div class="grid-container">
        <table class="elite-table">
          <thead>
            <tr>
              <th @click="sortBy('inscriptionId')" class="sortable">
                <div class="th-content">
                  <span>ID</span>
                  <Icon :icon="sortColumn === 'inscriptionId'
                    ? sortDirection === 'asc'
                      ? 'material-symbols:arrow-drop-up'
                      : 'material-symbols:arrow-drop-down'
                    : 'material-symbols:swap-vert'
                    " class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('lastName')" class="sortable">
                <div class="th-content">
                  <span>ÉTUDIANT</span>
                  <Icon :icon="sortColumn === 'lastName'
                    ? sortDirection === 'asc'
                      ? 'material-symbols:arrow-drop-up'
                      : 'material-symbols:arrow-drop-down'
                    : 'material-symbols:swap-vert'
                    " class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('field')" class="sortable">
                <div class="th-content">
                  <span>FILIÈRE</span>
                  <Icon :icon="sortColumn === 'field'
                    ? sortDirection === 'asc'
                      ? 'material-symbols:arrow-drop-up'
                      : 'material-symbols:arrow-drop-down'
                    : 'material-symbols:swap-vert'
                    " class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('submissionDate')" class="sortable">
                <div class="th-content">
                  <span>DATE</span>
                  <Icon :icon="sortColumn === 'submissionDate'
                    ? sortDirection === 'asc'
                      ? 'material-symbols:arrow-drop-up'
                      : 'material-symbols:arrow-drop-down'
                    : 'material-symbols:swap-vert'
                    " class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('status')" class="sortable">
                <div class="th-content">
                  <span>STATUT</span>
                  <Icon :icon="sortColumn === 'status'
                    ? sortDirection === 'asc'
                      ? 'material-symbols:arrow-drop-up'
                      : 'material-symbols:arrow-drop-down'
                    : 'material-symbols:swap-vert'
                    " class="sort-icon" />
                </div>
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody v-if="!isLoading && !isError">
            <tr v-for="student in students" :key="student.inscriptionId" class="elite-row">
              <td>
                <span class="id-badge">#{{ student.inscriptionId }}</span>
              </td>
              <td>
                <div class="student-card">
                  <div class="student-avatar">
                    {{ getInitials(student.firstName + ' ' + student.lastName) }}
                  </div>
                  <div class="student-info">
                    <div class="student-name">{{ student.lastName }} {{ student.firstName }}</div>
                    <div class="student-email">{{ student.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="filiere-tag" :class="student.field">
                  <div class="tag-decoration"></div>
                  {{ getFieldName(student.field) }}
                </div>
              </td>
              <td>
                <div class="submission-date">
                  {{ formatDate(student.submissionDate) }}
                  <div class="date-hint">
                    à
                    {{
                      new Date(student.submissionDate).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }}
                  </div>
                </div>
              </td>
              <td>
                <div class="status-indicator" :class="student.status">
                  <div class="status-dot"></div>
                  {{ getStatusName(student.status) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="elite-action-btn view" @click="viewStudent(student.inscriptionId)"
                    title="Voir détails">
                    <Icon icon="mdi:eye-outline" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="isLoading && !isError">
            <tr v-for="i in itemsPerPage" :key="i" class="elite-row loading">
              <td>
                <div class="skeleton-box"></div>
              </td>
              <td>
                <div class="skeleton-box"></div>
              </td>
              <td>
                <div class="skeleton-box"></div>
              </td>
              <td>
                <div class="skeleton-box"></div>
              </td>
              <td>
                <div class="skeleton-box"></div>
              </td>
              <td>
                <div class="skeleton-box"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="students.length === 0 && !isLoading && !isError" class="no-results">
        <Icon icon="mdi:database-search" class="no-results-icon" />
        <p>Aucun étudiant trouvé</p>
        <button class="elite-btn reset-filters" @click="clearAllFilters">
          Réinitialiser les filtres
        </button>
      </div>

      <div v-else-if="students.length === 0 && !isLoading && isError">
        <ErrorComponent :message="isError" @retry="fetchStudents" :show-back="false" />
      </div>

      <!-- Pagination élégante -->
      <div class="elite-pagination">
        <div class="rows-selector">
          <span>Afficher :</span>
          <select v-model="itemsPerPage" class="elite-page-select">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
          <span>entrées</span>
        </div>

        <div class="pagination-controls">
          <button @click="prevPage" :disabled="currentPage === 1" class="page-nav">
            <Icon icon="material-symbols:chevron-left" />
          </button>

          <div class="page-numbers">
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)"
              :class="{ active: currentPage === page }" class="page-number">
              {{ page }}
            </button>
          </div>

          <button @click="nextPage" :disabled="currentPage === totalPages" class="page-nav">
            <Icon icon="material-symbols:chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { Icon } from '@iconify/vue'
import debounce from 'lodash/debounce'
import ErrorComponent from '@/components/error/ErrorComponent.vue'

const router = useRouter()

// Données des étudiants
const students = ref<any[]>([])
const searchQuery = ref('')
const statusFilter = ref('pending')
const activeField = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref<number>(10)
const sortColumn = ref('submissionDate')
const sortDirection = ref('desc')
const isLoading = ref<boolean>(false)
const isError = ref<string>('')

const studentsFieldCount = ref<Record<string, number>>({
  informatique: 0,
  btp: 0,
  gestion: 0,
})

const studentsStatusCount = ref<{
  pending: number
  approved: number
  rejected: number
}>({
  approved: 0,
  pending: 0,
  rejected: 0,
})

// Liste des filières disponibles
const fields = [
  { value: 'informatique', label: 'Informatique' },
  { value: 'btp', label: 'BTP' },
  { value: 'gestion', label: 'Gestion' },
]

// Charger les données
const fetchStudents = async () => {
  isLoading.value = true
  isError.value = ''
  try {
    const response = await axios.get('/api/v1/pendingUsers', {
      params: {
        pageQuery: currentPage.value,
        fieldsQuery: activeField.value,
        perPageQuery: itemsPerPage.value,
        searchQuery: searchQuery.value,
        statusQuery: statusFilter.value,
      },
    })
    studentsFieldCount.value = response.data.fieldCounts
    studentsStatusCount.value = response.data.statusCounts
    students.value = response.data.pendingStudents
  } catch (error) {
    isError.value = error.response.data
  } finally {
    isLoading.value = false
  }
}

const totalStudent = computed(() => {
  return Object.values(studentsFieldCount.value).reduce((acc, val) => acc + val, 0)
})

const debounceFetch = debounce(fetchStudents, 300)

onMounted(() => {
  fetchStudents()
})

watch([activeField, searchQuery, itemsPerPage, currentPage, statusFilter], () => {
  debounceFetch()
})

const totalPages = computed(() => {
  return Math.ceil(totalStudent.value / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Méthodes
const toggleFieldFilter = (field: string) => {
  activeField.value = activeField.value === field ? null : field
  currentPage.value = 1
}

const clearAllFilters = () => {
  activeField.value = null
  statusFilter.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

const getFieldIcon = (field: string) => {
  const icons: Record<string, string> = {
    informatique: 'mdi:laptop',
    btp: 'mdi:hammer-wrench',
    gestion: 'mdi:finance',
  }
  return icons[field] || 'mdi:school'
}

const getFieldColor = (field: string) => {
  const colors: Record<string, string> = {
    informatique: 'var(--secondary-color)',
    btp: 'var(--primary-color)',
    gestion: 'var(--tertiary-color)',
  }
  return colors[field] || 'var(--gray-dark)'
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const goToPage = (page: number) => {
  currentPage.value = page
}

const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
  }
  return statusMap[status] || status
}

const getFieldName = (field: string) => {
  const fieldMap: Record<string, string> = {
    btp: 'BTP',
    informatique: 'Informatique',
    gestion: 'Gestion',
  }
  return fieldMap[field] || field
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const viewStudent = (id: string) => {
  router.push(`/admin/pre-inscription/pending-user/${id}`)
}
</script>
<style scoped>
.elite-admin-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
  color: var(--black);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
  min-height: 100vh;
}

/* Header élite */
.elite-header {
  height: 220px;
  position: relative;
  overflow: hidden;
  margin-bottom: 24px;
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
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 32px 32px;
  color: white;
}

.header-text {
  margin-bottom: 24px;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  font-weight: 400;
  opacity: 0.9;
  margin: 0;
}

/* Grille de statistiques */
.elite-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  padding: 0 32px;
  margin-bottom: 32px;
}

.elite-stat-card {
  display: flex;
  justify-content: space-between;
  padding: 24px;
  border-radius: var(--radius-lg);
  color: white;
  box-shadow: var(--shadow);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.elite-stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.elite-stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 12px 0;
  opacity: 0.9;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1;
}

.stat-progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 12px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: white;
  border-radius: 2px;
}

.stat-icon {
  font-size: 2.5rem;
  opacity: 0.2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.elite-stat-card.total {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.elite-stat-card.pending {
  background: linear-gradient(135deg, var(--warning), var(--warning-dark));
}

.elite-stat-card.approved {
  background: linear-gradient(135deg, var(--success), var(--success-dark));
}

.elite-stat-card.rejected {
  background: linear-gradient(135deg, var(--error), var(--error-dark));
}

/* Panel de filtres */
.elite-filters-panel {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin: 0 32px 32px;
  overflow: hidden;
}

.panel-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-extra-light);
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0 0 16px 0;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-export-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.elite-search-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--gray-light);
  font-size: 1.5rem;
}

.elite-search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  background: var(--gray-extra-light);
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 0.95rem;
  color: var(--gray-darker);
  transition: var(--transition);
}

.elite-search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-extra-light);
}

.elite-export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  white-space: nowrap;
}

.elite-export-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.status-filter-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.elite-filter-select {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  background: white;
  font-size: 0.9rem;
  color: var(--gray-dark);
  cursor: pointer;
  transition: var(--transition);
}

.elite-filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-extra-light);
}

.elite-reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--gray-extra-light);
  border: none;
  border-radius: var(--radius);
  font-size: 0.9rem;
  color: var(--gray-dark);
  cursor: pointer;
  transition: var(--transition);
}

.elite-reset-btn:not(:disabled):hover {
  background: var(--gray-lighter);
}

.elite-reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filiere-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  padding: 20px 24px;
}

.filiere-filter-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
}

.filiere-filter-card:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.filiere-filter-card.active {
  border-color: var(--primary-color);
  background: var(--primary-extra-light);
}

.filiere-filter-card.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--primary-color);
}

.filiere-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 16px;
  transition: var(--transition);
}

.filiere-filter-card.active .filiere-icon {
  color: var(--primary-color);
}

.filiere-info {
  flex: 1;
}

.filiere-info h4 {
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-darker);
  margin: 0 0 4px 0;
  transition: var(--transition);
}

.filiere-filter-card.active .filiere-info h4 {
  color: var(--primary-dark);
}

.selection-indicator {
  color: var(--primary-color);
  font-size: 1.2rem;
  opacity: 0;
  transform: scale(0.8);
  transition: var(--transition);
}

.filiere-filter-card.active .selection-indicator {
  opacity: 1;
  transform: scale(1);
}

/* Data Grid */
.elite-datagrid {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin: 0 32px 32px;
  overflow: hidden;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--gray-extra-light);
}

.results-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: var(--gray-dark);
}

.results-count {
  font-weight: 500;
  color: var(--gray-darker);
}

.results-divider {
  opacity: 0.5;
}

.sort-indicator {
  font-size: 0.85rem;
}

.grid-actions {
  display: flex;
  gap: 8px;
}

.grid-action-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--gray-dark);
  cursor: pointer;
  transition: var(--transition);
}

.grid-action-btn:hover {
  background: var(--gray-extra-light);
  color: var(--primary-color);
}

.grid-container {
  overflow-x: auto;
}

.elite-table {
  width: 100%;
  border-collapse: collapse;
}

.elite-table th {
  padding: 16px 24px;
  text-align: left;
  font-weight: 600;
  color: var(--gray-dark);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--gray-extra-light);
  position: sticky;
  top: 0;
  z-index: 2;
}

.th-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.sortable:hover {
  color: var(--primary-color);
}

.sort-icon {
  color: var(--gray-light);
  font-size: 1.2rem;
  transition: var(--transition);
}

.sortable:hover .sort-icon {
  color: var(--primary-color);
}

.elite-row {
  border-bottom: 1px solid var(--gray-extra-light);
  transition: var(--transition);
}

.elite-row:last-child {
  border-bottom: none;
}

.elite-row:hover {
  background: rgba(80, 134, 193, 0.03);
}

.elite-table td {
  padding: 16px 24px;
  vertical-align: middle;
}

/* Styles des cellules */
.id-badge {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.85rem;
  color: var(--gray-dark);
  background: var(--gray-extra-light);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 500;
  color: var(--black);
  margin-bottom: 4px;
}

.student-email {
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.filiere-tag {
  position: relative;
  padding: 8px 12px 8px 24px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.tag-decoration {
  position: absolute;
  left: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.filiere-tag.btp {
  background: rgba(80, 134, 193, 0.1);
  color: var(--primary-color);
}

.filiere-tag.btp .tag-decoration {
  background: var(--primary-color);
}

.filiere-tag.informatique {
  background: rgba(48, 168, 85, 0.1);
  color: var(--secondary-color);
}

.filiere-tag.informatique .tag-decoration {
  background: var(--secondary-color);
}

.filiere-tag.gestion {
  background: rgba(108, 117, 125, 0.1);
  color: var(--tertiary-color);
}

.filiere-tag.gestion .tag-decoration {
  background: var(--tertiary-color);
}

.submission-date {
  font-size: 0.9rem;
  color: var(--gray-darker);
}

.date-hint {
  font-size: 0.75rem;
  color: var(--gray);
  margin-top: 2px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.pending {
  color: var(--warning-dark);
}

.status-indicator.pending .status-dot {
  background: var(--warning);
}

.status-indicator.approved {
  color: var(--success-dark);
}

.status-indicator.approved .status-dot {
  background: var(--success);
}

.status-indicator.rejected {
  color: var(--error-dark);
}

.status-indicator.rejected .status-dot {
  background: var(--error);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.elite-action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.elite-action-btn.view {
  background: var(--primary-extra-light);
  color: var(--primary-color);
}

.elite-action-btn.view:hover {
  background: var(--primary-color);
  color: white;
}

.elite-action-btn.edit {
  background: var(--secondary-extra-light);
  color: var(--secondary-color);
}

.elite-action-btn.edit:hover {
  background: var(--secondary-color);
  color: white;
}

.elite-action-btn.delete {
  background: var(--error-light);
  color: var(--error);
}

.elite-action-btn.delete:hover {
  background: var(--error);
  color: white;
}

/* Skeleton loading */
.skeleton-box {
  display: inline-block;
  height: 16px;
  width: 80%;
  background-color: var(--gray-lighter);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s infinite ease-in-out;
  margin: 8px 0;
}

.elite-row.loading td {
  position: relative;
}

.elite-row.loading td .skeleton-box {
  width: 100%;
  height: 20px;
}

.elite-row.loading td:last-child .skeleton-box {
  width: 96px;
  margin: 0 auto;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
}

/* Aucun résultat */
.no-results {
  padding: 48px 24px;
  text-align: center;
  color: var(--gray-dark);
}

.no-results-icon {
  font-size: 3rem;
  color: var(--gray-light);
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results p {
  font-size: 1.1rem;
  margin: 0 0 24px 0;
}

.reset-filters {
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.reset-filters:hover {
  background: var(--primary-dark);
}

/* Pagination */
.elite-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid var(--gray-extra-light);
}

.rows-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--gray-dark);
}

.elite-page-select {
  padding: 8px 12px;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  background: white;
  font-size: 0.9rem;
  color: var(--gray-darker);
  cursor: pointer;
  transition: var(--transition);
}

.elite-page-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-nav {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray-lighter);
  background: white;
  color: var(--gray-dark);
  cursor: pointer;
  transition: var(--transition);
}

.page-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-nav:not(:disabled):hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
}

.page-number:hover {
  border-color: var(--gray-lighter);
}

.page-number.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Responsive */
@media (max-width: 1200px) {

  .elite-header,
  .elite-stats-grid,
  .elite-filters-panel,
  .elite-datagrid {
    margin-left: 16px;
    margin-right: 16px;
  }
}

@media (max-width: 992px) {
  .header-content {
    padding: 0 24px 24px;
  }

  .elite-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filiere-filters {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .elite-header {
    height: auto;
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
  }

  .search-export-container {
    flex-direction: column;
  }

  .elite-stats-grid {
    grid-template-columns: 1fr;
  }

  .status-filter-container {
    flex-direction: column;
  }

  .elite-filter-select,
  .elite-reset-btn {
    width: 100%;
  }

  .elite-pagination {
    flex-direction: column;
    gap: 16px;
  }

  .rows-selector {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 576px) {

  .elite-table th,
  .elite-table td {
    padding: 12px 16px;
  }

  .student-card {
    gap: 8px;
  }

  .student-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .student-name {
    font-size: 0.9rem;
  }

  .student-email {
    font-size: 0.75rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .elite-action-btn {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
}
</style>
