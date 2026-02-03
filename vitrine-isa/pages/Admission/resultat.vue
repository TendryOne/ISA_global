<template>
  <div class="results-container">
    <!-- En-tête -->
    <div class="results-header">
      <h1 class="results-title">
        <Icon name="ph:scroll" class="title-icon" />
        Résultats d'Admission
      </h1>
      <p class="results-subtitle">Consultez les listes des admis par filière</p>
    </div>

    <!-- Sélecteur de filière -->
    <div class="filiere-selector">
      <label for="filiere-select">
        <Icon name="ph:stack" class="selector-icon" />
        Sélectionnez une filière :
      </label>
      <select
        id="filiere-select"
        class="styled-select"
        @change="filterByFiliere($event)"
      >
        <option value="default" disabled selected>
          --------- Choisissez votre filiere ---------------
        </option>
        <option
          v-for="filiere in filieres"
          :key="filiere.id"
          :value="filiere.id"
        >
          {{ filiere.nom }}
        </option>
      </select>
    </div>
    <!-- Résultats -->
    <div class="results-content" v-if="filteredData.length > 0">
      <!-- En-tête de la filière -->
      <div
        class="filiere-header"
        :style="{ backgroundColor: choosenFilieres.color }"
      >
        <div class="filiere-badge">
          <Icon :name="choosenFilieres.icon" />
          {{ choosenFilieres.nom }}
        </div>
      </div>
      <!-- Liste des admis -->
      <div class="admis-list">
        <div class="list-header">
          <div class="header-item">N°</div>
          <div class="header-item">Nom et Prénoms</div>
          <div class="header-item">Statut</div>
        </div>

        <div class="list-body">
          <div
            v-for="(candidat, index) in filteredData"
            :key="candidat.inscriptionId"
            class="candidat-row"
          >
            <div class="row-item rank">{{ index + 1 }}</div>
            <div class="row-item name">
              {{ candidat.firstName }} {{ candidat.lastName }}
            </div>
            <div class="row-item status">
              <span> Admis en {{ candidat.levelAsked }} </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Message d'information -->
      <div class="result-note">
        <Icon name="ph:info" class="note-icon" />
        <span class="note-text">
          Candidats arrêtés au nombre de
          <strong>{{ filteredData.length }}</strong> — Ceci est la liste
          définitive des admis.<br />
          Si vous n'avez pas encore procédé à l'inscription, vérifiez votre
          boîte mail (et vos spams). Si vous n'avez rien reçu, contactez la
          scolarité.
        </span>
      </div>
    </div>

    <div class="no-results" v-else>
      <Icon name="ph:binoculars" class="no-results-icon" />
      <p>Sélectionnez une filière pour afficher les résultats</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { dataTestAdmission } from "~/data/data-test-admission";
import { ref } from "vue";
import type { AdmissionResultInterface } from "~/interfaces/AdmissionResult";
import type { SettingsInterface } from "~/interfaces/SettingsInterface";
import axios from "axios";

const resultFromDB = ref<Partial<AdmissionResultInterface>[]>([]);
const filteredData = ref<Partial<AdmissionResultInterface>[]>([]);
const choosenFilieres = ref();

const filieres = [
  {
    id: "gestion",
    nom: "Gestion & Création d'Entreprise",
    icon: "ph:chart-line-up",
    color: "var(--primary-color)",
  },
  {
    id: "btp",
    nom: "Bâtiment & Travaux Publics",
    icon: "ph:buildings",
    color: "var(--primary-color)",
  },
  {
    id: "informatique",
    nom: "Informatique",
    icon: "ph:code",
    color: "var(--primary-color)",
  },
];

const settings = ref<SettingsInterface>({
  registrationDate: null,
  documentReviewDate: null,
  resultsPublicationDate: null,
  finalEnrollmentDate: null,
  isResultAvailable: false,
  isInscriptionOpen: false,
  maintenanceMode: false,
  plannedStartDate: null,
  isAutomatic: false,
});

