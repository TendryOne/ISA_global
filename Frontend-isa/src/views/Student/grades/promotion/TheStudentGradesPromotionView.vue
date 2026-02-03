<template>
    <BreadCrumbsBack />
    <div class="grades-container">
        <div class="header">
            <div class="header-content">
                <Icon icon="material-symbols:school" class="header-icon" />
                <div class="header-text">
                    <div class="header-title-section">
                        <h1 class="header-title">Bulletin de Notes</h1>
                        <span v-if="promotionStatus" :class="['status-badge', promotionStatus.class]">
                            <Icon :icon="promotionStatus.badgeIcon" class="badge-icon" />
                            {{ promotionStatus.badgeLabel }}
                        </span>
                    </div>
                    <p class="header-subtitle">Relevé des notes par unité d'enseignement</p>
                </div>
            </div>
        </div>



        <!-- Avertissement et actions -->
        <div class="info-section">
            <div class="warning-card">
                <Icon icon="material-symbols:info" class="warning-icon" />
                <div class="warning-content">
                    <h3 class="warning-title">Notes indicatives</h3>
                    <p class="warning-text">
                        Ces notes sont <strong>virtuelles et indicatives</strong>. Elles ne prennent pas en compte
                        l'assiduité, la participation, et autres critères d'évaluation. Ce relevé n'a aucune valeur
                        officielle et ne peut remplacer un relevé de notes tamponné.
                    </p>
                    <p class="warning-text">
                        <strong>Pour obtenir votre relevé de notes officiel :</strong> Faites une demande auprès de
                        la scolarité ou via le site, puis récupérez-le en personne avec le tampon de l'établissement.
                    </p>
                </div>
            </div>
        </div>

        <div v-if="grades.length === 0" class="empty-state">
            <Icon icon="material-symbols:description-outline" class="empty-icon" />
            <p class="empty-text">Aucune note disponible pour cette promotion</p>
        </div>

        <div v-else>
            <!-- Section Légende -->
            <div class="legend-section">
                <h3 class="legend-title">
                    <Icon icon="material-symbols:help" class="legend-title-icon" />
                    Légende des statuts de notes
                </h3>
                <div class="legend-grid">
                    <div class="legend-item locked">
                        <div class="legend-icon-box">
                            <Icon icon="material-symbols:lock" class="legend-icon" />
                        </div>
                        <div class="legend-text">
                            <strong>Note officielle</strong>
                            <p>La note a été validée et verrouillée. Elle ne peut plus changer.</p>
                        </div>
                    </div>
                    <div class="legend-item changeable">
                        <div class="legend-icon-box">
                            <Icon icon="material-symbols:edit" class="legend-icon" />
                        </div>
                        <div class="legend-text">
                            <strong>Note provisoire</strong>
                            <p>La note peut encore être modifiée ou corrigée par le professeur.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-button">
                <ActionButton icon="mdi:document" @click="addRequest">
                    Demande de relevé de notes officiel
                </ActionButton>
            </div>
            <!-- Tableau des notes -->
            <div class="bulletin-table">
                <table>
                    <thead>
                        <tr>
                            <th class="module-col">Module</th>
                            <th class="grade-col">Examen</th>
                            <th class="grade-col">Rattrapage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="unit in grades" :key="unit.teachingUnit._id">
                            <!-- Ligne de l'unité d'enseignement -->
                            <tr class="unit-row">
                                <td colspan="3" class="unit-cell">
                                    <div class="unit-header-info">
                                        <div>
                                            <strong>{{ unit.teachingUnit.name }}</strong>
                                            <span class="unit-code">{{ unit.teachingUnit.code }}</span>
                                        </div>
                                        <span class="unit-credits">
                                            <Icon icon="material-symbols:workspace-premium" />
                                            {{ unit.teachingUnit.credits }} crédits
                                        </span>
                                    </div>
                                </td>
                            </tr>
                            <!-- Lignes des modules -->
                            <tr v-for="module in unit.modules" :key="module._id" class="module-row">
                                <td class="module-name">
                                    <div class="module-info">
                                        <span class="module-title">{{ module.title }}</span>
                                        <div class="module-meta">
                                            <span class="module-code-badge">{{ module.code }}</span>
                                            <span class="module-credits">
                                                <Icon icon="material-symbols:workspace-premium" />
                                                {{ module.credits }} crédits
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td class="grade-cell">
                                    <div v-if="hasNormalGrade(module)" class="grade-container"
                                        :class="getGradeStatus(module, 'normal')">
                                        <span class="grade" :class="getGradeClass(getNormalGrade(module)!)">
                                            {{ getNormalGrade(module)!.toFixed(2) }}
                                        </span>
                                        <Icon v-if="isGradeLocked(module, 'normal')" icon="material-symbols:lock"
                                            class="grade-lock-icon" title="Note officielle" />
                                        <Icon v-else icon="material-symbols:edit" class="grade-edit-icon"
                                            title="La note peut encore changer" />
                                    </div>
                                    <span v-else-if="hasNormalExam(module)" class="no-grade">—</span>
                                    <span v-else class="no-exam">Pas encore d'examen</span>
                                </td>
                                <td class="grade-cell">
                                    <div v-if="hasRattrapageGrade(module)" class="grade-container"
                                        :class="getGradeStatus(module, 'rattrapage')">
                                        <span class="grade" :class="getGradeClass(getRattrapageGrade(module)!)">
                                            {{ getRattrapageGrade(module)!.toFixed(2) }}
                                        </span>
                                        <Icon v-if="isGradeLocked(module, 'rattrapage')" icon="material-symbols:lock"
                                            class="grade-lock-icon" title="Note officielle" />
                                        <Icon v-else icon="material-symbols:edit" class="grade-edit-icon"
                                            title="La note peut encore changer" />
                                    </div>
                                    <span v-else-if="hasRattrapageExam(module)" class="no-grade">—</span>
                                    <span v-else class="no-exam">Pas encore d'examen</span>
                                </td>
                            </tr>
                        </template>
                        <!-- Ligne totale -->
                        <tr class="total-row">
                            <td><strong>Total</strong></td>
                            <td colspan="2" class="total-grade">
                                <strong>{{ calculateTotal() }}/20</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <TheStudentAdministrativeFormModal v-if="request" :request="request" @close="request = null" />
