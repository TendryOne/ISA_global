<template>
  <div class="contact-info-container" id="contact-form-section">
    <!-- Floating shapes -->
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <!-- Header Section -->
    <div class="contact-header">
      <div class="excellence-badge">
        <Icon name="ph:star-four" class="badge-icon" />
        <span>Service d'Excellence</span>
      </div>
      <h2>Contactez Notre Équipe</h2>
      <p class="contact-subtitle">
        Une question sur nos formations, l'admission ou un partenariat ? Nos
        conseillers sont disponibles pour vous accompagner dans votre projet
        académique.
      </p>
      <div class="contact-stats">
        <div class="stat">
          <div class="stat-icon-wrapper">
            <Icon name="ph:clock" class="stat-icon" />
          </div>
          <span>Réponse rapide</span>
        </div>
        <div class="stat">
          <div class="stat-icon-wrapper">
            <Icon name="ph:headset" class="stat-icon" />
          </div>
          <span>Support personnalisé</span>
        </div>
        <div class="stat">
          <div class="stat-icon-wrapper">
            <Icon name="ph:check-circle" class="stat-icon" />
          </div>
          <span>Accompagnement complet</span>
        </div>
      </div>
    </div>

    <!-- Contact Methods Grid -->
    <div class="contact-methods-section">
      <div class="section-header">
        <div class="section-icon">
          <Icon name="ph:chat-circle-dots" />
        </div>
        <div class="section-text">
          <h3>Moyens de Contact Direct</h3>
          <p>Choisissez le canal qui vous convient le mieux</p>
        </div>
      </div>

      <div class="contact-methods">
        <!-- WhatsApp Card -->
        <div class="method-card whatsapp-card" @click="openWhatsApp">
          <div class="card-glow"></div>
          <div class="method-content">
            <div class="method-icon-wrapper whatsapp-bg">
              <Icon name="ph:whatsapp-logo" class="method-icon" />
            </div>
            <div class="method-info">
              <h4>WhatsApp</h4>
              <p>Contact instantané avec notre service admission</p>
              <span class="method-detail">
                <Icon name="ph:lightning" />
                Réponse immédiate
              </span>
            </div>
            <div class="method-arrow">
              <Icon name="ph:arrow-right" />
            </div>
          </div>
          <div class="card-shimmer"></div>
        </div>

        <!-- Messenger Card -->
        <div class="method-card messenger-card" @click="openMessenger">
          <div class="card-glow"></div>
          <div class="method-content">
            <div class="method-icon-wrapper messenger-bg">
              <Icon name="ph:messenger-logo" class="method-icon" />
            </div>
            <div class="method-info">
              <h4>Messenger</h4>
              <p>Discutez avec notre équipe en temps réel</p>
              <span class="method-detail">
                <Icon name="ph:chats" />
                Conversation fluide
              </span>
            </div>
            <div class="method-arrow">
              <Icon name="ph:arrow-right" />
            </div>
          </div>
          <div class="card-shimmer"></div>
        </div>

        <!-- Email Card -->
        <div class="method-card email-card" @click="openEmail">
          <div class="card-glow"></div>
          <div class="method-content">
            <div class="method-icon-wrapper email-bg">
              <Icon name="ph:envelope" class="method-icon" />
            </div>
            <div class="method-info">
              <h4>Email</h4>
              <p>{{ informationData.email }}</p>
              <span class="method-detail">
                <Icon name="ph:file-text" />
                Réponse détaillée
              </span>
            </div>
            <div class="method-arrow">
              <Icon name="ph:arrow-right" />
            </div>
          </div>
          <div class="card-shimmer"></div>
        </div>
      </div>
    </div>

    <!-- Technical Support Section -->
    <div class="technical-support-section">
      <div class="support-card">
        <div class="support-decoration">
          <div class="decoration-circle"></div>
          <div class="decoration-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="support-content">
          <div class="support-icon-wrapper">
            <Icon name="ph:wrench" class="support-icon" />
          </div>

          <div class="support-info">
            <div class="support-badge">
              <Icon name="ph:headset" />
              <span>Support Technique</span>
            </div>
            <h3>Problème lors de l'inscription ?</h3>
            <p>
              Si vous rencontrez des difficultés techniques lors de votre
              processus d'inscription en ligne (erreurs, bugs, problèmes
              d'accès...), notre équipe technique est là pour vous aider.
            </p>

            <div class="support-contact">
              <div class="contact-method-inline" @click="openSupportWhatsApp">
                <div class="inline-icon whatsapp-inline">
                  <Icon name="ph:whatsapp-logo" />
                </div>
                <div class="inline-info">
                  <span class="inline-label"
                    >Contactez le support via WhatsApp</span
                  >
                  <span class="inline-number">{{
                    informationData.supportWhatsappNumber
                  }}</span>
                </div>
                <Icon name="ph:arrow-right" class="inline-arrow" />
              </div>
            </div>
          </div>
        </div>

        <div class="support-footer">
          <div class="footer-item">
            <Icon name="ph:clock" />
            <span>Disponible du Lundi au Vendredi, 8h - 17h</span>
          </div>
          <div class="footer-item">
            <Icon name="ph:shield-check" />
            <span>Assistance gratuite</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info Section -->
    <div class="additional-info-section">
      <div class="info-card location-card">
        <div class="info-icon-wrapper">
          <Icon name="ph:map-pin" class="info-icon" />
        </div>
        <div class="info-content">
          <h4>Notre Adresse</h4>
          <p>{{ informationData.localisation }}</p>
        </div>
      </div>

      <div class="info-card phone-card">
        <div class="info-icon-wrapper">
          <Icon name="ph:phone" class="info-icon" />
        </div>
        <div class="info-content">
          <h4>Téléphone</h4>
          <p>{{ informationData.contact }}</p>
        </div>
      </div>

      <div class="info-card social-card">
        <div class="info-icon-wrapper">
          <Icon name="ph:share-network" class="info-icon" />
        </div>
        <div class="info-content">
          <h4>Réseaux Sociaux</h4>
          <div class="social-links">
            <a
              :href="informationData.facebookLink"
              target="_blank"
              class="social-link facebook"
            >
              <Icon name="ph:facebook-logo" />
            </a>
            <a
              :href="informationData.instagramLink"
              target="_blank"
              class="social-link instagram"
            >
              <Icon name="ph:instagram-logo" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { informationData } from "~/data/information";

