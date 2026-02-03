<template>
  <div class="form-container">
    <div id="index" ref="targetDiv"></div>
    <AdmissionFormHeader />

    <AdmissionFormStep :stepData="stepData" :currentStep="currentStep" />
    <Form
      @submit="handleSubmit"
      class="modern-form"
      keep-values
      v-slot="{ values, isSubmitting }"
      :key="formKey"
    >
      <!-- Badge sécurité -->
      <div class="security-badge">
        <Icon name="heroicons:shield-check-solid" class="security-icon" />
        <span>Formulaire protégé anti-spam</span>
      </div>

      <h2 class="form-title" v-for="step in stepData" :key="step.step">
        <template v-if="currentStep === step.step">
          <span>{{ step.title }} </span>
          <Icon :name="step.icons" />
        </template>
      </h2>

      <!-- Étape 1: Informations Personnelles -->
      <div class="form-step" v-if="currentStep === 1">
        <div class="form-grid">
          <!-- Identité -->
          <div class="form-section">
            <h3 class="section-title">
              <Icon
                name="heroicons:identification-solid"
                class="section-icon"
              />
              Identité
            </h3>
            <div
              class="form-group"
              aria-hidden="true"
              style="
                position: absolute;
                left: -9999px;
                width: 1px;
                height: 1px;
                overflow: hidden;
              "
            >
              <label for="website">Site web (ne pas remplir)</label>
              <Field
                id="website"
                name="website"
                type="text"
                class="form-input"
                tabindex="-1"
                autocomplete="off"
              />
            </div>

            <div class="form-group left">
              <label for="identityPhoto">Photo d'identité récente*</label>
              <Field
                id="identityPhoto"
                name="identityPhoto"
                accept="image/*"
                type="file"
                :rules="identityPhotoValidator"
                @change="HandleChangeReadIdentityPhoto"
                v-show="false"
              />
              <label for="identityPhoto" class="label-overview">
                <div
                  class="img"
                  :style="{
                    backgroundImage: `url(${
                      imgSrcPhotoIdentity
                        ? imgSrcPhotoIdentity
                        : '/user-svgrepo-com.svg'
                    })`,
                  }"
                ></div>
                <div class="overlay">
                  <span>cliquer ici pour changer la photo</span>
                </div>
              </label>
              <ErrorMessage name="identityPhoto" class="error-message" />
            </div>
            <div class="form-group double">
              <div class="input-pair">
                <div class="form-group">
                  <label>Nom*</label>
                  <Field
                    name="lastName"
                    type="text"
                    placeholder="Votre nom"
                    class="form-input"
                    :rules="lastNameValidator"
                  />
                  <ErrorMessage name="lastName" class="error-message" />
                </div>

                <div class="form-group">
                  <label>Prénom*</label>
                  <Field
                    name="firstName"
                    type="text"
                    placeholder="Votre prénom"
                    class="form-input"
                    :rules="firstNameValidator"
                  />
                  <ErrorMessage name="firstName" class="error-message" />
                </div>
              </div>
            </div>

            <div class="form-group double">
              <div class="input-pair">
                <div class="form-group">
                  <label>Date de naissance*</label>
                  <Field
                    name="birthDate"
                    type="date"
                    class="form-input"
                    :rules="birthDateValidator"
                  />
                  <ErrorMessage name="birthDate" class="error-message" />
                </div>

                <div class="form-group">
                  <label>Lieu de naissance*</label>
                  <Field
                    name="birthPlace"
                    type="text"
                    placeholder="Lieu de naissance"
                    class="form-input"
                    :rules="birthPlaceValidator"
                  />
                  <ErrorMessage name="birthPlace" class="error-message" />
                </div>
              </div>
            </div>

            <div class="form-group double">
              <div class="input-pair">
                <div class="form-group">
                  <label>Sexe*</label>
                  <Field
                    name="gender"
                    as="select"
                    class="form-select"
                    :rules="genderValidator"
                  >
                    <option value="" disabled selected>Sélectionnez...</option>
                    <option value="male">Masculin</option>
                    <option value="female">Féminin</option>
                  </Field>
                  <ErrorMessage name="gender" class="error-message" />
                </div>

                <div class="form-group">
                  <label>Numéro CIN (optionnel si mineur)</label>
                  <Field
                    name="cin"
                    type="text"
                    placeholder="Numéro CIN"
                    class="form-input"
                    :disabled="values.birthDate && isMinor(values.birthDate)"
                    :rules="
                      values.birthDate && isMinor(values.birthDate)
                        ? cinOptionnalValidator
                        : cinValidator
                    "
                    @keypress="handleKeypressCin"
                  />
                  <ErrorMessage name="cin" class="error-message" />
                </div>
              </div>
            </div>
          </div>

          <!-- Contact -->
          <div class="form-section">
            <h3 class="section-title">
              <Icon name="heroicons:envelope-solid" class="section-icon" />
              Coordonnées
            </h3>
            <div class="form-group">
              <label>Adresse complète*</label>
              <Field
                name="address"
                placeholder="Votre adresse complète"
                class="form-input"
                :rules="addressValidator"
              />
              <ErrorMessage name="address" class="error-message" />
            </div>

            <div class="form-group double">
              <div class="input-pair">
                <div class="form-group">
                  <label>Téléphone du contact*</label>
                  <div class="phone-input-container">
                    <div class="phone-prefix">
                      <Icon name="twemoji:flag-madagascar" class="flag-icon" />
                      <span class="country-code">+261</span>
                    </div>
                    <Field
                      name="phone"
                      type="tel"
                      placeholder="34 12 345 67"
                      class="form-input phone-input"
                      :rules="phoneValidator"
                      @keypress="handleKeypressPhone"
                    />
                  </div>
                  <ErrorMessage name="phone" class="error-message" />
                </div>

                <div class="form-group">
                  <label>Email*</label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="exemple@email.com"
                    class="form-input"
                    :rules="emailValidator"
                  />
                  <ErrorMessage name="email" class="error-message" />
                </div>
              </div>
            </div>
          </div>

          <!-- Contact d'urgence -->
          <div class="form-section">
            <h3 class="section-title">
              <Icon name="heroicons:phone-solid" class="section-icon" />
              Personne à contacter en cas d'urgence
            </h3>
            <div class="form-group double">
              <div class="input-pair">
                <div class="form-group">
                  <label>Nom complet*</label>
                  <Field
                    name="emergencyContactName"
                    type="text"
                    placeholder="Nom de la personne"
                    class="form-input"
                    :rules="emergencyContactNameValidator"
                  />
                  <ErrorMessage
                    name="emergencyContactName"
                    class="error-message"
                  />
                </div>

                <div class="form-group">
                  <label>Lien de parenté*</label>
                  <Field
                    name="emergencyContactRelation"
                    as="select"
                    class="form-input"
                    :rules="emergencyContactRelationValidator"
                  >
                    <option value="" disabled selected>Sélectionnez...</option>
                    <option value="parent">Parent</option>
                    <option value="fratrie">Frère/Soeur</option>
                    <option value="conjoint">Conjoint(e)</option>
                    <option value="tuteur">Tuteur légal</option>
                  </Field>
                  <ErrorMessage
                    name="emergencyContactRelation"
                    class="error-message"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Téléphone du contact*</label>
              <div class="phone-input-container">
                <div class="phone-prefix">
                  <Icon name="twemoji:flag-madagascar" class="flag-icon" />
                  <span class="country-code">+261</span>
                </div>
                <Field
                  name="emergencyContactPhone"
                  type="tel"
                  placeholder="34 12 345 67"
                  class="form-input phone-input"
                  :rules="emergencyContactPhoneValidator"
                  @keypress="handleKeypressPhone"
                />
              </div>
              <ErrorMessage
                name="emergencyContactPhone"
                class="error-message"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 2: Informations Académiques -->
      <div class="form-step" v-if="currentStep === 2">
        <div class="form-grid">
          <div class="form-group double">
            <div class="input-pair">
              <div class="form-group">
                <label>Dernier diplôme obtenu*</label>
                <Field
                  name="lastDiploma"
                  as="select"
                  class="form-select"
                  :rules="lastDiplomaValidator"
                >
                  <option value="" disabled selected>Sélectionnez...</option>
                  <option value="Bepc">BEPC</option>
                  <option value="bac">BAC</option>
                  <!-- <option value="licence">Licence</option> -->
                </Field>
                <ErrorMessage name="lastDiploma" class="error-message" />
              </div>

              <div class="form-group">
                <label>Série du BAC*</label>
                <Field
                  name="bacSeries"
                  as="select"
                  class="form-select"
                  :rules="bacSeriesValidator"
                >
                  <option value="" disabled selected>Sélectionnez...</option>
                  <option value="A1">Série A1</option>
                  <option value="A2">Série A2</option>
                  <option value="C">Série C</option>
                  <option value="D">Série D</option>
                  <option value="Techniques">Techniques</option>
                  <option value="autre">Autre</option>
                </Field>
                <ErrorMessage name="bacSeries" class="error-message" />
              </div>
            </div>
          </div>

          <div class="form-group double">
            <div class="input-pair">
              <div class="form-group">
                <label>Année d'obtention du BAC*</label>
                <Field
                  name="bacYear"
                  type="number"
                  min="1950"
                  :max="new Date().getFullYear()"
                  placeholder="Année"
                  class="form-input"
                  :rules="bacYearValidator"
                />
                <ErrorMessage name="bacYear" class="error-message" />
              </div>

              <div class="form-group">
                <label>{{
                  values.lastDiploma && values.lastDiploma === "licence"
                    ? "Université d'origine*"
                    : "Établissement d'origine*"
                }}</label>
                <Field
                  name="previousInstitution"
                  type="text"
                  placeholder="Nom de l'établissement"
                  class="form-input"
                  :rules="previousInstitutionValidator"
                />
                <ErrorMessage
                  name="previousInstitution"
                  class="error-message"
                />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Choix de la filière*</label>
            <Field
              name="field"
              as="select"
              class="form-select"
              :rules="fieldValidator"
            >
              <option value="" disabled selected>
                Sélectionnez votre filière
              </option>
              <option value="btp">BTP</option>
              <option value="informatique">Informatique</option>
              <option value="gestion">Gestion</option>
            </Field>
            <ErrorMessage name="field" class="error-message" />
          </div>
          <!-- <div class="form-group">
            <label>Niveau demandé*</label>
            <Field name="eligibleLevels" as="select" class="form-select"
              :rules="values.field && values.field === 'btp' ? eligibleLevelsValidatorBTP : eligibleLevelsValidator">
              <option value="" disabled selected>Sélectionnez le niveau demandé </option>
              <option value="L1">L1</option>
              <option v-if="values.field && values.field !== 'btp'" value="L2">L2</option>
              <option v-if="values.field && values.field !== 'btp'" value="L3">L3</option>
            </Field>
            <ErrorMessage name="eligibleLevels" class="error-message" />
          </div> -->
        </div>
      </div>

      <!-- Étape 3: Documents à fournir -->
      <div class="form-step" v-if="currentStep === 3">
        <div class="documents-grid">
          <div class="document-item">
            <div class="document-header">
              <Icon
                name="heroicons:document-text-solid"
                class="document-icon"
              />
              <h3>Relevé de notes du BAC</h3>
              <p>(format .jpeg ou .png)</p>
            </div>
            <p class="payment-note">
              Optionnel :
              <strong>Bacc >= {{ new Date().getFullYear() }}</strong> mais devra
              être remise lors du finalisation de l'inscription
            </p>
            <Field
              id="bacTranscript"
              name="bacTranscript"
              accept="image/*,.pdf"
              type="file"
              :rules="
                values.bacYear < new Date().getFullYear()
                  ? bacTranscriptValidator
                  : bacTranscriptValidatorOptional
              "
              @change="HandleChangeReadBacPhoto"
              v-show="!imgSrcBac"
            />
            <label
              for="bacTranscript"
              v-show="imgSrcBac"
              class="label-overview"
            >
              <div
                class="img"
                :style="{ backgroundImage: `url(${imgSrcBac})` }"
              ></div>
              <div class="overlay"><span>cliquer ici pour changer </span></div>
            </label>
            <div
              class="overview"
              @click="openModal(imgSrcBac, 'Releve de note')"
              v-if="imgSrcBac"
            >
              <span>Aperçu</span>
              <Icon name="material-symbols:eye-tracking" />
            </div>
            <ErrorMessage name="bacTranscript" class="error-message" />
          </div>

          <div class="document-item">
            <div class="document-header">
              <Icon
                name="heroicons:identification-solid"
                class="document-icon"
              />
              <h3>Copie CIN ou acte de naissance</h3>
              <p>(format .jpeg ou .png)</p>
            </div>

            <Field
              name="idDocument"
              id="idDocument"
              accept="image/*,.pdf"
              type="file"
              :rules="idDocumentValidator"
              v-show="!imgSrcCin"
              @change="HandleChangeReadCin"
            />

            <label for="idDocument" v-show="imgSrcCin" class="label-overview">
              <div
                class="img"
                :style="{ backgroundImage: `url(${imgSrcCin})` }"
              ></div>
              <div class="overlay"><span>cliquer ici pour changer </span></div>
            </label>
            <div
              class="overview"
              @click="openModal(imgSrcCin, 'Copie CIN')"
              v-if="imgSrcCin"
            >
              <span>Aperçu</span>
              <Icon name="material-symbols:eye-tracking" />
            </div>
            <ErrorMessage name="idDocument" class="error-message" />
          </div>

          <div class="document-item">
            <div class="document-header">
              <Icon name="heroicons:home-solid" class="document-icon" />
              <h3>Certificat de résidence</h3>
              <p>(format .jpeg ou .png)</p>
            </div>
            <Field
              id="residenceCertificate"
              name="residenceCertificate"
              accept="image/*,.pdf"
              type="file"
              :rules="residenceCertificateValidator"
              @change="HandleChangeReadResidence"
              v-show="!imgSrcResidence"
            />
            <label
              for="residenceCertificate"
              v-show="imgSrcResidence"
              class="label-overview"
            >
              <div
                class="img"
                :style="{ backgroundImage: `url(${imgSrcResidence})` }"
              ></div>
              <div class="overlay"><span>cliquer ici pour changer </span></div>
            </label>
            <div
              class="overview"
              @click="openModal(imgSrcResidence, 'Certificat de residence')"
              v-if="imgSrcResidence"
            >
              <span>Aperçu</span>
              <Icon name="material-symbols:eye-tracking" />
            </div>
            <ErrorMessage name="residenceCertificate" class="error-message" />
          </div>
        </div>
      </div>

      <!-- Étape 4: Paiement -->
      <div class="form-step" v-if="currentStep === 4">
        <div class="payment-info">
          <div class="fee-card">
            <div class="fee-header">
              <Icon name="heroicons:banknotes-solid" class="fee-icon" />
              <h3>Frais d'inscription</h3>
            </div>
            <div class="fee-amount">30 000 Ar</div>
            <p class="fee-note">Non remboursable</p>
          </div>

          <div class="payment-methods">
            <h3>Méthode de paiement</h3>
            <div class="method selected">
              <Icon name="ph:money" class="method-icon" />
              <span
                >Mobile Money (Mvola) sur le numero suivant +261 034 50 798
                32</span
              >
            </div>
            <p class="payment-note">
              Nom sur le numero Mvola : <strong>Test test</strong>
            </p>
            <p class="payment-note">Référence: <strong>INSCRIPTION</strong></p>
          </div>

          <div class="payment-details">
            <div class="form-group">
              <label>Référence ou numéro de transaction</label>
              <Field
                name="transactionNumber"
                type="text"
                placeholder="Référence ou numéro de transaction"
                class="form-input"
                :rules="transactionNumberValidator"
              />
              <ErrorMessage name="transactionNumber" class="error-message" />
            </div>
          </div>
          <!-- Remplacez cette partie dans l'étape 4 -->
          <div class="form-group terms-group">
            <div class="checkbox-container">
              <Field
                name="acceptingTerms"
                id="acceptingTerms"
                type="checkbox"
                class="form-checkbox"
                :rules="acceptingTermsValidator"
                :value="true"
              />
              <label for="acceptingTerms" class="terms-label">
                Je déclare que toutes les informations fournies sont exactes. Je
                comprends que toute fausse déclaration entraînera le rejet de ma
                candidature. Je reconnais également que mon inscription ne sera
                validée qu'après vérification complète des pièces justificatives
                et confirmation du paiement.
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="button-container">
        <button
          type="button"
          class="secondary-button"
          @click="prevStep"
          v-if="currentStep > 1"
        >
          <Icon name="heroicons:arrow-left-solid" class="button-icon" />
          Précédent
        </button>
        <button
          type="submit"
          class="primary-button"
          v-if="currentStep === 4"
          :disabled="!values.acceptingTerms || isSubmitting"
          :class="{ disabled: !values.acceptingTerms || isSubmitting }"
        >
          <span v-if="!isSubmitting">Soumettre la demande</span>
          <span v-else>Traitement en cours...</span>
          <Icon
            name="heroicons:paper-airplane-solid"
            class="button-icon"
            :class="{ 'animate-pulse': isSubmitting }"
          />
        </button>

        <button type="submit" class="primary-button" v-else>
          Suivant
          <Icon name="heroicons:arrow-right-solid" class="button-icon" />
        </button>
      </div>
    </Form>
  </div>
  <Teleport to="body" v-if="currentModal.imageSrc">
    <div class="calc" @click="closeModal">
      <ModalImage
        :imageSrc="currentModal.imageSrc"
        :documentType="currentModal.documentType"
        @close="closeModal"
        @click.stop
      />
    </div>
  </Teleport>
  <Teleport to="body" v-if="modalSuccess">
    <div class="calc" @click="closeSuccessModal">
      <ModalSuccessInscription
        @click.stop
        @close-modal="closeSuccessModal"
        :inscriptionNumber="responseServer"
      />
    </div>
  </Teleport>
  <Teleport to="body" v-if="modalFailed">
    <ModalFailedInscription
      @click.stop
      @close="closeModalFailed"
      :message="errorServer"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { Form, Field, ErrorMessage } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import type { StepDataInterface } from "~/interfaces/stepData";
