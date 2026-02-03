<template>
  <div class="director-message-container">
    <!-- Section Hero -->
    <section class="director-hero">
      <div class="gradient-overlay"></div>
      <div class="content-wrapper">
        <h1 class="director-title">
          <span class="title-line">Mot du</span>
          <span class="title-line accent">Directeur</span>
        </h1>
      </div>
    </section>

    <!-- Contenu principal -->
    <main class="message-content-wrapper">
      <!-- Bloc signature flottante -->
      <div class="signature-block">
        <div class="director-portrait">
          <NuxtImg src="/directeur-isa.jpg" alt="Portrait du directeur" width="150" height="150"
            class="portrait-image" />
          <div class="signature-line"></div>
          <p class="director-name">Pr. Ahmed Benali</p>
          <p class="director-title">Directeur de l'ISA</p>
        </div>
      </div>

      <!-- Message -->
      <article class="director-message">
        <div class="message-intro">
          <p class="intro-text">Chers étudiants, partenaires et visiteurs,</p>
        </div>

        <div class="message-body">
          <p>Il me fait grand plaisir de vous accueillir sur le site de notre institution, l'ISA, lieu d'excellence et
            d'innovation pédagogique.</p>

          <p>Notre établissement s'engage depuis sa création à offrir une formation académique rigoureuse, alliant <span
              class="highlight">savoir théorique</span> et <span class="highlight">compétences pratiques</span>, pour
            préparer nos étudiants aux défis du monde professionnel.</p>

          <div class="highlight-quote">
            <p>"L'éducation est l'arme la plus puissante pour changer le monde."</p>
            <p class="quote-author">- Nelson Mandela</p>
          </div>

          <p>Cette année marque un tournant important avec le lancement de notre nouveau programme <span
              class="highlight">"ISA 2030"</span>, visant à renforcer notre positionnement international et notre
            infrastructure technologique.</p>

          <p>Je tiens à remercier l'ensemble de notre communauté pour son engagement quotidien et vous invite à
            découvrir à travers ce site toutes les opportunités que nous offrons.</p>
        </div>

        <div class="message-outro">
          <p>Avec mes sincères salutations,</p>
        </div>
      </article>
    </main>

    <!-- Section valeurs -->
    <section class="values-section">
      <h2 class="values-title">Nos engagements</h2>
      <div class="values-grid">
        <div class="value-card">
          <Icon name="mdi:lightbulb-on" size="32" class="value-icon" />
          <h3>Innovation</h3>
          <p>Pédagogie avant-gardiste adaptée aux besoins du marché</p>
        </div>
        <div class="value-card">
          <Icon name="mdi:account-group" size="32" class="value-icon" />
          <h3>Communauté</h3>
          <p>Esprit collaboratif et réseau alumni solide</p>
        </div>
        <div class="value-card">
          <Icon name="mdi:earth" size="32" class="value-icon" />
          <h3>Ouverture</h3>
          <p>Perspective internationale et interculturelle</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
// Vous pouvez ajouter ici des données réactives si nécessaire
</script>

<style scoped>
.director-message-container {
  position: relative;
  background-color: var(--white);
}

/* Hero Section */
.director-hero {
  position: relative;
  height: 40vh;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      rgba(80, 134, 193, 0.1) 0%,
      rgba(48, 168, 85, 0.1) 100%);
}

.content-wrapper {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.director-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 300;
  line-height: 1.2;
  color: var(--white);
  margin-bottom: 1rem;
}

.title-line {
  display: block;
}

.title-line.accent {
  font-weight: 700;
  color: var(--secondary-color);
}

/* Main Content */
.message-content-wrapper {
  position: relative;
  max-width: 900px;
  margin: -50px auto 0;
  padding: 2rem;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  z-index: 3;
}

.signature-block {
  position: absolute;
  left: 2rem;
  top: -80px;
  width: 150px;
}

.director-portrait {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.portrait-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid var(--white);
  box-shadow: var(--shadow);
}

.signature-line {
  width: 100px;
  height: 2px;
  background: var(--secondary-color);
  margin: 1rem 0;
}

.director-name {
  font-weight: 600;
  color: var(--primary-color);
  text-align: center;
}

.director-title {
  font-size: 0.9rem;
  color: var(--gray-dark);
  text-align: center;
  margin-top: 0.25rem;
}

.director-message {
  padding-top: 50px;
}

.message-intro {
  margin-bottom: 2rem;
}

.intro-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--primary-color);
}

.message-body {
  line-height: 1.8;
}

.message-body p {
  margin-bottom: 1.5rem;
}

.highlight {
  color: var(--secondary-color);
  font-weight: 500;
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 30%;
  background-color: var(--primary-color-extra-light);
  z-index: -1;
}

.highlight-quote {
  border-left: 4px solid var(--secondary-color);
  padding: 1rem 1.5rem;
  margin: 2rem 0;
  font-style: italic;
  color: var(--gray-dark);
  background-color: var(--primary-color-extra-light);
  border-radius: 0 var(--radius) var(--radius) 0;
}

.quote-author {
  font-style: normal;
  text-align: right;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray);
}

.message-outro {
  margin-top: 3rem;
  text-align: right;
  font-weight: 500;
}

/* Values Section */
.values-section {
  max-width: 1200px;
  margin: 4rem auto;
  padding: 0 2rem;
}

.values-title {
  text-align: center;
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 3rem;
  position: relative;
}

.values-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 3px;
  background: var(--secondary-color);
  margin: 1rem auto 0;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.value-card {
  background: var(--white);
  padding: 2rem;
  border-radius: var(--radius);
  text-align: center;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow);
}

.value-card:hover {
  transform: translateY(-5px);
}

.value-icon {
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.value-card h3 {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.value-card p {
  color: var(--gray-dark);
  font-size: 0.95rem;
}

/* Responsive */
@media (max-width: 768px) {
  .message-content-wrapper {
    margin-top: -30px;
    padding: 1.5rem;
  }

  .signature-block {
    position: static;
    width: 100%;
    margin-bottom: 2rem;
  }

  .director-portrait {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .portrait-image {
    width: 80px;
    height: 80px;
  }

  .signature-line {
    display: none;
  }

  .director-message {
    padding-top: 0;
  }
}
</style>