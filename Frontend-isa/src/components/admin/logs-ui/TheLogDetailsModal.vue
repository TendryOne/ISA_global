<template>
  <div v-if="log" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>
          <icon icon="mdi:file-document-outline" width="24" height="24" />
          Détails de l'activité
        </h3>
        <button @click="close" class="modal-close" aria-label="Fermer">
          <icon icon="mdi:close" width="24" height="24" />
        </button>
      </div>
      <div class="modal-body">
        <div class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:account" width="18" height="18" />
            Utilisateur :
          </span>
          <span class="detail-value">{{ log.authorName }} (#{{ log.authorId }})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:shield-account" width="18" height="18" />
            Rôle :
          </span>
          <span class="detail-value">{{ log.role || 'Non spécifié' }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:flash" width="18" height="18" />
            Action :
          </span>
          <span class="detail-value">{{ log.action }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:clock-outline" width="18" height="18" />
            Date :
          </span>
          <span class="detail-value">{{ formatDateTimeFull(log.createdAt) }}</span>
        </div>
        <div v-if="log.details" class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:text-box-outline" width="18" height="18" />
            Détails :
          </span>
          <pre class="detail-value">{{ log.details }}</pre>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            <icon icon="mdi:ip-network" width="18" height="18" />
            Adresse IP :
          </span>
          <span class="detail-value">{{ log.ipAddress || 'Non disponible' }}</span>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="onDelete" class="danger-button" v-if="hasAdminRole">
          <icon icon="mdi:trash-can-outline" width="18" height="18" />
          Supprimer cette entrée
        </button>
        <button @click="close" class="cancel-button">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Log {
  id: string
  authorId: string
  authorName: string
  role?: string
  action: string
  details?: string
  createdAt: Date
  ipAddress?: string
}

const props = defineProps<{
  log: Log | null
  hasAdminRole: boolean
}>()

const emit = defineEmits(['close', 'delete'])

const close = () => {
  emit('close')
}

const onDelete = () => {
  if (props.log) {
    emit('delete', props.log.id)
  }
}

const formatDateTimeFull = (date: Date) => {
  return date.toLocaleString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
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
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-dark);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--primary-dark);
}

.modal-close {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rounded);
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: var(--tertiary-color);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: var(--gray-super-light);
  color: var(--error);
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 1rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 600;
  color: var(--primary-dark);
  min-width: 120px;
}

.detail-value {
  flex: 1;
  color: var(--tertiary-darker);
}

.detail-value pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  background-color: var(--tertiary-extra-light);
  padding: 0.75rem;
  border-radius: var(--radius);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.danger-button {
  padding: 0.625rem 1.25rem;
  background-color: var(--error-light);
  color: var(--error-dark);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.danger-button:hover {
  background-color: var(--error);
  color: var(--white);
}

.cancel-button {
  padding: 0.625rem 1.25rem;
  background-color: var(--gray-lighter);
  color: var(--tertiary-dark);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: var(--gray-light);
}

@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    min-width: auto;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
