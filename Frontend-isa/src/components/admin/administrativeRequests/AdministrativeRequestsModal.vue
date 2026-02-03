<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <!-- Header -->
            <div class="modal-header">
                <div class="header-info">
                    <Icon :icon="getRequestTypeIcon(request!.requestType)" class="request-icon" />
                    <div>
                        <h2 style="color: white;">{{ getRequestTypeLabel(request!.requestType) }}</h2>
                        <span class="status-badge" :class="`status-${request!.status}`">
                            <Icon :icon="getStatusIcon(request!.status)" />
                            {{ getStatusLabel(request!.status) }}
                        </span>
                    </div>
                </div>
                <button @click="closeModal" class="close-btn">
                    <Icon icon="material-symbols:close" />
                </button>
            </div>

            <!-- Main Content -->
            <div class="modal-body">
                <!-- Student Information -->
                <div class="section">
                    <h3 class="section-title">
                        <Icon icon="material-symbols:person" />
                        Informations Étudiant
                    </h3>

                    <div class="student-card">
                        <div class="student-avatar">
                            {{ getInitials(request!.student.firstName, request!.student.name) }}
                        </div>
                        <div class="student-info">
                            <h4>{{ request?.student.firstName }} {{ request?.student.name }}</h4>
                            <div class="info-badges">
                                <span class="info-badge">
                                    <Icon icon="material-symbols:badge" />
                                    {{ request?.student.matricule }}
                                </span>
                                <span class="info-badge">
                                    <Icon icon="material-symbols:school" />
                                    {{ request?.student.level }} - {{ request?.student.field }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Request Details -->
                <div class="section">
                    <h3 class="section-title">
                        <Icon icon="material-symbols:info" />
                        Détails de la Demande
                    </h3>

                    <div class="details-grid">
                        <div class="detail-item">
                            <Icon icon="material-symbols:calendar-today" />
                            <div>
                                <span class="detail-label">Date de création</span>
                                <span class="detail-value">{{ formatFullDate(request!.createdAt) }}</span>
                            </div>
                        </div>

                        <div class="detail-item">
                            <Icon icon="material-symbols:event-available" />
                            <div>
                                <span class="detail-label">Date de récupération</span>
                                <span class="detail-value">{{ formatFullDate(request!.recoveryDate) }}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <Icon icon="material-symbols:person" />
                            <div>
                                <span class="detail-label">Pris en charge par</span>
                                <span class="detail-value">{{ request?.handledBy?.firstName }} {{
                                    request?.handledBy?.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Actions -->
            <div class="modal-footer">


                <div class="footer-actions">

                    <ActionButton v-if="request?.status === 'pending'" @click="updateStatus('in-progress')"
                        icon="material-symbols:play-arrow">
                        Traiter
                    </ActionButton>

                    <ActionButton v-if="request?.status === 'in-progress'" @click="updateStatus('recoverable')"
                        icon="material-symbols:restore-page">
                        Marquer comme recuperable
                    </ActionButton>

                    <ActionButton v-if="request?.status === 'recoverable'" @click="updateStatus('delivered')"
                        icon="material-symbols:check-circle" variant="secondary">
                        Marquer comme remis
                    </ActionButton>
                    <ActionButton v-if="request?.status === 'pending' || request?.status === 'in-progress'"
                        @click="updateStatus('cancelled')" icon="material-symbols:cancel" variant="danger">Annuler la
                        demande
                    </ActionButton>
                </div>
            </div>
        </div>
    </div>
    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
        @dismissed="toast.show = false" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';
import axios from 'axios';
import ActionButton from '@/components/ui/ActionButton.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import { ref } from 'vue';
import SuccessToast from '@/components/toast/successToast.vue';
import { useRoute, useRouter } from 'vue-router';
import { useSocket } from '@/composables/useSocket';
const { emit } = useSocket();
const toast = ref<ToastInterface>({
    message: "",
    type: "success",
    show: false,
    title: ""
})

interface Props {
    isOpen: boolean;
    request: AdministrativeRequestInterface | null;
}

interface Emits {
    (e: 'close'): void;
    (e: 'updated', request: AdministrativeRequestInterface): void;
    (e: 'deleted', requestId: string): void;
}

const props = defineProps<Props>();
const emitComponent = defineEmits<Emits>();

const closeModal = () => {
    emitComponent('close');
};

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

const router = useRouter();

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'En attente',
        'in-progress': 'En cours',
        recoverable: 'Récupérable',
        delivered: 'Remise',
        cancelled: 'Annulée'
    };
    return labels[status] || status;
};

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        pending: 'material-symbols:pending',
        'in-progress': 'material-symbols:progress-activity',
        recoverable: 'material-symbols:restore-page',
        delivered: 'material-symbols:check-circle',
        cancelled: 'material-symbols:cancel'
    };
    return icons[status] || 'material-symbols:help';
};

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
};

const formatFullDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const updateStatus = async (newStatus: string) => {
    try {
        const response = await axios.patch(
            `/api/v1/administrativeRequests/${props.request!._id}`,
            { status: newStatus }
        );
        emitComponent('updated', response.data);
        toast.value = {
            message: `Statut mis à jour avec succès en "${getStatusLabel(newStatus)}".`,
            type: "success",
            show: true,
            title: "Succès"
        }
        emit("administrativeRequestStatusChangeByAdmin", { request: response.data });

        if (newStatus === "in-progress" && props.request?.requestType === "transcript") {
            router.push(`/admin/grades/${props.request.promotion.field}/${props.request.promotion.level}/${props.request.promotion._id}/${props.request.student._id}`)
        }

    } catch (error: unknown) {
        toast.value = {
            message: error.response?.data || 'Erreur lors de la mise à jour du statut.',
            type: "error",
            show: true,
            title: "Erreur"
        };
    }
};




</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-content {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 700px;
    max-height: 90vh;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
}

@keyframes slideUp {
    from {
        transform: translateY(30px) scale(0.95);
        opacity: 0;
    }

    to {
        transform: translateY(0) scale(1);
        opacity: 1;
    }
}

/* Header */
.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 2rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-darker) 100%);
    color: white
}

.header-info {
    display: flex;
    gap: 1rem;
    flex: 1;
    color: white;
}

.request-icon {
    font-size: 2.5rem;
    color: white;
    flex-shrink: 0;
}

.header-info h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #1f2937;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
}

.status-pending {
    background: rgba(var(--warning-rgb), 1);
    color: white
}

.status-in-progress {
    background: rgba(var(--primary-color-rgb), 1);
    color: white
}

.status-delivered {
    background: rgba(var(--success-rgb), 1);
    color: white
}

.status-recoverable {
    background: rgba(59, 130, 246, 1);
    color: white
}

.status-cancelled {
    background: rgba(239, 68, 68, 1);
    color: white
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #1f2937;
}

/* Body */
.modal-body {
    height: 60vh;
    overflow-y: auto;
    padding: 2rem;
}

.section {
    margin-bottom: 2rem;
}

.section:last-child {
    margin-bottom: 0;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 1.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}

.section-title svg {
    color: var(--primary-color);
    font-size: 1.25rem;
}

/* Student Card */
.student-card {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
}

.student-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-color-light));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 600;
    flex-shrink: 0;
}

.student-info h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1.125rem;
    color: #1f2937;
}

.info-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.info-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #4b5563;
}

.info-badge svg {
    font-size: 1rem;
    color: var(--primary-color);
}

/* Details Grid */
.details-grid {
    display: grid;
    gap: 1rem;
}

.detail-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.detail-item>svg {
    font-size: 1.5rem;
    color: var(--primary-color);
    flex-shrink: 0;
}

.detail-label {
    display: block;
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.detail-value {
    display: block;
    font-size: 0.95rem;
    font-weight: 500;
    color: #1f2937;
}

/* Footer */
.modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    gap: 1rem;
}

.footer-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
}

.action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.action-btn svg {
    font-size: 1.125rem;
}

.cancel-btn {
    background: #f3f4f6;
    color: #4b5563;
}

.cancel-btn:hover {
    background: #e5e7eb;
    transform: translateY(-1px);
}

.primary-btn {
    background: var(--primary-color);
    color: white;
}

.primary-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}

.success-btn {
    background: var(--success);
    color: white;
}

