<template>
  <BreadCrumbsBack />
  <BreadCrumbs />
  <div class="module-detail-container" v-if="route.path === `/professor/modules/${moduleDetails?._id}`">
    <!-- En-tête premium -->
    <div class="detail-header">
      <div class="header-back">

      </div>
      <div class="header-content">
        <div class="module-badge">
          <Icon icon="mdi:book-open-page-variant" />
        </div>
        <div class="header-text">
          <h1>Détails du Module</h1>
          <p>Informations complètes et ressources pédagogiques</p>
        </div>
      </div>
    </div>

    <!-- Carte principale du module -->
    <div class="module-card premium-card">
      <div class="module-header">
        <div class="module-identity">
          <span class="module-code">{{ moduleDetails?.code?.toLocaleUpperCase() }}</span>
          <h2 class="module-title">{{ moduleDetails?.title }}</h2>
        </div>
        <div class="module-status">
          <span class="status-badge" :class="moduleDetails?.type?.toLowerCase()">
            {{ moduleDetails?.type }}
          </span>
        </div>
      </div>

      <p class="module-description">{{ moduleDetails?.description }}</p>

      <div class="module-stats">
        <div class="stat-item">
          <Icon icon="mdi:credit-card" />
          <div class="stat-info">
            <span class="stat-value">{{ moduleDetails?.credits }}</span>
            <span class="stat-label">Crédits</span>
          </div>
        </div>
        <div class="stat-item">
          <Icon icon="mdi:clock-outline" />
          <div class="stat-info">
            <span class="stat-value">{{ moduleDetails?.hours }}h</span>
            <span class="stat-label">Heures</span>
          </div>
        </div>
        <div class="stat-item">
          <Icon icon="mdi:weight" />
          <div class="stat-info">
            <span class="stat-value">{{ moduleDetails?.coefficient }}</span>
            <span class="stat-label">Coefficient</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section des ressources -->
    <div class="resources-section">
      <h3 class="section-title">
        <Icon icon="mdi:file-document" />
        Ressources Pédagogiques
      </h3>

      <!-- Documents originaux -->
      <div class="resource-category">
        <div class="category-header">
          <Icon icon="mdi:download" />
          <h4>Documents Officiels</h4>
          <span class="file-count">{{ moduleDetails?.files?.length || 0 }} fichiers</span>
        </div>

        <div v-if="moduleDetails?.files?.length" class="files-grid">
          <div v-for="(file, index) in moduleDetails.files" :key="index" class="file-card">
            <div class="file-icon">
              <Icon :icon="getFileIcon(file)" />
            </div>
            <div class="file-info">
              <span class="file-name">{{ formatFileName(file) }}</span>
              <span class="file-type">{{ getFileType(file) }}</span>
            </div>
            <a :href="`/api/v1/upload/materials/by-path?path=${file}`" target="_blank" rel="noopener"
              class="download-btn" :title="`Télécharger ${formatFileName(file)}`">
              <Icon icon="mdi:download" />
            </a>
          </div>
        </div>
        <div v-else class="empty-state">
          <Icon icon="mdi:file-remove" />
          <p>Aucun document disponible</p>
        </div>
      </div>

      <!-- Cartes de navigation -->
      <div class="navigation-cards">
        <div class="nav-card" @click="router.push(`/professor/modules/${moduleDetails?._id}/resources`)">
          <div class="nav-card-icon">
            <Icon icon="mdi:book-education" />
          </div>
          <div class="nav-card-content">
            <h4>Supports de cours</h4>
            <p>Accédez aux ressources pédagogiques</p>
          </div>
          <div class="nav-card-arrow">
            <Icon icon="mdi:chevron-right" />
          </div>
        </div>

        <div class="nav-card" @click="router.push(`/professor/modules/${moduleDetails?._id}/assignments`)">
          <div class="nav-card-icon">
            <Icon icon="mdi:assignment" />
          </div>
          <div class="nav-card-content">
            <h4>Devoirs</h4>
            <p>Gestion des travaux et exercices</p>
          </div>
          <div class="nav-card-arrow">
            <Icon icon="mdi:chevron-right" />
          </div>
        </div>

        <div class="nav-card" @click="router.push(`/professor/modules/${moduleDetails?._id}/grades`)">
          <div class="nav-card-icon">
            <Icon icon="mdi:chart-line" />
          </div>
          <div class="nav-card-content">
            <h4>Notes</h4>
            <p>Consultation des évaluations</p>
          </div>
          <div class="nav-card-arrow">
            <Icon icon="mdi:chevron-right" />
          </div>
        </div>
      </div>
    </div>

    <!-- États de chargement et d'erreur -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon icon="mdi:loading" class="spinner" />
      </div>
      <p>Chargement des détails du module...</p>
    </div>

    <div v-if="errorServer" class="error-state">
      <div class="error-icon">
        <Icon icon="mdi:alert-circle" />
      </div>
      <h3>Erreur de chargement</h3>
      <p>{{ errorServer }}</p>
      <button class="retry-button" @click="fetchModuleDetails">
        <Icon icon="mdi:refresh" />
        Réessayer
      </button>
    </div>
  </div>
  <RouterView />
