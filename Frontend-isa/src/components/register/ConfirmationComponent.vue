<template>
  <div class="confirmation-container">
    <!-- En-tête de confirmation -->
    <div class="confirmation-header">
      <div class="header-icon">
        <Icon icon="mdi:check-circle-outline" width="40" height="40" />
      </div>
      <h2 class="header-title">Confirmation Finale</h2>
      <p class="header-subtitle">Veuillez vérifier les informations avant soumission</p>
    </div>

    <!-- Carte récapitulative -->
    <div class="summary-card">
      <div class="summary-header">
        <Icon icon="mdi:clipboard-text-outline" class="summary-icon" />
        <h3>Récapitulatif de votre inscription</h3>
      </div>

      <div class="summary-grid">
        <div class="summary-item">
          <span class="item-label">ID d'inscription</span>
          <span class="item-value">{{ user.inscriptionId }} </span>
        </div>
        <div class="summary-item">
          <span class="item-label">Nom complet</span>
          <span class="item-value">{{ user.lastName }} {{ user.firstName }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Programme choisi</span>
          <span class="item-value">{{ user.field }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Niveau</span>
          <span class="item-value">{{ user.levelAsked }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Paiement</span>
          <span class="item-value">1ere Tranche</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Mode de paiement</span>
          <span class="item-value">{{ selectedMethodLabel }}</span>
        </div>
        <div class="summary-item">
          <span class="item-label">Ref. transaction </span>
          <span class="item-value">{{ values.transactionRef }}</span>
        </div>
        <div class="summary-item" v-if="values.method === 'bank'">
          <span class="item-label">Preuve de paiement</span>
          <img :src="imageSrc" width="70" height="70" />
        </div>
      </div>
    </div>

    <!-- Section des accords -->
    <div class="agreements-section">
      <h3 class="agreements-title">
        <Icon icon="mdi:shield-check-outline" />
        <span>Accords et confirmations</span>
      </h3>

      <div class="agreement-item">
        <div class="agreement-check">
          <Icon icon="mdi:check-circle" class="checked-icon" />
        </div>
        <div class="agreement-text">
          <a href="#" class="policy-link">Conditions Générales d’Utilisation</a>
        </div>
      </div>

      <div class="agreement-item">
        <div class="agreement-check">
          <Icon icon="mdi:check-circle" class="checked-icon" />
        </div>
        <div class="agreement-text">
          <a href="#" class="policy-link">Politique de Confidentialité</a>
        </div>
      </div>

      <div class="agreement-item">
        <div class="agreement-check">
          <Icon icon="mdi:check-circle" class="checked-icon" />
        </div>
        <div class="agreement-text">Contrat d'engagement</div>
      </div>

      <div class="agreement-item">
        <div class="agreement-check">
          <Icon icon="mdi:check-circle" class="checked-icon" />
        </div>
        <div class="agreement-text">Charte informatique</div>
      </div>
    </div>

    <!-- Avertissement important -->
    <div class="legal-warning">
      <div class="group">
        <div class="warning-icon">
          <Icon icon="mdi:alert-circle-outline" width="20" />
        </div>
        <div class="warning-content">
          <p>
            Après avoir cliqué sur le bouton <strong>"Terminer l'inscription"</strong>, je reconnais
            que toutes les informations saisies seront définitivement enregistrées et qu’il ne sera
            plus possible d’accéder à la page d’inscription pour effectuer des modifications.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface'
import type { GenericObject } from 'vee-validate'
import { useReadImg } from '@/composables/readImage'

const props = defineProps<{
  user: UserPendingInterface
  values: GenericObject
}>()

const selectedMethodLabel = computed(() => {
  const methods = {
    bank: 'Virement/Versement Bancaire',
    mobile: 'Mobile Money',
  }
  // @ts-ignore
  return methods[props.values.method] || 'Non spécifié'
})

const imageSrc = ref<string>('')

const readImageFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

onMounted(async () => {
  const file = props.values.proofFile
  if (file instanceof File) {
    imageSrc.value = await readImageFromFile(file)
  }
})
</script>

<style scoped>
.confirmation-container {
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.confirmation-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header-icon {
  color: var(--success);
  margin-bottom: 1rem;
}

.header-title {
  font-size: 1.8rem;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.header-subtitle {
  color: var(--gray-dark);
  font-size: 1rem;
  margin: 0;
}

/* Carte récapitulative */
.summary-card {
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.03), white);
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid rgba(80, 134, 193, 0.1);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-light));
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.summary-icon {
  color: var(--primary-color);
  font-size: 1.5rem;
}

.summary-header h3 {
  margin: 0;
  color: var(--primary-dark);
  font-size: 1.2rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-item.full-width {
  grid-column: 1 / -1;
}

.item-label {
  font-size: 0.85rem;
  color: var(--gray-dark);
  margin-bottom: 0.25rem;
}

.item-value {
  font-weight: 500;
  color: var(--black);
  font-size: 1rem;
}

/* Section des accords */
.agreements-section {
  background: var(--tertiary-extra-light);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.agreements-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-dark);
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.agreement-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;
}

.agreement-check {
  color: var(--success);
  font-size: 1.2rem;
  margin-top: 0.1rem;
}

.agreement-text {
  color: var(--gray-dark);
  line-height: 1.5;
}

.policy-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.policy-link:hover {
  text-decoration: underline;
}

/* Avertissement légal */
.legal-warning {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.5rem;
  background: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.warning-icon {
  color: var(--warning);
  font-size: 1.5rem;
}

.warning-content {
  color: var(--gray-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-content p {
  margin: 0;
  gap: 0.5rem;
}

.inline-icon {
  color: var(--warning);
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
}

.cancel-button,
.confirm-button {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-button {
  background: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.cancel-button:hover {
  background: rgba(80, 134, 193, 0.05);
}

.confirm-button {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.2);
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(80, 134, 193, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .confirmation-container {
    padding: 1.5rem;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
