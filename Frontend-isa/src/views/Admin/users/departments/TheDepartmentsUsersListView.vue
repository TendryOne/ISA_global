<template>
  <div class="elite-admin-container">
    <!-- Header avec effet gradient premium -->


    <!-- Filtres premium -->
    <div class="elite-filters-panel">
      <div class="panel-header">
        <h3>Filtres Avancés</h3>
        <div class="filter-controls">
          <div class="search-export-container">
            <div class="elite-search-container">
              <Icon icon="iconamoon:search-light" class="search-icon" />
              <input v-model="searchQuery" placeholder="Rechercher un utilisateur..." class="elite-search-input">
            </div>

          </div>
          <div class="status-filter-container">
            <select v-model="roleFilter" class="elite-filter-select">
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateurs</option>
              <option value="superAdmin">Super Administrateurs</option>
            </select>
            <button class="elite-reset-btn" @click="clearAllFilters" :disabled="!roleFilter && !searchQuery">
              <Icon icon="mdi:filter-variant-remove" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau data grid premium -->
    <div class="elite-datagrid">
      <div class="grid-header">
        <div class="results-info">
          <span class="results-count">{{ totalCount }} résultats</span>
          <span class="results-divider">|</span>
          <span class="sort-indicator">
            Tri: {{ sortColumn === 'matricule' ? 'Matricule' :
              sortColumn === 'nomComplet' ? 'Nom complet' :
                sortColumn === 'email' ? 'Email' :
                  sortColumn === 'department' ? 'Département' : 'Rôle' }}
            ({{ sortDirection === 'asc' ? 'A-Z' : 'Z-A' }})
          </span>
        </div>
        <div class="grid-actions">
          <button class="grid-action-btn refresh" @click="fetchUsers">
            <Icon icon="mdi:reload" />
          </button>
        </div>
      </div>

      <div class="grid-container">
        <table class="elite-table">
          <thead>
            <tr>
              <th @click="sortBy('matricule')" class="sortable">
                <div class="th-content">
                  <span>MATRICULE</span>
                  <Icon :icon="sortColumn === 'matricule' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('nomComplet')" class="sortable">
                <div class="th-content">
                  <span>NOM COMPLET</span>
                  <Icon :icon="sortColumn === 'nomComplet' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('email')" class="sortable">
                <div class="th-content">
                  <span>EMAIL</span>
                  <Icon :icon="sortColumn === 'email' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('department')" class="sortable">
                <div class="th-content">
                  <span>FONCTION</span>
                  <Icon :icon="sortColumn === 'department' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('role')" class="sortable">
                <div class="th-content">
                  <span>ROLE</span>
                  <Icon :icon="sortColumn === 'role' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody v-if="!isLoading && !isError">
            <tr v-for="user in users" :key="user._id || user.matricule" class="elite-row">
              <td>
                <span class="id-badge">{{ user.matricule || '—' }}</span>
              </td>
              <td>
                <div class="user-card">
                  <div class="user-avatar">
                    {{ getInitials(displayName(user)) }}
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ displayName(user) }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="user-email">{{ user.email }}</div>
              </td>
              <td>
                <div class="department-tag">
                  {{ user.function || '—' }}
                </div>
              </td>
              <td>
                <div class="role-indicator" :class="user.role">
                  {{ getRoleName(user.role) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="elite-action-btn view" @click="viewUser(user)" title="Voir détails">
                    <Icon icon="mdi:eye-outline" />
                  </button>
                  <button class="elite-action-btn edit" @click="editUser(user._id)" title="Modifier">
                    <Icon icon="mdi:pencil-outline" />
                  </button>
                  <button class="elite-action-btn delete" @click="confirmDelete(user)" title="Supprimer">
                    <Icon icon="mdi:delete-outline" />
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

      <div v-if="users.length === 0 && !isLoading && !isError" class="no-results">
        <Icon icon="mdi:account-search" class="no-results-icon" />
        <p>Aucun utilisateur trouvé</p>
        <button class="elite-btn reset-filters" @click="clearAllFilters">
          Réinitialiser les filtres
        </button>
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

    <!-- Modal de confirmation de suppression -->
    <div v-if="userToDelete" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button class="modal-close" @click="userToDelete = null">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{{ userToDelete.nomComplet }}</strong> ?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="userToDelete = null">Annuler</button>
          <button class="btn btn-danger" @click="deleteUser">Supprimer</button>
        </div>
      </div>
    </div>


    <ConfirmModal v-if="userToDelete" :show="!!userToDelete"
      :message="`Cette action va définitivement supprimer l'utilisateur ${displayName(userToDelete)}.`"
      icon="mdi:alert-circle-outline" cancel-text="Annuler" confirm-text="Confirmer la suppression"
      @confirm="deleteUser" @cancel="userToDelete = null" />

    <SuccessToast v-if="toast.show" @dismissed="toast.show = false" :message="toast.message" :type="toast.type"
      :title="toast.type == 'success' ? 'Succès' : 'Erreur'" />


    <AdminUsersCard v-if="userToView" :user="userToView" @close="userToView = null" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import debounce from 'lodash/debounce'
import type AdminInterface from '@/interfaces/admin.interface'
import { useRouter } from 'vue-router'
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import AdminUsersCard from '@/components/admin/users/AdminUsersCard.vue'


const userToView = ref<AdminInterface | null>(null);
const router = useRouter()
// Données des utilisateurs
const users = ref<AdminInterface[]>([])
const totalCount = ref<number>(0)

// États pour la recherche, le filtrage et le tri
const searchQuery = ref<string>('')
const roleFilter = ref<string>('')
const sortColumn = ref<string>('matricule')
const sortDirection = ref<'asc' | 'desc'>('asc')
const userToDelete = ref<AdminInterface | null>(null)
const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })
const isLoading = ref<boolean>(false)
const isError = ref<string>('')
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)



