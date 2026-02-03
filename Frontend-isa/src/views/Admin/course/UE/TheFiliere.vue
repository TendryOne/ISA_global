<template>
  <div class="elite-semester-container" ref="semesterContainer" v-if="!route.params.semester">
    <header class="elite-semester-header">
      <div class="breadcrumb-nav">
        <span class="back-link" @click="goBack()">
          <svg class="back-icon" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          {{ route.params.filiere }}
        </span>
      </div>
      <h1 class="elite-main-title">
        <span class="title-decorator">∥</span>
        Programme académique
        <span class="title-decorator">∥</span>
      </h1>
      <div class="elite-divider">
        <div class="divider-line"></div>
        <div class="divider-ornament">✧</div>
        <div class="divider-line"></div>
      </div>
    </header>

    <div class="elite-semester-grid">
      <article v-for="sem in semesters" :key="sem.code" class="elite-semester-card" :class="{
        'research-semester': sem.cycle === 'Recherche',
        'unavailable-semester': !sem.available
      }">
        <div class="semester-header">
          <div class="semester-badge">
            <span class="badge-text">{{ sem.code }}</span>
          </div>
          <h2 class="semester-title">{{ sem.label }}</h2>
        </div>

        <div class="semester-content">
          <p class="semester-description">{{ sem.details }}</p>

          <!-- Indicateur de disponibilité -->
          <div v-if="!sem.available" class="availability-notice">
            <svg class="availability-icon" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Pas encore disponible</span>
          </div>

          <!-- <div class="semester-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
              </svg>
              <span>{{ sem.credits || '30' }} crédits ECTS</span>
            </div>
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 24 24">
                <path
                  d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
              </svg>
              <span>{{ sem.duration || '15 semaines' }}</span>
            </div>
          </div> -->
        </div>

        <footer class="semester-footer">
          <span class="cycle-tag" :class="sem.cycle.toLowerCase()">{{ sem.cycle }}</span>
          <button class="elite-button" @click="viewDetails(sem)" :disabled="!sem.available"
            :class="{ 'disabled-button': !sem.available }">
            {{ sem.available ? 'Voir les unités' : 'Indisponible' }}
            <svg v-if="sem.available" class="button-icon" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
            <svg v-else class="button-icon" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </button>
        </footer>

        <div class="semester-ornament"></div>
      </article>
    </div>
  </div>
  <router-view />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { semesters } from '@/data/semester'
import { nextTick, onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const semesterContainer = ref<HTMLDivElement | null>(null);

async function scrollToContainer() {
  await nextTick()
  semesterContainer.value!.scrollIntoView({ behavior: 'smooth' });
}

function goBack() {
  router.push('/admin/course/UE')
}

function viewDetails(semester: any) {
  if (!semester.available) return; // Empêche la navigation si non disponible
  router.push(`/admin/course/UE/${route.params.filiere}/${semester.code}`)
}

onMounted(() => {
  scrollToContainer()
})
</script>

<style scoped>
/* Base Styles - Mobile First */
.elite-semester-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'EB Garamond', 'Times New Roman', serif;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--primary-dark);
}

.back-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.elite-semester-header {
  margin-bottom: 2rem;
  text-align: center;
}

.elite-main-title {
  font-size: 1.8rem;
  font-weight: 400;
  color: var(--primary-darker);
  margin: 1rem 0;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title-decorator {
  display: none;
}

.elite-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
}

.divider-line {
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gray-lighter), transparent);
}

.divider-ornament {
  padding: 0 1rem;
  color: var(--primary-color);
  font-size: 1rem;
}

.elite-semester-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.elite-semester-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(128, 128, 128, 0.1);
  transition: all 0.4s ease;
}

