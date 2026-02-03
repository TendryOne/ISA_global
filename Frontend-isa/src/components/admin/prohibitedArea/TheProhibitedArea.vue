<template>
  <div class="prohibited-container">
    <!-- Header avec effet gradient premium -->


    <!-- Contenu principal -->
    <div class="prohibited-content">
      <div class="access-card">
        <div class="access-icon">
          <Icon icon="mdi:shield-account" class="shield-icon" />
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
        </div>

        <h2>Accès Réservé aux Super Administrateurs</h2>
        <p>Cette zone contient des fonctionnalités sensibles réservées exclusivement aux super administrateurs.</p>




        <div class="admin-contact" v-if="adminContact">
          <p>Contacter un super administrateur:
            <a :href="`mailto:${adminContact}`">{{ adminContact }}</a>
          </p>
        </div>
      </div>


    </div>



    <!-- Toast de confirmation -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      <Icon :icon="toastIcon" />
      <span>{{ toast.message }}</span>
      <button class="toast-close" @click="toast.show = false">
        <Icon icon="mdi:close" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'


const adminContact = ref('tendryone@hotmail.com')
const toast = ref({ show: false, message: '', type: 'success' })



const toastIcon = computed(() => {
  return toast.value.type === 'success' ? 'mdi:check-circle' : 'mdi:alert-circle'
})
</script>

<style scoped>
.prohibited-container {
  min-height: 91vh;
  background: linear-gradient(135deg, var(--primary-darker) 0%, var(--primary-dark) 100%);
  color: white;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Header élite */
.elite-header {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 50%, var(--primary-light) 100%);
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 32px 32px;
}

.header-text {
  margin-bottom: 24px;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1rem;
  font-weight: 400;
  opacity: 0.9;
  margin: 0;
}

/* Contenu principal */
.prohibited-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;
  z-index: 2;
}

.access-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.access-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--error), var(--warning), var(--success));
}

.access-icon {
  position: relative;
  margin-bottom: 30px;
}

.shield-icon {
  font-size: 80px;
  color: var(--error);
  filter: drop-shadow(0 0 10px rgba(235, 77, 75, 0.5));
  position: relative;
  z-index: 2;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid var(--error);
  border-radius: 50%;
  opacity: 0;
  animation: pulse 3s infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 1s;
}

.pulse-ring.delay-2 {
  animation-delay: 2s;
}

@keyframes pulse {
  0% {
    width: 100px;
    height: 100px;
    opacity: 1;
  }

  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

.access-card h2 {
  font-size: 1.8rem;
  margin-bottom: 16px;
  color: white;
  font-weight: 600;
}

.access-card>p {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.access-details {
  margin: 30px 0;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.detail-icon {
  font-size: 24px;
  color: var(--primary-light);
  margin-right: 15px;
  flex-shrink: 0;
}

.detail-text h3 {
  font-size: 1.1rem;
  margin: 0 0 5px 0;
  color: white;
  font-weight: 500;
}

.detail-text p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 30px 0;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-success {
  background: var(--success);
  color: white;
  cursor: not-allowed;
}

.admin-contact {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-contact a {
  color: var(--primary-light);
  text-decoration: none;
}

.admin-contact a:hover {
  text-decoration: underline;
}

/* Animation de sécurité */
.security-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--error), transparent);
  animation: scan 4s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }

  100% {
    top: 100%;
  }
}

.security-dots {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.security-dot {
  position: absolute;
  background: var(--error);
  border-radius: 50%;
  animation: dotPulse 2s infinite ease-in-out;
}

@keyframes dotPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.5);
    opacity: 0.6;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dark);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  color: var(--black);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-lighter);
  background: var(--gray-extra-light);
}

.modal-header h3 {
  margin: 0;
  color: var(--black);
  font-size: 1.3rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--tertiary-color);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1.5rem;
}

.modal-close:hover {
  background: var(--gray-super-light);
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin-bottom: 1rem;
  color: var(--gray-dark);
}

.access-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.access-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-extra-light);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid var(--gray-lighter);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow-dark);
  color: white;
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: var(--success);
}

.toast.error {
  background-color: var(--error);
}

.toast-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .elite-header {
    height: 180px;
  }

  .header-content {
    padding: 0 20px 20px;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .access-card {
    padding: 30px 20px;
  }

  .access-card h2 {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
  }

  .detail-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .prohibited-content {
    padding: 20px 10px;
  }

  .access-card {
    padding: 20px 15px;
  }

  .modal {
    margin: 10px;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
