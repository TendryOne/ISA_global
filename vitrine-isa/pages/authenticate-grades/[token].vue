<template>
  <div class="authentication-page">
    <!-- Decorative Elements -->
    <div class="bg-pattern"></div>
    <div class="floating-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="authentication-container">
      <!-- Premium Header -->
      <div class="page-header">
        <RouterLink to="/" class="logo-wrapper">
          <img src="/logo-write.svg" alt="ISA Logo" class="logo" width="280" />
          <div class="logo-glow"></div>
        </RouterLink>
        <div class="header-divider">
          <span class="divider-line"></span>
          <Icon name="ph:graduation-cap-fill" class="divider-icon" />
          <span class="divider-line"></span>
        </div>
        <h1 class="page-title">Portail de Vérification Académique</h1>
        <p class="page-subtitle">
          <Icon name="ph:seal-check" class="subtitle-icon" />
          Système d'Authentification Officiel des Documents
        </p>
        <div class="institution-badge">
          <span>Institut Supérieur d'Ambatomirahavavy</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="status-card loading-state">
        <div class="card-header-accent"></div>
        <div class="status-icon-wrapper loading">
          <div class="icon-ring">
            <Icon
              name="svg-spinners:ring-resize"
              class="status-icon spinning"
            />
          </div>
        </div>
        <h2 class="status-title">Analyse du Document</h2>
        <p class="status-message">
          Notre système procède à la vérification cryptographique de votre
          relevé de notes auprès de nos registres officiels.
        </p>
        <div class="loading-steps">
          <div class="step active">
            <Icon name="ph:check-circle-fill" />
            <span>Connexion sécurisée</span>
          </div>
          <div class="step processing">
            <Icon name="svg-spinners:pulse-3" />
            <span>Vérification en cours</span>
          </div>
          <div class="step">
            <Icon name="ph:circle" />
            <span>Génération du rapport</span>
          </div>
        </div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="errorServer" class="status-card error-state">
        <div class="card-header-accent error-accent"></div>
        <div class="status-icon-wrapper error">
          <div class="icon-ring error-ring">
            <Icon name="ph:warning-circle-fill" class="status-icon" />
          </div>
          <div class="pulse-effect error-pulse"></div>
        </div>
        <h2 class="status-title error-title">Erreur de Vérification</h2>
        <p class="status-message">{{ errorServer }}</p>
        <div class="error-details">
          <Icon name="ph:info" class="details-icon" />
          <span
            >Le système n'a pas pu effectuer la vérification. Veuillez réessayer
            ou contacter notre service académique.</span
          >
        </div>
        <div class="action-buttons">
          <button class="action-btn retry-btn" @click="checkToken">
            <Icon name="ph:arrow-clockwise" />
            Réessayer la vérification
          </button>
          <NuxtLink to="/contact" class="action-btn contact-btn">
            <Icon name="ph:headset" />
            Service Académique
          </NuxtLink>
        </div>
      </div>

      <!-- Processing State (authenticated === null) -->
      <div
        v-else-if="isAuthenticated === null"
        class="status-card processing-state"
      >
        <div class="card-header-accent processing-accent"></div>
        <div class="status-icon-wrapper processing">
          <div class="icon-ring processing-ring">
            <Icon name="ph:hourglass-medium-fill" class="status-icon" />
          </div>
          <div class="pulse-effect processing-pulse"></div>
        </div>
        <div class="status-badge pending-badge">
          <Icon name="ph:clock" />
          En attente
        </div>
        <h2 class="status-title processing-title">
          Document en Cours de Traitement
        </h2>
        <p class="status-message">
          Ce relevé de notes est actuellement en cours de validation par notre
          commission académique.
        </p>
        <div class="info-box processing-info">
          <div class="info-icon-wrapper">
            <Icon name="ph:file-search" class="info-icon" />
          </div>
          <div class="info-content">
            <strong>Statut : Validation Administrative</strong>
            <p>
              Le document est en cours d'examen par nos services. La
              vérification sera disponible sous peu.
            </p>
          </div>
        </div>
        <div class="timeline">
          <div class="timeline-item completed">
            <div class="timeline-dot"></div>
            <span>Document soumis</span>
          </div>
          <div class="timeline-item active">
            <div class="timeline-dot"></div>
            <span>Validation en cours</span>
          </div>
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <span>Confirmation finale</span>
          </div>
        </div>
      </div>

      <!-- Not Authentic State (authenticated === false) -->
      <div
        v-else-if="isAuthenticated === false"
        class="status-card invalid-state"
      >
        <div class="card-header-accent invalid-accent"></div>
        <div class="status-icon-wrapper invalid">
          <div class="icon-ring invalid-ring">
            <Icon name="ph:x-circle-fill" class="status-icon" />
          </div>
          <div class="pulse-effect invalid-pulse"></div>
        </div>
        <div class="status-badge invalid-badge">
          <Icon name="ph:shield-warning" />
          Non Vérifié
        </div>
        <h2 class="status-title invalid-title">Document Non Reconnu</h2>
        <p class="status-message">
          Ce relevé de notes n'a pas pu être authentifié dans nos registres
          officiels.
        </p>
        <div class="warning-box">
          <div class="warning-header">
            <Icon name="ph:warning-fill" class="warning-icon" />
            <strong>Raisons possibles</strong>
          </div>
          <ul class="warning-list">
            <li><Icon name="ph:x" />Document non émis par notre institution</li>
            <li><Icon name="ph:x" />Relevé de notes expiré ou révoqué</li>
            <li>
              <Icon name="ph:x" />Lien de vérification incorrect ou altéré
            </li>
          </ul>
        </div>
        <div class="action-buttons">
          <NuxtLink to="/contact" class="action-btn contact-btn-alt">
            <Icon name="ph:envelope" />
            Contacter l'Administration
          </NuxtLink>
        </div>
      </div>

      <!-- Authentic State (authenticated === true) -->
      <div v-else class="status-card valid-state">
        <div class="card-header-accent valid-accent"></div>
        <div class="status-icon-wrapper valid">
          <div class="icon-ring valid-ring">
            <Icon name="ph:seal-check-fill" class="status-icon" />
          </div>
          <div class="pulse-effect valid-pulse"></div>
          <div class="confetti-burst">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="status-badge valid-badge">
          <Icon name="ph:certificate" />
          Certifié Authentique
        </div>
        <h2 class="status-title valid-title">
          Document Officiellement Authentifié
        </h2>
        <p class="status-message">
          Ce relevé de notes est reconnu et validé par l'Institut Supérieur
          d'Ambatomirahavavy.
        </p>
        <div class="success-box">
          <div class="success-icon-wrapper">
            <Icon name="ph:check-circle-fill" class="success-icon" />
          </div>
          <div class="success-content">
            <strong>Certification Officielle</strong>
            <p>
              Ce document académique figure dans nos registres officiels et
              conserve sa pleine validité.
            </p>
          </div>
        </div>
        <div class="verification-certificate">
          <div class="certificate-header">
            <Icon name="ph:stamp" class="certificate-icon" />
            <span>Certificat de Vérification</span>
          </div>
          <div class="certificate-body">
            <div class="certificate-row">
              <span class="label">Date de vérification</span>
              <span class="value">{{ currentDate }}</span>
            </div>
            <div class="certificate-row">
              <span class="label">Statut</span>
              <span class="value status-valid"
                ><Icon name="ph:check" /> Valide</span
              >
            </div>
            <div class="certificate-row">
              <span class="label">Émetteur</span>
              <span class="value">ISA - Service Académique</span>
            </div>
          </div>
          <div class="certificate-seal">
            <Icon name="ph:seal-check-fill" />
          </div>
        </div>
      </div>

      <!-- Premium Footer -->
      <div class="footer-info">
        <div class="footer-content">
          <div class="footer-security">
            <Icon name="ph:shield-checkered-fill" class="footer-icon" />
            <div>
              <strong>Vérification Sécurisée</strong>
              <p>Connexion chiffrée SSL/TLS 256 bits</p>
            </div>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-contact">
            <p>En cas de question, contactez le service académique de l'ISA</p>
            <NuxtLink to="/contact" class="footer-link">
              <Icon name="ph:arrow-right" /> Nous contacter
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="copyright">
        <p>
          © {{ new Date().getFullYear() }} Institut Supérieur d'Ambatomirahavavy
          - Tous droits réservés
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from "axios";

