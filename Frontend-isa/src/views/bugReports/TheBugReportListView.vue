<template>
  <div class="bug-report-page">
    <!-- Hero Section -->
    <header class="page-hero">
      <div class="hero-background">
        <div class="hero-shape shape-1"></div>
        <div class="hero-shape shape-2"></div>
        <div class="hero-shape shape-3"></div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <Icon icon="solar:lightbulb-bolt-bold-duotone" />
          <span>Votre avis compte</span>
        </div>

        <h1 class="hero-title">
          Aidez-nous à améliorer votre expérience
        </h1>

        <p class="hero-subtitle">
          Suggérez de nouvelles fonctionnalités ou signalez un bug pour nous aider à améliorer la plateforme
        </p>
      </div>
    </header>


    <!-- Info Cards -->
    <section class="info-section">
      <div class="info-container">
        <div class="info-card">
          <div class="info-icon bug-icon">
            <Icon icon="solar:bug-minimalistic-bold-duotone" />
          </div>
          <h3>Signaler un bug</h3>
          <p>Vous rencontrez un problème technique ? Aidez-nous à le corriger rapidement.</p>
        </div>

        <div class="info-card">
          <div class="info-icon feature-icon">
            <Icon icon="solar:magic-stick-3-bold-duotone" />
          </div>
          <h3>Suggérer une fonctionnalité</h3>
          <p>Une idée pour améliorer la plateforme ? Partagez-la avec nous !</p>
        </div>

        <div class="info-card">
          <div class="info-icon improvement-icon">
            <Icon icon="solar:chart-2-bold-duotone" />
          </div>
          <h3>Proposer une amélioration</h3>
          <p>Un élément pourrait être optimisé ? Dites-nous comment.</p>
        </div>
      </div>
    </section>

    <!-- WhatsApp Support Rapide -->
    <section class="whatsapp-section">
      <div class="whatsapp-container">
        <div class="whatsapp-card">
          <div class="whatsapp-content">
            <div class="whatsapp-icon-wrapper">
              <Icon icon="logos:whatsapp-icon" class="whatsapp-logo" />
            </div>
            <div class="whatsapp-text">
              <h3>
                <Icon icon="solar:bolt-bold-duotone" class="bolt-icon" />
                Besoin d'une résolution rapide ?
              </h3>
              <p>Pour un bug bloquant nécessitant une intervention immédiate, contactez notre support technique sur
                WhatsApp</p>
              <div class="whatsapp-contact">
                <span class="contact-label">Support technique - Mkoody</span>
                <a :href="whatsappLink" target="_blank" rel="noopener" class="whatsapp-btn">
                  <Icon icon="logos:whatsapp-icon" />
                  <span>{{ UnivesityInformation.techSupportPhone }}</span>
                  <Icon icon="solar:arrow-right-up-bold" class="arrow-icon" />
                </a>
              </div>
            </div>
          </div>
          <div class="whatsapp-badge">
            <Icon icon="solar:verified-check-bold" />
            <span>Réponse rapide</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Formulaire -->
    <section class="form-section">
      <div class="form-container">
        <div class="form-card">
          <div class="form-header">
            <div class="form-icon-wrapper">
              <Icon icon="solar:document-add-bold-duotone" class="form-icon" />
            </div>
            <div class="form-header-text">
              <h2>Partagez votre retour</h2>
              <p>Remplissez le formulaire ci-dessous pour nous faire part de votre suggestion ou signalement</p>
            </div>
          </div>

          <Form @submit="handleSubmit" :validation-schema="reportSchema" v-slot="{ errors, isSubmitting }"
            class="report-form" :key="formKey">
            <div class="form-grid">
              <InputSelect name="type" label="Type de retour" placeholder="Sélectionnez un type" :options="typeOptions"
                :floating="true" :error="!!errors.type" />

              <InputSelect name="priority" label="Priorité" placeholder="Sélectionnez la priorité"
                :options="priorityOptions" :floating="true" :error="!!errors.priority" />
            </div>

            <InputField name="title" label="Titre" placeholder="Résumez en quelques mots..."
              icon="solar:text-bold-duotone" :floating="true" :error="!!errors.title" />

            <div class="textarea-wrapper">
              <label for="description" class="textarea-label">
                <Icon icon="solar:document-text-bold-duotone" />
                <span>Description détaillée</span>
              </label>
              <!-- <Field id="description" name="description" as="textarea" class="form-textarea" rows="6"
                placeholder="Décrivez votre bug, suggestion ou amélioration en détail... Plus vous donnez d'informations, plus nous pourrons vous aider efficacement." />
              <ErrorMessage name="description" class="error-message" /> -->
              <Field name="description" v-slot="{ field, errorMessage, handleChange }">
                <QuillEditor :model-value="field.value || ''" @update:model-value="handleChange" />
                <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
              </Field>
              <span class="textarea-hint">
                <Icon icon="solar:info-circle-bold-duotone" />
                Pour un bug : incluez les étapes pour le reproduire,
              </span>
            </div>

            <div class="form-actions">

              <ActionButton type="submit" variant="primary" icon="solar:plain-bold-duotone" :disabled="isSubmitting"
                size="medium">
                <template v-if="isSubmitting">
                  <Icon icon="eos-icons:loading" class="spin" />
                  Envoi en cours...
                </template>
                <template v-else>
                  Envoyer le rapport
                </template>
              </ActionButton>
            </div>
          </Form>
        </div>
      </div>
    </section>

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import InputField from '@/components/ui/InputField.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import { UnivesityInformation } from '@/data/universityInformation';
import axios from 'axios';
import SuccessToast from '@/components/toast/successToast.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import QuillEditor from '@/components/EDITOR/QuillEditor.vue';
import { useSocket } from '@/composables/useSocket';