</template>

<script setup lang="ts">
import TheStudentAdministrativeFormModal from '@/components/student/TheStudentAdministrativeFormModal.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface'
import type { AllGradesInterface } from '@/interfaces/all-grades.interface'
import type StudentInterface from '@/interfaces/student.intefaces'
import type { ToastInterface } from '@/interfaces/toast.interface'
import { useMyUserStore } from '@/stores/userStore'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
const toast = ref<ToastInterface>()
const request = ref<Pick<AdministrativeRequestInterface, 'requestType' | 'promotion'> | null>(null);

const addRequest = () => {
    request.value = {
        requestType: 'transcript',
        promotion: route.params.promotionId as string
    }
}



const route = useRoute()
const grades = ref<AllGradesInterface[]>([])


const fetchAllGrades = async () => {
    try {
        const response = await axios.get(`/api/v1/submissions/all-grades/${route.params.promotionId}`)
        grades.value = response.data
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error)
    }
}

const isThisPromotionsFinished = computed(() => {
    const users = useMyUserStore().currentUser as StudentInterface
    const isCompleted = users.parcours.find((p) => p.promotion._id === route.params.promotionId)?.status === 'completed'

    return isCompleted
})

const promotionStatus = computed(() => {
    const users = useMyUserStore().currentUser as StudentInterface
    const parcours = users.parcours.find((p) => p.promotion._id === route.params.promotionId)

    if (!parcours) return null

    const statusConfig: Record<string, { title: string; message: string; icon: string; class: string; badgeLabel: string; badgeIcon: string }> = {
        'completed': {
            title: '✅ Promotion Terminée',
            message: 'Vous avez complété avec succès cette promotion. Consultez votre relevé de notes officiel auprès de la scolarité.',
            icon: 'material-symbols:check-circle',
            class: 'status-completed',
            badgeLabel: 'Terminée',
            badgeIcon: 'material-symbols:check-circle'
        },
        'in progress': {
            title: '📚 Promotion en Cours',
            message: 'Vous suivez actuellement cette promotion. Continuez vos révisions !',
            icon: 'material-symbols:schedule',
            class: 'status-in-progress',
            badgeLabel: 'En cours',
            badgeIcon: 'material-symbols:schedule'
        },
        'repeated': {
            title: '🔄 Redoublement',
            message: 'Vous avez redoublé cette promotion.',
            icon: 'material-symbols:restart-alt',
            class: 'status-repeated',
            badgeLabel: 'Redoublement',
            badgeIcon: 'material-symbols:restart-alt'
        },
        'dropped': {
            title: '⛔ Institution Abandonnée',
            message: 'Vous avez quitté cette promotion. Contactez la scolarité pour plus d\'informations.',
            icon: 'material-symbols:block',
            class: 'status-dropped',
            badgeLabel: 'Abandonnée',
            badgeIcon: 'material-symbols:block'
        }
    }

    return statusConfig[parcours.status] || null
})