import axios from "axios";
import { useReadImg } from "~/composables/readImg";
import limitInput from "~/utils/limitInput";
const modalSuccess = ref<boolean>(false);
const modalFailed = ref<boolean>(false);
const targetDiv = ref<null | HTMLDivElement>(null);
const responseServer = ref<null | string>(null);
const errorServer = ref<null | string>(null);
const { emit } = useSocket();

const scrollToTarget = () => {
  const el = document.getElementById("gg") || targetDiv.value;
  el?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

const formKey = ref<number>(0);

const closeSuccessModal = () => {
  modalSuccess.value = false;
};

const closeModalFailed = () => {
  modalFailed.value = false;
};

const isMinor = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age < 18;
};

const imgSrcPhotoIdentity = ref<undefined | string>();
const imgSrcCin = ref<undefined | string>();
const imgSrcBac = ref<undefined | string>();
const imgSrcResidence = ref<undefined | string>();
const HandleChangeReadIdentityPhoto = async (e: Event) => {
  const image = await useReadImg(e);
  imgSrcPhotoIdentity.value = image;
};

const currentModal = ref<{
  imageSrc: string | null;
  documentType: string | null;
}>({
  imageSrc: null,
  documentType: null,
});

const openModal = (imageSrc: string, documentType: string) => {
  currentModal.value = { imageSrc, documentType };
};