</template>

<script setup lang="ts">
import type ModuleInterface from '@/interfaces/module.interface';
import axios from 'axios';
import { onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import BreadCrumbs from '@/components/ui/BreadCrumbs.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
const router = useRouter()
const errorServer = ref<string | null>(null);
const loading = ref<boolean>(false);
const moduleDetails = ref<ModuleInterface | null>(null);
const route = useRoute()

const fetchModuleDetails = async () => {
  loading.value = true;
  errorServer.value = null;
  try {
    const response = await axios.get(`/api/v1/modules/by-id/${route.params.moduleId}`);
    moduleDetails.value = response.data;
  } catch (error) {
    errorServer.value = "Erreur lors de la récupération des détails du module.";
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
}

const formatFileName = (path: string) => {
  return path.split('/').pop() || 'Fichier';
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const icons: { [key: string]: string } = {
    pdf: 'mdi:file-pdf',
    doc: 'mdi:file-word',
    docx: 'mdi:file-word',
    xls: 'mdi:file-excel',
    xlsx: 'mdi:file-excel',
    ppt: 'mdi:file-powerpoint',
    pptx: 'mdi:file-powerpoint',
    zip: 'mdi:folder-zip',
    rar: 'mdi:folder-zip',
    txt: 'mdi:file-document',
    jpg: 'mdi:file-image',
    jpeg: 'mdi:file-image',
    png: 'mdi:file-image',
    gif: 'mdi:file-image'
  };
  return icons[ext || ''] || 'mdi:file';
}

const getFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext ? `.${ext}` : 'Fichier';
}

watchEffect(() => {
  if (route.path === '/professor/modules/' + route.params.moduleId) {
    fetchModuleDetails()
  }
})
</script>

<style scoped>
.module-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: var(--background-light);
}

/* En-tête optimisé */
.detail-header {
  margin-bottom: 1.5rem;
}

.header-back {
  margin-bottom: 1rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.back-button:hover {
  background: var(--primary-extra-light);
  border-color: var(--primary-color-light);
  transform: translateX(-2px);
  box-shadow: var(--shadow-md);
}

.back-button svg {
  width: 18px;
  height: 18px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.module-badge {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.module-badge svg {
  width: 28px;
  height: 28px;
}

.header-text h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.header-text p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* Carte principale premium */
.premium-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.module-identity {
  flex: 1;
  min-width: 0;
}

.module-code {
  display: inline-block;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.module-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  line-height: 1.3;
}

.module-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.status-badge.obligatoire {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success-dark);
  border: 1px solid rgba(var(--success-rgb), 0.2);
}

.status-badge.optionnel {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning-dark);
  border: 1px solid rgba(var(--warning-rgb), 0.2);
}

.module-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.module-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: var(--primary-extra-light);
  border-color: var(--primary-color-light);
}

.stat-item svg {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* Section des ressources */
.resources-section {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 1.25rem;
}

.section-title svg {
  width: 22px;
  height: 22px;
  color: var(--primary-color);
}

.resource-category {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.category-header svg {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

.category-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  flex: 1;
  min-width: 0;
}

.file-count {
  background: var(--primary-extra-light);
  color: var(--primary-color);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.875rem;
  width: 100%;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.file-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  background: var(--white);
}

.file-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
}

.file-icon svg {
  width: 20px;
  height: 20px;
}

.file-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.file-name {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-dark);
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.file-type {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.download-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  background: var(--primary-extra-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  transition: all 0.3s ease;
  flex-shrink: 0;
  text-decoration: none;
}

.download-btn:hover {
  background: var(--primary-color);
  color: var(--white);
  transform: scale(1.05);
}

.download-btn svg {
  width: 18px;
  height: 18px;
}

/* Cartes de navigation */
.navigation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.nav-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color-light);
}