const openWhatsApp = () => {
  window.open(`${informationData.whatsappLink}`, "_blank");
};

const openMessenger = () => {
  window.open(`${informationData.messengerLink}`, "_blank");
};

const openEmail = () => {
  window.location.href = `mailto:${informationData.email}?subject=Demande d'information - ISA`;
};

const openSupportWhatsApp = () => {
  window.open(informationData.supportWhatsAppLink, "_blank");
};
</script>

<style scoped>
.contact-info-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  position: relative;
}

/* Floating Shapes */
.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: rgba(var(--primary-color-rgb), 0.15);
  top: -100px;
  right: -100px;
  animation: float1 15s ease-in-out infinite;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: rgba(var(--secondary-color-rgb), 0.12);
  bottom: 200px;
  left: -80px;
  animation: float2 18s ease-in-out infinite;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: rgba(var(--primary-color-rgb), 0.1);
  bottom: -50px;
  right: 10%;
  animation: float3 12s ease-in-out infinite;
}

@keyframes float1 {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-30px, 30px) rotate(180deg);
  }
}

@keyframes float2 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(40px, -20px);
  }
}

@keyframes float3 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, -30px);
  }
}

/* Header Section */
.contact-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2.5rem 2rem;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(var(--primary-color-rgb), 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  position: relative;
  z-index: 1;
}

.excellence-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.1),
    rgba(var(--secondary-color-rgb), 0.1)
  );
  border-radius: 50px;
  margin-bottom: 1rem;
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
}

.excellence-badge .badge-icon {
  color: var(--primary-color);
  font-size: 1rem;
}

.excellence-badge span {
  font-size: 0.85rem;
  font-weight: 600;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.contact-header h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

.contact-subtitle {
  font-size: clamp(1rem, 2vw, 1.1rem);
  color: #555;
  max-width: 600px;
  margin: 0 auto 1.5rem;
  line-height: 1.7;
}

.contact-stats {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.05),
    rgba(var(--secondary-color-rgb), 0.05)
  );
  border-radius: 50px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--primary-color);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.stat-icon-wrapper {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  font-size: 1rem;
  color: white;
}

/* Contact Methods Section */
.contact-methods-section {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.section-text h3 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.25rem;
}

.section-text p {
  font-size: 0.95rem;
  color: #666;
  margin: 0;
}

.contact-methods {
  display: grid;
  gap: 1rem;
}

