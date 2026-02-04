<template>
  <div class="promotions-container" ref="promotionsContainer">
    <BreadCrumbsBack title="Retour au choix de niveau" />
    <!-- En-tête -->
    <div class="promotions-header">
      <h1> {{ route.params.level }} - {{ route.params.filiere && (route.params.filiere as string).toUpperCase() }}</h1>
      <ActionButton icon="mdi:plus" @click="createPromotion">
        Créer une promotion
      </ActionButton>
    </div>
    <div class="info" role="note" aria-live="polite">
      <Icon icon="mdi:information-outline" class="info-icon" width="20" height="20" />
      <div class="info-content">
        <strong>Information</strong> — Les statuts des promotions seront mis à jour automatiquement après la fin de
        l'année académique présumée.
        Vérification quotidienne à 00h00.
      </div>
    </div>
    <!-- Filtres -->
    <div class="filters-bar">
      <div class="filters-left">
        <span class="filters-label">Filtrer:</span>
        <div class="filter-group" role="tablist" aria-label="Filtre activité">
          <button class="filter-btn" :class="{ active: isActiveFilter === 'all' }" @click="isActiveFilter = 'all'"
            role="tab" :aria-selected="isActiveFilter === 'all'">
            Toutes
          </button>
          <button class="filter-btn" :class="{ active: isActiveFilter === 'active' }" @click="isActiveFilter = 'active'"
            role="tab" :aria-selected="isActiveFilter === 'active'">
            Actives
          </button>
          <button class="filter-btn" :class="{ active: isActiveFilter === 'inactive' }"
            @click="isActiveFilter = 'inactive'" role="tab" :aria-selected="isActiveFilter === 'inactive'">
            Inactives
          </button>
        </div>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading" class="loading-state">
      <spinning-loader text="Chargement de la promotion..." />
    </div>

    <!-- État vide -->
    <div v-else-if="!promotions || promotions.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24">
          <path
            d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
        </svg>
      </div>
      <h2>Aucune promotion créée</h2>
      <p>Commencez par créer votre première promotion pour organiser votre établissement.</p>
      <action-button icon="mdi:plus" @click="createPromotion" class="btn-create">
        Créer la première promotion
      </action-button>
    </div>

    <!-- Affichage des promotions -->
    <div v-else>
      <div v-if="displayedPromotions.length === 0" class="filtered-empty">
        <div class="filtered-empty-icon">
          <Icon icon="mdi:magnify-close" width="48" />
        </div>
        <h3>{{ filterEmptyMessage }}</h3>
        <p>Modifiez le filtre d'activité pour voir d'autres promotions.</p>
      </div>
      <div v-else class="promotions-grid">
        <PromotionCardItem v-for="promotion in displayedPromotions" :key="promotion._id" :promotion="promotion"
          @toggleStatus="handleToggleStatus" @edit="handleEdit" @delete="handleOpenConfirmDelete" />
      </div>
    </div>


  </div>

  <PromotionFormModal v-if="openModal || modalInPromotion" @close="openModal = false, modalInPromotion = null"
    @submit="handleSubmit" :promotion="modalInPromotion" />

  <SuccessToast v-if="toast.show" :message="toast.message" :type="toast.type" :title="toast.title"
    @dismissed="toast.show = false" />

  <ConfirmModal :show="!!DeleteInModal" title="Confirmer la suppression" @cancel="DeleteInModal = null"
    @confirm="handleDelete(DeleteInModal?._id)"
    :message="`Cette action va definitivement supprimer la promotion ${DeleteInModal?.name} et toutes ses données associées.`" />

</template>

<script setup lang="ts">
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import PromotionCardItem from '@/components/admin/promotion/PromotionCardItem.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import type PromotionInterface from '@/interfaces/promotion.interface';
import { ref, onMounted, nextTick, computed } from 'vue';
import { useRoute } from 'vue-router';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import SuccessToast from '@/components/toast/successToast.vue';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import PromotionFormModal from '@/components/admin/users/PromotionFormModal.vue';
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue';


