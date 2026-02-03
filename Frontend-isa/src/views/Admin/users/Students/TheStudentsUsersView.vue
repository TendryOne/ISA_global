<template>
  <div class="students-view-container" v-if="!route.params.id">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:school" />
        </div>
        <div class="header-text">
          <h1>Gestion des Étudiants</h1>
          <p>Gérez et suivez tous les étudiants de l'établissement</p>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="stats-section">
      <div class="stat-card total">
        <div class="stat-icon">
          <Icon icon="material-symbols:group" />
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Étudiants</span>
          <span class="stat-value">{{ totalStudents }}</span>
        </div>
      </div>

      <div class="stat-card verified">
        <div class="stat-icon">
          <Icon icon="material-symbols:verified" />
        </div>
        <div class="stat-content">
          <span class="stat-label">Vérifiés</span>
          <span class="stat-value">{{ totalVerified }}</span>
        </div>
      </div>

      <div class="stat-card restricted">
        <div class="stat-icon">
          <Icon icon="material-symbols:lock" />
        </div>
        <div class="stat-content">
          <span class="stat-label">Restreints</span>
          <span class="stat-value">{{ totalRestricted }}</span>
        </div>
      </div>

      <div class="stat-card active">
        <div class="stat-icon">
          <Icon icon="material-symbols:check-circle" />
        </div>
        <div class="stat-content">
          <span class="stat-label">Actifs</span>
          <span class="stat-value">{{ getActiveCount() }}</span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="filters-header">
        <h2>
          <Icon icon="material-symbols:filter-list" />
          <span>Filtres</span>
        </h2>
        <button @click="resetFilters" class="btn-reset">
          <Icon icon="material-symbols:refresh" />
          <span>Réinitialiser</span>
        </button>
      </div>

      <!-- Légende des indicateurs -->
      <div class="legend-section">
        <h3>
          <Icon icon="material-symbols:info" />
          <span>Légende des indicateurs</span>
        </h3>
        <div class="legend-items">
          <div class="legend-item">
            <span class="badge verified">
              <Icon icon="material-symbols:verified" />
            </span>
            <span class="legend-text">Compte vérifié</span>
          </div>
          <div class="legend-item">
            <span class="badge not-verified">
              <Icon icon="material-symbols:error" />
            </span>
            <span class="legend-text">Compte non vérifié</span>
          </div>
          <div class="legend-item">
            <span class="badge restricted">
              <Icon icon="material-symbols:lock" />
            </span>
            <span class="legend-text">Accès restreint</span>
          </div>
          <div class="legend-item">
            <div class="restricted-indicator"></div>
            <span class="legend-text">Bordure rouge / fond rouge léger = Étudiant restreint</span>
          </div>
        </div>
      </div>

      <div class="filters-grid">
        <!-- Recherche -->
        <div class="filter-group search">
          <label>
            <Icon icon="material-symbols:search" />
            <span>Rechercher</span>
          </label>
          <input type="text" v-model="searchQuery" placeholder="Matricule" class="filter-input" />
        </div>

        <!-- Filière -->
        <div class="filter-group">
          <label>
            <Icon icon="material-symbols:school" />
            <span>Filière</span>
          </label>
          <div class="filter-chips">
            <button v-for="field in fields" :key="field" @click="changeFieldQuery(field)" class="chip"
              :class="{ active: fieldQuery === field }">
              {{ field === 'all' ? 'Toutes' : field.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Niveau -->
        <div class="filter-group">
          <label>
            <Icon icon="material-symbols:workspace-premium" />
            <span>Niveau</span>
          </label>
          <select v-model="levelQuery" class="filter-select">
            <option value="">Tous les niveaux</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
        </div>

        <!-- Statut de vérification -->
        <div class="filter-group">
          <label>
            <Icon icon="material-symbols:verified" />
            <span>Statut</span>
          </label>
          <select v-model="verifiedQuery" class="filter-select">
            <option value="">Tous</option>
            <option value="true">Vérifiés</option>
            <option value="false">Non vérifiés</option>
          </select>
        </div>

        <!-- Restriction -->
        <div class="filter-group">
          <label>
            <Icon icon="material-symbols:lock" />
            <span>Restriction</span>
          </label>
          <select v-model="restrictedQuery" class="filter-select">
            <option value="">Tous</option>
            <option value="true">Restreints</option>
            <option value="false">Actifs</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loader -->
    <SpinningLoader :loading="loading" />
    <ErrorComponent v-if="errorServer" :message="errorServer" />

    <!-- Liste des étudiants -->
    <div v-if="!loading && !errorServer" class="students-section">
      <div class="section-header">
        <h2>
          <Icon icon="material-symbols:group" />
          <span>Étudiants ({{ students.length }} sur {{ totalStudents }})</span>
        </h2>

        <div class="header-actions">
          <!-- Toggle View Mode -->
          <div class="view-toggle">
            <button @click="viewMode = 'table'" class="toggle-btn" :class="{ active: viewMode === 'table' }"
              title="Vue tableau">
              <Icon icon="material-symbols:table-rows" />
            </button>
            <button @click="viewMode = 'cards'" class="toggle-btn" :class="{ active: viewMode === 'cards' }"
              title="Vue cartes">
              <Icon icon="material-symbols:grid-view" />
            </button>
          </div>

          <!-- Pagination info -->
          <div class="pagination-info">
            <span>Page {{ pageQuery }}</span>
            <select v-model="limitQuery" class="limit-select">
              <option :value="10">10 par page</option>
              <option :value="20">20 par page</option>
              <option :value="50">50 par page</option>
              <option :value="100">100 par page</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Vue Tableau -->
      <StudentsTableView v-if="students.length > 0 && viewMode === 'table'" :students="students"
        @toggleRestriction="handleToggleRestriction" @viewDetails="handleViewDetails" @sort="handleSort" />

      <!-- Grille de cartes -->
      <div v-if="students.length > 0 && viewMode === 'cards'" class="students-grid">
        <StudentItemCard v-for="student in students" :key="student._id" :student="student"
          @toggleRestriction="handleToggleRestriction" @viewDetails="handleViewDetails" />
      </div>

      <!-- Empty state -->
      <div v-if="students.length === 0" class="empty-state">
        <Icon icon="material-symbols:person-search" />
        <h3>Aucun étudiant trouvé</h3>
        <p>Essayez de modifier vos filtres de recherche</p>
      </div>

      <!-- Pagination -->
      <div v-if="students.length > 0" class="pagination">
        <button @click="pageQuery--" :disabled="pageQuery <= 1" class="btn-page">
          <Icon icon="material-symbols:chevron-left" />
          <span>Précédent</span>
        </button>

        <div class="page-numbers">
          <span class="current-page">{{ pageQuery }}</span>
          <span class="total-pages">sur {{ Math.ceil(totalStudents / limitQuery) }}</span>
        </div>

        <button @click="pageQuery++" :disabled="pageQuery >= Math.ceil(totalStudents / limitQuery)" class="btn-page">
          <span>Suivant</span>
          <Icon icon="material-symbols:chevron-right" />
        </button>
      </div>
    </div>
  </div>
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type StudentInterface from '@/interfaces/student.intefaces';
import axios from 'axios';
import { onMounted, ref, watch, watchEffect } from 'vue';
import { debounce } from 'lodash';
import StudentItemCard from '@/components/admin/users/StudentItemCard.vue';
import StudentsTableView from '@/components/admin/users/StudentsTableView.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import { useRoute, useRouter } from 'vue-router';

const students = ref<StudentInterface[]>([])
const totalStudents = ref<number>(0)
const totalRestricted = ref<number>(0)
const totalVerified = ref<number>(0)
const loading = ref<boolean>(false)
const errorServer = ref<string>("");
const pageQuery = ref<number>(1);
const limitQuery = ref<number>(10);
const fieldQuery = ref<'btp' | 'informatique' | 'gestion' | 'all'>("all");
const searchQuery = ref<string>("");
const levelQuery = ref<string>("");
const verifiedQuery = ref<string>("");
const restrictedQuery = ref<string>("");
const viewMode = ref<'cards' | 'table'>('table');
const router = useRouter()
const route = useRoute()
const fields: Array<'all' | 'btp' | 'informatique' | 'gestion'> = ['all', 'btp', 'informatique', 'gestion'];
const isAlreadyLFetched = ref<boolean>(false);


function changeFieldQuery(newField: 'btp' | 'informatique' | 'gestion' | 'all') {
  fieldQuery.value = newField;
}

const resetFilters = () => {
  searchQuery.value = "";
  fieldQuery.value = "all";
  levelQuery.value = "";
  verifiedQuery.value = "";
  restrictedQuery.value = "";
  pageQuery.value = 1;
}

const getVerifiedCount = () => {
  return students.value.filter(s => s.verified).length;
}

const getRestrictedCount = () => {
  return students.value.filter(s => s.isRestricted).length;
}

const getActiveCount = () => {
  return students.value.filter(s => !s.isRestricted && s.verified).length;
}

const fetchStudents = async () => {
  try {
    loading.value = true;
    errorServer.value = "";
    const response = await axios.get("/api/v1/user/students", {
      params: {
        page: pageQuery.value,
        limit: limitQuery.value,
        field: fieldQuery.value !== 'all' ? fieldQuery.value : 'all',
        search: searchQuery.value || undefined,
        level: levelQuery.value || undefined,
        verified: verifiedQuery.value || undefined,
        isRestricted: restrictedQuery.value || undefined,
      }
    })

    students.value = response.data.students;
    totalStudents.value = response.data.total;
    totalRestricted.value = response.data.totalRestricted;
    totalVerified.value = response.data.totalVerified;
    isAlreadyLFetched.value = true;
  } catch (error: any) {
    errorServer.value = error.response?.data || "Une erreur est survenue";
  } finally {
    loading.value = false;
  }
}

const debouncedFetchStudents = debounce(fetchStudents, 300);



const handleToggleRestriction = async (student: StudentInterface) => {
  console.log('Toggle restriction for:', student);
  // TODO: Implémenter l'API call
}

const handleViewDetails = (student: StudentInterface) => {
  router.push("/admin/users/students/" + student._id);
}

const handleSort = (field: string) => {
  console.log('Sort by:', field);
  // TODO: Implémenter le tri
}

const shouldFetchStudents = () => {
  return !route.params.id;
}

// Watch sur les changements de route
watch(
  () => route.params.id,
  () => {
    if (!route.params.id) {
      // On revient à la liste
      fetchStudents();
    } else {
      // On va aux détails, on peut réinitialiser si besoin
      isAlreadyLFetched.value = false;
    }
  }
)

// Watch sur tous les filtres (existing)
watch(
  [pageQuery, limitQuery, fieldQuery, searchQuery, levelQuery, verifiedQuery, restrictedQuery],
  async () => {
    if (shouldFetchStudents()) {
      await debouncedFetchStudents();
    }
  }
)

// Au montage du composant
onMounted(async () => {
  if (shouldFetchStudents() && !isAlreadyLFetched.value) {
    await fetchStudents();
  }
})


</script>

<style scoped>
.students-view-container {
  min-height: 100vh;
  background: var(--background-light);
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
}

.header-text h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
}

.header-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-card.total {
  border-color: var(--primary-color);
}

.stat-card.verified {
  border-color: var(--success);
}

.stat-card.restricted {
  border-color: var(--error);
}

.stat-card.active {
  border-color: var(--success);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-card.total .stat-icon {
  background: rgba(var(--primary-rgb), 0.15);
  color: var(--primary-color);
}

.stat-card.verified .stat-icon {
  background: rgba(var(--success-rgb), 0.15);
  color: var(--success-dark);
}

.stat-card.restricted .stat-icon {
  background: rgba(var(--error-rgb), 0.15);
  color: var(--error);
}

.stat-card.active .stat-icon {
  background: rgba(var(--success-rgb), 0.15);
  color: var(--success);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
}

/* Filters Section */
.filters-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}

.filters-header h2 svg {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  color: var(--text-dark);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group.search {
  grid-column: 1 / -1;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group label svg {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.filter-input,
.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-dark);
  background: white;
  transition: all 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chip {
  padding: 0.625rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: var(--text-dark);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chip:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.chip.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

/* Legend Section */
.legend-section {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #bae6fd;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.legend-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--primary-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-section h3 svg {
  font-size: 1.25rem;
  color: var(--primary-color);
}

.legend-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-item .badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.legend-item .badge svg {
  font-size: 1.125rem;
}

.legend-item .badge.verified {
  background: rgba(var(--success-rgb), 0.15);
  color: var(--success-dark);
}

.legend-item .badge.not-verified {
  background: rgba(var(--warning-rgb), 0.15);
  color: var(--warning-dark);
}

.legend-item .badge.restricted {
  background: rgba(var(--error-rgb), 0.15);
  color: var(--error);
}

.legend-item .restricted-indicator {
  width: 32px;
  height: 32px;
  border-left: 4px solid var(--error);
  background: rgba(var(--error-rgb), 0.1);
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-text {
  font-size: 0.875rem;
  color: var(--text-dark);
  font-weight: 600;
}

/* Students Section */
.students-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
}

.section-header h2 svg {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  background: #f1f5f9;
  padding: 0.25rem;
  border-radius: 10px;
}

.toggle-btn {
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.toggle-btn svg {
  font-size: 1.25rem;
}

.toggle-btn:hover {
  color: var(--primary-color);
}

.toggle-btn.active {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.limit-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 700;
  color: var(--text-dark);
  background: white;
  cursor: pointer;
}

/* Students Grid */
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state svg {
  font-size: 5rem;
  color: #e2e8f0;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  color: var(--text-dark);
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--primary-color);
  border-radius: 10px;
  background: white;
  color: var(--primary-color);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-page:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
}

.current-page {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.total-pages {
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .students-view-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .students-grid {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
