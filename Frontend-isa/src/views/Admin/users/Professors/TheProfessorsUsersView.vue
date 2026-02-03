<template>
  <div class="professors-container" v-if="!route.params.id">
    <BreadCrumbsBack title="Retour aux utilisateurs" />

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <Icon icon="mdi:account-group" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalProfessors }}</div>
          <div class="stat-label">Total professeurs</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon permanent">
          <Icon icon="mdi:account-check" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ permanentCount }}</div>
          <div class="stat-label">Permanents</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon temporary">
          <Icon icon="mdi:account-clock" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ temporaryCount }}</div>
          <div class="stat-label">Temporaires</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon departments">
          <Icon icon="mdi:domain" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ departmentCount }}</div>
          <div class="stat-label">Départements actifs</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="header-section">
          <h2>Gestion des professeurs</h2>
          <p class="subtitle">Administration du corps enseignant</p>
        </div>
        <div class="header-right">
          <div class="toolbar">
            <ActionButton icon="mdi:plus" variant="primary" @click="showCreateModal = true" class="create-btn">
              <span class="btn-text">Nouveau professeur</span>
            </ActionButton>
            <div class="search-group">
              <Icon icon="mdi:magnify" class="search-icon" />
              <input v-model.trim="searchQuery" class="search-input premium-input"
                placeholder="Rechercher un professeur..." />
            </div>
            <div class="filter-group">
              <select v-model="departmentFilter" class="filter-select premium-input">
                <option value="">Tous les départements</option>
                <option value="informatique">Informatique</option>
                <option value="btp">BTP</option>
                <option value="gestion">Gestion</option>
              </select>
            </div>
            <div class="filter-group">
              <select v-model="statusFilter" class="filter-select premium-input">
                <option value="">Tous les statuts</option>
                <option value="permanent">Permanents</option>
                <option value="temporary">Temporaires</option>
              </select>
            </div>
          </div>
          <div class="meta">
            <span class="count">{{ filteredProfessors.length }} professeurs</span>
            <button class="refresh-btn premium-btn" @click="fetchProfessors" :disabled="loading"
              title="Actualiser les données">
              <Icon icon="mdi:refresh" :class="{ 'spin': loading }" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="professors-table premium-table" role="grid" aria-label="Liste des professeurs">
          <thead>
            <tr>
              <th class="column-professor">Professeur</th>
              <th class="column-contact">Contact</th>
              <th class="column-department">Département</th>
              <th class="column-status">Statut</th>
              <th class="column-hire-date">Date d'embauche</th>
              <th class="column-actions">Actions</th>
            </tr>
          </thead>

          <tbody v-if="!loading && !error && filteredProfessors.length">
            <tr v-for="professor in filteredProfessors" :key="professor._id" class="table-row">
              <td class="professor-cell">
                <div class="professor-info">
                  <div class="avatar premium-avatar" :style="avatarStyle(professorFullName(professor))">
                    {{ initials(professorFullName(professor)) }}
                  </div>
                  <div class="professor-details">
                    <div class="name">{{ professorFullName(professor) }}</div>
                    <div class="matricule">{{ professor.matricule }}</div>
                    <div class="gender">{{ formatGender(professor.gender) }}</div>
                  </div>
                </div>
              </td>
              <td class="contact-cell">
                <div class="contact-info">
                  <div class="email">
                    <Icon icon="mdi:email" class="contact-icon" />
                    <span>{{ professor.email }}</span>
                  </div>
                  <div v-if="professor.emailProfessional" class="email-pro">
                    <Icon icon="mdi:email-outline" class="contact-icon" />
                    <span>{{ professor.emailProfessional }}</span>
                  </div>
                  <div class="phone">
                    <Icon icon="mdi:phone" class="contact-icon" />
                    <span>{{ professor.phone || '—' }}</span>
                  </div>
                </div>
              </td>
              <td class="department-cell">
                <div class="departments-container">
                  <template v-if="professor.department && professor.department.length <= 2">
                    <!-- Show individual badges for 1-2 departments -->
                    <span v-for="dept in professor.department" :key="dept" class="department-badge"
                      :class="departmentClass([dept])">
                      <Icon :icon="departmentIcon([dept])" class="department-icon" />
                      {{ formatDepartment([dept]) }}
                    </span>
                  </template>
                  <template v-else-if="professor.department && professor.department.length > 2">
                    <!-- Show summary badge for 3+ departments -->
                    <span class="department-badge dept-multiple">
                      <Icon icon="mdi:view-grid" class="department-icon" />
                      {{ professor.department.length }} départements
                    </span>
                    <div class="departments-tooltip">
                      {{ formatDepartment(professor.department) }}
                    </div>
                  </template>
                  <span v-else class="department-badge dept-default">
                    <Icon icon="mdi:help" class="department-icon" />
                    Non assigné
                  </span>
                </div>
              </td>
              <td class="status-cell">
                <span class="status-badge"
                  :class="{ permanent: professor.isPermanent, temporary: !professor.isPermanent }">
                  <Icon :icon="professor.isPermanent ? 'mdi:account-check' : 'mdi:account-clock'" class="status-icon" />
                  {{ professor.isPermanent ? 'Permanent' : 'Temporaire' }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(professor.hireDate) }}</td>
              <td class="actions-cell">
                <div class="actions">
                  <ActionButton icon="mdi:eye-outline" size="small" variant="outline" @click="viewProfessor(professor)"
                    title="Voir les détails">
                    Détails
                  </ActionButton>
                  <ActionButton icon="mdi:pencil-outline" size="small" variant="outline"
                    @click="editProfessor(professor)" title="Modifier">
                    Modifier
                  </ActionButton>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!loading && !error && !filteredProfessors.length">
            <tr>
              <td colspan="6" class="empty">
                <div class="empty-state">
                  <div class="empty-icon">
                    <Icon icon="mdi:account-group-outline" />
                  </div>
                  <div class="empty-text">
                    <h3>Aucun professeur trouvé</h3>
                    <p>{{ searchQuery ?
                      'Aucun professeur ne correspond à votre recherche.' : 'Aucun professeur enregistré.' }}</p>
                  </div>
                  <ActionButton v-if="!searchQuery" icon="mdi:plus" @click="showCreateModal = true">
                    Ajouter le premier professeur
                  </ActionButton>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!loading && error">
            <tr>
              <td colspan="6" class="error-state">
                <div class="error-content">
                  <Icon icon="mdi:alert-circle-outline" class="error-icon" />
                  <div class="error-text">
                    <h3>Erreur de chargement</h3>
                    <p>{{ error }}</p>
                  </div>
                  <ActionButton size="small" @click="fetchProfessors">Réessayer</ActionButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Chargement des professeurs...</span>
      </div>
    </div>

    <!-- Professor Modal Form -->
    <ProfessorModalForm v-if="showCreateModal" @close="showCreateModal = false" @submit="handleCreateProfessor"
      :loading="loading" />

    <ProfessorModalForm v-if="showEditModal && selectedProfessor" :professor="selectedProfessor" :is-edit="true"
      @close="closeEditModal" @submit="handleEditProfessor" :loading="loading" />

    <SuccessToast v-if="toast.show" :type="toast.type" :message="toast.message" :title="toast.title"
      @dismissed="toast.show = false" />



  </div>

  <div>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { Icon } from '@iconify/vue'
