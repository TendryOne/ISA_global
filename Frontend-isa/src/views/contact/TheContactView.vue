<template>
  <div class="contact-page">

    <!-- Hero Section avec glassmorphism -->
    <header class="contact-hero">

      <div class="hero-gradient">

        <div class="gradient-overlay"></div>
        <div class="floating-shapes">
          <div class="floating-shape shape-1"></div>
          <div class="floating-shape shape-2"></div>
          <div class="floating-shape shape-3"></div>
        </div>
      </div>

      <div class="hero-container">
        <BreadCrumbsBack />
        <div class="hero-content-wrapper">
          <div class="hero-header">
            <div class="hero-badge">
              <div class="badge-icon-wrapper">
                <Icon icon="solar:chat-round-call-bold-duotone" class="badge-icon" />
              </div>
              <span class="badge-text">Support ♥</span>
            </div>

            <div class="hero-title-wrapper">
              <div class="title-line"></div>
              <h1 class="hero-title">Contact & Support</h1>
              <div class="title-line"></div>
            </div>

            <p class="hero-subtitle">
              Aidez-nous à améliorer votre expérience en nous contactant via les canaux disponibles ou en signalant un
              bug technique.
            </p>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <Icon icon="solar:clock-circle-bold-duotone" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-value">Moins de 24h</span>
                <span class="stat-label">Temps de réponse</span>
              </div>
            </div>

            <div class="stat-divider"></div>

            <div class="stat-item">
              <Icon icon="solar:user-check-bold-duotone" class="stat-icon" />
              <div class="stat-content">
                <span class="stat-value">Disponible 5j/7</span>
                <span class="stat-label">Support expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Assistant Guide -->
    <div class="assistant-guide">
      <div class="assistant-container">
        <div class="assistant-header">
          <div class="assistant-avatar">
            <Icon icon="solar:lightbulb-minimalistic-bold-duotone" class="assistant-icon" />
          </div>
          <div class="assistant-info">
            <h3>Assistant ISA</h3>
            <p>Conseils pour un contact optimal</p>
          </div>
        </div>

        <div class="assistant-tips">
          <div class="tip">
            <Icon icon="solar:clock-circle-bold" />
            <span>Pour une réponse concernant la scolarité: Messenger , mail ou téléphone</span>
          </div>
          <div class="tip">
            <Icon icon="solar:compass-square-outline" />
            <span>Pour une réponse technique : WhatsApp </span>
          </div>
        </div>

        <router-link to="/help" class="assistant-link">
          <Icon icon="solar:book-bold-duotone" />
          <span>Consulter le centre d'aide</span>
          <Icon icon="solar:arrow-right-bold" />
        </router-link>
      </div>
    </div>

    <!-- Contact Channels Section -->
    <section class="channels-section">
      <div class="section-header">
        <div class="section-title-wrapper">
          <h2 class="section-title">Contacts Support</h2>
          <p class="section-subtitle">Choisissez le canal adapté selon votre besoin : Support technique (WhatsApp) ou
            Support scolarité (Email, Téléphone, Messenger)</p>
        </div>
      </div>

      <div class="channels-grid">
        <!-- WhatsApp -->
        <a href="https://wa.me/261384805260" target="_blank" rel="noopener" class="channel-card channel-whatsapp">
          <div class="channel-header">
            <div class="channel-icon-wrapper">
              <Icon icon="logos:whatsapp-icon" class="channel-icon" />
            </div>
            <div class="channel-badge">
              <span>7/7j 24/24h</span>
            </div>
          </div>

          <div class="channel-content">
            <h3 class="channel-name">WhatsApp - Mkoody</h3>
            <p class="channel-description">Support technique urgent</p>
            <div class="channel-details">
              <div class="detail">
                <Icon icon="solar:clock-circle-bold-duotone" />
                <span>Réponse immédiate</span>
              </div>
              <div class="detail">
                <Icon icon="solar:shield-check-bold-duotone" />
                <span>Support prioritaire</span>
              </div>
            </div>
          </div>

          <div class="channel-number">
            <Icon icon="solar:phone-bold-duotone" />
            <span>+261 38 48 052 60</span>
          </div>

          <div class="channel-action">
            <span>Contacter</span>
            <div class="action-arrow">
              <Icon icon="solar:arrow-right-up-linear" />
            </div>
          </div>
        </a>

        <!-- Messenger -->
        <a href="https://m.me/votrepageuniversite" target="_blank" rel="noopener"
          class="channel-card channel-messenger">
          <div class="channel-header">
            <div class="channel-icon-wrapper">
              <Icon icon="logos:messenger" class="channel-icon" />
            </div>
            <div class="channel-badge">
              <span>Lun-Ven 8h-17h</span>
            </div>
          </div>

          <div class="channel-content">
            <h3 class="channel-name">Messenger</h3>
            <p class="channel-description">Support scolarité - Chat en direct</p>
            <div class="channel-details">
              <div class="detail">
                <Icon icon="solar:clock-circle-bold-duotone" />
                <span>Réponse sous 1h</span>
              </div>
              <div class="detail">
                <Icon icon="solar:users-group-two-rounded-bold-duotone" />
                <span>Équipe dédiée</span>
              </div>
            </div>
          </div>

          <div class="channel-number">
            <Icon icon="solar:hashtag-bold-duotone" />
            <span>@ISA Université</span>
          </div>

          <div class="channel-action">
            <span>Contacter</span>
            <div class="action-arrow">
              <Icon icon="solar:arrow-right-up-linear" />
            </div>
          </div>
        </a>

        <!-- Email -->
        <a :href="`mailto:${UnivesityInformation.emailScolarite}`" class="channel-card channel-email">
          <div class="channel-header">
            <div class="channel-icon-wrapper">
              <Icon icon="solar:letter-bold-duotone" class="channel-icon" />
            </div>
            <div class="channel-badge badge-outline">
              <span>Suivi complet</span>
            </div>
          </div>

          <div class="channel-content">
            <h3 class="channel-name">Email</h3>
            <p class="channel-description">Support scolarité - Demandes formelles</p>
            <div class="channel-details">
              <div class="detail">
                <Icon icon="solar:clock-circle-bold-duotone" />
                <span>Réponse sous 24h</span>
              </div>
              <div class="detail">
                <Icon icon="solar:archive-bold-duotone" />
                <span>Historique conservé</span>
              </div>
            </div>
          </div>

          <div class="channel-number">
            <Icon icon="solar:mailbox-bold-duotone" />
            <span>{{ UnivesityInformation.emailScolarite }}</span>
          </div>

          <div class="channel-action">
            <span>Écrire</span>
            <div class="action-arrow">
              <Icon icon="solar:arrow-right-up-linear" />
            </div>
          </div>
        </a>

        <!-- Téléphone -->
        <a :href="`tel:${UnivesityInformation.phoneNumber}`" class="channel-card channel-phone">
          <div class="channel-header">
            <div class="channel-icon-wrapper">
              <Icon icon="solar:phone-calling-bold-duotone" class="channel-icon" />
            </div>
            <div class="channel-badge">
              <span>Lun-Ven 8h-17h</span>
            </div>
          </div>

          <div class="channel-content">
            <h3 class="channel-name">Téléphone</h3>
            <p class="channel-description">Contact - Communication et scolarité</p>
            <div class="channel-details">
              <div class="detail">
                <Icon icon="solar:clock-circle-bold-duotone" />
                <span>8h - 17h</span>
              </div>
              <div class="detail">
                <Icon icon="solar:headphones-round-bold-duotone" />
                <span>Support vocal</span>
              </div>
            </div>
          </div>

          <div class="channel-number">
            <Icon icon="solar:phone-bold-duotone" />
            <span>{{ UnivesityInformation.phoneNumber }}</span>
          </div>

          <div class="channel-action">
            <span>Appeler</span>
            <div class="action-arrow">
              <Icon icon="solar:arrow-right-up-linear" />
            </div>
          </div>
        </a>
      </div>
    </section>



  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { UnivesityInformation } from '@/data/universityInformation';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';




