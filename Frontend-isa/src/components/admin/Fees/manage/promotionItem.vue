<template>
  <div class="promotion-card" :class="{ 'has-echeances': hasEcheances }">
    <!-- Header avec effet de gradient -->
    <div class="promotion-header">
      <div class="promotion-badge">
        <span class="promotion-year">{{ new Date(promotion.updatedAt).getFullYear() }}</span>
      </div>
      <div class="promotion-title">
        <h3>{{ promotion.level }}</h3>
        <p>{{ promotion.field }}
        </p>
        <p>Derniere modif. : {{ new Date(promotion.updatedAt).toLocaleDateString() }}</p>
      </div>
      <button class="more-actions" @click.stop="toggleActions">
        <Icon icon="mdi:dots-vertical" width="20" />
      </button>
    </div>

    <!-- Contenu principal -->
    <div class="promotion-content">
      <div v-if="promotion.fees" class="promotion-fees">
        <div class="fees-icon">
          <Icon icon="mdi:cash-multiple" width="20" />
        </div>
        <div class="fees-amount">
          <span class="amount">{{ formatNumber(promotion.fees) }}</span>
          <span class="currency">MGA</span>
        </div>
      </div>

      <div v-if="hasEcheances" class="echeances-summary">
        <div class="echeances-icon">
          <Icon icon="mdi:calendar-multiple-check" width="18" />
        </div>
        <div class="echeances-count">
          {{ promotion.echeances.length }} échéance<span v-if="promotion.echeances.length > 1">s</span>
        </div>
        <button class="toggle-echeances" @click.stop="toggleEcheances">
          <Icon :icon="showEcheances ? 'mdi:chevron-up' : 'mdi:chevron-down'" width="20" />
        </button>
      </div>
    </div>

    <!-- Liste des échéances (dépliante) -->
    <transition name="echeances-slide">
      <div v-if="showEcheances && hasEcheances" class="echeances-list">
        <div v-for="(echeance, index) in promotion.echeances" :key="index" class="echeance-item">
          <div class="echeance-date">
            <Icon icon="mdi:calendar" width="16" />
            <span>{{ formatDate(echeance.date) }}</span>
          </div>
          <div class="echeance-label">{{ echeance.label }}</div>
          <div class="echeance-amount">
            {{ formatNumber(echeance.amount) }} MGA
          </div>
        </div>
      </div>
    </transition>

    <!-- Menu d'actions (dropdown) -->
    <transition name="fade">
      <div v-if="showActions" class="actions-menu">
        <button class="action-btn" @click="emit('edit')">
          <Icon icon="mdi:pencil" width="18" />
          <span>Modifier</span>
        </button>
        <button class="action-btn delete" @click="emit('delete')">
          <Icon icon="mdi:trash-can-outline" width="18" />
          <span>Supprimer</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface';

const props = defineProps<{
  promotion: FeesManagementInterface
}>()

const emit = defineEmits(['edit', 'delete', 'duplicate'])

const showEcheances = ref(false)
const showActions = ref(false)

const hasEcheances = computed(() => {
  return props.promotion.echeances && props.promotion.echeances.length > 0
})

const toggleEcheances = () => {
  showEcheances.value = !showEcheances.value
}

const toggleActions = () => {
  showActions.value = !showActions.value
}

const closeActions = () => {
  showActions.value = false
}

document.addEventListener('click', closeActions)

const formatDate = (dateString: Date) => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' }
  return new Date(dateString).toLocaleDateString('fr-FR', options)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num)
}
</script>

<style scoped>
.promotion-card {
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid var(--gray-lighter);
}

.promotion-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-dark);
}

.promotion-header {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  position: relative;
}

.promotion-badge {
  width: 50px;
  height: 50px;
  background-color: var(--white);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.promotion-year {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}

.promotion-title {
  flex-grow: 1;
}

.promotion-title h3 {
  margin: 0;
  color: var(--white);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.3;
}

.promotion-title p {
  margin: 0.25rem 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  opacity: 0.9;
}

.more-actions {
  background: none;
  border: none;
  color: var(--white);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.more-actions:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.promotion-content {
  padding: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.promotion-fees {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--secondary-extra-light);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  flex-grow: 1;
}

.fees-icon {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fees-amount {
  display: flex;
  flex-direction: column;
}

.fees-amount .amount {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--secondary-darker);
  line-height: 1;
}

.fees-amount .currency {
  font-size: 0.75rem;
  color: var(--secondary-dark);
  opacity: 0.8;
  margin-top: 0.15rem;
}

.echeances-summary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: var(--primary-extra-light);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-grow: 1;
}

.echeances-summary:hover {
  background-color: var(--primary-color-light);
}

.echeances-icon {
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.echeances-count {
  font-size: 0.9rem;
  color: var(--primary-dark);
  font-weight: 500;
}

.toggle-echeances {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  margin-left: auto;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.echeances-list {
  padding: 0 1.5rem 1.5rem;
}

.echeance-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: var(--white);
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  border: 1px solid var(--gray-lighter);
  transition: all 0.3s ease;
}

.echeance-item:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-light);
}

.echeance-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.echeance-label {
  font-weight: 500;
  color: var(--black);
  font-size: 0.9rem;
}

.echeance-amount {
  font-weight: 600;
  color: var(--secondary-dark);
  text-align: right;
}

.actions-menu {
  position: absolute;
  top: 70px;
  right: 1.5rem;
  background-color: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dark);
  z-index: 10;
  overflow: hidden;
  min-width: 180px;
  border: 1px solid var(--gray-lighter);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--gray-dark);
  font-size: 0.9rem;
}

.action-btn:hover {
  background-color: var(--tertiary-extra-light);
  color: var(--primary-dark);
}

.action-btn.delete:hover {
  color: var(--error);
  background-color: rgba(235, 77, 75, 0.1);
}

/* Animations */
.echeances-slide-enter-active,
.echeances-slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.echeances-slide-enter-from,
.echeances-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .promotion-header {
    padding: 1rem;
  }

  .promotion-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .echeance-item {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .echeance-date,
  .echeance-amount {
    justify-content: flex-start;
    text-align: left;
  }
}
</style>
