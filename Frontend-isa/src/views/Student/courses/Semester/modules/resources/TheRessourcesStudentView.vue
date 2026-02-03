<template>
  <BreadCrumbsBack />
  <div class="resources-container">
    <!-- Header Section -->
    <div class="resources-header">
      <div class="header-content">
        <Icon icon="material-symbols:school-outline" class="header-icon" />
        <div class="header-text">
          <h1 class="header-title">Ressources Pédagogiques</h1>
          <p class="header-subtitle">Documents et vidéos pour votre apprentissage</p>
        </div>
      </div>
      <div class="resources-count" v-if="ressources.length > 0">
        <Icon icon="material-symbols:folder-outline" />
        <span>{{ ressources.length }} {{ ressources.length > 1 ? 'ressources' : 'ressource' }}</span>
      </div>
    </div>

    <!-- Avertissement droits d'auteur -->
    <div class="copyright-notice" v-if="ressources.length > 0">
      <div class="notice-icon">
        <Icon icon="material-symbols:info-outline" />
      </div>
      <div class="notice-content">
        <h4>⚠️ Usage strictement pédagogique</h4>
        <p>Ces supports de cours sont la propriété intellectuelle de vos enseignants et sont réservés exclusivement à
          l'année académique en cours. Toute reproduction, distribution ou utilisation commerciale est strictement
          interdite conformément à la politique de confidentialité que vous avez acceptée lors de votre inscription.</p>
      </div>
    </div>

    <!-- Loading State -->
    <SpinningLoader v-if="loading" />

    <!-- Error State -->
    <ErrorComponent v-else-if="errorServer && !loading" :message="errorServer" />

    <!-- Empty State -->
    <div v-else-if="!loading && ressources.length === 0" class="empty-state">
      <Icon icon="material-symbols:folder-open-outline" class="empty-icon" />
      <h3>Aucune ressource disponible</h3>
      <p>Les ressources pédagogiques seront ajoutées par votre enseignant.</p>
    </div>

    <!-- Resources Grid -->
    <div v-else class="resources-grid">
      <TheStudentResourcesCard v-for="resource in ressources" :ressource="resource" :key="resource._id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import TheStudentResourcesCard from '@/components/student/TheStudentResourcesCard.vue';
import type ResourcesInterface from '@/interfaces/resources.interface';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BreadCrumbs from '@/components/ui/BreadCrumbs.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';

const route = useRoute()
const loading = ref<boolean>(false);
const errorServer = ref<string>('');
const ressources = ref<ResourcesInterface[]>([]);

const fetchRessources = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/v1/resources/module/${route.params.moduleId}/promotion/${route.params.promotionId}`)
    ressources.value = response.data;
  } catch (error: any) {
    errorServer.value = error.response?.data || 'Erreur lors du chargement des ressources';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRessources();
});
</script>



<style scoped>
.resources-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.resources-header {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  color: white;
  box-shadow: 0 4px 16px rgba(var(--primary-color-rgb), 0.2);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.resources-count {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.header-subtitle {
  font-size: 1rem;
  opacity: 0.95;
  margin: 0;
}

/* Avertissement droits d'auteur */
.copyright-notice {
  background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.1) 0%, rgba(var(--warning-rgb), 0.05) 100%);
  border: 1px solid rgba(var(--warning-rgb), 0.3);
  border-left: 4px solid var(--warning);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  animation: slideDown 0.5s ease-out;
}

.notice-icon {
  width: 40px;
  height: 40px;
  background: var(--warning);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1.5rem;
}

.notice-content {
  flex: 1;
}

.notice-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-content p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
}

.empty-icon {
  font-size: 5rem;
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-state p {
  font-size: 1rem;
  color: #999;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .resources-container {
    padding: 1rem;
  }

  .resources-header {
    flex-direction: column;
    padding: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-icon {
    width: 56px;
    height: 56px;
    font-size: 1.75rem;
  }

  .header-title {
    font-size: 1.5rem;
  }

  .copyright-notice {
    flex-direction: column;
    padding: 1rem;
    text-align: center;
  }

  .notice-icon {
    width: 36px;
    height: 36px;
    margin: 0 auto;
  }

  .notice-content h4 {
    font-size: 0.95rem;
    justify-content: center;
  }

  .notice-content p {
    font-size: 0.8rem;
  }

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .empty-state {
    padding: 3rem 1rem;
  }

  .empty-icon {
    font-size: 4rem;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.25rem;
  }

  .header-subtitle {
    font-size: 0.9rem;
  }

  .resources-count {
    font-size: 0.85rem;
    padding: 0.2rem 0.6rem;
  }
}
</style>
