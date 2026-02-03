<template>
  <section class="modern-hero">
    <!-- Image background with dark overlay -->
    <div class="image-overlay"></div>

    <!-- Main background image -->
    <NuxtImg src="/ISA-campus.jpg" alt="Campus ISA" class="image-bg" loading="eager" format="webp" quality="80" />

    <div class="content-container">
      <!-- Text content -->
      <div class="text-content">
        <h1 class="university-name">
          Institut Supérieur d'Ambatomirahavavy
        </h1>

        <div class="slogan">
          <div class="slogan-line">
            <span>Savoir</span>
            <div class="line"></div>
          </div>
          <div class="slogan-line">
            <span>Savoir-faire</span>
            <div class="line"></div>
          </div>
          <div class="slogan-line">
            <span>Savoir-être</span>
            <div class="line"></div>
          </div>
          <div class="final-line">
            Bâtissons un avenir <span class="highlight">responsable</span>
          </div>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="cta-container">
        <button class="modern-cta" @click="downloadBrochure">
          <span>Télécharger la brochure</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15V3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <NuxtLink to="/contact" class="modern-cta secondary">
          <span>Rencontrer un conseiller</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </NuxtLink>
      </div>
    </div>

    <!-- Floating stats -->
    <div class="floating-stats">
      <div class="stat-item">
        <div class="stat-number">95%</div>
        <div class="stat-label">Insertion professionnelle</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ partners.length }}</div>
        <div class="stat-label">Partenariats locaux</div>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { partners } from "@/data/partner";

const downloadBrochure = () => {
  alert('brochure pas encore disponible')

};
</script>

<style scoped>
.modern-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  overflow: hidden;
  padding: 2rem;
  background-color: var(--background-dark);
}

/* Dark overlay for better text visibility */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

.image-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.content-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

.university-name {
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.slogan {
  margin-bottom: 3rem;
}

.slogan-line {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 300;
}

.slogan-line span {
  margin-right: 1rem;
}

.line {
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(to right, white, transparent);
}

.final-line {
  font-size: clamp(1.2rem, 3vw, 2rem);
  margin-top: 2rem;
  font-weight: 400;
}

.highlight {
  color: var(--primary-color);
  font-weight: 600;
}

.cta-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.modern-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background: var(--primary-color);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modern-cta:hover {
  background: color-mix(in srgb, var(--primary-color), white 10%);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.modern-cta.secondary {
  background: transparent;
  border: 1px solid white;
  text-decoration: none;
}

.modern-cta svg {
  transition: transform 0.3s ease;
}

.modern-cta:hover svg {
  transform: translateX(3px);
}

.floating-stats {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  gap: 2rem;
  z-index: 2;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--primary-color);
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Responsive Improvements */
@media (max-width: 1200px) {
  .modern-hero {
    padding: 1.5rem;
    text-align: center;
  }

  .content-container {
    padding: 1rem;
  }

  .slogan-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .line {
    width: 100%;
    height: 2px;
  }

  .cta-container {
    flex-direction: column;
    gap: 1rem;
  }

  .modern-cta {
    width: 100%;
    justify-content: center;
  }

  .floating-stats {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 3rem;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 768px) {
  .modern-hero {
    padding: 1.5rem;
    text-align: center;
  }

  .content-container {
    padding: 1rem;
  }

  .slogan-line {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .line {
    width: 100%;
    height: 2px;
  }

  .cta-container {
    flex-direction: column;
    gap: 1rem;
  }

  .modern-cta {
    width: 100%;
    justify-content: center;
  }

  .floating-stats {
    position: relative;
    bottom: auto;
    right: auto;
    margin-top: 3rem;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }

  .stat-item {
    flex: 1;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .modern-hero {
    padding: 1rem;
    min-height: 90vh;
  }

  .content-container {
    padding: 0.5rem;
  }

  .university-name {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .slogan-line {
    font-size: 1.4rem;
    margin-bottom: 0.3rem;
  }

  .final-line {
    font-size: 1.2rem;
    margin-top: 1.5rem;
  }

  .modern-cta {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }

  .floating-stats {
    gap: 1rem;
    margin-top: 2rem;
  }

  .stat-item {
    padding: 0.8rem 1rem;
    min-width: 100px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 430px) {
  .modern-hero {
    padding: 0.8rem;
    min-height: 85vh;
  }

  .content-container {
    padding: 0.3rem;
  }

  .university-name {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    line-height: 1.2;
  }

  .slogan-line {
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }

  .slogan-line span {
    margin-right: 0.5rem;
  }

  .final-line {
    font-size: 1rem;
    margin-top: 1rem;
  }

  .cta-container {
    gap: 0.8rem;
  }

  .modern-cta {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
    gap: 0.5rem;
  }

  .modern-cta svg {
    width: 16px;
    height: 16px;
  }

  .floating-stats {
    gap: 0.8rem;
    margin-top: 1.5rem;
    bottom: 1rem;
    right: 1rem;
  }

  .stat-item {
    padding: 0.6rem 0.8rem;
    min-width: 90px;
  }

  .stat-number {
    font-size: 1.3rem;
    margin-bottom: 0.1rem;
  }

  .stat-label {
    font-size: 0.7rem;
    line-height: 1.1;
  }

  @media (max-width: 360px) {
    .university-name {
      font-size: 1.4rem;
    }

    .slogan-line {
      font-size: 1.1rem;
    }

    .stat-item {
      min-width: 80px;
      padding: 0.5rem;
    }

    .modern-cta {
      padding: 0.5rem 0.8rem;
    }
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-line,
.final-line,
.cta-container {
  animation: fadeIn 0.8s forwards;
}

.slogan-line:nth-child(2) {
  animation-delay: 0.2s;
}

.slogan-line:nth-child(3) {
  animation-delay: 0.4s;
}

.final-line {
  animation-delay: 0.6s;
}

.cta-container {
  animation-delay: 0.8s;
}
</style>