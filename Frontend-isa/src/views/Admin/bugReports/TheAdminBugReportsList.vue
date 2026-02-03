<template>
    <div class="bug-reports-admin-page">
        <!-- Header -->
        <header class="page-header">
            <div class="header-content">
                <div class="header-icon">
                    <Icon icon="solar:bug-minimalistic-bold-duotone" />
                </div>
                <div class="header-text">
                    <h1 class="page-title">Gestion des Rapports</h1>
                    <p class="page-subtitle">Gérez les bugs, suggestions et améliorations signalés par les utilisateurs
                    </p>
                </div>
            </div>
            <div class="header-stats">
                <div class="stat-card">
                    <Icon icon="solar:bug-bold-duotone" class="stat-icon" />
                    <div class="stat-info">
                        <span class="stat-value">{{ totalBugReports }}</span>
                        <span class="stat-label">Total</span>
                    </div>
                </div>
                <div class="stat-card">
                    <Icon icon="solar:check-circle-bold-duotone" class="stat-icon success" />
                    <div class="stat-info">
                        <span class="stat-value">{{bugReports.filter(b => b.isResolved).length}}</span>
                        <span class="stat-label">Résolus</span>
                    </div>
                </div>
                <div class="stat-card">
                    <Icon icon="solar:clock-circle-bold-duotone" class="stat-icon warning" />
                    <div class="stat-info">
                        <span class="stat-value">{{bugReports.filter(b => !b.isResolved).length}}</span>
                        <span class="stat-label">En attente</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Filters -->
        <section class="filters-section">
            <div class="filters-container">
                <div class="filter-group">
                    <label class="filter-label">
                        <Icon icon="solar:sort-horizontal-bold-duotone" />
                        <span>Type</span>
                    </label>
                    <select v-model="typeFilter" class="filter-select">
                        <option value="">Tous les types</option>
                        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <Icon icon="solar:flag-bold-duotone" />
                        <span>Priorité</span>
                    </label>
                    <select v-model="priorityFilter" class="filter-select">
                        <option value="">Toutes les priorités</option>
                        <option v-for="option in priorityOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <Icon icon="solar:shield-check-bold-duotone" />
                        <span>Statut</span>
                    </label>
                    <select v-model="isResolvedFilter" class="filter-select">
                        <option :value="null">Tous les statuts</option>
                        <option :value="true">Résolus</option>
                        <option :value="false">En attente</option>
                    </select>
                </div>

                <div class="filter-group search-group">
                    <label class="filter-label">
                        <Icon icon="solar:magnifer-bold-duotone" />
                        <span>Recherche</span>
                    </label>
                    <input v-model="reporterMatriculeFilter" type="text" placeholder="Matricule du rapporteur..."
                        class="filter-input" />
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <Icon icon="solar:list-bold-duotone" />
                        <span>Par page</span>
                    </label>
                    <select v-model="perPage" class="filter-select small">
                        <option :value="10">10</option>
                        <option :value="25">25</option>
                        <option :value="50">50</option>
                        <option :value="100">100</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label class="filter-label">
                        <Icon icon="solar:refresh-bold-duotone" />
                        <span>Actions</span>
                    </label>
                    <button @click="resetFilters" class="btn-reset-filters">
                        <Icon icon="solar:restart-bold" />
                        Réinitialiser
                    </button>
                </div>
            </div>
        </section>

        <!-- Loading State -->
        <SpinningLoader v-if="loading" />

        <!-- Error State -->
        <ErrorComponent v-else-if="errorServer" :message="errorServer" @retry="fetchBugReports" />

        <!-- Table -->
        <section v-else class="table-section">
            <div class="bug-reports-table-container">
                <table class="bug-reports-table">
                    <thead>
                        <tr>
                            <th class="type-column">Type</th>
                            <th class="title-column">Titre</th>
                            <th class="reporter-column">Rapporteur</th>
                            <th class="priority-column">Priorité</th>
                            <th class="status-column">Statut</th>
                            <th class="date-column">Date</th>
                            <th class="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="bugReports.length === 0">
                            <td colspan="7" class="empty-state">
                                <Icon icon="solar:inbox-line-bold-duotone" />
                                <p>Aucun rapport trouvé</p>
                            </td>
                        </tr>
                        <tr v-for="report in bugReports" :key="report._id" class="report-row"
                            :class="{ 'resolved': report.isResolved }">
                            <!-- Type -->
                            <td class="type-cell">
                                <div class="type-badge" :class="`type-${report.type}`">
                                    <Icon :icon="getTypeIcon(report.type)" />
                                    <span>{{ getTypeLabel(report.type) }}</span>
                                </div>
                            </td>

                            <!-- Title -->
                            <td class="title-cell">
                                <div class="report-title">
                                    <h4>{{ report.title }}</h4>
                                </div>
                            </td>

                            <!-- Reporter -->
                            <td class="reporter-cell">
                                <div class="reporter-info">
                                    <div class="reporter-details">
                                        <span class="reporter-matricule">{{ report.reporterMatricule }}</span>
                                    </div>
                                </div>
                            </td>

                            <!-- Priority -->
                            <td class="priority-cell">
                                <span class="priority-badge" :class="`priority-${report.priority}`">
                                    <Icon :icon="getPriorityIcon(report.priority)" />
                                    {{ getPriorityLabel(report.priority) }}
                                </span>
                            </td>

                            <!-- Status -->
                            <td class="status-cell">
                                <span class="status-badge" :class="report.isResolved ? 'resolved' : 'pending'">
                                    <Icon
                                        :icon="report.isResolved ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'" />
                                    {{ report.isResolved ? 'Résolu' : 'En attente' }}
                                </span>
                            </td>

                            <!-- Date -->
                            <td class="date-cell">
                                <div class="date-info">
                                    <span class="date-relative">{{ getRelativeTime(report.createdAt) }}</span>
                                </div>
                            </td>

                            <!-- Actions -->
                            <td class="actions-cell">
                                <div class="action-buttons">
                                    <button @click="viewDetails(report)" class="btn-action view"
                                        title="Voir les détails">
                                        <Icon icon="solar:eye-bold" />
                                    </button>

                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
                    <Icon icon="solar:alt-arrow-left-bold" />
                    Précédent
                </button>

                <div class="pagination-pages">
                    <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                        :class="['pagination-page', { active: currentPage === page }]">
                        {{ page }}
                    </button>
                </div>

                <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
                    Suivant
                    <Icon icon="solar:alt-arrow-right-bold" />
                </button>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import type { BugReportsInterface } from '@/interfaces/bug-reports.interface';