const getGradeClass = (grade: number) => {
    if (grade >= 18) return 'excellent'
    if (grade >= 16) return 'tres-bien'
    if (grade >= 14) return 'bien'
    if (grade >= 12) return 'assez-bien'
    if (grade >= 10) return 'passable'
    return 'insuffisant'
}

const hasNormalExam = (module: any) => {
    return module.examSubmissions.some((exam: any) => exam.assignment.session === 'normal')
}

const hasNormalGrade = (module: any) => {
    const normalExam = module.examSubmissions.find((exam: any) => exam.assignment.session === 'normal')
    return normalExam && normalExam.submission.grade !== null
}

const getNormalGrade = (module: any) => {
    const normalExam = module.examSubmissions.find((exam: any) => exam.assignment.session === 'normal')
    return normalExam?.submission.grade
}

const hasRattrapageExam = (module: any) => {
    return module.examSubmissions.some((exam: any) => exam.assignment.session === 'rattrapage')
}

const hasRattrapageGrade = (module: any) => {
    const rattrapageExam = module.examSubmissions.find((exam: any) => exam.assignment.session === 'rattrapage')
    return rattrapageExam && rattrapageExam.submission.grade !== null
}

const getRattrapageGrade = (module: any) => {
    const rattrapageExam = module.examSubmissions.find((exam: any) => exam.assignment.session === 'rattrapage')
    return rattrapageExam?.submission.grade
}

// Vérifier si une note est verrouillée (officielle)
const isGradeLocked = (module: any, session: 'normal' | 'rattrapage') => {
    const exam = module.examSubmissions.find((e: any) => e.assignment.session === session)
    return exam?.assignment.lockedGrade === true
}

// Obtenir le statut d'une note (locked ou can change)
const getGradeStatus = (module: any, session: 'normal' | 'rattrapage') => {
    return isGradeLocked(module, session) ? 'locked' : 'changeable'
}

const calculateTotal = () => {
    let totalGrade = 0
    let totalCoefficient = 0

    grades.value.forEach(unit => {
        unit.modules.forEach(module => {
            // Prendre la meilleure note (rattrapage si existe, sinon normal)
            const normalGrade = getNormalGrade(module)
            const rattrapageGrade = getRattrapageGrade(module)

            if (rattrapageGrade !== null && rattrapageGrade !== undefined) {
                totalGrade += rattrapageGrade * module.coefficient
                totalCoefficient += module.coefficient
            } else if (normalGrade !== null && normalGrade !== undefined) {
                totalGrade += normalGrade * module.coefficient
                totalCoefficient += module.coefficient
            }
        })
    })

    return totalCoefficient > 0 ? (totalGrade / totalCoefficient).toFixed(2) : '0.00'
}

const downloadBulletin = () => {
    // TODO: Implémenter la génération du PDF
    alert('La génération du PDF sera implémentée prochainement')
}

watchEffect(async () => {
    await fetchAllGrades()
})
</script>

<style scoped>
.grades-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(80, 134, 193, 0.2);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: white;
}

.header-icon {
    font-size: 4rem;
    background: rgba(255, 255, 255, 0.2);
    padding: 1rem;
    border-radius: 12px;
}

.header-text {
    flex: 1;
}

