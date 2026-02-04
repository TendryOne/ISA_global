<template>
  <div class="promotion-form-container">
    <!-- Header avec bouton de navigation -->
    <div class="form-navigation">
      <BaseButton icon="mdi:arrow-left" @click="navigateToList">
        Retour à la liste des frais de scolarité
      </BaseButton>
    </div>

    <!-- En-tête premium -->
    <div class="form-header">
      <div class="header-accent"></div>
      <div class="header-content">
        <div class="university-logo">
          <Icon icon="mdi:school-outline" width="36" />
        </div>
        <h2 v-if="!route.params.id && feesResponse">Définition des frais de scolarité</h2>
        <h2 v-else>Modification des frais de scolarité de la filiere {{ feesResponse?.field }} pour le niveau {{
          feesResponse?.level }}</h2>
        <p class="header-subtitle">Année universitaire {{ currentYear }}-{{ currentYear + 1 }}</p>
      </div>
    </div>

    <Form @submit="handleSubmit" :validation-schema="validationSchema" v-slot="{ errors, values }"
      :initial-values="initialValues" class="promotion-form">
      <!-- Section Principale -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title-container">
            <div class="section-icon">
              <Icon icon="mdi:account-group" width="24" />
            </div>
            <h3>Configuration des frais de scolarité</h3>
          </div>
          <div class="section-divider"></div>
        </div>

        <div class="form-grid">
          <InputSelect name="level" label="Niveau académique" :options="levelOptions" floating
            :error="!!(errors && errors.level)" placeholder="Sélectionnez le niveau" icon="mdi:bookshelf" />
          <InputSelect name="field" label="Filiere" :options="FieldOptions" floating :error="!!(errors && errors.field)"
            placeholder="Selectionnez une filiere" icon="flowbite:book-open-reader-outline" />



          <InputField name="fees" label="Frais de scolarité" type="number" placeholder="Montant en Ariary"
            rules="min_value:0" floating icon="mdi:cash-multiple" :error="!!(errors && errors.fees)">
            <template #suffix>
              <span class="currency">MGA</span>
            </template>
          </InputField>
        </div>
      </div>

      <!-- Section Échéances Premium -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title-container">
            <div class="section-icon">
              <Icon icon="mdi:calendar-clock" width="24" />
            </div>
            <h3>Calendrier des Échéances</h3>
          </div>
          <BaseButton icon="mdi:plus-circle" @click="addEcheance" variant="secondary">
            Nouvelle Échéance
          </BaseButton>
        </div>

        <div v-if="echeances.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <Icon icon="mdi:calendar-alert" width="48" />
          </div>
          <h4>Aucune échéance configurée</h4>
          <p>Ajoutez les dates importantes pour les frais de scolarité</p>
          <BaseButton icon="mdi:plus" @click="addEcheance" variant="text">
            Ajouter la première échéance
          </BaseButton>
        </div>

        <div v-else class="echeances-list">
          <div v-for="(_, index) in echeances" :key="index" class="echeance-card"
            :class="{ 'first-card': index === 0 }">
            <div class="echeance-number">{{ index + 1 }}</div>
            <div class="echeance-content">
              <div class="echeance-grid">
                <!--
                <InputSelect :name="`echeances[${index}].label`" label="Libellé de l'échéance"
                  placeholder="Choisissez le Libellé ..." rules="required" floating icon="mdi:label"
                  :options="labelOptions" /> -->

                <InputField :name="`echeances[${index}].label`" label="Libellé de l'échéance"
                  placeholder="Ex: 1er versement, Frais d'inscription..." rules="required" floating icon="mdi:label"
                  :model-value="`Tranche ${index + 1}`" disabled />

                <InputField :name="`echeances[${index}].date`" label="Date limite" type="date" placeholder=" "
                  rules="required" floating icon="mdi:calendar-alert" />

                <InputField :name="`echeances[${index}].amount`" label="Montant à payer" type="number" placeholder=" "
                  rules="required|min_value:0" floating icon="mdi:cash">
                  <template #suffix>
                    <span class="currency">MGA</span>
                  </template>
                </InputField>

                <BaseButton icon="mdi:trash-can-outline" @click="removeEcheance(index)" variant="danger" />
              </div>
            </div>
          </div>
          <div :class="{
            ok: values.fees && values.echeances && values.echeances.reduce((sum: number, e: Echeance) => sum + (e.amount || 0), 0) === values.fees,
            error: values.fees && values.echeances && values.echeances.reduce((sum: number, e: Echeance) => sum + (e.amount || 0), 0) !== values.fees
          }">
            Total :
            {{
              values.echeances
                ? values.echeances.reduce((acc: number, e: Echeance) => acc + (e.amount || 0), 0).toLocaleString()
                : 0
            }}
            Ariary /
            {{ values.fees ? values.fees.toLocaleString() : 0 }} Ariary
          </div>


        </div>
      </div>

      <div class="form-actions">

        <BaseButton icon="mdi:content-save-check" type="submit" variant="primary">
          {{ feesResponse && route.params.id ? "Modifier les frais de scolarité "
            : "Enregistrer les frais de scolarité" }}

        </BaseButton>
      </div>
      <pre>
  {{ values }}