.semester-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.semester-badge {
  width: 50px;
  height: 50px;
  background: var(--primary-extra-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.badge-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.semester-title {
  font-size: 1.4rem;
  font-weight: 500;
  color: var(--primary-darker);
  margin: 0;
}

.semester-content {
  margin-bottom: 1.5rem;
}

.semester-description {
  color: var(--gray-dark);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.semester-meta {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--tertiary-dark);
}

.meta-icon {
  width: 16px;
  height: 16px;
  fill: var(--primary-color);
  opacity: 0.8;
}

.semester-footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cycle-tag {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  text-transform: uppercase;
  align-self: flex-start;
}

.cycle-tag.licence {
  background-color: var(--primary-extra-light);
  color: var(--primary-color);
}

.cycle-tag.master {
  background-color: rgba(80, 134, 193, 0.15);
  color: var(--primary-dark);
}

.cycle-tag.recherche {
  background-color: var(--secondary-extra-light);
  color: var(--secondary-dark);
}

.elite-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.elite-button:hover {
  background: var(--primary-color);
  color: white;
}

.button-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.semester-ornament {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s ease;
}

/* Indicateur de disponibilité */
.availability-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 4px;
  color: #856404;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.availability-icon {
  width: 16px;
  height: 16px;
  fill: #856404;
}

/* Style pour les semestres non disponibles */
.unavailable-semester {
  opacity: 0.7;
  position: relative;
}

.unavailable-semester::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%);
  z-index: 1;
  pointer-events: none;
}

.unavailable-semester>* {
  position: relative;
  z-index: 2;
}

/* Bouton désactivé */
.disabled-button {
  background-color: var(--gray-lighter) !important;
  border-color: var(--gray-light) !important;
  color: var(--gray-dark) !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}

.disabled-button:hover {
  background-color: var(--gray-lighter) !important;
  border-color: var(--gray-light) !important;
  color: var(--gray-dark) !important;
  transform: none !important;
}

.disabled-button .button-icon {
  fill: var(--gray-dark) !important;
  transform: none !important;
}

/* Hover Effects */
.elite-semester-card:not(.unavailable-semester):hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: rgba(80, 134, 193, 0.2);
}

.elite-semester-card:not(.unavailable-semester):hover .semester-badge {
  background: var(--primary-color);
}

.elite-semester-card:not(.unavailable-semester):hover .badge-text {
  color: white;
}

.elite-semester-card:not(.unavailable-semester):hover .semester-ornament {
  transform: scaleX(1);
}

.elite-button:not(.disabled-button):hover .button-icon {
  transform: translateX(3px);
}

/* Désactivation des effets hover pour les semestres non disponibles */
.unavailable-semester:hover {
  transform: none !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(128, 128, 128, 0.1) !important;
}

.unavailable-semester:hover .semester-badge {
  background: var(--primary-extra-light) !important;
}

.unavailable-semester:hover .badge-text {
  color: var(--primary-color) !important;
}

.unavailable-semester:hover .semester-ornament {
  transform: scaleX(0) !important;
}

/* Research Semester Special */
.research-semester {
  border-left: 3px solid var(--secondary-color);
}

.research-semester .semester-badge {
  background: var(--secondary-extra-light);
}

.research-semester .badge-text {
  color: var(--secondary-color);
}

.research-semester:not(.unavailable-semester):hover .semester-badge {
  background: var(--secondary-color);
}

.research-semester:not(.unavailable-semester):hover .badge-text {
  color: white;
}

/* Research Semester Special - ajustement pour indisponible */
.unavailable-semester.research-semester:hover .semester-badge {
  background: var(--secondary-extra-light) !important;
}

.unavailable-semester.research-semester:hover .badge-text {
  color: var(--secondary-color) !important;
}

/* Tablet Styles (768px and up) */
@media (min-width: 768px) {
  .elite-semester-container {
    padding: 2rem;
  }

  .elite-main-title {
    font-size: 2.2rem;
    flex-direction: row;
    gap: 1.5rem;
  }

  .title-decorator {
    display: inline;
    font-size: 1.8rem;
    margin-top: -0.3rem;
  }

  .elite-divider {
    max-width: 400px;
  }

  .elite-semester-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  .semester-header {
    flex-direction: row;
    align-items: center;
  }

  .semester-meta {
    flex-direction: row;
    gap: 1.5rem;
  }

  .semester-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .elite-button {
    width: auto;
  }
}

/* Desktop Styles (1024px and up) */
@media (min-width: 1024px) {
  .elite-semester-container {
    padding: 3rem 2.5rem;
  }

  .elite-main-title {
    font-size: 2.6rem;
  }

  .elite-semester-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop Styles (1440px and up) */
@media (min-width: 1440px) {
  .elite-semester-container {
    padding: 4rem 3rem;
  }

  .elite-semester-grid {
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2.5rem;
  }
}

/* Extra Large Screens (1600px and up) */
@media (min-width: 1600px) {
  .elite-semester-container {
    padding: 5rem 4rem;
  }

  .elite-main-title {
    font-size: 3rem;
  }

  .elite-semester-grid {
    gap: 3rem;
  }
}
</style>