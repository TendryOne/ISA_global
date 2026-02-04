<template>
    <div class="students-container" v-if="!route.params.student">


        <ErrorComponent v-if="errorServer" :message="errorServer" @retry="fetchStudentList" />
        <SpinningLoader v-if="loading" />

        <div v-if="!loading && !errorServer" class="content">
            <BreadCrumbsBack />
            <!-- Header -->
            <header class="page-header">
                <div class="header-info">
                    <div class="title-section">
                        <h1 class="page-title">Étudiants - {{ promotion?.name }}</h1>
                        <div class="title-decoration"></div>
                    </div>
                    <div class="promotion-status">
                        <span :class="['status-badge', promotion?.isActive ? 'active' : 'inactive']">
                            <Icon :icon="promotion?.isActive ? 'mdi:check-circle' : 'mdi:pause-circle'" />
                            {{ promotion?.isActive ? 'Promotion Active' : 'Promotion Inactive' }}
                        </span>
                    </div>
                </div>
            </header>

            <!-- Tableau des étudiants -->
            <div class="table-section">
                <div class="table-header">
                    <h2 class="table-title">Liste des Étudiants</h2>
                    <div class="table-stats">
                        <span class="stat-item">
                            <Icon icon="mdi:account-group" class="stat-icon" />
                            {{ students.length }} étudiant{{ students.length !== 1 ? 's' : '' }}
                        </span>
                    </div>
                </div>

                <div class="table-container">
                    <table class="students-table">
                        <thead>
                            <tr>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:identifier" class="header-icon" />
                                        Matricule
                                    </span>
                                </th>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:account" class="header-icon" />
                                        Nom complet
                                    </span>
                                </th>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:email" class="header-icon" />
                                        Email
                                    </span>
                                </th>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:progress-clock" class="header-icon" />
                                        Statut Parcours
                                    </span>
                                </th>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:alert" class="header-icon" />
                                        Alerte
                                    </span>
                                </th>
                                <th class="column-header">
                                    <span class="header-content">
                                        <Icon icon="mdi:eye" class="header-icon" />
                                        Actions
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="data in studentsData" :key="data.student._id" :class="data.rowClass"
                                class="table-row">
                                <td class="matricule cell-content">
                                    <div class="cell-wrapper">
                                        <i class="fa-solid fa-id-badge"></i>
                                        {{ data.student.matricule }}
                                    </div>
                                </td>
                                <td class="name cell-content">
                                    <div class="cell-wrapper">
                                        <Icon icon="mdi:account" class="cell-icon" />
                                        {{ data.student.firstName }} {{ data.student.name }}
                                    </div>
                                </td>
                                <td class="email cell-content">
                                    <div class="cell-wrapper">
                                        <Icon icon="mdi:email" class="cell-icon" />
                                        {{ data.student.email }}
                                    </div>
                                </td>
                                <td class="status-cell cell-content">
                                    <span :class="['status-badge', data.statusClass]">
                                        <Icon :icon="data.statusIcon" class="status-icon" />
                                        {{ data.statusLabel }}
                                    </span>
                                </td>
                                <td class="alert-cell cell-content">
                                    <div class="alert-wrapper">
                                        <span v-if="data.hasAlert" class="alert-indicator" :title="data.alertMessage">
                                            <Icon icon="mdi:alert-circle" class="alert-icon" />
                                        </span>
                                        <Icon v-else-if="data.isCompleted" icon="mdi:check-circle"
                                            class="success-indicator" title="Parcours terminé" />
                                        <span v-else class="no-alert">-</span>
                                    </div>
                                </td>
                                <td class="actions-cell cell-content">
                                    <button class="action-btn view" @click="viewStudent(data.student)">
                                        <Icon icon="mdi:eye" class="btn-icon" />
                                        Voir
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="students.length === 0" class="empty-state">
                        <div class="empty-illustration">
                            <Icon icon="mdi:account-off" class="empty-icon" />
                        </div>
                        <h3 class="empty-title">Aucun étudiant</h3>
                        <p class="empty-description">Aucun étudiant n'est inscrit dans cette promotion pour le moment.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Légende -->
            <div class="legend-section">
                <div class="legend-header">
                    <h3 class="legend-title">
                        <Icon icon="mdi:information" class="legend-title-icon" />
                        Légende des statuts
                    </h3>
                </div>
                <div class="legend-grid">
                    <div class="legend-card" v-for="item in legendItems" :key="item.status" :class="item.status">
                        <div class="legend-icon-container">
                            <Icon :icon="item.icon" class="legend-icon" />
                        </div>
                        <div class="legend-content">
                            <span class="legend-status">{{ item.label }}</span>
                            <p class="legend-description">{{ item.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import type PromotionInterface from '@/interfaces/promotion.interface';
import type StudentInterface from '@/interfaces/student.intefaces';
import axios from 'axios';
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface ApiRootData {
    students: StudentInterface[];
    promotion: PromotionInterface;
}

const promotion = ref<PromotionInterface | null>(null)
const route = useRoute()
const router = useRouter();
const loading = ref<boolean>(false);
const students = ref<StudentInterface[]>([]);
const errorServer = ref<string>("")

const legendItems = [
    {
        status: 'in-progress',
        label: 'En cours',
        description: 'L\'étudiant suit actuellement cette promotion',
        icon: 'mdi:progress-clock'
    },
    {
        status: 'completed',
        label: 'Terminé',
        description: 'L\'étudiant a complété cette promotion',
        icon: 'mdi:check-circle'
    },
    {
        status: 'repeated',
        label: 'Redoublant',
        description: 'L\'étudiant redouble cette promotion',
        icon: 'mdi:repeat'
    },
    {
        status: 'dropped',
        label: 'Abandonné',
        description: 'L\'étudiant a quitté l\'institution pendant cette promotion',
        icon: 'mdi:close-circle'
    }
];

const fetchStudentList = async () => {
    try {
        loading.value = true;
        const response = await axios.get<ApiRootData>(`/api/v1/students/parcours/${route.params.promotion}`);
        students.value = response.data.students;
        promotion.value = response.data.promotion;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Erreur lors du chargement"
    } finally {
        loading.value = false;
    }
}

// Obtenir le parcours de l'étudiant pour cette promotion
const getStudentParcours = (student: StudentInterface) => {
    if (!promotion.value) return null
    return student.parcours?.find(p => {
        const promotionId = typeof p.promotion === 'string' ? p.promotion : p.promotion._id
        return promotionId === promotion.value!._id
    })
}

// Vérifier si l'étudiant est en cours dans cette promotion
const isCurrentStudentPromotionInProgress = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    return parcours?.status === 'in progress'
}

// Vérifier si l'étudiant a terminé
const isCompleted = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    return parcours?.status === 'completed' && !promotion.value?.isActive
}