const fetchSettings = async () => {
  try {
    const response = (await axios.get("/api/v1/settings")).data;
    settings.value = response;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

const fetchResults = async () => {
  try {
    const response = (await axios.get("/api/v1/pendingUsers/approved-students"))
      .data;
    resultFromDB.value = response;
  } catch (error) {
    console.error("Error fetching results:", error);
    return null;
  }
};

onMounted(async () => {
  await fetchSettings();
  if (!settings.value.isResultAvailable) {
    return navigateTo("/admission");
  }
  await fetchResults();
});

function filterByFiliere(event: Event) {
  const target = event.target as HTMLInputElement;
  filteredData.value = resultFromDB.value.filter(
    (item: any) => item.field === target.value
  );

  choosenFilieres.value = filieres.find((data) => data.id === target.value);
}
</script>

<style scoped>
.results-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Inter", sans-serif;
}

.results-header {
  text-align: center;
  margin-bottom: 3rem;
}

.results-title {
  font-size: 2.5rem;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.title-icon {
  font-size: 2.2rem;
}

.results-subtitle {
  font-size: 1.2rem;
  color: #64748b;
}

.filiere-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selector-icon {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.styled-select {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;
}

.styled-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.filiere-header {
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.filiere-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.filiere-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.admis-list {
  border: 1px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  background: #f1f5f9;
  font-weight: 600;
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.header-item {
  padding: 0.5rem;
}

.list-body {
  max-height: 500px;
  overflow-y: auto;
}

.candidat-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.candidat-row:hover {
  background: #f8fafc;
}

.row-item {
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.rank {
  font-weight: 600;
  color: #64748b;
}

.name {
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.medal {
  display: inline-flex;
}

.medal svg {
  color: gold;
}

.moyenne {
  font-family: "Courier New", monospace;
  font-weight: 600;
}

.status span {
  padding: 0.3rem 0.8rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.status .admis {
  background: #dcfce7;
  color: #166534;
}

.status .liste-attente {
  background: #fef9c3;
  color: #854d0e;
}

.results-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
}

.action-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.print-btn {
  background: #e0f2fe;
  color: #0369a1;
}

.print-btn:hover {
  background: #bae6fd;
}

.download-btn {
  background: var(--primary-color);
  color: white;
}

.download-btn:hover {
  background: #1d4ed8;
}

.result-info {
  margin-top: 2rem;
  animation: slideUp 0.5s ease-out;
}

.result-info-simple {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.simple-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.15);
  padding: 2rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  min-width: 320px;
  max-width: 600px;
  animation: slideUp 0.5s ease-out;
}

.simple-icon {
  font-size: 2.5rem;
  color: #fbbf24;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.simple-content {
  flex: 1;
  text-align: left;
}

.simple-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.simple-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #fbbf24;
  margin-left: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.12);
}

.simple-desc {
  color: #f3f4f6;
  font-size: 1rem;
  line-height: 1.7;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.info-header {
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.info-header-icon {
  font-size: 2rem;
  color: #fbbf24;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.info-header h3 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.info-body {
  padding: 2rem;
  color: white;
}

.count-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
}

.count-icon {
  font-size: 3rem;
  color: #fbbf24;
  flex-shrink: 0;
}

.count-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.count-label {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.count-number {
  font-size: 3rem;
  font-weight: 800;
  color: #fbbf24;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  margin: 1.5rem 0;
}

.instructions {
  display: flex;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #fbbf24;
}

.instruction-icon {
  font-size: 1.5rem;
  color: #fbbf24;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.instruction-text {
  flex: 1;
}

.instruction-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #fbbf24;
}

.instruction-text p {
  margin: 0.5rem 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

.instruction-text strong {
  color: #fbbf24;
  font-weight: 700;
}

.no-results {
  text-align: center;
  padding: 4rem;
  background: #f8fafc;
  border-radius: 12px;
  color: #64748b;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #cbd5e1;
}

.result-note {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 2rem 0 0 0;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.98rem;
  box-shadow: none;
}

.note-icon {
  font-size: 1.3rem;
  color: #94a3b8;
  margin-top: 2px;
}

.note-text {
  line-height: 1.6;
}

@media (max-width: 768px) {
  .list-header,
  .candidat-row {
    grid-template-columns: 50px 1fr 80px 100px;
  }

  .filiere-stats {
    flex-direction: column;
    gap: 0.5rem;
  }

  .results-actions {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .filiere-selector {
    flex-direction: column;
  }

  .count-section {
    flex-direction: column;
    text-align: center;
  }

  .count-number {
    font-size: 2.5rem;
  }

  .instructions {
    flex-direction: column;
  }

  .info-header {
    flex-direction: column;
    text-align: center;
  }

  .simple-card {
    flex-direction: column;
    gap: 1rem;
    padding: 1.2rem;
    min-width: unset;
    max-width: 100%;
  }

  .simple-content {
    text-align: center;
  }

  .simple-title {
    font-size: 1.1rem;
  }

  .simple-number {
    font-size: 1.5rem;
  }
}
</style>
