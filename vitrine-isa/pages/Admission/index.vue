<template>
  <div>
    <AdmissionCondition :settings="settings" />
    <div v-if="settings.isInscriptionOpen">
      <AdmissionForm />
    </div>
    <div v-else class="admission-closed">
      <section class="status-notice">
        <div class="notice-header">
          <Icon name="mdi:clock" class="notice-icon" />
          <h3>Inscriptions actuellement fermées</h3>
        </div>
        <p class="notice-description">
          La période d'inscription n'est pas ouverte actuellement. Consultez le
          calendrier ci-dessus pour connaître les dates importantes et préparez
          votre dossier dès maintenant.
        </p>

        <!-- Actions disponibles -->
        <div class="available-actions">
          <h4 class="actions-title">En attendant, vous pouvez :</h4>
          <div class="actions-grid">
            <div class="action-item">
              <Icon name="ph:download-simple" class="action-icon" />
              <div class="action-content">
                <h5>Préparer votre dossier</h5>
                <p>
                  Téléchargez le dossier d'inscription et rassemblez les pièces
                  justificatives
                </p>
                <button class="action-btn primary" @click="downloadDossier">
                  <Icon name="ph:download" />
                  Télécharger le dossier
                </button>
              </div>
            </div>

            <div class="action-item">
              <Icon name="ph:envelope" class="action-icon" />
              <div class="action-content">
                <h5>Obtenir des informations</h5>
                <p>
                  Contactez notre service des admissions pour toute question
                  spécifique
                </p>
                <NuxtLink to="/contact" class="action-btn secondary">
                  <Icon name="ph:envelope-simple" />
                  Nous contacter
                </NuxtLink>
              </div>
            </div>

            <div class="action-item">
              <Icon name="ph:graduation-cap" class="action-icon" />
              <div class="action-content">
                <h5>Explorer nos formations</h5>
                <p>
                  Découvrez en détail nos différentes filières et programmes
                </p>
                <NuxtLink to="/formations" class="action-btn secondary">
                  <Icon name="ph:book-open" />
                  Voir les formations
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <AdmissionCallToAction />
  </div>
</template>
<script lang="ts" setup>
import axios from "axios";
import type { SettingsInterface } from "~/interfaces/SettingsInterface";

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

const formatDate = (date: string | Date | null): string => {
  if (!date) return "Date non définie";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", options);
};

const downloadDossier = () => {
  const link = document.createElement("a");
  link.href = "/api/v1/upload/file/ISA_Processus_Admission.pdf";
  link.setAttribute("download", "ISA_Processus_Admission.pdf");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const fetchSettings = async () => {
  try {
    const response = (await axios.get("/api/v1/settings")).data;
    settings.value = response;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

onMounted(() => {
  fetchSettings();
});

useHead({
  title: "Admission",
  meta: [
    {
      name: "description",
      content:
        "Informations sur les admissions en Licence Professionnelle et Formation Professionnelle. Découvrez les conditions d'accès, documents requis et calendrier.",
    },
    {
      name: "keywords",
      content:
        "admission université, licence professionnelle, formation continue, BTP, inscription universitaire , Gestion , informatique",
    },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    {
      property: "og:title",
      content: "Admission - Institut superieur d'Ambatomirahavavy",
    },
    {
      property: "og:description",
      content:
        "Informations sur les admissions en Licence Professionnelle et Formation Professionnelle.",
    },
    { property: "og:image", content: "https://www.isa-ambato.mg/logo-seo.jpg" },
    { property: "og:url", content: "https://isa-ambato.mg/admission" },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: "Admission à l'Université | Découvrez nos formations",
    },
    {
      name: "twitter:description",
      content:
        "Informations sur les admissions en Licence Professionnelle et Formation Professionnelle.",
    },
    {
      name: "twitter:image",
      content: "https://www.isa-ambato.mg/logo-seo.jpg",
    },
  ],
  link: [{ rel: "canonical", href: "https://isa-ambato.mg/admission" }],
});
</script>

<style scoped>
.admission-closed {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.status-notice {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: var(--shadow);
  border: 1px solid rgba(var(--primary-color-rgb), 0.1);
  position: relative;
  overflow: hidden;
}

.status-notice::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(
    90deg,
    var(--primary-color),
    var(--secondary-color)
  );
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.notice-icon {
  font-size: 2rem;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
  padding: 0.75rem;
  border-radius: var(--radius);
}

.notice-header h3 {
  font-size: 1.8rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 600;
}

.notice-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--gray-dark);
  margin-bottom: 2.5rem;
  max-width: 800px;
}

/* Available Actions */
.available-actions {
  margin-top: 2rem;
}

.actions-title {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-item {
  background: rgba(var(--primary-color-rgb), 0.02);
  padding: 1.5rem;
  border-radius: var(--radius);
  border: 1px solid rgba(var(--primary-color-rgb), 0.08);
  transition: all 0.3s ease;
  display: flex;
  gap: 1rem;
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
}

.action-icon {
  font-size: 1.8rem;
  color: var(--secondary-color);
  margin-top: 0.2rem;
  flex-shrink: 0;
}

.action-content {
  flex: 1;
}

.action-content h5 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.action-content p {
  color: var(--gray-dark);
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  border: none;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}

.action-btn.primary:hover {
  background: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
}

.action-btn.secondary {
  background: white;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-btn.secondary:hover {
  background: rgba(var(--primary-color-rgb), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .admission-closed {
    padding: 1rem;
  }

  .status-notice {
    padding: 1.5rem;
  }

  .notice-header h3 {
    font-size: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-item {
    flex-direction: column;
    text-align: center;
  }

  .action-icon {
    align-self: center;
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .notice-header {
    flex-direction: column;
    text-align: center;
    gap: 0.8rem;
  }

  .notice-description {
    font-size: 1rem;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
