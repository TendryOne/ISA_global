<template>
  <div class="not-found-container">
    <div class="mascotte-container">
      <NuxtImg src="/mascotte.png" alt="Mascotte perdue" width="200" height="auto" loading="eager" class="mascotte" />
      <div class="speech-bubble">404!</div>
    </div>

    <div class="content">
      <h1 class="title">Oups ! Page introuvable</h1>
      <p class="description">
        La page que vous cherchez a peut-être été déplacée ou n'existe plus.
        <br>Retournez à l'accueil et explorez notre univers.
      </p>

      <NuxtLink to="/" class="home-button">
        <span>Retour à l'accueil</span>
        <Icon name="mdi:arrow-right" size="20" />
      </NuxtLink>
    </div>

    <div class="decoration">
      <div class="circle"></div>
      <div class="triangle"></div>
      <div class="square"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'nothing'
})
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  position: relative;
  overflow: hidden;
}

.mascotte-container {
  position: relative;
  margin-bottom: 2rem;
  animation: bounce 2s infinite alternate;
}

.mascotte {
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
}

.speech-bubble {
  position: absolute;
  top: -40px;
  right: -30px;
  background: white;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  font-weight: bold;
  font-size: 1.5rem;
  color: #ff4757;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: pulse 1.5s infinite;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  border-width: 10px 10px 0;
  border-style: solid;
  border-color: white transparent transparent;
  transform: translateX(-50%);
}

.content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  color: #2d3436;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.description {
  font-size: 1.1rem;
  color: #636e72;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--primary-color-light);
}

.decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.circle,
.triangle,
.square {
  position: absolute;
  opacity: 0.1;
}

.circle {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: var(--primary-color);
  top: -100px;
  right: -100px;
}

.triangle {
  width: 0;
  height: 0;
  border-left: 150px solid transparent;
  border-right: 150px solid transparent;
  border-bottom: 260px solid var(--secondary-color);
  bottom: -100px;
  left: -100px;
  transform: rotate(15deg);
}

.square {
  width: 200px;
  height: 200px;
  background: #fd79a8;
  bottom: 50px;
  right: 50px;
  transform: rotate(45deg);
}

/* Animations */
@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .speech-bubble {
    top: -30px;
    right: -10px;
    font-size: 1.2rem;
  }

  .decoration {
    display: none;
  }
}
</style>