.success-btn:hover {
    background: var(--success-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(var(--success-rgb), 0.3);
}

.delete-btn {
    background: #fee2e2;
    color: #991b1b;
}

.delete-btn:hover {
    background: #fecaca;
    color: #7f1d1d;
    transform: translateY(-1px);
}

.delivered-btn {
    background: #dbeafe;
    color: #1e40af;
}

.delivered-btn:hover {
    background: #bfdbfe;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.cancelled-btn {
    background: #fee2e2;
    color: #991b1b;
}

.cancelled-btn:hover {
    background: #fecaca;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
    .modal-content {
        width: 95%;
        max-height: 95vh;
    }

    .modal-header,
    .modal-body {
        padding: 1.5rem;
    }

    .modal-footer {
        flex-direction: column;
        align-items: stretch;
    }

    .footer-actions {
        margin-left: 0;
        flex-direction: column;
    }

    .action-btn {
        width: 100%;
        justify-content: center;
    }

    .student-card {
        flex-direction: column;
        text-align: center;
    }

    .student-avatar {
        margin: 0 auto;
    }
}
</style>
z-index: 1000;
backdrop-filter: blur(8px);
animation: overlayAppear 0.3s ease-out;
}

@keyframes overlayAppear {
from {
opacity: 0;
backdrop-filter: blur(0);
}

to {
opacity: 1;
backdrop-filter: blur(8px);
}
}

.modal-content {
background: linear-gradient(145deg, var(--white), var(--gray-extra-light));
border-radius: var(--radius-xl);
width: 90%;
max-width: 900px;
max-height: 90vh;
overflow-y: auto;
box-shadow: var(--shadow-dark);
animation: modalAppear 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
border: 1px solid var(--border-light);
}

@keyframes modalAppear {
from {
transform: translateY(40px) scale(0.95);
opacity: 0;
}

to {
transform: translateY(0) scale(1);
opacity: 1;
}
}

/* Header */
.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 24px 32px;
background: linear-gradient(135deg,
rgba(var(--primary-color-rgb), 0.08) 0%,
rgba(var(--primary-color-rgb), 0.03) 100%);
border-bottom: 1px solid var(--border-light);
backdrop-filter: blur(10px);
border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.header-left {
display: flex;
align-items: center;
gap: 20px;
flex: 1;
}

.request-icon-container {
width: 56px;
height: 56px;
border-radius: 16px;
display: flex;
align-items: center;
justify-content: center;
box-shadow: var(--shadow-md);
}

.type-transcript.request-icon-container {
background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
}

.type-enrollment_certificate.request-icon-container {
background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
}

.type-diploma.request-icon-container {
background: linear-gradient(135deg, #9b59b6, #e74c3c);
}

.request-icon {
font-size: 28px;
color: white;
}

.header-title h2 {
margin: 0;
font-size: 24px;
font-weight: 700;
color: var(--text-dark);
letter-spacing: -0.5px;
}

.header-subtitle {
display: flex;
align-items: center;
gap: 16px;
margin-top: 8px;
}

.request-id {
font-size: 12px;
color: var(--text-secondary);
font-family: 'Courier New', monospace;
font-weight: 600;
letter-spacing: 1px;
background: var(--gray-super-light);
padding: 4px 12px;
border-radius: 12px;
border: 1px solid var(--border-light);
}

.status-indicator {
padding: 6px 16px;
border-radius: 20px;
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 1px;
border: 1px solid;
}

.status-pending {
background-color: rgba(var(--warning-rgb), 0.15);
color: var(--warning-dark);
border-color: rgba(var(--warning-rgb), 0.3);
}

.status-in-progress {
background-color: rgba(var(--primary-color-rgb), 0.15);
color: var(--primary-color);
border-color: rgba(var(--primary-color-rgb), 0.3);
}

.status-recoverable {
background-color: rgba(var(--success-rgb), 0.15);
color: var(--success-dark);
border-color: rgba(var(--success-rgb), 0.3);
}

.close-btn {
background: none;
border: none;
font-size: 24px;
cursor: pointer;
color: var(--text-secondary);
transition: all 0.3s ease;
display: flex;
align-items: center;
justify-content: center;
width: 44px;
height: 44px;
border-radius: 12px;
background: rgba(255, 255, 255, 0.5);
backdrop-filter: blur(4px);
border: 1px solid var(--border-light);
}

.close-btn:hover {
background: var(--white);
color: var(--text-dark);
transform: rotate(90deg);
box-shadow: var(--shadow-sm);
}

/* Body */
.modal-body {
padding: 32px;
display: flex;
flex-direction: column;
gap: 24px;
}

/* Section Cards */
.section-card {
background: var(--white);
border-radius: var(--radius-lg);
padding: 24px;
box-shadow: var(--shadow-light);
border: 1px solid var(--border-light);
transition: all 0.3s ease;
}

.section-card:hover {
box-shadow: var(--shadow-md);
border-color: var(--primary-color-light);
}

.section-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 24px;
padding-bottom: 16px;
border-bottom: 1px solid var(--border-light);
}

