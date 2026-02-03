<template>
  <div>
    <div class="form-header">
      <h1 class="header-title">Prêt à commencer votre aventure universitaire ?</h1>
      <p class="header-subtitle">
        Vous avez pris la bonne décision ! Inscrivez-vous en ligne via ce formulaire
        simplifié et sécurisé pour rejoindre notre communauté académique.
      </p>
      <div class="header-decoration">
        <div class="decoration-line"></div>
        <div class="decoration-dot"></div>
        <div class="decoration-line"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
  max-width: 700px;
  padding: 0 1.5rem;
}

.header-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  line-height: 1.3;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.header-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.decoration-line {
  height: 3px;
  width: 40px;
  border-radius: 3px;
  background: var(--primary-color);
}

.decoration-dot {
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background: var(--secondary-color);
}

/* Animation pour le header */
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

.form-header {
  animation: fadeIn 0.6s ease-out forwards;
}

/* Responsive */
@media (max-width: 768px) {
  .header-title {
    font-size: 1.5rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }
}
</style>