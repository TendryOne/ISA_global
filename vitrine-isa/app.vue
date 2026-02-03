<template>
  <div>
    <Transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <!-- Fond premium avec motifs -->
        <div class="premium-background">
          <div class="bg-gradient"></div>
          <div class="bg-pattern"></div>
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
          </div>
        </div>

        <div class="loading-content">
          <!-- Logo avec effet premium -->
          <div class="logo-container">
            <div class="logo-glow"></div>
            <div class="logo-ring">
              <div
                class="ring-segment"
                v-for="i in 8"
                :key="i"
                :style="`--i: ${i}`"
              ></div>
            </div>
            <div class="logo-wrapper">
              <NuxtImg
                src="/logo300x300.svg"
                alt="ISA"
                class="main-logo"
                preload
                loading="eager"
              />
            </div>
            <div class="orbit-particles">
              <div
                class="particle"
                v-for="i in 6"
                :key="i"
                :style="`--i: ${i}`"
              ></div>
            </div>
          </div>

          <!-- Badge d'excellence -->
          <div class="excellence-badge">
            <div class="badge-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span>Institut d'Excellence</span>
          </div>

          <!-- Slogan premium animé -->
          <div class="slogan-container">
            <div class="slogan-decorator left"></div>
            <div class="slogan-content">
              <div class="slogan-main">
                <span
                  class="word"
                  v-for="(word, index) in [
                    'Savoir,',
                    'savoir-faire,',
                    'savoir-être',
                  ]"
                  :key="index"
                  :style="`--delay: ${index * 0.15}s`"
                >
                  {{ word }}
                </span>
              </div>
              <div class="slogan-divider">
                <span class="divider-line"></span>
                <span class="divider-icon">◆</span>
                <span class="divider-line"></span>
              </div>
              <div class="slogan-sub">Bâtissons un avenir responsable</div>
            </div>
            <div class="slogan-decorator right"></div>
          </div>

          <!-- Indicateur de progression premium -->
          <div class="premium-loader">
            <div class="loader-track">
              <div class="loader-fill"></div>
              <div class="loader-shimmer"></div>
            </div>
            <div class="loader-steps">
              <div class="step" v-for="i in 4" :key="i" :style="`--i: ${i}`">
                <div class="step-dot"></div>
              </div>
            </div>
          </div>

          <!-- Message de préparation -->
          <div class="preparation-message">
            <div class="message-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <polyline
                  points="22 4 12 14.01 9 11.01"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span>Préparation de votre espace académique</span>
          </div>
        </div>

        <!-- Footer discret -->
        <div class="loading-footer">
          <span>Institut Supérieur d'Ambatomirahavavy</span>
        </div>
      </div>
    </Transition>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script lang="ts" setup>
const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
  connect();
});

useHead({
  titleTemplate(titleChunk) {
    return titleChunk ? `${titleChunk} - ISA` : `ISA`;
  },
});

const { emit, connect } = useSocket();
</script>

<style scoped>
/* ===== FOND PREMIUM ===== */
.premium-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%);
}

.bg-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(
      rgba(var(--primary-color-rgb), 0.08) 1px,
      transparent 1px
    ),
    radial-gradient(rgba(var(--primary-color-rgb), 0.04) 1px, transparent 1px);
  background-size: 50px 50px, 25px 25px;
  background-position: 0 0, 12.5px 12.5px;
  opacity: 0.5;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  top: -150px;
  right: -100px;
  animation: floatShape 20s ease-in-out infinite;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  bottom: -100px;
  left: -80px;
  animation: floatShape 25s ease-in-out infinite reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: var(--primary-color);
  top: 40%;
  left: 10%;
  animation: floatShape 18s ease-in-out infinite;
  animation-delay: -5s;
}

.shape-4 {
  width: 150px;
  height: 150px;
  background: var(--secondary-color);
  top: 20%;
  right: 15%;
  animation: floatShape 22s ease-in-out infinite reverse;
  animation-delay: -8s;
}

@keyframes floatShape {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 30px) scale(0.95);
  }
  75% {
    transform: translate(20px, 20px) scale(1.02);
  }
}

/* ===== TRANSITION ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.65, 0, 0.35, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== CONTENEUR PRINCIPAL ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 450px;
  text-align: center;
  position: relative;
  z-index: 2;
  padding: 0 20px;
}

/* ===== LOGO CONTAINER ===== */
.logo-container {
  position: relative;
  width: 140px;
  height: 140px;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(var(--primary-color-rgb), 0.3) 0%,
    transparent 70%
  );
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

.logo-ring {
  position: absolute;
  top: -15px;
  left: -15px;
  width: 170px;
  height: 170px;
}

.ring-segment {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg))
    translateY(-80px);
  opacity: 0;
  animation: ringRotate 4s linear infinite;
  animation-delay: calc(var(--i) * 0.15s);
}

@keyframes ringRotate {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg))
      translateY(-80px) scale(0.5);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg + 90deg))
      translateY(-80px) scale(1);
  }
  80% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg + 270deg))
      translateY(-80px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg + 360deg))
      translateY(-80px) scale(0.5);
  }
}