.header-title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.action-button {
    display: flex;
    justify-content: flex-end;
    margin: 10px 0;
}

.header-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: white;
}

/* Badge de statut */
.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: white;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-icon {
    font-size: 1rem;
}

.status-badge.status-completed {
    background: linear-gradient(135deg, rgba(39, 174, 96, 0.25), rgba(46, 204, 113, 0.15));
    border-color: rgba(46, 204, 113, 0.4);
    color: #2ecc71;
}

.status-badge.status-in-progress {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.25), rgba(74, 173, 227, 0.15));
    border-color: rgba(52, 152, 219, 0.4);
    color: #3498db;
}

.status-badge.status-repeated {
    background: linear-gradient(135deg, rgba(241, 196, 15, 0.25), rgba(243, 156, 18, 0.15));
    border-color: rgba(241, 196, 15, 0.4);
    color: #f1c40f;
}

.status-badge.status-dropped {
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.25), rgba(192, 57, 43, 0.15));
    border-color: rgba(231, 76, 60, 0.4);
    color: #e74c3c;
}

.header-subtitle {
    margin: 0.5rem 0 0 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
}

/* Status Banner */
.status-banner {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    border-left: 5px solid;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    align-items: flex-start;
}

.status-icon {
    font-size: 2rem;
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.status-content {
    flex: 1;
}

.status-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
}

.status-text {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.5;
}

/* Completed Status */
.status-completed {
    background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(46, 204, 113, 0.05));
    border-left-color: #27ae60;
    color: #27ae60;
}

.status-completed .status-title {
    color: #27ae60;
}

.status-completed .status-text {
    color: #1e8449;
}

/* In Progress Status */
.status-in-progress {
    background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(74, 173, 227, 0.05));
    border-left-color: #3498db;
    color: #3498db;
}

.status-in-progress .status-title {
    color: #3498db;
}

.status-in-progress .status-text {
    color: #2980b9;
}

/* Repeated Status */
.status-repeated {
    background: linear-gradient(135deg, rgba(241, 196, 15, 0.1), rgba(243, 156, 18, 0.05));
    border-left-color: #f39c12;
    color: #f39c12;
}

.status-repeated .status-title {
    color: #f39c12;
}

.status-repeated .status-text {
    color: #d68910;
}

/* Dropped Status */
.status-dropped {
    background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.05));
    border-left-color: #e74c3c;
    color: #e74c3c;
}

.status-dropped .status-title {
    color: #e74c3c;
}

.status-dropped .status-text {
    color: #c0392b;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
    font-size: 5rem;
    color: var(--text-secondary);
    opacity: 0.5;
}

.empty-text {
    margin-top: 1rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.info-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.warning-card {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05));
    border-left: 4px solid #f39c12;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
    box-shadow: 0 2px 10px rgba(243, 156, 18, 0.1);
}

.warning-icon {
    font-size: 2.5rem;
    color: #f39c12;
    flex-shrink: 0;
}

.warning-content {
    flex: 1;
}

.warning-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.75rem 0;
}

.warning-text {
    font-size: 0.95rem;
    color: var(--text-dark);
    line-height: 1.6;
    margin: 0 0 0.75rem 0;
}

.warning-text:last-child {
    margin-bottom: 0;
}

.warning-text strong {
    color: #e67e22;
}

.download-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(80, 134, 193, 0.25);
    align-self: flex-start;
}

.download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(80, 134, 193, 0.35);
}

.download-btn svg {
    font-size: 1.25rem;
}

.bulletin-table {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}



/* Section Légende */
.legend-section {
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.08), rgba(80, 134, 193, 0.04));
    border: 1px solid rgba(80, 134, 193, 0.15);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.legend-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 1.5rem 0;
}

.legend-title-icon {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.legend-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.legend-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid;
    background: rgba(255, 255, 255, 0.5);
}

.legend-item.locked {
    border-color: rgba(46, 204, 113, 0.2);
    background: rgba(46, 204, 113, 0.05);
}

.legend-item.changeable {
    border-color: rgba(241, 196, 15, 0.2);
    background: rgba(241, 196, 15, 0.05);
}

.legend-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 8px;
    flex-shrink: 0;
}

