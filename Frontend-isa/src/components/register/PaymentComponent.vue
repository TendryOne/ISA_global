<template>
  <div class="luxury-payment-container">
    <!-- Section Échéancier -->
    <div class="payment-section" v-if="paymentShedule">
      <div class="section-header">
        <div class="section-icon">
          <Icon icon="mdi:calendar-clock" width="28" height="28" />
        </div>
        <h2 class="section-title">Échéancier de Paiement</h2>
      </div>

      <div class="schedule-table-container">
        <table class="schedule-table">
          <thead>
            <tr>
              <th>Tranche</th>
              <th>Libellé</th>
              <th>Montant</th>
              <th>Date limite</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paymentShedule?.echeances" :key="item.label">
              <td class="tranche-number">#{{ index + 1 }}</td>
              <td class="tranche-label">{{ item.label }}</td>
              <td class="tranche-amount">{{ formatCurrency(item.amount) }}</td>
              <td class="tranche-date">{{ formatDate(item.date) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="total-label">Total général</td>
              <td class="total-amount">{{ formatCurrency(paymentShedule?.fees) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p class="instruction-note">
        NB : Le règlement de la première tranche des frais de scolarité est obligatoire et
        conditionne la validation de l’inscription de l’étudiant. Aucune autre tranche ne sera
        exigée à ce stade de la procédure.
      </p>
    </div>

    <!-- Section Méthodes de Paiement -->
    <div class="payment-section">
      <div class="section-header">
        <div class="section-icon">
          <Icon icon="mdi:credit-card-outline" width="28" height="28" />
        </div>
        <h2 class="section-title">Modes de Paiement</h2>
      </div>

      <div class="payment-methods">
        <label v-for="method in paymentMethods" :key="method.id" class="method-card"
          :class="{ active: selectedMethod === method.id }" @click="selectedMethod = method.id" :for="method.id">
          <div class="method-icon">
            <Icon :icon="method.icon" width="32" height="32" />
          </div>

          <div class="method-info">
            <h3>{{ method.name }}</h3>
            <p>{{ method.description }}</p>

            <Field type="radio" :id="method.id" name="method" :value="method.id" v-model="selectedMethod" v-show="false"
              :rules="methodValidation" />
          </div>

          <div class="method-selector">
            <div class="selector-dot"></div>
          </div>
        </label>
      </div>
    </div>

    <!-- Détails de la méthode sélectionnée -->
    <div class="method-details" v-if="selectedMethod">
      <div class="details-container">
        <h3 class="details-title">
          <Icon :icon="selectedMethodData.icon" />
          <span>Instructions pour {{ selectedMethodData.name }}</span>
        </h3>

        <div v-if="selectedMethod === 'bank'" class="bank-details">
          <div class="detail-row">
            <span class="detail-label">Banque:</span>
            <span class="detail-value">{{ DataPayments.BankName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Code Banque:</span>
            <span class="detail-value">{{ DataPayments.bankCode }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Numéro de Compte:</span>
            <span class="detail-value">{{ DataPayments.BankAccountNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Bénéficiaire:</span>
            <span class="detail-value">Institut Superieur d'Ambatomirahavavy</span>
          </div>

          <div class="detail-row highlight">
            <span class="detail-label">Référence:</span>
            <span class="detail-value">1ere tranche {{ user.levelAsked }} {{ user.field }}</span>
          </div>
          <div class="colspan">
            <p class="instruction-note">
              Après paiement, veuillez conserver le bordereau de versement et inscrire dans le champ
              correspondant la reference de transaction .
            </p>
          </div>
        </div>

        <div v-else-if="selectedMethod === 'mobile'" class="mobile-details">
          <div style="color: black">
            <strong>Raison :</strong> T1-{{ user.levelAsked }}-{{ user.field }}
          </div>
          <div class="operator" v-for="op in mobileOperators" :key="op.name">
            <div class="operator-icon">
              <img :src="op.icon" :alt="`${op.name}.png`" width="25" />
            </div>

            <div class="operator-name">{{ op.name }}</div>
            <div class="operator-owner">{{ op.owner }}</div>
            <div class="operator-number">{{ op.number }}</div>
          </div>

          <p class="instruction-note">
            Après paiement, veuillez conserver le SMS de confirmation avec le numéro de transaction.
          </p>
        </div>
      </div>
    </div>

    <!-- Section Preuve de Paiement -->
    <div class="payment-section proof-section" v-if="selectedMethod">
      <div class="section-header">
        <div class="section-icon">
          <Icon icon="mdi:file-document-check" width="28" height="28" />
        </div>
        <h2 class="section-title">Preuve de Paiement</h2>
      </div>

      <div class="proof-form">
        <div class="form-group">
          <InputField name="transactionRef" label="Reference de la transaction" floating
            :rules="transactionRefValidation" />
        </div>

        <div class="form-group file-upload" v-if="values.method === 'bank'">
          <label>Justificatif (.png/.jpeg/.webp) <strong>*Photo lisible</strong></label>
          <label class="upload-container" for="file">
            <Icon icon="mage:image-upload" class="upload-icon" />

            <span class="file-name">{{
              values.proofFile ? values.proofFile.name : 'Cliquez pour téléverser'
            }}</span>
            <Field type="file" name="proofFile" v-show="false" id="file" accept="image/jpeg,image/png,image/webp"
              :rules="FileValidation" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface'
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface'
import axios from 'axios'
import { Field, type GenericObject } from 'vee-validate'
import InputField from '../ui/InputField.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import DataPayments from '@/data/paymentData'

const props = defineProps<{
  user: UserPendingInterface
  values: GenericObject
}>()
const selectedMethod = ref<string>(props.values.method || 'bank')

const transactionRefValidation = toTypedSchema(
  z
    .string({ required_error: 'Veuillez inscrire la réference de la transaction' })
    .min(2, { message: 'Veuillez inscrire la réference de la transaction' }),
)
const FileValidation = toTypedSchema(
  z
    .instanceof(File, { message: 'La preuve de paiement est requise' })
    .refine((file) => file.size <= 2 * 1024 * 1024, 'Le fichier ne doit pas dépasser 2 Mo')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Seules les images JPEG, PNG ou webp sont acceptées',
    ),
)
const methodValidation = toTypedSchema(z.string())

const paymentShedule = ref<FeesManagementInterface | null>(null)
const loading = ref<boolean>(false)

const fetchSchedule = async () => {
  loading.value = true
  try {
    const response = await (
      await axios.get(`/api/v1/feesManagement/${props.user.field}/${props.user.levelAsked}`)
    ).data
    paymentShedule.value = response
  } catch (error) {
    console.error('Erreur lors du chargement des promotions', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (props.user) {
    await fetchSchedule()
  }
})

const paymentMethods = ref([
  {
    id: 'bank',
    name: 'Versement ou virement',
    description: 'Transfert direct depuis votre compte ou versement à la banque',
    icon: 'mdi:bank-transfer',
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    description: 'MVola, Orange Money, Airtel Money',
    icon: 'mdi:cellphone',
  },
])

const mobileOperators = ref([
  { name: 'MVola', icon: 'https://media.licdn.com/dms/image/v2/D4D0BAQGLDKCj-K8g4A/company-logo_200_200/company-logo_200_200/0/1702884518035/mvola_madagascar_logo?e=2147483647&v=beta&t=femhR0MnxHOefj2Rnv2OoRqIpRJ2BzjVtce4fE79prA', number: DataPayments.mobileMoneyNumber, owner: DataPayments.mobileMoneyOwner },
])

const selectedMethodData = computed(() => {
  return paymentMethods.value.find((m) => m.id === selectedMethod.value)
})

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
</script>

<style scoped>
/* Mode Clair - Luxury Payment Component */
.luxury-payment-container {
  background: #ffffff;
  /* Fond blanc au lieu de semi-transparent */
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  /* Ombre plus légère */
}

.payment-section {
  margin-bottom: 2.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-lighter);
  /* Ligne de séparation plus claire */
}

.section-icon {
  color: var(--primary-color);
  /* Bleu primaire */
  background: var(--primary-extra-light);
  /* Bleu très clair */
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-title {
  font-size: 1.4rem;
  margin: 0;
  color: var(--primary-dark);
  /* Texte bleu foncé */
  font-weight: 500;
}

/* Échéancier de paiement */
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.schedule-card {
  background: #ffffff;
  /* Fond blanc */
  border-radius: 10px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  /* Ombre légère */
}

.schedule-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  /* Ombre plus prononcée au hover */
}

.schedule-card.pending {
  border-left: 4px solid var(--warning);
}

.schedule-card.paid {
  border-left: 4px solid var(--success);
}

.schedule-card.overdue {
  border-left: 4px solid var(--danger);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.installment-label {
  font-weight: 500;
  color: var(--black);
  /* Texte noir */
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

.schedule-card.pending .status-badge {
  background: rgba(255, 193, 7, 0.1);
  /* Jaune très clair */
  color: var(--warning-dark);
  /* Jaune foncé */
}

.schedule-card.paid .status-badge {
  background: rgba(40, 167, 69, 0.1);
  /* Vert très clair */
  color: var(--success-dark);
  /* Vert foncé */
}

.schedule-card.overdue .status-badge {
  background: rgba(220, 53, 69, 0.1);
  /* Rouge très clair */
  color: var(--error-dark);
  /* Rouge foncé */
}

.card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.amount-display {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--black);
  /* Texte noir */
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray-dark);
  /* Gris foncé */
}

/* Méthodes de paiement */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: #ffffff;
  /* Fond blanc */
  border-radius: 8px;
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-card:hover {
  background: var(--primary-extra-light);
  /* Bleu très clair */
}

.method-card.active {
  border-color: var(--primary-color);
  /* Bordure bleue */
  background: var(--primary-extra-light);
  /* Bleu très clair */
  box-shadow: 0 0 0 2px var(--primary-extra-light);
}

.method-icon {
  color: var(--primary-color);
  /* Bleu primaire */
  background: var(--primary-extra-light);
  /* Bleu très clair */
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-info {
  flex: 1;
}

.method-info h3 {
  margin: 0 0 0.25rem 0;
  color: var(--black);
  /* Texte noir */
  font-size: 1rem;
}

.method-info p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--gray-dark);
  /* Gris foncé */
}

.method-selector {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--gray-lighter);
  /* Gris clair */
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-card.active .method-selector {
  border-color: var(--primary-color);
  /* Bleu primaire */
}

.selector-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.3s ease;
}

.method-card.active .selector-dot {
  background: var(--primary-color);
  /* Bleu primaire */
  box-shadow: 0 0 10px var(--primary-extra-light);
  /* Lueur bleue claire */
}

/* Détails de la méthode */
.method-details {
  background: #ffffff;
  /* Fond blanc */
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
}

.details-container {
  max-width: 600px;
  margin: 0 auto;
}

.details-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color);
  /* Bleu primaire */
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.bank-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  background: var(--tertiary-extra-light);
  /* Gris très clair */
  border-radius: 6px;
}

.detail-row.highlight {
  background: var(--primary-extra-light);
  /* Bleu très clair */
  grid-column: span 2;
}

.colspan {
  grid-column: span 2;
}

.detail-label {
  font-size: 0.8rem;
  color: var(--gray-dark);
  /* Gris foncé */
  margin-bottom: 0.25rem;
}

.detail-value {
  font-weight: 500;
  color: var(--black);
  /* Texte noir */
}

/* Mobile Money */
.mobile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.operator {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--tertiary-extra-light);
  /* Gris très clair */
  border-radius: 6px;
}

.operator-icon {
  color: var(--primary-color);
  /* Bleu primaire */
}

.operator-name {
  flex: 1;
  color: var(--black);
  /* Texte noir */
}

.operator-owner {
  color: var(--black);
}

.operator-number {
  font-family: monospace;
  font-weight: 500;
  color: var(--primary-color);
  /* Bleu primaire */
}

/* Paiement en espèces */
.cash-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.address-card {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--tertiary-extra-light);
  /* Gris très clair */
  border-radius: 8px;
}

.address-icon {
  color: var(--primary-color);
  /* Bleu primaire */
  font-size: 1.5rem;
}

.address-content h4 {
  margin: 0 0 0.5rem 0;
  color: var(--black);
  /* Texte noir */
}

address {
  font-style: normal;
  color: var(--gray-dark);
  /* Gris foncé */
  line-height: 1.5;
}

.hours {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: var(--gray);
  /* Gris moyen */
}

.instruction-note {
  font-size: 0.85rem;
  color: var(--gray);
  /* Gris moyen */
  font-style: italic;
  margin: 1.5rem 0 0 0;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-lighter);
  /* Ligne grise claire */
}

/* Preuve de paiement */
.proof-section {
  background: #ffffff;
  /* Fond blanc */
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
}

.proof-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--gray-dark);
  /* Gris foncé */
  font-size: 0.9rem;
}