.section-title-wrapper {
display: flex;
align-items: center;
gap: 16px;
}

.title-icon {
width: 40px;
height: 40px;
border-radius: 12px;
background: linear-gradient(135deg,
rgba(var(--primary-color-rgb), 0.1) 0%,
rgba(var(--primary-color-rgb), 0.05) 100%);
display: flex;
align-items: center;
justify-content: center;
color: var(--primary-color);
font-size: 20px;
}

.section-header h3 {
margin: 0;
font-size: 18px;
font-weight: 600;
color: var(--text-dark);
letter-spacing: -0.3px;
}

.mini-btn {
background: none;
border: none;
cursor: pointer;
color: var(--text-secondary);
padding: 8px;
border-radius: 8px;
transition: all 0.2s ease;
display: flex;
align-items: center;
justify-content: center;
}

.mini-btn:hover {
background: var(--primary-extra-light);
color: var(--primary-color);
transform: translateY(-2px);
}

/* Student Profile */
.student-profile {
display: flex;
align-items: center;
gap: 24px;
margin-bottom: 24px;
padding: 20px;
background: linear-gradient(135deg,
var(--primary-extra-light) 0%,
transparent 100%);
border-radius: var(--radius);
border: 1px solid var(--border-light);
}

.student-avatar {
width: 72px;
height: 72px;
border-radius: 50%;
background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
display: flex;
align-items: center;
justify-content: center;
color: white;
font-size: 24px;
font-weight: 700;
box-shadow: var(--shadow-md);
flex-shrink: 0;
}

.student-details {
flex: 1;
}

.student-details h4 {
margin: 0 0 12px 0;
font-size: 22px;
font-weight: 700;
color: var(--text-dark);
}

.student-meta {
display: flex;
gap: 12px;
flex-wrap: wrap;
}

.meta-badge {
display: inline-flex;
align-items: center;
gap: 6px;
padding: 8px 16px;
background: var(--white);
border-radius: 20px;
font-size: 13px;
font-weight: 500;
color: var(--text-dark);
border: 1px solid var(--border-light);
box-shadow: var(--shadow-sm);
transition: all 0.2s ease;
}

.meta-badge:hover {
transform: translateY(-2px);
box-shadow: var(--shadow-md);
border-color: var(--primary-color-light);
}

.meta-badge i {
font-size: 16px;
color: var(--primary-color);
}

/* Contact Grid */
.contact-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
}

.contact-item {
display: flex;
align-items: center;
gap: 16px;
padding: 16px;
background: var(--gray-extra-light);
border-radius: var(--radius);
border: 1px solid var(--border-light);
}

.contact-icon {
font-size: 24px;
color: var(--primary-color);
flex-shrink: 0;
}

.contact-label {
display: block;
font-size: 11px;
color: var(--text-secondary);
text-transform: uppercase;
letter-spacing: 1px;
font-weight: 600;
margin-bottom: 4px;
}

.contact-value {
display: block;
font-size: 14px;
color: var(--text-dark);
font-weight: 500;
}

.contact-value.email {
color: var(--primary-color);
font-weight: 600;
}

/* Details Grid */
.details-grid {
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: 20px;
}

.detail-card {
display: flex;
align-items: center;
gap: 16px;
padding: 20px;
background: var(--gray-extra-light);
border-radius: var(--radius);
border: 1px solid var(--border-light);
transition: all 0.3s ease;
}

.detail-card:hover {
transform: translateY(-4px);
box-shadow: var(--shadow-md);
border-color: var(--primary-color-light);
}

.detail-icon {
font-size: 24px;
color: var(--primary-color);
flex-shrink: 0;
background: var(--white);
padding: 12px;
border-radius: 12px;
box-shadow: var(--shadow-sm);
}

.detail-content {
display: flex;
flex-direction: column;
gap: 4px;
}

.detail-label {
font-size: 11px;
color: var(--text-secondary);
text-transform: uppercase;
letter-spacing: 1px;
font-weight: 600;
}

.detail-value {
font-size: 15px;
color: var(--text-dark);
font-weight: 500;
}

.detail-value.highlight {
color: var(--primary-color);
font-weight: 700;
}

/* Timeline */
.timeline-container {
position: relative;
padding-left: 40px;
}

.timeline-container::before {
content: '';
position: absolute;
left: 27px;
top: 8px;
bottom: 8px;
width: 2px;
background: linear-gradient(to bottom,
var(--primary-color-light),
var(--secondary-color-light));
border-radius: 1px;
}