import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { debounce } from 'lodash';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const bugReports = ref<BugReportsInterface[]>([]);
const totalBugReports = ref<number>(0);
const errorServer = ref<string>("");
const loading = ref<boolean>(false);
const perPage = ref<number>(10);
const currentPage = ref<number>(1);
const priorityFilter = ref<string>("");
const typeFilter = ref<string>("");
const isResolvedFilter = ref<boolean | null>(null);
const reporterMatriculeFilter = ref<string>("");

const typeOptions = [
    { value: 'bug', label: '🐛 Bug', icon: 'solar:bug-bold-duotone' },
    { value: 'feature', label: '✨ Fonctionnalité', icon: 'solar:magic-stick-3-bold-duotone' },
    { value: 'improvement', label: '📈 Amélioration', icon: 'solar:chart-2-bold-duotone' },
    { value: 'other', label: '💬 Autre', icon: 'solar:question-circle-bold-duotone' }
];

const priorityOptions = [
    { value: 'low', label: '🟢 Basse' },
    { value: 'medium', label: '🟡 Moyenne' },
    { value: 'high', label: '🟠 Haute' },
    { value: 'critical', label: '🔴 Critique' }
];

const fetchBugReports = async () => {
    loading.value = true;
    errorServer.value = "";
    try {
        const response = await axios.get("/api/v1/bugReports/all", {
            params: {
                perPage: perPage.value,
                page: currentPage.value,
                priority: priorityFilter.value,
                type: typeFilter.value,
                isResolved: isResolvedFilter.value,
                reporterMatricule: reporterMatriculeFilter.value
            }
        });
        console.log(response.data);

        bugReports.value = response.data.bugReports;
        totalBugReports.value = response.data.totalBugReports;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Une erreur est survenue lors de la récupération des rapports de bugs.";
    } finally {
        loading.value = false
    }
};