.luxury-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #ffffff;
  /* Fond blanc */
  border: 1px solid var(--gray-lighter);
  /* Bordure grise claire */
  border-radius: 6px;
  color: var(--black);
  /* Texte noir */
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.luxury-input:focus {
  outline: none;
  border-color: var(--primary-color);
  /* Bordure bleue */
  box-shadow: 0 0 0 2px var(--primary-extra-light);
  /* Lueur bleue claire */
}

.file-upload {
  margin-top: 2rem;
}

.upload-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px dashed var(--gray-light);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-container:hover {
  border-color: var(--primary-color);
  /* Bordure bleue */
  background: var(--primary-extra-light);
  /* Bleu très clair */
}

.upload-icon {
  color: var(--primary-color);
  /* Bleu primaire */
  font-size: 1.25rem;
}

.file-name {
  flex: 1;
  color: var(--gray-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-input {
  display: none;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
}

.submit-button:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.schedule-table-container {
  overflow-x: auto;
  margin-top: 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-light);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  color: black;
  border-radius: var(--radius);
  overflow: hidden;
}

.schedule-table th,
.schedule-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-lighter);
}

.schedule-table th {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.schedule-table tbody tr:hover {
  background-color: var(--primary-extra-light);
}

.schedule-table tfoot tr {
  background-color: var(--tertiary-extra-light);
  font-weight: bold;
}

.total-label {
  text-align: right;
  color: var(--primary-dark);
}

.total-amount {
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Styles des cellules spécifiques */
.tranche-number {
  font-weight: bold;
  color: var(--primary-dark);
}

.tranche-label {
  font-weight: 500;
}

.tranche-amount {
  font-weight: 600;
}

.tranche-date {
  color: var(--gray-dark);
}

.tranche-total {
  font-weight: 600;
  color: var(--primary-color);
}

/* Styles des statuts */
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

tr.pending .status-badge {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-dark);
}

tr.paid .status-badge {
  background: rgba(40, 167, 69, 0.1);
  color: var(--success-dark);
}

tr.overdue .status-badge {
  background: rgba(220, 53, 69, 0.1);
  color: var(--error-dark);
}

/* Responsive */
@media (max-width: 768px) {
  .luxury-payment-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bank-details {
    grid-template-columns: 1fr;
  }

  .detail-row.highlight {
    grid-column: span 1;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .schedule-table th,
  .schedule-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }

  .schedule-table th {
    font-size: 0.7rem;
  }
}
</style>