.nav-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
}

.nav-card-icon svg {
  width: 24px;
  height: 24px;
}

.nav-card-content {
  flex: 1;
  min-width: 0;
}

.nav-card-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
}

.nav-card-content p {
  font-size: 0.825rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.nav-card-arrow svg {
  width: 20px;
  height: 20px;
  color: var(--primary-color);
}

/* États */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.empty-state svg {
  width: 40px;
  height: 40px;
  opacity: 0.6;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2.5rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.loading-spinner {
  margin-bottom: 1.25rem;
}

.spinner {
  animation: spin 1.5s linear infinite;
  width: 40px;
  height: 40px;
  color: var(--primary-color);
}

.error-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--rounded);
  background: rgba(var(--error-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: var(--error);
}

.error-icon svg {
  width: 28px;
  height: 28px;
}

.error-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--error-dark);
  margin: 0 0 0.5rem 0;
}

.error-state p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--white);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.retry-button svg {
  width: 18px;
  height: 18px;
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .module-detail-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .header-text h1 {
    font-size: 1.5rem;
  }

  .module-badge {
    width: 56px;
    height: 56px;
  }

  .module-badge svg {
    width: 24px;
    height: 24px;
  }

  .premium-card {
    padding: 1.5rem;
  }

  .module-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .module-title {
    font-size: 1.25rem;
  }

  .module-stats {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .files-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .file-card {
    padding: 0.75rem;
    gap: 0.75rem;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .file-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
  }

  .file-icon svg {
    width: 18px;
    height: 18px;
  }

  .file-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .file-name {
    font-size: 0.8rem;
    line-height: 1.3;
    max-width: 100%;
    word-break: break-word;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-type {
    font-size: 0.7rem;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .download-btn {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .download-btn svg {
    width: 16px;
    height: 16px;
  }

  .navigation-cards {
    grid-template-columns: 1fr;
  }

  .nav-card {
    padding: 1rem;
  }

  .nav-card-icon {
    width: 40px;
    height: 40px;
  }

  .nav-card-icon svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .module-detail-container {
    padding: 0.75rem;
  }

  .header-text h1 {
    font-size: 1.375rem;
  }

  .header-text p {
    font-size: 0.875rem;
  }

  .premium-card {
    padding: 1.25rem;
  }

  .module-title {
    font-size: 1.125rem;
  }

  .module-description {
    font-size: 0.875rem;
  }

  .section-title {
    font-size: 1.125rem;
  }

  .category-header h4 {
    font-size: 1rem;
  }

  .stat-item {
    padding: 0.75rem;
    gap: 0.625rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .file-card {
    padding: 0.75rem;
    gap: 0.75rem;
    border-radius: var(--radius);
  }

  .file-icon {
    width: 36px;
    height: 36px;
  }

  .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 0.75rem;
    line-height: 1.2;
  }

  .file-type {
    font-size: 0.65rem;
  }

  .download-btn {
    width: 30px;
    height: 30px;
  }

  .download-btn svg {
    width: 14px;
    height: 14px;
  }

  .nav-card-content h4 {
    font-size: 0.95rem;
  }

  .nav-card-content p {
    font-size: 0.8rem;
  }
}

@media (max-width: 360px) {
  .back-button {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .module-stats {
    grid-template-columns: 1fr;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .file-count {
    align-self: flex-start;
  }

  .file-card {
    padding: 0.625rem;
    gap: 0.625rem;
  }

  .file-icon {
    width: 32px;
    height: 32px;
  }

  .file-icon svg {
    width: 16px;
    height: 16px;
  }

  .file-name {
    font-size: 0.7rem;
    line-height: 1.1;
  }

  .file-type {
    font-size: 0.6rem;
  }

  .download-btn {
    width: 28px;
    height: 28px;
  }

  .download-btn svg {
    width: 12px;
    height: 12px;
  }
}
</style>
