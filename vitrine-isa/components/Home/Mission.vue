<template>
  <section class="neo-missions">
    <!-- Fond dynamique -->
    <div class="dynamic-bg">
      <div class="grid-pattern"></div>
      <div class="floating-dots"></div>
    </div>

    <!-- Conteneur principal -->
    <div class="missions-container">
      <!-- Titre pour mobile -->
      <h2 class="mobile-section-title">
        <span class="title-decorator"></span>
        <span>NOS</span>
        <span class="highlight-word">Missions</span>
      </h2>

      <!-- Navigation verticale -->
      <div class="mission-nav">
        <h2 class="section-title">
          <span class="title-decorator"></span>
          <span>NOS</span>
          <span class="highlight-word">Missions</span>
        </h2>

        <nav class="nav-tabs">
          <button v-for="(mission, index) in missions" :key="index" @click="activeMission = index"
            :class="{ active: activeMission === index }" :style="`--accent: ${mission.color}`">
            <span class="tab-number">0{{ index + 1 }}</span>
            <span class="tab-title">{{ mission.shortTitle }}</span>
            <span class="tab-underline"></span>
          </button>
        </nav>
      </div>

      <!-- Contenu de la mission active -->
      <div class="mission-content">
        <div class="content-wrapper" :style="`border-color: ${missions[activeMission].color}`">
          <div class="mission-header">
            <h3 class="mission-title">
              <span class="title-number">0{{ activeMission + 1 }}.</span>
              {{ missions[activeMission].title }}
            </h3>
            <div class="mission-icon">
              <Icon :name="missions[activeMission].icon" />
            </div>
          </div>

          <div class="mission-description">
            <p v-for="(paragraph, pIndex) in missions[activeMission].description" :key="pIndex">
              {{ paragraph }}
            </p>
          </div>

          <div class="mission-footer">
            <div class="progress-indicator">
              <span>{{ activeMission + 1 }}/{{ missions.length }}</span>
              <div class="progress-track">
                <div class="progress-bar"
                  :style="`width: ${((activeMission + 1) / missions.length) * 100}%; background: ${missions[activeMission].color}`">
                </div>
              </div>
            </div>

            <div class="navigation-buttons">
              <button @click="prevMission" :disabled="activeMission === 0" class="nav-button prev">
                <Icon name="mdi:chevron-left" />
              </button>
              <button @click="nextMission" :disabled="activeMission === missions.length - 1" class="nav-button next">
                <Icon name="mdi:chevron-right" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const activeMission = ref(0)

const missions = [
  {
    shortTitle: "Épanouissement",
    title: "Promouvoir le développement et l'épanouissement de l'étudiant",
    description: [
      "Nous nous engageons à cultiver un environnement d'apprentissage qui favorise l'autonomie, la responsabilisation et le développement personnel de chaque étudiant.",
      "En encourageant l'initiative et la créativité, nous préparons des acteurs proactifs et adaptatifs dans un monde en constante évolution."
    ],
    color: "var(--primary-color)",
    icon: "mdi:account-group"
  },
  {
    shortTitle: "Insertion Pro",
    title: "Aider les jeunes à construire leur savoir et à s'insérer professionnellement",
    description: [
      "Notre mission inclut de fournir une éducation de qualité qui dépasse les frontières du savoir académique. Nous visons à doter nos étudiants des compétences pratiques et professionnelles nécessaires pour réussir dans leur carrière.",
      "En mettant l'accent sur l'apprentissage expérientiel et les stages, nous assurons une transition fluide de la théorie à la pratique."
    ],
    color: "var(--secondary-color)",
    icon: "mdi:briefcase-account"
  },
  {
    shortTitle: "Citoyenneté",
    title: "Préparer les étudiants à leur rôle de citoyens responsables",
    description: [
      "Nous croyons fermement en l'importance de former des citoyens engagés, dotés d'une conscience sociale et éthique. À travers nos programmes académiques et nos initiatives communautaires, nous encourageons la solidarité, l'éthique et la responsabilité civique chez nos étudiants",
      "Nous les guidons pour qu'ils deviennent des leaders qui contribuent positivement à la société."
    ],
    color: "var(--tertiary-color)",
    icon: "mdi:handshake"
  },
  {
    shortTitle: "Transformation",
    title: "Participer à la transformation de la société malagasy",
    description: [
      "moteurs de changement dans notre société. Nous valorisons la recherche innovante, la diffusion des connaissances et la collaboration avec les parties prenantes locales",
      "Notre objectif est de catalyser le développement socio-économique de la région d'Ambatomirahavavy et au-delà, en formant des professionnels compétents et conscients de leur impact."
    ],
    color: "var(--secondary-color)",
    icon: "mdi:earth-arrow-right"
  },
  {
    shortTitle: "Transmission",
    title: "Transmettre savoir, savoir-faire et savoir-être",
    description: [
      "Nous nous efforçons de former des diplômés non seulement bien informés, mais également capables de mettre en pratique leurs connaissances de manière efficace et éthique.",
      "Notre vision est de voir nos étudiants jouer un rôle actif et direct dans l'émergence et la croissance durable de leur région, en répondant aux besoins locaux avec expertise et engagement"
    ],
    color: "var(--primary-color)",
    icon: "mdi:lightbulb-on"
  }
];