const closeModal = () => {
  currentModal.value = { imageSrc: null, documentType: null };
};

const HandleChangeReadBacPhoto = async (e: Event) => {
  const image = await useReadImg(e);
  imgSrcBac.value = image;
};

const HandleChangeReadResidence = async (e: Event) => {
  const image = await useReadImg(e);
  imgSrcResidence.value = image;
};

const HandleChangeReadCin = async (e: Event) => {
  const image = await useReadImg(e);
  imgSrcCin.value = image;
};

// Étape 1 - Informations personnelles
const firstNameValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Minimum 2 caractères" }),
);
const lastNameValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Minimum 2 caractères" }),
);
const birthDateValidator = toTypedSchema(
  z
    .string({ required_error: "Date de naissance requise" })
    .min(1, { message: "Ce champ ne doit pas être vide" }),
);
const birthPlaceValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Lieu de naissance requis" }),
);
const genderValidator = toTypedSchema(
  z
    .string({ required_error: "Sélectionnez votre sexe" })
    .min(1, { message: "Ce champ ne doit pas être vide" }),
);
const cinValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(9, { message: "Numéro CIN invalide" }),
);

const cinOptionnalValidator = toTypedSchema(
  z.string().min(9, { message: "Numéro CIN invalide" }).optional(),
);