.logo-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  border: 2px solid rgba(var(--primary-color-rgb), 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  animation: logoFloat 4s ease-in-out infinite;
}

.main-logo {
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(var(--primary-color-rgb), 0.3));
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

.orbit-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--secondary-color);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  box-shadow: 0 0 10px var(--secondary-color);
  animation: orbitParticle 6s linear infinite;
  animation-delay: calc(var(--i) * -1s);
}

@keyframes orbitParticle {
  0% {
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 60deg))
      translateX(90px) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 60deg + 360deg))
      translateX(90px) scale(1);
    opacity: 0;
  }
}

/* ===== BADGE D'EXCELLENCE ===== */
.excellence-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0;
  animation: badgeReveal 0.8s ease-out forwards;
  animation-delay: 0.3s;
}

.badge-icon {
  display: flex;
  animation: starPulse 2s ease-in-out infinite;
}

@keyframes starPulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

@keyframes badgeReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== SLOGAN PREMIUM ===== */
.slogan-container {
  display: flex;
  align-items: center;
  gap: 20px;
  opacity: 0;
  animation: sloganReveal 1s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes sloganReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-decorator {
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary-color));
}

.slogan-decorator.right {
  background: linear-gradient(90deg, var(--primary-color), transparent);
}

.slogan-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.slogan-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.word {
  font-size: 1.6rem;
  font-weight: 600;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  transform: translateY(15px);
  animation: wordReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(0.6s + var(--delay));
}

@keyframes wordReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slogan-divider {
  display: flex;
  align-items: center;
  gap: 15px;
  opacity: 0;
  animation: dividerReveal 0.8s ease-out forwards;
  animation-delay: 1.1s;
}

.divider-line {
  width: 40px;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--primary-color-rgb), 0.5),
    transparent
  );
}

.divider-icon {
  color: var(--primary-color);
  font-size: 0.6rem;
  animation: iconRotate 4s linear infinite;
}

@keyframes iconRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dividerReveal {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 1;
    transform: scaleX(1);
  }
}

.slogan-sub {
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 2px;
  opacity: 0;
  animation: subReveal 0.8s ease-out forwards;
  animation-delay: 1.3s;
}

@keyframes subReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== LOADER PREMIUM ===== */
.premium-loader {
  width: 100%;
  max-width: 300px;
  position: relative;
  opacity: 0;
  animation: loaderReveal 0.8s ease-out forwards;
  animation-delay: 1.5s;
}

@keyframes loaderReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loader-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.loader-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color),
    var(--primary-color)
  );
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loaderFill 2s ease-in-out infinite;
}

@keyframes loaderFill {
  0% {
    transform: translateX(-100%);
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    transform: translateX(100%);
    background-position: 0% 50%;
  }
}

.loader-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.loader-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 0 2px;
}

.step {
  position: relative;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(var(--primary-color-rgb), 0.3);
  animation: stepActivate 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.4s);
}

@keyframes stepActivate {
  0%,
  20% {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(var(--primary-color-rgb), 0.3);
    transform: scale(1);
  }
  30%,
  50% {
    background: var(--primary-color);
    border-color: var(--primary-color);
    transform: scale(1.2);
    box-shadow: 0 0 15px var(--primary-color);
  }
  60%,
  100% {
    background: var(--secondary-color);
    border-color: var(--secondary-color);
    transform: scale(1);
    box-shadow: none;
  }
}

/* ===== MESSAGE DE PRÉPARATION ===== */
.preparation-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  opacity: 0;
  animation: messageReveal 0.8s ease-out forwards;
  animation-delay: 1.8s;
}

@keyframes messageReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-icon {
  color: var(--secondary-color);
  display: flex;
  animation: checkDraw 2s ease-in-out infinite;
}

@keyframes checkDraw {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.preparation-message span {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.5px;
}

/* ===== FOOTER ===== */
.loading-footer {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  opacity: 0;
  animation: footerReveal 0.8s ease-out forwards;
  animation-delay: 2s;
}

@keyframes footerReveal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.loading-footer span {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .loading-content {
    gap: 1.5rem;
  }

  .logo-container {
    width: 120px;
    height: 120px;
  }

  .logo-ring {
    width: 150px;
    height: 150px;
    top: -15px;
    left: -15px;
  }

  .ring-segment {
    transform: translate(-50%, -50%) rotate(calc(var(--i) * 45deg))
      translateY(-70px);
  }

  .word {
    font-size: 1.3rem;
  }

  .slogan-decorator {
    width: 30px;
  }

  .excellence-badge {
    font-size: 0.75rem;
    padding: 6px 16px;
  }

  .shape-1,
  .shape-2 {
    width: 250px;
    height: 250px;
  }

  .shape-3,
  .shape-4 {
    display: none;
  }
}

@media (max-width: 480px) {
  .slogan-decorator {
    display: none;
  }

  .word {
    font-size: 1.1rem;
  }

  .slogan-sub {
    font-size: 0.85rem;
    letter-spacing: 1px;
  }

  .premium-loader {
    max-width: 250px;
  }
}
</style>
