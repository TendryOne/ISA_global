<template>
    <div v-if="isOpen" class="overlay" @click.self="$emit('close')">
        <div class="modal-container">
            <div class="modal-card">
                <!-- Header with gradient -->
                <div class="modal-header">
                    <div class="header-content">
                        <div class="icon-wrapper">
                            <Icon :icon="getRequestTypeIcon(request.requestType)" class="header-icon" />
                        </div>
                        <div class="header-text">
                            <h2>{{ getRequestTypeLabel(request.requestType) }}</h2>
                            <p class="header-subtitle">Détails de votre demande</p>
                        </div>
                    </div>
                    <button @click="$emit('close')" class="close-btn">
                        <Icon icon="material-symbols:close" />
                    </button>
                </div>

                <!-- Main Content -->
                <div class="modal-body">
                    <!-- Status Card -->
                    <div class="status-card" :class="`status-${request.status}`">
                        <div class="status-icon-wrapper">
                            <Icon :icon="getStatusIcon(request.status)" class="status-icon" />
                        </div>
                        <div class="status-info">
                            <h3>{{ getStatusLabel(request.status) }}</h3>
                            <p>{{ getStatusDescription(request.status) }}</p>
                        </div>
                    </div>

                    <!-- Request Details -->
                    <div class="details-section">
                        <h3 class="section-title">
                            <Icon icon="material-symbols:info" />
                            Informations de la demande
                        </h3>

                        <div class="details-grid">
                            <div class="detail-item">
                                <div class="detail-icon">
                                    <Icon icon="material-symbols:calendar-today" />
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">Date de création</span>
                                    <span class="detail-value">{{ formatFullDate(request.createdAt) }}</span>
                                </div>
                            </div>


                            <div class="detail-item" v-if="request.handledBy">
                                <div class="detail-icon">
                                    <Icon icon="material-symbols:person" />
                                </div>
                                <div class="detail-content">
                                    <span class="detail-label">Pris en charge par</span>
                                    <span class="detail-value">{{ request.handledBy.firstName }} {{
                                        request.handledBy.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Timeline for status -->
                    <div class="timeline-section" v-if="request.status !== 'cancelled'">
                        <h3 class="section-title">
                            <Icon icon="material-symbols:timeline" />
                            Suivi de votre demande
                        </h3>

                        <div class="timeline">
                            <div class="timeline-item" :class="{ 'active': isStatusReached('pending') }">
                                <div class="timeline-icon">
                                    <Icon icon="material-symbols:pending" />
                                </div>
                                <div class="timeline-content">
                                    <h4>En attente</h4>
                                    <p>Votre demande a été enregistrée</p>
                                </div>
                            </div>

                            <div class="timeline-item" :class="{ 'active': isStatusReached('in-progress') }">
                                <div class="timeline-icon">
                                    <Icon icon="material-symbols:progress-activity" />
                                </div>
                                <div class="timeline-content">
                                    <h4>En cours de traitement</h4>
                                    <p>Votre demande est en cours de préparation</p>
                                </div>
                            </div>

                            <div class="timeline-item" :class="{ 'active': isStatusReached('recoverable') }">
                                <div class="timeline-icon">
                                    <Icon icon="material-symbols:restore-page" />
                                </div>
                                <div class="timeline-content">
                                    <h4>Prêt à récupérer</h4>
                                    <p>Votre document est disponible</p>
                                </div>
                            </div>

                            <div class="timeline-item" :class="{ 'active': isStatusReached('delivered') }">
                                <div class="timeline-icon">
                                    <Icon icon="material-symbols:local-shipping" />
                                </div>
                                <div class="timeline-content">
                                    <h4>Remis</h4>
                                    <p>Document récupéré avec succès</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Info Card -->
                    <div class="info-card">
                        <div class="info-icon-wrapper">
                            <Icon icon="material-symbols:info" />
                        </div>
                        <div class="info-text" v-if="request.status !== 'cancelled'">
                            <p>
                                <strong>Note importante :</strong> Veuillez vous présenter au service de scolarité
                                durant les heures de bureau <strong class="highlight">8h - 17h</strong> pour récupérer
                                votre document lorsqu'il sera prêt.
                            </p>
                        </div>
                        <div class="info-text" v-else>
                            <p>
                                <strong>Note importante :</strong> Cette demande a été annulée. Veuillez contacter le
                                service de scolarité
                                durant les heures de bureau de <strong class="highlight">8h - 17h</strong> pour plus
                                d'informations.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="modal-footer">
                    <ActionButton full-width @click="$emit('close')" icon="material-symbols:close" iconPosition="left">
                        Fermer
                    </ActionButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import ActionButton from '../ui/ActionButton.vue';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';

interface Props {
    isOpen: boolean;
    request: AdministrativeRequestInterface;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    close: [];
}>();

const getRequestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        transcript: 'Relevé de notes',
        enrollment_certificate: 'Certificat de scolarité',
        diploma: 'Diplôme'
    };
    return labels[type] || type;
};

const getRequestTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
        transcript: 'material-symbols:description',
        enrollment_certificate: 'material-symbols:badge',
        diploma: 'material-symbols:school'
    };
    return icons[type] || 'material-symbols:file-present';
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'En attente',
        'in-progress': 'En cours de traitement',
        recoverable: 'Prêt à récupérer',
        delivered: 'Remis',
        cancelled: 'Annulée'
    };
    return labels[status] || status;
};

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        pending: 'material-symbols:pending',
        'in-progress': 'material-symbols:progress-activity',
        recoverable: 'material-symbols:restore-page',
        delivered: 'material-symbols:local-shipping',
        cancelled: 'material-symbols:cancel'
    };
    return icons[status] || 'material-symbols:help';
};

const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
        pending: 'Votre demande a été enregistrée et sera traitée prochainement par le service de scolarité.',
        'in-progress': 'Votre document est en cours de préparation. Nous vous informerons dès qu\'il sera prêt.',
        recoverable: 'Votre document est prêt ! Vous pouvez le récupérer au service de scolarité.',
        delivered: 'Vous avez récupéré votre document avec succès.',
        cancelled: 'Cette demande a été annulée.'
    };
    return descriptions[status] || '';
};

const formatFullDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const isStatusReached = (targetStatus: string) => {

    const statusOrder = ['pending', 'in-progress', 'recoverable', 'delivered'];
    const currentIndex = statusOrder.indexOf((props.request as any).status || 'pending');
    const targetIndex = statusOrder.indexOf(targetStatus);
    return targetIndex <= currentIndex;
};
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.463);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
    padding: 2rem 1rem;
    overflow-y: auto;
}

.modal-container {
    max-width: 700px;
    width: 100%;
    position: relative;
    z-index: 1001;
}

.modal-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    border: 1px solid #e5e7eb;
    animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.modal-header {
    background: linear-gradient(135deg, #5086c1, #1a252f);
    color: white;
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
}

.modal-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-icon {
    font-size: 2.5rem;
    color: white;
}

.header-text h2 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
}

.header-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9375rem;
}

.close-btn {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
}

.close-btn :global(svg) {
    font-size: 1.5rem;
}

/* Modal Body */
.modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Status Card */
.status-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid;
    transition: all 0.3s ease;
}

.status-card.status-pending {
    background: rgba(var(--warning-rgb), 0.1);
    border-color: rgba(var(--warning-rgb), 0.3);
}

.status-card.status-in-progress {
    background: rgba(var(--primary-color-rgb), 0.1);
    border-color: rgba(var(--primary-color-rgb), 0.3);
}

.status-card.status-recoverable {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
}

.status-card.status-delivered {
    background: rgba(var(--success-rgb), 0.1);
    border-color: rgba(var(--success-rgb), 0.3);
}

.status-card.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
}

.status-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-icon {
    font-size: 2rem;
}

.status-pending .status-icon {
    color: var(--warning-dark);
}

.status-in-progress .status-icon {
    color: var(--primary-dark);
}

.status-recoverable .status-icon {
    color: #1e40af;
}

.status-delivered .status-icon {
    color: var(--success-dark);
}

.status-cancelled .status-icon {
    color: #b91c1c;
}

.status-info h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
}

.status-info p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

/* Details Section */
.details-section {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 12px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 1.25rem;
}

.section-title :global(svg) {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.details-grid {
    display: grid;
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
}

.detail-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    flex-shrink: 0;
}

.detail-icon :global(svg) {
    font-size: 1.25rem;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.detail-value {
    font-size: 0.9375rem;
    color: var(--text-primary);
    font-weight: 600;
}

/* Timeline Section */
.timeline-section {
    background: #f9fafb;
    padding: 1.5rem;
    border-radius: 12px;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
}

.timeline::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 30px;
    bottom: 30px;
    width: 2px;
    background: #e5e7eb;
}

.timeline-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    position: relative;
    opacity: 0.5;
    transition: all 0.3s ease;
}

.timeline-item.active {
    opacity: 1;
}

.timeline-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #9ca3af;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;
}

.timeline-item.active .timeline-icon {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.timeline-icon :global(svg) {
    font-size: 1.25rem;
}

.timeline-content {
    padding-top: 0.25rem;
}

.timeline-content h4 {
    margin: 0 0 0.25rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
}

.timeline-content p {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--text-secondary);
}

/* Info Card */
.info-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
}

.info-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    color: #3b82f6;
    flex-shrink: 0;
}

.info-icon-wrapper :global(svg) {
    font-size: 1.5rem;
}

.info-text {
    flex: 1;
}

.info-text p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text-primary);
    line-height: 1.6;
}

.highlight {
    color: var(--primary-color);
    font-weight: 700;
}

/* Footer */
.modal-footer {
    padding: 1.5rem 2rem;
    background: #f9fafb;
    border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
    .overlay {
        padding: 1rem;
    }

    .modal-header {
        padding: 1.5rem;
    }

    .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .icon-wrapper {
        width: 60px;
        height: 60px;
    }

    .header-icon {
        font-size: 2rem;
    }

    .modal-body {
        padding: 1.5rem;
        gap: 1.5rem;
    }

    .status-card {
        flex-direction: column;
        text-align: center;
    }

    .details-grid {
        gap: 0.75rem;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
    }
}
</style>