const nextMission = () => {
  if (activeMission.value < missions.length - 1) {
    activeMission.value++;
  }
};

const prevMission = () => {
  if (activeMission.value > 0) {
    activeMission.value--;
  }
};
</script>

<style scoped>
.neo-missions {
  position: relative;
  padding: 3rem 1rem;
  background-color: #f8fafc;
  overflow: hidden;
  color: #1e293b;
}

.dynamic-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.4;
}

.grid-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(30, 41, 59, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 41, 59, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
}

.floating-dots {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at center,
      rgba(30, 41, 59, 0.1) 1px,
      transparent 1px);
  background-size: 20px 20px;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 100px 100px;
  }
}

.missions-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.mobile-section-title {
  display: none;
}

.section-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.section-title span {
  line-height: 1.2;
}

.highlight-word {
  color: var(--accent);
  position: relative;
  display: inline-block;
}

.title-decorator {
  width: 40px;
  height: 4px;
  background: linear-gradient(90deg, #4F46E5, #10B981);
  margin-bottom: 1rem;
  border-radius: 2px;
}

.nav-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.nav-tabs button {
  background: transparent;
  border: none;
  color: rgba(30, 41, 59, 0.7);
  text-align: left;
  padding: 0.8rem 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.nav-tabs button.active {
  color: #1e293b;
  font-weight: 500;
}

.tab-number {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: var(--accent);
}

.tab-title {
  font-size: 1.1rem;
  font-weight: 500;
  transition: transform 0.3s ease;
}

.nav-tabs button:hover .tab-title {
  transform: translateX(8px);
}

.tab-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.3s ease;
}

.nav-tabs button.active .tab-underline,
.nav-tabs button:hover .tab-underline {
  width: 100%;
}

.mission-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.content-wrapper {
  border-left: 3px solid;
  padding-left: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mission-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.mission-title {
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
  flex: 1;
}

.title-number {
  color: var(--accent);
  margin-right: 0.3rem;
}

.mission-icon {
  font-size: 2rem;
  color: var(--accent);
  opacity: 0.9;
  margin-left: 1rem;
}

.mission-description {
  flex-grow: 1;
  margin-bottom: 1.5rem;
}

.mission-description p {
  margin-bottom: 1rem;
  line-height: 1.7;
  color: #475569;
  font-size: 0.95rem;
}

.mission-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: #64748b;
}

.progress-track {
  width: 80px;
  height: 3px;
  background: rgba(30, 41, 59, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.5s ease, background 0.5s ease;
}

.navigation-buttons {
  display: flex;
  gap: 0.5rem;
}

.nav-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(30, 41, 59, 0.2);
  background: transparent;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-button:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.05);
  transform: scale(1.05);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .missions-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .mission-nav {
    padding: 0;

  }

  .section-title {
    display: none;
  }

  .mobile-section-title {
    display: flex;
    flex-direction: column;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }

  .nav-tabs {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    overflow-x: auto;
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    gap: 1rem;
    scrollbar-width: none;

  }

  .nav-tabs::-webkit-scrollbar {
    display: none;
    /* Chrome/Safari */
  }

  .nav-tabs button {
    min-width: 160px;
    padding: 0.8rem 1rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .tab-title {
    font-size: 1rem;
    white-space: nowrap;
  }

  .mission-content {
    margin: 0 1rem;
  }
}

@media (max-width: 768px) {
  .neo-missions {
    padding: 2rem 0;
  }

  .mission-content {
    padding: 1.2rem;
  }

  .content-wrapper {
    padding-left: 1rem;
  }

  .mission-title {
    font-size: 1.2rem;
  }

  .mission-icon {
    font-size: 1.8rem;
  }

  .mission-description p {
    font-size: 0.9rem;
  }
}

@media (max-width: 576px) {
  .mobile-section-title {
    font-size: 1.5rem;
    padding: 0 1rem;
  }

  .nav-tabs button {
    min-width: 140px;
    padding: 0.6rem 0.8rem;
  }

  .mission-header {
    flex-direction: column;
    gap: 0.8rem;
  }

  .mission-icon {
    margin-left: 0;
    align-self: flex-start;
  }

  .mission-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .navigation-buttons {
    align-self: flex-end;
  }
}

@media (max-width: 400px) {
  .nav-tabs button {
    min-width: 120px;
  }

  .tab-title {
    font-size: 0.9rem;
  }

  .mission-title {
    font-size: 1.1rem;
  }
}
</style>