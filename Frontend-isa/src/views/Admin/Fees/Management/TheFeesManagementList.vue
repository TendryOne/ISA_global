<template>
  <div class="promotions-container">
    <!-- Header avec bouton de création -->
    <div class="promotions-header">
      <h1>Gestion des frais de scolarité</h1>
      <BaseButton icon="mdi:plus-circle" size="medium" type="button" variant="primary" @click="goToCreation">
        Créer un frais de scolarité
      </BaseButton>
    </div>

    <div class="filters-section premium">
      <div class="filter-header">
        <Icon icon="mdi:filter-variant" width="24" class="filter-icon" />
        <h3>Filtres avancés</h3>
        <BaseButton icon="mdi:autorenew" size="small" type="button" variant="text" @click="resetFilters"
          class="reset-btn">
          Réinitialiser
        </BaseButton>
      </div>

      <div class="filter-grid">
        <!-- Filtre par niveau avec chips -->
        <div class="filter-group">
          <label for="level-filter">
            <Icon icon="mdi:school" width="18" class="input-icon" />
            Niveau académique
          </label>
          <div class="select-wrapper">
            <select id="level-filter" v-model="selectedLevel" class="filter-select premium">
              <option value="">Tous les niveaux</option>
              <option v-for="level in availableLevels" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
            <Icon icon="mdi:chevron-down" width="20" class="select-arrow" />
          </div>
        </div>

        <!-- Filtre par filière avec chips -->
        <div class="filter-group">
          <label for="field-filter">
            <Icon icon="mdi:book-education" width="18" class="input-icon" />
            Filière
          </label>
          <div class="select-wrapper">
            <select id="field-filter" v-model="selectedField" class="filter-select premium">
              <option value="">Toutes les filières</option>
              <option v-for="field in availableFields" :key="field" :value="field">
                {{ field }}
              </option>
            </select>
            <Icon icon="mdi:chevron-down" width="20" class="select-arrow" />
          </div>
        </div>
      </div>

      <!-- Affichage du nombre de résultats -->
      <div class="results-count" v-if="isLoading">
        {{ filteredPromotions.length }} résultat(s) trouvé(s)
      </div>
    </div>


    <div v-if="!isLoading"
      style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
      <SpinningLoader />
    </div>

    <div v-else-if="isLoading && filteredPromotions.length > 0" class="promotions-grid">
      <PromotionItem v-for="promotion in filteredPromotions" :key="promotion._id" :promotion="promotion"
        @delete="confirmDelete(promotion)" @edit="handleEdit(promotion._id)" />
    </div>

    <div v-else-if="isLoading && promotions.length === 0" class="empty-state">
      <div class="empty-content">
        <Icon icon="mdi:school-outline" width="60" class="empty-icon" />
        <h3>Aucun frais de scolarité trouvé</h3>
        <p>Vous n'avez aucun frais de scolarité pour le moment.</p>
        <BaseButton icon="mdi:plus-circle" size="medium" type="button" variant="primary" @click="goToCreation">
          Créer un frais de scolarité
        </BaseButton>
      </div>
    </div>

    <SuccessToast v-if="isErrorToast" :message="MessageToast" :title="TitleToast" @dismissed="isErrorToast = false"
      :type="toastType" />

    <ConfirmModal :show="!!feesToDelete" :type="modalType" :message="modalMessage" :confirm-text="modalConfirmText"
      @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import PromotionItem from '@/components/admin/Fees/manage/promotionItem.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface'
import axios from 'axios'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'

const router = useRouter()
const isLoading = ref<boolean>(false)

// Filtres
const selectedLevel = ref<string>('')
const selectedField = ref<string>('')


const MessageToast = ref<string>("")
const TitleToast = ref<string>("")
const isErrorToast = ref<boolean>(false)
const toastType = ref<'success' | 'error' | 'warning' | 'info'>('success')


const feesToDelete = ref<FeesManagementInterface | null>(null)
const modalType = ref('delete')
const modalMessage = ref('Voulez-vous vraiment supprimer cet élément ?')
const modalConfirmText = ref('Supprimer')


const promotions = ref<FeesManagementInterface[]>([])

const availableLevels = computed<string[]>(() => {
  const levels = new Set<string>()
  promotions.value.forEach(promo => levels.add(promo.level))
  return Array.from(levels).sort()
})