import axios, { AxiosError } from 'axios'
import ActionButton from '@/components/ui/ActionButton.vue'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import ProfessorModalForm from '@/components/admin/users/ProfessorModalForm.vue'
import type ProfessorInterface from '@/interfaces/professor.interface'
import SuccessToast from '@/components/toast/successToast.vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute();
const toast = ref<{ show: boolean, type: 'success' | 'error', message: string, title: string }>({ show: false, type: 'success', message: '', title: '' })
const loading = ref(false)
const error = ref<string>('')
const professors = ref<ProfessorInterface[]>([])
const searchQuery = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedProfessor = ref<ProfessorInterface | null>(null)
const router = useRouter()
// Fetch professors data
const fetchProfessors = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get('/api/v1/professor/all')
    professors.value = Array.isArray(response.data) ? response.data : (response.data?.data || [])
  } catch (e: unknown) {
    const err = e as AxiosError
    error.value = (err.response?.data as string) || err.message || 'Erreur lors du chargement des professeurs'
  } finally {
    loading.value = false
  }
}

// Computed properties for statistics
const totalProfessors = computed(() => professors.value.length)

const permanentCount = computed(() =>
  professors.value.filter(p => p.isPermanent).length
)

const temporaryCount = computed(() =>
  professors.value.filter(p => !p.isPermanent).length
)

const departmentCount = computed(() => {
  const departments = new Set()
  professors.value.forEach(professor => {
    if (professor.department && Array.isArray(professor.department)) {
      professor.department.forEach(dept => departments.add(dept))
    }
  })
  return departments.size
})

// Filtered professors
const filteredProfessors = computed(() => {
  let filtered = professors.value

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    filtered = filtered.filter(professor => {
      const fullName = professorFullName(professor).toLowerCase()
      const matricule = professor.matricule.toLowerCase()
      const email = professor.email.toLowerCase()
      return fullName.includes(query) || matricule.includes(query) || email.includes(query)
    })
  }

  // Department filter
  if (departmentFilter.value) {
    filtered = filtered.filter(professor =>
      professor.department && professor.department.includes(departmentFilter.value as 'informatique' | 'btp' | 'gestion')
    )
  }

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(professor => {
      if (statusFilter.value === 'permanent') return professor.isPermanent
      if (statusFilter.value === 'temporary') return !professor.isPermanent
      return true
    })
  }

  return filtered
})

