<template>
  <footer class="university-footer">
    <!-- Vague décorative (conservée comme demandé) -->
    <div class="footer-wave">
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          opacity=".25"
          fill="var(--primary-color)"
        ></path>
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          opacity=".5"
          fill="var(--primary-color)"
        ></path>
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          fill="var(--primary-color)"
        ></path>
      </svg>
    </div>

    <div class="footer-content">
      <!-- Section principale -->
      <div class="footer-main">
        <!-- Logo et description -->
        <div class="footer-brand">
          <div class="logo-container">
            <Icon name="ph:graduation-cap-duotone" class="footer-logo" />
            <span class="logo-text">Institut supérieur d'Ambatomirahavavy</span>
          </div>
          <p class="footer-description">
            L'Institut Supérieur d'Ambatomirahavavy, créant des ponts de savoir
            depuis 2023.
          </p>
          <div class="social-links">
            <a href="#" class="social-icon" aria-label="Facebook">
              <Icon name="ph:facebook-logo-duotone" />
            </a>
            <a href="#" class="social-icon" aria-label="Twitter">
              <Icon name="ph:twitter-logo-duotone" />
            </a>
            <a href="#" class="social-icon" aria-label="Instagram">
              <Icon name="ph:instagram-logo-duotone" />
            </a>
            <a href="#" class="social-icon" aria-label="LinkedIn">
              <Icon name="ph:linkedin-logo-duotone" />
            </a>
            <a href="#" class="social-icon" aria-label="YouTube">
              <Icon name="ph:youtube-logo-duotone" />
            </a>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="footer-links">
          <h3 class="links-title">Navigation</h3>
          <ul>
            <li>
              <NuxtLink to="/" class="link-item">
                <Icon name="ph:caret-right-duotone" class="link-icon" />
                <span>Accueil</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/formations" class="link-item">
                <Icon name="ph:caret-right-duotone" class="link-icon" />
                <span>Formations</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/admission" class="link-item">
                <Icon name="ph:caret-right-duotone" class="link-icon" />
                <span>Admission</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="link-item">
                <Icon name="ph:caret-right-duotone" class="link-icon" />
                <span>Contact</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Informations pratiques -->
        <div class="footer-info">
          <h3 class="info-title">Contacts</h3>
          <ul class="info-list">
            <li class="info-item">
              <Icon name="ph:map-pin-duotone" class="info-icon" />
              <span>{{ informationData.localisation }}</span>
            </li>
            <li class="info-item">
              <a
                :href="`tel:${informationData.contact.trim()}`"
                class="info-link"
              >
                <Icon name="ph:phone-duotone" class="info-icon" />
                <span>{{ informationData.contact }}</span>
              </a>
            </li>
            <li class="info-item">
              <a :href="`mailto:${informationData.email}`" class="info-link">
                <Icon name="ph:envelope-duotone" class="info-icon" />
                <span>{{ informationData.email }}</span>
              </a>
            </li>
            <li class="info-item">
              <Icon name="ph:clock-duotone" class="info-icon" />
              <span>Lun-Ven: 8h30-18h30</span>
            </li>
          </ul>
        </div>

        <!-- Informations complémentaires -->
        <div class="footer-extra">
          <h3 class="extra-title">Besoin d'aide ?</h3>
          <p class="extra-description">
            Notre équipe administrative est à votre disposition pour répondre à
            toutes vos questions.
          </p>
          <NuxtLink to="/contact" class="contact-button">
            <Icon name="ph:chats-circle-duotone" class="button-icon" />
            <span>Nous contacter</span>
          </NuxtLink>
          <div class="quick-links">
            <NuxtLink to="/contact" class="quick-link">
              <Icon name="ph:question-duotone" class="quick-icon" />
              <span>FAQ</span>
            </NuxtLink>
            <NuxtLink to="/admission" class="quick-link">
              <Icon name="ph:user-circle-plus-duotone" class="quick-icon" />
              <span>S'inscrire</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Copyright et liens légaux -->
      <div class="footer-legal">
        <div class="copyright">
          © {{ new Date().getFullYear() }} ISA - Tous droits réservés
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { informationData } from "~/data/information";
</script>

<style scoped>
.university-footer {
  --secondary-color: hsl(220, 80%, 55%);
  --tertiary-color: hsl(230, 70%, 50%);
  --text-color: hsl(0, 0%, 98%);
  --text-muted: hsl(0, 0%, 85%);
  --bg-accent: hsl(210, 100%, 25%);

  position: relative;
  background-color: var(--primary-color);
  color: var(--text-color);
  padding-top: 80px;
  margin-top: 100px;
  font-family: "Inter", sans-serif;
}

.footer-wave {
  position: absolute;
  top: -80px;
  left: 0;
  width: 100%;
  height: 80px;
  overflow: hidden;
  line-height: 0;
  transform: rotate(180deg);
}

.info-link {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
  color: inherit;
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.footer-wave svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 80px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-logo {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--secondary-color);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.footer-description {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 30ch;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.social-icon:hover {
  background: var(--secondary-color);
  transform: translateY(-3px) scale(1.1);
  color: white;
}

.links-title,
.info-title,
.newsletter-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
}

.links-title::after,
.info-title::after,
.newsletter-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--secondary-color);
}

.footer-links ul {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.3s ease;
}

.link-icon {
  width: 1rem;
  height: 1rem;
  color: var(--secondary-color);
  transition: transform 0.3s ease;
}

.link-item:hover {
  color: white;
  transform: translateX(5px);
}

.link-item:hover .link-icon {
  transform: translateX(3px);
}

.info-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  line-height: 1.5;
}

.info-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--secondary-color);
  flex-shrink: 0;
}

.footer-extra {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.extra-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
}

.extra-title::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--secondary-color);
}

.extra-description {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.contact-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--secondary-color),
    var(--tertiary-color)
  );
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.contact-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.contact-button .button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.quick-links {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  text-decoration: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  flex: 1;
}

.quick-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.quick-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--secondary-color);
}

.footer-legal {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.legal-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}

.legal-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: white;
}

.copyright {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Animation de la vague */
.footer-wave path {
  animation: waveAnimation 8s linear infinite alternate;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer-wave {
    top: -60px;
    height: 60px;
  }

  .legal-links {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
}
</style>