const availableFields = computed<string[]>(() => {
  const fields = new Set<string>()
  promotions.value.forEach(promo => {
    if (promo.field) {
      fields.add(promo.field)
    }
  })
  return Array.from(fields).sort()
})


const filteredPromotions = computed<FeesManagementInterface[]>(() => {
  return promotions.value.filter(promo => {
    const levelMatch = !selectedLevel.value || promo.level === selectedLevel.value
    const fieldMatch = !selectedField.value || (promo.field && promo.field === selectedField.value)
    return levelMatch && fieldMatch
  })
})


const resetFilters = () => {
  selectedLevel.value = ''
  selectedField.value = ''
}


const goToCreation = () => {
  router.push("/admin/fees/manage/new")
}


const confirmDelete = (fees: FeesManagementInterface) => {
  feesToDelete.value = fees
  modalMessage.value = `Voulez-vous supprimer ce frais de scolarité de la filiere ${fees.field} du niveau académique ${fees.level}`
}

const handleConfirm = async () => {
  try {
    if (!feesToDelete.value?._id) return

    await axios.delete(`/api/v1/feesManagement/${feesToDelete.value._id}`)

    MessageToast.value = `Les frais de scolarité du niveau académique ${feesToDelete.value.level} pour l'année  ont été supprimés avec succès.`
    isErrorToast.value = true
    toastType.value = "success"
    TitleToast.value = "Succès"

    promotions.value = promotions.value.filter((u) => u._id !== feesToDelete.value?._id)
    feesToDelete.value = null
  } catch (error) {
    MessageToast.value = axios.isAxiosError(error) && error.response ? error.response.data : "Une erreur est survenue"
    isErrorToast.value = true
    toastType.value = "error"
    TitleToast.value = "Erreur lors de la suppression"
  }
}

// Annulation de la suppression
const handleCancel = () => {
  feesToDelete.value = null
}

// Récupération des données
const fetchPromotions = async () => {
  try {
    isLoading.value = false
    const response = await axios.get('/api/v1/feesManagement')
    promotions.value = response.data
  } catch (error) {
    MessageToast.value = "Échec du chargement des frais de scolarité"
    TitleToast.value = "Erreur"
    isErrorToast.value = true
    toastType.value = "error"
    console.error(error)
  } finally {
    isLoading.value = true
  }
}

const handleEdit = (id: string) => {
  router.push(`/admin/fees/manage/modify/${id}`)
}

// Initialisation
onMounted(() => {
  fetchPromotions()
})
</script>

<style scoped>
.promotions-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.promotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.promotions-header h1 {
  color: var(--primary-dark);
  font-size: 1.8rem;
  margin: 0;
}

.filters-section {
  background-color: var(--white);
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  margin-bottom: 2rem;
  box-shadow: var(--shadow-light);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--primary-dark);
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: var(--white);
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-light);
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-icon {
  color: var(--primary-light);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-content h3 {
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.empty-content p {
  color: var(--tertiary-dark);
  margin-bottom: 1.5rem;
}


.filters-section.premium {
  background-color: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--gray-lighter);
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-lightest);
}

.filter-header h3 {
  color: var(--primary-dark);
  font-size: 1.1rem;
  margin: 0;
  flex-grow: 1;
}

.filter-icon {
  color: var(--primary-color);
}

.reset-btn {
  color: var(--primary-color);
  font-weight: 500;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-dark);
  font-weight: 500;
  font-size: 0.9rem;
}

.input-icon {
  color: var(--primary-light);
}

.select-wrapper {
  position: relative;
}

.filter-select.premium {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid var(--gray-lighter);
  border-radius: 8px;
  font-size: 0.95rem;
  background-color: var(--white);
  appearance: none;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-select.premium:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.select-arrow {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--tertiary-dark);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.chip-close {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  background: none;
  border: none;
  color: var(--primary-dark);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.chip-close:hover {
  opacity: 1;
}

.results-count {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--tertiary-dark);
  text-align: right;
  font-style: italic;
}


@media (max-width: 768px) {
  .promotions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .promotions-grid {
    grid-template-columns: 1fr;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .filter-select.premium {
    padding-left: 2.5rem;
  }
}
</style>
