<template>
  <div class="resources-container">
    <!-- En-tête premium -->
    <div class="resources-header">
      <div class="header-content">
        <div class="header-icon">
          <Icon icon="material-symbols:library-books-outline" />
        </div>
        <div class="header-text">
          <h1>Supports de Cours</h1>
          <p>Gérez et organisez vos ressources pédagogiques</p>
        </div>
      </div>
      <ActionButton icon="material-symbols:add-circle-outline" @click="openCreateModal" class="create-button">
        Ajouter une ressource
      </ActionButton>
    </div>

    <!-- Statistiques -->
    <div class="resources-stats">
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:folder-open-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ resources.length }}</span>
          <span class="stat-label">Ressources</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:visibility-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ viewedResources }}</span>
          <span class="stat-label">Consultées</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <Icon icon="material-symbols:cloud-outline" />
        </div>
        <div class="stat-info">
          <span class="stat-number">{{ driveResources }}</span>
          <span class="stat-label">Google Drive</span>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="resources-filters">
      <div class="filter-group">
        <button v-for="type in resourceFilters" :key="type.value" @click="activeFilter = type.value"
          :class="['filter-btn', { active: activeFilter === type.value }]">
          <Icon :icon="type.icon" />
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Liste des ressources -->
    <div class="resources-grid">
      <transition-group name="resource-fade">
        <div v-for="resource in filteredResources" :key="resource._id" class="resource-card">
          <div class="resource-header">
            <div class="resource-icon" :class="getResourceTypeClass(resource.link)">
              <Icon :icon="getResourceIcon(resource.link)" />
            </div>
            <div class="resource-actions">
              <button class="action-btn view-btn" @click="viewResource(resource)" title="Voir le support">
                <Icon icon="material-symbols:open-in-new" />
              </button>
              <button class="action-btn edit-btn" @click="editResource(resource)" title="Modifier">
                <Icon icon="material-symbols:edit-outline" />
              </button>
              <button class="action-btn delete-btn" @click="deleteResource(resource)" title="Supprimer">
                <Icon icon="material-symbols:delete-outline" />
              </button>
            </div>
          </div>

          <div class="resource-content">
            <h3 class="resource-title">{{ resource.title }}</h3>
            <p class="resource-description">{{ resource.description }}</p>

            <div class="resource-meta">
              <span class="resource-type-badge" :class="getResourceTypeClass(resource.link)">
                <Icon :icon="getResourceIcon(resource.link)" />
                {{ getResourceType(resource.link) }}
              </span>
              <span class="resource-date">{{ formatDate(resource.createdAt?.toString() || '') }}</span>
            </div>
          </div>

          <div class="resource-footer">
            <!-- Liens d'accès selon le type -->
            <div class="resource-links">
              <!-- Lien principal -->
              <a :href="getResourceUrl(resource.link)" target="_blank" class="resource-link primary"
                @click="trackView(resource)">
                <Icon icon="material-symbols:play-circle-outline" v-if="resource.type === 'video'" />
                <Icon icon="material-symbols:description-outline" v-else-if="resource.type === 'document'" />
                <Icon icon="material-symbols:open-in-new" v-else />
                {{ getLinkText(resource.link, resource.type) }}
              </a>

              <!-- Lien de téléchargement pour Google Drive -->
              <a v-if="resource.link.includes('drive.google.com')" :href="getDownloadUrl(resource.link)" target="_blank"
                class="resource-link download" title="Télécharger">
                <Icon icon="mdi:download-box" />
                Télécharger
              </a>
            </div>

            <!-- Boutons d'aperçu selon le type -->
            <div class="preview-actions">
              <!-- Aperçu modal pour vidéos -->
              <button v-if="resource.type === 'video'" @click="openPreviewModal(resource)" class="preview-btn video">
                <Icon icon="material-symbols:play-circle-outline" />
                Regarder sur plateforme
              </button>

              <!-- Aperçu modal pour documents -->
              <button v-else-if="resource.type === 'document' && canPreview(resource.link)"
                @click="openPreviewModal(resource)" class="preview-btn video">
                <Icon icon="material-symbols:preview-outline" />
                Aperçu sur plateforme
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>

    <!-- États vides et chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <Icon icon="material-symbols:progress-activity" class="spinner" />
      </div>
      <p>Chargement des ressources...</p>
    </div>

    <div v-if="!loading && filteredResources.length === 0 && resources.length > 0" class="empty-filter-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:filter-list-off" />
      </div>
      <h3>Aucune ressource trouvée</h3>
      <p>Aucune ressource ne correspond au filtre sélectionné</p>
      <button @click="activeFilter = 'all'" class="reset-filter-btn">
        Afficher toutes les ressources
      </button>
    </div>

    <div v-if="!loading && resources.length === 0" class="empty-state">
      <div class="empty-icon">
        <Icon icon="material-symbols:library-books-outline" />
      </div>
      <h3>Aucune ressource</h3>
      <p>Commencez par ajouter votre première ressource pédagogique</p>
      <ActionButton icon="material-symbols:add-circle-outline" @click="openCreateModal" class="empty-action-button">
        Ajouter une ressource
      </ActionButton>
    </div>

    <div v-if="errorServer" class="error-state">
      <div class="error-icon">
        <Icon icon="material-symbols:error-outline" />
      </div>
      <h3>Erreur de chargement</h3>
      <p>{{ errorServer }}</p>
      <button class="retry-button" @click="fetchRessources">
        <Icon icon="material-symbols:refresh" />
        Réessayer
      </button>
    </div>

    <!-- Modal de création -->
    <div v-if="showModal || !!resourcesToUpdate">
      <TheRessourcesFormModal @close="closeModal" @submit="handleSubmit" :resource="resourcesToUpdate" />
    </div>

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
      @dismissed="toast.show = false" />

    <ConfirmModal :show="resourcesToDelete !== null" @confirm="handleDelete" @cancel="resourcesToDelete = null"
      title="Confirmer la suppression"
      message="Êtes-vous sûr de vouloir supprimer ce support de cours ? Cette action est irréversible." />

  </div>
  <!-- Modal pour aperçu des ressources -->
  <div v-if="showPreviewModal" class="preview-modal-overlay" @click="closePreviewModal">
    <div class="preview-modal-content" @click.stop>
      <div class="preview-modal-header">
        <h3>{{ currentPreviewResource?.title }}</h3>
        <button @click="closePreviewModal" class="close-btn">
          <Icon icon="material-symbols:close" />
        </button>
      </div>
      <div class="preview-modal-body">
        <div class="player-container" v-if="currentPreviewResource">
          <iframe :src="getPreviewUrl(currentPreviewResource.link)" frameborder="0" allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            class="preview-iframe-modal">
          </iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue';