const identityPhotoValidator = toTypedSchema(
  z
    .instanceof(File, {
      message:
        "Votre photo d'identite est requise pour completer votre dossier",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      " Le fichier ne doit pas depasser 2MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Seuls les images JPEG ou PNG sont acceptées",
    ),
);
const addressValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(10, { message: "Adresse trop courte" }),
);
const phoneValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(9, { message: "Numéro de téléphone invalide" })
    .regex(/^\d{9}$/, {
      message: "Numéro de téléphone invalide , doit contenir 9 chiffres",
    }),
);
const emailValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .email({ message: "Email invalide" }),
);
const emergencyContactNameValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Nom du contact requis" }),
);
const emergencyContactRelationValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Lien de parenté requis" }),
);
const emergencyContactPhoneValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(9, { message: "Numéro de téléphone invalide" })
    .regex(/^\d{9}$/, {
      message: "Numéro de téléphone invalide , doit contenir 9 chiffres",
    }),
);

// Étape 2 - Formation
const lastDiplomaValidator = toTypedSchema(
  z
    .string({ required_error: "Sélectionnez votre diplôme" })
    .min(1, { message: "Ce champ ne doit pas être vide" }),
);
const bacSeriesValidator = toTypedSchema(
  z
    .string({ required_error: "Sélectionnez votre série" })
    .min(1, { message: "Ce champ ne doit pas être vide" }),
);
const bacYearValidator = toTypedSchema(
  z
    .number({
      required_error: "Année requise",
      invalid_type_error: "Année invalide",
    })
    .min(1950, { message: "Année trop ancienne" })
    .max(new Date().getFullYear(), { message: "Année dans le futur" }),
);
const previousInstitutionValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(2, { message: "Nom de l'établissement requis" }),
);
const fieldValidator = toTypedSchema(
  z
    .string({ required_error: "Sélectionnez votre filière" })
    .min(1, { message: "Ce champ ne doit pas être vide" }),
);
// const eligibleLevelsValidator = toTypedSchema(z.string({ required_error: 'Sélectionnez le niveau demandé' }).min(1, { message: 'Ce champ ne doit pas être vide' }));
// const eligibleLevelsValidatorBTP = toTypedSchema(z.string({ required_error: 'Sélectionnez le niveau demandé' }).min(1, { message: 'Ce champ ne doit pas être vide' }).regex(/^L1$/, { message: 'Seul le niveau L1 est autorisé pour la filière BTP' }));
// Étape 3 - Documents
const bacTranscriptValidatorOptional = toTypedSchema(
  z
    .instanceof(File, {
      message: "Votre relevé de notes du bac numérisé est requis",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "Le fichier ne doit pas dépasser 2 Mo",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Seules les images JPEG ou PNG sont acceptées",
    )
    .optional(),
);

const bacTranscriptValidator = toTypedSchema(
  z
    .instanceof(File, {
      message:
        "Votre relevé de notes du bac numérisé est requis pour compléter votre dossier",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "Le fichier ne doit pas dépasser 2 Mo",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Seules les images JPEG ou PNG sont acceptées",
    ),
);

const idDocumentValidator = toTypedSchema(
  z
    .instanceof(File, {
      message:
        "Votre CIN ou acte de naissance numérisé est requis pour compléter votre dossier",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      "Le fichier ne doit pas dépasser 2 Mo",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Seules les images JPEG ou PNG sont acceptées",
    ),
);
const residenceCertificateValidator = toTypedSchema(
  z
    .instanceof(File, {
      message:
        "Votre certificat de residence numerisé est requise pour completer votre dossier",
    })
    .refine(
      (file) => file.size <= 2 * 1024 * 1024,
      " Le fichier ne doit pas depasser 2MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Seules les images JPEG ou PNG sont acceptées",
    ),
);

// Étape 4 - Paiement
const transactionNumberValidator = toTypedSchema(
  z
    .string({ required_error: "Ce champ ne doit pas être vide" })
    .min(3, { message: "Numéro de transaction invalide" }),
);

const acceptingTermsValidator = toTypedSchema(z.boolean());
const handleSubmit = async (values: any) => {
  try {
    if (currentStep.value === 4) {
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (
          key !== "identityPhoto" &&
          key !== "bacTranscript" &&
          key !== "idDocument" &&
          key !== "residenceCertificate" &&
          key !== "website" // Exclure le honeypot
        ) {
          formData.append(key, value as string);
        }
      });

      // Ajouter le honeypot seulement s'il a une valeur (string vide = OK, undefined = ne pas envoyer)
      if (values.website !== undefined && values.website !== null) {
        formData.append("website", values.website || "");
      } else {
        // Si undefined ou null, envoyer une string vide
        formData.append("website", "");
      }

      if (values.identityPhoto)
        formData.append("identityPhoto", values.identityPhoto);
      if (values.bacTranscript)
        formData.append("bacTranscript", values.bacTranscript);
      if (values.idDocument) formData.append("idDocument", values.idDocument);
      if (values.residenceCertificate)
        formData.append("residenceCertificate", values.residenceCertificate);

      const response = await axios.post("/api/v1/pendingUsers", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      responseServer.value = response.data.inscriptionNumber;
      if (responseServer.value) {
        formKey.value++;
        modalSuccess.value = true;
        imgSrcCin.value = undefined;
        imgSrcPhotoIdentity.value = undefined;
        imgSrcResidence.value = undefined;
        imgSrcBac.value = undefined;
        currentStep.value = 1;
      }
      emit("newPendingUser", {
        inscriptionNumber: response.data.inscriptionNumber,
      });
      formKey.value++;
      modalSuccess.value = true;
      imgSrcCin.value = undefined;
      imgSrcPhotoIdentity.value = undefined;
      imgSrcResidence.value = undefined;
      imgSrcBac.value = undefined;
      currentStep.value = 1;
    } else {
      await nextTick();
      scrollToTarget();
      currentStep.value++;
    }
  } catch (error: any) {
    if (error) {
      errorServer.value =
        error.response.data.error || (error.response.data as string);
      modalFailed.value = true;
    }
  }
};
const stepData = ref<StepDataInterface[]>([
  {
    step: 1,
    title: "Information Personnelles",
    icons: "heroicons:user-circle",
  },
  {
    step: 2,
    title: "Information Académiques",
    icons: "heroicons:academic-cap-solid",
  },
  {
    step: 3,
    title: "Documents à fournir",
    icons: "heroicons:document-arrow-down-solid",
  },
  { step: 4, title: "Paiement", icons: "hugeicons:credit-card-validation" },
]);

const currentStep = ref<number>(1);

const prevStep = async () => {
  await nextTick();
  scrollToTarget();
  currentStep.value--;
};

// Keypress handlers with proper typing to satisfy TypeScript
const handleKeypressCin = (e: KeyboardEvent) => {
  limitInput(e as unknown as Event, 12);
};

const handleKeypressPhone = (e: KeyboardEvent) => {
  limitInput(e as unknown as Event, 9);
};
</script>

<style scoped>
.phone-input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--gray-light);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all 0.3s ease;
}