const modalInPromotion = ref<PromotionInterface | null>(null);

const toast = ref<{ show: boolean; message: string, type: 'success' | 'error', title: string }>({ show: false, message: '', type: 'success', title: '' });
const openModal = ref<boolean>(false);


const route = useRoute()

const isLoading = ref(true);
const promotions = ref<PromotionInterface[]>([]);
const isActiveFilter = ref<'all' | 'active' | 'inactive'>('all')

const displayedPromotions = computed(() => {
  if (!promotions.value) return []
  switch (isActiveFilter.value) {
    case 'active':
      return promotions.value.filter(p => p.isActive)
    case 'inactive':
      return promotions.value.filter(p => !p.isActive)
    default:
      return promotions.value
  }
})

const filterEmptyMessage = computed(() => {
  return isActiveFilter.value === 'active'
    ? 'Pas de promotions actives'
    : 'Pas de promotions inactives'
})



const handleSubmit = async (data: unknown) => {
  try {

    let response
    if (modalInPromotion.value) {
      // Edition
      response = await axios.patch(`/api/v1/promotions/${modalInPromotion.value._id}`, data as Record<string, unknown>);
      const index = promotions.value.findIndex(p => p._id === modalInPromotion.value?._id);
      if (index !== -1) {
        promotions.value[index] = response.data;
      }
      toast.value = { show: true, message: 'Promotion mise à jour avec succès.', type: 'success', title: 'Succès' };
      modalInPromotion.value = null;
    } else {
      // Création
      response = await axios.post('/api/v1/promotions', data as Record<string, unknown>);
      toast.value = { show: true, message: 'Promotion créée avec succès.', type: 'success', title: 'Succès' };
      openModal.value = false
      promotions.value.push(response.data);
    }

  } catch (err) {
    const message = axios.isAxiosError(err) ? (err.response?.data as string) || err.message : (err as Error).message
    toast.value = { show: true, message, type: 'error', title: 'Erreur' }
  }
}


const promotionsContainer = ref<HTMLElement | null>(null);

async function scrollToContainer() {
  await nextTick()
  promotionsContainer.value!.scrollIntoView({ behavior: 'smooth' });
}

const fetchPromotions = async () => {
  isLoading.value = true;
  try {




    const response = await axios.get('/api/v1/promotions', {
      params: {
        field: route.params.filiere,
        level: route.params.level
      }
    });
    promotions.value = response.data;
  } catch (err) {
    const message = axios.isAxiosError(err) ? (err.response?.data as string) || err.message : 'Erreur lors du chargement des promotions.'
    toast.value = { show: true, message, type: 'error', title: 'Erreur' };
  } finally {
    isLoading.value = false;
  }
};


// Simulation du chargement des données
onMounted(async () => {
  await fetchPromotions();
  scrollToContainer();
});

// Gestion des actions
const handleToggleStatus = async (id: string | undefined) => {
  try {

    const promotion = promotions.value.find(p => p._id === id);

    await axios.patch(`/api/v1/promotions/${id}`, {
      isActive: promotion?.isActive ? false : true,
      level: promotion?.level,
      field: promotion?.field
    });




    if (promotion) {
      promotion.isActive = !promotion.isActive;
      promotion.updatedAt = new Date();
    }
    toast.value = { show: true, message: 'Statut de la promotion mis à jour.', type: 'success', title: 'Succès' };
  } catch (error) {
    toast.value = { show: true, message: axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue lors du changement de statut', type: 'error', title: 'Erreur' };
  }
  if (!id) return;


};

const handleEdit = (promotion: PromotionInterface) => {
  modalInPromotion.value = promotion
};

const DeleteInModal = ref<PromotionInterface | null>(null);

const handleOpenConfirmDelete = (promotion: PromotionInterface) => {
  DeleteInModal.value = promotion
};

const handleDelete = async (id: string | undefined) => {
  try {
    await axios.delete(`/api/v1/promotions/${id}`);
    promotions.value = promotions.value.filter(p => p._id !== id);
    toast.value = { show: true, message: 'Promotion supprimée avec succès.', type: 'success', title: '' };
    DeleteInModal.value = null;
  } catch (err) {
    const message = axios.isAxiosError(err) ? (err.response?.data as string) || err.message : (err as Error).message
    toast.value = { show: true, message, type: 'error', title: 'Erreur' };

  }
};

const createPromotion = () => {
  openModal.value = true
};


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
  padding-bottom: 1rem;
  border-bottom: 1px solid #eaeaea;
}