import type ResourcesInterface from '@/interfaces/resources.interface';
import { useMyUserStore } from '@/stores/userStore';
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import TheRessourcesFormModal from '@/components/professor/TheRessourcesFormModal.vue';
import SuccessToast from '@/components/toast/successToast.vue';
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue';
import { useSocket } from '@/composables/useSocket';
import { PostEventLog } from '@/utils/EventLog';

const toast = ref<{ show: boolean, message: string, title: string, type: 'success' | 'error' }>({
  show: false, message: '', title: '', type: 'success'
});

const resources = ref<ResourcesInterface[]>([]);
const route = useRoute();
const userStore = useMyUserStore();
const loading = ref<boolean>(false);
const errorServer = ref<string | null>(null);
const showModal = ref<boolean>(false);
const viewedResources = ref<number>(0);
const activeFilter = ref<string>('all');
const showPreviewModal = ref<boolean>(false);
const currentPreviewResource = ref<ResourcesInterface | null>(null);
const resourcesToUpdate = ref<ResourcesInterface | null>(null);
const resourcesToDelete = ref<ResourcesInterface | null>(null);

const { emit } = useSocket()

// Filtres de ressources
const resourceFilters = [
  { value: 'all', label: 'Tout', icon: 'material-symbols:select-all' },
  { value: 'video', label: 'Vidéos', icon: 'material-symbols:play-circle-outline' },
  { value: 'document', label: 'Documents', icon: 'material-symbols:description-outline' },
  { value: 'drive', label: 'Google Drive', icon: 'material-symbols:cloud-outline' },
  { value: 'external', label: 'Liens externes', icon: 'material-symbols:link' }
];

// Statistiques calculées
const driveResources = computed(() => {
  return resources.value.filter(r => r.link.includes('drive.google.com')).length;
});

