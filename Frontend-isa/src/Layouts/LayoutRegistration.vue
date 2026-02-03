<template>
  <Form @submit="handleSubmit" keepValues v-if="user && !LoadingServer" v-slot="{ values, errors, meta, isSubmitting }">
    <div class="luxury-admission-layout">
      <!-- Fond animé premium -->
      <div class="luxury-background">
        <div class="particles"></div>
        <div class="gradient-overlay"></div>
      </div>

      <!-- En-tête premium -->
      <header class="luxury-header">
        <div class="logo-container" @click="$router.push('/')">
          <div class="logo-wrapper">
            <img src="/logo300x300.svg" alt="Logo Université" class="university-logo">
            <div class="logo-glow"></div>
            <div class="logo-border"></div>
          </div>
        </div>
        <div class="header-content">
          <h1>Finalisation de <span class="highlight">l'inscription</span></h1>
          <p class="header-subtitle">Savoir - Savoir-faire - Savoir-être - Bâtissons un avenir responsable</p>
          <div class="header-decoration"></div>

        </div>
        <div class="user-info-container">
          <div class="name-container">
            <p class="user-id">ID: {{ user.inscriptionId }}</p>
            <p class="user-name">
              {{ user.lastName }} {{ user.firstName }}
            </p>
            <p class="user-detail">{{ user.email }}</p>
            <p class="user-detail">{{ user.field.toLocaleUpperCase() }}</p>
            <p class="user-detail">{{ user.levelAsked }}</p>

          </div>
        </div>

      </header>

      <div>

      </div>
      <!-- Barre de progression premium -->
      <div class="luxury-progress-container">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-glow"></div>
        </div>
        <div class="luxury-steps">
          <div v-for="(step, index) in admissionSteps" :key="index" class="luxury-step" :class="{
            'active': currentStep === index,
            'completed': currentStep > index
          }" @click="goToStep(index)">
            <div class="step-bubble">
              <span class="step-number">{{ index + 1 }}</span>
              <svg class="checkmark" viewBox="0 0 24 24">
                <path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </div>
            <span class="step-label">{{ step.label }}</span>
            <div class="step-tooltip">{{ step.label }}</div>
          </div>
        </div>
      </div>

      <main class="luxury-content-container">
        <PolicyComponent v-if="currentStep === 0" type="terms" title="Conditions Générales d'Utilisation" version="1.0"
          fieldName="cguAcceptance"
          acceptanceText="Je soussigné(e) déclare avoir lu attentivement les Conditions Générales d’Utilisation et en accepter pleinement les termes."
          :sections="CGU" :validation="cguValidation" />

        <PolicyComponent v-if="currentStep === 1" type="privacy" title="Politique de Confidentialité" version="1.0"
          fieldName="privacyAcceptance"
          acceptanceText="Je déclare avoir lu et compris la politique de confidentialité, et j’accepte expressément le traitement de mes données personnelles tel qu’y est décrit."
          :sections="PolitiqueConfidentialite" :validation="privacyValidation" />

        <PolicyComponent v-if="currentStep === 2" type="contract" title="Contrat d'engagement" version="1.0"
          fieldName="engagementAcceptance"
          :acceptanceText="`Je soussigné(e), ${user?.firstName} ${user?.lastName}, déclare avoir pris connaissance du présent contrat, en accepter sans réserve l’ensemble des clauses, et m’engage à les respecter dans leur intégralité.`"
          :sections="ContratEngagementEtudiant" :validation="engagmentValidation" />
        <PolicyComponent v-if="currentStep === 3" type="contract" title="Charte Informatique" version="1.0"
          fieldName="charterAcceptance"
          acceptanceText="Je soussigné(e) reconnais avoir lu la Charte Informatique de l’institut et accepte, sans réserve, l’ensemble des règles qui y sont énoncées."
          :sections="CharteInformatique" :validation="charterValidation" />
        <PaymentComponent v-if="currentStep === 4" :user="user" :values="values" />
        <ConfirmationComponent v-if="currentStep === 5" :user="user" :values="values" />
      </main>


      <div class="luxury-navigation">
        <ActionButton v-if="currentStep > 0" icon="tabler:arrow-big-left" iconPosition="left" size="medium"
          class="luxury-nav-btn prev-btn" @click="goToPreviousStep">
          Étape précédente
        </ActionButton>

        <div class="step-indicator">
          <span class="current-step">{{ currentStep + 1 }}</span>
          <span class="step-divider">sur</span>
          <span class="total-steps">{{ admissionSteps.length }}</span>
        </div>

        <ActionButton v-if="currentStep < admissionSteps.length - 1" icon="tabler:arrow-big-right"
          class="luxury-nav-btn next-btn" type="submit" :class="meta.valid ? '' : 'disabled'">
          Étape suivante
        </ActionButton>
        <ActionButton v-else icon="material-symbols:done" iconPosition="right" class="luxury-nav-btn finish-btn"
          type="submit" :disabled="isSubmitting ? true : false">
          Terminer l'inscription
        </ActionButton>
      </div>

      <ModalSuccess v-if="credentials.matricule && credentials.password" :credentials="credentials" />
      <ModalError v-if="errorServerInscription" :errorMessage="errorServerInscription"
        @close="errorServerInscription = ''" />
    </div>
  </Form>
  <div v-else-if="LoadingServer"
    style="display: flex; width: 100%; height: 100vh; justify-content: center; align-items: center;">
    <SpinningLoader />
  </div>
  <div v-else>
    <ErrorComponent :message="errorServer" :showBack="true" :showAction="false" />

  </div>
