<template>
  <div class="overlay">
    <div class="validation-container">
      <div class="validation-card">
        <!-- En-tête avec gradient élégant -->
        <div class="validation-header">
          <div class="icon-wrapper">
            <Icon icon="line-md:loading-twotone-loop" class="header-icon-animated" />
          </div>
          <h2>Bienvenue à l'Institut</h2>
          <p class="header-subtitle">Une dernière étape avant d'être admis définitivement</p>
        </div>

        <!-- Contenu principal -->
        <div class="validation-content">
          <!-- Carte d'information avec icône -->
          <div class="info-card">
            <div class="info-icon-wrapper">
              <Icon icon="mdi:clock-fast" class="info-icon" />
            </div>
            <div class="info-text">
              <h3>Traitement en cours</h3>
              <p>
                Les services de scolarité s'occuperont de votre dossier le plus rapidement possible
                durant leurs heures de bureau
                <strong class="highlight">8h - 17h</strong>.
              </p>
            </div>
          </div>

          <!-- Carte contact administration -->
          <div class="reconnect-card">
            <div class="reconnect-icon">
              <Icon icon="line-md:alert-circle-twotone" />
            </div>
            <p>
              Si vous constatez que ce n'est pas normal d'être encore non admis, veuillez
              <strong>contacter l'administration</strong>.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="validation-actions">
          <ActionButton full-width icon="line-md:log-out" iconPosition="left" @click="handleLogout"
            class="logout-button">
            Se déconnecter
          </ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ActionButton from '../ui/ActionButton.vue'
import { useMyUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useMyUserStore()

const handleLogout = async () => {
  try {
    await userStore.Logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 0.95);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.validation-container {
  max-width: 600px;
  width: 100%;
  position: relative;
  z-index: 1001;
}

.validation-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  border: 1px solid #e5e7eb;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* En-tête */
.validation-header {
  background: linear-gradient(135deg, #5086c1, #1a252f);
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.validation-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.header-icon {
  font-size: 4rem;
  margin-bottom: 1.25rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-icon-animated {
  font-size: 3.5rem;
  color: white;
  opacity: 0.95;
}

.validation-header h2 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
  position: relative;
  z-index: 1;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0;
  opacity: 0.95;
  font-size: 1.0625rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

/* Contenu */
.validation-content {
  padding: 2rem 2rem;
}

/* Carte d'information principale */
.info-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.75rem;
  background: linear-gradient(135deg, rgba(80, 134, 193, 0.08), rgba(48, 168, 85, 0.05));
  border-radius: 16px;
  border: 1px solid rgba(80, 134, 193, 0.2);
  margin-bottom: 1.25rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(80, 134, 193, 0.15);
}

.info-icon-wrapper {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(80, 134, 193, 0.3);
}

.info-icon {
  font-size: 1.75rem;
  color: white;
}

.info-text h3 {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.info-text p {
  margin: 0;
  line-height: 1.7;
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.highlight {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.0625rem;
  padding: 0.2rem 0.4rem;
  background: rgba(80, 134, 193, 0.1);
  border-radius: 6px;
  display: inline-block;
}

/* Carte reconnexion */
.reconnect-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(255, 165, 2, 0.08), rgba(255, 255, 255, 0.5));
  border-radius: 12px;
  border: 1px solid rgba(255, 165, 2, 0.2);
  border-left: 4px solid var(--warning);
}

.reconnect-icon {
  font-size: 2.25rem;
  color: var(--warning);
  flex-shrink: 0;
}

.reconnect-card p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-dark);
  font-weight: 500;
  line-height: 1.5;
}

.reconnect-card strong {
  color: var(--warning);
  font-weight: 600;
}

/* Actions */
.validation-actions {
  padding: 0 2rem 2rem;
  margin-top: 0.5rem;
}

.logout-button {
  background: linear-gradient(135deg, var(--error), var(--error-dark));
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.logout-button:hover {
  background: linear-gradient(135deg, var(--error-dark), var(--error));
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .validation-header {
    padding: 2.5rem 1.5rem;
  }

  .icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .header-icon-animated {
    font-size: 3.5rem;
  }

  .validation-header h2 {
    font-size: 2rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .validation-content {
    padding: 2rem 1.5rem;
  }

  .info-card {
    flex-direction: column;
    padding: 1.75rem;
  }

  .info-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .info-icon {
    font-size: 1.75rem;
  }

  .reconnect-card {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }

  .validation-actions {
    padding: 0 1.5rem 2rem;
  }
}

@media (max-width: 480px) {
  .validation-header {
    padding: 2rem 1rem;
  }

  .icon-wrapper {
    width: 90px;
    height: 90px;
  }

  .header-icon-animated {
    font-size: 3rem;
  }

  .validation-header h2 {
    font-size: 1.75rem;
  }

  .header-subtitle {
    font-size: 0.9375rem;
  }

  .validation-content {
    padding: 1.75rem 1rem;
  }

  .info-card {
    padding: 1.5rem;
  }

  .info-text h3 {
    font-size: 1.125rem;
  }

  .info-text p {
    font-size: 0.9375rem;
  }

  .highlight {
    font-size: 1rem;
  }

  .reconnect-card {
    padding: 1rem;
  }

  .reconnect-card p {
    font-size: 0.9375rem;
  }

  .validation-actions {
    padding: 0 1rem 1.5rem;
  }
}
</style>
