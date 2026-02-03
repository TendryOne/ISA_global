<template>
  <div class="modern-maintenance">
    <div class="gradient-bg"></div>


    <div class="particles">
      <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
    </div>

    <div class="content">

      <div class="abstract-shape">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="rgba(255,255,255,0.05)"
            d="M45.2,-58.3C58.1,-48.6,67.5,-32.9,70.5,-16.3C73.5,0.3,70.2,17.8,59.5,31.5C48.8,45.2,30.7,55.1,11.2,63.8C-8.3,72.5,-29.1,80,-44.3,72.2C-59.5,64.4,-69,41.3,-72.2,18.8C-75.5,-3.7,-72.5,-25.6,-60.7,-42.3C-48.9,-59.1,-28.3,-70.7,-8.3,-66.2C11.7,-61.7,23.4,-41.1,45.2,-58.3Z"
            transform="translate(100 100)" />
        </svg>
      </div>

      <div class="logo-animation">
        <div class="logo-circle"></div>
        <div class="logo-progress"></div>
      </div>

      <h1 class="title">Maintenance du site</h1>
      <div style="background-color: var(--white); border-radius: var(--radius);">
        <NuxtImg src="/logo-write.svg" width="200" />
      </div>
      <p class="subtitle">Nous sommes entrain de faire une mise à jour du site pour une éxperience utilisateur encore
        plus enrichissante</p>


      <div class="social-grid">
        <a v-for="social in socials" :key="social.name" :href="social.link" class="social-item"
          :style="`--color: ${social.color}`">
          <Icon :name="social.icon" />
          <span>{{ social.name }}</span>
        </a>
      </div>

    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'nothing'
})


const socials = ref([
  { name: 'Twitter', icon: 'fa6-brands:twitter', link: '#', color: '#1DA1F2' },
  { name: 'Instagram', icon: 'fa6-brands:instagram', link: '#', color: '#E1306C' },
  { name: 'LinkedIn', icon: 'fa6-brands:linkedin-in', link: '#', color: '#0077B5' },
  { name: 'GitHub', icon: 'fa6-brands:github', link: '#', color: '#181717' }
])

const particleStyle = (index: number) => {
  const size = Math.random() * 6 + 2
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${index * 0.2}s`,
    opacity: Math.random() * 0.4 + 0.1
  }
}


</script>

<style scoped>
.modern-maintenance {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: white;
}

.gradient-bg {
  position: absolute;
  width: 200%;
  height: 200%;
  top: -50%;
  left: -50%;
  background: radial-gradient(circle at center,
      var(--primary-color) 0%,
      var(--secondary-color) 70%);
  animation: gradientRotate 20s infinite alternate linear;
  z-index: 1;
}

.particles {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.particle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  filter: blur(1px);
  animation: particleFloat 15s infinite linear;
  z-index: 2;
}

.content {
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 3rem;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  animation: fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.abstract-shape {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 300px;
  height: 300px;
  opacity: 0.3;
  z-index: -1;
  animation: shapePulse 12s infinite ease-in-out;
}

.logo-animation {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  position: relative;
}

.logo-circle {
  width: 100%;
  height: 100%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  position: relative;
  animation: logoRotate 8s infinite linear;
}

.logo-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-top-color: white;
  border-radius: 50%;
  animation: logoSpin 1.5s infinite ease-in-out;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, white, var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 2.5rem;
  font-weight: 400;
  max-width: 80%;
  margin-left: auto;
  margin-right: auto;
}

.progress-track {
  width: 100%;
  margin: 2.5rem 0;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.65, 0, 0.35, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 100%);
  animation: progressShine 2s infinite;
}

.progress-metrics {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  opacity: 0.7;
  margin-top: 0.5rem;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin: 2.5rem 0;
}

.social-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-decoration: none;
  color: white;
  position: relative;
  overflow: hidden;
}

.social-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.social-item:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.social-item:hover::before {
  opacity: 0.2;
}

.social-item i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.social-item span {
  font-size: 0.85rem;
  font-weight: 500;
}

.countdown {
  margin-top: 2rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

.countdown .time {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

/* Animations */
@keyframes gradientRotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0);
  }

  100% {
    transform: translateY(-100vh) translateX(20px);
  }
}

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

@keyframes shapePulse {

  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }

  50% {
    transform: scale(1.1) rotate(5deg);
  }
}

@keyframes logoRotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes logoSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .content {
    padding: 2rem 1.5rem;
    width: 90%;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .social-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .abstract-shape {
    width: 200px;
    height: 200px;
    top: -50px;
    right: -50px;
  }
}
</style>