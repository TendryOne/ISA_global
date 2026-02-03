<template>
  <div class="elite-form-container">
    <!-- Header avec effet gradient premium -->
    <div class="elite-header">
      <div class="header-gradient"></div>
      <div class="header-content">
        <div class="header-text">
          <h1>{{ user ? "Modification de l'utilisateur" : "Ajout d'un nouvel utilisateur" }}</h1>
          <p class="subtitle">Gestion des accès administratifs</p>
        </div>
        <div class="header-actions">
          <button class="back-button" @click="$router.back()">
            <Icon icon="mdi:arrow-left" />
            Retour
          </button>
        </div>
      </div>
    </div>

    <!-- Formulaire premium -->
    <div class="elite-form-content">
      <Form :validation-schema="validationSchema" @submit="handleSubmit" v-slot="{ errors, isSubmitting, values }"
        :initial-values="initialValues" class="elite-form">

        <!-- Carte d'information personnelle -->
        <div class="form-section-card">
          <div class="section-header">
            <Icon icon="mdi:account-circle" class="section-icon" />
            <h2>Informations Personnelles</h2>
          </div>
          <div class="form-grid">
            <InputField name="firstName" label="Prénom" floating class="premium-input"
              :class="{ 'has-error': errors.firstName }" />
            <InputField name="name" label="Nom" floating class="premium-input" :class="{ 'has-error': errors.name }" />
            <InputSelect name="gender" label="Genre" :options="genderOptions" floating class="premium-input"
              :class="{ 'has-error': errors.gender }" placeholder="Sélectionnez un genre" />
          </div>
        </div>

        <!-- Carte de coordonnées -->
        <div class="form-section-card">
          <div class="section-header">
            <Icon icon="mdi:contact-mail" class="section-icon" />
            <h2>Coordonnées</h2>
          </div>
          <div class="form-grid">
            <InputField name="email" label="Email" type="email" floating class="premium-input"
              :class="{ 'has-error': errors.email }" />
            <InputField name="phone" label="Téléphone" type="tel" floating class="premium-input"
              :class="{ 'has-error': errors.phone }" @keypress="(e) => limitInput(e, 10)" />
            <InputField name="address" label="Adresse" type="text" floating class="premium-input"
              :class="{ 'has-error': errors.address }" />
          </div>
        </div>

        <!-- Carte de fonction et rôle -->
        <div class="form-section-card">
          <div class="section-header">
            <Icon icon="mdi:badge-account" class="section-icon" />
            <h2>Rôle et Fonction</h2>
          </div>
          <div class="form-grid">
            <InputSelect name="function" label="Fonction" :options="functionOptions" floating class="premium-input"
              :class="{ 'has-error': errors.function }" placeholder="Sélectionnez une fonction" />
            <InputSelect name="role" label="Rôle" :options="rolesOptions" floating class="premium-input"
              :class="{ 'has-error': errors.role }" placeholder="Sélectionnez un rôle" />
          </div>
        </div>

        <!-- Résumé et actions -->
        <div class="summary-card">
          <div class="summary-header">
            <h3>Résumé</h3>
            <div class="user-avatar-preview">
              {{ getInitials(values.firstName + ' ' + values.name) }}
            </div>
          </div>

          <div class="summary-content">
            <div class="summary-item" v-if="values.firstName || values.name">
              <Icon icon="mdi:account" />
              <span>{{ values.firstName }} {{ values.name }}</span>
            </div>
            <div class="summary-item" v-if="values.email">
              <Icon icon="mdi:email" />
              <span>{{ values.email }}</span>
            </div>
            <div class="summary-item" v-if="values.function">
              <Icon icon="mdi:briefcase" />
              <span>{{ getOptionLabel(functionOptions, values.function) }}</span>
            </div>
            <div class="summary-item" v-if="values.role">
              <Icon icon="mdi:shield-account" />
              <span class="role-badge" :class="values.role">
                {{ getOptionLabel(rolesOptions, values.role) }}
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="$router.back()">
              <Icon icon="mdi:close" />
              Annuler
            </button>

            <ActionButton :icon="user ? 'material-symbols:save' : 'mdi:account-plus'" type="submit" variant="primary"
              :disabled="isSubmitting" class="submit-btn" :class="{ 'loading': isSubmitting }">
              <span v-if="isSubmitting">
                <Icon icon="mdi:loading" class="spinner" />
                {{ user ? 'Sauvegarde...' : 'Création...' }}
              </span>
              <span v-else>
                {{ user ? 'Sauvegarder' : "Créer l'utilisateur" }}
              </span>
            </ActionButton>
          </div>
        </div>
      </Form>
    </div>

    <SuccessToast v-if="toast.show" @dismissed="toast.show = false" :message="toast.message" :type="toast.type"
      :title="toast.type === 'success' ? 'Succès' : 'Erreur'" />

  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue';
import InputField from '@/components/ui/InputField.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import type AdminInterface from '@/interfaces/admin.interface';
import { toTypedSchema } from '@vee-validate/zod';
import axios from 'axios';
import { Form } from 'vee-validate';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as z from 'zod';
import { Icon } from '@iconify/vue';
import SuccessToast from '@/components/toast/successToast.vue';
import limitInput from '@/utils/limitInput';