.legend-item.locked .legend-icon-box {
    background: rgba(46, 204, 113, 0.15);
}

.legend-item.changeable .legend-icon-box {
    background: rgba(241, 196, 15, 0.15);
}

.legend-icon {
    font-size: 1.5rem;
}

.legend-item.locked .legend-icon {
    color: #27ae60;
}

.legend-item.changeable .legend-icon {
    color: #f39c12;
}

.legend-text {
    flex: 1;
}

.legend-text strong {
    display: block;
    font-size: 1rem;
    color: var(--text-dark);
    margin-bottom: 0.5rem;
}

.legend-text p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    line-height: 1.5;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-weight: 600;
    color: white;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.module-col {
    width: 50%;
}

.grade-col {
    width: 25%;
    text-align: center;
}

tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s ease;
}

tbody tr:hover:not(.unit-row):not(.total-row) {
    background: rgba(80, 134, 193, 0.05);
}

tbody tr:last-child {
    border-bottom: none;
}

td {
    padding: 1rem 1.5rem;
    color: var(--text-dark);
    font-size: 1rem;
}

.unit-row {
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.15), rgba(80, 134, 193, 0.08));
    border-left: 4px solid var(--primary-color);
}

.unit-cell {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
    padding: 1rem 1.5rem;
}

.unit-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.unit-code {
    margin-left: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--primary-color);
    background: rgba(80, 134, 193, 0.15);
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
}

.unit-credits {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--primary-color);
    background: rgba(80, 134, 193, 0.1);
    padding: 0.4rem 0.9rem;
    border-radius: 8px;
}

.unit-credits svg {
    font-size: 1.2rem;
}

.module-row {
    background: white;
}

.module-name {
    font-weight: 500;
    color: var(--text-dark);
}

.module-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.module-title {
    font-weight: 600;
    font-size: 1rem;
    color: var(--text-dark);
}

.module-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.module-code-badge {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--primary-color);
    background: rgba(80, 134, 193, 0.1);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
}

