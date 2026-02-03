<template>
  <!-- Modal Container -->
  <transition name="elite-modal">
    <div v-if="isOpen" class="elite-modal-overlay" @click.self="closeModal">
      <div class="elite-modal-container">
        <!-- Modal Header avec effet de gradient premium -->
        <div class="elite-modal-header" :class="type">
          <div class="header-icon-container">
            <div class="header-icon" :class="type">
              <Icon :icon="modalIcons[type]" width="28" />
            </div>
          </div>
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="closeModal">
            <Icon icon="mdi:close" width="22" />
          </button>
        </div>

        <!-- Modal Content avec effet de verre -->
        <div class="elite-modal-content">
          <div class="content-glass">
            <p v-if="type === 'approval'" class="modal-message">
              <Icon icon="mdi:shield-check-outline" width="24" class="message-icon" />
              <span>Confirmez-vous la validation définitive de cette préinscription ?</span>
            </p>

            <!-- Nouveau sélecteur de promotion pour l'approbation -->
            <div v-if="type === 'approval'" class="promotion-assignment">
              <div v-if="!availableFee && !loading">
                <p>
                  Les frais de scolarité pour la filière {{ student.field }} au niveau
                  {{ student.levelAsked }} n'ont pas encore été paramétrés.
                </p>
                <RouterLink to="/admin/fees/manage/list">Gerer les frais de scolarite</RouterLink>
              </div>
            </div>

            <div v-if="type === 'rejection'" class="rejection-content">
              <!-- Contenu existant pour le rejet -->
              <p class="modal-message">
                <Icon icon="mdi:alert-box-outline" width="24" class="message-icon" />
                <span>Veuillez spécifier le motif de rejet de cette préinscription :</span>
              </p>

              <div class="reason-selection">
                <label class="reason-option" v-for="reason in rejectionReasons" :key="reason.value">
                  <input
                    type="radio"
                    v-model="selectedReason"
                    :value="reason.value"
                    class="reason-radio"
                  />
                  <div
                    class="custom-radio"
                    :class="{ checked: selectedReason === reason.value }"
                  ></div>
                  <div class="reason-details">
                    <span class="reason-title">{{ reason.label }}</span>
                    <span class="reason-description">{{ reason.description }}</span>
                  </div>
                </label>
              </div>

              <div class="custom-reason" v-if="selectedReason === 'other'">
                <label for="customReason">Précisez la raison :</label>
                <div class="textarea-container">
                  <textarea
                    id="customReason"
                    v-model="customReasonText"
                    placeholder="Décrivez précisément le motif de rejet..."
                    rows="3"
                  ></textarea>
                  <div class="textarea-border"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer avec séparateur premium -->
        <div class="elite-modal-footer">
          <div class="footer-separator"></div>
          <div class="footer-buttons">
            <button class="modal-btn secondary" @click="closeModal">
              <Icon icon="mdi:close-circle-outline" width="20" />
              <span>Annuler</span>
            </button>
            <button
              class="modal-btn primary"
              :class="type"
              @click="confirmAction"
              :disabled="isConfirmDisabled || isInProgress"
            >
              <Icon
                :icon="
                  type === 'approval'
                    ? 'mdi:check-circle-outline'
                    : 'mdi:alert-circle-check-outline'
                "
                width="20"
              />
              <span>{{ confirmButtonText }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface'
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface'

const props = defineProps<{
  isOpen: boolean
  type: 'approval' | 'rejection'
  student: UserPendingInterface
  isInProgress: boolean
}>()

const emit = defineEmits(['close', 'confirm'])

const rejectionReasons = [
  {
    value: 'invalid_payment',
    label: 'Paiement non valide',
    description: 'Le justificatif de paiement est incomplet, illisible ou non conforme',
  },
  {
    value: 'incomplete_file',
    label: 'Dossier incomplet',
    description: 'Un ou plusieurs documents requis sont manquants ou non conformes',
  },
  {
    value: 'criteria_not_met',
    label: 'Critères non satisfaits',
    description: 'Le candidat ne remplit pas les conditions académiques requises',
  },
  {
    value: 'document_authenticity',
    label: 'Authenticité douteuse',
    description: 'Un ou plusieurs documents présentent des signes de falsification',
  },
  {
    value: 'other',
    label: 'Autre motif',
    description: 'Raison spécifique non listée ci-dessus',
  },
]

const selectedReason = ref('')
const customReasonText = ref('')
const selectedPromotion = ref('')
const availableFee = ref<FeesManagementInterface | null>(null)

const modalIcons = {
  approval: 'mdi:shield-check',
  rejection: 'mdi:alert-box',
}

const title = computed(() => {
  return props.type.includes('approval')
    ? 'Validation de préinscription'
    : 'Rejet de préinscription'
})

const confirmButtonText = computed(() => {
  return props.type.includes('approval') ? "Confirmer l'approbation" : 'Confirmer le rejet'
})

const isConfirmDisabled = computed(() => {
  if (props.type.includes('approval')) {
    return !availableFee.value
  }
  return props.type.includes('rejection') && !selectedReason.value
})

const loading = ref<boolean>(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await (
      await axios.get(`/api/v1/feesManagement/${props.student.field}/${props.student.levelAsked}`)
    ).data
    availableFee.value = response
  } catch (error) {
    console.error('Erreur lors du chargement des promotions', error)
  } finally {
    loading.value = false
  }
})