const route = useRoute();
const router = useRouter();
const user = ref<AdminInterface | null>(null);
const toast = ref<{
  show: boolean;
  message: string;
  type: 'success' | 'error';
}>({ show: false, message: '', type: 'success' });

// Options pour les sélecteurs
const functionOptions = [
  { value: 'IT', label: 'Technicien IT' },
  { value: 'Scolarite', label: 'Scolarité' },
  { value: 'PDG', label: 'Direction' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Support', label: 'Support' },
];

const rolesOptions = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'superAdmin', label: 'Super Administrateur' },
];

const genderOptions = [
  { value: 'male', label: 'Masculin' },
  { value: 'female', label: 'Féminin' },
];

// Schéma de validation
const validationSchema = toTypedSchema(z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  function: z.string().min(1, 'La fonction est requise'),
  address: z.string().min(10, 'L\'adresse doit contenir au moins 10 caractères'),
  phone: z.string().max(10, 'Le numéro de téléphone ne peut pas dépasser 10 chiffres').regex(/^(\+\d{1,3})?\d{9,15}$/, 'Numéro de téléphone invalide'),
  role: z.string().min(1, 'Le rôle est requis'),
  email: z.string().email('Email invalide'),
  gender: z.string().min(1, 'Le genre est requis'),
}));

// Valeurs initiales
const initialValues = computed(() => ({
  name: user.value?.name || '',
  address: user.value?.address || '',
  email: user.value?.email || '',
  firstName: user.value?.firstName || '',
  gender: user.value?.gender || '',
  function: user.value?.function || '',
  phone: user.value?.phone || '',
  role: user.value?.role || '',
}));

// Récupération de l'utilisateur
const fetchUser = async () => {
  try {
    const response = await axios.get(`/api/v1/admins/user/${route.params.id}`);
    user.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    toast.value = { show: true, message: 'Erreur lors de la récupération des données', type: 'error' };
  }
};

if (route.params.id) {

  await fetchUser();

}

// Méthodes utilitaires
const getOptionLabel = (options: Array<{ value: string, label: string }>, value: string) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};





// Soumission du formulaire
const handleSubmit = async (values: any) => {
  try {
    if (user.value) {
      // Modification
      await axios.patch(`/api/v1/admins/user/${user.value._id}`, values);
      toast.value = { show: true, message: 'Utilisateur modifié avec succès', type: 'success' };
    } else {
      await axios.post('/api/v1/admins', values);
      toast.value = { show: true, message: 'Utilisateur créé avec succès', type: 'success' };
    }


    router.push('/admin/users/departments/list');


  } catch (error: any) {
    const message = error.response?.data || 'Une erreur est survenue';
    toast.value = { show: true, message, type: 'error' };
  }
};
</script>

<style scoped>
.elite-form-container {
  min-height: 100vh;
  background: var(--gray-extra-light);
}

/* Header élite */
.elite-header {
  height: 220px;
  position: relative;
  overflow: hidden;
  margin-bottom: 32px;
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
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 32px 32px;
  color: white;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  opacity: 0.9;
  margin: 0;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Contenu du formulaire */
.elite-form-content {
  padding: 0 32px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.elite-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-section-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-lighter);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-extra-light);
}

.section-icon {
  font-size: 28px;
  color: var(--primary-color);
}

.section-header h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.premium-input {
  position: relative;
}

.premium-input:deep(.form-floating > .form-control) {
  border: 2px solid var(--gray-lighter);
  border-radius: var(--radius);
  padding: 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--gray-extra-light);
}

.premium-input:deep(.form-floating > .form-control:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
  background: white;
}

.premium-input:deep(.form-floating > label) {
  padding: 16px;
  color: var(--gray);
  font-weight: 500;
}

.premium-input.has-error:deep(.form-floating > .form-control) {
  border-color: var(--error);
}

.premium-input.has-error:deep(.form-floating > .form-control:focus) {
  border-color: var(--error);
  box-shadow: 0 0 0 3px var(--error-light);
}

/* Carte de résumé */
.summary-card {
  grid-column: 1 / -1;
  background: white;
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow);
  border: 1px solid var(--gray-lighter);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--primary-extra-light);
}

.summary-header h3 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0;
}

.user-avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--gray-extra-light);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

.summary-item svg {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.role-badge.admin {
  background: var(--primary-extra-light);
  color: var(--primary-color);
}

.role-badge.superAdmin {
  background: var(--secondary-extra-light);
  color: var(--secondary-color);
}

.role-badge.user {
  background: var(--tertiary-extra-light);
  color: var(--tertiary-color);
}

.role-badge.moderator {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--gray-lighter);
}

.btn {
  display: flex;
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
  background: var(--gray-extra-light);
  color: var(--gray-dark);
  border: 1px solid var(--gray-lighter);
}

.btn-secondary:hover {
  background: var(--gray-lighter);
}

.submit-btn {
  min-width: 180px;
  justify-content: center;
}

.submit-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.spinner {
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
@media (max-width: 1024px) {
  .elite-form {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .elite-header {
    height: 180px;
  }

  .header-content {
    padding: 0 20px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-text h1 {
    font-size: 2rem;
  }

  .elite-form-content {
    padding: 0 20px 20px;
  }

  .form-section-card,
  .summary-card {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 1.7rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .section-header h2 {
    font-size: 1.2rem;
  }

  .summary-content {
    grid-template-columns: 1fr;
  }
}
</style>