const totalPages = computed(() => {
    return Math.ceil(totalBugReports.value / perPage.value);
});

const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages.value, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
});

// Helper functions
const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
        bug: 'solar:bug-bold-duotone',
        feature: 'solar:magic-stick-3-bold-duotone',
        improvement: 'solar:chart-2-bold-duotone',
        other: 'solar:question-circle-bold-duotone'
    };
    return icons[type] || icons.other;
};

const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
        bug: 'Bug',
        feature: 'Fonctionnalité',
        improvement: 'Amélioration',
        other: 'Autre'
    };
    return labels[type] || 'Autre';
};

const getPriorityIcon = (priority: string) => {
    const icons: Record<string, string> = {
        low: 'solar:flag-bold',
        medium: 'solar:flag-bold',
        high: 'solar:danger-bold',
        critical: 'solar:fire-bold'
    };
    return icons[priority] || icons.low;
};

const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute',
        critical: 'Critique'
    };
    return labels[priority] || 'Basse';
};

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
        return 'À l\'instant';
    } else if (minutes < 60) {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours < 24) {
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (days < 7) {
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else if (weeks < 4) {
        return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else if (months < 12) {
        return `Il y a ${months} mois`;
    } else {
        return `Il y a ${years} an${years > 1 ? 's' : ''}`;
    }
};

const resetFilters = () => {
    typeFilter.value = "";
    priorityFilter.value = "";
    isResolvedFilter.value = null;
    reporterMatriculeFilter.value = "";
    currentPage.value = 1;
};
const router = useRouter();

const viewDetails = (report: BugReportsInterface) => {
    router.push(`/admin/bug-reports/${report._id}`);
};


onMounted(() => {
    fetchBugReports();
});

const debouncedFetchBugReports = debounce(fetchBugReports, 300);

watch([perPage, currentPage, priorityFilter, typeFilter, isResolvedFilter, reporterMatriculeFilter], async () => {
    await debouncedFetchBugReports()
})

</script>

<style scoped>
/* Page Layout */
.bug-reports-admin-page {
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.page-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.header-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    flex-shrink: 0;
}

.header-text {
    flex: 1;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
}

.page-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
}

.header-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
    font-size: 2rem;
    color: var(--primary-color);
}

.stat-icon.success {
    color: var(--success);
}