const errorServer = ref<string>("");
const loading = ref<boolean>(true);
const isAuthenticated = ref<boolean | null>(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const checkToken = async () => {
  loading.value = true;
  errorServer.value = "";

  try {
    const response = await axios.get("/api/v1/gradesAuthentication", {
      params: {
        token: useRoute().params.token,
      },
    });

    isAuthenticated.value = response.data.authenticated;
  } catch (error: unknown) {
    const axiosError = error as {
      response?: { data?: { message?: string } | string };
    };
    if (axiosError.response) {
      const data = axiosError.response.data;
      if (typeof data === "string") {
        errorServer.value =
          data || "Une erreur est survenue lors de la vérification";
      } else {
        errorServer.value =
          data?.message || "Une erreur est survenue lors de la vérification";
      }
    } else if ((error as { request?: unknown }).request) {
      errorServer.value =
        "Impossible de contacter le serveur. Vérifiez votre connexion internet.";
    } else {
      errorServer.value = "Une erreur inattendue s'est produite";
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  checkToken();
});

useHead({
  title: "Vérification de Relevé de Notes - ISA",
  meta: [
    {
      name: "description",
      content:
        "Vérifiez l'authenticité de votre relevé de notes de l'Institut Supérieur d'Ambatomirahavavy",
    },
  ],
});

definePageMeta({
  layout: "nothing",
});
</script>

<style scoped>
.authentication-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

/* Background Pattern */
.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(
      rgba(var(--primary-color-rgb), 0.1) 1px,
      transparent 1px
    ),
    radial-gradient(rgba(var(--primary-color-rgb), 0.05) 1px, transparent 1px);
  background-size: 50px 50px, 25px 25px;
  background-position: 0 0, 12.5px 12.5px;
  pointer-events: none;
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
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  top: -100px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  bottom: -50px;
  left: -50px;
  animation: float 25s ease-in-out infinite reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: var(--primary-color);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-30px) rotate(5deg);
  }
  66% {
    transform: translateY(20px) rotate(-5deg);
  }
}

