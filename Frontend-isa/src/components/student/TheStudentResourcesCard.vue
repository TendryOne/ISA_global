<template>
    <div class="resource-card">
        <div class="resource-header">
            <div class="resource-icon" :class="getResourceTypeClass()">
                <Icon :icon="getResourceIcon()" />
            </div>
        </div>

        <div class="resource-content">
            <h3 class="resource-title">{{ ressource.title }}</h3>
            <p class="resource-description">{{ ressource.description }}</p>

            <div class="resource-meta">
                <span class="resource-type-badge" :class="getResourceTypeClass()">
                    <Icon :icon="getResourceIcon()" />
                    {{ getResourceType() }}
                </span>
                <span class="resource-date">{{ formatDate(ressource.createdAt) }}</span>
            </div>
        </div>

        <div class="resource-footer">
            <div class="resource-links">
                <a :href="getResourceUrl()" target="_blank" rel="noopener noreferrer" class="resource-link primary">
                    <Icon icon="material-symbols:play-circle-outline" v-if="ressource.type === 'video'" />
                    <Icon icon="material-symbols:description-outline" v-else />
                    {{ getLinkText() }}
                </a>

                <!-- Lien de téléchargement pour Google Drive -->
                <a v-if="ressource.link.includes('drive.google.com')" :href="getDownloadUrl()" target="_blank"
                    class="resource-link download" title="Télécharger">
                    <Icon icon="mdi:download-box" />
                    Télécharger
                </a>
            </div>

            <!-- Bouton pour consulter sur la plateforme -->
            <div class="preview-actions">
                <button v-if="canPreview()" @click="openPreview" class="preview-btn video">
                    <Icon icon="material-symbols:play-circle-outline" v-if="ressource.type === 'video'" />
                    <Icon icon="material-symbols:preview-outline" v-else />
                    {{ ressource.type === 'video' ? 'Regarder sur plateforme' : 'Aperçu sur plateforme' }}
                </button>
            </div>
        </div>
    </div>

    <!-- Modal de prévisualisation -->
    <div v-if="showPreview" class="preview-modal-overlay" @click="closePreview">
        <div class="preview-modal-content" @click.stop>
            <div class="preview-modal-header">
                <h3>{{ ressource.title }}</h3>
                <button @click="closePreview" class="close-btn">
                    <Icon icon="material-symbols:close" />
                </button>
            </div>
            <div class="preview-modal-body">
                <div class="player-container">
                    <iframe :src="getPreviewUrl()" frameborder="0" allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        class="preview-iframe-modal">
                    </iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type ResourcesInterface from '@/interfaces/resources.interface';
import { ref } from 'vue';

const props = defineProps<{
    ressource: ResourcesInterface;
}>();

const showPreview = ref(false);

const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Détection du type de ressource selon l'URL
const isVideo = (link: string) => {
    return link.includes('youtube') || link.includes('vimeo') ||
        (link.includes('drive.google.com') && link.includes('/file/'));
};

const isDriveDocument = (link: string) => {
    return link.includes('drive.google.com') &&
        (link.includes('/document/') || link.includes('/spreadsheets/') || link.includes('/presentation/'));
};

const isDocument = (link: string) => {
    return link.includes('.pdf') || link.includes('.doc') || link.includes('.docx') ||
        link.includes('.ppt') || link.includes('.pptx') || link.includes('.xls') ||
        link.includes('.xlsx') || isDriveDocument(link);
};

const getResourceIcon = () => {
    const link = props.ressource.link;
    const type = props.ressource.type;

    if (type === 'video') return 'material-symbols:play-circle-outline';
    if (type === 'document') return 'material-symbols:description-outline';

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
};

const getResourceType = () => {
    const link = props.ressource.link;
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
};

const getResourceTypeClass = () => {
    const link = props.ressource.link;
    if (isVideo(link)) return 'video';
    if (link.includes('drive.google.com')) return 'drive';
    if (isDocument(link)) return 'document';
    return 'external';
};

const getResourceUrl = () => {
    return props.ressource.link;
};

const getLinkText = () => {
    const type = props.ressource.type;
    if (type === 'video') return 'Regarder';
    if (type === 'document') return 'Consulter';
    if (props.ressource.link.includes('drive.google.com')) return 'Ouvrir dans Drive';
    return 'Accéder au lien';
};

const getDownloadUrl = () => {
    const link = props.ressource.link;
    if (!link.includes('drive.google.com')) return link;

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
};

const canPreview = () => {
    return props.ressource.link.includes('drive.google.com') ||
        props.ressource.link.includes('youtube') ||
        props.ressource.link.includes('vimeo');
};

const openPreview = () => {
    showPreview.value = true;
};

const closePreview = () => {
    showPreview.value = false;
};

const getPreviewUrl = () => {
    const link = props.ressource.link;

    // Pour YouTube
    if (link.includes('youtube.com/watch')) {
        const videoId = link.match(/[?&]v=([^&]+)/)?.[1];
        return `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=1`;
    }

    if (link.includes('youtu.be/')) {
        const videoId = link.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1&rel=0&showinfo=1`;
    }

    // Pour Vimeo
    if (link.includes('vimeo.com/')) {
        const videoId = link.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${videoId}?controls=1&title=1&byline=1&portrait=1`;
    }

    // Pour Google Drive
    if (!link.includes('drive.google.com')) return link;

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
};
</script>

<style scoped>
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
    background: linear-gradient(135deg, var(--error-light) 0%, var(--error) 100%);
}

.resource-icon.document {
    background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
}

.resource-icon.drive {
    background: linear-gradient(135deg, #64b5f6 0%, var(--primary-color) 100%);
}

.resource-icon.external {
    background: linear-gradient(135deg, var(--primary-color) 0%, #4169a3 100%);
}

.resource-icon svg {
    width: 22px;
    height: 22px;
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
    background: rgba(var(--error-rgb), 0.1);
    color: var(--error);
}

.resource-type-badge.document {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
}

.resource-type-badge.drive {
    background: rgba(var(--primary-color-rgb), 0.15);
    color: var(--primary-color);
}

.resource-type-badge.external {
    background: rgba(var(--primary-color-rgb), 0.1);
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
    flex-direction: column;
    gap: 0.75rem;
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
    flex: 1;
    justify-content: center;
}

.resource-link.primary {
    background: var(--primary-color);
    color: white;
}

.resource-link.primary:hover {
    background: #6ba3d8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
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
    background: var(--success);
    color: white;
    border: 1px solid var(--success);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    justify-content: center;
}

.preview-btn:hover {
    background: var(--success-dark);
    border-color: var(--success-dark);
    transform: translateY(-1px);
}

/* Modal de prévisualisation */
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
    display: grid;
    grid-template-rows: auto 1fr;
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
    height: 100%;
    overflow: hidden;
    background: #000;
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

@media (max-width: 768px) {
    .resource-card {
        padding: 1rem;
    }

    .resource-title {
        font-size: 1rem;
    }

    .resource-description {
        font-size: 0.8rem;
    }

    .resource-meta {
        flex-direction: column;
        align-items: flex-start;
    }

    .preview-modal-content {
        width: 95vw;
        margin: 1rem;
    }

    .preview-modal-header {
        padding: 1rem;
    }

    .preview-modal-header h3 {
        font-size: 1.125rem;
    }
}
</style>