<template>
  <div class="elite-admin-container">
    <div class="elite-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <h1>
          <span>Liste des inscrits</span>
          <span class="header-accent">{{ new Date().getFullYear() }}</span>
        </h1>
      </div>
    </div>

    <div class="control-panel">
      <div class="search-container elite-glass">
        <Icon icon="iconamoon:search-light" class="search-icon" />
        <input v-model="searchQuery" placeholder="Rechercher par matricule ou nom..." class="elite-search">
        <div class="search-border"></div>
      </div>

      <div class="filters elite-glass">
        <div class="filter-tabs">
          <button v-for="filiere in filieres" :key="filiere.value" @click="toggleFiliere(filiere.value)"
            :class="{ active: selectedFiliere === filiere.value }" class="elite-tab">
            {{ filiere.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="elite-datagrid">
      <div class="grid-header">
        <div class="results-display">
          <div class="result-count"> {{ totalStudent }} étudiants</div>
          <div class="result-divider"></div>
          <div class="sort-indicator">
            Tri: {{ sortField === 'matricule' ? 'Matricule' : 'Nom' }}
            ({{ sortDirection === 'asc' ? 'Croissant' : 'Décroissant' }})
          </div>
        </div>
        <div class="grid-actions">
          <button class="grid-action-btn refresh">
            <Icon icon="mdi:refresh" />
          </button>
        </div>
      </div>

      <div class="grid-container">
        <table class="elite-table">
          <thead>
            <tr>
              <th @click="sortBy('matricule')" class="sortable">
                <div class="th-content">
                  <span>Matricule</span>
                  <Icon :icon="sortField === 'matricule' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th @click="sortBy('nom')" class="sortable">
                <div class="th-content">
                  <span>ÉTUDIANT</span>
                  <Icon :icon="sortField === 'nom' ?
                    (sortDirection === 'asc' ? 'material-symbols:arrow-drop-up' : 'material-symbols:arrow-drop-down') :
                    'material-symbols:swap-vert'" class="sort-icon" />
                </div>
              </th>
              <th>FILIÈRE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody v-if="students.length && !isLoading && !isError">
            <tr v-for="student in students" :key="student.inscriptionId" class="elite-row">
              <td>
                <div class="matricule-display">
                  <span class="matricule-code">{{ student.matricule }}</span>
                </div>
              </td>
              <td>
                <div class="student-card">
                  <div class="elite-avatar" :style="{
                    background: `linear-gradient(135deg, ${getAvatarColor(getFullName(student.name, student.firstName))}, ${getAvatarSecondaryColor(getFullName(student.name, student.firstName))})`,
                    boxShadow: `0 4px 12px ${getAvatarColor(getFullName(student.name, student.firstName))}40`
                  }">
                    {{ getInitials(getFullName(student.name, student.firstName)) }}
                  </div>
                  <div class="student-info">
                    <div class="student-name">{{ getFullName(student.name, student.firstName) }}</div>
                    <div class="student-credentials">
                      <span class="student-email">{{ student.email }}</span>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="filiere-tag" :class="student.field">
                  <div class="tag-decoration"></div>
                  {{ formatFiliere(student.field) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="elite-action-btn view" @click="openModal(student)" title="voir details">
                    <Icon icon="mdi:eye" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="students.length === 0 && !isLoading && !isError">
            <tr class="empty-state-row">
              <td colspan="5">
                <div class="empty-state-container">
                  <Icon icon="mdi:account-school-outline" class="empty-icon" />
                  <h3 class="empty-title">Aucun étudiant trouvé</h3>
                  <p class="empty-message">Aucun résultat ne correspond à vos critères de recherche</p>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="students.length === 0 && !isLoading && isError">
            <tr class="empty-state-row">
              <td colspan="5">
                <ErrorComponent :message="isError" :show-back="false" @retry="fetchStudent" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="elite-pagination">
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

          <button @click="nextPage" :disabled="currentPage >= totalPages" class="page-nav">
            <Icon icon="material-symbols:chevron-right" />
          </button>
        </div>
        <div class="page-info" v-if="totalPages >= 1">
          Page {{ currentPage }} / {{ totalPages }}
        </div>
      </div>
    </div>
    <SubscribedUserModal v-if="studentModal" :loading-validation="loadingValidation" :student="studentModal"
      @close="studentModal = null" @valid-student="ValidTheStudent" />
    <SuccessToast v-if="isOpenToast" @dismissed="isOpenToast = false" :title="TitleToast" :type="typeToast"
      :message="MessageToast" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import debounce from 'lodash/debounce'
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import { useRouter } from 'vue-router';
import type StudentInterface from '@/interfaces/student.intefaces';
import SubscribedUserModal from '@/components/admin/Admission/SubscribedUserModal.vue';
import type TutionFeesInterface from '@/interfaces/tutionFees.interface';
import SuccessToast from '@/components/toast/successToast.vue';

interface FiliereOption {
  value: string;
  label: string;
}

const students = ref<StudentInterface[]>([]);
const studentModal = ref<StudentInterface | null>(null)
const filieres: FiliereOption[] = [
  { value: 'informatique', label: 'Informatique' },
  { value: 'btp', label: 'BTP' },
  { value: 'gestion', label: 'Gestion' },
];
const router = useRouter()
const searchQuery = ref('');
const selectedFiliere = ref('');
const sortField = ref('matricule');
const sortDirection = ref('asc');
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(20);


const totalStudent = ref<number>(0)
const isLoading = ref<boolean>(false)
const isError = ref<string>("")

const fetchStudent = async () => {
  isLoading.value = true
  isError.value = ""
  try {
    const response = await axios.get("/api/v1/students/notVerified", {
      params: {
        pageQuery: currentPage.value,
        perPageQuery: itemsPerPage.value,
        searchQuery: searchQuery.value,
        fieldsQuery: selectedFiliere.value,
      }
    })
    students.value = response.data.student
    totalStudent.value = response.data.totalStudent

  } catch (error) {
    isError.value = error.response.data
  } finally {
    isLoading.value = false
  }
}

const openModal = (student: StudentInterface) => {
  studentModal.value = student
}

onMounted(() => {
  fetchStudent()
})

watch([currentPage, itemsPerPage, selectedFiliere], () => {
  fetchStudent()
})

const debouncedFetch = debounce(fetchStudent, 300)

watch(searchQuery, () => {
  debouncedFetch()
})

const getFullName = (name: string, firstName: string) => {
  return `${name} ${firstName}`
}

const totalPages = computed(() => Math.ceil(totalStudent.value / itemsPerPage.value));

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages.value, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});



function sortBy(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  currentPage.value = 1;
}

function toggleFiliere(filiere: string) {

  selectedFiliere.value = selectedFiliere.value === filiere ? '' : filiere;
  currentPage.value = 1;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'var(--primary-color)',
    'var(--primary-light)',
    'var(--secondary-color)',
    'var(--accent-color)',
    'var(--success)'
  ];
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
}