.authentication-container {
  width: 100%;
  max-width: 650px;
  position: relative;
  z-index: 1;
}

/* Premium Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 25px;
}

.logo {
  width: 280px;
  height: auto;
  filter: drop-shadow(0 0 30px rgba(var(--primary-color-rgb), 0.3));
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(var(--primary-color-rgb), 0.2) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.header-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.divider-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--primary-color-rgb), 0.5),
    transparent
  );
}

.divider-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
}

.subtitle-icon {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.institution-badge {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.2) 0%,
    rgba(var(--primary-color-rgb), 0.1) 100%
  );
  border: 1px solid rgba(var(--primary-color-rgb), 0.3);
  border-radius: 30px;
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Status Card Base */
.status-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  padding: 50px 40px;
  text-align: center;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.card-header-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--primary-color-light)
  );
}

.error-accent {
  background: linear-gradient(90deg, var(--error), #f87171);
}

.processing-accent {
  background: linear-gradient(90deg, var(--warning), #fbbf24);
}

.invalid-accent {
  background: linear-gradient(90deg, var(--error), #dc2626);
}

.valid-accent {
  background: linear-gradient(90deg, var(--secondary-color), #34d399);
}

.status-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-color-rgb), 0.1) 0%,
    rgba(var(--primary-color-rgb), 0.05) 100%
  );
  border: 2px solid rgba(var(--primary-color-rgb), 0.2);
}

.error-ring {
  background: linear-gradient(
    135deg,
    rgba(235, 77, 75, 0.1) 0%,
    rgba(235, 77, 75, 0.05) 100%
  );
  border-color: rgba(235, 77, 75, 0.2);
}

.processing-ring {
  background: linear-gradient(
    135deg,
    rgba(255, 165, 0, 0.1) 0%,
    rgba(255, 165, 0, 0.05) 100%
  );
  border-color: rgba(255, 165, 0, 0.2);
}

.invalid-ring {
  background: linear-gradient(
    135deg,
    rgba(235, 77, 75, 0.1) 0%,
    rgba(235, 77, 75, 0.05) 100%
  );
  border-color: rgba(235, 77, 75, 0.2);
}

.valid-ring {
  background: linear-gradient(
    135deg,
    rgba(var(--secondary-color-rgb), 0.15) 0%,
    rgba(var(--secondary-color-rgb), 0.05) 100%
  );
  border-color: rgba(var(--secondary-color-rgb), 0.3);
}

.status-icon {
  font-size: 3.5rem;
  z-index: 2;
  position: relative;
}