// Helper functions
function professorFullName(professor: ProfessorInterface): string {
  return `${professor.name} ${professor.firstName}`.trim()
}

function initials(name: string): string {
  return name.split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function avatarStyle(seed: string) {
  const colors = [
    '#5086c1', '#2c5fa3', '#6fa8dc', '#80c6a3', '#b39ddb',
    '#f48fb1', '#ffab91', '#81c784', '#64b5f6', '#ba68c8'
  ]
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return {
    background: colors[index],
    color: 'white'
  }
}

function formatGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'Homme' : 'Femme'
}

function formatDepartment(departments: string[]): string {
  const departmentNames = {
    informatique: 'Informatique',
    btp: 'BTP',
    gestion: 'Gestion'
  }
  return departments.map(dept => departmentNames[dept as keyof typeof departmentNames] || dept).join(', ')
}

function departmentClass(departments: string[]): string {
  // Return class based on first department or multiple if more than one
  if (departments.length === 0) return 'dept-default'
  if (departments.length === 1) {
    const classes = {
      informatique: 'dept-informatique',
      btp: 'dept-btp',
      gestion: 'dept-gestion'
    }
    return classes[departments[0] as keyof typeof classes] || 'dept-default'
  }
  return 'dept-multiple'
}

function departmentIcon(departments: string[]): string {
  if (departments.length === 0) return 'mdi:school'
  if (departments.length === 1) {
    const icons = {
      informatique: 'mdi:monitor',
      btp: 'mdi:hammer-wrench',
      gestion: 'mdi:briefcase'
    }
    return icons[departments[0] as keyof typeof icons] || 'mdi:school'
  }
  return 'mdi:view-grid' // Icon for multiple departments
}

function formatDate(date: Date | string): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Actions
function viewProfessor(professor: ProfessorInterface) {
  router.push(`/admin/users/teachers/${professor._id}`)
}

function editProfessor(professor: ProfessorInterface) {
  selectedProfessor.value = professor
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  selectedProfessor.value = null
}

// Modal handlers
async function handleCreateProfessor(professorData: Partial<ProfessorInterface>) {
  try {
    loading.value = true
    const response = await axios.post('/api/v1/professor', professorData)
    professors.value.push(response.data)
    showCreateModal.value = false
    toast.value = { show: true, type: 'success', message: 'Professeur créé avec succès.', title: 'Succès' }
  } catch (e: unknown) {
    const err = e as AxiosError
    toast.value = { show: true, type: 'error', message: (err.response?.data as string) || err.message || 'Erreur lors de la création du professeur', title: 'Erreur' }
  } finally {
    loading.value = false
  }
}

async function handleEditProfessor(professorData: Partial<ProfessorInterface>) {
  try {
    loading.value = true
    const response = await axios.patch(`/api/v1/professor/${selectedProfessor.value?._id}`, professorData)
    const index = professors.value.findIndex(p => p._id === selectedProfessor.value?._id)
    if (index !== -1) {
      professors.value[index] = response.data
    }
    closeEditModal()
    toast.value = { show: true, type: 'success', message: 'Professeur modifié avec succès.', title: 'Succès' }
  } catch (e: unknown) {
    const err = e as AxiosError
    toast.value = { show: true, type: 'error', message: (err.response?.data as string) || err.message || 'Erreur lors de la modification du professeur', title: 'Erreur' }
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  if (!route.params.id) {
    fetchProfessors()
  }
})


</script>

<style scoped>
.professors-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary, linear-gradient(90deg, #4299e1, #667eea));
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.stat-icon.permanent {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.stat-icon.temporary {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.stat-icon.departments {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

/* Table Card */
.table-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #f1f3f7;
  background: linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%);
  position: relative;
}

.table-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 2rem;
  right: 2rem;
  height: 3px;
  background: linear-gradient(90deg, #4299e1, #667eea);
  border-radius: 2px;
}

.header-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, #2d3748, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: #718096;
  font-weight: 500;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.create-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(66, 153, 225, 0.6);
}

.premium-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  color: #4a5568;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.premium-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.premium-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  display: inline-block;
}

.search-group,
.filter-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #a0aec0;
  z-index: 1;
  font-size: 1.125rem;
}

.premium-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  height: 2.75rem;
  padding: 0 1rem;
  outline: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input {
  padding-left: 2.75rem;
  width: 220px;
}

.filter-select {
  width: 180px;
  cursor: pointer;
}

