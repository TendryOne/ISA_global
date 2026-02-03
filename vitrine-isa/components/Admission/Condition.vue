<template>
  <div class="admissions-page">
    <!-- Hero Section Premium -->
    <section class="admissions-hero">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>
      </div>
      <div class="hero-content">
        <div class="hero-breadcrumb">
          <span>Accueil</span>
          <Icon name="ph:caret-right" />
          <span class="current">Admissions</span>
        </div>
        <h1>Admission à l'Université</h1>
        <p class="subtitle">
          Rejoignez notre communauté d'excellence et construisez votre avenir
          avec nous
        </p>
      </div>
    </section>

    <!-- Navigation par Cycles -->
    <section class="cycles-navigation">
      <div class="container">
        <div class="navigation-header">
          <h2>Cycles d'Études</h2>
          <p>
            Choisissez votre parcours académique parmi nos programmes
            d'excellence
          </p>
        </div>
        <div class="cycles-grid">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'cycle-card',
              { active: activeTab === tab.id, disabled: tab.disabled },
            ]"
            @click="setActiveTab(tab.id)"
          >
            <div class="card-gradient"></div>
            <div v-if="tab.disabled" class="disabled-badge">
              <Icon name="ph:lock" />
              <span>Indisponible</span>
            </div>
            <div class="card-content">
              <div class="cycle-icon">
                <Icon :name="tab.icon" />
              </div>
              <h3>{{ tab.label }}</h3>
              <p>{{ getCycleDescription(tab.id) }}</p>
              <div class="cycle-features">
                <div class="feature">
                  <Icon name="ph:clock" />
                  <span>1 an (environ 10 mois)</span>
                </div>
              </div>
            </div>
            <div class="selection-indicator">
              <Icon name="ph:check-circle" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenu des Admissions -->
    <div class="admission-content">
      <div class="container">
        <!-- Licence 1 -->
        <div v-if="activeTab === 'l1'" class="tab-panel">
          <div class="admission-header">
            <div class="header-gradient"></div>
            <div class="header-content">
              <div class="formation-info">
                <h2>Admission en Première Année</h2>
                <p class="formation-tagline">
                  Licence Professionnelle - Accès Post-Bac
                </p>
                <div class="formation-stats">
                  <div class="stat">
                    <Icon name="ph:calendar" />
                    <span
                      >Rentrée :
                      {{ formatDate(settings.plannedStartDate) }}</span
                    >
                  </div>
                  <div class="stat">
                    <Icon name="ph:clock" />
                    <span>3 années de formation</span>
                  </div>
                  <div class="stat">
                    <Icon name="ph:certificate" />
                    <span>Diplôme Bac+3 reconnu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="requirements-section">
            <div class="section-header">
              <h3>Conditions d'Admission</h3>
              <p>
                Les prérequis pour intégrer notre formation en première année
              </p>
            </div>
            <div class="requirements-grid">
              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:file-text" class="requirement-icon" />
                  <h4>Dossier Académique</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Relevés de notes du Baccalauréat</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span
                      >Photocopie de la pièce d'identité recto-verso ou acte de
                      naissance pour les moins de 18 ans (format
                      numérique)</span
                    >
                  </li>
                </ul>
              </div>

              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:user" class="requirement-icon" />
                  <h4>Documents Personnels</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>1 photo d'identité récente (format numérique)</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Certificat de résidence (moins de 3 mois)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Licence 2 -->
        <div v-if="activeTab === 'l2'" class="tab-panel">
          <div class="admission-header">
            <div class="header-gradient"></div>
            <div class="header-content">
              <div class="formation-info">
                <h2>Admission en Deuxième Année</h2>
                <p class="formation-tagline">
                  Licence Professionnelle - Passage en L2
                </p>
                <div class="formation-stats">
                  <div class="stat">
                    <Icon name="ph:calendar" />
                    <span
                      >Rentrée :
                      {{ formatDate(settings.plannedStartDate) }}</span
                    >
                  </div>
                  <div class="stat">
                    <Icon name="ph:clock" />
                    <span>Validation L1 requise</span>
                  </div>
                  <div class="stat">
                    <Icon name="ph:certificate" />
                    <span>Diplôme Bac+3 reconnu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="requirements-section">
            <div class="section-header">
              <h3>Conditions d'Admission</h3>
              <p>Les prérequis pour intégrer directement en deuxième année</p>
            </div>
            <div class="requirements-grid">
              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:file-text" class="requirement-icon" />
                  <h4>Dossier Académique</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Validation complète de la L1</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Relevés de notes L1 complets</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Photocopie de la pièce d'identité</span>
                  </li>
                </ul>
              </div>

              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:user" class="requirement-icon" />
                  <h4>Documents Personnels</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>4 photos d'identité récentes</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Certificat de résidence récent</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Fiche d'état civil</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Licence 3 -->
        <div v-if="activeTab === 'l3'" class="tab-panel">
          <div class="admission-header">
            <div class="header-gradient"></div>
            <div class="header-content">
              <div class="formation-info">
                <h2>Admission en Troisième Année</h2>
                <p class="formation-tagline">
                  Licence Professionnelle - Finalisation du Cycle
                </p>
                <div class="formation-stats">
                  <div class="stat">
                    <Icon name="ph:calendar" />
                    <span
                      >Rentrée :
                      {{ formatDate(settings.plannedStartDate) }}</span
                    >
                  </div>
                  <div class="stat">
                    <Icon name="ph:clock" />
                    <span>Validation L1 et L2 requise</span>
                  </div>
                  <div class="stat">
                    <Icon name="ph:certificate" />
                    <span>Diplôme Bac+3 reconnu</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="requirements-section">
            <div class="section-header">
              <h3>Conditions d'Admission</h3>
              <p>Les prérequis pour intégrer directement en troisième année</p>
            </div>
            <div class="requirements-grid">
              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:file-text" class="requirement-icon" />
                  <h4>Dossier Académique</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Validation complète L1 et L2</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Relevés de notes des 2 années</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Photocopie de la pièce d'identité</span>
                  </li>
                </ul>
              </div>

              <div class="requirement-card">
                <div class="requirement-header">
                  <Icon name="ph:user" class="requirement-icon" />
                  <h4>Documents Personnels</h4>
                </div>
                <ul class="requirement-list">
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>4 photos d'identité récentes</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Certificat de résidence récent</span>
                  </li>
                  <li>
                    <Icon name="ph:check-circle" class="check-icon" />
                    <span>Fiche d'état civil</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Procédure Commune -->
        <section class="procedure-section">
          <div class="section-header">
            <h3>Procédure d'Admission</h3>
            <p>Les étapes pour rejoindre notre établissement</p>
          </div>
          <div class="procedure-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h4>Dépôt de Dossier</h4>
                <p>
                  Transmettez votre dossier complet via notre plateforme en
                  ligne
                </p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h4>Examen du Dossier</h4>
                <p>Notre commission pédagogique étudie votre candidature</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h4>Notification</h4>
                <p>Réception de votre résultat d'admission par email</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h4>Inscription</h4>
                <p>Finalisation administrative et début des cours</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Calendrier -->
        <section class="calendar-section">
          <div class="calendar-card">
            <div class="calendar-header">
              <h3>
                <Icon name="ph:calendar" />
                <span
                  >Calendrier Académique {{ new Date().getFullYear() }}</span
                >
              </h3>
            </div>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(settings?.registrationDate) }} -
                  {{ formatDate(settings?.finalEnrollmentDate) }}
                </div>
                <div class="timeline-content">
                  Période d'inscription et dépôt des dossiers
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(settings?.documentReviewDate) }}
                </div>
                <div class="timeline-content">
                  Examen des candidatures par la commission
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(settings?.resultsPublicationDate) }}
                </div>
                <div class="timeline-content">
                  Publication des résultats d'admission
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-date">
                  {{ formatDate(settings?.plannedStartDate) }}
                </div>
                <div class="timeline-content">Début prévu des cours</div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Résultats -->
        <section class="results-section">
          <div class="results-card">
            <div class="results-content">
              <h3>Consultez les Résultats</h3>
              <p>
                {{
                  !settings?.isResultAvailable
                    ? "Les résultats d’admission seront publiés en ligne dès leur disponibilité."
                    : "Les résultats d’admission sont désormais disponibles sur notre plateforme."
                }}
              </p>

              <NuxtLink
                to="/admission/resultat"
                class="results-button"
                :class="{ disabled: !settings?.isResultAvailable }"
              >
                <Icon name="ph:scroll" />
                <span>Voir les Résultats d'Admission</span>
              </NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SettingsInterface } from "~/interfaces/SettingsInterface";