.phone-input-container:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-extra-light);
}

.phone-prefix {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--gray-super-light);
  border-right: 1px solid var(--gray-light);
  color: var(--text-color);
  font-weight: 500;
  white-space: nowrap;
}

.flag-icon {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.country-code {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.phone-input {
  border: none !important;
  box-shadow: none !important;
  padding-left: 1rem;
  flex: 1;
  background: transparent;
}

.phone-input::placeholder {
  color: var(--text-light);
  opacity: 0.7;
}

/* Version alternative avec sélecteur de pays (si besoin d'expansion future) */
.phone-prefix-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--gray-super-light);
  border-right: 1px solid var(--gray-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.phone-prefix-select:hover {
  background: var(--gray-light);
}

.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;
  flex-direction: column;
}

.modern-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 800px;
}

/* Security Badge */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1),
    rgba(16, 185, 129, 0.1)
  );
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 50px;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.security-icon {
  font-size: 1.2rem;
  color: #16a34a;
}

.form-title {
  text-align: center;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-step {
  margin-bottom: 1rem;
}

.download-btn {
  border: 1px solid var(--gray-light);
  margin: 10px;
  width: 60px;
  border-radius: var(--radius);
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
}

.section-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--primary-color);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.double {
  margin-bottom: 0;
}

.input-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 500;
  color: #334155;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.form-input:focus,