// Vérifier s'il y a une alerte (promotion inactive mais étudiant encore en cours)
const hasAlert = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!promotion.value || !parcours) return false
    return !promotion.value.isActive && parcours.status === 'in progress'
}

// Message d'alerte
const getAlertMessage = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!parcours) return ''
    if (!promotion.value?.isActive && parcours.status === 'in progress') {
        return '⚠️ Promotion inactive mais étudiant encore en cours'
    }
    return ''
}

// Obtenir le libellé du statut
const getStatusLabel = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!parcours) return 'Aucun parcours'

    const statusLabels: Record<string, string> = {
        'in progress': 'En cours',
        'completed': 'Terminé',
        'repeated': 'Redoublant',
        'dropped': 'Abandonné'
    }

    return statusLabels[parcours.status] || parcours.status
}

// Obtenir la classe CSS du statut
const getStatusClass = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!parcours) return 'no-status'
    return parcours.status.replace(' ', '-')
}

// Obtenir l'icône du statut
const getStatusIcon = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!parcours) return 'mdi:help-circle'

    const statusIcons: Record<string, string> = {
        'in progress': 'mdi:progress-clock',
        'completed': 'mdi:check-circle',
        'repeated': 'mdi:repeat',
        'dropped': 'mdi:close-circle'
    }

    return statusIcons[parcours.status] || 'mdi:help-circle'
}

// Classe de ligne selon le statut
const getRowClass = (student: StudentInterface) => {
    const parcours = getStudentParcours(student)
    if (!parcours) return ''

    if (hasAlert(student)) return 'row-alert'
    if (parcours.status === 'completed') return 'row-completed'
    if (parcours.status === 'dropped') return 'row-dropped'

    return ''
}

// 🚀 OPTIMISATION : Computed pour pré-calculer toutes les données des étudiants
const studentsData = computed(() => {
    return students.value.map(student => {
        const parcours = getStudentParcours(student)
        const alertStatus = hasAlert(student)
        const completedStatus = isCompleted(student)

        return {
            student,
            parcours,
            hasAlert: alertStatus,
            isCompleted: completedStatus,
            statusLabel: getStatusLabel(student),
            statusClass: getStatusClass(student),
            statusIcon: getStatusIcon(student),
            rowClass: getRowClass(student),
            alertMessage: alertStatus ? getAlertMessage(student) : ''
        }
    })
})