function getAvatarSecondaryColor(name: string) {
  const colors = [
    'var(--primary-dark)',
    'var(--primary-lighter)',
    'var(--secondary-dark)',
    'var(--accent-dark)',
    'var(--success-dark)'
  ];
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 10);
  return colors[hash % colors.length];
}

function formatFiliere(filiere: string) {
  return filiere.charAt(0).toUpperCase() + filiere.slice(1);
}


const loadingValidation = ref<boolean>(false);
const MessageToast = ref<string>("")
const typeToast = ref<"error" | "success">("error")
const TitleToast = ref<string>("")
const isOpenToast = ref<boolean>(false)

const ValidTheStudent = async (fees: TutionFeesInterface) => {
  loadingValidation.value = true;

  try {
    await axios.post(`/api/v1/students/verified/${studentModal.value?._id}/${fees._id}`);

    TitleToast.value = "Vérification du paiement réussie";
    MessageToast.value = "Le paiement a été validé et le compte de l'étudiant a été activé.";
    typeToast.value = "success";
    isOpenToast.value = true;
    studentModal.value = null
    await fetchStudent()
  } catch (error) {
    TitleToast.value = "Erreur";
    MessageToast.value = error.response?.data || "Une erreur inconnue s'est produite.";
    typeToast.value = "error";
    isOpenToast.value = true;
  } finally {
    loadingValidation.value = false;
  }
};



function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function goToPage(page: number) {
  currentPage.value = page;
}
</script>

<style scoped>
.elite-admin-container {
  --header-height: 180px;
  --control-panel-height: 80px;
  --grid-header-height: 60px;
  --row-height: 70px;

  max-width: 1440px;
  margin: 0 auto;
  color: var(--black);
  font-family: 'Inter', system-ui, sans-serif;
  position: relative;
  min-height: 100vh;
}

/* Header élite */
.elite-header {
  height: var(--header-height);
  position: relative;
  overflow: hidden;
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
  align-items: flex-end;
  padding: 0 2rem 2rem;
  color: white;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  margin: 0;
}

.header-accent {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.9;
  letter-spacing: 1px;
}

.elite-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.elite-btn.export {
  text-decoration: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.elite-btn.export:hover {
  background: rgba(255, 255, 255, 0.25);
}

.elite-btn.export span {
  margin-top: 2px;
}

/* Panneau de contrôle */
.control-panel {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 1.5rem;
  padding: 0 2rem;
  margin-top: -1.5rem;
  margin-bottom: 2rem;
  height: var(--control-panel-height);
}

.elite-glass {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.search-container {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  position: relative;
}

.search-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-right: 1rem;
}

.elite-search {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--gray-darker);
  height: 100%;
  outline: none;
}

.elite-search::placeholder {
  color: var(--gray-light);
}

.search-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.elite-search:focus~.search-border {
  transform: scaleX(1);
}

