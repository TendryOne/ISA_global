<template>

  <div class="elite-modal-overlay" @click.self="close">
    <div class="elite-modal-container">
      <!-- Header -->
      <div class="elite-modal-header">
        <div class="elite-header-content">
          <Icon icon="fluent:payment-16-regular" width="28" height="28" />
          <h3>Vérification des Paiements</h3>
        </div>
        <button class="elite-close-btn" @click="close">
          <Icon icon="radix-icons:cross-2" width="24" height="24" />
        </button>
      </div>

      <!-- Contenu -->
      <div class="elite-modal-content">
        <!-- Section Étudiant -->
        <div class="elite-student-card">
          <div class="elite-student-avatar"
            :style="{ backgroundImage: `url('/api/v1/document?fullPath=${encodeURIComponent(student.identityPhoto)}')` }">
          </div>
          <div class="elite-student-info">
            <h4>{{ student.firstName }} {{ student.name }}</h4>
            <div class="elite-student-meta">
              <span class="elite-badge">
                <Icon icon="mdi:identifier" width="14" height="14" />
                {{ student.matricule }}
              </span>
              <span class="elite-badge">
                <Icon icon="mdi:bookshelf" width="14" height="14" />
                {{ student.field }}
              </span>
              <span class="elite-badge">
                <Icon icon="mdi:stairs" width="14" height="14" />
                {{ student.level }}
              </span>
            </div>
          </div>
        </div>

        <!-- Résumé des paiements -->
        <div class="elite-payment-summary">
          <div class="elite-summary-card">
            <div class="elite-summary-icon">
              <Icon icon="lucide:calendar-clock" width="24" height="24" />
            </div>
            <div>
              <span>Année académique :</span>
              <strong>{{ fees?.year || '--' }}</strong>
            </div>
          </div>

          <div class="elite-summary-card">
            <div class="elite-summary-icon">
              <Icon icon="ph:money" width="24" height="24" />
            </div>
            <div>
              <span>Total à payer :</span>
              <strong>{{ fees?.totalAmount?.toLocaleString() || '0' }} Ar</strong>
            </div>
          </div>
        </div>

        <!-- Liste des échéances -->
        <div class="elite-installments-list" v-if="fees?.installments?.length">
          <h4 class="elite-section-title">
            <Icon icon="mdi:calendar-alert" width="20" height="20" />
            Échéances de paiement
          </h4>

          <div v-for="(item, index) in fees.installments" :key="index" class="elite-installment-card"
            :class="{ 'verified': item.verified, 'pending': !item.verified }">
            <div class="elite-installment-header">
              <div class="elite-installment-title">
                <span class="elite-installment-badge">
                  {{ item.label || `Tranche ${index + 1}` }}
                </span>
                <span class="elite-installment-date">
                  <Icon icon="mdi:calendar" width="14" height="14" />
                  {{ formatDate(item.paymentDate) }}
                </span>
              </div>
              <span class="elite-installment-amount">
                {{ item.amount.toLocaleString() }} Ar
              </span>
            </div>

            <div class="elite-installment-body">
              <div class="elite-installment-status">
                <template v-if="item.verified && item.method">
                  <span class="status-badge success">
                    <Icon icon="mdi:check-circle" width="16" height="16" />
                    Paiement vérifié
                  </span>
                  <span v-if="item.verifiedBy">par {{ item.verifiedBy }}</span>
                </template>
                <template v-else-if="!item.verified && item.method">
                  <span class="status-badge warning">
                    <Icon icon="mdi:clock-outline" width="16" height="16" />
                    En attente de vérification
                  </span>
                </template>
              </div>

              <div class="elite-installment-details" v-if="item.method">
                <div v-if="item.method" class="elite-detail-item">
                  <Icon icon="mdi:credit-card-outline" width="16" height="16" />
                  <span>Méthode: {{ item.method }}</span>
                </div>

                <div v-if="item.transactionRef" class="elite-detail-item">
                  <Icon icon="mdi:identifier" width="16" height="16" />
                  <span>Référence: {{ item.transactionRef }}</span>
                </div>

                <div class="elite-detail-item proof">
                  <Icon icon="mdi:file-document-outline" width="16" height="16" />
                  <TheImageVisualizer v-if="item.proofFile" :url="`/api/v1/document?fullPath=${item.proofFile}`"
                    type="image" :title="`${item.label} - ${student.matricule}`">
                    <template #trigger>
                      <span>Voir la preuve de paiement</span>
                    </template>
                  </TheImageVisualizer>
                  <span v-else>Aucune preuve jointe</span>
                </div>
              </div>
              <template v-else>
                <div class="elite-payment-status">
                  <div v-if="new Date(item.dueDate) < new Date()" class="elite-status overdue">
                    <Icon icon="mdi:alert-circle-outline" width="16" height="16" />
                    <span>Échéance dépassée</span>
                  </div>
                  <div v-else class="elite-status not-paid">
                    <Icon icon="mdi:cash-clock" width="16" height="16" />
                    <span>En attente de paiement</span>
                  </div>
                  <div class="elite-due-date">
                    À payer avant le {{ formatDate(item.dueDate) }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Aucun échéancier -->
        <div v-else class="elite-empty-state">
          <Icon icon="mdi:calendar-remove-outline" width="48" height="48" />
          <p>Aucun échéancier de paiement disponible</p>
          <small>Les frais académiques pour cette année n'ont pas encore été configurés</small>
        </div>
      </div>

      <!-- Footer -->
      <div class="elite-modal-footer">
        <ActionButton variant="primary" icon="mdi:check-decagram" :disabled="!fees || loadingValidation"
          @click="emit('validStudent', fees!)">
          Valider la vérification
        </ActionButton>
        <ActionButton @click="close" icon="mdi:close-circle-outline" variant="danger">
          Fermer
        </ActionButton>
      </div>
    </div>


  </div>








</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import TheImageVisualizer from '@/components/images/TheImageVisualizer.vue'
import type StudentInterface from '@/interfaces/student.intefaces'
import type TutionFeesInterface from '@/interfaces/tutionFees.interface'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import SuccessToast from '@/components/toast/successToast.vue'

const loading = ref<boolean>(false)
const fees = ref<TutionFeesInterface | null>(null)
const errorServer = ref<string>('')
const props = defineProps<{
  student: StudentInterface
  loadingValidation: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'validStudent', tutionFees: TutionFeesInterface): void
}>()

