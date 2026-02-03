<template>
  <section class="why-choose-us">
    <div class="container">
      <!-- Titre section -->
      <div class="section-header">
        <div class="section-label">
          <Icon name="ph:star-duotone" class="label-icon" />
          <span>Pourquoi Choisir ISA ?</span>
        </div>
        <h2 class="section-title">
          La formation <span class="gradient-text">hybride</span> nouvelle génération
          <br>qui s'adapte à <span class="highlight-text">votre rythme</span>
        </h2>
        <p class="section-subtitle">
         Cours en ligne avec regroupements réguliers et examens en présentiel pour garantir la réussite de chaque étudiant.
        </p>
      </div>

      <!-- Grille de raisons -->
      <div class="reasons-grid">
        <!-- Raison 1 -->
        <div class="reason-card" data-aos="fade-up">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="mdi:account-clock" class="icon" />
            </div>
            <div class="card-badge">Flexibilité</div>
          </div>
          <h3 class="card-title">Flexibilité Totale</h3>
          <p class="card-text">
            Notre formation est 100% flexible : suivez vos cours en ligne ou en présentiel selon vos disponibilités.
            Tout est mis en place pour que chaque étudiant progresse à son rythme, avec un accompagnement constant.
            Des regroupements réguliers permettent de consolider les acquis et de renforcer le suivi personnalisé.
          </p>
          <div class="card-stats">
            <div class="stat-item">
              <Icon name="mdi:calendar-star" class="stat-icon" />
              <span>Regroupements réguliers</span>
            </div>
            <div class="stat-item">
              <Icon name="mdi:sync" class="stat-icon" />
              <span>Apprentissage hybride</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="luxury-tag">Study Your Way</span>
          </div>
        </div>

        <!-- Raison 2 -->
        <div class="reason-card" data-aos="fade-up" data-aos-delay="100">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="mdi:lightbulb-on" class="icon" />
            </div>
            <div class="card-badge">Innovation</div>
          </div>
          <h3 class="card-title">Innovation Pédagogique</h3>
          <p class="card-text">
            Nous proposons une pédagogie moderne et orientée vers la pratique : cours interactifs, exercices concrets,
            supports numériques enrichis et outils digitaux à jour selon l'évolution des technologies.
            Chaque étudiant dispose d'un compte personnel pour consulter ses cours, ses notes et accéder à du contenu exclusif.
          </p>
          <div class="card-stats">
            <div class="stat-item">
              <Icon name="mdi:brain" class="stat-icon" />
              <span>Apprentissage par la pratique</span>
            </div>
            <div class="stat-item">
              <Icon name="mdi:trending-up" class="stat-icon" />
              <span>Suivi individualisé</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="luxury-tag">Next-Gen Education</span>
          </div>
        </div>

        <!-- Raison 3 -->
        <div class="reason-card" data-aos="fade-up" data-aos-delay="200">
          <div class="card-header">
            <div class="card-icon">
              <Icon name="mdi:briefcase-check" class="icon" />
            </div>
            <div class="card-badge">Prestige</div>
          </div>
          <h3 class="card-title">Insertion Professionnelle</h3>
          <p class="card-text">
            Grâce à nos partenaires locaux et entreprises leaders, nos étudiants bénéficient de stages et d'opportunités
            professionnelles concrètes. Notre objectif : vous préparer efficacement aux métiers de demain.
          </p>
          <div class="card-stats">
            <div class="stat-item">
              <Icon name="mdi:account-tie" class="stat-icon" />
              <span>{{ partners.length }} partenaires</span>
            </div>
            <div class="stat-item">
              <Icon name="mdi:handshake" class="stat-icon" />
              <span>Réseau professionnel solide</span>
            </div>
          </div>
          <div class="card-footer">
            <span class="luxury-tag">Career Ready</span>
          </div>
        </div>
      </div>

      <!-- Bandeau chiffres clés -->
      <div class="key-figures" data-aos="fade-in">
        <div class="figure-item">
          <div class="figure-value">
            <span class="figure-number">100</span>
            <span class="figure-percent">%</span>
          </div>
          <div class="figure-label">Flexibilité</div>
          <div class="figure-subtitle">En ligne et présentiel</div>
        </div>
        <div class="figure-item">
          <div class="figure-value">
            <span class="figure-number">{{ partners.length }}+</span>
          </div>
          <div class="figure-label">Partenaires</div>
          <div class="figure-subtitle">Entreprises leaders</div>
        </div>
        <div class="figure-item">
          <div class="figure-value">
            <span class="figure-number">24h/24</span>
          </div>
          <div class="figure-label">Plateforme & Support</div>
          <div class="figure-subtitle">Disponibles en continu</div>
        </div>
        <div class="figure-item">
          <div class="figure-value">
            <span class="figure-number">24h/24</span>
          </div>
          <div class="figure-label">Assistance</div>
          <div class="figure-subtitle">Support technique</div>
        </div>
      </div>

      <!-- Élément décoratif -->
      <div class="luxury-decoration">
        <div class="decoration-item" style="background: var(--primary-color);"></div>
        <div class="decoration-item" style="background: var(--secondary-color);"></div>
        <div class="decoration-item" style="background: var(--tertiary-color);"></div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { partners } from '~/data/partner';