.filters {
  width: 60%;
  padding: 0 1rem;
  display: flex;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.elite-tab {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: var(--gray-dark);
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.elite-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px 3px 0 0;
  transition: transform 0.3s ease;
}

.elite-tab:hover {
  color: var(--primary-color);
  background: rgba(80, 134, 193, 0.05);
}

.elite-tab.active {
  color: var(--primary-color);
  font-weight: 600;
}

.elite-tab.active::after {
  transform: translateX(-50%) scaleX(1);
}

/* Data Grid Premium */
.elite-datagrid {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin: 0 2rem 2rem;
  border: 1px solid var(--gray-lighter);
}

.grid-header {
  height: var(--grid-header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--gray-extra-light);
}

.results-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.result-count {
  font-weight: 500;
  color: var(--gray-darker);
}

.result-divider {
  width: 1px;
  height: 20px;
  background: var(--gray-lighter);
}

.sort-indicator {
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.grid-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--gray-dark);
  cursor: pointer;
  transition: all 0.3s ease;
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
  height: 60px;
  padding: 0 1.5rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-dark);
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  background: white;
  z-index: 2;
  border-bottom: 1px solid var(--gray-extra-light);
}

.th-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.sortable:hover {
  color: var(--primary-color);
}

.sort-icon {
  font-size: 1.5rem;
  color: var(--gray-light);
  transition: all 0.3s ease;
}

.sortable:hover .sort-icon {
  color: var(--primary-color);
}

.elite-row {
  height: var(--row-height);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--gray-extra-light);
}

.elite-row:last-child {
  border-bottom: none;
}

.elite-row:hover {
  background: rgba(80, 134, 193, 0.03);
}

.elite-table td {
  padding: 0 1.5rem;
  vertical-align: middle;
}

/* Cell styles */
.matricule-display {
  display: flex;
  align-items: center;
}

.matricule-code {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9rem;
  color: var(--gray-darker);
  font-weight: 500;
}

.student-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.elite-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 500;
  color: var(--black);
  margin-bottom: 0.25rem;
}

.student-credentials {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.student-email {
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.filiere-tag {
  position: relative;
  padding: 0.5rem 1rem 0.5rem 1.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.tag-decoration {
  position: absolute;
  left: 0.75rem;
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
  background: rgba(128, 128, 128, 0.1);
  color: var(--gray-dark);
}

.filiere-tag.gestion .tag-decoration {
  background: var(--gray-dark);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.elite-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.elite-action-btn.view {
  background: rgba(80, 134, 193, 0.1);
  color: var(--primary-color);
}

.elite-action-btn.view:hover {
  background: var(--primary-color);
  color: white;
}

.elite-action-btn.delete {
  background: rgba(235, 77, 75, 0.1);
  color: var(--error);
}

.elite-action-btn.delete:hover {
  background: var(--error);
  color: white;
}

/* Empty state styles */
.empty-state-row {
  height: 300px;
}

.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray-light);
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--gray-dark);
  margin-bottom: 0.5rem;
}

.empty-message {
  font-size: 1rem;
  color: var(--gray);
  max-width: 400px;
  line-height: 1.5;
}

/* Pagination élégante */
.elite-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-extra-light);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-nav {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray-lighter);
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
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
  gap: 0.25rem;
}

.page-number {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.page-number:hover {
  border-color: var(--gray-lighter);
}

.page-number.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: 500;
}

.page-info {
  font-size: 0.9rem;
  color: var(--gray-dark);
}

/* Modal élite */
.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.elite-modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s ease;
}

.elite-modal-enter-active .elite-modal-container,
.elite-modal-leave-active .elite-modal-container {
  transition: all 0.3s ease;
}

.elite-modal-enter-from .elite-modal-container,
.elite-modal-leave-to .elite-modal-container {
  transform: translateY(20px);
  opacity: 0;
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--gray-extra-light);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--black);
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  background: var(--gray-extra-light);
  color: var(--error);
}

.modal-content {
  padding: 2rem 1.5rem;
  text-align: center;
}

.modal-icon {
  font-size: 3rem;
  color: var(--error);
  margin-bottom: 1.5rem;
}

.modal-content p {
  margin: 0;
  color: var(--gray-dark);
  line-height: 1.6;
}

.modal-content p strong {
  color: var(--black);
  font-weight: 500;
}

.modal-actions {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.elite-btn.cancel {
  background: var(--gray-extra-light);
  color: var(--gray-dark);
}

.elite-btn.cancel:hover {
  background: var(--gray-lighter);
}

.elite-btn.confirm-delete {
  background: var(--error);
  color: white;
}

.elite-btn.confirm-delete:hover {
  background: var(--error-dark);
}

/* Responsive */
@media (max-width: 1200px) {
  .control-panel {
    flex-direction: column;
    height: auto;
    gap: 1rem;
  }

  .search-container,
  .filters {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .elite-admin-container {
    padding: 0;
  }

  .elite-header {
    height: auto;
    padding: 1.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 0;
  }

  .control-panel,
  .elite-datagrid {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .filter-tabs {
    flex-direction: column;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .elite-tab {
    min-width: 120px;
  }

  .grid-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    height: auto;
  }

  .results-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .result-divider {
    display: none;
  }

  .elite-pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .elite-btn {
    width: 100%;
    justify-content: center;
  }

  .header-actions {
    margin-bottom: 20px;
  }

  /* Empty state responsive */
  .empty-state-container {
    padding: 1rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .empty-message {
    font-size: 0.9rem;
  }
}
</style>
