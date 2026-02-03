<template>
  <div class="error-page">
    <!-- Animation de fond -->
    <div class="background-animation">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>

    <!-- Contenu principal -->
    <main class="error-content">
      <div class="mascote-container">
        <img src="/mascotte.png" alt="Mascotte universitaire" class="mascote" @click="animateMascote">
        <div class="speech-bubble" v-if="showBubble">{{ bubbleMessage }}</div>
      </div>

      <div class="error-details">
        <h1 class="error-code animate-flicker">{{ error.statusCode || errorCode }}</h1>
        <h2 class="error-title">{{ errorTitle }}</h2>
        <p class="error-message">
          {{ error.message || defaultErrorMessage }}
          <br>
          <span v-if="error.path" class="error-path">URL: {{ error.path }}</span>
        </p>

        <div class="action-buttons">
          <button class="primary-btn" @click="goHome">
            <Icon icon="ph:house" />
            Retour à l'accueil
          </button>
          <button class="secondary-btn" @click="contactSupport">
            <Icon icon="ph:headset" />
            Contacter le support
          </button>
        </div>

        <div class="technical-details" v-if="showTechnicalDetails">
          <button class="toggle-details" @click="toggleDetails">
            <Icon :icon="showDetails ? 'ph:caret-down' : 'ph:caret-right'" />
            Détails techniques
          </button>

          <Transition name="slide-fade">
            <div v-if="showDetails" class="details-content">
              <pre>{{ errorString }}</pre>
              <button class="copy-btn" @click="copyErrorDetails">
                <Icon icon="ph:copy" />
                Copier les détails
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </main>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const props = defineProps({
  error: {
    type: Object,
    default: () => ({
      statusCode: 404,
      message: "La page que vous cherchez semble avoir été déplacée ou n'existe plus.",
      path: window.location.pathname,
      stack: ''
    })
  }
})

const router = useRouter()
const currentYear = new Date().getFullYear()

// Données réactives
const showDetails = ref(false)
const showBubble = ref(false)
const showTechnicalDetails = ref(false)

// Messages par défaut en fonction du code d'erreur
const errorMessages = {
  400: 'Requête incorrecte',
  401: 'Non autorisé',
  403: 'Accès refusé',
  404: 'Page introuvable',
  500: 'Erreur interne du serveur',
  503: 'Service indisponible'
}

const bubbleMessages = {
  400: 'Oops!',
  401: 'Accès refusé!',
  403: 'Interdit!',
  404: 'Perdu?',
  500: 'Bug!',
  503: 'Maintenance!'
}

// Données calculées
const errorCode = computed(() => props.error.statusCode || 500)
const errorTitle = computed(() => errorMessages[errorCode.value] || 'Erreur inattendue')
const defaultErrorMessage = computed(() =>
  `Une erreur est survenue lors du chargement de la page.
  Notre équipe a été notifiée du problème.`
)
const bubbleMessage = computed(() =>
  bubbleMessages[errorCode.value] || 'Erreur!'
)
const errorString = computed(() => JSON.stringify(props.error, null, 2))

// Animation mascotte
const animateMascote = () => {
  showBubble.value = true
  setTimeout(() => {
    showBubble.value = false
  }, 2000)
}

// Actions
const goHome = () => {
  router.push('/')
}

const contactSupport = () => {
  const subject = `Erreur ${errorCode.value} - ${errorTitle.value}`
  const body = `Je rencontre une erreur sur la page: ${window.location.href}`
  window.location.href = `mailto:support@isa-ambato.mg?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
  if (showDetails.value) {
    showTechnicalDetails.value = true
  }
}

const copyErrorDetails = async () => {
  try {
    await navigator.clipboard.writeText(errorString.value)
    showBubble.value = true
    bubbleMessage.value = 'Copié!'
    setTimeout(() => {
      showBubble.value = false
      bubbleMessage.value = bubbleMessages[errorCode.value] || 'Erreur!'
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Animation particules
onMounted(() => {
  // Afficher les détails techniques seulement pour les erreurs 500
  showTechnicalDetails.value = errorCode.value === 500

  const particles = document.querySelectorAll('.particle')
  particles.forEach(particle => {
    const size = Math.random() * 20 + 10
    const posX = Math.random() * 100
    const posY = Math.random() * 100
    const delay = Math.random() * 5
    const duration = Math.random() * 10 + 10

    particle.style.width = `${size}px`
    particle.style.height = `${size}px`
    particle.style.left = `${posX}%`
    particle.style.top = `${posY}%`
    particle.style.animationDelay = `${delay}s`
    particle.style.animationDuration = `${duration}s`
  })
})
</script>

<style scoped>
/* (Le CSS reste identique à la version précédente) */
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--primary-extra-light);
  position: relative;
  overflow: hidden;
}

.background-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.particle {
  position: absolute;
  background-color: var(--primary-color-light);
  border-radius: var(--rounded);
  opacity: 0.3;
  animation: float infinite ease-in-out;
  z-index: 0;
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

.error-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

.mascote-container {
  position: relative;
  transform: translateY(0);
  animation: bounce 3s infinite ease-in-out;
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

.mascote {
  width: 200px;
  height: auto;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mascote:hover {
  transform: scale(1.05);
}

.speech-bubble {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-light);
  font-weight: bold;
  color: var(--primary-dark);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.error-details {
  max-width: 500px;
}

.error-code {
  font-size: 5rem;
  font-weight: 900;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

@keyframes flicker {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.animate-flicker {
  animation: flicker 3s infinite ease-in-out;
}

.error-title {
  font-size: 2rem;
  color: var(--primary-dark);
  margin: 0.5rem 0;
}

.error-message {
  color: var(--gray-dark);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-path {
  font-size: 0.9rem;
  color: var(--gray);
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.primary-btn,
.secondary-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.primary-btn {
  background-color: var(--primary-color);
  color: var(--white);
}

.primary-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.secondary-btn {
  background-color: var(--white);
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.secondary-btn:hover {
  background-color: var(--primary-extra-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.technical-details {
  margin-top: 1rem;
}

.toggle-details {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  color: var(--gray-dark);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius);
}

.toggle-details:hover {
  background-color: var(--primary-extra-light);
}

.details-content {
  margin-top: 0.5rem;
  padding: 1rem;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow-light);
  max-height: 300px;
  overflow: auto;
}

.details-content pre {
  margin: 0;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: var(--gray-dark);
  font-size: 0.8rem;
  cursor: pointer;
}

.copy-btn:hover {
  color: var(--primary-color);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.university-footer {
  background-color: var(--primary-dark);
  color: var(--white);
  padding: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.footer-logo {
  height: 50px;
  margin-bottom: 1rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.footer-links a {
  color: var(--white);
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.copyright {
  font-size: 0.8rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .error-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .mascote {
    width: 150px;
  }
}
</style>