const closeModal = () => {
  emit('close')
  resetForm()
}

const confirmAction = () => {
  let payload: any = {}

  if (props.type.includes('rejection')) {
    payload = {
      reason:
        selectedReason.value === 'other'
          ? customReasonText.value
          : rejectionReasons.find((r) => r.value === selectedReason.value)?.label,
    }
  }

  emit('confirm', payload)
  resetForm()
}

const resetForm = () => {
  selectedReason.value = ''
  customReasonText.value = ''
  selectedPromotion.value = ''
}
</script>

<style scoped>
.promotion-assignment {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--gray-lighter);
}

.select-container {
  position: relative;
  margin-top: 0.5rem;
}

.select-container select {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  appearance: none;
  background-color: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.select-container select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.select-arrow {
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--gray-dark);
}

/* Animation pour le sélecteur */
.select-container select:hover {
  border-color: var(--primary-light);
}

.select-container select:focus + .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Animation premium */
.elite-modal-enter-active,
.elite-modal-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.elite-modal-enter-from,
.elite-modal-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.98);
}

/* Overlay luxueux */
.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(10, 22, 31, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
  box-sizing: border-box;
}

/* Container principal ultra-premium */
.elite-modal-container {
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  background: linear-gradient(145deg, var(--white) 0%, var(--tertiary-extra-light) 100%);
  border-radius: var(--radius-xl);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.16),
    0 24px 48px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--gray-lighter);
  transform: translateY(0);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.elite-modal-overlay:hover .elite-modal-container {
  transform: translateY(-2px);
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.2),
    0 32px 64px rgba(0, 0, 0, 0.16);
}

/* En-tête avec gradient premium */
.elite-modal-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  position: relative;
  flex-shrink: 0;
}

.elite-modal-header.approval {
  background: linear-gradient(90deg, var(--primary-dark) 0%, var(--primary-color) 100%);
}

.elite-modal-header.rejection {
  background: linear-gradient(90deg, var(--error-dark) 0%, var(--error) 100%);
}

.elite-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--white);
  flex-grow: 1;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-icon-container {
  position: relative;
  margin-right: 1rem;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  position: relative;
  z-index: 2;
}

.header-icon.approval {
  background-color: var(--white);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.3);
}

.header-icon.rejection {
  background-color: var(--white);
  color: var(--error);
  box-shadow: 0 4px 12px rgba(235, 77, 75, 0.3);
}

.header-icon::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  z-index: -1;
  opacity: 0.4;
}

.header-icon.approval::after {
  background: var(--primary-color);
}

