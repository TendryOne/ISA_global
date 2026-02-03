<template>
  <section class="dark-process">
    <!-- Fond avec grille -->
    <div class="grid-background"></div>

    <!-- Titre avec accent -->
    <div class="process-header">
      <h2>Processus d'<span class="accent-text">Admission</span></h2>
      <p class="subtitle">Rejoignez l'ISA en 4 étapes claires</p>
    </div>

    <!-- Timeline avec connecteurs -->
    <div class="timeline-container">
      <div class="process-line">
        <div v-for="(step, index) in steps" :key="index" class="step">
          <!-- Marqueur de couleur -->
          <div class="step-marker" :style="`--step-color: ${step.color}`">
            <div class="marker-badge">
              <span>{{ index + 1 }}</span>
            </div>
          </div>

          <!-- Carte d'étape -->
          <div class="step-card">
            <h3>{{ step.title }}</h3>
          </div>

          <!-- Connecteur fléché (sauf dernière étape) -->
          <div class="step-connector" v-if="index < steps.length - 1">
            <div class="connector-line"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bouton CTA vibrant -->
    <button class="vibrant-cta" @click="openApplication">
      <span>Démarrer ma candidature</span>
      <div class="cta-arrow">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
            stroke="currentColor"
            stroke-width="2"
          />
        </svg>
      </div>
    </button>
  </section>
</template>

<script lang="ts" setup>
const steps = [
  {
    title: "Inscription en ligne",
    color: "var(--primary-color)",
  },
  {
    title: "Examen du dossier",
    color: "var(--tertiary-color)",
  },
  {
    title: "Résultat d'admission",
    color: "var(--tertiary-color)",
  },
  {
    title: "Validation de l'inscription",
    color: "var(--secondary-color)",
  },
];
const router = useRouter();

const openApplication = () => {
  router.push("/admission");
};
</script>

<style scoped>
.dark-process {
  position: relative;
  padding: 4rem 1rem;
  background-color: var(--primary-dark);
  color: white;
  overflow: hidden;
}

/* Fond avec grille */
.grid-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.5;
}

/* En-tête */
.process-header {
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.process-header h2 {
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.accent-text {
  color: var(--primary-color);
  font-weight: 600;
}

.subtitle {
  color: var(--gray-light);
  font-size: 1.1rem;
}

/* Conteneur timeline */
.timeline-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  padding: 0 1rem;
}

/* Ligne de processus */
.process-line {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Étape individuelle */
.step {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

/* Marqueur d'étape */
.step-marker {
  flex-shrink: 0;
  margin-right: 1.5rem;
}

.marker-badge {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--step-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: white;
  box-shadow: 0 0 0 4px rgba(var(--step-color), 0.2);
  transition: all 0.3s ease;
}

.step:hover .marker-badge {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px rgba(var(--step-color), 0.3);
}

/* Carte d'étape */
.step-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  width: 150px;
  flex-grow: 1;
  transition: all 0.3s ease;
}

.step:hover .step-card {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.step-card h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  color: white;
}

/* Connecteur entre étapes */
.step-connector {
  position: absolute;
  left: 25px;
  top: 50px;
  height: calc(100% + 2rem);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-line {
  flex-grow: 1;
  width: 2px;
  background: linear-gradient(to bottom, var(--gray-light), transparent);
}

.connector-arrow {
  color: var(--gray-light);
  padding: 5px;
}

/* Bouton CTA */
.vibrant-cta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.2rem 2.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  margin: 3rem auto 0;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  z-index: 2;
  transition: all 0.3s ease;
}

.vibrant-cta:hover {
  background: var(--secondary-color);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.cta-arrow {
  transition: transform 0.3s ease;
}

.vibrant-cta:hover .cta-arrow {
  transform: translateX(5px);
}

/* Version Desktop */
@media (min-width: 768px) {
  .process-line {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .step {
    flex-direction: column;
    align-items: center;
    flex: 1;
  }

  .step-marker {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }

  .step-card {
    text-align: center;
    min-height: 100px;
  }

  .step-connector {
    left: 50%;
    top: 25px;
    width: calc(100% - 50px);
    height: 2px;
    flex-direction: row;
  }

  .connector-line {
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, var(--gray-light), transparent);
  }

  .connector-arrow {
    transform: rotate(90deg);
  }
}

/* Version Mobile */
@media (max-width: 767px) {
  .step {
    width: 100%;
  }
}
</style>