const props = defineProps<{
  settings: SettingsInterface;
}>();

const activeTab = ref("l1");

const tabs = [
  { id: "l1", label: "Licence 1", icon: "ph:student", disabled: false },
  { id: "l2", label: "Licence 2", icon: "ph:book-open", disabled: true },
  { id: "l3", label: "Licence 3", icon: "ph:graduation-cap", disabled: true },
];

const formatDate = (date: string | Date | null): string => {
  if (!date) return "Date à définir";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", options);
};

const setActiveTab = (tabId: string) => {
  const tab = tabs.find((t) => t.id === tabId);
  if (tab && !tab.disabled) {
    activeTab.value = tabId;
  }
};

const getCycleDescription = (cycleId: string): string => {
  const descriptions = {
    l1: "Première année de licence - Accès post-bac",
    l2: "Indisponible pour le moment",
    l3: "Indisponible pour le moment",
  };
  return descriptions[cycleId as keyof typeof descriptions] || "";
};
</script>

<style scoped>
.admissions-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 50%, #f8fafc 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero Section Premium */
.admissions-hero {
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
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.hero-breadcrumb .current {
  opacity: 1;
  font-weight: 600;
}

.admissions-hero h1 {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  opacity: 0.9;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Cycles Navigation */
.cycles-navigation {
  padding: 4rem 0;
  background: var(--white);
}

.navigation-header {
  text-align: center;
  margin-bottom: 3rem;
}

.navigation-header h2 {
  font-size: 2.5rem;
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

.cycles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.cycle-card {
  position: relative;
  background: var(--white);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--gray-super-light);
}

.cycle-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--gray-super-light);
}