</pre>
    </Form>

    <SuccessToast v-if="isErrorToast" :message="MessageToast" :title="TitleToast" @dismissed="isErrorToast = false"
      type="error" />


  </div>
</template>

<script setup lang="ts">

import { Field, Form } from 'vee-validate';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import InputField from '@/components/ui/InputField.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import axios from 'axios';
import SuccessToast from '@/components/toast/successToast.vue';
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface';
import { useSocket } from '@/composables/useSocket';



const router = useRouter();

interface Echeance {
  date: string;
  amount: number;
  label: string;
}
const route = useRoute()
const feesResponse = ref<FeesManagementInterface | null>(null)
const echeances = ref<Echeance[]>([]);
const fetchFees = async () => {
  try {
    const response = (await axios.get(`/api/v1/feesManagement/${route.params.id}`)).data;
    feesResponse.value = response;

    if (response.echeances && response.echeances.length > 0) {
      echeances.value = response.echeances.map((e: Echeance) => ({
        ...e,
        date: new Date(e.date).toISOString().slice(0, 10),
      }));
    } else {
      echeances.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};


if (route.params.id) {
  await fetchFees()

}





const initialValues = computed(() => ({
  echeances: echeances.value.length > 0
    ? echeances.value
    : [{
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      label: ''
    }],
  fees: feesResponse.value?.fees || 0,
  field: feesResponse.value?.field || null,
  level: feesResponse.value?.level || null,
}));








const MessageToast = ref<string>("")
const TitleToast = ref<string>("")
const isErrorToast = ref<boolean>(false)

const currentYear = new Date().getFullYear();



const labelOptions = [
  { value: 1, label: '1er versement' },
  { value: 2, label: '2eme versement' },
  { value: 3, label: '3eme versement' },
  { value: 4, label: '4eme versement' },
  { value: 5, label: '5eme versement' },
  { value: 6, label: '6eme versement' },
  { value: 7, label: '7eme versement' },
]

const FieldOptions = [
  { value: 'btp', label: "Batiments et travaux publiques" },
  { value: 'informatique', label: "Informatiques" },
  { value: 'gestion', label: "Gestion" }
]

const levelOptions = [
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
];


const today = new Date()
today.setHours(0, 0, 0, 0)

const validationSchema = toTypedSchema(
  z.object({
    level: z.string().min(1, 'Le niveau est requis'),
    vague: z.string().optional(),
    fees: z.number().min(0, 'Les frais ne peuvent pas être négatifs'),
    field: z.string().min(1, 'La filiere est requise'),
    echeances: z.array(
      z.object({
        label: z.string().min(1, 'Le libellé est requis'),
        date: z
          .string()
          .min(1, 'La date est requise')
          .refine((val) => {
            const inputDate = new Date(val)
            inputDate.setHours(0, 0, 0, 0)
            return inputDate >= today
          }, {
            message: 'La date ne peut pas être dans le passé'
          }),
        amount: z.number().min(0, 'Le montant ne peut pas être négatif')
      })
    )
  })
);

const addEcheance = () => {
  console.log("push");

  echeances.value.push({
    date: '',
    amount: 0,
    label: ''
  });
};

const removeEcheance = (index: number) => {
  echeances.value.splice(index, 1);
};

const resetForm = () => {
  echeances.value = [];
};

const navigateToList = () => {
  router.push('/admin/fees');
};

const { emit } = useSocket()

const handleSubmit = async (values: any) => {
  try {
    const isTotalOfFeesAndEcheanceEqual = values.echeances.reduce((sum: number, e: Echeance) => sum + (e.amount || 0), 0);
    if (!(isTotalOfFeesAndEcheanceEqual === values.fees)) {
      MessageToast.value = "Le total des frais de scolarité ne correspond pas au montant total des échéances fournies.";
      isErrorToast.value = true;
      TitleToast.value = "Erreur lors de la création des frais de scolarité";
      return
    }

    if (route.params.id) {
      await axios.patch(`/api/v1/feesManagement/${route.params.id}`, values)
      emit("sendNotificationForFeesUpdateToStudentRoom")
    } else {
      emit("sendNotificationForFeesUpdateToStudentRoom")
      await axios.post("/api/v1/feesManagement", values);

    }

    resetForm();
    router.push("/admin/fees/manage/list");

  } catch (error) {
    MessageToast.value = axios.isAxiosError(error) && error.response ? error.response.data : "Erreur Serveur lors de la création des frais de scolarité.";
    isErrorToast.value = true;
    TitleToast.value = "Erreur Serveur lors de la création des frais de scolarité";

  }


};
</script>

<style scoped>
.ok {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-weight: bold;
}


.promotion-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  position: relative;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
}

.form-navigation {
  padding: 1.5rem 0;
  margin-bottom: 1rem;
}

.back-button {
  color: var(--primary-dark);
  font-weight: 600;
}

.form-header {
  position: relative;
  margin-bottom: 3rem;
  padding: 2rem;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-accent {
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.university-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-header h2 {
  font-size: 2.25rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.header-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.9);
}

.promotion-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.form-section {
  background-color: var(--white);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-title-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border-radius: 50%;
  color: white;
}

.section-divider {
  flex-grow: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 0 1.5rem;
}

.form-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.add-button {
  box-shadow: 0 4px 12px rgba(var(--secondary-color-rgb), 0.2);
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  background-color: rgba(var(--primary-color-rgb), 0.03);
  border-radius: 12px;
  border: 2px dashed rgba(var(--primary-color-rgb), 0.1);
}

.empty-state-icon {
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  opacity: 0.7;
}

.empty-state h4 {
  font-size: 1.25rem;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--tertiary-dark);
  margin-bottom: 1.5rem;
}

.echeances-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.echeance-card {
  background-color: var(--white);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  gap: 1.5rem;
  position: relative;
}

.echeance-card.first-card {
  border-left: 4px solid var(--primary-color);
}

.echeance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  border-color: rgba(var(--primary-color-rgb), 0.2);
}

.echeance-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(var(--primary-color-rgb), 0.1);
  color: var(--primary-dark);
  border-radius: 50%;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.echeance-content {
  flex-grow: 1;
}

.echeance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 1.5rem;
  align-items: end;
}

.remove-button {
  margin-bottom: 0.5rem;
}

.currency {
  font-weight: 600;
  color: var(--primary-dark);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.cancel-button {
  border: 1px solid var(--error-light);
  color: var(--error);
}

.submit-button {
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .echeance-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .echeance-card {
    flex-direction: column;
    gap: 1rem;
  }

  .echeance-number {
    margin-top: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .section-divider {
    display: none;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
