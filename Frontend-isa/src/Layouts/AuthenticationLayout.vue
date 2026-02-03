<template>
  <div class="university-portal" ref="portalContainer">
    <!-- Canvas pour les particules avancées -->
    <canvas ref="particlesCanvas" class="particles-canvas"></canvas>

    <!-- Effet de lumière ambient -->
    <div class="ambient-light ambient-light-1"></div>
    <div class="ambient-light ambient-light-2"></div>

    <!-- Carte principale -->
    <div class="portal-card">
      <!-- Badge universitaire -->
      <div class="university-badge">
        <Icon icon="ph:seal-check-fill" />
        <span>Espace Sécurisé</span>
      </div>

      <!-- En-tête avec effet de lumière -->
      <div class="portal-header">
        <div class="logo-glow-container" @click="router.push('/')">
          <div class="logo-ring"></div>
          <div class="logo-ring logo-ring-2"></div>
          <img src="/logo300x300.svg" alt="University Logo" class="university-logo" loading="lazy" />
          <div class="logo-halo"></div>
        </div>

        <div class="title-group">
          <div class="institution-badge">
            <Icon icon="ph:graduation-cap-fill" />
            <span>Institut d'Excellence</span>
          </div>
          <h1 class="portal-title">Portail <span>Universitaire</span></h1>
          <div class="animated-underline">
            <div class="underline-glow"></div>
          </div>
          <!-- <p class="portal-subtitle">
            <Icon icon="ph:shield-check" class="subtitle-icon" />
            Accès sécurisé à votre espace académique
          </p> -->
        </div>
      </div>

      <!-- Contenu dynamique -->
      <div class="portal-content">
        <RouterView />
      </div>

      <!-- Pied de page -->
      <div class="portal-footer">
        <div class="footer-links">
          <RouterLink to="/help" class="footer-link">
            <span class="link-icon">
              <Icon icon="ph:question-fill" />
            </span>
            <span class="link-text">Centre d'aide</span>
          </RouterLink>
          <span class="footer-divider"></span>
          <RouterLink to="/contact" class="footer-link">
            <span class="link-icon">
              <Icon icon="ph:envelope-fill" />
            </span>
            <span class="link-text">Contact</span>
          </RouterLink>
        </div>
        <div class="copyright-notice">
          <Icon icon="ph:copyright" class="copyright-icon" />
          {{ new Date().getFullYear() }} Institut Supérieur Ambatomirahavavy — Tous droits réservés
        </div>
      </div>
    </div>

    <!-- Éléments décoratifs -->
    <div class="decorative-elements">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const portalContainer = ref<HTMLElement | null>(null)
const particlesCanvas = ref<HTMLCanvasElement | null>(null)

// Configuration des particules avancées
interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  angle: number
  rotationSpeed: number
}

let particles: Particle[] = []
let animationFrameId: number | null = null
const particleColors = [
  'rgba(80, 134, 193, 0.7)',  // primary
  'rgba(48, 168, 85, 0.7)',  // secondary
  'rgba(255, 255, 255, 0.9)' // white
]