.promotions-header h1 {
  font-size: 1.8rem;
  color: var(--primary-darker, #2c5fa3);
  margin: 0;
}

/* Info banner */
.info {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  margin: 0.25rem 0 1rem 0;
  background: var(--primary-extra-light, #eef4fb);
  border: 1px solid var(--gray-extra-light, #eaeaea);
  border-left: 4px solid var(--primary-color, #5086c1);
  border-radius: 8px;
  color: var(--gray-dark, #555);
  font-size: 0.95rem;
}

.info-icon {
  color: var(--primary-color, #5086c1);
  margin-top: 2px;
  flex-shrink: 0;
}

.info-content strong {
  color: var(--primary-darker, #2c5fa3);
}

/* Filters */
.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.filters-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filters-label {
  font-size: 0.9rem;
  color: var(--gray-dark, #555);
}

.filter-group {
  display: inline-flex;
  background: #fff;
  border: 1px solid var(--gray-extra-light, #eaeaea);
  border-radius: 6px;
  overflow: hidden;
}

.filter-btn {
  appearance: none;
  background: transparent;
  border: none;
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  color: var(--gray-dark, #555);
  cursor: pointer;
  transition: background-color .2s ease, color .2s ease;
}

.filter-btn:hover {
  background: #f7f7f7;
}

.filter-btn.active {
  background: var(--primary-extra-light, #eef4fb);
  color: var(--primary-darker, #2c5fa3);
  font-weight: 600;
}

/* Empty state for filtered results */
.filtered-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  text-align: center;
  background-color: rgba(250, 250, 250, 0.8);
  border-radius: 12px;
  border: 1px dashed var(--gray-extra-light, #e0e0e0);
  color: var(--tertiary-dark, #7b7b7b);
}

.filtered-empty-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 1rem;
  color: var(--gray, #999);
}

.filtered-empty h3 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-darker, #2c5fa3);
  font-size: 1.1rem;
}

.filtered-empty p {
  margin: 0;
  font-size: 0.95rem;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #5086c1);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-create:hover {
  background-color: var(--primary-darker, #2c5fa3);
}

.icon-plus {
  width: 18px;
  height: 18px;
  fill: white;
}

/* État de chargement */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(80, 134, 193, 0.2);
  border-left: 4px solid var(--primary-color, #5086c1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loading-state p {
  color: var(--tertiary-dark, #7b7b7b);
  font-size: 1.1rem;
  margin: 0;
}

/* État vide */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background-color: rgba(250, 250, 250, 0.8);
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  fill: var(--tertiary-dark, #7b7b7b);
  opacity: 0.6;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: var(--primary-darker, #2c5fa3);
  margin: 0 0 1rem 0;
}

.empty-state p {
  color: var(--tertiary-dark, #7b7b7b);
  margin: 0 0 2rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #5086c1);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-darker, #2c5fa3);
}

/* Grille des promotions */
.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
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
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  margin-top: 0;
  color: var(--primary-darker, #2c5fa3);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: var(--tertiary-dark, #7b7b7b);
  border: 1px solid var(--gray-light, #eaeaea);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

/* Responsive */
@media (max-width: 768px) {
  .promotions-container {
    padding: 1rem;
  }

  .promotions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .promotions-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    padding: 1.5rem;
  }
}
</style>