// Voir les détails de l'étudiant
const viewStudent = (student: StudentInterface) => {
    router.push(`/admin/grades/${route.params.field}/${route.params.level}/${route.params.promotion}/${student._id}`)
}

watchEffect(async () => {
    if (!route.params.student) {
        await fetchStudentList()
    }
})
</script>

<style scoped>
.students-container {
    max-width: 1400px;
    margin: 0 auto;
    background: linear-gradient(135deg, var(--background-light) 0%, #f8fafc 50%, #f1f5f9 100%);
    min-height: 100vh;
}

.content {
    background: var(--white);
    border-radius: 1.5rem;
    padding: 2.5rem;
    box-shadow:
        0 10px 40px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
}

.page-header {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(80, 134, 193, 0.1);
    position: relative;
}

.page-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, var(--primary-color), #7ba4d4);
    border-radius: 3px;
}

.header-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.title-section {
    position: relative;
}

.page-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, var(--text-primary) 0%, #4a5568 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
}

.title-decoration {
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), #7ba4d4);
    border-radius: 2px;
    opacity: 0.8;
}

.promotion-status {
    display: flex;
    align-items: center;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 2rem;
    font-weight: 600;
    font-size: 0.875rem;
    backdrop-filter: blur(10px);
    border: 1px solid;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.status-badge.active {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%);
    color: #16a34a;
    border-color: rgba(34, 197, 94, 0.3);
}

.status-badge.inactive {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
    color: #dc2626;
    border-color: rgba(239, 68, 68, 0.3);
}

.table-section {
    margin-top: 2rem;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.05) 0%, rgba(123, 164, 212, 0.05) 100%);
    border-radius: 1rem;
    border: 1px solid rgba(80, 134, 193, 0.1);
}

.table-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.table-stats {
    display: flex;
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--white);
    border-radius: 0.75rem;
    font-weight: 600;
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-icon {
    color: var(--primary-color);
    font-size: 1.2rem;
}

.table-container {
    margin-top: 1rem;
    overflow-x: auto;
    border-radius: 1rem;
    border: 1px solid rgba(80, 134, 193, 0.1);
    background: var(--white);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.students-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 1rem;
    overflow: hidden;
}

.students-table thead {
    background: linear-gradient(135deg, var(--primary-color) 0%, #7ba4d4 100%);
    backdrop-filter: blur(10px);
}

.column-header {
    padding: 1.25rem 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--white);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
}

.column-header::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 60%;
    background: rgba(255, 255, 255, 0.2);
}

.column-header:last-child::after {
    display: none;
}

.header-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.header-icon {
    font-size: 1.1rem;
    opacity: 0.9;
}

.table-row {
    border-bottom: 1px solid rgba(80, 134, 193, 0.1);
    transition: all 0.3s ease;
    position: relative;
}

.table-row:hover {
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.03) 0%, rgba(123, 164, 212, 0.03) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.table-row.row-alert {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.08) 0%, rgba(251, 146, 60, 0.02) 100%);
    border-left: 4px solid #fb923c;
}

.table-row.row-completed {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.01) 100%);
}

.table-row.row-dropped {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.01) 100%);
    opacity: 0.8;
}

.cell-content {
    padding: 1.25rem 1rem;
    position: relative;
}

.cell-content::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 60%;
    background: rgba(80, 134, 193, 0.1);
}

.cell-content:last-child::after {
    display: none;
}

.cell-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.cell-icon {
    color: var(--primary-color);
    font-size: 1.1rem;
    opacity: 0.7;
}

.matricule {
    font-weight: 700;
    color: var(--primary-color);
    font-family: 'Courier New', monospace;
    letter-spacing: -0.02em;
}

.name {
    font-weight: 600;
    color: var(--text-primary);
}

.email {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.status-cell {
    text-align: center;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 1rem;
    font-weight: 600;
    font-size: 0.8rem;
    border: 1px solid;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.status-badge.in-progress {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%);
    color: #1d4ed8;
    border-color: rgba(59, 130, 246, 0.3);
}

.status-badge.completed {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%);
    color: #15803d;
    border-color: rgba(34, 197, 94, 0.3);
}