const formKey = ref<number>(0);
const toast = ref<ToastInterface>({
  show: false,
  message: '',
  type: 'success',
  title: ''
})

// Lien WhatsApp
const whatsappLink = computed(() => {
  const phone = UnivesityInformation.techSupportPhone.replace(/[+\s]/g, '');

  return `https://wa.me/${phone}`;
});

const typeOptions = [
  { value: 'bug', label: '🐛 Signaler un bug', icon: 'solar:bug-bold-duotone' },
  { value: 'feature', label: '✨ Nouvelle fonctionnalité', icon: 'solar:magic-stick-3-bold-duotone' },
  { value: 'improvement', label: '📈 Amélioration', icon: 'solar:chart-2-bold-duotone' },
  { value: 'other', label: '💬 Autre', icon: 'solar:question-circle-bold-duotone' }
];

const priorityOptions = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
  { value: 'critical', label: 'Critique' }
];
const required_error = 'Ce champ est requis';

const reportSchema = toTypedSchema(
  z.object({
    type: z.string({ required_error }).min(1, 'Veuillez sélectionner un type'),
    priority: z.string({ required_error }).min(1, 'Veuillez sélectionner une priorité'),
    title: z.string({ required_error })
      .min(5, 'Le titre doit contenir au moins 5 caractères')
      .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
    description: z.string({ required_error })
      .min(20, 'La description doit contenir au moins 20 caractères')
      .max(2000, 'La description ne peut pas dépasser 2000 caractères')
  })
);

const { emit } = useSocket()


const handleSubmit = async (values: Record<string, unknown>, actions) => {
  try {
    await axios.post('/api/v1/bugReports', values);

    formKey.value += 1;

    toast.value = {
      show: true,
      message: 'Merci pour votre retour ! Nous allons l\'examiner rapidement.',
      type: 'success',
      title: 'Rapport envoyé'
    };


    emit('newBugReport', values);
  } catch (error) {
    toast.value = {
      show: true,
      message: error.response.data || 'Une erreur est survenue lors de l\'envoi de votre rapport. Veuillez réessayer plus tard.',
      type: 'error',
      title: 'Erreur d\'envoi'
    };
  }



};


</script>

<style scoped>
.bug-report-page {
  min-height: 100vh;
  background: var(--tertiary-extra-light);
  padding-bottom: 3rem;
}

/* Hero Section */
.page-hero {
  position: relative;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: white;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.hero-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: white;
  top: -150px;
  right: -100px;
  animation: float 20s infinite ease-in-out;
}

.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  bottom: -100px;
  left: -80px;
  animation: float 15s infinite ease-in-out reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: white;
  top: 40%;
  left: 30%;
  animation: float 25s infinite ease-in-out;
}

