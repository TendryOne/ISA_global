<template>
  <div class="luxury-levels-container" v-if="!route.params.level">
    <!-- Header avec navigation -->
    <header class="levels-header">
      <BreadCrumbsBack />

      <div class="header-content">
        <h1 class="luxury-title">
          <span class="title-main">Choisissez le Niveau Académique</span>
          <span class="title-subtitle">{{ getFieldName(route.params.filiere as string) }}</span>
        </h1>

        <div class="header-divider">
          <div class="divider-line"></div>
          <div class="divider-ornament">✦</div>
          <div class="divider-line"></div>
        </div>
      </div>
    </header>

    <!-- Grid des niveaux -->
    <div class="levels-grid">
      <article v-for="(niveau, index) in levelAvailable" :key="niveau.value" class="level-card"
        :class="[`cycle-${getCycle(niveau.value)}`, `level-${index + 1}`, { 'unavailable-level': !niveau.available }]"
        @click="selectLevel(niveau)" @mouseenter="hoverLevel = niveau.value" @mouseleave="hoverLevel = null">

        <!-- Éléments décoratifs -->
        <div class="card-decoration">
          <div class="decoration-shape shape-1"></div>
          <div class="decoration-shape shape-2"></div>
        </div>

        <!-- Badge du niveau -->
        <div class="level-badge">
          <span class="badge-text">{{ niveau.value }}</span>
          <div class="badge-glow"></div>
        </div>

        <!-- Contenu principal -->
        <div class="card-content">
          <h2 class="level-title">{{ niveau.label }}</h2>

          <!-- Indicateur de disponibilité -->
          <div v-if="!niveau.available" class="availability-notice">
            <svg class="availability-icon" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Pas encore disponible</span>
          </div>
          <div v-else class="availability-placeholder"></div>
        </div>

        <!-- CTA -->
        <button class="level-cta" :class="{ 'disabled-cta': !niveau.available }">
          <span>{{ niveau.available ? 'Accéder' : 'Indisponible' }}</span>
          <svg class="cta-icon" viewBox="0 0 24 24">
            <path v-if="niveau.available" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            <path v-else
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </button>

        <!-- Effets de hover -->
        <div class="card-hover"></div>
      </article>
    </div>
  </div>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import { levelAvailable } from '@/data/levelData';

const route = useRoute();
const router = useRouter();
const hoverLevel = ref<string | null>(null);

function selectLevel(niveau: any) {
  if (!niveau.available) return; // Empêche la navigation si non disponible
  router.push(`/admin/suivi-paiements/${route.params.filiere}/${niveau.value}`);
}

function getCycle(niveau: string): string {
  return niveau.startsWith('L') ? 'licence' : 'master';
}

function getFieldName(field: string): string {
  const fields: { [key: string]: string } = {
    'informatique': 'Informatique',
    'gestion': 'Gestion',
    'btp': 'Bâtiment et Travaux Publics'
  };
  return fields[field] || field;
}
</script>

<style scoped>
.luxury-levels-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  background: linear-gradient(135deg, var(--background-light) 0%, var(--white) 50%, var(--gray-extra-light) 100%);
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* Header */
.levels-header {
  margin-bottom: 3rem;
}