</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: linear-gradient(135deg,
      var(--tertiary-extra-light) 0%,
      #f8fafc 50%,
      var(--tertiary-extra-light) 100%);
  position: relative;
}

/* Hero Section Luxe */
.contact-hero {
  position: relative;
  padding: 4rem 2rem;
  overflow: hidden;
  background: linear-gradient(135deg,
      var(--primary-dark) 0%,
      var(--primary-color) 50%,
      var(--secondary-color) 100%);
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg,
      rgba(var(--primary-color-rgb), 0.9) 0%,
      rgba(var(--primary-dark-rgb), 0.9) 100%);
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(var(--secondary-color-rgb), 0.1) 0%, transparent 50%);
}

.floating-shapes {
  position: absolute;
  inset: 0;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  filter: blur(40px);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation-delay: 5s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 10s;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.hero-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content-wrapper {
  text-align: center;
  color: white;
}

.hero-header {
  margin-bottom: 3rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
}

.badge-icon-wrapper {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  font-size: 1.1rem;
}

.badge-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.hero-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.title-line {
  flex: 1;
  max-width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem 3rem;
  max-width: 500px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
  color: var(--secondary-color);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.8;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Assistant Guide */
.assistant-guide {
  max-width: 900px;
  margin: -2rem auto 3rem;
  padding: 0 2rem;
  position: relative;
  z-index: 10;
}

.assistant-container {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.assistant-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assistant-icon {
  font-size: 1.8rem;
  color: white;
}

.assistant-info h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
}

.assistant-info p {
  font-size: 0.9rem;
  color: var(--tertiary-color);
  margin: 0.25rem 0 0;
}

.assistant-tips {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(var(--primary-color-rgb), 0.05);
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--tertiary-dark);
  line-height: 1.5;
}

.tip svg {
  color: var(--primary-color);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.tip-warning {
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
}

.tip-warning svg {
  color: #ffc107;
}

.tip-urgent {
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
}

.tip-urgent svg {
  color: #f44336;
}

.tip-info {
  background: rgba(var(--secondary-color-rgb), 0.1);
  border-left: 3px solid var(--secondary-color);
}

.tip-info svg {
  color: var(--secondary-color);
}

.assistant-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--tertiary-extra-light);
  border-radius: 12px;
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 500;
  transition: all 0.3s ease;
}

