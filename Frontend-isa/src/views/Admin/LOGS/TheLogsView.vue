<template>
  <div class="logs-admin-container">
    <div class="admin-header">
      <div class="header-title">
        <icon icon="mdi:clipboard-text-clock" width="28" height="28" />
        <h2>Journal des activités</h2>
      </div>

      <div class="search-and-actions">
        <div class="search-box">
          <div class="search-input-container">
            <icon icon="mdi:magnify" width="20" height="20" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher par matricule, nom ou action..."
              class="search-input" @keyup.enter="applySearch" />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search-button"
              aria-label="Effacer la recherche">
              <icon icon="mdi:close" width="18" height="18" />
            </button>
          </div>
        </div>

        <div class="admin-actions">
          <button @click="refreshLogs" class="refresh-button" title="Actualiser">
            <icon icon="mdi:refresh" width="20" height="20" />
          </button>

          <div class="export-dropdown">
            <button @click="toggleExportDropdown" class="export-button" title="Exporter en CSV">
              <icon icon="mdi:file-export-outline" width="20" height="20" />
            </button>
            <div v-if="showExportDropdown" class="export-dropdown-menu">
              <a href="/api/v1/report/export-data?month=3">
                <span> 3 derniers mois</span>
                <icon icon="mdi:download" width="20" height="20" />
              </a>
              <a href="/api/v1/report/export-data?month=6">
                <span> 6 derniers mois</span>
                <icon icon="mdi:download" width="20" height="20" />
              </a>
              <a href="/api/v1/report/export-data?month=9">
                <span>9 derniers mois</span>

                <icon icon="mdi:download" width="20" height="20" />
              </a>
              <a href="/api/v1/report/export-data?month=12">
                <span>12 derniers mois</span>
                <icon icon="mdi:download" width="20" height="20" />
              </a>
              <a href="/api/v1/report/export-data?month=13">
                <span>Tout exporter</span>
                <icon icon="mdi:download" width="20" height="20" />
              </a>
            </div>
          </div>

          <button @click="confirmClearAll" class="danger-button" title="Vider le journal" v-if="hasAdminRole">
            <icon icon="mdi:trash-can-outline" width="20" height="20" />
          </button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-responsive">
        <table class="logs-table">
          <thead>
            <tr>
              <th class="user-col">
                <div class="th-content">
                  <icon icon="mdi:account" width="16" height="16" />
                  <span>Utilisateur</span>
                </div>
              </th>
              <th>
                <div class="th-content">
                  <icon icon="mdi:identifier" width="16" height="16" />
                  <span>Matricule</span>
                </div>
              </th>
              <th class="action-col">
                <div class="th-content">
                  <icon icon="mdi:clock-check-outline" width="16" height="16" />
                  <span>Action</span>
                </div>
              </th>
              <th class="date-col" @click="sortBy('createdAt')">
                <div class="th-content">
                  <icon icon="mdi:calendar-clock" width="16" height="16" />
                  <span>Date/Heure</span>
                  <icon v-if="sortField === 'createdAt'"
                    :icon="sortDirection === 'asc' ? 'mdi:chevron-up' : 'mdi:chevron-down'" width="16" height="16" />
                </div>
              </th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="log-row">
              <td>
                <div class="user-cell-wrapper">
                  <div class="user-avatar" :style="{ backgroundColor: getAvatarColor(log.authorName) }">
                    {{ getInitials(log.authorName) }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ log.authorName }}</div>
                    <div class="user-role" v-if="log.role">{{ log.role }}</div>
                  </div>
                </div>
              </td>
              <td class="id-cell">
                <div class="matricule-badge">
                  <icon icon="mdi:id-card" width="14" height="14" />
                  <span>#{{ log.authorId }}</span>
                </div>
              </td>
              <td class="action-cell">
                <div class="action-content">
                  <span class="action-text">{{ log.action }}</span>
                  <span v-if="log.details" class="action-details">{{ truncate(log.details, 50) }}</span>
                </div>
              </td>
              <td class="date-cell">
                <div class="date-wrapper">
                  <icon icon="mdi:clock-outline" width="14" height="14" />
                  <span>
                    {{ formatDateTime(new Date(log.createdAt)) }}
                  </span>
                </div>
              </td>
              <td>
                <div class="actions-cell">
                  <button @click.stop="viewDetails(log)" class="icon-button" title="Détails">
                    <icon icon="mdi:eye-outline" width="18" height="18" />
                  </button>
                  <button @click.stop="deleteLog(log.id)" class="icon-button danger" title="Supprimer"
                    v-if="hasAdminRole">
                    <icon icon="mdi:trash-can-outline" width="18" height="18" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="logs.length === 0">
              <td colspan="5" class="empty-state">
                <div class="empty-content">
                  <icon icon="mdi:database-remove-outline" width="48" height="48" />
                  <p>Aucune activité trouvée</p>
                  <button v-if="searchQuery" @click="clearSearch" class="retry-button">
                    Réinitialiser la recherche
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="table-footer">
      <div class="rows-info">
        Affichage de {{ rangeStart }}-{{ rangeEnd }} sur {{ totalLogs }} entrées
      </div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1" class="pagination-button" aria-label="Page précédente">
          <icon icon="mdi:chevron-left" width="24" height="24" />
        </button>
        <div class="page-numbers">
          {{ currentPage }} / {{ totalPages }}
        </div>
        <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-button"
          aria-label="Page suivante">
          <icon icon="mdi:chevron-right" width="24" height="24" />
        </button>
      </div>
      <div class="rows-per-page">
        <label for="itemsPerPage">Lignes/page :</label>
        <select id="itemsPerPage" v-model="itemsPerPage" @change="resetPagination" class="page-select">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
    </div>

    <!-- Modal de détail -->
    <TheLogDetailsModal v-if="selectedLog" :log="selectedLog" :has-admin-role="hasAdminRole" @close="selectedLog = null"
      @delete="deleteLog" />
  </div>