@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }

  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.hero-badge svg {
  font-size: 1.25rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.15rem;
  opacity: 0.95;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Info Section */
.info-section {
  padding: 3rem 2rem;
  background: white;
  margin-top: -2rem;
  border-radius: 24px 24px 0 0;
  position: relative;
  z-index: 2;
}

.info-container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.info-card {
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--tertiary-extra-light);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.info-icon {
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 2rem;
}

.bug-icon {
  background: linear-gradient(135deg, #d32f2f 0%, #c2185b 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
}

.feature-icon {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.improvement-icon {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-dark) 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(var(--secondary-color-rgb), 0.3);
}

.info-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
}

.info-card p {
  font-size: 0.95rem;
  color: var(--tertiary-color);
  line-height: 1.6;
  margin: 0;
}

/* WhatsApp Section */
.whatsapp-section {
  padding: 2rem 2rem 1rem;
  background: var(--tertiary-extra-light);
}

.whatsapp-container {
  max-width: 900px;
  margin: 0 auto;
}

.whatsapp-card {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.05) 0%, rgba(37, 211, 102, 0.02) 100%);
  border: 2px solid rgba(37, 211, 102, 0.2);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.whatsapp-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(37, 211, 102, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.whatsapp-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.whatsapp-icon-wrapper {
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
}

.whatsapp-logo {
  font-size: 3rem;
}

.whatsapp-text {
  flex: 1;
}

.whatsapp-text h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.bolt-icon {
  color: #ffa726;
  font-size: 1.4rem;
  animation: pulse-bolt 2s infinite;
}

@keyframes pulse-bolt {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.whatsapp-text p {
  font-size: 0.95rem;
  color: var(--tertiary-color);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.whatsapp-contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--tertiary-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: #25D366;
  /* eslint-disable-next-line */
  color: #ffffff;
  /* Contraste suffisant sur fond #25D366 */
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  width: fit-content;
}

.whatsapp-btn:hover {
  background: #128C7E;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
}

.whatsapp-btn svg:first-child {
  font-size: 1.5rem;
}

.arrow-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.whatsapp-btn:hover .arrow-icon {
  transform: translate(3px, -3px);
}

.whatsapp-badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: rgba(37, 211, 102, 0.2);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  /* eslint-disable-next-line */
  color: #0a5a3c;
  /* Couleur plus foncée pour meilleur contraste */
}

.whatsapp-badge svg {
  font-size: 1.1rem;
}

/* Form Section */
.form-section {
  padding: 3rem 2rem;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.form-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.form-icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-icon {
  font-size: 2rem;
  color: white;
}

.form-header-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.form-header-text p {
  font-size: 0.95rem;
  color: var(--tertiary-color);
  line-height: 1.5;
  margin: 0;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.textarea-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--tertiary-dark);
}

.textarea-label svg {
  font-size: 1.1rem;
  color: var(--primary-color);
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: 12px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 140px;
  transition: all 0.2s ease;
  line-height: 1.6;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.form-textarea::placeholder {
  color: var(--tertiary-light);
}

.error-message {
  font-size: 0.85rem;
  color: var(--error);
}

.textarea-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: var(--tertiary-light);
}

.textarea-hint svg {
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

/* Success Modal */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  backdrop-filter: blur(4px);
}

.success-modal {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-icon-wrapper {
  width: 90px;
  height: 90px;
  background: rgba(var(--secondary-color-rgb), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.success-icon {
  font-size: 3.5rem;
  color: var(--secondary-color);
}

.success-modal h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1rem;
}

.success-modal p {
  font-size: 1rem;
  color: var(--tertiary-color);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Animations */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-hero {
    padding: 3rem 1.5rem;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .info-section {
    padding: 2rem 1.5rem;
  }

  .info-container {
    grid-template-columns: 1fr;
  }

  /* WhatsApp Responsive */
  .whatsapp-section {
    padding: 2rem 1.5rem 1rem;
  }

  .whatsapp-card {
    padding: 1.5rem;
  }

  .whatsapp-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .whatsapp-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .whatsapp-logo {
    font-size: 2.5rem;
  }

  .whatsapp-text h3 {
    font-size: 1.15rem;
    justify-content: center;
  }

  .whatsapp-text p {
    font-size: 0.9rem;
  }

  .whatsapp-contact {
    align-items: center;
  }

  .whatsapp-btn {
    width: 100%;
    justify-content: center;
  }

  .whatsapp-badge {
    position: static;
    margin-top: 1rem;
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
  }

  .form-section {
    padding: 2rem 1.5rem;
  }

  .form-card {
    padding: 1.75rem;
  }

  .form-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .success-modal {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.5rem;
  }

  .whatsapp-card {
    padding: 1.25rem;
  }

  .whatsapp-icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .whatsapp-logo {
    font-size: 2rem;
  }

  .whatsapp-text h3 {
    font-size: 1rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .bolt-icon {
    font-size: 1.2rem;
  }

  .whatsapp-text p {
    font-size: 0.85rem;
  }

  .contact-label {
    font-size: 0.8rem;
  }

  .whatsapp-btn {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .whatsapp-btn svg:first-child {
    font-size: 1.25rem;
  }

  .whatsapp-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.85rem;
  }

  .form-icon-wrapper {
    width: 50px;
    height: 50px;
  }

  .form-icon {
    font-size: 1.5rem;
  }
}
</style>