.cycle-card.disabled:hover {
  transform: none !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
}

.disabled-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--tertiary-color), #666);
  color: white;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.disabled-badge svg {
  font-size: 1rem;
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

.cycle-card.active .card-gradient {
  opacity: 0.05;
}

.cycle-card:hover:not(.disabled) .card-gradient {
  opacity: 0.03;
}

.card-content {
  position: relative;
  z-index: 2;
  padding: 2.5rem;
}

.cycle-card.active:not(.disabled) {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color-light);
}

.cycle-card:hover:not(.active):not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.cycle-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
}

.cycle-card h3 {
  font-size: 1.4rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.cycle-card p {
  color: var(--gray);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.cycle-features {
  display: flex;
  gap: 1.5rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.selection-indicator {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  opacity: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
  transition: opacity 0.3s ease;
}

.cycle-card.active .selection-indicator {
  opacity: 1;
}

/* Admission Header */
.admission-header {
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

/* Requirements Section */
.requirements-section {
  margin-bottom: 4rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h3 {
  font-size: 2rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 700;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--gray);
}

.requirements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.requirement-card {
  background: var(--white);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-super-light);
  transition: transform 0.3s ease;
}

.requirement-card:hover {
  transform: translateY(-5px);
}

.requirement-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--primary-color-light);
}

.requirement-icon {
  font-size: 1.8rem;
  color: var(--primary-color);
}

.requirement-header h4 {
  font-size: 1.3rem;
  color: var(--primary-dark);
  margin: 0;
  font-weight: 600;
}

.requirement-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.2rem;
  line-height: 1.6;
  color: var(--gray-dark);
}

.check-icon {
  color: var(--secondary-color);
  margin-top: 0.2rem;
  flex-shrink: 0;
  font-size: 1.3rem;
}

/* Procedure Section */
.procedure-section {
  margin-bottom: 4rem;
}

.procedure-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.step {
  text-align: center;
  padding: 2rem;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--gray-super-light);
}

.step-number {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 auto 1.5rem;
}

.step-content h4 {
  font-size: 1.2rem;
  color: var(--primary-dark);
  margin-bottom: 1rem;
  font-weight: 600;
}

.step-content p {
  color: var(--gray);
  line-height: 1.6;
}

/* Calendar Section */
.calendar-section {
  margin-bottom: 4rem;
}

.calendar-card {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-super-light);
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  color: var(--primary-dark);
}

.calendar-header h3 {
  font-size: 1.8rem;
  margin: 0;
  font-weight: 700;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(
    180deg,
    var(--primary-color),
    var(--secondary-color)
  );
  border-radius: 4px;
}

.timeline-item {
  position: relative;
  padding-bottom: 2.5rem;
  padding-left: 2.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: -0.65rem;
  top: 0.2rem;
  width: 1.3rem;
  height: 1.3rem;
  background: linear-gradient(
    135deg,
    var(--secondary-color),
    var(--primary-color)
  );
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(48, 168, 85, 0.4);
}

.timeline-date {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.timeline-content {
  background: var(--gray-super-light);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border-left: 3px solid var(--secondary-color);
}

/* Results Section */
.results-section {
  margin-bottom: 4rem;
}

.results-card {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.results-content h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.results-content p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.results-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.2rem 2.5rem;
  background: var(--white);
  color: var(--primary-color);
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.results-button:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.results-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .requirements-grid {
    grid-template-columns: 1fr;
  }

  .procedure-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .admissions-hero {
    padding: 4rem 0 2rem;
  }

  .cycles-grid {
    grid-template-columns: 1fr;
  }

  .disabled-badge {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .hero-stats {
    gap: 2rem;
  }

  .formation-stats {
    justify-content: center;
  }

  .procedure-steps {
    grid-template-columns: 1fr;
  }

  .calendar-card {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .section-header h3 {
    font-size: 1.8rem;
  }

  .requirement-card {
    padding: 2rem;
  }

  .results-card {
    padding: 2rem;
  }
}
</style>