.stat-icon.warning {
    color: var(--warning);
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

/* Filters */
.filters-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 2px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filters-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
    align-items: end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.search-group {
    grid-column: span 2;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
}

.filter-label svg {
    font-size: 1.125rem;
    color: var(--primary-color);
}

.filter-select,
.filter-input {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9375rem;
    color: var(--text-dark);
    background: white;
    transition: all 0.2s ease;
    font-family: inherit;
}

.filter-select:focus,
.filter-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.filter-select:hover,
.filter-input:hover {
    border-color: var(--primary-color);
}

.filter-select.small {
    max-width: 120px;
}

/* Table Section */
.table-section {
    animation: slideUp 0.4s ease;
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

.bug-reports-table-container {
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bug-reports-table {
    width: 100%;
    border-collapse: collapse;
}

/* Table Header */
thead {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
}

th.actions-column {
    text-align: center;
}

/* Table Body */
tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

tbody tr:hover {
    background: #f8fafc;
}

tbody tr.resolved {
    opacity: 0.7;
}

tbody tr.resolved:hover {
    opacity: 0.85;
}

td {
    padding: 1rem 1.25rem;
    vertical-align: middle;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem !important;
    color: var(--text-secondary);
}

.empty-state svg {
    font-size: 4rem;
    opacity: 0.3;
    margin-bottom: 1rem;
}

.empty-state p {
    font-size: 1.125rem;
    margin: 0;
}

/* Type Cell */
.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.type-badge svg {
    font-size: 1.125rem;
}

.type-badge.type-bug {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.type-badge.type-feature {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
}

.type-badge.type-improvement {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.type-badge.type-other {
    background: rgba(107, 114, 128, 0.1);
    color: #4b5563;
}

/* Title Cell */
.title-cell {
    min-width: 300px;
    max-width: 400px;
}

.report-title h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.375rem 0;
    line-height: 1.4;
}

.report-description {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

/* Reporter Cell */
.reporter-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.reporter-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
}

.reporter-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.reporter-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reporter-matricule {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Priority Cell */
.priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.priority-badge svg {
    font-size: 1rem;
}

.priority-badge.priority-low {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.priority-badge.priority-medium {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.priority-badge.priority-high {
    background: rgba(249, 115, 22, 0.1);
    color: #ea580c;
}

.priority-badge.priority-critical {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

/* Status Cell */
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.status-badge svg {
    font-size: 1.125rem;
}

.status-badge.resolved {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

/* Date Cell */
.date-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date-main {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
}

.date-time {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Actions Cell */
.actions-cell {
    text-align: center;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.btn-action {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-action svg {
    font-size: 1.125rem;
}

.btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-action.view {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.btn-action.view:hover {
    background: var(--primary-color);
    color: white;
}

.btn-action.resolve {
    border-color: var(--success);
    color: var(--success);
}

.btn-action.resolve:hover {
    background: var(--success);
    color: white;
}

.btn-action.reopen {
    border-color: var(--warning);
    color: var(--warning);
}

.btn-action.reopen:hover {
    background: var(--warning);
    color: white;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

.pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-pages {
    display: flex;
    gap: 0.5rem;
}

.pagination-page {
    width: 40px;
    height: 40px;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-page:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.pagination-page.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

/* Responsive */
@media (max-width: 1400px) {
    .title-cell {
        max-width: 300px;
    }
}

@media (max-width: 1200px) {
    .bug-reports-table-container {
        overflow-x: auto;
    }

    .bug-reports-table {
        min-width: 1100px;
    }

    .search-group {
        grid-column: span 1;
    }
}

@media (max-width: 768px) {
    .bug-reports-admin-page {
        padding: 1rem;
    }

    .page-header {
        padding: 1.5rem;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }

    .header-stats {
        grid-template-columns: 1fr;
    }

    .filters-container {
        grid-template-columns: 1fr;
    }

    .search-group {
        grid-column: span 1;
    }

    .pagination {
        flex-wrap: wrap;
    }

    .pagination-pages {
        order: 3;
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
    }
}

<style scoped>

/* Page Layout */
.bug-reports-admin-page {
    padding: 2rem;
    max-width: 1600px;
    margin: 0 auto;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.page-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 2px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.header-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    flex-shrink: 0;
}

.header-text {
    flex: 1;
}

.page-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
}

.page-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
}

.header-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: all 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
    font-size: 2rem;
    color: var(--primary-color);
}

.stat-icon.success {
    color: var(--success);
}

.stat-icon.warning {
    color: var(--warning);
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
}

/* Filters */
.filters-section {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 2px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filters-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
    align-items: end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.search-group {
    grid-column: span 2;
}

.filter-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
}

.filter-label svg {
    font-size: 1.125rem;
    color: var(--primary-color);
}

.filter-select,
.filter-input {
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9375rem;
    color: var(--text-dark);
    background: white;
    transition: all 0.2s ease;
    font-family: inherit;
}

.filter-select:focus,
.filter-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.filter-select:hover,
.filter-input:hover {
    border-color: var(--primary-color);
}

.filter-select.small {
    max-width: 120px;
}

/* Table Section */
.table-section {
    animation: slideUp 0.4s ease;
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

.bug-reports-table-container {
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.bug-reports-table {
    width: 100%;
    border-collapse: collapse;
}

/* Table Header */
thead {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
}

th.actions-column {
    text-align: center;
}

/* Table Body */
tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

tbody tr:hover {
    background: #f8fafc;
}

tbody tr.resolved {
    opacity: 0.7;
}

tbody tr.resolved:hover {
    opacity: 0.85;
}

td {
    padding: 1rem 1.25rem;
    vertical-align: middle;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem !important;
    color: var(--text-secondary);
}

.empty-state svg {
    font-size: 4rem;
    opacity: 0.3;
    margin-bottom: 1rem;
}

.empty-state p {
    font-size: 1.125rem;
    margin: 0;
}

/* Type Cell */
.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.type-badge svg {
    font-size: 1.125rem;
}

.type-badge.type-bug {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

.type-badge.type-feature {
    background: rgba(59, 130, 246, 0.1);
    color: #2563eb;
}

.type-badge.type-improvement {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.type-badge.type-other {
    background: rgba(107, 114, 128, 0.1);
    color: #4b5563;
}

/* Title Cell */
.title-cell {
    min-width: 300px;
    max-width: 400px;
}

.report-title h4 {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.375rem 0;
    line-height: 1.4;
}

.report-description {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

/* Reporter Cell */
.reporter-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.reporter-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    flex-shrink: 0;
}

.reporter-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.reporter-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.reporter-matricule {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Priority Cell */
.priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.priority-badge svg {
    font-size: 1rem;
}

.priority-badge.priority-low {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.priority-badge.priority-medium {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

.priority-badge.priority-high {
    background: rgba(249, 115, 22, 0.1);
    color: #ea580c;
}

.priority-badge.priority-critical {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
}

/* Status Cell */
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    white-space: nowrap;
}

.status-badge svg {
    font-size: 1.125rem;
}

.status-badge.resolved {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #d97706;
}

/* Date Cell */
.date-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date-main {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-dark);
}

.date-time {
    font-size: 0.75rem;
    color: var(--text-secondary);
}

/* Actions Cell */
.actions-cell {
    text-align: center;
}

.action-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
}

.btn-action {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-action svg {
    font-size: 1.125rem;
}

.btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-action.view {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.btn-action.view:hover {
    background: var(--primary-color);
    color: white;
}

.btn-action.resolve {
    border-color: var(--success);
    color: var(--success);
}

.btn-action.resolve:hover {
    background: var(--success);
    color: white;
}

.btn-action.reopen {
    border-color: var(--warning);
    color: var(--warning);
}

.btn-action.reopen:hover {
    background: var(--warning);
    color: white;
}

/* Pagination */
.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

.pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-pages {
    display: flex;
    gap: 0.5rem;
}

.pagination-page {
    width: 40px;
    height: 40px;
    border: 2px solid #e2e8f0;
    background: white;
    color: var(--text-dark);
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-page:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.pagination-page.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

/* Responsive */
@media (max-width: 1400px) {
    .title-cell {
        max-width: 300px;
    }
}

@media (max-width: 1200px) {
    .bug-reports-table-container {
        overflow-x: auto;
    }

    .bug-reports-table {
        min-width: 1100px;
    }

    .search-group {
        grid-column: span 1;
    }
}

@media (max-width: 768px) {
    .bug-reports-admin-page {
        padding: 1rem;
    }

    .page-header {
        padding: 1.5rem;
    }

    .header-content {
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 1.5rem;
    }

    .header-stats {
        grid-template-columns: 1fr;
    }

    .filters-container {
        grid-template-columns: 1fr;
    }

    .search-group {
        grid-column: span 1;
    }

    .pagination {
        flex-wrap: wrap;
    }

    .pagination-pages {
        order: 3;
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
    }
}

/* Additional Styles */
.btn-reset-filters {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-dark);
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: inherit;
}

.btn-reset-filters:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.05);
}

.btn-reset-filters svg {
    font-size: 1.125rem;
}

.date-relative {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
}
</style>