.assistant-link:hover {
  background: rgba(var(--primary-color-rgb), 0.1);
  transform: translateX(5px);
}

/* Channels Section */
.channels-section {
  max-width: 1200px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-title-wrapper {
  display: inline-block;
  position: relative;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  border-radius: 2px;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--tertiary-color);
  margin-top: 1.5rem;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.channel-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.channel-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}

.channel-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.channel-card:hover::before {
  transform: scaleX(1);
}

.channel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.channel-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.channel-icon-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: currentColor;
  opacity: 0.1;
}

.channel-icon {
  font-size: 2rem;
  position: relative;
  z-index: 1;
}

.channel-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(var(--secondary-color-rgb), 0.1);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--secondary-color);
}

.badge-outline {
  background: transparent;
  border: 1px solid rgba(var(--primary-color-rgb), 0.3);
  color: var(--primary-color);
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--secondary-color);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.channel-content {
  margin-bottom: 1.5rem;
}

.channel-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.channel-description {
  font-size: 0.9rem;
  color: var(--tertiary-color);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.channel-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--tertiary-light);
}

.detail svg {
  font-size: 0.9rem;
}

.channel-number {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--tertiary-extra-light);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
}

.channel-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-lighter);
  color: var(--primary-color);
  font-weight: 500;
}