const fetchUsers = async () => {
  isLoading.value = true
  isError.value = ''
  try {
    const res = await axios.get('/api/v1/admins', {
      params: {
        pageQuery: currentPage.value,
        perPageQuery: itemsPerPage.value,
        searchQuery: searchQuery.value,
        roleQuery: roleFilter.value,
      },
    })

    console.log(res.data);

    totalCount.value = res.data.total
    users.value = res.data.admins


  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      isError.value = (err.response?.data as string) || err.message
    } else {
      isError.value = (err as Error).message
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)

const debouncedSearch = debounce(fetchUsers, 300)

watch([roleFilter, itemsPerPage, currentPage, sortColumn, sortDirection], () => {
  fetchUsers()
})

watch(searchQuery, () => {
  currentPage.value = 1
  debouncedSearch()
})




// Pagination
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(totalCount.value / itemsPerPage.value))
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
const clearAllFilters = () => {
  roleFilter.value = ''
  searchQuery.value = ''
  currentPage.value = 1
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

const getRoleName = (role?: string) => {
  const roleMap: Record<string, string> = {
    admin: 'Administrateur',
    superadmin: 'Super Admin',
    user: 'Utilisateur'
  }
  return (role && roleMap[role]) || role || '—'
}



const editUser = (id: string) => {
  router.push(`/admin/users/departments/modify/${id}`)
}

const confirmDelete = (user: AdminInterface) => {
  userToDelete.value = user
}

const deleteUser = async () => {
  if (!userToDelete.value) return
  try {
    const id = (userToDelete.value._id)
    if (id) {
      await axios.delete(`/api/v1/admins/user/${id}`, { withCredentials: true })
    }
    toast.value = { show: true, message: `Utilisateur ${displayName(userToDelete.value)} supprimé`, type: 'success' };
    userToDelete.value = null
    await fetchUsers()
  } catch (error) {
    toast.value = { show: true, message: error.response.data, type: 'error' };
  }
}




const displayName = (u: AdminInterface): string => {
  const full = [u.name, u.firstName].filter(Boolean).join(' ').trim()
  return full || u.matricule || ''
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const viewUser = (user: AdminInterface) => {
  userToView.value = user;
}





</script>

<style scoped>
.elite-admin-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0;
  color: var(--black);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
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
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 50%, var(--primary-light) 100%);
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

/* Panel de filtres */
.elite-filters-panel {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
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

/* Data Grid */
.elite-datagrid {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  margin-top: 24px;
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

.grid-action-btn.add {
  background: var(--primary-color);
  color: white;
}

.grid-action-btn.add:hover {
  background: var(--primary-dark);
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

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
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

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--black);
}

.user-email {
  font-size: 0.9rem;
  color: var(--gray-dark);
}

.department-tag {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  display: inline-block;
}

.role-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.role-indicator.admin {
  color: var(--secondary-color);
}

.role-indicator.admin .role-dot {
  background: var(--secondary-color);
}

.role-indicator.superadmin {
  color: var(--primary-color);
}

.role-indicator.superadmin .role-dot {
  background: var(--primary-color);
}

.role-indicator.user {
  color: var(--tertiary-color);
}

.role-indicator.user .role-dot {
  background: var(--tertiary-color);
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

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dark);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.modal-header h3 {
  margin: 0;
  color: var(--black);
}

.modal-close {
  background: none;
  border: none;
  color: var(--tertiary-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
}

.modal-close:hover {
  background: var(--gray-super-light);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-lighter);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-secondary {
  background-color: var(--tertiary-extra-light);
  color: var(--tertiary-dark);
}

.btn-secondary:hover {
  background-color: var(--tertiary-light);
}

.btn-danger {
  background-color: var(--error);
  color: white;
}

.btn-danger:hover {
  background-color: var(--error-dark);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-dark);
  color: white;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: var(--success);
}

.toast.error {
  background-color: var(--error);
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1200px) {

  .elite-header,
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
