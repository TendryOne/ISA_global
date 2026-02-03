<template>
  <div class="formations-page">
    <!-- Hero Section Élite -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>
      </div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-breadcrumb">
            <span>Accueil</span>
            <Icon name="ph:caret-right" />
            <span class="current">Formations Universitaires</span>
          </div>
          <h1 class="hero-title">
            Formations <span class="accent">d'Excellence</span>
          </h1>
          <p class="hero-subtitle">
            Des programmes académiques conçus pour former les leaders de demain
          </p>
          <div class="hero-credentials">
            <div class="credential-item">
              <Icon name="ph:seal-check" class="credential-icon" />
              <span>Diplômes Bac+3 reconnus</span>
            </div>
            <div class="credential-item">
              <Icon name="ph:briefcase" class="credential-icon" />
              <span>Stages en entreprise</span>
            </div>
            <div class="credential-item">
              <Icon name="ph:users" class="credential-icon" />
              <span>Encadrement personnalisé</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Navigation Filières Premium -->
    <section class="programs-navigation">
      <div class="container">
        <div class="navigation-header" v-if="!activeFiliere">
          <div class="selection-step-badge">
            <Icon name="ph:number-circle-one-fill" />
            <span>Étape 1 : Choisissez votre filière</span>
          </div>
          <h2>Nos Filières d'Excellence</h2>
          <p>Choisissez le parcours qui vous prépare à façonner votre avenir</p>
        </div>

        <!-- Vue normale : toutes les filières -->
        <div class="programs-grid" v-if="!activeFiliere">
          <div
            v-for="filiere in filieres"
            :key="filiere.id"
            class="program-card"
            @click="setActiveFiliere(filiere.id)"
          >
            <div class="card-gradient"></div>
            <div class="card-content">
              <div class="program-header">
                <div class="program-icon">
                  <Icon :name="filiere.icon" />
                </div>
                <div class="program-badge">Licence Professionnelle</div>
              </div>
              <h3 class="program-title">{{ filiere.nom }}</h3>
              <p class="program-description">
                {{ getProgramDescription(filiere.id) }}
              </p>
              <div class="selection-indicator">
                <Icon name="ph:check-circle" />
              </div>
            </div>
          </div>
        </div>

        <!-- Vue avec filière sélectionnée -->
        <div v-if="activeFiliere" class="selected-filiere-section">
          <!-- Bouton de retour -->
          <button class="btn-back" @click="resetFiliere">
            <Icon name="ph:arrow-left" />
            <span>Retour aux filières</span>
          </button>

          <div class="selected-filiere-card">
            <div class="selected-card-gradient"></div>
            <div class="selected-card-content">
              <div class="selected-header">
                <div class="selected-icon">
                  <Icon
                    :name="
                      filieres.find((f) => f.id === activeFiliere)?.icon || ''
                    "
                  />
                </div>
                <div class="selected-info">
                  <div class="selected-badge">Filière sélectionnée</div>
                  <h2 class="selected-title">
                    {{ filieres.find((f) => f.id === activeFiliere)?.nom }}
                  </h2>
                  <p class="selected-description">
                    {{ getProgramDescription(activeFiliere) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bouton pour afficher les autres filières -->
          <button class="btn-other-filieres" @click="toggleOtherFilieres">
            <Icon
              :name="showOtherFilieres ? 'ph:caret-up' : 'ph:squares-four'"
            />
            <span>{{
              showOtherFilieres ? "Masquer" : "Voir les autres filières"
            }}</span>
          </button>

          <!-- Autres filières (miniatures) -->
          <transition name="slide-fade">
            <div v-if="showOtherFilieres" class="other-filieres-grid">
              <div
                v-for="filiere in filieres.filter(
                  (f) => f.id !== activeFiliere
                )"
                :key="filiere.id"
                class="mini-program-card"
                @click="setActiveFiliere(filiere.id)"
              >
                <div class="mini-card-icon">
                  <Icon :name="filiere.icon" />
                </div>
                <div class="mini-card-info">
                  <h4>{{ filiere.nom }}</h4>
                  <p>{{ getProgramDescription(filiere.id) }}</p>
                </div>
                <Icon name="ph:arrow-right" class="mini-card-arrow" />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- Contenu de la Filière Active -->
    <div v-if="activeFiliereData" class="filiere-content">
      <div class="container">
        <!-- Objectifs Stratégiques -->
        <section class="objectives-section">
          <div class="section-header">
            <div class="selection-step-badge">
              <Icon name="ph:number-circle-two-fill" />
              <span>Découvrez la formation</span>
            </div>
            <h2>Notre Vision Pédagogique</h2>
            <p>
              Une formation d'excellence pour votre réussite professionnelle
            </p>
          </div>
          <div class="objectives-grid">
            <div class="objective-card">
              <div class="objective-icon">
                <Icon name="ph:target" />
              </div>
              <h3>Expertise Métier</h3>
              <p>
                Acquisition de compétences pointues directement applicables en
                entreprise
              </p>
            </div>
            <div class="objective-card">
              <div class="objective-icon">
                <Icon name="ph:lightbulb" />
              </div>
              <h3>Innovation & Leadership</h3>
              <p>
                Développement de l'esprit d'innovation et des capacités
                managériales
              </p>
            </div>
            <div class="objective-card">
              <div class="objective-icon">
                <Icon name="ph:globe" />
              </div>
              <h3>Ouverture Internationale</h3>
              <p>
                Formation tournée vers les enjeux globaux et les marchés
                internationaux
              </p>
            </div>
          </div>
        </section>

        <!-- Programme Académique -->
        <section class="curriculum-section">
          <div class="section-header">
            <h2>Programme Académique</h2>
            <p>Un cursus complet et progressif pour votre excellence</p>
          </div>

          <FormationsTeachingUnits
            :teaching-units="teachingUnits"
            @show-modules="handleShowModules"
          />
        </section>

        <!-- Débouchés d'Excellence -->
        <section class="careers-section">
          <div class="careers-header">
            <div class="selection-step-badge">
              <Icon name="ph:number-circle-three-fill" size="28" />
              <span>Étape 3: Vos perspectives de carrière</span>
            </div>
            <h2>Débouchés Professionnels</h2>
            <p>Des carrières à fort potentiel dans des secteurs porteurs</p>
          </div>
          <div class="careers-grid">
            <div
              v-for="(debouche, index) in activeFiliereData.debouches"
              :key="index"
              class="career-card"
            >
              <div class="career-content">
                <div class="career-number">0{{ index + 1 }}</div>
                <h4>{{ debouche }}</h4>
                <div class="career-demand">
                  <Icon name="ph:trend-up" />
                  <span>Forte employabilité</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Processus d'Admission -->
        <section class="admission-section">
          <div class="admission-card">
            <div class="admission-content">
              <div class="admission-header">
                <div class="selection-step-badge">
                  <Icon name="ph:number-circle-four-fill" size="28" />
                  <span>Étape 4: Conditions d'admission</span>
                </div>
                <h2>Admission & Conditions</h2>
                <div class="admission-badge">
                  <Icon name="ph:seal-check" />
                  <span>Recrutement sur dossier</span>
                </div>
              </div>
              <div class="admission-details">
                <div class="requirements">
                  <h3>Profil requis</h3>
                  <div class="requirements-list">
                    <div
                      v-for="(prerequis, index) in activeFiliereData.prerequis"
                      :key="index"
                      class="requirement"
                    >
                      <Icon name="ph:check-circle" />
                      <span>{{ prerequis }}</span>
                    </div>
                  </div>
                </div>
                <div class="admission-cta">
                  <div class="cta-content">
                    <div
                      class="selection-step-badge"
                      style="margin-bottom: 1rem"
                    >
                      <Icon name="ph:number-circle-five-fill" size="28" />
                      <span>Étape 5: Postulez maintenant</span>
                    </div>
                    <h3>Prêt à nous rejoindre ?</h3>
                    <p>
                      Rejoignez notre communauté d'excellence pour la prochaine
                      rentrée universitaire
                    </p>
                    <NuxtLink to="/Admission" class="btn-cta">
                      <Icon name="ph:rocket-launch" />
                      <span>Démarrer ma candidature</span>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Modules Modal -->
    <FormationsModulesModal
      :is-visible="showModulesModal"
      :unit="selectedUnit"
      @close="closeModulesModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { formationsData } from "~/data/Formation";
import axios from "axios";
import type { TeachingUnitInterface } from "~/interfaces/teachingUnit.interface";

// Types
type FiliereId = "gestion" | "btp" | "informatique";

interface Filiere {
  id: FiliereId;
  nom: string;
  icon: string;
}

// State
const activeFiliere = ref<FiliereId | null>(null);
const teachingUnits = ref<TeachingUnitInterface[]>([]);
const selectedUnit = ref<TeachingUnitInterface | null>(null);
const showModulesModal = ref(false);
const showOtherFilieres = ref(false);

const filieres: Filiere[] = [
  {
    id: "gestion",
    nom: "Gestion",
    icon: "ph:chart-line-up",
  },
  {
    id: "btp",
    nom: "Bâtiment et Travaux Publics",
    icon: "ph:buildings",
  },
  {
    id: "informatique",
    nom: "Informatique",
    icon: "ph:code",
  },
];

// Methods
const getTeachingUnits = async (): Promise<void> => {
  try {
    const response = await axios.get(
      `/api/v1/teachingUnits/field/${activeFiliere.value}`
    );
    teachingUnits.value = response.data;
  } catch (error) {
    console.error("Error fetching teaching units:", error);
  }
};

const handleShowModules = (unit: TeachingUnitInterface): void => {
  selectedUnit.value = unit;
  showModulesModal.value = true;
};

const closeModulesModal = (): void => {
  showModulesModal.value = false;
  selectedUnit.value = null;
};

// Computed
const activeFiliereData = computed(() => {
  if (!activeFiliere.value) return null;
  return formationsData[activeFiliere.value as keyof typeof formationsData];
});

// Functions
function setActiveFiliere(filiereId: FiliereId): void {
  activeFiliere.value = filiereId;
  showOtherFilieres.value = false;
  // Scroll vers la section programmes après une petite animation
  nextTick(() => {
    setTimeout(() => {
      const programsSection = document.querySelector(".programs-navigation");
      if (programsSection) {
        const offset = 100; // Offset pour laisser de l'espace en haut
        const elementPosition = programsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100);
  });
}

function toggleOtherFilieres(): void {
  showOtherFilieres.value = !showOtherFilieres.value;
}

function resetFiliere(): void {
  activeFiliere.value = null;
  showOtherFilieres.value = false;
  // Scroll vers le haut de la section programmes
  nextTick(() => {
    setTimeout(() => {
      const programsSection = document.querySelector(".programs-navigation");
      if (programsSection) {
        programsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  });
}

function getProgramDescription(filiereId: FiliereId): string {
  const descriptions = {
    gestion:
      "Formation en management, entrepreneuriat et stratégie d'entreprise",
    btp: "Programme en génie civil, gestion de projets et innovations dans le BTP",
    informatique:
      "Parcours en développement, cybersécurité et nouvelles technologies",
  };
  return descriptions[filiereId];
}

function downloadBrochure(): void {
  // Logique pour télécharger la brochure
  console.log("Téléchargement de la brochure pour:", activeFiliere.value);
}

watch(
  () => activeFiliere.value,
  (newValue) => {
    if (newValue) {
      getTeachingUnits();
    }
  }
);

useHead({
  title: "Formations",
  meta: [
    {
      name: "description",
      content:
        "Découvrez nos formations professionnelles et licences à Madagascar : Gestion d'entreprise, BTP, Informatique. Des programmes adaptés au marché malgache.",
    },
    {
      name: "keywords",
      content:
        "formations Madagascar, licence professionnelle, formation BTP, gestion entreprise, informatique, études supérieures Madagascar, diplôme reconnu, insertion professionnelle",
    },
    {
      property: "og:title",
      content: "Nos Formations - Institut supérieur d'Ambatomirahavavy",
    },
    {
      property: "og:description",
      content:
        "Découvrez nos programmes de formation professionnelle et licences adaptés au contexte malgache.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.isa-ambato.mg/formations" },
    { property: "og:image", content: "https://www.isa-ambato.mg/logo-seo.jpg" },
    { property: "og:locale", content: "fr_MG" },

    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Formations Professionnelles - ISA Ambato",
    },
    {
      name: "twitter:description",
      content:
        "Licences et formations qualifiantes pour votre avenir professionnel à Madagascar.",
    },
    {
      name: "twitter:image",
      content: "https://www.isa-ambato.mg/logo-seo.jpg",
    },
  ],
  link: [{ rel: "canonical", href: "https://isa-ambato.mg/formations" }],
});
</script>

<style scoped>
.formations-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 50%, #f8fafc 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section Élite */
.hero-section {
  position: relative;
  padding: 6rem 0 4rem;
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
}

.hero-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -100px;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: 10%;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
}

.hero-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.hero-breadcrumb .current {
  opacity: 1;
  font-weight: 600;
}

.hero-title {
  font-size: clamp(2.2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-title .accent {
  background: linear-gradient(135deg, #fff, var(--secondary-color-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2.5vw, 1.3rem);
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
}

.hero-credentials {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: 500;
}

.credential-icon {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Programs Navigation Élite */
.programs-navigation {
  padding: 4rem 0;
  background: var(--white);
}

.navigation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.selection-step-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(80, 134, 193, 0.3);
  animation: fadeInUp 0.6s ease-out;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.selection-step-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(80, 134, 193, 0.4);
}

.selection-step-badge svg {
  font-size: 1.3rem;
  animation: pulse 2s ease-in-out infinite;
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.navigation-header h2 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}

.navigation-header p {
  font-size: 1.1rem;
  color: var(--gray);
  max-width: 600px;
  margin: 0 auto;
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.program-card {
  position: relative;
  background: var(--white);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--gray-super-light);
}

.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.program-card.active .card-gradient {
  opacity: 0.05;
}

.program-card:hover .card-gradient {
  opacity: 0.03;
}

.card-content {
  position: relative;
  z-index: 2;
  padding: 2.5rem;
}

.program-card.active {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color-light);
}

.program-card:hover:not(.active) {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.program-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
}

.program-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--primary-color-extra-light);
  color: var(--primary-color);
}

.program-title {
  font-size: 1.4rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.program-description {
  color: var(--gray);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.program-features {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.selection-indicator {
  opacity: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
  transition: opacity 0.3s ease;
}

.program-card.active .selection-indicator {
  opacity: 1;
}

/* Selected Filiere Section */
.selected-filiere-section {
  margin-top: 2rem;
}

/* Bouton de retour */
.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.75rem;
  background: transparent;
  color: var(--primary-color);
  border: 2px solid var(--primary-color-light);
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.btn-back:hover {
  background: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
  transform: translateX(-5px);
  box-shadow: 0 8px 20px rgba(80, 134, 193, 0.3);
}

.btn-back svg {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-back:hover svg {
  transform: translateX(-3px);
}

.selected-filiere-card {
  position: relative;
  background: var(--white);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  margin-bottom: 2rem;
  animation: expandCard 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes expandCard {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.selected-card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  opacity: 0.08;
}

.selected-card-content {
  position: relative;
  z-index: 2;
  padding: 3rem;
}

.selected-header {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.selected-icon {
  width: 6rem;
  height: 6rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  flex-shrink: 0;
  box-shadow: 0 10px 30px rgba(80, 134, 193, 0.3);
}

.selected-info {
  flex: 1;
}

.selected-badge {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: var(--secondary-color-light);
  color: var(--secondary-color);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.selected-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}

.selected-description {
  font-size: 1.1rem;
  color: var(--gray);
  line-height: 1.6;
}

/* Bouton Retour aux Filières */
.btn-back-to-filieres {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--primary-color);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.btn-back-to-filieres:hover {
  background: var(--primary-color-extra-light);
  transform: translateX(-5px);
}

.btn-back-to-filieres svg {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.btn-back-to-filieres:hover svg {
  transform: translateX(-3px);
}

/* Bouton Autres Filières */
.btn-other-filieres {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1.25rem 2rem;
  background: var(--white);
  color: var(--primary-color);
  border: 2px solid var(--primary-color-light);
  border-radius: 16px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.btn-other-filieres:hover {
  background: var(--primary-color-extra-light);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(80, 134, 193, 0.2);
}

.btn-other-filieres svg {
  font-size: 1.3rem;
}

/* Autres Filières (Mini Cards) */
.other-filieres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.mini-program-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--white);
  border: 2px solid var(--gray-super-light);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mini-program-card:hover {
  border-color: var(--primary-color);
  transform: translateX(8px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.mini-card-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  flex-shrink: 0;
}

.mini-card-info {
  flex: 1;
}

.mini-card-info h4 {
  font-size: 1.1rem;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.mini-card-info p {
  font-size: 0.9rem;
  color: var(--gray);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mini-card-arrow {
  font-size: 1.5rem;
  color: var(--primary-color);
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.mini-program-card:hover .mini-card-arrow {
  transform: translateX(5px);
}

/* Transition Animations */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Formation Header Premium */
.formation-header {
  position: relative;
  margin-bottom: 4rem;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.header-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

.header-content {
  position: relative;
  z-index: 2;
  padding: 3rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}

.formation-info h2 {
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.formation-tagline {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
}

.formation-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-weight: 500;
}

.formation-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--white);
  color: var(--primary-color);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: transparent;
  color: var(--white);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Objectives Section */
.objectives-section {
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.2rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--gray);
}

.objectives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.objective-card {
  background: var(--white);
  padding: 3rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-super-light);
  transition: transform 0.3s ease;
}

.objective-card:hover {
  transform: translateY(-5px);
}

.objective-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  font-size: 2rem;
}

.objective-card h3 {
  font-size: 1.3rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.objective-card p {
  color: var(--gray-dark);
  line-height: 1.6;
}

/* Careers Section */
.careers-section {
  padding: 4rem 0;
  background: linear-gradient(
    135deg,
    var(--primary-color-extra-light) 0%,
    transparent 100%
  );
}

.careers-header {
  text-align: center;
  margin-bottom: 3rem;
}

.careers-header h2 {
  font-size: 2.2rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}

.careers-header p {
  font-size: 1.1rem;
  color: var(--gray);
}

.careers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.career-card {
  background: var(--white);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-super-light);
  transition: transform 0.3s ease;
}

.career-card:hover {
  transform: translateY(-5px);
}

.career-content {
  text-align: center;
}

.career-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color-light);
  margin-bottom: 1rem;
}

.career-card h4 {
  font-size: 1.2rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.career-demand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--secondary-color);
  font-weight: 500;
}

/* Admission Section */
.admission-section {
  padding: 4rem 0;
}

.admission-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-super-light);
}

.admission-content {
  padding: 3rem;
}

.admission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.admission-header h2 {
  font-size: 2rem;
  color: var(--primary-dark);
  margin: 0;
}

.admission-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--secondary-color-light);
  color: var(--secondary-color);
  border-radius: 50px;
  font-weight: 600;
}

.admission-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.requirements h3 {
  font-size: 1.3rem;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-super-light);
  border-radius: 12px;
  color: var(--gray-dark);
}

.requirement svg {
  color: var(--secondary-color);
  font-size: 1.2rem;
}

.admission-cta {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cta-content {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(
    135deg,
    var(--primary-color-extra-light),
    transparent
  );
  border-radius: 16px;
  border: 1px solid var(--primary-color-light);
}

.cta-content h3 {
  font-size: 1.4rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
}

.cta-content p {
  color: var(--gray);
  margin-bottom: 2rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(80, 134, 193, 0.3);
}

/* Responsive */
@media (max-width: 1024px) {
  .admission-details {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .formation-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .hero-section {
    padding: 4rem 0 2rem;
  }

  .programs-grid {
    grid-template-columns: 1fr;
  }

  .selection-step-badge {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
  }

  .selection-step-badge svg {
    font-size: 1.1rem;
  }

  .hero-credentials {
    flex-direction: column;
    gap: 1rem;
  }

  .formation-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .selected-header {
    flex-direction: column;
    text-align: center;
  }

  .selected-icon {
    width: 5rem;
    height: 5rem;
    font-size: 2.5rem;
  }

  .other-filieres-grid {
    grid-template-columns: 1fr;
  }

  .mini-program-card {
    flex-direction: column;
    text-align: center;
  }

  .mini-card-arrow {
    transform: rotate(90deg);
  }

  .mini-program-card:hover .mini-card-arrow {
    transform: rotate(90deg) translateX(5px);
  }
}

@media (max-width: 480px) {
  .card-content {
    padding: 2rem;
  }

  .admission-content {
    padding: 2rem;
  }

  .selected-card-content {
    padding: 2rem;
  }

  .selected-icon {
    width: 4rem;
    height: 4rem;
    font-size: 2rem;
  }

  .btn-other-filieres {
    font-size: 0.95rem;
    padding: 1rem 1.5rem;
  }
}
</style>