.header-icon.rejection::after {
  background: var(--error);
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0.5rem;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;
  backdrop-filter: blur(4px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* Contenu avec effet de verre */
.elite-modal-content {
  padding: 2rem;
  overflow-y: auto;
  flex-grow: 1;
}

.content-glass {
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.05);
}

.modal-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  color: var(--gray-dark);
  font-size: 0.9375rem;
  line-height: 1.6;
}

.message-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: var(--primary-color);
}

.rejection-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reason-selection {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.reason-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--white);
  border: 1px solid var(--gray-lighter);
  position: relative;
  overflow: hidden;
}

.reason-option:hover {
  border-color: var(--primary-light);
  box-shadow: 0 2px 8px rgba(80, 134, 193, 0.1);
}

.reason-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--primary-light);
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.3s ease;
}

.reason-option:hover::before {
  transform: scaleY(1);
}

.reason-radio {
  position: absolute;
  opacity: 0;
}

.custom-radio {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-light);
  border-radius: 50%;
  margin-top: 0.125rem;
  flex-shrink: 0;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-radio.checked {
  border-color: var(--primary-color);
  background-color: var(--primary-extra-light);
}

.custom-radio.checked::after {
  content: '';
  width: 10px;
  height: 10px;
  background-color: var(--primary-color);
  border-radius: 50%;
}

.reason-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.reason-title {
  font-weight: 500;
  color: var(--primary-dark);
  font-size: 0.9375rem;
}

.reason-description {
  font-size: 0.8125rem;
  color: var(--gray-dark);
  line-height: 1.4;
}

.custom-reason {
  margin-top: 1rem;
}

.custom-reason label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--gray-dark);
  font-weight: 500;
}

.textarea-container {
  position: relative;
}

.textarea-container textarea {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 100px;
  background: var(--white);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.textarea-container textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.textarea-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius);
  pointer-events: none;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.textarea-container textarea:focus ~ .textarea-border {
  border: 1px solid var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
  margin: -1px;
}

/* Pied de page premium */
.elite-modal-footer {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.footer-separator {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--gray-lighter) 20%,
    var(--gray-lighter) 80%,
    transparent 100%
  );
  position: relative;
}

.footer-separator::after {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 8px;
  background: var(--primary-color);
  border-radius: 4px;
  opacity: 0.2;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.modal-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-btn:hover::after {
  opacity: 1;
}

.modal-btn.secondary {
  background-color: var(--white);
  color: var(--gray-dark);
  border: 1px solid var(--gray-light);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.modal-btn.secondary:hover {
  background-color: var(--gray-extra-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-btn.primary {
  color: var(--white);
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.modal-btn.primary.approval {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
}

.modal-btn.primary.rejection {
  background: linear-gradient(135deg, var(--error) 0%, var(--error-dark) 100%);
}

.modal-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-btn.primary:disabled {
  background: var(--gray-light);
  cursor: not-allowed;
  opacity: 0.7;
  transform: none !important;
  box-shadow: none !important;
}

.promotion-assignment {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--gray-lighter);
}

.promotion-assignment > div {
  background-color: var(--error-extra-light);
  border: 1px solid var(--error-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  text-align: center;
}

.promotion-assignment p {
  color: var(--error-dark);
  font-size: 0.9375rem;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-weight: 500;
}

.promotion-assignment a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--white);
  background-color: var(--error);
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(235, 77, 75, 0.2);
}

.promotion-assignment a:hover {
  background-color: var(--error-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(235, 77, 75, 0.3);
}

/* Animation pour le lien */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

.promotion-assignment a {
  animation: pulse 2s infinite;
}

/* Responsive pour petits écrans */
@media (max-width: 600px) {
  .elite-modal-container {
    max-height: 95vh;
  }

  .elite-modal-header,
  .footer-buttons {
    padding: 1.25rem;
  }

  .elite-modal-content {
    padding: 1.5rem;
  }

  .content-glass {
    padding: 1.25rem;
  }

  .footer-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .modal-btn {
    width: 100%;
    min-width: auto;
  }

  .promotion-assignment {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .promotion-assignment > div {
    padding: 1rem;
  }

  .promotion-assignment a {
    width: 100%;
    justify-content: center;
  }
}
</style>