const filteredResources = computed(() => {
  if (activeFilter.value === 'all') return resources.value;

  return resources.value.filter(resource => {
    const link = resource.link.toLowerCase();

    switch (activeFilter.value) {
      case 'video':
        return isVideo(link);
      case 'document':
        return isDocument(link);
      case 'drive':
        return link.includes('drive.google.com');
      case 'external':
        return !link.includes('drive.google.com');
      default:
        return true;
    }
  });
});

const fetchRessources = async () => {
  loading.value = true;
  errorServer.value = null;
  try {
    const response = await axios.get(`/api/v1/resources/module/${route.params.moduleId}/professor/${userStore.currentUser?._id}/promotion/${null}`);
    resources.value = response.data;
    viewedResources.value = Math.min(3, resources.value.length);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur lors du chargement des ressources';
    errorServer.value = errorMsg;
    console.error('Erreur:', error);
  } finally {
    loading.value = false;
  }
}

const openCreateModal = () => {
  showModal.value = true;
}

const closeModal = () => {
  showModal.value = false;
  resourcesToUpdate.value = null;
}

const viewResource = (resource: ResourcesInterface) => {
  window.open(getResourceUrl(resource.link), '_blank');
  trackView(resource);
}

const editResource = (resource: ResourcesInterface) => {
  resourcesToUpdate.value = resource;
}

const deleteResource = (resource: ResourcesInterface) => {
  resourcesToDelete.value = resource;
}

const handleDelete = async () => {
  if (!resourcesToDelete.value) return;
  try {
    await axios.delete(`/api/v1/resources/${resourcesToDelete.value._id}`);
    resources.value = resources.value.filter(r => r._id !== resourcesToDelete.value?._id);
    await PostEventLog({
      entityId: resourcesToDelete.value._id,
      entityType: "resource",
      eventType: "PROFESSOR_RESOURCE_DELETED",
      timestamp: new Date(),
      userId: userStore.currentUser!._id,
      payload: {
        info: {
          title: resourcesToDelete.value.title,
          type: resourcesToDelete.value.type,
          link: resourcesToDelete.value.link
        }
      }
    })

    toast.value = { show: true, message: 'Ressource supprimée avec succès !', title: 'Succès', type: 'success' };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
    toast.value = { show: true, message: `Erreur lors de la suppression : ${errorMsg}`, title: 'Erreur', type: 'error' };
  } finally {
    resourcesToDelete.value = null;
  }
}

const trackView = (resource: ResourcesInterface) => {
  console.log("Ressource consultée:", resource.title);
}

const openPreviewModal = (resource: ResourcesInterface) => {
  currentPreviewResource.value = resource;
  showPreviewModal.value = true;
  trackView(resource);
}

const closePreviewModal = () => {
  showPreviewModal.value = false;
  currentPreviewResource.value = null;
}