.premium-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.count {
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: rgba(66, 153, 225, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(66, 153, 225, 0.2);
}

.refresh-btn {
  padding: 0.75rem;
  min-width: 2.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Table */
.table-scroll {
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1200px;
}

.premium-table thead th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #718096;
  text-transform: uppercase;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.premium-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f3f7;
  vertical-align: middle;
  font-size: 0.875rem;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

/* Professor Cell */
.professor-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.premium-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.professor-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
}

.matricule {
  font-size: 0.75rem;
  color: #718096;
  font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace;
}

.gender {
  font-size: 0.6875rem;
  color: #a0aec0;
}

/* Contact Cell */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.email,
.email-pro,
.phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.contact-icon {
  font-size: 0.875rem;
  color: #a0aec0;
  flex-shrink: 0;
}

.email-pro {
  color: #667eea;
}

/* Department Badge */
.department-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.department-icon {
  font-size: 1rem;
}

.dept-informatique {
  background: rgba(66, 153, 225, 0.1);
  color: #3182ce;
  border-color: rgba(66, 153, 225, 0.2);
}

.dept-btp {
  background: rgba(237, 137, 54, 0.1);
  color: #dd6b20;
  border-color: rgba(237, 137, 54, 0.2);
}

.dept-gestion {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
  border-color: rgba(102, 126, 234, 0.2);
}

.dept-default {
  background: rgba(160, 174, 192, 0.1);
  color: #718096;
  border-color: rgba(160, 174, 192, 0.2);
}

.dept-multiple {
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(102, 126, 234, 0.1));
  color: #4a5568;
  border-color: rgba(66, 153, 225, 0.2);
}

/* Departments Container */
.departments-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
  position: relative;
}

.departments-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  background: #2d3748;
  color: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  margin-top: 0.25rem;
}

.departments-container:hover .departments-tooltip {
  opacity: 1;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-icon {
  font-size: 1rem;
}

.status-badge.permanent {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
  border-color: rgba(72, 187, 120, 0.2);
}

.status-badge.temporary {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border-color: rgba(237, 137, 54, 0.2);
}

/* Date Cell */
.date-cell {
  font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace;
  font-size: 0.8125rem;
  color: #4a5568;
}

/* Actions */
.actions {
  display: flex;
  gap: 0.5rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: #718096;
}

/* Error State */
.error-state {
  padding: 2rem;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #f56565;
}

.error-text h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-weight: 600;
}

.error-text p {
  margin: 0;
  color: #718096;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #718096;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e2e8f0;
  border-left-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Column widths */
.column-professor {
  width: 250px;
}

.column-contact {
  width: 280px;
}

.column-department {
  width: 150px;
}

.column-status {
  width: 120px;
}

.column-hire-date {
  width: 120px;
}

.column-actions {
  width: 200px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .professors-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .table-header {
    padding: 1.5rem;
  }

  .search-input {
    width: 180px;
  }

  .filter-select {
    width: 150px;
  }
}

@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-right {
    align-items: stretch;
  }

  .toolbar {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .meta {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .premium-table {
    min-width: 900px;
  }
}

@media (max-width: 768px) {
  .professors-container {
    padding: 0.75rem;
    background: #f8fafc;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .table-card {
    border-radius: 12px;
    margin: 0;
  }

  .table-header {
    padding: 1rem;
    gap: 1rem;
  }

  .header-section h2 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-group,
  .filter-group {
    width: 100%;
  }

  .premium-input {
    width: 100%;
  }

  .meta {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .count {
    text-align: center;
  }

  .premium-table {
    min-width: 700px;
  }

  .premium-table th,
  .premium-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
  }

  .professor-info {
    gap: 0.5rem;
  }

  .premium-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .name {
    font-size: 0.875rem;
  }

  .matricule {
    font-size: 0.6875rem;
  }

  .btn-text {
    display: none;
  }

  .premium-btn {
    padding: 0.75rem;
    min-width: 2.75rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.375rem;
  }
}

@media (max-width: 480px) {
  .professors-container {
    padding: 0.5rem;
  }

  .stats-grid {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    padding: 0.75rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8125rem;
  }

  .table-header {
    padding: 0.75rem;
  }

  .header-section h2 {
    font-size: 1.25rem;
  }

  .table-scroll {
    border-radius: 0;
    margin: 0 -0.5rem;
    padding: 0 0.5rem;
  }

  .premium-table {
    min-width: 600px;
  }

  .premium-table th,
  .premium-table td {
    padding: 0.5rem 0.375rem;
    font-size: 0.75rem;
  }

  .premium-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.6875rem;
    border-radius: 6px;
  }

  .name {
    font-size: 0.8125rem;
  }

  .matricule {
    font-size: 0.625rem;
  }

  .department-badge,
  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }

  /* Mobile table optimizations */
  .column-professor {
    width: 150px;
  }

  .column-contact {
    width: 180px;
  }

  .column-department {
    width: 100px;
  }

  .column-status {
    width: 80px;
  }

  .column-hire-date {
    width: 80px;
  }

  .column-actions {
    width: 120px;
  }
}
</style>