.form-select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  background: white;
}

.textarea {
  min-height: 80px;
  resize: vertical;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 12px;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  gap: 1rem;
}

.primary-button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.primary-button:hover {
  background: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.secondary-button {
  background: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.secondary-button:hover {
  background: #f8fafc;
  transform: translateY(-1px);
}

.button-icon {
  width: 1.1rem;
  height: 1.1rem;
}

/* Documents section */
.documents-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
}

.document-item {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.document-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.document-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--primary-color);
}

.document-item h3 {
  font-size: 0.95rem;
  color: #334155;
}

/* Payment section */
.payment-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fee-card {
  background: var(--tertiary-color);
  color: white;
  padding: 1.25rem;
  border-radius: 8px;
  text-align: center;
}

.fee-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.fee-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.form-group.left {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fee-amount {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0.25rem 0;
}

.fee-note {
  font-size: 0.85rem;
  opacity: 0.9;
}

.payment-methods {
  padding: 1rem;
  border-radius: 8px;
  background: #f8fafc;
}

.method {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin: 0.75rem 0;
  background: white;
  border: 1px solid #e2e8f0;
}

.method.selected {
  border-color: var(--primary-color);
  background: rgba(99, 102, 241, 0.05);
}

.method-icon {
  width: 1.3rem;
  height: 1.3rem;
  color: var(--primary-color);
}

.payment-note {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.75rem;
}

.payment-details {
  margin-top: 0.75rem;
}

.field-container input {
  padding-left: 50px;
}

.label-overview {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  border-radius: var(--radius);
  overflow: hidden;
  transition: 0.3s;
  cursor: pointer;
  background-color: var(--gray);
}

.label-overview .overlay {
  background: rgba(0, 0, 0, 0.777);
  padding: 10px;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--white);
  opacity: 0;
  transition: 0.3s;
}