const getDownloadUrl = (link: string) => {
  if (!link.includes('drive.google.com')) return link;

  // Pour Google Drive, convertir en URL de téléchargement
  if (link.includes('/file/d/')) {
    const fileId = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  if (link.includes('/document/d/')) {
    const docId = link.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/document/d/${docId}/export?format=pdf`;
  }

  if (link.includes('/presentation/d/')) {
    const presentationId = link.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/presentation/d/${presentationId}/export/pdf`;
  }

  if (link.includes('/spreadsheets/d/')) {
    const sheetId = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  }

  return link;
}

// Fonctions utilitaires améliorées
const isVideo = (link: string) => {
  return link.includes('youtube') || link.includes('vimeo') ||
    (link.includes('drive.google.com') && link.includes('/file/'));
}

const isDriveDocument = (link: string) => {
  return link.includes('drive.google.com') &&
    (link.includes('/document/') || link.includes('/spreadsheets/') || link.includes('/presentation/'));
}

const isDocument = (link: string) => {
  return link.includes('.pdf') || link.includes('.doc') || link.includes('.docx') ||
    link.includes('.ppt') || link.includes('.pptx') || link.includes('.xls') ||
    link.includes('.xlsx') || isDriveDocument(link);
}

const canPreview = (link: string) => {
  return link.includes('drive.google.com');
}

const getResourceIcon = (link: string, type?: string) => {
  // Priorité au type défini
  if (type === 'video') return 'material-symbols:play-circle-outline';
  if (type === 'document') return 'material-symbols:description-outline';

  // Fallback sur l'URL
  if (link.includes('youtube')) return 'material-symbols:smart-display-outline';
  if (link.includes('vimeo')) return 'material-symbols:video-library-outline';
  if (link.includes('drive.google.com')) {
    if (link.includes('/file/')) return 'material-symbols:play-circle-outline';
    if (link.includes('/document/')) return 'material-symbols:description-outline';
    if (link.includes('/spreadsheets/')) return 'material-symbols:table-chart-outline';
    if (link.includes('/presentation/')) return 'material-symbols:slideshow-outline';
    return 'material-symbols:cloud-outline';
  }
  if (link.includes('.pdf')) return 'material-symbols:picture-as-pdf-outline';
  if (link.includes('.doc') || link.includes('.docx')) return 'material-symbols:description-outline';
  if (link.includes('.ppt') || link.includes('.pptx')) return 'material-symbols:slideshow-outline';
  if (link.includes('.xls') || link.includes('.xlsx')) return 'material-symbols:table-chart-outline';
  return 'material-symbols:link';
}

const getResourceType = (link: string) => {
  if (link.includes('youtube')) return 'YouTube';
  if (link.includes('vimeo')) return 'Vimeo';
  if (link.includes('drive.google.com')) {
    if (link.includes('/file/')) return 'Vidéo Drive';
    if (link.includes('/document/')) return 'Google Docs';
    if (link.includes('/spreadsheets/')) return 'Google Sheets';
    if (link.includes('/presentation/')) return 'Google Slides';
    return 'Google Drive';
  }
  if (link.includes('.pdf')) return 'PDF';
  if (link.includes('.doc') || link.includes('.docx')) return 'Word';
  if (link.includes('.ppt') || link.includes('.pptx')) return 'PowerPoint';
  if (link.includes('.xls') || link.includes('.xlsx')) return 'Excel';
  return 'Lien externe';
}

const getResourceTypeClass = (link: string) => {
  if (isVideo(link)) return 'video';
  if (link.includes('drive.google.com')) return 'drive';
  if (isDocument(link)) return 'document';
  return 'external';
}

const getResourceUrl = (link: string) => {
  return link;
}

const getLinkText = (link: string, type?: string) => {
  if (type === 'video') return 'Regarder';
  if (type === 'document') return 'Consulter';
  if (link.includes('drive.google.com')) return 'Ouvrir dans Drive';
  return 'Accéder au lien';
}

const getPreviewUrl = (link: string) => {
  // Pour YouTube et Vimeo, utiliser l'URL d'embed avec contrôles
  if (link.includes('youtube.com/watch')) {
    const videoId = link.match(/[?&]v=([^&]+)/)?.[1];
    return `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=1`;
  }

  if (link.includes('youtu.be/')) {
    const videoId = link.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=1`;
  }

  if (link.includes('vimeo.com/')) {
    const videoId = link.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}?controls=1&title=1&byline=1&portrait=1`;
  }

  // Pour Google Drive
  if (!link.includes('drive.google.com')) return link;

  // Convertir l'URL Google Drive en URL d'embed/preview
  if (link.includes('/file/d/')) {
    const fileId = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  if (link.includes('/document/d/')) {
    const docId = link.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/document/d/${docId}/preview`;
  }

  if (link.includes('/presentation/d/')) {
    const presentationId = link.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/presentation/d/${presentationId}/preview`;
  }

  if (link.includes('/spreadsheets/d/')) {
    const sheetId = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/preview`;
  }

  return link;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

const handleSubmit = async (values: Record<string, unknown>) => {
  try {
    if (resourcesToUpdate.value) {
      // Logique de mise à jour
      const response = await axios.patch(`/api/v1/resources/${resourcesToUpdate.value._id}`, values);
      const index = resources.value.findIndex(r => r._id === resourcesToUpdate.value?._id);
      emit("ressourcesNotificationByProfessor", { ressources: response.data, update: true })
      if (index !== -1) {
        resources.value[index] = response.data;
      }
      PostEventLog({
        entityId: response.data._id,
        entityType: "resource",
        eventType: "PROFESSOR_RESOURCE_UPDATED",
        timestamp: new Date(),
        userId: userStore.currentUser!._id,
        payload: {
          info: {
            title: response.data.title,
            type: response.data.type,
            link: response.data.link
          },
          link: `/professor/modules/${route.params.moduleId}/resources`
        }
      })

      toast.value = { show: true, message: 'Ressource mise à jour avec succès !', title: 'Succès', type: 'success' };
      closeModal();
      return;
    }
    const response = await axios.post('/api/v1/resources', {
      module: route.params.moduleId,
      ...values
    });
    await PostEventLog({
      entityId: response.data._id,
      entityType: "resource",
      eventType: "PROFESSOR_RESOURCE_UPLOADED",
      timestamp: new Date(),
      userId: userStore.currentUser!._id,
      payload: {
        info: {
          title: response.data.title,
          type: response.data.type,
          link: response.data.link
        },
        link: `/professor/modules/${route.params.moduleId}/resources`

      }
    })
    resources.value.unshift(response.data);
    emit("ressourcesNotificationByProfessor", { ressources: response.data, update: false });
    toast.value = { show: true, message: 'Ressource ajoutée avec succès !', title: 'Succès', type: 'success' };
    closeModal();
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
    toast.value = { show: true, message: errorMsg, title: 'Erreur', type: 'error' };
  }
}

onMounted(() => {
  fetchRessources();
});
</script>

<style scoped>
.resources-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: var(--background-light);
}

/* En-tête optimisé */
.resources-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-light);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.header-icon svg {
  width: 26px;
  height: 26px;
}

.header-text h1 {
  font-size: 1.625rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.header-text p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.create-button {
  background: var(--primary-color);
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--white);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.create-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Statistiques optimisées */
.resources-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--primary-extra-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* Filtres */
.resources-filters {
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--primary-extra-light);
  border-color: var(--primary-color-light);
  color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white);
}

.filter-btn svg {
  width: 16px;
  height: 16px;
}

/* Grille des ressources */
.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.25rem;
}

.resource-card {
  background: var(--white);
  border-radius: var(--radius-xl);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-color-light);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.resource-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.resource-icon.video {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.resource-icon.document {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.resource-icon.drive {
  background: linear-gradient(135deg, #45b7d1 0%, #3498db 100%);
}

.resource-icon.external {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
}

.resource-icon svg {
  width: 22px;
  height: 22px;
}

.resource-actions {
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--background-light);
  color: var(--text-secondary);
}

.action-btn:hover {
  transform: scale(1.05);
}

.view-btn:hover {
  background: var(--primary-color);
  color: var(--white);
}

.edit-btn:hover {
  background: var(--warning);
  color: var(--white);
}

.delete-btn:hover {
  background: var(--error);
  color: var(--white);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.resource-content {
  margin-bottom: 1rem;
  flex: 1;
}

.resource-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.resource-description {
  color: var(--text-secondary);
  line-height: 1.5;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.resource-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.resource-type-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  flex-shrink: 0;
}

.resource-type-badge.video {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.resource-type-badge.document {
  background: rgba(78, 205, 196, 0.1);
  color: #4ecdc4;
}

.resource-type-badge.drive {
  background: rgba(69, 183, 209, 0.1);
  color: #45b7d1;
}

.resource-type-badge.external {
  background: var(--primary-extra-light);
  color: var(--primary-color);
}

.resource-type-badge svg {
  width: 14px;
  height: 14px;
}

.resource-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.resource-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--background-secondary);
  border-top: 1px solid var(--border-secondary);
  flex-wrap: wrap;
  margin-top: auto;
}

.resource-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.resource-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.resource-link.primary {
  background: var(--primary-color);
  color: white;
}

.resource-link.primary:hover {
  background: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.resource-link.download {
  background: var(--background-secondary);
  color: var(--text-secondary);
  border-color: var(--border-secondary);
}

.resource-link.download:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.875rem;
  background: var(--background-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.preview-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.preview-btn.video {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.preview-btn.video:hover {
  background: var(--success-dark);
  border-color: var(--success-dark);
}

/* Prévisualisation iframe */
.resource-preview {
  margin-top: 1rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--background-light);
}

/* Modal aperçu générique */
.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.preview-modal-content {
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90vw;
  max-width: 1200px;
  height: 90vh;
  /* Fixe la hauteur pour éviter la coupe des contrôles */
  display: grid;
  grid-template-rows: auto 1fr;
  /* En-tête + zone de contenu */
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.preview-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--background-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.preview-modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-dark);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: calc(100% - 60px);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--background-secondary);
  color: var(--text-dark);
}

.preview-modal-body {
  padding: 0;
  /* Pas de padding pour maximiser l'espace vidéo */
  height: 100%;
  overflow: hidden;
  background: #000;
  /* Arrière-plan noir pour le letterboxing */
}

.player-container {
  width: 100%;
  height: 100%;
  background: #000;
}

.preview-iframe-modal {
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  background: #000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

/* États */
.empty-state,
.empty-filter-state,
.loading-state,
.error-state {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin: 1.5rem 0;
}

.empty-icon,
.loading-spinner,
.error-icon {
  margin-bottom: 1.25rem;
}

.empty-icon svg,
.error-icon svg {
  width: 48px;
  height: 48px;
  opacity: 0.6;
  color: var(--text-secondary);
}

.spinner {
  animation: spin 1.5s linear infinite;
  width: 40px;
  height: 40px;
  color: var(--primary-color);
}

.empty-state h3,
.empty-filter-state h3,
.error-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-dark);
  margin: 0 0 0.5rem 0;
}

.empty-state p,
.empty-filter-state p,
.error-state p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
}

.empty-action-button,
.reset-filter-btn {
  margin-top: 0.75rem;
}

.reset-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--white);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-filter-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--white);
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.retry-button svg {
  width: 16px;
  height: 16px;
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.resource-fade-enter-active,
.resource-fade-leave-active {
  transition: all 0.4s ease;
}

.resource-fade-enter-from,
.resource-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
/* Desktop */
@media (min-width: 769px) {
  .preview-modal-content {
    width: 85vw;
    max-width: 1400px;
    height: 90vh;
    /* Assure la même logique sur desktop */
  }
}

@media (max-width: 768px) {
  .resources-container {
    padding: 1rem;
  }

  .resources-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-text h1 {
    font-size: 1.375rem;
  }

  .create-button {
    width: 100%;
    justify-content: center;
  }

  .resources-stats {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }

  .stat-icon svg {
    width: 20px;
    height: 20px;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .filter-group {
    justify-content: center;
    gap: 0.375rem;
  }

  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .filter-btn svg {
    width: 14px;
    height: 14px;
  }

  .resources-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .resource-card {
    padding: 1rem;
  }

  .resource-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
  }

  .resource-actions {
    order: -1;
    align-self: flex-end;
  }

  .resource-icon {
    order: 1;
    margin: 0 auto;
  }

  .resource-title {
    font-size: 1rem;
    text-align: center;
  }

  .resource-description {
    font-size: 0.8rem;
    text-align: center;
  }

  .resource-meta {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .resource-footer {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .resource-links,
  .preview-actions {
    justify-content: center;
  }

  .resource-link {
    justify-content: center;
  }

  .preview-btn {
    justify-content: center;
  }

  /* Modal responsif */
  .preview-modal-content {
    width: 95vw;
    margin: 1rem;
    height: 90vh;
  }

  .preview-modal-header {
    padding: 1rem;
  }

  .preview-modal-header h3 {
    font-size: 1.125rem;
  }

  .preview-modal-body {
    padding: 0;
  }

  .preview-iframe-modal {
    border-radius: 0;
  }

  .preview-iframe {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .resources-container {
    padding: 0.75rem;
  }

  .header-text h1 {
    font-size: 1.25rem;
  }

  .header-text p {
    font-size: 0.8rem;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .header-icon svg {
    width: 22px;
    height: 22px;
  }

  .resources-stats {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-btn {
    justify-content: center;
  }

  .resource-card {
    padding: 0.875rem;
  }

  .resource-icon {
    width: 40px;
    height: 40px;
  }

  .resource-icon svg {
    width: 20px;
    height: 20px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .resource-title {
    font-size: 0.95rem;
  }

  .resource-description {
    font-size: 0.75rem;
  }

  .resource-type-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .resource-date {
    font-size: 0.7rem;
  }

  .resource-link {
    font-size: 0.75rem;
  }

  .preview-btn {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }

  .preview-iframe {
    height: 200px;
  }
}

@media (max-width: 360px) {
  .resources-container {
    padding: 0.5rem;
  }

  .header-content {
    gap: 0.5rem;
  }

  .resources-stats {
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .filter-btn {
    padding: 0.3rem 0.6rem;
  }

  .resource-card {
    padding: 0.75rem;
  }

  .resource-actions {
    gap: 0.25rem;
  }
}
</style>