</script>

<style scoped>
.why-choose-us {
  padding: clamp(4rem, 10vw, 8rem) 1rem;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 50%, #f0f7ff 100%);
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: clamp(3rem, 6vw, 5rem);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(var(--primary-color-rgb, 80, 134, 193), 0.1);
  color: var(--primary-color);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  margin-bottom: 2rem;
}

.label-icon {
  font-size: 1.1rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  color: var(--text-primary, #1a202c);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.highlight-text {
  color: var(--primary-color);
  position: relative;
}

.highlight-text::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  animation: underlineSlide 2s ease-out 0.5s forwards;
}

@keyframes underlineSlide {
  to {
    transform: scaleX(1);
  }
}

.section-subtitle {
  font-size: clamp(1rem, 2.8vw, 1.25rem);
  color: var(--text-secondary, #64748b);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.reasons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: clamp(2rem, 4vw, 2.5rem);
  margin-bottom: clamp(4rem, 8vw, 6rem);
}

.reason-card {
  background: var(--white);
  border-radius: 20px;
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.reason-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.reason-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
  border-color: var(--primary-color-extra-light);
}

.reason-card:hover::before {
  transform: scaleX(1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color-light);
  color: var(--primary-color);
  transition: all 0.4s ease;
}

.reason-card:nth-child(2) .card-icon {
  background: var(--tertiary-color-light);
  color: var(--tertiary-color);
}

.reason-card:nth-child(3) .card-icon {
  background: var(--secondary-color-light);
  color: var(--secondary-color);
}

.reason-card:hover .card-icon {
  transform: rotate(8deg) scale(1.1);
}

.card-icon .icon {
  font-size: 2.2rem;
}

.card-badge {
  background: var(--primary-color-extra-light);
  color: var(--primary-color);
  padding: 0.5rem 1.2rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid var(--primary-color-light);
}

.card-title {
  font-size: clamp(1.3rem, 3.5vw, 1.6rem);
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  line-height: 1.3;
}

.card-text {
  color: var(--gray);
  line-height: 1.7;
  margin-bottom: 2.5rem;
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  font-weight: 400;
}

.card-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-super-light);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: var(--gray);
  background: var(--gray-super-light);
  padding: 0.7rem 1.2rem;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: var(--primary-color-extra-light);
  transform: translateY(-2px);
}

.stat-item .stat-icon {
  font-size: 1.1rem;
}

.reason-card:nth-child(1) .stat-item .stat-icon {
  color: var(--primary-color);
}

.reason-card:nth-child(2) .stat-item .stat-icon {
  color: var(--tertiary-color);
}

.reason-card:nth-child(3) .stat-item .stat-icon {
  color: var(--secondary-color);
}

.card-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-super-light);
}

.luxury-tag {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 12px;
  font-size: clamp(0.75rem, 1.8vw, 0.85rem);
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(80, 134, 193, 0.3);
}

.key-figures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  background: var(--white);
  padding: 4rem 3rem;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  border: 1px solid var(--gray-super-light);
}

.figure-item {
  text-align: center;
  position: relative;
}

.figure-item:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 60px;
  background: var(--gray-super-light);
}

.figure-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.8rem;
  line-height: 1;
}

.figure-number {
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.figure-percent {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  font-weight: 700;
  opacity: 0.8;
  margin-left: 0.2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.figure-label {
  font-size: clamp(1rem, 2.5vw, 1.1rem);
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.figure-subtitle {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: var(--gray);
  font-weight: 400;
}

.luxury-decoration {
  position: absolute;
  top: 50%;
  right: 5%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  opacity: 0.1;
}

.decoration-item {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.decoration-item:nth-child(2) {
  animation-delay: 2s;
}

.decoration-item:nth-child(3) {
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .reasons-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .reasons-grid {
    grid-template-columns: 1fr;
  }

  .key-figures {
    grid-template-columns: repeat(2, 1fr);
    padding: clamp(2rem, 5vw, 3rem);
    gap: clamp(1.5rem, 3vw, 2rem);
  }

  .figure-item:not(:last-child)::after {
    display: none;
  }
}

@media (max-width: 640px) {
  .key-figures {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .luxury-decoration {
    display: none;
  }
}

@media (max-width: 480px) {
  .card-icon {
    width: clamp(50px, 12vw, 60px);
    height: clamp(50px, 12vw, 60px);
  }

  .card-icon .icon {
    font-size: clamp(1.5rem, 4vw, 1.8rem);
  }
}
</style>