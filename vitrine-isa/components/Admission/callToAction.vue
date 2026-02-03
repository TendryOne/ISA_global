<template>
  <div>
    <section class="premium-cta-section">
      <div class="cta-background">
        <div class="cta-gradient"></div>
        <div class="cta-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
        </div>
      </div>
      <div class="cta-content">
        <div class="cta-header">
          <h3>Prêt à Rejoindre Notre Université ?</h3>
          <p>
            Notre équipe admission vous accompagne dans chaque étape de votre
            candidature
          </p>
        </div>
        <div class="cta-actions">
          <button class="cta-primary" @click="navigateTo('/contact')">
            <div class="button-content">
              <Icon name="ph:envelope-simple" class="button-icon" />
              <span>Contacter l'Admission</span>
            </div>
            <div class="button-glow"></div>
          </button>
          <button class="cta-secondary" @click="DownloadProcessus">
            <div class="button-content">
              <Icon name="ph:download" class="button-icon" />
              <span>Dossier d'Admission</span>
            </div>
            <div class="download-badge">PDF</div>
          </button>
        </div>
        <div class="cta-features">
          <div class="feature">
            <Icon name="ph:clock" />
            <span>Réponse sous 24h</span>
          </div>
          <div class="feature">
            <Icon name="ph:headset" />
            <span>Accompagnement personnalisé</span>
          </div>
          <div class="feature">
            <Icon name="ph:check-circle" />
            <span>Guide complet fourni</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
function DownloadProcessus() {
  const link = document.createElement("a");
  link.href = "/api/v1/upload/file/ISA_Processus_Admission.pdf";
  link.setAttribute("download", "ISA_Processus_Admission.pdf");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style scoped>
.premium-cta-section {
  position: relative;
  padding: 4rem 2rem;
  border-radius: 24px;
  overflow: hidden;
  margin: 3rem auto;
  max-width: 1000px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.cta-background {
  position: absolute;
  inset: 0;
}

.cta-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 100%
  );
}

.cta-shapes {
  position: absolute;
  inset: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 120px;
  height: 120px;
  top: -30px;
  right: 10%;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 80px;
  height: 80px;
  bottom: -20px;
  left: 8%;
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.cta-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.cta-header h3 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.cta-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  position: relative;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
}

.cta-primary {
  background: var(--white);
  color: var(--primary-color);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.button-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-primary:hover .button-glow {
  opacity: 1;
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: var(--white);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
}

.button-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.button-icon {
  font-size: 1.3rem;
}

.download-badge {
  background: var(--secondary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-left: 0.5rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.cta-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.feature svg {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .premium-cta-section {
    padding: 3rem 1.5rem;
    margin: 2rem 1rem;
  }

  .cta-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    justify-content: center;
  }

  .cta-features {
    flex-direction: column;
    gap: 1rem;
  }

  .feature {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .premium-cta-section {
    padding: 2.5rem 1rem;
  }

  .cta-header h3 {
    font-size: 1.6rem;
  }

  .cta-header p {
    font-size: 1.1rem;
  }

  .cta-primary,
  .cta-secondary {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
}
</style>