</template>

<script setup lang="ts">
import TheLogDetailsModal from '@/components/admin/logs/TheLogDetailsModal.vue'
import { ref, computed, watchEffect, watch, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import debounce from 'lodash/debounce'

interface Log {
  id: string
  authorId: string
  authorName: string
  role?: string
  action: string
  details?: string
  createdAt: Date
}

const logs = ref<Log[]>([])
const filteredLogs = ref<Log[]>([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedLog = ref<Log | null>(null)
const totalLogs = ref<number>(5)
const sortField = ref<string>("createdAt")
const sortDirection = ref<"asc" | 'desc'>("desc")
const hasAdminRole = ref(true)
const showExportDropdown = ref(false)

const fetchLogs = async () => {
  try {
    const logsData = (await axios.get('/api/v1/report', {
      params: {
        page: currentPage.value,
        perPage: itemsPerPage.value,
        search: searchQuery.value,
        sortField: sortField.value,
        sortDirection: sortDirection.value
      }
    })).data
    logs.value = logsData.report
    totalLogs.value = logsData.totalDocs
  } catch (error) {
    console.log(error)
  }
}

const debounceSearchFetch = debounce(fetchLogs, 300)
onMounted(() => {
  fetchLogs()
})

// Watch direct pour les autres filtres (pas debounce)
watch([currentPage, itemsPerPage, sortField, sortDirection], () => {
  fetchLogs()
})

// Watch avec debounce uniquement pour searchQuery
watch(searchQuery, () => {
  debounceSearchFetch()
})

const toggleExportDropdown = () => {
  showExportDropdown.value = !showExportDropdown.value
}

const closeExportDropdown = (event: MouseEvent) => {
  if (!(event.target as HTMLElement).closest('.export-dropdown')) {
    showExportDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeExportDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeExportDropdown)
})

const clearSearch = () => {
  searchQuery.value = ''
}

const sortBy = (sortFieldParam: string) => {
  sortField.value = sortFieldParam
  if (sortField.value === sortFieldParam) {
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
    } else {
      sortDirection.value = 'asc'
    }
  }
}

const applySearch = () => {
  try {
    fetchLogs()
  } catch (error) {
    console.log(error)
  }
}

const totalPages = computed(() => Math.ceil(totalLogs.value / itemsPerPage.value))
const rangeStart = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
const rangeEnd = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalLogs.value))

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetPagination = () => {
  currentPage.value = 1
}

// Fonctions de gestion des logs
const deleteLog = (id: string) => {
  logs.value = logs.value.filter(log => log.id !== id)
  filteredLogs.value = filteredLogs.value.filter(log => log.id !== id)
  if (selectedLog.value?.id === id) {
    selectedLog.value = null
  }
}

const confirmClearAll = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer tous les logs ? Cette action est irréversible.')) {
    logs.value = []
    filteredLogs.value = []
    currentPage.value = 1
  }
}

const refreshLogs = () => {
  currentPage.value = 1
  fetchLogs()
}
const viewDetails = (log: Log) => {
  selectedLog.value = log
}

// Fonctions utilitaires
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const getAvatarColor = (name: string) => {
  const colors = [
    '#5086c1', '#30a855', '#a85530', '#8530a8', '#a8305a',
    '#30a8a1', '#a89330', '#5a30a8', '#a83030', '#30a84a'
  ]
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0)
  return colors[hash % colors.length]
}

const formatDateTime = (date: Date) => {
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}
</script>

