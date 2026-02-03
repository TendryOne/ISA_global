<template>
  <div class="student-module-container" v-if="
    $route.params.moduleId &&
    !route.path.includes('grades') &&
    !route.path.includes('resources') &&
    !route.path.includes('assignments')
  ">
    <!-- En-tête avec navigation -->
    <div class="module-header-section">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-nav">
          <BreadCrumbsBack />
        </div>
        <div class="header-main">
          <div class="module-icon-wrapper">
            <Icon icon="mdi:book-open-page-variant" class="module-icon" />
          </div>
          <div class="header-text">
            <h1>Détails du Module</h1>
            <p class="header-subtitle">Explorez les ressources et suivez votre progression</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="loading-container">
      <div class="loading-card">
        <SpinningLoader />
        <p class="loading-text">Chargement du module...</p>
      </div>
    </div>

    <!-- Erreur -->
    <ErrorComponent v-else-if="errorMessage" :message="errorMessage" @retry="fetchModule" />

    <!-- Contenu du module -->
    <div v-else-if="module" class="module-content">
      <!-- Carte d'information principale -->
      <div class="module-info-card">
        <div class="module-header-info">
          <div class="module-identity">
            <span class="module-code">{{ module.code?.toUpperCase() }}</span>
            <h2 class="module-title">{{ module.title }}</h2>
          </div>
          <div class="module-type">
            <span class="type-badge" :class="module.type?.toLowerCase()">
              {{ module.type }}
            </span>
          </div>
        </div>

        <p class="module-description">{{ module.description }}</p>

        <div class="module-statistics">
          <div class="stat-box">
            <Icon icon="mdi:credit-card-outline" class="stat-icon" />
            <div class="stat-details">
              <span class="stat-value">{{ module.credits }}</span>
              <span class="stat-label">Crédits</span>
            </div>
          </div>
          <div class="stat-box">
            <Icon icon="mdi:clock-time-four-outline" class="stat-icon" />
            <div class="stat-details">
              <span class="stat-value">{{ module.hours }}h</span>
              <span class="stat-label">Heures</span>
            </div>
          </div>
          <div class="stat-box">
            <Icon icon="mdi:scale-balance" class="stat-icon" />
            <div class="stat-details">
              <span class="stat-value">{{ module.coefficient }}</span>
              <span class="stat-label">Coefficient</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Ressources -->
      <div class="resources-section">
        <div class="section-header">
          <Icon icon="mdi:folder-open" class="section-icon" />
          <h3>Ressources Pédagogiques</h3>
        </div>

        <div class="resources-card">
          <div class="resources-header">
            <div class="resources-title">
              <Icon icon="mdi:file-document-multiple" />
              <h4>Documents du cours</h4>
            </div>
            <span class="files-count">{{ module.files?.length || 0 }} fichier{{
              module.files?.length > 1 ? 's' : ''
            }}</span>
          </div>

          <div v-if="module.files?.length" class="files-list">
            <div v-for="(file, index) in module.files" :key="index" class="file-item">
              <div class="file-icon-container">
                <Icon :icon="getFileIcon(file)" class="file-icon" />
              </div>
              <div class="file-details">
                <span class="file-name">{{ formatFileName(file) }}</span>
                <span class="file-extension">{{ getFileType(file) }}</span>
              </div>
              <a :href="`/api/v1/upload/materials/by-path?path=${file}`" target="_blank" rel="noopener"
                class="download-button" :title="`Télécharger ${formatFileName(file)}`">
                <Icon icon="mdi:download" />
              </a>
            </div>
          </div>

          <div v-else class="empty-files">
            <Icon icon="mdi:folder-open-outline" class="empty-icon" />
            <p>Aucun document disponible pour le moment</p>
          </div>
        </div>
      </div>

      <!-- Cartes d'actions -->
      <div class="actions-grid">
        <div class="action-card" @click="
          $router.push(
            `/student/courses/${route.params.semester}/${route.params.promotionId}/${module._id}/assignments`,
          )
          ">
          <div class="action-icon">
            <Icon icon="mdi:clipboard-text" />
          </div>
          <div class="action-content">
            <h4>Devoirs</h4>
            <p>Consultez et soumettez vos travaux</p>
          </div>
          <Icon icon="mdi:chevron-right" class="action-arrow" />
        </div>

        <div class="action-card" @click="
          $router.push(
            `/student/courses/${route.params.semester}/${route.params.promotionId}/${module._id}/grades`,
          )
          ">
          <div class="action-icon">
            <Icon icon="mdi:chart-box" />
          </div>
          <div class="action-content">
            <h4>Notes</h4>
            <p>Visualisez vos résultats</p>
          </div>
          <Icon icon="mdi:chevron-right" class="action-arrow" />
        </div>

        <div class="action-card" @click="
          $router.push(
            `/student/courses/${route.params.semester}/${route.params.promotionId}/${module._id}/resources`,
          )
          ">
          <div class="action-icon">
            <Icon icon="mdi:library-shelves" />
          </div>
          <div class="action-content">
            <h4>Ressources</h4>
            <p>Accédez aux supports de cours</p>
          </div>
          <Icon icon="mdi:chevron-right" class="action-arrow" />
        </div>
      </div>
    </div>
  </div>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import BreadCrumbs from '@/components/ui/BreadCrumbs.vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import { Icon } from '@iconify/vue'
import { ref, watchEffect } from 'vue'
import type ModuleInterface from '@/interfaces/module.interface'
import axios from 'axios'
import { useRoute } from 'vue-router'

const loading = ref<boolean>(false)
const errorMessage = ref<string>('')
const module = ref<ModuleInterface | null>(null)
const route = useRoute()

