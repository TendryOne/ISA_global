<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="unit-info">
            <div class="unit-code">{{ unit?.code }}</div>
            <div class="unit-title">
              <h2>{{ unit?.name }}</h2>
              <p class="unit-description">{{ unit?.description }}</p>
            </div>
          </div>
          <button class="close-btn" @click="closeModal">
            <Icon name="ph:x" />
          </button>
        </div>

        <div class="modal-body">
          <div class="unit-details">
            <div class="detail-item">
              <Icon name="ph:calendar" />
              <span><strong>Semestre:</strong> {{ unit?.semester }}</span>
            </div>
            <div class="detail-item">
              <Icon name="ph:medal" />
              <span><strong>Crédits:</strong> {{ unit?.credits }} ECTS</span>
            </div>
            <div class="detail-item">
              <Icon name="ph:graduation-cap" />
              <span
                ><strong>Filière:</strong> {{ formatField(unit?.field) }}</span
              >
            </div>
          </div>

          <div class="modules-section">
            <div class="modules-header">
              <h3>
                <Icon name="ph:list-bullets" />
                Modules d'enseignement
              </h3>
              <div v-if="isLoading" class="loading-indicator">
                <Icon name="ph:spinner" class="spinning" />
                <span>Chargement des modules...</span>
              </div>
            </div>

            <div v-if="error" class="error-message">
              <Icon name="ph:warning-circle" />
              <p>{{ error }}</p>
              <button class="retry-btn" @click="fetchModules">
                <Icon name="ph:arrow-clockwise" />
                Réessayer
              </button>
            </div>

            <div
              v-else-if="!isLoading && modules.length === 0"
              class="no-modules"
            >
              <Icon name="ph:empty" />
              <p>Aucun module disponible pour cette unité d'enseignement.</p>
            </div>

            <div v-else class="modules-grid">
              <div
                v-for="module in modules"
                :key="module.code"
                class="module-card"
              >
                <div class="module-header">
                  <div class="module-code">{{ module.code }}</div>
                  <div class="module-type" :class="getTypeClass(module.type)">
                    {{ module.type }}
                  </div>
                </div>

                <h4 class="module-title">{{ module.title }}</h4>

                <p class="module-description">{{ module.description }}</p>

                <div class="module-stats">
                  <div class="stat-item">
                    <Icon name="ph:clock" />
                    <span>{{ module.hours }}h</span>
                  </div>
                  <div class="stat-item">
                    <Icon name="ph:medal" />
                    <span>{{ module.credits }} crédits</span>
                  </div>
                  <div class="stat-item">
                    <Icon name="ph:percent" />
                    <span>Coef. {{ module.coefficient }}</span>
                  </div>
                </div>

                <div
                  v-if="module.files && module.files.length > 0"
                  class="module-files"
                >
                  <h5>
                    <Icon name="ph:file-text" />
                    Documents disponibles
                  </h5>
                  <div class="files-list">
                    <a
                      v-for="(file, index) in module.files"
                      :key="index"
                      :href="file"
                      target="_blank"
                      class="file-link"
                    >
                      <Icon name="ph:download-simple" />
                      <span>Document {{ index + 1 }}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="close-footer-btn" @click="closeModal">
            <Icon name="ph:x-circle" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import axios from "axios";
import type {
  TeachingUnitInterface,
  ModulesInterface,
} from "~/interfaces/teachingUnit.interface";

interface Props {
  isVisible: boolean;
  unit: TeachingUnitInterface | null;
}

interface EmitEvents {
  close: [];
}

const props = defineProps<Props>();
const emit = defineEmits<EmitEvents>();

// State
const modules = ref<ModulesInterface[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Methods
const closeModal = () => {
  emit("close");
};

const fetchModules = async () => {
  if (!props.unit) return;

  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(
      `/api/v1/modules/by-teaching-unit/${props.unit._id}`
    );
    modules.value = response.data;
  } catch (err) {
    console.error("Error fetching modules:", err);
    error.value = "Erreur lors du chargement des modules. Veuillez réessayer.";
  } finally {
    isLoading.value = false;
  }
};

const formatField = (field: string | undefined): string => {
  if (!field) return "";
  const fieldNames = {
    informatique: "Informatique",
    gestion: "Gestion & Création d'Entreprise",
    btp: "Bâtiment & Travaux Publics",
  };
  return fieldNames[field as keyof typeof fieldNames] || field;
};

const getTypeClass = (type: string): string => {
  const classes = {
    "cours Magistral": "type-cm",
    TD: "type-td",
    TP: "type-tp",
  };
  return classes[type as keyof typeof classes] || "type-default";
};

// Watch for unit changes to fetch modules
watch(
  () => props.unit,
  (newUnit) => {
    if (newUnit && props.isVisible) {
      modules.value = [];
      fetchModules();
    }
  }
);

// Watch for visibility changes
watch(
  () => props.isVisible,
  (isVisible) => {
    if (isVisible && props.unit) {
      fetchModules();
    }
  }
);

// Handle ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && props.isVisible) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border-radius: 16px 16px 0 0;
}

.unit-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.unit-code {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: nowrap;
}

.unit-title h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.unit-description {
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.close-btn svg {
  font-size: 1.2rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.unit-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(var(--primary-color-rgb), 0.03);
  border-radius: 12px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-dark);
}

.detail-item svg {
  color: var(--primary-color);
}

.modules-section {
  margin-top: 2rem;
}

.modules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.modules-header h3 {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--primary-color);
  margin: 0;
  font-size: 1.3rem;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-dark);
  font-size: 0.9rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  padding: 2rem;
  color: var(--error);
  background: rgba(235, 77, 75, 0.1);
  border-radius: 12px;
}

.error-message svg {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: var(--error);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.no-modules {
  text-align: center;
  padding: 3rem;
  color: var(--gray-dark);
}

.no-modules svg {
  font-size: 3rem;
  color: var(--gray-light);
  margin-bottom: 1rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.15);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.module-code {
  background: var(--gray-dark);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: monospace;
}

.module-type {
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 600;
}

.type-cm {
  background: rgba(var(--primary-color-rgb), 0.15);
  border: 1px solid rgba(var(--primary-color-rgb), 0.3);
  color: var(--primary-color);
}

.type-td {
  background: rgba(var(--secondary-color-rgb), 0.15);
  border: 1px solid rgba(var(--secondary-color-rgb), 0.3);
  color: var(--secondary-color);
}

.type-tp {
  background: rgba(128, 128, 128, 0.15);
  border: 1px solid rgba(128, 128, 128, 0.3);
  color: var(--tertiary-color);
}

.module-title {
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.module-description {
  color: var(--gray-dark);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.module-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.stat-item svg {
  color: var(--primary-color);
}

.module-files h5 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  color: var(--primary-color);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(var(--primary-color-rgb), 0.05);
  color: var(--primary-color);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.file-link:hover {
  background: rgba(var(--primary-color-rgb), 0.15);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
}

.close-footer-btn {
  padding: 0.8rem 1.5rem;
  background: var(--gray-dark);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.close-footer-btn:hover {
  background: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1.5rem;
  }

  .unit-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .unit-details {
    flex-direction: column;
    gap: 1rem;
  }

  .modules-grid {
    grid-template-columns: 1fr;
  }

  .module-stats {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