</template>

<script setup lang="ts">
import PolicyComponent from '@/components/register/PolicyComponent.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CGU, CharteInformatique, ContratEngagementEtudiant, PolitiqueConfidentialite } from '@/data/CGU'
import { Form } from 'vee-validate'
import axios from 'axios'
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import LoadingPercentage from '@/components/loader/LoadingPercentage.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import PaymentComponent from '@/components/register/PaymentComponent.vue'
import ConfirmationComponent from '@/components/register/ConfirmationComponent.vue'
import ModalSuccess from '@/components/modal/ModalSuccessInscription.vue'
import ModalError from '@/components/modal/ModalError.vue'
import { useSocket } from '@/composables/useSocket'

const currentStep = ref<number>(0)
const router = useRouter()

const route = useRoute()
const errorServer = ref<string>("")
const LoadingServer = ref<boolean>(false)
const user = ref<UserPendingInterface | null>(null)

const checkToken = async () => {
  LoadingServer.value = true
  errorServer.value = ""
  try {
    const response = (await axios.get(`/api/v1/pendingUsers/token/${route.query.token}`)).data;
    user.value = response
  } catch (error) {
    errorServer.value = error.response.data
    LoadingServer.value = false
  } finally {
    LoadingServer.value = false

  }
}

const cguValidation = toTypedSchema(z.boolean())
const privacyValidation = toTypedSchema(z.boolean())
const engagmentValidation = toTypedSchema(z.boolean())
const charterValidation = toTypedSchema(z.boolean())

const { emit, connect, disconnect } = useSocket()


onMounted(async () => {
  await checkToken()
  connect()
})

onUnmounted(() => {
  disconnect()
})

// Configuration des étapes
const admissionSteps = [
  { label: 'Conditions Générales d’Utilisation' },
  { label: 'Politique de Confidentialité' },
  { label: 'Contrat d’engagement étudiant' },
  { label: 'Charte informatique' },
  { label: 'Paiement' },
  { label: 'Confirmation' }
]

// Calcul du pourcentage de progression
const progressPercentage = computed(() => {
  return ((currentStep.value + 1) / admissionSteps.length) * 100
})

const goToStep = (index) => {
  if (index < currentStep.value) {
    currentStep.value = index
  }
}

const goToPreviousStep = async () => {
  if (currentStep.value > 0) {


    currentStep.value--
  }
}


const errorServerInscription = ref<string>('')
const credentials = ref<{
  matricule: string,
  password: string
}>({
  matricule: '',
  password: ''
})

const handleSubmit = async (values) => {
  try {

    if (!(admissionSteps.length - 1 === currentStep.value)) {
      window.scrollTo({ top: 0, behavior: 'smooth' })

      currentStep.value++
      return
    }
    const formData = new FormData()

    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'proofFile') formData.append(key, value as string)
    })

    if (values.proofFile) formData.append('proofFile', values.proofFile);
    formData.append('level', user.value!.levelAsked)
    formData.append('field', user.value!.field)
    formData.append('label', 'Tranche 1')

    const response = (await axios.post(`/api/v1/pendingUsers/confirmation/${user.value?.inscriptionId}`, formData)).data
    credentials.value = response

    emit("newInscription", { user: response })

  } catch (error) {
    errorServerInscription.value = error.response.data
  }
}
</script>

<style scoped>
.luxury-admission-layout {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--primary-dark);
  color: var(--white);
  overflow: hidden;
  MIN-height: 100vh;

}

.luxury-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center,
      var(--primary-color-light) 0%,
      transparent 70%);
  opacity: 0.3;
  animation: pulse 15s infinite alternate;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      var(--primary-dark) 0%,
      var(--primary-darker) 100%);
}

