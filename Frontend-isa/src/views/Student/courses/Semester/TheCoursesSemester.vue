<template>
  <div class="semester-view-container" v-if="!route.params.moduleId">
    <!-- En-tête avec navigation -->
    <div class="semester-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-top">
          <BreadCrumbsBack />
        </div>
        <div class="header-main">
          <div class="semester-icon-wrapper">
            <Icon icon="mdi:bookshelf" class="semester-icon" />
          </div>
          <div class="header-text">
            <h1>{{ getSemesterName(route.params.semester as string) }}</h1>
            <p class="semester-description">Explorez vos modules et progressez dans vos cours</p>
          </div>
        </div>
        <div class="header-bottom">
          <breadCrumbs class="breadcrumb-custom" />
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="semester-content">
      <!-- Loader avec animation -->
      <div v-if="loading" class="loader-container">
        <div class="loader-card">
          <SpinningLoader />
          <p class="loader-text">Chargement des modules...</p>
        </div>
      </div>

      <!-- Erreur -->
      <ErrorComponent v-else-if="errorMessage" :message="errorMessage" @retry="FetchStudentProgression" />

      <!-- Liste des modules -->
      <div v-else-if="progressions.length > 0">
        <div class="modules-header">
          <div class="modules-count">
            <Icon icon="mdi:format-list-bulleted" class="count-icon" />
            <span>{{ progressions.length }} module{{ progressions.length > 1 ? 's' : '' }} disponible{{
              progressions.length > 1 ? 's' : ''
            }}</span>
          </div>
        </div>
        <div class="modules-grid">
          <TheStudentModuleItem v-for="value in progressions" :module="value" :key="value.code" />
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state">
        <div class="empty-icon-wrapper">
          <Icon icon="mdi:book-open-page-variant-outline" class="empty-icon" />
        </div>
        <h3>Aucun module disponible</h3>
        <p>Ce semestre ne contient pas encore de modules.</p>
        <p class="empty-hint">
          Revenez plus tard ou contactez l'administration si vous pensez qu'il s'agit d'une erreur.
        </p>
      </div>
    </div>
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import breadCrumbs from '@/components/ui/BreadCrumbs.vue'
import { useRoute } from 'vue-router'
import type ProggressionInterface from '@/interfaces/progressionModuleInterface'
import { ref, watchEffect } from 'vue'
import axios from 'axios'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import TheProfessorModuleItem from '@/components/modules/TheProfessorModuleItem.vue'
import { Icon } from '@iconify/vue'
import TheStudentModuleItem from '@/components/modules/TheStudentModuleItem.vue'

const progressions = ref<ProggressionInterface[]>([])
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')
const route = useRoute()

const getSemesterName = (label: string): string => {
  const names: Record<string, string> = {
    S1: 'Semestre 1',
    S2: 'Semestre 2',
    S3: 'Semestre 3',
    S4: 'Semestre 4',
    S5: 'Semestre 5',
    S6: 'Semestre 6',
    S7: 'Semestre 7',
    S8: 'Semestre 8',
    S9: 'Semestre 9',
    S10: 'Semestre 10',
  }
  return names[label] || label
}

const FetchStudentProgression = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await axios.get(
      `/api/v1/modules/progression/student/${route.params.promotionId}/${route.params.semester}`,
    )
    progressions.value = response.data
  } catch (error: any) {
    errorMessage.value = error?.response?.data || 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}

watchEffect(async () => {
  if (!route.params.moduleId) {
    await FetchStudentProgression()
  }
})
</script>

<style scoped>
.semester-view-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  font-family: 'Roboto', sans-serif;
}

/* En-tête du semestre */
.semester-header {
  position: relative;
  overflow: hidden;
  margin-bottom: 3rem;
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

.header-top {
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.semester-icon-wrapper {
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

.semester-icon {
  font-size: 2.5rem;
  color: white;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.semester-description {
  font-size: 1.125rem;
  font-weight: 400;
  margin: 0;
  opacity: 0.95;
  color: white;
}

.header-bottom {
  display: flex;
  align-items: center;
}

.breadcrumb-custom {
  opacity: 0.9;
}

/* Contenu principal */
.semester-content {
  min-height: 400px;
}

/* Loader amélioré */
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loader-card {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-lighter);
}

.loader-text {
  margin-top: 1.5rem;
  font-size: 1.125rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* En-tête des modules */
.modules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.08), rgba(255, 255, 255, 0.5));
  border-radius: var(--radius-lg);
  border: 1px solid rgba(80, 134, 193, 0.2);
  border-left: 4px solid var(--primary-color);
}

.modules-count {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.count-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

/* Grille des modules en cartes */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
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

/* État vide amélioré */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  border: 2px dashed var(--gray-lighter);
  max-width: 600px;
  margin: 0 auto;
}

.empty-icon-wrapper {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: linear-gradient(135deg, var(--gray-extra-light), var(--gray-lighter));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  font-size: 4rem;
  color: var(--gray);
  opacity: 0.6;
}

.empty-state h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 1rem 0;
}

.empty-state p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.empty-hint {
  font-size: 0.9375rem;
  color: var(--gray-dark);
  font-style: italic;
  margin-top: 1.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .semester-view-container {
    padding: 0 1rem 2rem;
  }

  .semester-header {
    margin-bottom: 2rem;
  }

  .header-content {
    padding: 1.25rem 1.5rem 1.75rem;
  }

  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }

  .semester-icon-wrapper {
    width: 70px;
    height: 70px;
  }

  .semester-icon {
    font-size: 2rem;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .semester-description {
    font-size: 1rem;
  }

  .modules-header {
    padding: 1rem 1.25rem;
  }

  .modules-count {
    font-size: 1rem;
  }

  .modules-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .empty-state {
    padding: 3rem 1.5rem;
  }

  .empty-icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .empty-icon {
    font-size: 3.5rem;
  }

  .empty-state h3 {
    font-size: 1.5rem;
  }

  .empty-state p {
    font-size: 1rem;
  }

  .loader-card {
    padding: 2.5rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .semester-view-container {
    padding: 0 1rem 1.5rem;
  }

  .header-content {
    padding: 1rem 1.25rem 1.5rem;
  }

  .semester-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .semester-icon {
    font-size: 1.75rem;
  }

  .header-text h1 {
    font-size: 1.75rem;
  }

  .semester-description {
    font-size: 0.9375rem;
  }

  .modules-header {
    padding: 0.875rem 1rem;
  }

  .modules-count {
    font-size: 0.9375rem;
  }

  .count-icon {
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 2.5rem 1rem;
  }

  .empty-icon-wrapper {
    width: 90px;
    height: 90px;
    margin-bottom: 1.5rem;
  }

  .empty-icon {
    font-size: 3rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
  }

  .empty-state p {
    font-size: 0.9375rem;
  }

  .loader-card {
    padding: 2rem 1rem;
  }

  .loader-text {
    font-size: 1rem;
  }
}
</style>