const close = () => {
  emit('close')

}

const formatDate = (dateString: Date) => {
  if (!dateString) return 'Non spécifiée'
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

const fetchTutionFees = async () => {
  loading.value = true
  try {
    const response = (await axios.get(`/api/v1/tutionFees/user/${props.student._id}`)).data
    fees.value = response
  } catch (error) {
    errorServer.value = axios.isAxiosError(error) ? error.response?.data : "Une erreur est survenue lors de la récupération des frais de scolarité."
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchTutionFees()
})




</script>

<style scoped>
.elite-payment-status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.elite-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.5rem;
  border-radius: 6px;
}

.elite-status.overdue {
  color: var(--error);
  background: rgba(var(--error-rgb), 0.05);
}

.elite-status.not-paid {
  color: var(--warning-dark);
  background: rgba(var(--warning-rgb), 0.05);
}

.elite-due-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding-left: 1.5rem;
}

.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

.elite-modal-container {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.elite-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
}

.elite-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.elite-header-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.elite-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.elite-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.elite-modal-content {
  padding: 1.5rem;
  max-height: 65vh;
  overflow-y: auto;
}

.elite-student-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.elite-student-avatar {
  width: 60px;
  height: 60px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: 4px solid var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}


.elite-student-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-dark);
}

.elite-student-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.elite-badge {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 20px;
  color: var(--text-secondary);
}

.elite-payment-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.elite-summary-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.elite-summary-card.accent {
  background: rgba(var(--primary-rgb), 0.05);
  border-color: rgba(var(--primary-rgb), 0.1);
}

.elite-summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.elite-summary-card span {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.elite-summary-card strong {
  font-size: 1rem;
  color: var(--text-dark);
}

.elite-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--text-dark);
  margin: 1.5rem 0 1rem;
}

.elite-installments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.elite-installment-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.2s ease;
}

.elite-installment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.elite-installment-card.verified {
  border-left: 4px solid var(--success);
}

.elite-installment-card.pending {
  border-left: 4px solid var(--warning);
}

.elite-installment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.elite-installment-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.elite-installment-badge {
  font-weight: 500;
  color: var(--text-dark);
}

.elite-installment-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.elite-installment-amount {
  font-weight: 600;
  color: var(--primary-color);
}

.elite-installment-body {
  padding: 1rem;
}

.elite-installment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.status-badge.success {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success);
}

.status-badge.warning {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
}

.elite-installment-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.elite-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.elite-detail-item.proof {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.elite-detail-item.proof span {
  cursor: pointer;
  color: var(--primary-color);
  text-decoration: underline;
}

.elite-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
}

.elite-empty-state .iconify {
  color: rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.elite-empty-state p {
  margin: 0.25rem 0;
  color: var(--text-dark);
  font-weight: 500;
}

.elite-empty-state small {
  font-size: 0.8rem;
}

.elite-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(8px);
  }
}

/* Scrollbar */
.elite-modal-content::-webkit-scrollbar {
  width: 6px;
}

.elite-modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.02);
}

.elite-modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

/* Responsive */
@media (max-width: 600px) {
  .elite-payment-summary {
    grid-template-columns: 1fr;
  }

  .elite-modal-footer {
    flex-direction: column;
  }
}
</style>