.label-overview:hover .overlay {
  opacity: 1;
}

.label-overview .img {
  flex: 1;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.overview {
  background: var(--primary-color);
  font-size: 13px;
  width: 100px;
  padding: 10px;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 20px;
  border-radius: var(--radius);
  cursor: pointer;
}

.overview:hover {
  opacity: 0.8;
}

/* Ajoutez ces styles à la fin de votre section style */
.terms-group {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.form-checkbox {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.2rem;
  accent-color: var(--primary-color);
  cursor: pointer;
}

.terms-label {
  font-size: 0.85rem;
  color: #334155;
  line-height: 1.4;
  cursor: pointer;
}

.terms-error {
  margin-left: 1.85rem;
  margin-top: 0.5rem;
}

.primary-button.disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.primary-button.disabled:hover {
  background-color: #cbd5e1;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

.disabled {
  background-color: #334155;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .phone-prefix {
    padding: 0.75rem 0.75rem;
  }

  .phone-prefix span {
    font-size: 0.85rem;
  }

  .flag-icon {
    width: 18px;
    height: 13px;
  }

  .modern-form {
    padding: 1.25rem;
  }

  .security-badge {
    font-size: 0.85rem;
    padding: 0.65rem 1rem;
  }

  .security-icon {
    font-size: 1.1rem;
  }

  .input-pair {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-title {
    font-size: 1.25rem;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .button-container {
    flex-direction: column;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
  }

  .terms-label {
    font-size: 0.8rem;
  }

  .terms-error {
    margin-left: 0;
  }
}
</style>
