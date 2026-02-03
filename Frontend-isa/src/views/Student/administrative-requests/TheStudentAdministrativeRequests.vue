<template>
    <div class="administrative-requests-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <Icon icon="material-symbols:request-quote" class="header-icon" />
                    <div>
                        <h1>Mes Demandes Administratives</h1>
                        <p class="header-subtitle">Suivez vos demandes de documents</p>
                    </div>
                </div>
                <ActionButton @click="openFormModal" icon="material-symbols:add" iconPosition="left">
                    Nouvelle demande
                </ActionButton>
            </div>
        </div>

        <!-- Table -->
        <div class="table-container">
            <div v-if="loading" class="loading-overlay">
                <SpinningLoader />
            </div>

            <div v-else-if="errorServer" class="error-state">
                <ErrorComponent :message="errorServer" @retry="fetchAdministrativeRequests" />
            </div>

            <div v-else-if="requests.length === 0" class="empty-state">
                <Icon icon="material-symbols:inbox" class="empty-icon" />
                <h3>Aucune demande</h3>
                <p>Vous n'avez pas encore fait de demande administrative</p>
                <ActionButton @click="openFormModal" icon="material-symbols:add" iconPosition="left">
                    Faire une demande
                </ActionButton>
            </div>

            <table v-else class="requests-table">
                <thead>
                    <tr>
                        <th>Type de demande</th>
                        <th>Promotion</th>
                        <th>Statut</th>
                        <th>Date de création</th>
                        <th>Date de récupération</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in requests" :key="request._id" class="table-row">
                        <td class="type-cell">
                            <span class="type-badge" :class="`type-${request.requestType}`">
                                <Icon :icon="getRequestTypeIcon(request.requestType)" />
                                {{ getRequestTypeLabel(request.requestType) }}
                            </span>
                        </td>
                        <td class="promotion-cell">
                            <span class="promotion-name">{{ request.promotion?.name || '-' }}</span>
                        </td>
                        <td class="status-cell">
                            <span class="status-badge" :class="`status-${request.status}`">
                                <Icon :icon="getStatusIcon(request.status)" />
                                {{ getStatusLabel(request.status) }}
                            </span>
                        </td>
                        <td class="date-cell">
                            {{ formatDate(request.createdAt) }}
                        </td>
                        <td class="date-cell">
                            {{ request.recoveryDate ? formatDate(request.recoveryDate) : '-' }}
                        </td>
                        <td class="action-cell">
                            <button @click="viewDetails(request)" class="action-btn">
                                <Icon icon="material-symbols:visibility" />
                                <span>Détails</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modals -->
        <TheStudentAdministrativeRequestsModal v-if="isDetailsModalOpen" :isOpen="isDetailsModalOpen"
            :request="selectedRequest!" @close="isDetailsModalOpen = false" />

        <TheStudentAdministrativeFormModal v-if="isFormModalOpen" :request="null" @close="isFormModalOpen = false"
            @submit="PushRequest" />
    </div>
</template>

<script setup lang="ts">
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';
import type StudentInterface from '@/interfaces/student.intefaces';
import { useMyUserStore } from '@/stores/userStore';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import TheStudentAdministrativeRequestsModal from '@/components/student/TheStudentAdministrativeRequestsModal.vue';
import TheStudentAdministrativeFormModal from '@/components/student/TheStudentAdministrativeFormModal.vue';

const user = useMyUserStore().currentUser as StudentInterface;

const errorServer = ref<string>("");
const loading = ref<boolean>(true);
const requests = ref<AdministrativeRequestInterface[]>([]);
const isDetailsModalOpen = ref<boolean>(false);
const isFormModalOpen = ref<boolean>(false);
const selectedRequest = ref<AdministrativeRequestInterface | null>(null);

const fetchAdministrativeRequests = async () => {
    loading.value = true;
    try {
        const response = await axios.get(`/api/v1/administrativeRequests/student/${user._id}`);
        requests.value = response.data;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Une erreur est survenue lors du chargement des demandes administratives.";
    } finally {
        loading.value = false;
    }
}

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
        'in-progress': 'En cours',
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