const fetchModule = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(`/api/v1/modules/by-id/${route.params.moduleId}`)
    module.value = response.data
  } catch (error: any) {
    errorMessage.value = error?.response?.data || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

const formatFileName = (path: string) => {
  return path.split('/').pop() || 'Fichier'
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const icons: { [key: string]: string } = {
    pdf: 'mdi:file-pdf-box',
    doc: 'mdi:file-word-box',
    docx: 'mdi:file-word-box',
    xls: 'mdi:file-excel-box',
    xlsx: 'mdi:file-excel-box',
    ppt: 'mdi:file-powerpoint-box',
    pptx: 'mdi:file-powerpoint-box',
    zip: 'mdi:folder-zip',
    rar: 'mdi:folder-zip',
    txt: 'mdi:file-document-outline',
    jpg: 'mdi:file-image',
    jpeg: 'mdi:file-image',
    png: 'mdi:file-image',
    gif: 'mdi:file-image',
  }
  return icons[ext || ''] || 'mdi:file-outline'
}

const getFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase()
  return ext ? `.${ext}` : 'Fichier'
}

watchEffect(() => {
  if (route.path.includes('grades') || route.path.includes('resources') || route.path.includes('assignments')) return;
  fetchModule()
})
</script>

<style scoped>
.student-module-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  font-family: 'Roboto', sans-serif;
}

/* En-tête */
.module-header-section {
  position: relative;
  overflow: hidden;
  margin-bottom: 2.5rem;
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, #1a252f 0%, #5086c1 50%, #6b9ed6 100%);
  z-index: 1;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  z-index: 2;
}

.header-content {
  position: relative;
  z-index: 3;
  padding: 1.5rem 2rem 2rem;
  color: white;
}

.header-nav {
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.module-icon-wrapper {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.module-icon {
  font-size: 2.5rem;
  color: white;
}

.header-text h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-subtitle {
  font-size: 1.0625rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.95;
  color: white;
}

.header-breadcrumbs {
  opacity: 0.9;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-card {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-text {
  margin-top: 1.5rem;
  font-size: 1.0625rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Contenu */
.module-content {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Carte info module */
.module-info-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.module-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.module-identity {
  flex: 1;
  min-width: 0;
}

.module-code {
  display: inline-block;
  background: rgba(80, 134, 193, 0.1);
  color: var(--primary-color);
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 0.8125rem;
  margin-bottom: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.module-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
  line-height: 1.3;
}

.module-type {
  flex-shrink: 0;
}

.type-badge {
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-lg);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.type-badge.obligatoire {
  background: rgba(46, 204, 113, 0.1);
  color: var(--success-dark);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.type-badge.optionnel {
  background: rgba(255, 165, 2, 0.1);
  color: var(--warning-dark);
  border: 1px solid rgba(255, 165, 2, 0.3);
}

.module-description {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 1.75rem;
}

.module-statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.05), rgba(255, 255, 255, 0.5));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(80, 134, 193, 0.15);
  transition: all 0.3s ease;
}

.stat-box:hover {
  background: rgba(80, 134, 193, 0.08);
  border-color: rgba(80, 134, 193, 0.3);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1.75rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.stat-value {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Section ressources */
.resources-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.75rem;
  color: var(--primary-color);
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.resources-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 1.75rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.resources-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.resources-title svg {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.resources-title h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
}

.files-count {
  background: rgba(80, 134, 193, 0.1);
  color: var(--primary-color);
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.files-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.file-item:hover {
  background: white;
  border-color: var(--primary-color-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.file-icon-container {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  font-size: 1.5rem;
  color: white;
}

.file-details {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.file-name {
  display: block;
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--text-dark);
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-extension {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-weight: 600;
}

.download-button {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: rgba(48, 168, 85, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  transition: all 0.3s ease;
  flex-shrink: 0;
  text-decoration: none;
}

.download-button:hover {
  background: var(--secondary-color);
  color: white;
  transform: scale(1.1);
}

.download-button svg {
  font-size: 1.25rem;
}

.empty-files {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--background-light);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border-light);
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--gray);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-files p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.25rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color-light);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(80, 134, 193, 0.3);
}

.action-icon svg {
  font-size: 1.75rem;
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.375rem 0;
}

.action-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  font-size: 1.5rem;
  color: var(--primary-color);
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .student-module-container {
    padding: 0 1rem 2rem;
  }

  .header-content {
    padding: 1.25rem 1.5rem 1.75rem;
  }

  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .module-icon-wrapper {
    width: 64px;
    height: 64px;
  }

  .module-icon {
    font-size: 2rem;
  }

  .header-text h1 {
    font-size: 1.875rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .module-info-card {
    padding: 1.5rem;
  }

  .module-header-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .module-title {
    font-size: 1.5rem;
  }

  .module-statistics {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .files-list {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .student-module-container {
    padding: 0 1rem 1.5rem;
  }

  .header-content {
    padding: 1rem 1.25rem 1.5rem;
  }

  .module-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .module-icon {
    font-size: 1.75rem;
  }

  .header-text h1 {
    font-size: 1.625rem;
  }

  .module-info-card {
    padding: 1.25rem;
  }

  .module-title {
    font-size: 1.25rem;
  }

  .module-statistics {
    grid-template-columns: 1fr;
  }

  .stat-box {
    padding: 1rem;
  }

  .resources-card {
    padding: 1.25rem;
  }

  .file-item {
    padding: 0.875rem;
    gap: 0.875rem;
  }

  .file-icon-container {
    width: 42px;
    height: 42px;
  }

  .action-card {
    padding: 1.25rem;
  }

  .action-icon {
    width: 48px;
    height: 48px;
  }

  .action-icon svg {
    font-size: 1.5rem;
  }
}
</style>
