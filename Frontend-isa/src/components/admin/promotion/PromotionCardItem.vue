<template>
  <div class="promotion-card" :class="{ inactive: !promotion.isActive }">
    <div class="card-header">
      <h3 class="promotion-name">{{ promotion.name }}</h3>
      <div class="status-badge" :class="promotion.isActive ? 'active' : 'inactive'">
        {{ promotion.isActive ? 'Active' : 'Inactive' }}
      </div>
    </div>

    <div class="card-content">
      <div class="date-info">
        <div class="date-item">
          <span class="label">Début:</span>
          <span class="value">{{ formatDate(promotion.startDate) }}</span>
        </div>
        <div class="date-item">
          <span class="label">Fin:</span>
          <span class="value">{{ formatDate(promotion.endDate) }}</span>
        </div>
      </div>

      <div class="dates-container">
        <div class="date-display">
          <svg class="date-icon" viewBox="0 0 24 24">
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
          </svg>
          <span>{{ formatDateRange(promotion.startDate, promotion.endDate) }}</span>
        </div>
      </div>
      <div class="students-info" role="status" aria-live="polite">
        <svg class="students-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h10v-2.5C11 14.17 6.33 13 4 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h7v-2.5c0-2.33-4.67-3.5-8-3.5z" />
        </svg>
        <template v-if="numberOfStudents !== null">
          <span class="students-count">
            {{ numberOfStudents }} étudiant{{ numberOfStudents > 1 ? 's' : '' }}
          </span>
        </template>
        <template v-else>
          <span class="mini-spinner" aria-hidden="true"></span>
          <span class="students-loading">Chargement…</span>
        </template>
      </div>
    </div>

    <div class="card-footer">
      <div class="meta-info">
        <span v-if="promotion.createdAt" class="created-date">
          Créé le {{ formatDate(promotion.createdAt) }}
        </span>
      </div>

      <div class="actions">
        <button class="btn-action toggle-status" :title="promotion.isActive ? 'Désactiver' : 'Activer'"
          @click.stop="toggleStatus">
          <svg class="action-icon" viewBox="0 0 24 24">
            <path v-if="promotion.isActive"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z" />
            <path v-else
              d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
          </svg>
        </button>

        <button class="btn-action edit" title="Modifier" @click.stop="editPromotion">
          <svg class="action-icon" viewBox="0 0 24 24">
            <path
              d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>

        <button class="btn-action delete" title="Supprimer" @click.stop="deletePromotion">
          <svg class="action-icon" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type PromotionInterface from "@/interfaces/promotion.interface"
import axios from "axios";
import { onMounted, ref } from "vue";


const props = defineProps<{
  promotion: PromotionInterface;
}>();

const emit = defineEmits<{
  (e: 'toggleStatus', id: string | undefined): void;
  (e: 'edit', promotion: PromotionInterface): void;
  (e: 'delete', promotion: PromotionInterface): void;
}>();

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateRange = (startDate: Date, endDate: Date): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getFullYear() - 1} - ${end.getFullYear()}`;
  }
  return `${start.getFullYear()} - ${end.getFullYear()}`;
};

const toggleStatus = () => {
  emit('toggleStatus', props.promotion._id);
};

const editPromotion = () => {
  emit('edit', props.promotion);
};

const deletePromotion = () => {
  emit('delete', props.promotion);
};

const numberOfStudents = ref<number | null>(null);


async function getNumberOfStudents(promotionId: string) {
  try {
    const response = await axios.get(`/api/v1/promotions/students-count/${promotionId}`);
    numberOfStudents.value = response.data;
  } catch {
    console.log("error");

  }
}

onMounted(async () => {
  await getNumberOfStudents(props.promotion._id as string);
})

</script>

<style scoped>
.promotion-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.3s ease;
  border-left: 4px solid var(--primary-color, #5086c1);
  position: relative;
  overflow: hidden;
}

.promotion-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.promotion-card.inactive {
  opacity: 0.8;
  border-left-color: var(--tertiary-dark, #7b7b7b);
}

.promotion-card.inactive:hover {
  opacity: 0.9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.promotion-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-darker, #2c5fa3);
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: 0.75rem;
}

.status-badge.active {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-badge.inactive {
  background-color: rgba(158, 158, 158, 0.1);
  color: #9e9e9e;
}

.card-content {
  margin-bottom: 1.5rem;
}

.date-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.date-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.75rem;
  color: var(--tertiary-dark, #7b7b7b);
  margin-bottom: 0.25rem;
}

.value {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary-darker, #2c5fa3);
}

.dates-container {
  display: flex;
  align-items: center;
  background-color: rgba(80, 134, 193, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
}

.date-icon {
  width: 18px;
  height: 18px;
  fill: var(--primary-color, #5086c1);
  margin-right: 0.5rem;
}

.date-display {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: var(--primary-darker, #2c5fa3);
  font-weight: 500;
}

.students-info {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  background: #fff;
  border: 1px solid var(--gray-extra-light, #eaeaea);
  border-radius: 999px;
  font-size: 0.85rem;
  color: var(--gray-dark, #555);
}

.students-icon {
  width: 16px;
  height: 16px;
  fill: var(--primary-color, #5086c1);
}

.students-count {
  font-weight: 600;
  color: var(--primary-darker, #2c5fa3);
}

.students-loading {
  color: var(--tertiary-dark, #7b7b7b);
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(80, 134, 193, 0.25);
  border-left-color: var(--primary-color, #5086c1);
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.9s linear infinite;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.meta-info {
  font-size: 0.75rem;
  color: var(--tertiary-dark, #7b7b7b);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.btn-action.toggle-status:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.btn-action.edit:hover {
  background-color: rgba(33, 150, 243, 0.1);
}

.btn-action.delete:hover {
  background-color: rgba(244, 67, 54, 0.1);
}

.action-icon {
  width: 18px;
  height: 18px;
  fill: var(--tertiary-dark, #7b7b7b);
}

.btn-action:hover .action-icon {
  fill: currentColor;
}

.btn-action.toggle-status:hover .action-icon {
  color: #4caf50;
}

.btn-action.edit:hover .action-icon {
  color: #2196f3;
}

.btn-action.delete:hover .action-icon {
  color: #f44336;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .promotion-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .status-badge {
    margin-left: 0;
  }

  .date-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .actions {
    align-self: flex-end;
  }
}
</style>
