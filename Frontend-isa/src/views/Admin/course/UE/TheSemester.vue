<template>
  <div class="ue-management-container" v-if="!route.params.UE">
    <div class="breadcrumb-nav">
      <span class="back-link" @click="router.back()">
        <Icon icon="mdi:arrow-left" width="20" />
        Retour aux choix de Semestre
      </span>
    </div>
    <div class="header-section">
      <h1 class="page-title">Unités d'Enseignement - {{ route.params.filiere }} -Semestre {{ route.params.semester }}
      </h1>
      <ActionButton icon="mdi:plus" @click="openModal = true" v-if="ueList.length !== 0">
        Créer une nouvelle UE
      </ActionButton>
    </div>

    <!-- State: Loading -->
    <!-- Loading State -->
    <div v-if="loading && !errorServer" class="loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <p>Chargement des unités d’enseignement...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorServer" class="error-state">
      <ErrorComponent :message="errorServer"
        @retry="getUEByFieldAndSemester(route.params.filiere as string, route.params.semester as string)" />
    </div>

    <!-- Empty State -->
    <div v-else-if="ueList.length === 0" class="empty-state">
      <div class="empty-illustration">
        <Icon icon="mdi:book-open-blank-variant" />
      </div>
      <h3>Pas encore d’unités d’enseignement</h3>
      <p>Il n’y a pas encore d’unité d’enseignement disponible pour ce semestre</p>
      <ActionButton variant="outline" icon="mdi:plus" @click="openModal = true">
        Créer la première unité
      </ActionButton>
    </div>

    <!-- Data State -->
    <div v-else class="ue-grid">
      <UECard v-for="ue in ueList" :key="ue.code" :ue="ue" @edit="openModal = true, UEinModal = ue"
        @delete="deleteModal = true, UEinModal = ue" />
    </div>


    <div>
      <UEModalForm v-if="openModal" @close="openModal = false" @submit="handleSubmit" :ue="UEinModal" />
      <SuccessToast v-if="toast" @dismissed="toast = false" :message="toastMessage" :type="toastType"
        :title="toastTitle" />
      <ConfirmModal :show="deleteModal && !!UEinModal"
        :message="`Cette action va definitivement supprimer l'unite d'enseigmenement ${UEinModal?.code} , modules , chapitre et lecons`"
        icon="mdi:alert-circle-outline" cancel-text="Annuler" confirm-text="Confirmer la suppression"
        @confirm="handleConfirm" @cancel="deleteModal = false, UEinModal = null" />
    </div>

  </div>
  <RouterView />
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import UECard from '@/components/admin/course/UECard.vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import UEModalForm from '@/components/admin/course/UEModalForm.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import axios from 'axios'
import type TeachingUnitInterface from '@/interfaces/teachingUnit.interface'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue'

const route = useRoute()
const router = useRouter()
const UEinModal = ref<TeachingUnitInterface | null>(null)

const openModal = ref<boolean>(false)
const deleteModal = ref<boolean>(false);
const loading = ref(true)
const ueList = ref<TeachingUnitInterface[]>([])

const toastMessage = ref<string>('')
const toastTitle = ref<string>('')
const toastType = ref<'error' | 'success'>('success');
const toast = ref<boolean>(false)

const errorServer = ref<string>('')

const getUEByFieldAndSemester = async (field: string, semester: string) => {
  loading.value = true
  errorServer.value = ''
  try {
    const response = await (await axios.get(`/api/v1/teachingUnits/semesterAndField/${semester}/${field}`)).data
    ueList.value = response
  } catch (error) {
    errorServer.value = axios.isAxiosError(error) && error.response ? error.response.data : 'Erreur serveur lors de la récupération des unités d’enseignement.'
    loading.value = false
  } finally {

    loading.value = false
  }
}


watchEffect(async () => {
  if (route.params.filiere && route.params.semester && !route.params.UE) {
    await getUEByFieldAndSemester(route.params.filiere as string, route.params.semester as string)
  }
})



const handleSubmit = async (values : any) => {
  try {
    if (UEinModal.value) {
      const updatedUE = await (await axios.patch(`/api/v1/teachingUnits/${UEinModal.value._id}`, values)).data;
      UEinModal.value = null
      const index = ueList.value.findIndex((ue) => ue.code === updatedUE.code);
      if (index !== -1) {
        ueList.value[index] = updatedUE;

      }

      openModal.value = false
      toast.value = true
      toastTitle.value = 'Succès'
      toastMessage.value = 'Unité d’enseignement modifiée avec succès.'
      toastType.value = 'success'


    } else {
      const newUE = await (await axios.post('/api/v1/teachingUnits', values)).data;
      ueList.value.push(newUE);
      openModal.value = false
      toast.value = true
      toastTitle.value = 'Succès'
      toastMessage.value = 'Unité d’enseignement créée avec succès.'
      toastType.value = 'success'
    }



  } catch (error) {
    toast.value = true
    toastTitle.value = 'Erreur'
    toastMessage.value = axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue.'
    toastType.value = 'error'
  }
}

const handleConfirm = async () => {
  try {
    await axios.delete(`/api/v1/teachingUnits/${UEinModal.value?._id}`)
    ueList.value = ueList.value.filter((u) => u._id !== UEinModal.value?._id);
    deleteModal.value = false
    UEinModal.value = null
    toast.value = true
    toastTitle.value = 'Succès'
    toastMessage.value = 'Unité d’enseignement créée avec succès.'
    toastType.value = 'success'
  } catch (error) {
    toast.value = true
    toastTitle.value = 'Erreur'
    toastMessage.value = axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue.'
    toastType.value = 'error'
  }
}
</script>

<style scoped>
.ue-management-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--primary-darker);
  margin: 0;
  line-height: 1.3;
}

.create-button {
  background: var(--primary-color);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.2);
}

.create-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1.5rem;
}

.spinner-container {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--primary-extra-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--tertiary-dark);
  font-size: 1.1rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;
  padding: 2rem;
  background: var(--tertiary-extra-light);
  border-radius: 12px;
  gap: 1.5rem;
}

.empty-illustration {
  color: var(--primary-color);
  opacity: 0.7;
}

.empty-illustration svg {
  width: 80px;
  height: 80px;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--primary-dark);
  margin: 0;
}

.empty-state p {
  color: var(--tertiary-dark);
  max-width: 500px;
  line-height: 1.6;
}

/* Grid Layout */
.ue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--primary-dark);
}

.back-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .ue-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .ue-management-container {
    padding: 1.5rem 1rem;
  }
}
</style>