/* Method Cards */
.method-card {
  position: relative;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.whatsapp-card .card-glow {
  background: linear-gradient(90deg, #25d366, #128c7e);
}

.messenger-card .card-glow {
  background: linear-gradient(90deg, #00b2ff, #006aff);
}

.email-card .card-glow {
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

.method-card:hover .card-glow {
  opacity: 1;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.method-icon-wrapper {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.method-card:hover .method-icon-wrapper {
  transform: scale(1.1);
}

.whatsapp-bg {
  background: linear-gradient(135deg, #25d366, #128c7e);
}

.messenger-bg {
  background: linear-gradient(135deg, #00b2ff, #006aff);
}

.email-bg {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

.method-icon {
  font-size: 1.75rem;
  color: white;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.35rem;
}

.method-info p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.method-detail {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--secondary-color);
  background: rgba(var(--secondary-color-rgb), 0.1);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
}

.method-arrow {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.method-card:hover .method-arrow {
  background: var(--primary-color);
  color: white;
  transform: translateX(5px);
}

.card-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.6s ease;
  pointer-events: none;
}

.method-card:hover .card-shimmer {
  left: 100%;
}

/* Technical Support Section */
.technical-support-section {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.support-card {
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.03),
    rgba(var(--secondary-color-rgb), 0.03)
  );
  border-radius: 24px;
  border: 2px solid rgba(var(--primary-color-rgb), 0.15);
  overflow: hidden;
  position: relative;
}

.support-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  pointer-events: none;
}

.decoration-circle {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.08),
    rgba(var(--secondary-color-rgb), 0.08)
  );
}

.decoration-dots {
  position: absolute;
  top: 30px;
  right: 30px;
  display: flex;
  gap: 6px;
}

.decoration-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(var(--primary-color-rgb), 0.3);
}

.decoration-dots span:nth-child(2) {
  animation: dotPulse 2s ease-in-out infinite 0.3s;
}

.decoration-dots span:nth-child(3) {
  animation: dotPulse 2s ease-in-out infinite 0.6s;
}

@keyframes dotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.support-content {
  display: flex;
  gap: 1.5rem;
  padding: 2rem;
  align-items: flex-start;
}

.support-icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.support-icon {
  font-size: 2rem;
  color: white;
}

.support-info {
  flex: 1;
}

.support-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  background: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.75rem;
}

.support-info h3 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 0.75rem;
}

.support-info > p {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.7;
  margin: 0 0 1.25rem;
}

.support-contact {
  margin-top: 1rem;
}

.contact-method-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.contact-method-inline:hover {
  border-color: #25d366;
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.15);
  transform: translateY(-2px);
}

.inline-icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.whatsapp-inline {
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: white;
}

.inline-info {
  flex: 1;
}

.inline-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.inline-number {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
}

.inline-arrow {
  font-size: 1.2rem;
  color: #888;
  transition: all 0.3s ease;
}

.contact-method-inline:hover .inline-arrow {
  color: #25d366;
  transform: translateX(5px);
}

.support-footer {
  display: flex;
  gap: 2rem;
  padding: 1.25rem 2rem;
  background: rgba(var(--primary-color-rgb), 0.05);
  border-top: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: #666;
}

.footer-item .iconify {
  color: var(--primary-color);
  font-size: 1.1rem;
}

/* Additional Info Section */
.additional-info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: rgba(var(--primary-color-rgb), 0.3);
  box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.08);
  transform: translateY(-2px);
}

.info-icon-wrapper {
  width: 3rem;
  height: 3rem;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.1),
    rgba(var(--secondary-color-rgb), 0.1)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  font-size: 1.4rem;
  color: var(--primary-color);
}

.info-content h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #888;
  margin: 0 0 0.3rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content p {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.social-links {
  display: flex;
  gap: 0.75rem;
}

.social-link {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.social-link.facebook {
  background: rgba(24, 119, 242, 0.1);
  color: #1877f2;
}

.social-link.instagram {
  background: linear-gradient(
    135deg,
    rgba(253, 89, 73, 0.1),
    rgba(193, 53, 132, 0.1)
  );
  color: #c13584;
}

.social-link:hover {
  transform: scale(1.1);
}

.social-link.facebook:hover {
  background: #1877f2;
  color: white;
}

.social-link.instagram:hover {
  background: linear-gradient(135deg, #fd5949, #c13584);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-info-container {
    padding: 2rem 1rem;
  }

  .contact-header {
    padding: 2rem 1.5rem;
    border-radius: 20px;
  }

  .contact-stats {
    gap: 0.75rem;
  }

  .stat {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .stat-icon-wrapper {
    width: 1.75rem;
    height: 1.75rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .method-content {
    padding: 1.25rem;
  }

  .method-icon-wrapper {
    width: 3rem;
    height: 3rem;
  }

  .method-icon {
    font-size: 1.5rem;
  }

  .support-content {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
  }

  .support-icon-wrapper {
    width: 3.5rem;
    height: 3.5rem;
  }

  .support-icon {
    font-size: 1.75rem;
  }

  .support-footer {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
  }

  .additional-info-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .contact-header {
    padding: 1.5rem 1rem;
  }

  .excellence-badge {
    padding: 0.4rem 1rem;
  }

  .stat {
    width: 100%;
    justify-content: center;
  }

  .method-info h4 {
    font-size: 1.05rem;
  }

  .method-info p {
    font-size: 0.85rem;
  }

  .support-info h3 {
    font-size: 1.2rem;
  }

  .contact-method-inline {
    flex-wrap: wrap;
  }

  .inline-info {
    flex: 1 1 60%;
  }
}
</style>