.action-arrow {
  width: 32px;
  height: 32px;
  background: rgba(var(--primary-color-rgb), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.channel-card:hover .action-arrow {
  background: var(--primary-color);
  color: white;
  transform: translate(3px, -3px);
}

/* Channel Specific Colors */
.channel-whatsapp .channel-icon-wrapper {
  color: #25D366;
}

.channel-messenger .channel-icon-wrapper {
  color: #0084FF;
}

.channel-email .channel-icon-wrapper {
  color: var(--primary-color);
}

.channel-phone .channel-icon-wrapper {
  color: var(--secondary-color);
}

/* Form Section Luxe */
.form-section-luxe {
  max-width: 800px;
  margin: 0 auto 4rem;
  padding: 0 2rem;
}

.form-container {
  position: relative;
}

.form-card-luxe {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  position: relative;
  overflow: hidden;
}

.form-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(var(--primary-color-rgb), 0.05) 0%, transparent 70%);
  opacity: 0.5;
}

.form-header-luxe {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  position: relative;
}

.form-icon-wrapper {
  position: relative;
}

.form-main-icon {
  font-size: 3rem;
  color: var(--primary-color);
  position: relative;
  z-index: 1;
}

.form-icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(circle, rgba(var(--primary-color-rgb), 0.2) 0%, transparent 70%);
  border-radius: 50%;
}

.form-title-wrapper {
  flex: 1;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.form-subtitle {
  font-size: 0.95rem;
  color: var(--tertiary-color);
  line-height: 1.5;
}

.contact-form-luxe {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-grid-luxe {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.textarea-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.textarea-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.textarea-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--tertiary-dark);
}

.textarea-label svg {
  color: var(--primary-color);
}

.char-counter {
  font-size: 0.8rem;
  color: var(--tertiary-light);
}

.textarea-luxe {
  width: 100%;
  padding: 1.25rem;
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 140px;
  transition: all 0.3s ease;
  background: var(--tertiary-extra-light);
}

.textarea-luxe:focus {
  outline: none;
  border-color: var(--primary-color);
  background: white;
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.textarea-luxe::placeholder {
  color: var(--tertiary-light);
}

.textarea-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--tertiary-light);
  padding: 0.5rem 0.75rem;
  background: rgba(var(--primary-color-rgb), 0.05);
  border-radius: 8px;
}

.textarea-hint svg {
  font-size: 0.9rem;
}

.error-text-luxe {
  font-size: 0.85rem;
  color: var(--error);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.form-actions-luxe {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
}

.submit-btn-luxe {
  min-width: 200px;
  justify-content: space-between;
}

.btn-arrow {
  transition: transform 0.3s ease;
}

.submit-btn-luxe:hover .btn-arrow {
  transform: translateX(5px);
}

/* Success Modal */
.success-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  animation: modalIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-success {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
}

.success-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
}

.success-circle {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.success-check {
  font-size: 3.5rem;
  color: white;
}

.success-rings {
  position: absolute;
  inset: -20px;
}

.ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(var(--secondary-color-rgb), 0.3);
  border-radius: 50%;
  animation: ringPulse 2s ease-out infinite;
}

.ring-1 {
  animation-delay: 0s;
}

.ring-2 {
  animation-delay: 0.5s;
}

.ring-3 {
  animation-delay: 1s;
}

@keyframes ringPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }

  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.modal-body {
  margin-bottom: 2rem;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 1rem;
}

.modal-message {
  font-size: 0.95rem;
  color: var(--tertiary-color);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.modal-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--tertiary-extra-light);
  border-radius: 12px;
  padding: 1.25rem;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--tertiary-dark);
}

.info-item svg {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-btn {
  min-width: 140px;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .stat-divider {
    width: 100%;
    height: 1px;
  }
}

@media (max-width: 768px) {
  .contact-hero {
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-title-wrapper {
    gap: 1rem;
  }

  .title-line {
    max-width: 50px;
  }

  .assistant-guide,
  .channels-section,
  .form-section-luxe {
    padding: 0 1.5rem;
  }

  .channels-grid {
    grid-template-columns: 1fr;
  }

  .form-card-luxe {
    padding: 2rem;
  }

  .form-header-luxe {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .form-grid-luxe {
    grid-template-columns: 1fr;
  }

  .modal-success {
    padding: 2rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .form-card-luxe {
    padding: 1.5rem;
  }

  .success-modal {
    padding: 1rem;
  }
}
</style>