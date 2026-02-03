<template>
  <article class="ue-card">
    <!-- Header de la carte -->
    <header class="ue-card-header">
      <div class="ue-main-info">
        <h3 class="ue-title">{{ ue.name }}</h3>
        <span class="ue-credits">{{ ue.credits }} crédits</span>
      </div>
      <span class="ue-code">{{ ue.code }}</span>
    </header>

    <!-- Contenu principal -->
    <div class="ue-card-content">
      <p class="ue-description">{{ ue.description }}</p>
    </div>

    <!-- Footer avec actions -->
    <footer class="ue-card-footer">
      <router-link :to="`/admin/course/UE/${route.params.filiere}/${route.params.semester}/${ue.code}`"
        class="view-modules-button">
        <EyeIcon />
        Voir les modules
      </router-link>

      <div class="ue-actions">
        <ActionButton @click.stop="$emit('edit', ue)" size="small" variant="outline">

          Modifier
        </ActionButton>
        <ActionButton @click.stop="$emit('delete', ue)" size="small" variant="danger">
          Supprimer
        </ActionButton>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue';
import { useRoute } from 'vue-router';
const route = useRoute()


defineProps({
  ue: {
    type: Object,
    required: true,
    default: () => ({
      code: '',
      name: '',
      credits: 0,
      description: '',
      modules: []
    })
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.ue-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(128, 128, 128, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ue-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(80, 134, 193, 0.2);
}

.ue-card-header {
  padding: 1.5rem;
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.ue-main-info {
  flex: 1;
}

.ue-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-darker);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.ue-credits {
  font-size: 0.85rem;
  color: var(--tertiary-dark);
  font-weight: 500;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 4px;
}

.ue-code {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--primary-color);
  background: var(--primary-extra-light);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
}

.ue-card-content {
  padding: 1.5rem;
  flex-grow: 1;
}

.ue-description {
  color: var(--gray-dark);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.ue-card-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
  padding: 1rem;
  gap: 0.5rem;
}

.view-modules-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
}

.view-modules-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.2);
}

.view-modules-button svg {
  width: 16px;
  height: 16px;
}

.ue-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-button,
.delete-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.edit-button {
  background: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-color);
}

.edit-button:hover {
  background: rgba(var(--primary-color-rgb), 0.2);
}

.delete-button {
  background: rgba(var(--error-rgb), 0.1);
  color: var(--error);
}

.delete-button:hover {
  background: rgba(var(--error-rgb), 0.2);
}

.edit-button svg,
.delete-button svg {
  width: 14px;
  height: 14px;
}

@media (max-width: 768px) {
  .ue-card-footer {
    flex-direction: column;
  }

  .ue-actions {
    width: 100%;
  }

  .edit-button,
  .delete-button {
    flex: 1;
    justify-content: center;
  }
}
</style>
