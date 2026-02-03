<template>
    <div class="student-card" :class="{ 'restricted': student.isRestricted }">
        <!-- Header avec statuts -->
        <div class="card-header">
            <div class="student-info">
                <div class="student-avatar">
                    {{ student.firstName.charAt(0) }}{{ student.name.charAt(0) }}
                </div>
                <div class="student-details">
                    <h3 class="student-name">{{ student.firstName }} {{ student.name }}</h3>
                    <p class="student-matricule">{{ student.matricule }}</p>
                </div>
            </div>

            <!-- Badges de statut -->
            <div class="status-badges">
                <span v-if="student.verified" class="badge verified">
                    <Icon icon="material-symbols:verified" />
                    Vérifié
                </span>
                <span v-else class="badge not-verified">
                    <Icon icon="material-symbols:error" />
                    Non vérifié
                </span>

                <span v-if="student.isRestricted" class="badge restricted">
                    <Icon icon="material-symbols:lock" />
                    Restreint
                </span>
            </div>
        </div>

        <!-- Informations académiques -->
        <div class="card-body">
            <div class="info-row">
                <div class="info-item">
                    <Icon icon="material-symbols:school" class="info-icon" />
                    <div class="info-content">
                        <span class="info-label">Filière</span>
                        <span class="info-value">{{ student.field.toUpperCase() }}</span>
                    </div>
                </div>
                <div class="info-item">
                    <Icon icon="material-symbols:workspace-premium" class="info-icon" />
                    <div class="info-content">
                        <span class="info-label">Niveau</span>
                        <span class="info-value">{{ student.level }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="card-actions">

            <button @click="viewDetails" class="btn-action primary">
                <Icon icon="material-symbols:visibility" />
                <span>Voir détails</span>
            </button>
        </div>

        <!-- Indicateur visuel de restriction -->
        <div v-if="student.isRestricted" class="restricted-overlay">
            <Icon icon="material-symbols:lock" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type StudentInterface from '@/interfaces/student.intefaces';

const props = defineProps<{
    student: StudentInterface
}>()

const emit = defineEmits<{
    (e: 'toggleRestriction', student: StudentInterface): void;
    (e: 'viewDetails', student: StudentInterface): void;
}>()

const toggleRestriction = () => {
    emit('toggleRestriction', props.student);
}

const viewDetails = () => {
    emit('viewDetails', props.student);
}
</script>

<style scoped>
.student-card {
    position: relative;
    background: white;
    border-radius: 16px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.student-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--primary-color);
}

.student-card.restricted {
    border-color: var(--error);
    background: rgba(var(--error-rgb), 0.1);
}

/* Header */
.card-header {
    padding: 1.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
}

.student-info {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.student-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.student-details {
    flex: 1;
    min-width: 0;
}

.student-name {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-dark);
    word-wrap: break-word;
    line-height: 1.3;
}

.student-matricule {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 600;
}

/* Status Badges */
.status-badges {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-end;
}

.badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.badge svg {
    font-size: 1rem;
}

.badge.verified {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--success-dark);
}

.badge.not-verified {
    background: rgba(var(--warning-rgb), 0.15);
    color: var(--warning-dark);
}

.badge.restricted {
    background: rgba(var(--error-rgb), 0.15);
    color: var(--error);
}

/* Body */
.card-body {
    padding: 1.5rem;
}

.info-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.info-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--primary-extra-light);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.info-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 0.95rem;
    color: var(--text-dark);
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Actions */
.card-actions {
    padding: 1rem 1.5rem 1.5rem;
    display: flex;
    gap: 0.75rem;
    border-top: 1px solid #e2e8f0;
}

.btn-action {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    color: var(--text-dark);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-action svg {
    font-size: 1.25rem;
}

.btn-action:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-action.restrict {
    border-color: var(--error);
    color: var(--error);
}

.btn-action.restrict:hover {
    background: var(--error);
    color: white;
}

.btn-action.unrestrict {
    border-color: var(--success);
    color: var(--success);
}

.btn-action.unrestrict:hover {
    background: var(--success);
    color: white;
}

.btn-action.primary {
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
}

.btn-action.primary:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
    box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.4);
}

/* Restricted Overlay */
.restricted-overlay {
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, transparent 50%, rgba(var(--error-rgb), 0.1) 50%);
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding: 0.5rem;
}

.restricted-overlay svg {
    font-size: 1.5rem;
    color: var(--error);
    opacity: 0.3;
}

/* Responsive */
@media (max-width: 640px) {
    .card-header {
        flex-direction: column;
    }

    .status-badges {
        align-items: flex-start;
        flex-direction: row;
        flex-wrap: wrap;
    }

    .info-row {
        grid-template-columns: 1fr;
    }

    .card-actions {
        flex-direction: column;
    }
}
</style>