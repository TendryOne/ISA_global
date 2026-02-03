<template>
    <div class="bug-report-details-page">
        <BreadCrumbsBack />

        <!-- Loading State -->
        <SpinningLoader v-if="loading" />

        <!-- Error State -->
        <ErrorComponent v-else-if="errorServer" :message="errorServer" @retry="fetchReport" />

        <!-- Report Details -->
        <div v-else-if="report" class="report-container">
            <!-- Header with Status -->
            <header class="report-header">
                <div class="header-top">
                    <div class="header-left">
                        <div class="type-badge" :class="`type-${report.type}`">
                            <Icon :icon="getTypeIcon(report.type)" />
                            <span>{{ getTypeLabel(report.type) }}</span>
                        </div>
                        <span class="priority-badge" :class="`priority-${report.priority}`">
                            <Icon :icon="getPriorityIcon(report.priority)" />
                            {{ getPriorityLabel(report.priority) }}
                        </span>
                    </div>
                    <div class="header-right">
                        <span class="status-badge" :class="report.isResolved ? 'resolved' : 'pending'">
                            <Icon :icon="report.isResolved ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'" />
                            {{ report.isResolved ? 'Résolu' : 'En attente' }}
                        </span>
                    </div>
                </div>

                <h1 class="report-title">{{ report.title }}</h1>

                <div class="report-meta">
                    <div class="meta-item">
                        <Icon icon="solar:calendar-bold-duotone" />
                        <span>{{ getRelativeTime(report.createdAt) }}</span>
                    </div>
                    <div class="meta-item">
                        <Icon icon="solar:hashtag-bold-duotone" />
                        <span>ID: {{ report._id.slice(-8) }}</span>
                    </div>
                </div>
            </header>

            <!-- Reporter Information -->
            <section class="report-section reporter-section">
                <div class="section-header">
                    <Icon icon="solar:user-bold-duotone" />
                    <h2>Rapporté par</h2>
                </div>
                <div class="reporter-card">
                    <div class="reporter-avatar">
                        {{ report.reporter.firstName.charAt(0) }}{{ report.reporter.name.charAt(0) }}
                    </div>
                    <div class="reporter-info">
                        <h3 class="reporter-name">{{ report.reporter.firstName }} {{ report.reporter.name }}</h3>
                        <p class="reporter-matricule">{{ report.reporterMatricule }}</p>
                        <p class="reporter-email">{{ report.reporter.email }}</p>
                    </div>
                </div>
            </section>

            <!-- Description -->
            <section class="report-section description-section">
                <div class="section-header">
                    <Icon icon="solar:document-text-bold-duotone" />
                    <h2>Description</h2>
                </div>
                <div class="description-content">
                    <QuillContentViewer :content="report.description" :downloadable="false" />
                </div>
            </section>

            <!-- Action Buttons -->
            <section class="report-actions">
                <button v-if="!report.isResolved" @click="markAsResolved" class="btn-action resolve"
                    :disabled="isUpdating">
                    <Icon icon="solar:check-circle-bold" />
                    <span>{{ isUpdating ? 'Traitement...' : 'Marquer comme résolu' }}</span>
                </button>
                <button v-else @click="reopenReport" class="btn-action reopen" :disabled="isUpdating">
                    <Icon icon="solar:restart-bold" />
                    <span>{{ isUpdating ? 'Traitement...' : 'Rouvrir le rapport' }}</span>
                </button>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import QuillContentViewer from '@/components/EDITOR/QuillContentViewer.vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import type { BugReportsInterface } from '@/interfaces/bug-reports.interface';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const reportId = route.params.reportId as string;
const loading = ref<boolean>(false);
const isUpdating = ref<boolean>(false);
const errorServer = ref<string>('')
const report = ref<BugReportsInterface | null>(null)

const fetchReport = async () => {
    loading.value = true;
    errorServer.value = '';
    try {
        const response = await axios.get(`/api/v1/bugReports/report/${reportId}`);
        report.value = response.data;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Erreur lors du chargement du rapport";
    } finally {
        loading.value = false;
    }
}

const markAsResolved = async () => {
    if (!report.value) return;
    isUpdating.value = true;
    try {
        await axios.patch(`/api/v1/bugReports/${reportId}`, { isResolved: true });
        report.value.isResolved = true;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Erreur lors de la mise à jour";
    } finally {
        isUpdating.value = false;
    }
}

const reopenReport = async () => {
    if (!report.value) return;
    isUpdating.value = true;
    try {
        await axios.patch(`/api/v1/bugReports/${reportId}`, { isResolved: false });
        report.value.isResolved = false;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Erreur lors de la mise à jour";
    } finally {
        isUpdating.value = false;
    }
}

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

onMounted(() => {
    fetchReport();
});

</script>

<style scoped>
/* Page Layout */
.bug-report-details-page {
    padding: 2rem;
    max-width: 1200px;
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

/* Report Container */
.report-container {
    background: white;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Header */
.report-header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    padding: 2rem;
    border-bottom: 2px solid #e2e8f0;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.header-right {
    display: flex;
    align-items: center;
}

/* Type Badge */
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

/* Priority Badge */
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

/* Status Badge */
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
    background: rgba(16, 185, 129, 0.15);
    color: #059669;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.15);
    color: #d97706;
}

/* Title */
.report-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 1rem 0;
    line-height: 1.3;
}

/* Meta Information */
.report-meta {
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.meta-item svg {
    font-size: 1.125rem;
    color: var(--primary-color);
}

/* Sections */
.report-section {
    padding: 2rem;
    border-bottom: 2px solid #f1f5f9;
}

.report-section:last-of-type {
    border-bottom: none;
}

.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.section-header svg {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.section-header h2 {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

/* Reporter Section */
.reporter-card {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

.reporter-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    flex-shrink: 0;
}

.reporter-info {
    flex: 1;
}

.reporter-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
}

.reporter-matricule {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 600;
    margin: 0 0 0.25rem 0;
}

.reporter-email {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
}

/* Description Section */
.description-content {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
}

.description-content p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-dark);
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* Action Buttons */
.report-actions {
    padding: 2rem;
    background: #f8fafc;
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.btn-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid;
    font-family: inherit;
}

.btn-action svg {
    font-size: 1.25rem;
}

.btn-action:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-action.resolve {
    background: var(--success);
    border-color: var(--success);
    color: white;
}

.btn-action.resolve:hover:not(:disabled) {
    background: var(--success-dark);
    border-color: var(--success-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-action.reopen {
    background: var(--warning);
    border-color: var(--warning);
    color: white;
}

.btn-action.reopen:hover:not(:disabled) {
    background: var(--warning-dark);
    border-color: var(--warning-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
    .bug-report-details-page {
        padding: 1rem;
    }

    .report-header,
    .report-section,
    .report-actions {
        padding: 1.5rem;
    }

    .header-top {
        flex-direction: column;
        align-items: flex-start;
    }

    .header-right {
        width: 100%;
    }

    .status-badge {
        width: 100%;
        justify-content: center;
    }

    .report-title {
        font-size: 1.5rem;
    }

    .reporter-card {
        flex-direction: column;
        text-align: center;
    }

    .reporter-info {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .btn-action {
        width: 100%;
        justify-content: center;
    }

    .report-actions {
        flex-direction: column;
    }
}
</style>