<style scoped>
.logs-admin-container {
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  overflow: hidden;
  max-width: 1200px;
  margin: 2rem auto;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* En-tête */
.admin-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  color: var(--white);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-title h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Barre de recherche et actions */
.search-and-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 600px;
  min-width: 300px;
}

.search-input-container {
  position: relative;
  flex-grow: 1;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--tertiary-color);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 42px;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius-lg);
  font-size: 0.9375rem;
  transition: all 0.3s ease;
  background-color: var(--white);
  color: var(--black);
  box-shadow: var(--shadow-light);
  position: relative;
  z-index: 1;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.clear-search-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--tertiary-light);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--rounded);
  transition: all 0.2s ease;
  z-index: 2;
}

.clear-search-button:hover {
  color: var(--error);
  background-color: var(--gray-super-light);
}

.admin-actions {
  display: flex;
  gap: 0.75rem;
  position: relative;
}

.admin-actions button {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--primary-color);
  color: var(--white);
  box-shadow: var(--shadow-light);
}

.admin-actions button:hover {
  transform: translateY(-1px);
}

.refresh-button:hover {
  background-color: var(--primary-light);
}

.export-button {
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0 0.75rem;
  width: auto;
}

.export-button .dropdown-chevron {
  transition: transform 0.2s ease;
}

.export-dropdown {
  position: relative;
}

.export-dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dark);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.export-dropdown-menu a {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border-bottom: 1px solid var(--tertiary-darker);
  color: var(--tertiary-darker);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;

}

.export-dropdown-menu a:hover {
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
}

.danger-button {
  background-color: var(--error-light);
  color: var(--error-dark);
}

.danger-button:hover {
  background-color: var(--error);
  color: var(--white);
}

/* Tableau */
.table-container {
  padding: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.logs-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  min-width: 800px;
}

.logs-table th {
  text-align: left;
  padding: 1rem;
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.logs-table th:hover {
  background-color: var(--primary-color-light);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logs-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-lighter);
  vertical-align: middle;
  transition: background-color 0.2s ease;
}

.log-row:hover td {
  background-color: var(--primary-extra-light);
}

/* Cellules spécifiques */
.user-cell-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--rounded);
  color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--primary-dark);
  margin-bottom: 0.25rem;
}

.user-role {
  font-size: 0.75rem;
  color: var(--white);
  background-color: var(--tertiary-color);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  align-self: flex-start;
}

.id-cell {
  min-width: 120px;
}

.matricule-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--tertiary-extra-light);
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  width: fit-content;
  font-family: 'Courier New', monospace;
  font-size: 0.8125rem;
  color: var(--tertiary-darker);
}

.action-cell {
  max-width: 300px;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-text {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-details {
  font-size: 0.8125rem;
  color: var(--tertiary-dark);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.date-cell {
  white-space: nowrap;
}

.date-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--tertiary-dark);
}

.date-wrapper icon {
  color: var(--tertiary-color);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.icon-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rounded);
  background-color: transparent;
  border: 1px solid var(--gray-lighter);
  cursor: pointer;
  color: var(--tertiary-color);
  transition: all 0.3s ease;
}

.icon-button:hover {
  background-color: var(--primary-extra-light);
  color: var(--primary-color);
  border-color: var(--primary-light);
  transform: translateY(-1px);
}

.icon-button.danger:hover {
  color: var(--error);
  border-color: var(--error-light);
  background-color: var(--error-light);
}

/* État vide */
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--tertiary-light);
}

.empty-content p {
  margin: 0;
  font-size: 1.125rem;
}

.retry-button {
  padding: 0.625rem 1.25rem;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-button:hover {
  background-color: var(--primary-dark);
}

/* Pied de tableau */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-lighter);
  background-color: var(--tertiary-extra-light);
  flex-wrap: wrap;
  gap: 1rem;
}

.rows-info {
  font-size: 0.875rem;
  color: var(--tertiary-dark);
  flex-shrink: 0;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background-color: var(--white);
  border: 1px solid var(--gray-lighter);
  cursor: pointer;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  background-color: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-button {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background-color: var(--white);
  border: 1px solid var(--gray-lighter);
  cursor: pointer;
  color: var(--tertiary-dark);
  transition: all 0.3s ease;
  font-size: 0.875rem;
}

.page-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.page-button.active {
  background-color: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
  font-weight: 500;
}

.rows-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--tertiary-dark);
  flex-shrink: 0;
}

.page-select {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  border: 1px solid var(--gray-lighter);
  background-color: var(--white);
  color: var(--tertiary-dark);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-extra-light);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .admin-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .admin-actions button {
    flex: 1;
    justify-content: center;
  }

  .table-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
  }

  .rows-per-page {
    justify-content: center;
  }

  .export-dropdown-menu {
    right: auto;
    left: 0;
    min-width: 100%;
  }
}
</style>
