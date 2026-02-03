<template>
    <div class="documents-section">
        <div class="section-header">
            <h2>
                <Icon icon="mdi:file-document-multiple" /> Documents administratifs
            </h2>
            <div class="header-badge">
                <Icon icon="mdi:check-circle" />
                <span>{{ completedDocuments }}/{{ totalDocuments }} complétés</span>
            </div>
        </div>

        <div class="section-content">
            <!-- Info notice -->
            <div class="info-notice">
                <Icon icon="mdi:information" />
                <p>
                    Ces documents sont requis pour votre dossier administratif.
                    Pour toute mise à jour, veuillez contacter le service de scolarité.
                </p>
            </div>

            <!-- Documents grid -->
            <div class="documents-grid">
                <div class="document-card" v-for="doc in documents" :key="doc.id">
                    <div class="document-preview" @click="openPreview(doc)">
                        <template v-if="doc.url">
                            <img v-if="isImage(doc.url)" :src="getDocumentUrl(doc.url)" :alt="doc.title" />
                            <div v-else class="document-icon">
                                <Icon icon="mdi:file-pdf-box" />
                            </div>
                            <div class="preview-overlay">
                                <Icon icon="mdi:eye" />
                            </div>
                        </template>
                        <div v-else class="document-placeholder">
                            <Icon icon="mdi:file-upload-outline" />
                            <span>Non fourni</span>
                        </div>
                    </div>
                    <div class="document-info">
                        <h4>{{ doc.title }}</h4>
                        <div class="document-status" :class="doc.url ? 'uploaded' : 'missing'">
                            <Icon :icon="doc.url ? 'mdi:check-circle' : 'mdi:alert-circle'" />
                            <span>{{ doc.url ? 'Document fourni' : 'Document manquant' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal de prévisualisation -->
        <Transition name="modal">
            <div v-if="previewModal.show" class="modal-overlay" @click.self="closePreview">
                <div class="modal-container">
                    <div class="modal-card">
                        <div class="modal-header">
                            <h3>{{ previewModal.title }}</h3>
                            <button class="modal-close" @click="closePreview">
                                <Icon icon="mdi:close" />
                            </button>
                        </div>
                        <div class="modal-body">
                            <img v-if="isImage(previewModal.url)" :src="getDocumentUrl(previewModal.url)"
                                :alt="previewModal.title" />
                            <iframe v-else :src="getDocumentUrl(previewModal.url)" frameborder="0"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useMyUserStore } from '@/stores/userStore';
import { computed, reactive } from 'vue';
import type StudentInterface from '@/interfaces/student.intefaces';

const userStore = useMyUserStore();
const student = computed(() => userStore.currentUser as StudentInterface);

interface Document {
    id: string;
    title: string;
    url: string | undefined;
}

const documents = computed<Document[]>(() => [
    {
        id: 'identityPhoto',
        title: "Photo d'identité",
        url: student.value?.identityPhoto
    },
    {
        id: 'idDocument',
        title: 'CIN / Passport',
        url: student.value?.idDocument
    },
    {
        id: 'bacTranscript',
        title: 'Relevé de notes (Bac)',
        url: student.value?.bacTranscript
    },
    {
        id: 'residenceCertificate',
        title: 'Certificat de résidence',
        url: student.value?.residenceCertificate
    }
]);

const completedDocuments = computed(() => documents.value.filter(d => d.url).length);
const totalDocuments = computed(() => documents.value.length);

const previewModal = reactive({
    show: false,
    title: '',
    url: ''
});

const isImage = (url: string | undefined): boolean => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
};

const getDocumentUrl = (url: string | undefined): string => {
    if (!url) return '';
    return `/api/v1/document?fullPath=${url}`;
};

const openPreview = (doc: Document) => {
    if (!doc.url) return;
    previewModal.title = doc.title;
    previewModal.url = doc.url;
    previewModal.show = true;
    document.body.style.overflow = 'hidden';
};

const closePreview = () => {
    previewModal.show = false;
    document.body.style.overflow = '';
};
</script>

<style scoped>
.documents-section {
    background: white;
    border-radius: var(--radius-lg);
    overflow: hidden;
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

.header-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--primary-extra-light);
    color: var(--primary-dark);
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
}

.section-content {
    padding: 1.5rem;
}

.info-notice {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: var(--tertiary-extra-light);
    border-radius: var(--radius);
    border-left: 3px solid var(--tertiary-color);
}

.info-notice svg {
    color: var(--tertiary-color);
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.info-notice p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-darker);
    line-height: 1.5;
}

.documents-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}

.document-card {
    background: var(--tertiary-extra-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.document-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.document-preview {
    position: relative;
    height: 180px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
}

.document-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.document-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.document-icon svg {
    font-size: 4rem;
    color: var(--error);
}

.preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.preview-overlay svg {
    font-size: 2rem;
    color: white;
}

.document-preview:hover .preview-overlay {
    opacity: 1;
}

.document-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-light);
}

.document-placeholder svg {
    font-size: 3rem;
}

.document-placeholder span {
    font-size: 0.875rem;
}

.document-info {
    padding: 1rem;
}

.document-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--gray-darker);
}

.document-status {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8rem;
    font-weight: 500;
}

.document-status.uploaded {
    color: var(--success-dark);
}

.document-status.missing {
    color: var(--warning-dark);
}

/* Modal styles */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
}

.modal-container {
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
}

.modal-card {
    background: white;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-dark);
    animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.modal-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
}

.modal-close svg {
    font-size: 1.25rem;
}

.modal-body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1a1a;
    min-height: 400px;
    max-height: 70vh;
    overflow: auto;
}

.modal-body img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.modal-body iframe {
    width: 100%;
    height: 70vh;
}

/* Responsive */
@media (max-width: 768px) {
    .section-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .documents-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .document-preview {
        height: 140px;
    }
}

@media (max-width: 480px) {
    .documents-grid {
        grid-template-columns: 1fr;
    }
}
</style>
