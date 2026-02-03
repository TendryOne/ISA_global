<template>
  <div class="logo-loader" :class="{ 'fullscreen': fullscreen }" v-if="loading">
    <div class="logo-container">
      <!-- Logo avec effets 3D et particules -->
      <div class="logo-3d">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 187.6 143.1" class="logo-svg">
          <path class="logo-part logo-blue"
            d="M69.8,16.4l-21.6,108.8c11.1-1.5,19.1-2.2,23.7-2.2,7.6,0,11.4,5.3,11.4,15.8-4.3-1.5-8.8-2.2-13.5-2.2s-10.1.4-16.7,1.3l-20,2.6c-7.1,1-12.1,1.5-15,1.5-4.9,0-8.4-1.2-10.4-3.5-2-2.3-3.3-6.6-3.7-12.8,4.1,2.3,8.5,3.4,13,3.4s6.5-.4,12.3-1.3L51,19c-6.3,1.1-11.8,1.6-16.4,1.6-8.1,0-12.1-4.7-12.1-14.2,2.3,1.5,5.1,2.3,8.6,2.3s10.3-.8,18.4-2.3l13.8-2.6c9.6-1.8,17-2.6,22.1-2.6,7.9,0,12.4,5.3,13.7,15.8-3.3-1.6-6.7-2.4-10.2-2.4s-9.5.4-15.1,1.2c-.9.2-2.2.4-3.9.5Z" />
          <path class="logo-part logo-gray"
            d="M58.4,102.3c0,9.5,2.6,17,7.8,22.4,5.2,5.4,12.4,8.1,21.7,8.1s15.3-2.5,21.3-7.4c6-4.9,9-10.7,9-17.2s-6.6-16.8-19.9-29.2l-9.6-8.9c-12.3-11.4-18.5-22-18.5-31.6s4.4-20.4,13.1-27.7S103.2,0,116.8,0s13,1.1,17.4,3.3,6.7,5,6.7,8.5-1.6,7.4-4.7,12c-5.1-9.8-13.3-14.7-24.8-14.7s-13.1,2.2-18,6.6c-4.9,4.4-7.3,9.8-7.3,16.3s.8,7.6,2.4,9.9c1.6,2.3,6.6,7.2,14.9,14.9l7.9,7.3c14.4,13.4,21.5,25.4,21.5,36s-4.9,22.6-14.7,30.8c-9.8,8.1-22.2,12.2-37,12.2s-18.2-2.3-24.7-7c-6.5-4.7-9.8-10.6-9.8-17.7s3.9-10.2,11.8-16.1Z" />
          <path class="logo-part logo-green"
            d="M99.1,96.8l-1.8,3.3c-7.4,13.7-11,24.3-11,31.9s.8,4.4,2.5,6.5c-1.4.5-4.6,1.6-9.5,3.4-2.3.8-4.4,1.2-6.5,1.2-4.1,0-6.1-2-6.1-5.9,0-8.1,5-20.5,15.1-37.1l2.7-4.5h-4.5c-9.6,0-17,1.5-22.2,4.5,2.7-9.9,10.1-14.8,22.1-14.8l10.9.3,2.4-3.5c9.2-13.8,23.2-32.3,42-55.6,6.4-7.9,11.1-12.8,14.3-14.7,3.2-1.9,9.2-3.7,18.3-5.3-1.7,10.5-2.5,20.3-2.5,29.3,0,24,2.8,48.3,8.3,72.9,3,13.5,7.7,22.3,13.9,26.2-5.5,5.4-10.2,8.1-14.1,8.1-9.2,0-16.3-15.8-21.4-47.5-9.6,1.1-19.3,1.6-29.2,1.6l-23.9-.4ZM105.5,86.5l17.7.4c12.1,0,21.3-.4,27.8-1.2-2.7-20.5-4-37.5-4-51v-6.6c-1.8,2.5-6.2,7.8-12.9,15.9-12.1,14.9-21,27.9-26.7,39l-1.8,3.4Z" />
        </svg>
      </div>

      <!-- Particules flottantes -->
      <div class="particles">
        <div v-for="i in 12" :key="i" class="particle" :style="particleStyle(i)"></div>
      </div>

      <!-- Anneau orbitant -->
      <div class="orbit-ring">
        <div class="orbiting-dot"></div>
      </div>

      <!-- Effet de halo -->
      <div class="halo"></div>
    </div>


    <!-- Texte optionnel -->
    <p class="loader-text" v-if="text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  loading?: boolean;
  text?: string;
  fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: true,
  text: '',
  fullscreen: false
});

// Styles aléatoires pour les particules
const particleStyle = (index: number) => {
  const sizes = [6, 8, 10, 12];
  const delays = [0, 0.3, 0.6, 0.9, 1.2];
  const durations = [3, 4, 5, 6];

  return {
    'width': `${sizes[index % 4]}px`,
    'height': `${sizes[index % 4]}px`,
    'animation-delay': `${delays[index % 5]}s`,
    'animation-duration': `${durations[index % 4]}s`,
    'background': index % 3 === 0 ? '#5286c1' : index % 3 === 1 ? '#2fa855' : '#7e807f'
  };
};

