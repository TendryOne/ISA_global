<template>
  <div class="contact-section">
    <Form id="contactForm" class="contact-form" @submit="submit" :validation-schema="SchemaValidation"
      v-slot="{ errors }" :initial-values="initialValues" :key="formKey">

      <div class="section-header">
        <h2>
          <Icon icon="mdi:contacts" /> Coordonnées
        </h2>
        <div class="header-actions">
          <ActionButton v-if="editMode" variant="secondary" type="submit" form="contactForm" icon="mdi:content-save"
            :disabled="isSubmitting">
            {{ isSubmitting ? 'Enregistrement...' : 'Sauvegarder' }}
          </ActionButton>
          <ActionButton :variant="editMode ? 'outline' : 'primary'" @click="toggleEditMode" type="button"
            :icon="editMode ? 'mdi:close' : 'mdi:pencil'">
            {{ editMode ? 'Annuler' : 'Modifier' }}
          </ActionButton>
        </div>
      </div>

      <div class="section-content">
        <div class="info-grid">
          <!-- Adresse -->
          <div class="info-group">
            <div class="group-header">
              <Icon icon="mdi:home" />
              <h3>Adresse</h3>
            </div>
            <div class="info-cards">
              <div class="info-card full-width">
                <label>Adresse complète</label>
                <template v-if="editMode">
                  <Field name="address" v-slot="{ field, meta }">
                    <textarea v-bind="field" class="form-textarea"
                      :class="{ 'has-error': meta.touched && errors.address }"
                      placeholder="Entrez votre adresse complète" rows="3"></textarea>
                  </Field>
                  <span class="error-message" v-if="errors.address">{{ errors.address }}</span>
                </template>
                <div v-else class="value-display">
                  <span>{{ userStore.currentUser?.address || 'Non renseigné' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contacts -->
          <div class="info-group">
            <div class="group-header">
              <Icon icon="mdi:phone" />
              <h3>Contacts</h3>
            </div>
            <div class="info-cards">
              <div class="info-card">
                <label>Téléphone</label>
                <template v-if="editMode">
                  <div class="phone-input-wrapper" :class="{ 'has-error': errors.phone }">
                    <span class="phone-prefix">+261</span>
                    <Field name="phone" v-slot="{ field }">
                      <input v-bind="field" type="tel" class="form-input" placeholder="34 00 000 00"
                        @keypress="(e: any) => limitInput(e, 10)" />
                    </Field>
                  </div>
                  <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
                </template>
                <div v-else class="value-display">
                  <span>+261 {{ userStore.currentUser?.phone || 'Non renseigné' }}</span>
                </div>
              </div>

              <div class="info-card">
                <label>Email</label>
                <div class="value-display locked">
                  <span>{{ userStore.currentUser?.email || 'Non renseigné' }}</span>
                  <Icon icon="mdi:lock" class="lock-icon" />
                </div>
              </div>
            </div>
          </div>

          <!-- Contact d'urgence -->
          <div class="info-group emergency" v-if="userStore.isStudent">
            <div class="group-header">
              <Icon icon="mdi:account-alert" />
              <h3>Contact d'urgence</h3>
            </div>
            <div class="info-cards">
              <div class="info-card">
                <label>Nom complet</label>
                <template v-if="editMode">
                  <Field name="emergencyContactName" v-slot="{ field, meta }">
                    <input v-bind="field" type="text" class="form-input"
                      :class="{ 'has-error': meta.touched && errors.emergencyContactName }"
                      placeholder="Nom et prénom du contact" />
                  </Field>
                  <span class="error-message" v-if="errors.emergencyContactName">{{ errors.emergencyContactName
                  }}</span>
                </template>
                <div v-else class="value-display">
                  <span>{{ userStore.currentUser?.emergencyContactName || 'Non renseigné' }}</span>
                </div>
              </div>

              <div class="info-card">
                <label>Lien de parenté</label>
                <template v-if="editMode">
                  <Field name="emergencyContactRelation" v-slot="{ field, meta }">
                    <select v-bind="field" class="form-select"
                      :class="{ 'has-error': meta.touched && errors.emergencyContactRelation }">
                      <option value="" disabled>Sélectionnez...</option>
                      <option value="parent">Parent</option>
                      <option value="fratrie">Frère/Soeur</option>
                      <option value="conjoint">Conjoint(e)</option>
                      <option value="tuteur">Tuteur légal</option>
                    </select>
                  </Field>
                  <span class="error-message" v-if="errors.emergencyContactRelation">{{ errors.emergencyContactRelation
                  }}</span>
                </template>
                <div v-else class="value-display">
                  <span>{{ getRelationLabel(userStore.currentUser?.emergencyContactRelation) }}</span>
                </div>
              </div>

              <div class="info-card">
                <label>Téléphone</label>
                <template v-if="editMode">
                  <div class="phone-input-wrapper" :class="{ 'has-error': errors.emergencyContactPhone }">
                    <span class="phone-prefix">+261</span>
                    <Field name="emergencyContactPhone" v-slot="{ field }">
                      <input v-bind="field" type="tel" class="form-input" placeholder="34 00 000 00"
                        @keypress="(e: any) => limitInput(e, 9)" />
                    </Field>
                  </div>
                  <span class="error-message" v-if="errors.emergencyContactPhone">{{ errors.emergencyContactPhone
                  }}</span>
                </template>
                <div v-else class="value-display">
                  <span>+261 {{ userStore.currentUser?.emergencyContactPhone || 'Non renseigné' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>

    <SuccessToast v-if="toast.show" :title="toast.title" :message="toast.message" :type="toast.type"
      @dismissed="toast.show = false" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useMyUserStore } from '@/stores/userStore';
import { Form, Field } from 'vee-validate';
import { computed, ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import SuccessToast from '@/components/toast/successToast.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import axios from 'axios';
import limitInput from '@/utils/limitInput';
import { PostEventLog } from '@/utils/eventLog';

const userStore = useMyUserStore();

const toast = ref<ToastInterface>({
  show: false,
  message: '',
  type: 'success',
  title: ''
});

const isSubmitting = ref(false);

const SchemaValidation = toTypedSchema(
  z.object({
    address: z.string({ required_error: 'Ce champ ne doit pas être vide' })
      .min(10, { message: 'Adresse trop courte (minimum 10 caractères)' }),

    emergencyContactPhone: z.string().optional(),
    emergencyContactRelation: z.string().optional(),
    emergencyContactName: z.string().optional(),

    phone: z.string({ required_error: 'Ce champ ne doit pas être vide' })
      .min(9, { message: 'Numéro de téléphone invalide' })
      .regex(/^[0-9]+$/, { message: 'Numéro de téléphone invalide' }),
  }).superRefine((data, ctx) => {
    if (userStore.isStudent) {
      if (!data.emergencyContactName || data.emergencyContactName.length < 2) {
        ctx.addIssue({
          path: ["emergencyContactName"],
          code: z.ZodIssueCode.custom,
          message: "Nom du contact requis",
        });
      }

      if (!data.emergencyContactRelation || data.emergencyContactRelation.length < 2) {
        ctx.addIssue({
          path: ["emergencyContactRelation"],
          code: z.ZodIssueCode.custom,
          message: "Lien de parenté requis",
        });
      }

      if (!data.emergencyContactPhone || !/^[0-9]+$/.test(data.emergencyContactPhone) || data.emergencyContactPhone.length < 9) {
        ctx.addIssue({
          path: ["emergencyContactPhone"],
          code: z.ZodIssueCode.custom,
          message: "Numéro de téléphone invalide",
        });
      }
    }
  })
);


const initialValues = computed(() => ({
  address: userStore.currentUser?.address || '',
  emergencyContactName: userStore.isStudent && userStore.currentUser?.emergencyContactName || '',
  emergencyContactRelation: userStore.isStudent && userStore.currentUser?.emergencyContactRelation || '',
  emergencyContactPhone: userStore.isStudent && userStore.currentUser?.emergencyContactPhone || '',
  phone: userStore.currentUser?.phone || ''
}));

const relationLabels: Record<string, string> = {
  'parent': 'Parent',
  'fratrie': 'Frère/Soeur',
  'conjoint': 'Conjoint(e)',
  'tuteur': 'Tuteur légal'
};

const getRelationLabel = (value: string | undefined) => {
  if (!value) return 'Non renseigné';
  return relationLabels[value] || value;
};

async function submit(values: any) {
  isSubmitting.value = true;
  try {

    await axios.patch(`/api/v1/user/update-all/${userStore.currentUser?._id}`, values);
    userStore.UpdateUserLocallyWithPartialInfo(values);

    toast.value = {
      show: true,
      message: 'Vos coordonnées ont été mises à jour avec succès.',
      type: 'success',
      title: 'Succès'
    };
    editMode.value = false;
    if (useMyUserStore().currentUser!.role === 'professor') {
      await PostEventLog({
        entityId: userStore.currentUser!._id,
        entityType: "user",
        eventType: "PROFESSOR_PROFILE_UPDATED",
        timestamp: new Date(),
        userId: userStore.currentUser!._id,
        payload: { updatedFields: Object.keys(values) }
      })
    } else if (useMyUserStore().currentUser!.role === 'student') {
      await PostEventLog({
        entityId: userStore.currentUser!._id,
        entityType: "user",
        eventType: "STUDENT_PROFILE_UPDATED",
        timestamp: new Date(),
        userId: userStore.currentUser!._id,
        payload: { updatedFields: Object.keys(values) }
      })
    }

  } catch (error: any) {
    toast.value = {
      show: true,
      message: error.response?.data || 'Une erreur est survenue lors de la mise à jour de vos coordonnées.',
      type: 'error',
      title: 'Erreur'
    };
  } finally {
    isSubmitting.value = false;
  }
}

const editMode = ref<boolean>(false);
const formKey = ref<number>(0);

const toggleEditMode = () => {
  if (editMode.value) {
    formKey.value++;
  }
  editMode.value = !editMode.value;
};
</script>

<style scoped>
.contact-section {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.contact-form {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(var(--secondary-rgb), 0.05));
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-dark);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.section-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-group {
  background: var(--tertiary-extra-light);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.info-group.emergency {
  grid-column: 1 / -1;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.group-header svg {
  color: var(--primary-color);
  font-size: 1.25rem;
}

.group-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-darker);
  margin: 0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-card {
  background: white;
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.info-card label {
  display: block;
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--gray-dark);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.value-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9375rem;
  color: var(--gray-darker);
  padding: 0.5rem 0;
}

.value-display.locked {
  color: var(--gray-dark);
}

.lock-icon {
  color: var(--gray-light);
  font-size: 0.875rem;
}

/* Form inputs */
.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.form-input.has-error,
.form-textarea.has-error,
.form-select.has-error {
  border-color: var(--error);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236b7280' d='m12 15l-5-5h10l-5 5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.phone-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.2s ease;
}

.phone-input-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.phone-input-wrapper.has-error {
  border-color: var(--error);
}

.phone-prefix {
  padding: 0.75rem 1rem;
  background: var(--tertiary-extra-light);
  color: var(--gray-dark);
  font-weight: 500;
  border-right: 1px solid var(--gray-lighter);
  white-space: nowrap;
}

.phone-input-wrapper .form-input {
  border: none;
  box-shadow: none;
}

.phone-input-wrapper .form-input:focus {
  box-shadow: none;
}

.error-message {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--error);
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
