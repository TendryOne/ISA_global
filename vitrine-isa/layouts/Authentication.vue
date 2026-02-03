<template>
  <div class="login-container">
    <!-- Décoration universitaire -->
    <div class="decor decor-1"></div>
    <div class="decor decor-2"></div>
    <div class="decor decor-3"></div>

    <!-- Conteneur principal -->
    <div class="university-card">
      <div class="header">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="var(--primary-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon">
          <path d="M4 6h16"></path>
          <path d="M4 10h16"></path>
          <path d="M4 14h16"></path>
          <path d="M4 18h16"></path>
        </svg>
        <h2>Portail Universitaire</h2>
        <p>Identifiants de connexion</p>
      </div>

      <!-- Le slot pour le formulaire -->
      <slot />

    </div>
  </div>
</template>

<script lang="ts" setup>
// Aucune logique nécessaire ici
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  overflow: hidden;
  padding: 2rem;
}

/* Carte universitaire sobre */
.university-card {
  position: relative;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  color: #2d3748;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 1.5rem;
}

.header .icon {
  margin-bottom: 1rem;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  letter-spacing: -0.5px;
}

.header p {
  color: #4a5568;
  font-size: 0.9rem;
}

.footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.divider {
  display: flex;
  align-items: center;
  margin: 1rem 0;
  color: #718096;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: rgba(113, 128, 150, 0.2);
  margin: 0 0.5rem;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.link {
  color: var(--secondary-color);
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.2s;
  white-space: nowrap;
}

.link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

/* Décoration universitaire */
.decor {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
}

.decor-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  left: -50px;
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.03) 0%, transparent 100%);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

.decor-2 {
  width: 120px;
  height: 120px;
  bottom: 30px;
  right: 30px;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  background: linear-gradient(45deg, transparent 0%, rgba(0, 0, 0, 0.03) 100%);
}

.decor-3 {
  width: 80px;
  height: 80px;
  top: 20%;
  right: 10%;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  transform: rotate(45deg);
  background: rgba(255, 255, 255, 0.05);
}

/* Responsive */
@media (max-width: 480px) {
  .university-card {
    padding: 1.5rem;
  }

  .quick-links {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}
</style>