.status-badge.repeated {
    background: linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.04) 100%);
    color: #c2410c;
    border-color: rgba(251, 146, 60, 0.3);
}

.status-badge.dropped {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.04) 100%);
    color: #b91c1c;
    border-color: rgba(239, 68, 68, 0.3);
}

.status-icon {
    font-size: 1rem;
}

.alert-cell {
    text-align: center;
}

.alert-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
}

.alert-indicator {
    cursor: help;
    animation: gentle-pulse 3s ease-in-out infinite;
}

.alert-icon {
    font-size: 1.4rem;
    color: #fb923c;
}

@keyframes gentle-pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 1;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

.success-indicator {
    color: #16a34a;
    font-size: 1.4rem;
    cursor: help;
}

.no-alert {
    color: var(--text-tertiary);
    font-style: italic;
}

.actions-cell {
    text-align: center;
}

.action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 0.75rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.action-btn:hover::before {
    left: 100%;
}

.action-btn.view {
    background: linear-gradient(135deg, var(--primary-color) 0%, #7ba4d4 100%);
    color: var(--white);
    box-shadow: 0 4px 15px rgba(80, 134, 193, 0.3);
}

.action-btn.view:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(80, 134, 193, 0.4);
}

.btn-icon {
    font-size: 1.1rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-secondary);
}

.empty-illustration {
    margin-bottom: 1.5rem;
}

.empty-icon {
    font-size: 5rem;
    opacity: 0.3;
    color: var(--primary-color);
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.5rem 0;
}

.empty-description {
    font-size: 1rem;
    opacity: 0.7;
    margin: 0;
}

.legend-section {
    margin-top: 3rem;
    padding: 2.5rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.05) 0%, rgba(123, 164, 212, 0.05) 100%);
    border-radius: 1.5rem;
    border: 1px solid rgba(80, 134, 193, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
}

.legend-header {
    margin-bottom: 2rem;
    text-align: center;
}

.legend-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    background: var(--white);
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.legend-title-icon {
    color: var(--primary-color);
    font-size: 1.3rem;
}

.legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.legend-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--white);
    border-radius: 1rem;
    border: 1px solid;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
}

.legend-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
}

.legend-card.in-progress::before {
    background: #3b82f6;
}

.legend-card.completed::before {
    background: #22c55e;
}

.legend-card.repeated::before {
    background: #fb923c;
}

.legend-card.dropped::before {
    background: #ef4444;
}

.legend-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.legend-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 0.75rem;
    background: rgba(80, 134, 193, 0.1);
}

.legend-card.in-progress .legend-icon-container {
    background: rgba(59, 130, 246, 0.1);
}

.legend-card.completed .legend-icon-container {
    background: rgba(34, 197, 94, 0.1);
}

.legend-card.repeated .legend-icon-container {
    background: rgba(251, 146, 60, 0.1);
}

.legend-card.dropped .legend-icon-container {
    background: rgba(239, 68, 68, 0.1);
}

.legend-icon {
    font-size: 1.5rem;
}

.legend-card.in-progress .legend-icon {
    color: #3b82f6;
}

.legend-card.completed .legend-icon {
    color: #22c55e;
}

.legend-card.repeated .legend-icon {
    color: #fb923c;
}

.legend-card.dropped .legend-icon {
    color: #ef4444;
}

.legend-content {
    flex: 1;
}

.legend-status {
    display: block;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.25rem;
}

.legend-card.in-progress .legend-status {
    color: #3b82f6;
}

.legend-card.completed .legend-status {
    color: #22c55e;
}

.legend-card.repeated .legend-status {
    color: #fb923c;
}

.legend-card.dropped .legend-status {
    color: #ef4444;
}

.legend-description {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.4;
}

@media (max-width: 1024px) {
    .students-container {
        padding: 1.5rem;
    }

    .content {
        padding: 2rem;
    }

    .page-title {
        font-size: 1.75rem;
    }

    .header-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .legend-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .students-container {
        padding: 1rem;
    }

    .content {
        padding: 1.5rem;
        border-radius: 1rem;
    }

    .page-title {
        font-size: 1.5rem;
    }

    .table-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .students-table {
        font-size: 0.85rem;
    }

    .students-table th,
    .students-table td {
        padding: 1rem 0.75rem;
    }

    .cell-wrapper {
        gap: 0.5rem;
    }

    .cell-icon {
        font-size: 1rem;
    }

    .legend-section {
        padding: 1.5rem;
    }

    .legend-card {
        padding: 1.25rem;
    }
}
</style>