.pulse-effect {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  animation: pulse 2s infinite;
  z-index: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
}

.pending-badge {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.invalid-badge {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.valid-badge {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #166534;
}

.status-title {
  font-size: 1.7rem;
  font-weight: 800;
  margin-bottom: 15px;
  color: var(--black);
}

.status-message {
  font-size: 1rem;
  color: var(--gray);
  line-height: 1.7;
  margin-bottom: 30px;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

/* Loading State */
.loading-state .status-icon {
  color: var(--primary-color);
}

.loading-steps {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.loading-steps .step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--gray-light);
  transition: all 0.3s ease;
}

.loading-steps .step.active {
  color: var(--secondary-color);
}

.loading-steps .step.processing {
  color: var(--primary-color);
  font-weight: 600;
}

.loading-bar {
  width: 100%;
  height: 6px;
  background: var(--gray-super-light);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
}

.loading-progress {
  height: 100%;
  width: 30%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 200% 100%;
  border-radius: 3px;
  animation: loading 2s ease-in-out infinite, shimmer 2s linear infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Error State */
.error-state .status-icon {
  color: var(--error);
}

.error-title {
  color: var(--error);
}

.error-pulse {
  background: rgba(235, 77, 75, 0.15);
}

.error-details {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-left: 4px solid var(--error);
  padding: 18px 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  text-align: left;
  margin-bottom: 30px;
}

.error-details .details-icon {
  color: var(--error);
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.error-details span {
  color: #7f1d1d;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Processing State */
.processing-state .status-icon {
  color: var(--warning);
}

.processing-title {
  color: #b45309;
}

.processing-pulse {
  background: rgba(255, 165, 0, 0.15);
}

.info-box {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-left: 4px solid var(--warning);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  margin-bottom: 25px;
}

.info-icon-wrapper {
  width: 45px;
  height: 45px;
  background: rgba(255, 165, 0, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-box .info-icon {
  color: var(--warning);
  font-size: 1.4rem;
}

.info-content strong {
  display: block;
  color: #92400e;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.info-content p {
  color: #a16207;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.timeline {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: 0 25px;
}

.timeline-item:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 8px;
  right: -15px;
  width: 30px;
  height: 2px;
  background: var(--gray-light);
}

.timeline-item.completed:not(:last-child)::after {
  background: var(--secondary-color);
}

.timeline-item.active:not(:last-child)::after {
  background: linear-gradient(90deg, var(--warning), var(--gray-light));
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--gray-light);
  border: 3px solid white;
  box-shadow: 0 0 0 2px var(--gray-light);
}

.timeline-item.completed .timeline-dot {
  background: var(--secondary-color);
  box-shadow: 0 0 0 2px var(--secondary-color);
}

.timeline-item.active .timeline-dot {
  background: var(--warning);
  box-shadow: 0 0 0 2px var(--warning), 0 0 10px rgba(255, 165, 0, 0.5);
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    box-shadow: 0 0 0 2px var(--warning), 0 0 10px rgba(255, 165, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 0 4px var(--warning), 0 0 20px rgba(255, 165, 0, 0.8);
  }
}

.timeline-item span {
  font-size: 0.75rem;
  color: var(--gray);
  white-space: nowrap;
}

.timeline-item.active span {
  color: var(--warning);
  font-weight: 600;
}

.timeline-item.completed span {
  color: var(--secondary-color);
}

/* Invalid State */
.invalid-state .status-icon {
  color: var(--error);
}

.invalid-title {
  color: var(--error);
}

.invalid-pulse {
  background: rgba(235, 77, 75, 0.15);
}

.warning-box {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: left;
  margin-bottom: 30px;
  border: 1px solid rgba(235, 77, 75, 0.2);
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(235, 77, 75, 0.15);
}

.warning-box .warning-icon {
  color: var(--error);
  font-size: 1.4rem;
}

.warning-header strong {
  color: #991b1b;
  font-size: 0.95rem;
}

.warning-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.warning-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7f1d1d;
  font-size: 0.9rem;
  padding: 8px 0;
}

.warning-list li:not(:last-child) {
  border-bottom: 1px dashed rgba(235, 77, 75, 0.15);
}

/* Valid State */
.valid-state .status-icon {
  color: var(--secondary-color);
}

.valid-title {
  color: var(--secondary-color);
}

.valid-pulse {
  background: rgba(var(--secondary-color-rgb), 0.15);
}

.confetti-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.confetti-burst span {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: confetti 1s ease-out forwards;
}

.confetti-burst span:nth-child(1) {
  background: var(--secondary-color);
  animation-delay: 0s;
  --i: 1;
  --j: 1;
}
.confetti-burst span:nth-child(2) {
  background: var(--primary-color);
  animation-delay: 0.1s;
  --i: 5;
  --j: 2;
}
.confetti-burst span:nth-child(3) {
  background: #fbbf24;
  animation-delay: 0.2s;
  --i: 2;
  --j: 3;
}
.confetti-burst span:nth-child(4) {
  background: var(--secondary-color);
  animation-delay: 0.3s;
  --i: 4;
  --j: 1;
}
.confetti-burst span:nth-child(5) {
  background: var(--primary-color);
  animation-delay: 0.4s;
  --i: 3;
  --j: 3;
}

@keyframes confetti {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(
        calc((var(--i, 1) - 3) * 40px),
        calc((var(--j, 1) - 2) * -60px)
      )
      scale(0);
  }
}

.success-box {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-left: 4px solid var(--secondary-color);
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  text-align: left;
  margin-bottom: 25px;
}

.success-icon-wrapper {
  width: 45px;
  height: 45px;
  background: rgba(var(--secondary-color-rgb), 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.success-box .success-icon {
  color: var(--secondary-color);
  font-size: 1.4rem;
}

.success-content strong {
  display: block;
  color: #166534;
  margin-bottom: 6px;
  font-size: 0.95rem;
}

.success-content p {
  color: #15803d;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.verification-certificate {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px solid rgba(var(--secondary-color-rgb), 0.3);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.certificate-header {
  background: linear-gradient(135deg, var(--secondary-color) 0%, #34d399 100%);
  color: white;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
}

.certificate-icon {
  font-size: 1.3rem;
}

.certificate-body {
  padding: 20px;
}

.certificate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.certificate-row:last-child {
  border-bottom: none;
}

.certificate-row .label {
  color: var(--gray);
  font-size: 0.85rem;
}

.certificate-row .value {
  font-weight: 600;
  color: var(--black);
  font-size: 0.9rem;
}

.certificate-row .status-valid {
  color: var(--secondary-color);
  display: flex;
  align-items: center;
  gap: 5px;
}

.certificate-seal {
  position: absolute;
  bottom: 15px;
  right: 15px;
  font-size: 3rem;
  color: rgba(var(--secondary-color-rgb), 0.15);
  transform: rotate(-15deg);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.retry-btn {
  background: linear-gradient(135deg, var(--primary-color) 0%, #3a7bd5 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(var(--primary-color-rgb), 0.3);
}

.contact-btn {
  background: white;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
}

.contact-btn-alt {
  background: linear-gradient(135deg, var(--gray-dark) 0%, #475569 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Premium Footer */
.footer-info {
  margin-top: 30px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-security {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.footer-icon {
  font-size: 2rem;
  color: var(--primary-color);
}

.footer-security strong {
  display: block;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.footer-security p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
}

.footer-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
}

.footer-contact {
  flex: 1;
  text-align: right;
}

.footer-contact p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0 0 8px 0;
}

.footer-link {
  color: var(--primary-color);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: white;
}

.copyright {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
}

.copyright p {
  margin: 0;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(250%);
  }
  100% {
    transform: translateX(-100%);
  }
}

/* Responsive */
@media (max-width: 700px) {
  .authentication-page {
    padding: 20px 15px;
  }

  .status-card {
    padding: 40px 25px;
    border-radius: 20px;
  }

  .page-title {
    font-size: 1.4rem;
  }

  .status-title {
    font-size: 1.4rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-security {
    flex-direction: column;
    text-align: center;
  }

  .footer-divider {
    width: 100%;
    height: 1px;
  }

  .footer-contact {
    text-align: center;
  }

  .timeline {
    flex-direction: column;
    gap: 0;
  }

  .timeline-item {
    flex-direction: row;
    padding: 15px 0;
  }

  .timeline-item:not(:last-child)::after {
    top: auto;
    right: auto;
    left: 7px;
    bottom: -10px;
    width: 2px;
    height: 20px;
  }

  .loading-steps {
    flex-direction: column;
    gap: 12px;
  }

  .logo {
    width: 220px;
  }

  .certificate-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