.luxury-header {
  position: relative;
  z-index: 2;
  padding: 2rem 3rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo-container {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}

.university-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(80, 134, 193, 0.5));
}

.logo-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at center,
      var(--primary-light) 0%,
      transparent 70%);
  opacity: 0.3;
  z-index: -1;
  animation: glow 3s infinite alternate;
}

.logo-border {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  opacity: 0.5;
  box-sizing: border-box;
}

.header-content {
  flex: 1;
  position: relative;
}

.header-content h1 {
  font-size: 2.2rem;
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.highlight {
  color: var(--primary-light);
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary-light);
  transform: scaleX(0.9);
  opacity: 0.7;
}

.header-subtitle {
  margin-top: 0.5rem;
  font-size: 1rem;
  opacity: 0.8;
  font-style: italic;
}

.header-decoration {
  position: absolute;
  bottom: -1rem;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right,
      transparent 0%,
      var(--primary-light) 20%,
      var(--primary-light) 80%,
      transparent 100%);
  opacity: 0.3;
}

.luxury-progress-container {
  position: relative;
  z-index: 2;
  padding: 0 3rem 2rem;
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  margin-bottom: 3rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right,
      var(--primary-light) 0%,
      var(--secondary-light) 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(to right,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%);
  animation: progressGlow 2s infinite;
}

.luxury-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.luxury-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 1;
  flex: 1;
  max-width: calc(100% / 6);
}

.step-bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-dark);
  border: 2px solid var(--gray-light);
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 0.5rem;
}

.luxury-step.active .step-bubble {
  border-color: var(--primary-light);
  background: var(--primary-dark);
  box-shadow: 0 0 0 4px var(--primary-extra-light);
}

.luxury-step.completed .step-bubble {
  background: var(--secondary-color);
  border-color: var(--secondary-light);
}

.step-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-lighter);
}

.luxury-step.active .step-number {
  color: var(--primary-light);
}

.luxury-step.completed .step-number {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  display: none;
  color: var(--white);
}

.luxury-step.completed .checkmark {
  display: block;
}

.step-label {
  font-size: 0.8rem;
  text-align: center;
  color: var(--gray-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  transition: all 0.3s ease;
}

.luxury-step.active .step-label,
.luxury-step.completed .step-label {
  color: var(--white);
  font-weight: 500;
}

.step-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary-dark);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: var(--shadow);
  border: 1px solid var(--primary-color-light);
}

.luxury-step:hover .step-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-10px);
}

.luxury-content-container {
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0 3rem 2rem;
}

.luxury-navigation {
  position: relative;
  z-index: 2;
  padding: 1.5rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(10, 37, 64, 0.5);
  border-top: 1px solid var(--primary-color-light);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: var(--white);
  opacity: 0.8;
}

.current-step {
  font-weight: 600;
  color: var(--primary-light);
}

.total-steps {
  opacity: 0.7;
}

.luxury-nav-btn {
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.luxury-nav-btn.prev-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--primary-color-light);
}

.luxury-nav-btn.next-btn {
  background: linear-gradient(to right, var(--primary-color), var(--primary-light));
}

.luxury-nav-btn.finish-btn {
  background: linear-gradient(to right, var(--secondary-color), var(--secondary-light));
}

.luxury-nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-dark);
}


.user-info-container {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  min-width: 250px;
}

.name-container {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-name {
  font-weight: 600;
  color: var(--primary-light);
  margin: 0;
  font-size: 0.95rem;
}

.user-detail {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.8;
  line-height: 1.3;
}

.user-id {
  margin: 0;
  font-size: 0.7rem;
  opacity: 0.6;
  margin-top: 0.3rem;
  font-family: monospace;
}

.disabled {
  background-color: red !important;
  pointer-events: none;
}


@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }

  100% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes glow {
  0% {
    opacity: 0.3;
  }

  100% {
    opacity: 0.5;
  }
}

@keyframes progressGlow {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1024px) {

  .luxury-header,
  .luxury-progress-container,
  .luxury-content-container,
  .luxury-navigation {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .luxury-header h1 {
    font-size: 1.8rem;
  }

  .user-info-container {
    min-width: 200px;
  }
}

@media (max-width: 768px) {
  .luxury-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding-bottom: 1rem;
  }

  .header-decoration {
    bottom: 0;
  }

  .luxury-step {
    max-width: calc(100% / 3);
    margin-bottom: 1rem;
  }

  .luxury-steps {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .luxury-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .luxury-nav-btn {
    width: 100%;
    justify-content: center;
  }

  .user-info-container {
    width: 100%;
    margin-top: 1rem;
    margin-left: 0;
    text-align: center;
  }
}
</style>