const initParticles = () => {
  if (!particlesCanvas.value || !portalContainer.value) return

  const canvas = particlesCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Ajustement responsive
  const resizeCanvas = () => {
    canvas.width = portalContainer.value!.offsetWidth * window.devicePixelRatio
    canvas.height = portalContainer.value!.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  }
  resizeCanvas()

  // Création des particules avec différentes formes
  const createParticles = () => {
    const particleCount = Math.min(Math.floor(window.innerWidth / 10), 100)
    return Array.from({ length: particleCount }, () => {
      const size = Math.random() * 4 + 2
      const speed = Math.random() * 0.5 + 0.1
      const angle = Math.random() * Math.PI * 2

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        opacity: Math.random() * 0.4 + 0.1,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        angle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      }
    })
  }

  particles = createParticles()

  // Animation des particules avec connexions
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dessiner les connexions entre particules
    ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`
    ctx.lineWidth = 0.5

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 150) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    // Dessiner les particules
    particles.forEach(p => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)

      // Formes différentes pour variété
      if (Math.random() > 0.7) {
        // Carrés
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
      } else if (Math.random() > 0.5) {
        // Triangles
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.beginPath()
        ctx.moveTo(0, -p.size / 2)
        ctx.lineTo(p.size / 2, p.size / 2)
        ctx.lineTo(-p.size / 2, p.size / 2)
        ctx.closePath()
        ctx.fill()
      } else {
        // Cercles
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      // Mise à jour position
      p.x += p.speedX
      p.y += p.speedY
      p.angle += p.rotationSpeed

      // Rebond sur les bords
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1

      // Changement aléatoire de direction
      if (Math.random() < 0.01) {
        p.speedX = (Math.random() - 0.5) * 0.5
        p.speedY = (Math.random() - 0.5) * 0.5
      }
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  // Interaction souris
  let mouseX = -1000
  let mouseY = -1000

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    mouseX = (e.clientX - rect.left) * window.devicePixelRatio
    mouseY = (e.clientY - rect.top) * window.devicePixelRatio
  }

  const handleMouseLeave = () => {
    mouseX = -1000
    mouseY = -1000
  }

  // Effet de répulsion des particules
  const repelParticles = () => {
    const repelRadius = 100
    const repelForce = 0.1

    particles.forEach(p => {
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < repelRadius && mouseX > 0) {
        const angle = Math.atan2(dy, dx)
        const force = (repelRadius - distance) / repelRadius * repelForce

        p.speedX += Math.cos(angle) * force
        p.speedY += Math.sin(angle) * force
      }
    })
  }

  // Animation combinée
  const combinedAnimate = () => {
    repelParticles()
    animate()
  }

  // Événements
  canvas.addEventListener('mousemove', handleMouseMove)
  canvas.addEventListener('mouseleave', handleMouseLeave)
  window.addEventListener('resize', resizeCanvas)

  // Démarrer l'animation
  animationFrameId = requestAnimationFrame(combinedAnimate)

  // Nettoyage
  onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    canvas.removeEventListener('mousemove', handleMouseMove)
    canvas.removeEventListener('mouseleave', handleMouseLeave)
    window.removeEventListener('resize', resizeCanvas)
  })
}

onMounted(() => {
  initParticles()
})
</script>

<style scoped>
.university-portal {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a1628 0%, #1a2d4a 50%, #0e1a2e 100%);
  overflow: hidden;
  padding: 1rem;
}

/* Lumières ambiantes */
.ambient-light {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
}

.ambient-light-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
  top: -15%;
  left: -10%;
  animation: ambientFloat 8s ease-in-out infinite;
}

.ambient-light-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--secondary-color) 0%, transparent 70%);
  bottom: -10%;
  right: -10%;
  animation: ambientFloat 10s ease-in-out infinite reverse;
}

@keyframes ambientFloat {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(30px, -20px) scale(1.1);
  }
}

.particles-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

/* Éléments décoratifs flottants */
.decorative-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.1) 0%, rgba(48, 168, 85, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  right: 5%;
  animation: floatShape 15s ease-in-out infinite;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  left: 8%;
  animation: floatShape 12s ease-in-out infinite reverse;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 5%;
  animation: floatShape 18s ease-in-out infinite 2s;
}

@keyframes floatShape {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(20px, -30px) rotate(5deg);
  }

  50% {
    transform: translate(-10px, 20px) rotate(-3deg);
  }

  75% {
    transform: translate(15px, 10px) rotate(2deg);
  }
}

.portal-card {
  position: relative;
  z-index: 10;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 24px;
  padding: 2.5rem 3rem 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow:
    0 25px 80px rgba(0, 0, 0, 0.25),
    0 10px 30px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: cardEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  overflow: hidden;
}

.portal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--primary-color));
  background-size: 200% 100%;
  animation: gradientSlide 3s linear infinite;
}

@keyframes gradientSlide {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}

/* Badge universitaire */
.university-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, rgba(48, 168, 85, 0.1) 0%, rgba(48, 168, 85, 0.05) 100%);
  border: 1px solid rgba(48, 168, 85, 0.2);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--secondary-dark);
  letter-spacing: 0.3px;
}

.university-badge svg {
  font-size: 0.875rem;
  color: var(--secondary-color);
}

.portal-header {
  text-align: center;
  /* margin-bottom: 2rem; */
  position: relative;
}

.logo-glow-container {
  display: inline-block;
  position: relative;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-glow-container:hover {
  transform: scale(1.08) rotate(-3deg);
}

.logo-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 2px solid rgba(80, 134, 193, 0.2);
  animation: ringPulse 3s ease-in-out infinite;
}

.logo-ring-2 {
  width: 140px;
  height: 140px;
  border-color: rgba(48, 168, 85, 0.15);
  animation-delay: 1.5s;
}

@keyframes ringPulse {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.2;
  }
}

.university-logo {
  width: 100px;
  height: 100px;
  object-fit: contain;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 8px 20px rgba(80, 134, 193, 0.25));
  transition: filter 0.3s ease;
}

.logo-glow-container:hover .university-logo {
  filter: drop-shadow(0 12px 30px rgba(80, 134, 193, 0.35));
}

.logo-halo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(80, 134, 193, 0.2) 0%, transparent 70%);
  z-index: 1;
  animation: haloPulse 4s ease-in-out infinite alternate;
}

@keyframes haloPulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 0.15;
  }
}

.title-group {
  position: relative;
}

.institution-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.08) 0%, rgba(80, 134, 193, 0.03) 100%);
  border: 1px solid rgba(80, 134, 193, 0.15);
  border-radius: 25px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-color);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.institution-badge svg {
  font-size: 1rem;
}

.portal-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.portal-title span {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.animated-underline {
  height: 3px;
  width: 80px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  margin: 0 auto 1.25rem;
  position: relative;
  overflow: hidden;
  border-radius: 2px;
}

.underline-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  animation: shine 2.5s infinite;
}

.portal-subtitle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--tertiary-dark);
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.3px;
}

.subtitle-icon {
  font-size: 1rem;
  color: var(--secondary-color);
}

.portal-content {
  margin: 1.5rem 0;
}

.portal-footer {
  /* margin-top: 2rem; */
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.footer-divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--tertiary-lighter);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--tertiary-dark);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 0.875rem;
  border-radius: 20px;
}

.footer-link:hover {
  color: var(--primary-color);
  background: rgba(80, 134, 193, 0.08);
  transform: translateY(-2px);
}

.link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary-extra-light) 0%, rgba(80, 134, 193, 0.05) 100%);
  border-radius: 50%;
  font-size: 0.75rem;
  color: var(--primary-color);
}

.copyright-notice {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--tertiary-light);
  font-size: 0.7rem;
  letter-spacing: 0.2px;
}

.copyright-icon {
  font-size: 0.75rem;
}

/* Animations */
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shine {
  0% {
    left: -100%;
  }

  100% {
    left: 200%;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .portal-card {
    padding: 2rem 1.5rem 1.5rem;
    max-width: 95%;
    border-radius: 20px;
  }

  .university-badge {
    top: 1rem;
    right: 1rem;
    font-size: 0.65rem;
    padding: 0.3rem 0.6rem;
  }

  .university-logo {
    width: 80px;
    height: 80px;
  }

  .portal-title {
    font-size: 1.6rem;
  }

  .institution-badge {
    font-size: 0.65rem;
    padding: 0.4rem 0.75rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-divider {
    display: none;
  }

  .ambient-light-1,
  .ambient-light-2 {
    width: 300px;
    height: 300px;
  }
}

/* Accessibilité */
@media (prefers-reduced-motion) {

  .particles-canvas,
  .decorative-elements {
    display: none;
  }

  .portal-card,
  .logo-halo,
  .logo-ring,
  .animated-underline .underline-glow,
  .ambient-light {
    animation: none !important;
  }

  .portal-card::before {
    animation: none;
  }
}
</style>
