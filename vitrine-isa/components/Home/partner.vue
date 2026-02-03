<template>
  <section class="partners-section">
    <!-- Vague décorative -->
    <div class="section-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          fill="currentColor"></path>
      </svg>
    </div>

    <div class="section-container">
      <div class="section-header" data-aos="fade-up">
        <div class="title-wrapper">
          <h2 class="section-title">
            <Icon name="ph:handshake-duotone" class="title-icon" />
            <span>Réseau Stratégique & Partenariats</span>
          </h2>
          <div class="title-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
          </div>
        </div>
        <p class="section-subtitle">
          Découvrez notre écosystème de partenaires d'excellence qui accompagnent notre mission éducative
        </p>
      </div>

      <div class="partners-grid" data-aos="fade-up" data-aos-delay="100">
        <div class="partner-card" v-for="(partner, index) in partners" :key="index" data-aos="zoom-in" :data-aos-delay="index * 100">
          <div class="partner-card-inner">
            <div class="partner-logo-container">
              <img :src="partner.logo" :alt="partner.name" class="partner-logo">
              <div class="logo-overlay"></div>
            </div>
            <div class="partner-info">
              <h3 class="partner-name">{{ partner.name }}</h3>
              <div class="partner-category">Partenaire Privilégié</div>
            </div>
            <div class="partner-hover-effect">
              <Icon name="ph:arrow-right" class="hover-arrow" />
            </div>
          </div>
        </div>
      </div>

      <div class="cta-section" data-aos="fade-up">
        <div class="cta-card">
          <div class="cta-background"></div>
          <div class="cta-content">
            <div class="cta-header">
              <h3 class="cta-title">Rejoignez Notre Réseau d'Excellence</h3>
              <p class="cta-text">Devenez partenaire stratégique de l'ISA et participez à la formation des leaders de demain</p>
            </div>
            <NuxtLink to="/contact" class="cta-button">
              <span>Devenir Partenaire</span>
              <Icon name="ph:arrow-right-duotone" class="button-icon" />
            </NuxtLink>
          </div>
          <div class="cta-decoration">
            <Icon name="ph:buildings-duotone" class="building-icon" />
            <div class="floating-elements">
              <div class="floating-element"></div>
              <div class="floating-element"></div>
              <div class="floating-element"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { partners } from '~/data/partner';
</script>

<style scoped>
.partners-section {
  position: relative;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 50%, #f0f7ff 100%);
  color: var(--text-color);
  padding: 8rem 0 6rem;
  overflow: hidden;
}

.section-wave {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 100px;
  color: var(--white);
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
}

.section-header {
  text-align: center;
  margin-bottom: 5rem;
}

.title-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--primary-dark);
}

.title-icon {
  width: 3rem;
  height: 3rem;
  color: var(--primary-color);
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.decoration-line {
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: var(--secondary-color);
  border-radius: 50%;
}

.section-subtitle {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.3rem;
  color: var(--gray);
  line-height: 1.6;
  font-weight: 400;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  margin: 4rem 0;
}

.partner-card {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(80, 134, 193, 0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  position: relative;
  border: 1px solid transparent;
}

.partner-card-inner {
  position: relative;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
}

.partner-card::before {
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

.partner-card:hover {
  transform: translateY(-10px);
  box-shadow: 
    0 25px 60px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(80, 134, 193, 0.2);
  border-color: var(--primary-color-light);
}

.partner-card:hover::before {
  transform: scaleX(1);
}

.partner-logo-container {
  position: relative;
  height: 120px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.partner-logo {
  max-width: 160px;
  max-height: 80px;
  width: auto;
  height: auto;
  object-fit: contain;
  transition: all 0.4s ease;
  filter: grayscale(30%);
  opacity: 0.9;
}

.partner-card:hover .partner-logo {
  transform: scale(1.1);
  filter: grayscale(0%);
  opacity: 1;
}

.logo-overlay {
  position: absolute;
  inset: -10px;
  background: linear-gradient(135deg, var(--primary-color-extra-light), transparent);
  border-radius: 12px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.partner-card:hover .logo-overlay {
  opacity: 1;
}

.partner-info {
  width: 100%;
  margin-top: auto;
}

.partner-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.partner-category {
  font-size: 0.9rem;
  color: var(--secondary-color);
  font-weight: 500;
  padding: 0.5rem 1rem;
  background: var(--secondary-color-light);
  border-radius: 20px;
  display: inline-block;
}

.partner-hover-effect {
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  opacity: 0;
  transition: all 0.4s ease;
}

.partner-card:hover .partner-hover-effect {
  right: 20px;
  opacity: 1;
}

.hover-arrow {
  width: 24px;
  height: 24px;
  color: var(--secondary-color);
}

.cta-section {
  margin-top: 6rem;
}

.cta-card {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 24px;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(80, 134, 193, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.cta-background {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
}

.cta-content {
  max-width: 600px;
  z-index: 2;
  position: relative;
}

.cta-header {
  margin-bottom: 2.5rem;
}

.cta-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.cta-text {
  font-size: 1.2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 2.5rem;
  background: var(--white);
  color: var(--primary-color);
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.4s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  font-size: 1.1rem;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.button-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.3s ease;
}

.cta-button:hover .button-icon {
  transform: translateX(5px);
}

.cta-decoration {
  position: relative;
  z-index: 1;
}

.building-icon {
  width: 200px;
  height: 200px;
  opacity: 0.15;
  color: white;
}

.floating-elements {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.floating-element {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.floating-element:nth-child(1) {
  width: 20px;
  height: 20px;
  top: -50px;
  left: -30px;
  animation-delay: 0s;
}

.floating-element:nth-child(2) {
  width: 15px;
  height: 15px;
  top: 20px;
  right: -40px;
  animation-delay: 2s;
}

.floating-element:nth-child(3) {
  width: 25px;
  height: 25px;
  bottom: -30px;
  left: 10px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Responsive */
@media (max-width: 1200px) {
  .section-title {
    font-size: 2.5rem;
  }
  
  .partners-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
}

@media (max-width: 1024px) {
  .cta-card {
    flex-direction: column;
    text-align: center;
    gap: 3rem;
    padding: 3rem;
  }

  .cta-content {
    max-width: 100%;
  }

  .building-icon {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 768px) {
  .partners-section {
    padding: 6rem 0 4rem;
  }

  .section-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-subtitle {
    font-size: 1.1rem;
  }

  .partners-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
  }

  .cta-card {
    padding: 2.5rem 2rem;
  }

  .cta-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 1rem;
  }

  .partner-card-inner {
    padding: 2rem 1.5rem;
  }

  .cta-button {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
}
</style>