const formatDate = (date: Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const viewDetails = (request: AdministrativeRequestInterface) => {
    selectedRequest.value = request;
    isDetailsModalOpen.value = true;
};

const openFormModal = () => {
    isFormModalOpen.value = true;
};

const PushRequest = (data: AdministrativeRequestInterface) => {
    requests.value.unshift(data);
}


onMounted(() => {
    fetchAdministrativeRequests();
});

</script>

<style scoped>
.administrative-requests-container {
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Header */
.page-header {
    background: linear-gradient(135deg, #5086c1, #1a252f);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.header-title {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: white;
}

.header-icon {
    font-size: 3rem;
    opacity: 0.9;
}

.header-title h1 {
    margin: 0 0 0.5rem;
    font-size: 2rem;
    font-weight: 700;
}

.header-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 1rem;
}

/* Table Container */
.table-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow-x: auto;
}

.loading-overlay {
    padding: 4rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.error-state {
    padding: 2rem;
}

.empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: var(--text-secondary);
}

.empty-icon {
    font-size: 5rem;
    opacity: 0.3;
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    color: var(--text-primary);
}

.empty-state p {
    margin: 0 0 2rem;
    font-size: 1rem;
}

/* Table */
.requests-table {
    width: 100%;
    border-collapse: collapse;
}

.requests-table thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
}

.requests-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.table-row {
    border-bottom: 1px solid #e5e7eb;
    transition: background 0.2s ease;
}

.table-row:hover {
    background: #f9fafb;
}

.requests-table td {
    padding: 1rem;
    vertical-align: middle;
}

/* Type Badge */
.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.type-badge :global(svg) {
    font-size: 1.125rem;
}

.type-transcript {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.1));
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.type-enrollment_certificate {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.1));
    color: #047857;
    border: 1px solid rgba(16, 185, 129, 0.3);
}

.type-diploma {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.1));
    color: #6b21a8;
    border: 1px solid rgba(168, 85, 247, 0.3);
}

/* Status Badge */
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.status-badge :global(svg) {
    font-size: 1.125rem;
}

.status-pending {
    background: rgba(var(--warning-rgb), 0.1);
    color: var(--warning-dark);
    border: 1px solid rgba(var(--warning-rgb), 0.3);
}

.status-in-progress {
    background: rgba(var(--primary-color-rgb), 0.1);
    color: var(--primary-dark);
    border: 1px solid rgba(var(--primary-color-rgb), 0.3);
}

.status-recoverable {
    background: rgba(59, 130, 246, 0.1);
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-delivered {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
    border: 1px solid rgba(var(--success-rgb), 0.3);
}

.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Promotion Cell */
.promotion-name {
    font-weight: 500;
    color: var(--text-primary);
}

/* Date Cell */
.date-cell {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
}

/* Action Button */
.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.3);
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.4);
}

.action-btn:active {
    transform: translateY(0);
}

.action-btn :global(svg) {
    font-size: 1.125rem;
}

/* Responsive */
@media (max-width: 1024px) {

    .requests-table th,
    .requests-table td {
        padding: 0.875rem 0.75rem;
        font-size: 0.9375rem;
    }

    .header-icon {
        font-size: 2.5rem;
    }

    .header-title h1 {
        font-size: 1.75rem;
    }
}

@media (max-width: 768px) {
    .administrative-requests-container {
        padding: 1rem;
    }

    .page-header {
        padding: 1.5rem;
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .header-title {
        gap: 1rem;
    }

    .header-icon {
        font-size: 2rem;
    }

    .header-title h1 {
        font-size: 1.5rem;
    }

    .header-subtitle {
        font-size: 0.875rem;
    }

    /* Hide some columns on mobile */
    .requests-table th:nth-child(5),
    .requests-table td:nth-child(5) {
        display: none;
    }

    .requests-table th,
    .requests-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.8125rem;
    }

    .type-badge,
    .status-badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.75rem;
    }

    .action-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
        gap: 0.25rem;
    }

    .action-btn :global(svg) {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .administrative-requests-container {
        padding: 0.75rem;
    }

    .page-header {
        padding: 1rem;
        margin-bottom: 1.5rem;
    }

    .header-title h1 {
        font-size: 1.25rem;
    }

    .header-subtitle {
        font-size: 0.75rem;
    }



    .requests-table th,
    .requests-table td {
        padding: 0.5rem 0.375rem;
        font-size: 0.75rem;
    }

    .type-badge,
    .status-badge {
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.375rem 0.5rem;
    }

    .action-btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.7rem;
        width: 100%;
        justify-content: center;
    }

    .action-btn :global(svg) {
        font-size: 0.9rem;
    }

    .empty-icon {
        font-size: 3rem;
    }

    .empty-state h3 {
        font-size: 1.125rem;
    }

    .empty-state p {
        font-size: 0.875rem;
    }
}
</style>