.timeline {
display: flex;
flex-direction: column;
gap: 32px;
}

.timeline-item {
position: relative;
display: flex;
align-items: flex-start;
opacity: 0.5;
transition: all 0.3s ease;
}

.timeline-item.active {
opacity: 1;
}

.timeline-marker {
position: absolute;
left: -40px;
top: 4px;
width: 32px;
height: 32px;
border-radius: 50%;
background: var(--white);
border: 2px solid var(--tertiary-light);
display: flex;
align-items: center;
justify-content: center;
color: var(--tertiary-light);
font-size: 16px;
z-index: 1;
}

.timeline-item.active .timeline-marker {
border-color: var(--primary-color);
background: var(--primary-color);
color: white;
box-shadow: 0 0 0 4px rgba(var(--primary-color-rgb), 0.2);
}

.timeline-content {
flex: 1;
padding-left: 16px;
}

.timeline-title {
margin: 0 0 8px 0;
font-size: 16px;
font-weight: 600;
color: var(--text-dark);
}

.timeline-date {
margin: 0;
font-size: 13px;
color: var(--text-secondary);
font-weight: 500;
}

/* Footer */
.modal-footer {
display: flex;
justify-content: space-between;
align-items: center;
padding: 24px 32px;
background: linear-gradient(135deg,
rgba(var(--primary-color-rgb), 0.03) 0%,
rgba(var(--primary-color-rgb), 0.01) 100%);
border-top: 1px solid var(--border-light);
border-radius: 0 0 var(--radius-xl) var(--radius-xl);
gap: 16px;
flex-wrap: wrap;
}

.footer-left,
.footer-right {
display: flex;
gap: 12px;
flex-wrap: wrap;
}

.action-btn {
display: flex;
align-items: center;
gap: 10px;
padding: 14px 24px;
border: none;
border-radius: var(--radius);
font-size: 14px;
font-weight: 600;
cursor: pointer;
transition: all 0.3s ease;
letter-spacing: 0.5px;
text-transform: uppercase;
box-shadow: var(--shadow-sm);
min-height: 48px;
}

.btn-text {
font-weight: 600;
}

.secondary-btn {
background: var(--white);
color: var(--text-dark);
border: 1px solid var(--border-secondary);
}

.secondary-btn:hover {
background: var(--gray-extra-light);
transform: translateY(-2px);
box-shadow: var(--shadow-md);
}

.primary-btn {
background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
color: white;
}

.primary-btn:hover {
background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
}

.success-btn {
background: linear-gradient(135deg, var(--success), var(--success-light));
color: white;
}

.success-btn:hover {
background: linear-gradient(135deg, var(--success-dark), var(--success));
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
}

.delete-btn {
background: linear-gradient(135deg, var(--error), var(--error-light));
color: white;
}

.delete-btn:hover {
background: linear-gradient(135deg, var(--error-dark), var(--error));
transform: translateY(-2px);
box-shadow: var(--shadow-lg);
}

/* Responsive */
@media (max-width: 768px) {
.modal-content {
width: 95%;
max-height: 95vh;
margin: 16px;
}

.modal-header {
flex-direction: column;
gap: 16px;
padding: 20px;
}

.header-left {
flex-direction: column;
align-items: flex-start;
gap: 16px;
}

.header-subtitle {
flex-direction: column;
align-items: flex-start;
gap: 8px;
}

.close-btn {
position: absolute;
top: 20px;
right: 20px;
}

.modal-body {
padding: 20px;
}

.section-card {
padding: 20px;
}

.student-profile {
flex-direction: column;
text-align: center;
gap: 20px;
}

.student-meta {
justify-content: center;
}

.contact-grid,
.details-grid {
grid-template-columns: 1fr;
}

.timeline-container {
padding-left: 32px;
}

.timeline-container::before {
left: 20px;
}

.timeline-marker {
left: -32px;
width: 28px;
height: 28px;
font-size: 14px;
}

.modal-footer {
flex-direction: column;
gap: 16px;
}

.footer-left,
.footer-right {
width: 100%;
justify-content: stretch;
}

.action-btn {
flex: 1;
justify-content: center;
}
}

/* Scrollbar styling */
.modal-content::-webkit-scrollbar {
width: 8px;
}

.modal-content::-webkit-scrollbar-track {
background: var(--gray-extra-light);
border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
background: var(--primary-color-light);
border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
background: var(--primary-color);
}