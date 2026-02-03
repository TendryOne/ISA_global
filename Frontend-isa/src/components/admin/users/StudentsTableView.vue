<template>
    <div class="students-table-container">
        <table class="students-table">
            <thead>
                <tr>
                    <th @click="$emit('sort', 'name')" class="sortable">
                        <div class="th-content">
                            <span>Étudiant</span>
                            <Icon icon="material-symbols:swap-vert" class="sort-icon" />
                        </div>
                    </th>
                    <th @click="$emit('sort', 'field')" class="sortable">
                        <div class="th-content">
                            <span>Filière</span>
                            <Icon icon="material-symbols:swap-vert" class="sort-icon" />
                        </div>
                    </th>
                    <th @click="$emit('sort', 'level')" class="sortable">
                        <div class="th-content">
                            <span>Niveau</span>
                            <Icon icon="material-symbols:swap-vert" class="sort-icon" />
                        </div>
                    </th>
                    <th>Statuts</th>
                    <th class="actions-column">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="student in students" :key="student._id" class="student-row"
                    :class="{ 'restricted': student.isRestricted }">
                    <!-- Étudiant -->
                    <td class="student-cell">
                        <div class="student-info">
                            <div class="student-avatar">
                                {{ student.firstName.charAt(0) }}{{ student.name.charAt(0) }}
                            </div>
                            <div class="student-details">
                                <span class="student-name">{{ student.firstName }} {{ student.name }}</span>
                                <span class="student-matricule">{{ student.matricule }}</span>
                            </div>
                        </div>
                    </td>

                    <!-- Filière -->
                    <td>
                        <span class="field-badge">{{ student.field.toUpperCase() }}</span>
                    </td>

                    <!-- Niveau -->
                    <td>
                        <span class="level-badge">{{ student.level }}</span>
                    </td>

                    <!-- Statuts -->
                    <td>
                        <div class="status-badges">
                            <span v-if="student.verified" class="badge verified" title="Vérifié">
                                <Icon icon="material-symbols:verified" />
                            </span>
                            <span v-else class="badge not-verified" title="Non vérifié">
                                <Icon icon="material-symbols:error" />
                            </span>

                            <span v-if="student.isRestricted" class="badge restricted" title="Restreint">
                                <Icon icon="material-symbols:lock" />
                            </span>
                        </div>
                    </td>

                    <!-- Actions -->
                    <td class="actions-cell">
                        <div class="action-buttons">


                            <button @click="$emit('viewDetails', student)" class="btn-action primary"
                                title="Voir détails">
                                <Icon icon="material-symbols:visibility" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type StudentInterface from '@/interfaces/student.intefaces';

defineProps<{
    students: StudentInterface[]
}>()

defineEmits<{
    (e: 'toggleRestriction', student: StudentInterface): void;
    (e: 'viewDetails', student: StudentInterface): void;
    (e: 'sort', field: string): void;
}>()
</script>

<style scoped>
.students-table-container {
    background: white;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.students-table {
    width: 100%;
    border-collapse: collapse;
}

/* Header */
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
}

th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background 0.2s ease;
}

th.sortable:hover {
    background: rgba(var(--primary-rgb), 0.05);
}

.th-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.sort-icon {
    font-size: 1.25rem;
    opacity: 0.4;
    transition: opacity 0.2s ease;
}

th.sortable:hover .sort-icon {
    opacity: 0.8;
}

th.actions-column {
    text-align: center;
}

/* Rows */
tbody tr {
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

tbody tr:hover {
    background: #f8fafc;
}

tbody tr.restricted {
    border-left: 4px solid var(--error);
    background: rgba(var(--error-rgb), 0.05);
}

tbody tr.restricted:hover {
    background: rgba(var(--error-rgb), 0.1);
}

td {
    padding: 1rem 1.25rem;
    vertical-align: middle;
}

/* Student Cell */
.student-cell {
    min-width: 250px;
}

.student-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.student-avatar {
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

.student-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.student-name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.student-matricule {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
}

/* Badges */
.field-badge,
.level-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
}

.field-badge {
    background: rgba(var(--primary-rgb), 0.1);
    color: var(--primary-dark);
}

.level-badge {
    background: rgba(var(--info-rgb), 0.1);
    color: var(--info-dark);
}

/* Status Badges */
.status-badges {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: help;
}

.badge svg {
    font-size: 1.125rem;
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

/* Actions */
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
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

.btn-action.primary:hover {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
}

/* Responsive */
@media (max-width: 1024px) {
    .students-table-container {
        overflow-x: auto;
    }

    .students-table {
        min-width: 900px;
    }
}
</style>