.module-credits {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.module-credits svg {
    font-size: 1rem;
    color: var(--primary-color);
}

.grade-cell {
    text-align: center;
    font-weight: 600;
    font-size: 1.1rem;
}

/* Conteneur de note avec indicateur de statut */
.grade-container {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.grade-container.locked {
    background: rgba(46, 204, 113, 0.08);
    border: 1px solid rgba(46, 204, 113, 0.2);
}

.grade-container.changeable {
    background: rgba(241, 196, 15, 0.08);
    border: 1px solid rgba(241, 196, 15, 0.2);
}

.grade-lock-icon {
    font-size: 1rem;
    color: #27ae60;
    flex-shrink: 0;
    opacity: 0.8;
}

.grade-edit-icon {
    font-size: 1rem;
    color: #f39c12;
    flex-shrink: 0;
    opacity: 0.8;
}

.grade {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
}

.grade.excellent {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.grade.tres-bien {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.grade.bien {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.grade.assez-bien {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.grade.passable {
    background: rgba(46, 204, 113, 0.15);
    color: #27ae60;
}

.grade.insuffisant {
    background: rgba(235, 77, 75, 0.2);
    color: #c0392b;
    font-weight: 800;
}

.no-grade {
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 1.2rem;
}

.no-exam {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-style: italic;
    font-weight: 400;
}

.total-row {
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.2), rgba(80, 134, 193, 0.1));
    border-top: 3px solid var(--primary-color);
    font-size: 1.2rem;
}

.total-grade {
    text-align: center;
    font-size: 1.5rem;
    color: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
    .grades-container {
        padding: 1rem;
    }

    .header {
        padding: 1.5rem;
        border-radius: 12px;
    }

    .header-icon {
        font-size: 3rem;
        padding: 0.75rem;
    }

    .header-title {
        font-size: 1.5rem;
    }

    .warning-card {
        flex-direction: column;
        padding: 1.25rem;
        gap: 0.75rem;
    }

    .warning-icon {
        font-size: 2rem;
        align-self: flex-start;
    }

    .warning-title {
        font-size: 1rem;
    }

    .warning-text {
        font-size: 0.9rem;
    }

    .download-btn {
        padding: 0.85rem 1.5rem;
        font-size: 0.95rem;
        width: 100%;
        justify-content: center;
    }

    .unit-header-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .bulletin-table {
        overflow-x: auto;
        border-radius: 12px;
        -webkit-overflow-scrolling: touch;
    }

    table {
        min-width: 600px;
    }

    th,
    td {
        padding: 0.75rem 0.75rem;
        font-size: 0.9rem;
    }

    .grade {
        padding: 0.4rem 0.8rem;
        font-size: 1rem;
    }

    .total-grade {
        font-size: 1.3rem;
    }

    .legend-section {
        padding: 1.25rem;
        margin-bottom: 1rem;
    }

    .legend-title {
        font-size: 1rem;
        margin-bottom: 1rem;
    }

    .legend-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .legend-item {
        padding: 1rem;
        flex-direction: row;
        gap: 0.75rem;
    }

    .legend-icon-box {
        width: 2.8rem;
        height: 2.8rem;
        min-width: 2.8rem;
    }

    .legend-icon {
        font-size: 1.4rem;
    }

    .legend-text strong {
        font-size: 0.95rem;
    }

    .legend-text p {
        font-size: 0.85rem;
    }
}

@media (max-width: 480px) {
    .grades-container {
        padding: 0.75rem;
    }

    .header {
        padding: 1.25rem;
        border-radius: 10px;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .header-icon {
        font-size: 2.5rem;
        padding: 0.65rem;
    }

    .header-title {
        font-size: 1.3rem;
    }

    .header-subtitle {
        font-size: 0.9rem;
    }

    .warning-card {
        padding: 1rem;
        gap: 0.65rem;
    }

    .warning-icon {
        font-size: 1.75rem;
    }

    .warning-title {
        font-size: 0.95rem;
    }

    .warning-text {
        font-size: 0.85rem;
    }

    .download-btn {
        padding: 0.75rem 1.25rem;
        font-size: 0.9rem;
        width: 100%;
    }

    .download-btn svg {
        font-size: 1.15rem;
    }

    .bulletin-table {
        border-radius: 10px;
    }

    table {
        min-width: 500px;
    }

    th,
    td {
        padding: 0.6rem 0.5rem;
        font-size: 0.85rem;
    }

    .unit-cell {
        font-size: 0.95rem;
        padding: 1rem 0.5rem;
    }

    .unit-code {
        display: block;
        margin-left: 0;
        margin-top: 0.5rem;
        font-size: 0.75rem;
    }

    .unit-header-info {
        gap: 0.5rem;
    }

    .unit-credits {
        font-size: 0.8rem;
        padding: 0.35rem 0.75rem;
    }

    .unit-credits svg {
        font-size: 0.95rem;
    }

    .module-title {
        font-size: 0.85rem;
    }

    .module-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.3rem;
    }

    .module-code-badge {
        font-size: 0.7rem;
        padding: 0.2rem 0.55rem;
    }

    .module-credits {
        font-size: 0.75rem;
    }

    .module-credits svg {
        font-size: 0.9rem;
    }

    .grade {
        padding: 0.35rem 0.65rem;
        font-size: 0.9rem;
    }

    .no-grade {
        font-size: 1.1rem;
    }

    .no-exam {
        font-size: 0.75rem;
    }

    .total-row {
        font-size: 0.95rem;
    }

    .total-row td {
        padding: 1.2rem 0.5rem;
    }

    .total-grade {
        font-size: 1.2rem;
    }

    .legend-section {
        padding: 1rem;
        margin-bottom: 0.75rem;
    }

    .legend-title {
        font-size: 0.95rem;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
    }

    .legend-title-icon {
        font-size: 1.25rem;
    }

    .legend-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .legend-item {
        padding: 0.75rem;
        flex-direction: column;
        text-align: center;
        gap: 0.5rem;
    }

    .legend-icon-box {
        width: 2.5rem;
        height: 2.5rem;
        min-width: 2.5rem;
        margin: 0 auto;
    }

    .legend-icon {
        font-size: 1.25rem;
    }

    .legend-text strong {
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }

    .legend-text p {
        font-size: 0.8rem;
        line-height: 1.4;
    }
}
</style>