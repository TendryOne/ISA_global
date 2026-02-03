<template>
    <div class="administrative-requests-container">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <div class="header-title">
                    <Icon icon="material-symbols:request-quote" class="header-icon" />
                    <div>
                        <h1>Demandes Administratives</h1>
                        <p class="header-subtitle">Gestion des certificats et relevés de notes</p>
                    </div>
                </div>
                <div class="header-stats">
                    <div class="stat-badge">
                        <Icon icon="material-symbols:pending-actions" />
                        <span>{{ totalResults }} demande{{ totalResults > 1 ? 's' : '' }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
            <div class="search-box">
                <Icon icon="material-symbols:search" class="search-icon" />
                <input type="text" v-model="searchQuery" placeholder="Rechercher par matricule..."
                    class="search-input" />
            </div>
            <div class="filter-group">
                <label class="filter-label">Statut :</label>
                <select v-model="statusFilter" class="status-select">
                    <option value="">Tous les statuts</option>
                    <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Type :</label>
                <select v-model="requestType" class="status-select">
                    <option value="">Tous les types</option>
                    <option v-for="option in requestOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Table -->
        <div class="table-container">
            <div v-if="loading" class="loading-overlay">
                <SpinningLoader />
            </div>

            <div v-else-if="errorServer" class="error-state">
                <ErrorComponent :message="errorServer" />
            </div>

            <div v-else-if="requests.length === 0" class="empty-state">
                <Icon icon="material-symbols:inbox" class="empty-icon" />
                <h3>Aucune demande trouvée</h3>
                <p>Il n'y a pas de demandes administratives pour le moment</p>
            </div>

            <table v-else class="requests-table">
                <thead>
                    <tr>
                        <th>Matricule</th>
                        <th>Étudiant</th>
                        <th>Type de demande</th>
                        <th>Statut</th>
                        <th>Date de création</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in requests" :key="request._id" class="table-row">
                        <td class="matricule-cell">
                            <span class="matricule-badge">{{ request.student.matricule }}</span>
                        </td>
                        <td class="student-cell">
                            <div class="student-avatar">
                                {{ request.student.firstName.charAt(0) }}{{ request.student.name.charAt(0) }}
                            </div>
                            <div class="student-info">
                                <span class="student-name">{{ request.student.firstName }} {{ request.student.name
                                }}</span>
                                <span class="student-level">{{ request.student.level }} - {{ request.student.field
                                }}</span>
                            </div>
                        </td>
                        <td class="type-cell">
                            <span class="type-badge" :class="`type-${request.requestType}`">
                                <Icon :icon="getRequestTypeIcon(request.requestType)" />
                                {{ getRequestTypeLabel(request.requestType) }}
                            </span>
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

        <!-- Pagination -->
        <div class="pagination" v-if="!loading && !errorServer && requests.length > 0">
            <ActionButton icon="mdi:chevron-left" icon-position="left" size="small" :disabled="page <= 1"
                @click="page--">
                Précédent
            </ActionButton>
            <span class="page-info">Page {{ page }} sur {{ totalPages }}</span>
            <ActionButton icon="mdi:chevron-right" size="small" :disabled="page >= totalPages" @click="page++">
                Suivant
            </ActionButton>
        </div>

        <!-- Modal -->
        <AdministrativeRequestsModal :isOpen="isModalOpen" :request="selectedRequest" @close="isModalOpen = false"
            @updated="handleRequestUpdated" />
    </div>
</template>

<script setup lang="ts">
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';
import AdministrativeRequestsModal from '@/components/admin/administrativeRequests/AdministrativeRequestsModal.vue';
import axios from 'axios';
import { computed, watch, onMounted, ref } from 'vue';
import { debounce } from 'lodash';
import ActionButton from '@/components/ui/ActionButton.vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';


const router = useRouter();
const loading = ref<boolean>(false);
const requests = ref<AdministrativeRequestInterface[]>([]);
const errorServer = ref<string>('');
const isModalOpen = ref<boolean>(false);
const selectedRequest = ref<AdministrativeRequestInterface | null>(null);
const statusOptions = [
    { label: 'En attente', value: 'pending' },
    { label: 'En cours', value: 'in-progress' },
    { label: 'livré', value: 'recoverable' },
    { label: 'Remise', value: 'delivered' },
    { label: 'Annulée', value: 'cancelled' },
];
const requestOptions = [
    { label: 'Relevé de notes', value: 'transcript' },
    { label: 'Certificat de scolarité', value: 'enrollment_certificate' },
    { label: 'Diplôme', value: 'diploma' },
];
const requestType = ref<string>('');
const perPage = ref<number>(10);
const page = ref<number>(1);
const statusFilter = ref<string>('');
const searchQuery = ref<string>('');
const totalResults = ref<number>(0);

const fetchAdministrativeRequests = async () => {
    loading.value = true;
    try {
        const response = await axios.get('/api/v1/administrativeRequests', {
            params: {
                status: statusFilter.value,
                search: searchQuery.value,
                perPage: perPage.value,
                page: page.value,
                requestType: requestType.value
            }
        });
        requests.value = response.data.requests;
        totalResults.value = response.data.total;
    } catch (error: any) {
        errorServer.value = error.response?.data || 'Erreur lors du chargement des demandes administratives';
    } finally {
        loading.value = false;
    }
}

const debouncedFetch = debounce(fetchAdministrativeRequests, 300);

const totalPages = computed(() => {
    return Math.ceil(totalResults.value / perPage.value);
})

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

const formatDate = (date: Date) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
        return 'Il y a quelques secondes';
    } else if (diffMinutes < 60) {
        return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffWeeks < 4) {
        return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`;
    } else if (diffMonths < 12) {
        return `Il y a ${diffMonths} mois`;
    } else {
        return `Il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`;
    }
};

const viewDetails = (request: AdministrativeRequestInterface) => {
    selectedRequest.value = request;
    isModalOpen.value = true;
};

const handleRequestUpdated = (updatedRequest: AdministrativeRequestInterface) => {
    const index = requests.value.findIndex(r => r._id === updatedRequest._id);
    if (index !== -1) {
        requests.value[index] = updatedRequest;
    }
    selectedRequest.value = updatedRequest;
};





watch([searchQuery, statusFilter, page, perPage, requestType], () => {
    debouncedFetch();
});

onMounted(() => {
    fetchAdministrativeRequests();
})
</script>

<style scoped>
.administrative-requests-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
}

/* Header */
.page-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    color: white;
    box-shadow: 0 4px 20px rgba(var(--primary-color-rgb), 0.3);
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
    gap: 1rem;
}

.header-icon {
    font-size: 3rem;
    opacity: 0.9;
}

.header-title h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
}

.header-subtitle {
    margin: 0;
    font-size: 1rem;
    opacity: 0.9;
}

.header-stats {
    display: flex;
    gap: 1rem;
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    font-weight: 600;
}

.stat-badge :global(svg) {
    font-size: 1.5rem;
}

/* Filters */
.filters-section {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 300px;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.25rem;
    color: var(--text-secondary);
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9375rem;
    transition: all 0.3s ease;
    background: white;
}

.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.filter-label {
    font-weight: 600;
    color: var(--text-dark);
    white-space: nowrap;
}

.status-select {
    padding: 0.875rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    min-width: 200px;
}

.status-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

/* Table Container */
.table-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
    min-height: 400px;
}

.loading-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.error-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    padding: 3rem;
    text-align: center;
}

.empty-icon {
    font-size: 5rem;
    color: var(--text-tertiary);
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin: 0 0 0.5rem 0;
    color: var(--text-dark);
    font-size: 1.25rem;
}

.empty-state p {
    margin: 0;
    color: var(--text-secondary);
}

/* Table */
.requests-table {
    width: 100%;
    border-collapse: collapse;
}

.requests-table thead {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 2px solid #e2e8f0;
}

.requests-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 700;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-dark);
}

.requests-table tbody tr {
    border-bottom: 1px solid #e2e8f0;
    transition: all 0.2s ease;
}

.requests-table tbody tr:hover {
    background: #f8fafc;
}

.requests-table td {
    padding: 1.25rem 1.5rem;
    vertical-align: middle;
}

/* Table Cells */
.matricule-cell {
    font-family: 'Courier New', monospace;
}

.matricule-badge {
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    ;
}

.student-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.student-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    font-weight: 700;
    flex-shrink: 0;
}

.student-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.student-name {
    font-weight: 600;
    color: var(--text-dark);
    font-size: 0.9375rem;
}

.student-level {
    font-size: 0.8125rem;
    color: var(--text-secondary);
}

.type-badge,
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

.type-badge :global(svg),
.status-badge :global(svg) {
    font-size: 1.125rem;
}

/* Type badges */
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

/* Status badges */
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

.status-delivered {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
    border: 1px solid rgba(var(--success-rgb), 0.3);
}

.status-recoverable {
    background: rgba(59, 130, 246, 0.1);
    color: #1e40af;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #b91c1c;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.date-cell {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
}

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

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-info {
    font-weight: 600;
    color: var(--text-dark);
    padding: 0.5rem 1rem;
}

/* Responsive */
@media (max-width: 1200px) {
    .table-container {
        overflow-x: auto;
    }

    .requests-table {
        font-size: 0.875rem;
    }

    .requests-table th,
    .requests-table td {
        padding: 1rem;
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
        align-items: flex-start;
    }

    .header-title h1 {
        font-size: 1.5rem;
    }

    .filters-section {
        flex-direction: column;
    }

    .search-box {
        min-width: auto;
    }

    .filter-group {
        width: 100%;
    }

    .status-select {
        flex: 1;
    }

    .table-container {
        overflow-x: auto;
    }

    .requests-table {
        min-width: 900px;
    }
}
</style>