// Pourcentage de progression (simulé)
const progress = ref(0);

// Simulation de progression
setInterval(() => {
  if (progress.value < 100) {
    progress.value += Math.random() * 15;
    if (progress.value > 100) progress.value = 100;
  }
}, 600);
</script>

<style scoped>
.logo-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
}

.logo-loader.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.logo-container {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

/* Logo 3D avec effet de profondeur */
.logo-3d {
  position: relative;
  width: 120px;
  height: 120px;
  z-index: 10;
  transform-style: preserve-3d;
  animation: logo-float 6s ease-in-out infinite;
}

.logo-svg {
  width: 100%;
  height: 100%;
  filter:
    drop-shadow(0 5px 15px rgba(82, 134, 193, 0.4)) drop-shadow(0 10px 25px rgba(47, 168, 85, 0.3));
}

.logo-part {
  transition: all 0.5s ease;
}

.logo-blue {
  fill: #5286c1;
  animation: part-glow 3s ease-in-out infinite;
}

.logo-green {
  fill: #2fa855;
  animation: part-glow 3s ease-in-out 0.5s infinite;
}

.logo-gray {
  fill: #7e807f;
  animation: part-glow 3s ease-in-out 1s infinite;
}

/* Particules flottantes */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: particle-float 4s ease-in-out infinite;
}

@keyframes particle-float {

  0%,
  100% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }

  25% {
    opacity: 0.7;
  }

  50% {
    transform: translate(var(--tx, 40px), var(--ty, -40px)) scale(1);
    opacity: 0.4;
  }

  75% {
    opacity: 0.2;
  }
}

.particle:nth-child(1) {
  --tx: 50px;
  --ty: -30px;
  top: 20%;
  left: 30%;
}

.particle:nth-child(2) {
  --tx: -40px;
  --ty: -50px;
  top: 40%;
  left: 70%;
}

.particle:nth-child(3) {
  --tx: 60px;
  --ty: 40px;
  top: 60%;
  left: 20%;
}

.particle:nth-child(4) {
  --tx: -50px;
  --ty: 30px;
  top: 80%;
  left: 60%;
}

.particle:nth-child(5) {
  --tx: 30px;
  --ty: -60px;
  top: 30%;
  left: 50%;
}

.particle:nth-child(6) {
  --tx: -30px;
  --ty: 50px;
  top: 70%;
  left: 40%;
}

/* Anneau orbitant */
.orbit-ring {
  position: absolute;
  width: 160px;
  height: 160px;
  border: 2px dashed rgba(82, 134, 193, 0.3);
  border-radius: 50%;
  animation: orbit-rotate 8s linear infinite;
}

.orbiting-dot {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #2fa855;
  border-radius: 50%;
  box-shadow: 0 0 10px #2fa855, 0 0 20px #2fa855;
}

/* Effet de halo */
.halo {
  position: absolute;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(82, 134, 193, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: halo-pulse 3s ease-in-out infinite;
}

/* Barre de progression moderne */
.progress-container {
  width: 280px;
  margin-top: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(82, 134, 193, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5286c1, #2fa855);
  border-radius: 3px;
  width: v-bind('progress + "%"');
  transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 50px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  animation: progress-shine 1.5s ease-in-out infinite;
}

.progress-text {
  text-align: center;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #5286c1;
  font-weight: 500;
}

.ellipsis::after {
  content: '';
  animation: ellipsis 1.5s infinite;
}

/* Texte */
.loader-text {
  margin-top: 1.5rem;
  font-size: 1.1rem;
  color: #5286c1;
  font-weight: 500;
  text-align: center;
  animation: text-fade 2s ease-in-out infinite;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Animations */
@keyframes logo-float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  33% {
    transform: translateY(-10px) rotate(2deg);
  }

  66% {
    transform: translateY(5px) rotate(-2deg);
  }
}

@keyframes part-glow {

  0%,
  100% {
    filter: none;
  }

  50% {
    filter: drop-shadow(0 0 5px currentColor);
  }
}

@keyframes orbit-rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes halo-pulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

@keyframes progress-shine {
  0% {
    transform: translateX(-50px);
  }

  100% {
    transform: translateX(280px);
  }
}

@keyframes ellipsis {
  0% {
    content: '';
  }

  25% {
    content: '.';
  }

  50% {
    content: '..';
  }

  75% {
    content: '...';
  }
}

@keyframes text-fade {

  0%,
  100% {
    opacity: 0.7;
  }

  50% {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 480px) {
  .logo-container {
    width: 160px;
    height: 160px;
  }

  .logo-3d {
    width: 100px;
    height: 100px;
  }

  .orbit-ring {
    width: 130px;
    height: 130px;
  }

  .halo {
    width: 150px;
    height: 150px;
  }

  .progress-container {
    width: 240px;
  }
}

/* Réduction motion pour accessibilité */
@media (prefers-reduced-motion: reduce) {

  .logo-3d,
  .particle,
  .orbit-ring,
  .halo,
  .progress-fill::after,
  .loader-text {
    animation: none;
  }

  .logo-part {
    filter: none;
  }
}
</style>