.breadcrumb-nav {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  color: var(--text-dark);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.back-button:hover {
  border-color: var(--primary-color);
  transform: translateX(-5px);
  box-shadow: var(--shadow-md);
}

.back-icon {
  width: 20px;
  height: 20px;
  fill: var(--primary-color);
}

.back-text {
  font-weight: 500;
  text-transform: capitalize;
}

.header-content {
  text-align: center;
}

.luxury-title {
  margin-bottom: 1.5rem;
}

.title-main {
  display: block;
  font-size: 2.5rem;
  font-weight: 300;
  background: linear-gradient(135deg, var(--primary-darker), var(--primary-color));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.title-subtitle {
  display: block;
  font-size: 1.2rem;
  color: var(--text-secondary);
  font-weight: 400;
  text-transform: capitalize;
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  max-width: 300px;
  margin: 0 auto;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
}

.divider-ornament {
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* Grid des niveaux */
.levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

/* Cartes de niveau */
.level-card {
  position: relative;
  background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
  border-radius: var(--radius-xl);
  padding: 2.5rem 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

/* Style pour les niveaux non disponibles */
.unavailable-level {
  opacity: 0.7;
  position: relative;
}

.unavailable-level::before {
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

.unavailable-level>* {
  position: relative;
  z-index: 2;
}

/* Éléments décoratifs */
.card-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.03;
  transition: all 0.6s ease;
}

.shape-1 {
  width: 100px;
  height: 100px;
  background: var(--primary-color);
  top: -25px;
  right: -25px;
}

.shape-2 {
  width: 60px;
  height: 60px;
  background: var(--secondary-color);
  bottom: -15px;
  left: -15px;
}

/* Badge du niveau */
.level-badge {
  position: relative;
  width: 70px;
  height: 70px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  transition: all 0.4s ease;
}

.level-card.cycle-licence .level-badge {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  box-shadow: 0 8px 25px rgba(80, 134, 193, 0.3);
}

.level-card.cycle-master .level-badge {
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  box-shadow: 0 8px 25px rgba(48, 168, 85, 0.3);
}

.badge-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--white);
  position: relative;
  z-index: 2;
}

.badge-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-lg);
  background: inherit;
  opacity: 0;
  transition: opacity 0.4s ease;
}

/* Contenu */
.card-content {
  flex: 1;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.level-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0;
  line-height: 1.2;
  text-align: center;
}

/* Indicateur de disponibilité */
.availability-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: rgba(255, 193, 7, 0.08);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: 4px;
  color: #856404;
  font-size: 0.8rem;
  position: relative;
  z-index: 2;
  width: fit-content;
  margin: 0 auto;
}

.availability-icon {
  width: 14px;
  height: 14px;
  fill: #856404;
}

.availability-placeholder {
  height: 40px;
  visibility: hidden;
}

/* CTA */
.level-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-secondary);
  color: var(--text-secondary);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  margin-top: auto;
}

.disabled-cta {
  background-color: var(--gray-lighter) !important;
  border-color: var(--gray-light) !important;
  color: var(--gray-dark) !important;
  cursor: not-allowed !important;
}

.cta-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  transition: transform 0.3s ease;
}

/* Effets de hover */
.card-hover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.hover-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(80, 134, 193, 0.05) 0%, transparent 70%);
  border-radius: var(--radius-xl);
}

/* États de hover - uniquement pour les niveaux disponibles */
.level-card:not(.unavailable-level):hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-dark);
  border-color: var(--primary-color-light);
}

.level-card:not(.unavailable-level):hover .decoration-shape {
  transform: scale(1.2);
}

.level-card:not(.unavailable-level):hover .level-badge {
  transform: scale(1.1) rotate(5deg);
}

.level-card:not(.unavailable-level):hover .badge-glow {
  opacity: 0.4;
}

.level-card:not(.unavailable-level):hover .level-cta:not(.disabled-cta) {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.level-card:not(.unavailable-level):hover .cta-icon:not(.disabled-cta) {
  transform: translateX(3px);
}

.level-card:not(.unavailable-level):hover .card-hover {
  opacity: 1;
}

/* Désactivation des effets hover pour les niveaux non disponibles */
.unavailable-level:hover {
  transform: none !important;
  box-shadow: var(--shadow-lg) !important;
  border-color: var(--border-light) !important;
  cursor: not-allowed;
}

.unavailable-level:hover .decoration-shape {
  transform: none !important;
}

.unavailable-level:hover .level-badge {
  transform: none !important;
}

.unavailable-level:hover .badge-glow {
  opacity: 0 !important;
}

.unavailable-level:hover .level-cta {
  transform: none !important;
}

.unavailable-level:hover .cta-icon {
  transform: none !important;
}

.unavailable-level:hover .card-hover {
  opacity: 0 !important;
}

/* Indicateur de hover */
.hover-indicator {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.indicator-content {
  background: var(--white);
  color: var(--text-dark);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-light);
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.indicator-dot.cycle-licence {
  background: var(--primary-color);
}

.indicator-dot.cycle-master {
  background: var(--secondary-color);
}

/* Animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .luxury-levels-container {
    padding: 1.5rem 1rem;
  }

  .title-main {
    font-size: 2rem;
  }

  .levels-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .level-card {
    padding: 2rem 1.5rem;
    min-height: 250px;
  }
}

@media (min-width: 1024px) {
  .levels-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1440px) {
  .levels-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>