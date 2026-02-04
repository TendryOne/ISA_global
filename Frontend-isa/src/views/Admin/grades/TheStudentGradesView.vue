<template>

    <div v-if="loading" class="loading">
        <SpinningLoader :loading="loading" text="chargement des notes en cours ..." />
    </div>
    <div v-else-if="errorServer">
        <ErrorComponent :message="errorServer" @retry="fetchAllGrades" />
    </div>

    <div class="grades-container" v-else>
        <BreadCrumbsBack />

        <!-- Header épuré -->
        <div class="header-refined">
            <div class="header-content">
                <div class="header-brand">
                    <div class="brand-icon">
                        <Icon icon="material-symbols:school" />
                    </div>
                    <div class="brand-text">
                        <h1 class="header-title">Relevé de Notes</h1>
                        <p class="header-subtitle">{{ student?.firstName }} {{ student?.name }} • {{ promotion?.name }}
                        </p>
                    </div>
                </div>
                <div class="header-actions">
                    <ActionButton @click="handleAction" icon="mdi:star-four-points-circle"
                        :disabled="grades.length === 0 || !AllGradesAvailableAndLocked || promotion?.isActive || !isPromotionInProgress"
                        class="btn-primary">
                        Statuer
                    </ActionButton>
                    <ActionButton :icon="loadingPdf ? 'line-md:loading-alt-loop' : 'mdi:file-pdf-box'"
                        @click="showPdfWarning = true"
                        :disabled="loadingPdf || grades.length === 0 || !AllGradesAvailableAndLocked || promotion?.isActive || isPromotionInProgress"
                        class="btn-secondary">
                        {{ loadingPdf ? 'Génération...' : 'PDF' }}
                    </ActionButton>

                </div>
            </div>
        </div>

        <!-- Layout principal amélioré -->
        <div class="main-layout">
            <!-- Sidebar informations -->
            <aside class="sidebar-refined">
                <div class="student-profile card-elevated">
                    <div class="profile-header">
                        <div class="avatar-container">
                            <div class="student-avatar">
                                {{ getInitials(student?.name, student?.firstName) }}
                            </div>
                        </div>
                        <div class="profile-info">
                            <h3 class="student-name">{{ student?.firstName }} {{ student?.name }}</h3>
                            <p class="student-matricule">{{ student?.matricule }}</p>
                        </div>
                    </div>

                    <div class="contact-info">
                        <div class="contact-item">
                            <Icon icon="mdi:email" class="contact-icon" />
                            <span class="contact-text">{{ student?.email }}</span>
                        </div>
                        <div class="contact-item">
                            <Icon icon="icon-park-outline:level" class="contact-icon" />
                            <span class="contact-text">{{ student?.level }}</span>
                        </div>
                        <div class="contact-item">
                            <Icon icon="material-symbols:school" class="contact-icon" />
                            <span class="contact-text">{{ student?.field }}</span>
                        </div>
                        <div class="contact-item" v-if="student?.phone">
                            <Icon icon="mdi:phone" class="contact-icon" />
                            <span class="contact-text">+261 {{ student?.phone }}</span>
                        </div>
                    </div>
                </div>

                <!-- Statistiques rapides -->
                <div class="quick-stats card-elevated" v-if="grades.length > 0">
                    <h4 class="stats-title">Aperçu Global</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-content">
                                <span class="stat-value">{{ getTotalModules() }}</span>
                                <span class="stat-label">Modules</span>
                            </div>
                            <div class="stat-indicator mod"></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-content">
                                <span class="stat-value">{{ getTotalCredits() }}</span>
                                <span class="stat-label">Crédits</span>
                            </div>
                            <div class="stat-indicator cred"></div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-content">
                                <span class="stat-value" :class="getAverageClass()">{{ calculateTotal() }}</span>
                                <span class="stat-label">Moyenne</span>
                            </div>
                            <div class="stat-indicator avg"></div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Contenu principal -->
            <main class="content-main">
                <!-- Navigation rapide -->
                <nav class="quick-nav card-elevated">
                    <button class="nav-btn active" @click="scrollToSection('grades')">
                        <Icon icon="mdi:chart-box-outline" class="nav-icon" />
                        <span>Notes détaillées</span>
                    </button>
                    <button class="nav-btn" @click="scrollToSection('summary')">
                        <Icon icon="mdi:file-chart-outline" class="nav-icon" />
                        <span>Résumé</span>
                    </button>
                </nav>

                <!-- État vide -->
                <div v-if="grades.length === 0" class="empty-state card-elevated">
                    <div class="empty-content">
                        <Icon icon="material-symbols:description-outline" class="empty-icon" />
                        <h3 class="empty-title">Notes en attente de publication</h3>
                        <p class="empty-text">Le relevé de notes sera disponible après la publication par
                            l'administration académique.</p>
                    </div>
                </div>

                <!-- Contenu des notes -->
                <div v-else class="grades-content">
                    <!-- Indicateurs de statut -->
                    <div class="status-indicators">
                        <div class="indicator-group">
                            <div class="indicator">
                                <div class="indicator-dot verified"></div>
                                <span>Note vérifiée</span>
                            </div>
                            <div class="indicator">
                                <div class="indicator-dot pending"></div>
                                <span>En attente</span>
                            </div>
                        </div>
                    </div>

                    <!-- Unités d'enseignement -->
                    <div class="units-container" id="grades">
                        <div class="section-header">
                            <h2 class="section-title">Unités d'Enseignement</h2>
                            <button class="expand-toggle" @click="toggleExpandAll">
                                <Icon :icon="allExpanded ? 'mdi:collapse-all' : 'mdi:expand-all'" />
                                {{ allExpanded ? 'Réduire tout' : 'Développer tout' }}
                            </button>
                        </div>

                        <div class="units-list">
                            <div v-for="unit in grades" :key="unit.teachingUnit._id" class="unit-card card-elevated">
                                <div class="unit-summary" @click="toggleUnit(unit.teachingUnit._id)">
                                    <div class="unit-main">
                                        <Icon
                                            :icon="expandedUnits.includes(unit.teachingUnit._id) ? 'mdi:chevron-down' : 'mdi:chevron-right'"
                                            class="expand-icon" />
                                        <div class="unit-details">
                                            <h3 class="unit-name">{{ unit.teachingUnit.name }}</h3>
                                            <div class="unit-meta">
                                                <span class="unit-code">{{ unit.teachingUnit.code }}</span>
                                                <span class="unit-credits">
                                                    <Icon icon="material-symbols:workspace-premium" />
                                                    {{ unit.teachingUnit.credits }} crédits
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="unit-performance">
                                        <div class="performance-badge" :class="getUnitStatusClass(unit)">
                                            <span class="performance-score">{{ calculateUnitAverage(unit).toFixed(2)
                                            }}</span>
                                            <span class="performance-label">/20</span>
                                        </div>
                                        <div class="unit-status" :class="getUnitStatusClass(unit)">
                                            {{ getUnitStatus(unit) }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Modules détaillés -->
                                <div v-show="expandedUnits.includes(unit.teachingUnit._id)" class="modules-details">
                                    <div v-for="module in unit.modules" :key="module._id" class="module-item">
                                        <!-- Module Header avec séparateur -->
                                        <div class="module-header">
                                            <div class="module-info">
                                                <h4 class="module-title">{{ module.title }}</h4>
                                                <div class="module-specs">
                                                    <span class="module-code">{{ module.code }}</span>
                                                    <span class="module-coef">Coefficient {{ module.coefficient
                                                    }}</span>
                                                    <span class="module-credits">{{ module.credits }} crédits</span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Séparateur -->
                                        <div class="module-separator"></div>

                                        <!-- Sessions alignées horizontalement -->
                                        <div class="sessions-horizontal">
                                            <!-- Session Normale -->
                                            <div class="session-column">
                                                <div class="session-header">
                                                    <Icon icon="mdi:calendar-check" class="session-icon" />
                                                    <span class="session-label">Session Normale</span>
                                                </div>
                                                <div class="session-grade">
                                                    <template v-if="getModuleData(module._id)?.hasNormalGrade">
                                                        <div class="grade-badge" :class="[
                                                            getGradeClass(getModuleData(module._id)!.normalGrade!),
                                                            getModuleData(module._id)?.isNormalLocked ? 'verified' : 'pending'
                                                        ]">
                                                            <span class="grade-number">
                                                                {{ getModuleData(module._id)!.normalGrade!.toFixed(2) }}
                                                            </span>
                                                            <Icon v-if="getModuleData(module._id)?.isNormalLocked"
                                                                icon="mdi:check-circle" class="grade-status" />
                                                        </div>
                                                    </template>
                                                    <template v-else-if="getModuleData(module._id)?.hasNormalExam">
                                                        <div class="grade-placeholder">
                                                            <Icon icon="mdi:clock-outline" />
                                                            En attente
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div class="grade-absent">-</div>
                                                    </template>
                                                </div>
                                            </div>

                                            <!-- Session Rattrapage -->
                                            <div class="session-column">
                                                <div class="session-header">
                                                    <Icon icon="mdi:calendar-sync" class="session-icon" />
                                                    <span class="session-label">Rattrapage</span>
                                                </div>
                                                <div class="session-grade">
                                                    <template
                                                        v-if="getRattrapageDisplayState(getModuleData(module._id)) === 'no-attempt'">
                                                        <div class="grade-absent">-</div>
                                                    </template>
                                                    <template
                                                        v-else-if="getRattrapageDisplayState(getModuleData(module._id)) === 'has-grade'">
                                                        <div class="grade-badge" :class="[
                                                            getGradeClass(getModuleData(module._id)!.rattrapageGrade!),
                                                            getModuleData(module._id)?.isRattrapageLocked ? 'verified' : 'pending'
                                                        ]">
                                                            <span class="grade-number">
                                                                {{
                                                                    getModuleData(module._id)!.rattrapageGrade!.toFixed(2)
                                                                }}
                                                            </span>
                                                            <Icon v-if="getModuleData(module._id)?.isRattrapageLocked"
                                                                icon="mdi:check-circle" class="grade-status" />
                                                        </div>
                                                    </template>
                                                    <template
                                                        v-else-if="getRattrapageDisplayState(getModuleData(module._id)) === 'pending'">
                                                        <div class="grade-placeholder">
                                                            <Icon icon="mdi:clock-outline" />
                                                            En attente
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div class="grade-absent">-</div>
                                                    </template>
                                                </div>
                                            </div>

                                            <!-- Note Finale -->
                                            <div class="session-column final">
                                                <div class="session-header">
                                                    <Icon icon="mdi:trophy-outline" class="session-icon" />
                                                    <span class="session-label">Finale</span>
                                                </div>
                                                <div class="session-grade">
                                                    <template
                                                        v-if="getFinalGradeState(getModuleData(module._id)) === 'has-grade'">
                                                        <div class="final-grade"
                                                            :class="getGradeClass(getModuleData(module._id)!.finalGrade!)">
                                                            {{ getModuleData(module._id)!.finalGrade!.toFixed(2) }}
                                                        </div>
                                                    </template>
                                                    <template v-else>
                                                        <div class="grade-placeholder">
                                                            <Icon icon="mdi:clock-outline" />
                                                            En attente
                                                        </div>
                                                    </template>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Résumé académique -->
                    <div class="summary-section card-elevated" id="summary">
                        <div class="section-header">
                            <h2 class="section-title">Synthèse Académique</h2>
                        </div>
                        <div class="summary-cards">
                            <div class="summary-card">
                                <div class="summary-icon">
                                    <Icon icon="mdi:chart-bar" />
                                </div>
                                <div class="summary-content">
                                    <div class="summary-value">{{ calculateTotal() }}/20</div>
                                    <div class="summary-label">Moyenne Générale</div>
                                </div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-icon">
                                    <Icon icon="mdi:progress-check" />
                                </div>
                                <div class="summary-content">
                                    <div class="summary-value">{{ getCompletedModules() }}/{{ getTotalModules() }}</div>
                                    <div class="summary-label">Modules Validés</div>
                                </div>
                            </div>
                            <div class="summary-card">
                                <div class="summary-icon">
                                    <Icon icon="mdi:clock-outline" />
                                </div>
                                <div class="summary-content">
                                    <div class="summary-value">{{ getPendingGrades() }}</div>
                                    <div class="summary-label">En Attente</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>


    <!-- Modals -->
    <TheStudentStatusModal v-if="openModal" :student="student" @submit="handleSubmitNewStatus"
        :loading="isLoadingSubmit" @close="openModal = false" />

    <!-- Modal d'avertissement PDF -->
    <div v-if="showPdfWarning" class="modal-overlay" @click.self="showPdfWarning = false">
        <div class="pdf-warning-modal">
            <div class="warning-modal-header">
                <Icon icon="mdi:alert-circle" class="warning-icon" />
                <h3>Avertissement Important</h3>
            </div>
            <div class="warning-modal-body">
                <p class="warning-text">
                    <Icon icon="mdi:shield-alert" />
                    <strong>Attention :</strong> Le téléchargement de ce relevé de notes au format PDF entraînera la
                    perte
                    de son authenticité numérique.
                </p>
                <div class="warning-details">
                    <p>
                        <Icon icon="mdi:information" /> Une fois téléchargé, l'ancien relevé de note ne pourra plus être
                        vérifié comme authentique via notre système.
                    </p>
                    <p>
                        <Icon icon="mdi:file-document-check" /> Seul le document généré à ce moment précis sera
                        considéré
                        comme officiel.
                    </p>
                    <p>
                        <Icon icon="mdi:clock-alert" /> Cette action est irréversible et doit être effectuée uniquement
                        lorsque nécessaire.
                    </p>
                </div>
            </div>
            <div class="warning-modal-actions">
                <ActionButton @click="showPdfWarning = false" variant="outline" outline-color="red" icon="mdi:close">
                    Annuler
                </ActionButton>
                <ActionButton @click="confirmDownloadPdf" icon="mdi:download" class="btn-warning">
                    Je comprends, télécharger
                </ActionButton>
            </div>
        </div>
    </div>

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
        @dismissed="toast.show = false" />

</template>
<script setup lang="ts">
import TheStudentStatusModal from '@/components/admin/grades/TheStudentStatusModal.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue'
import type { AllGradesInterface, ModuleGradesInterface } from '@/interfaces/all-grades.interface'
import type PromotionInterface from '@/interfaces/promotion.interface'
import type StudentInterface from '@/interfaces/student.intefaces'
import type { ToastInterface } from '@/interfaces/toast.interface'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import { ref, watchEffect, computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import QrCodeModal from '@/components/modals/QrCodeModal.vue'
import { spawn } from 'child_process'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import { useSocket } from '@/composables/useSocket'

// `qrcode` will be a ref of data URL
const token = ref<string | null>(null)


// Utilisation réactive du QR Code
const qrCodeUrl = computed(() =>
    token.value ? `https://www.isa-ambato.mg/authenticate-grades/${token.value}` : ''
)



// Modal QR Code
const showQrModal = ref(false)
const qrCodeData = computed(() => {
    return {
        url: qrCodeUrl.value,
        studentName: `${student.value?.firstName} ${student.value?.name}`,
        studentMatricule: student.value?.matricule || 'N/A'
    }
})



interface RootData {
    grades: AllGradesInterface[]
    student: StudentInterface
    promotion: PromotionInterface
}
const toast = ref<ToastInterface>({
    message: "",
    show: false,
    title: '',
    type: 'success'
})
const openModal = ref<boolean>(false);
const isLoadingSubmit = ref<boolean>(false);

const { emit } = useSocket()

const handleSubmitNewStatus = async (status: string) => {
    try {


        isLoadingSubmit.value = true
        const response = await axios.patch(`/api/v1/students/status/parcours/${student.value?._id}/${promotion.value?._id}`, {
            status: status
        })
        toast.value = {
            message: "Statut de l'étudiant mis à jour avec succès.",
            show: true,
            title: "Succès",
            type: "success"
        }


        student.value = response.data

        emit('SendNotificationpatchUserStatusByAdmin', { student: response.data, status: status })

        openModal.value = false
    } catch (error: any) {
        toast.value = {
            message: axios.isAxiosError(error) && error.response ? error.response.data : "Une erreur s'est produite",
            show: true,
            title: "Erreur",
            type: "error"
        }
    } finally {
        isLoadingSubmit.value = false;
    }


}



const route = useRoute()
const grades = ref<AllGradesInterface[]>([])
const student = ref<StudentInterface | null>(null)
const expandedUnits = ref<string[]>([])
const promotion = ref<PromotionInterface | null>(null)
const allExpanded = ref(true)
const loading = ref<boolean>(false)
const errorServer = ref<string>('')

const fetchAllGrades = async () => {
    loading.value = true
    try {
        const response = await axios.get<RootData>(`/api/v1/submissions/all-grades/promotion/${route.params.promotion}/student/${route.params.student}`)
        grades.value = response.data.grades
        student.value = response.data.student
        promotion.value = response.data.promotion
        // Développer toutes les unités par défaut
        expandedUnits.value = grades.value.map(unit => unit.teachingUnit._id)
    } catch (error) {
        errorServer.value = axios.isAxiosError(error) && error.response ? error.response.data : "Erreur lors de la récupération des notes."
    } finally {
        loading.value = false
    }
}



const AllGradesAvailableAndLocked = computed(() => {
    // Vérifie que TOUS les modules ont:
    // 1. Au minimum un examen en session NORMALE (même sans rattrapage)
    // 2. Cet examen de session normale est verrouillé (lockedGrade === true)
    const allModulesHaveNormalLocked = grades.value.every(unit =>
        unit.modules.every(module => {
            // Trouver l'examen de session normale
            const normalExam = module.examSubmissions.find(exam => exam.assignment.session === 'normal')

            // Doit avoir un examen normal ET il doit être verrouillé
            return normalExam && normalExam.assignment.lockedGrade === true
        })
    );

    return allModulesHaveNormalLocked;
})


const isPromotionInProgress = computed(() => {
    if (student.value && promotion.value) {
        const parcourItem = student.value.parcours.find(p => (p.promotion as string) === promotion.value!._id)
        if (parcourItem && parcourItem.status === 'in progress') {
            return true
        }
    }
    return false;
})

// Helper functions pour les examens
const hasNormalExam = (module: ModuleGradesInterface) => {
    return module.examSubmissions.some((exam) => exam.assignment.session === 'normal')
}

const hasNormalGrade = (module: ModuleGradesInterface) => {
    const normalExam = module.examSubmissions.find((exam) => exam.assignment.session === 'normal')
    return normalExam && normalExam.submission.grade !== null
}

const getNormalGrade = (module: ModuleGradesInterface) => {
    const normalExam = module.examSubmissions.find((exam) => exam.assignment.session === 'normal')
    return normalExam?.submission.grade
}

const hasRattrapageExam = (module: ModuleGradesInterface) => {
    return module.examSubmissions.some((exam) => exam.assignment.session === 'rattrapage')
}

const hasRattrapageGrade = (module: ModuleGradesInterface) => {
    const rattrapageExam = module.examSubmissions.find((exam) => exam.assignment.session === 'rattrapage')
    // Note de rattrapage valide si elle existe, n'est pas null ET n'est pas 0 (0 = pas d'examen)
    return rattrapageExam && rattrapageExam.submission.grade !== null && rattrapageExam.submission.grade !== 0
}

const getRattrapageGrade = (module: ModuleGradesInterface) => {
    const rattrapageExam = module.examSubmissions.find((exam) => exam.assignment.session === 'rattrapage')
    const grade = rattrapageExam?.submission.grade
    // Si la note est 0, on la traite comme "pas d'examen" (retourner null)
    return (grade === 0) ? null : grade
}

const getFinalGrade = (module: ModuleGradesInterface) => {
    const rattrapageGrade = getRattrapageGrade(module)
    const normalGrade = getNormalGrade(module)

    // Prendre la meilleure des 2 notes, en ignorant les null/undefined
    const validRattrapage = rattrapageGrade !== null && rattrapageGrade !== undefined ? rattrapageGrade : -1
    const validNormal = normalGrade !== null && normalGrade !== undefined ? normalGrade : -1

    // Si les deux existent, prendre la meilleure
    if (validNormal > -1 && validRattrapage > -1) {
        return Math.max(validNormal, validRattrapage)
    }

    // Sinon, prendre celle qui existe
    if (validNormal > -1) return validNormal
    if (validRattrapage > -1) return validRattrapage

    return 0
}

// Vérifier si une note est verrouillée (officielle)
const isGradeLocked = (module: ModuleGradesInterface, session: 'normal' | 'rattrapage') => {
    const exam = module.examSubmissions.find((e) => e.assignment.session === session)
    return exam?.assignment.lockedGrade === true
}

// Obtenir le statut d'une note (locked ou can change)
const getGradeStatus = (module: ModuleGradesInterface, session: 'normal' | 'rattrapage') => {
    return isGradeLocked(module, session) ? 'locked' : 'changeable'
}

// 🚀 OPTIMISATION : Computed pour pré-calculer les données des modules
const modulesData = computed(() => {
    const dataMap = new Map<string, {
        hasNormalExam: boolean
        hasNormalGrade: boolean
        normalGrade: number | null | undefined
        hasRattrapageExam: boolean
        hasRattrapageGrade: boolean
        rattrapageGrade: number | null | undefined
        finalGrade: number
        isNormalLocked: boolean
        isRattrapageLocked: boolean
        normalGradeStatus: string
        rattrapageGradeStatus: string
    }>()

    grades.value.forEach(unit => {
        unit.modules.forEach(module => {
            const normalExam = module.examSubmissions.find((exam) => exam.assignment.session === 'normal')
            const rattrapageExam = module.examSubmissions.find((exam) => exam.assignment.session === 'rattrapage')

            const normalGrade = normalExam?.submission.grade
            // Si rattrapage grade est 0, on le traite comme "pas d'examen"
            const rattrapageGradeRaw = rattrapageExam?.submission.grade
            const rattrapageGrade = (rattrapageGradeRaw === 0) ? null : rattrapageGradeRaw

            // Calculer la note finale: meilleure des 2, en ignorant les null
            let finalGrade = 0
            const hasValidNormal = normalGrade !== null && normalGrade !== undefined
            const hasValidRattrapage = rattrapageGrade !== null && rattrapageGrade !== undefined

            if (hasValidNormal && hasValidRattrapage) {
                // Les 2 existent, prendre la meilleure
                finalGrade = Math.max(normalGrade, rattrapageGrade)
            } else if (hasValidNormal) {
                finalGrade = normalGrade
            } else if (hasValidRattrapage) {
                finalGrade = rattrapageGrade
            }

            // Pour hasRattrapageGrade, on ignore les notes à 0
            const hasRattrapageGradeValid = !!(rattrapageExam && rattrapageGradeRaw !== null && rattrapageGradeRaw !== 0)

            dataMap.set(module._id, {
                hasNormalExam: !!normalExam,
                hasNormalGrade: !!(normalExam && normalExam.submission.grade !== null),
                normalGrade,
                hasRattrapageExam: !!rattrapageExam,
                hasRattrapageGrade: hasRattrapageGradeValid,
                rattrapageGrade: rattrapageGradeRaw,
                finalGrade,
                isNormalLocked: normalExam?.assignment.lockedGrade === true,
                isRattrapageLocked: rattrapageExam?.assignment.lockedGrade === true,
                normalGradeStatus: normalExam?.assignment.lockedGrade === true ? 'locked' : 'changeable',
                rattrapageGradeStatus: rattrapageExam?.assignment.lockedGrade === true ? 'locked' : 'changeable'
            })
        })
    })

    return dataMap
})
const loadingPdf = ref<boolean>(false)
const showPdfWarning = ref(false)

const askQrCode = async () => {
    try {
        const response = await axios.get(`/api/v1/gradesAuthentication/qrCode/student/${student.value?._id}/promotion/${promotion.value?._id}`)
        token.value = response.data.token
        showQrModal.value = true
    } catch (error: any) {
        toast.value = {
            message: error.response?.data || "Une erreur s'est produite lors de la génération du QR Code",
            show: true,
            title: "Erreur",
            type: "error"
        };
    }
}

const confirmDownloadPdf = async () => {
    showPdfWarning.value = false;
    await downloadPdf();
}

const downloadPdf = async () => {
    loadingPdf.value = true;
    try {
        const response = await axios.get(
            `/api/v1/submissions/transcript/promotion/${promotion.value?._id}/student/${student.value?._id}`,
            { responseType: 'blob' }
        );

        const contentType = response.headers['content-type'];

        // Si le serveur renvoie une erreur texte au lieu d'un PDF
        if (!contentType.includes('application/pdf')) {
            const text = await response.data.text(); // convertir le blob en texte
            throw new Error(text || 'Une erreur est survenue');
        }

        // Sinon, c'est bien un PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${promotion.value?.name}_${student.value?.matricule}.pdf`);
        document.body.appendChild(link);
        link.click();

    } catch (error: any) {
        let errorMessage = "Une erreur s'est produite lors du téléchargement du PDF";

        // Vérifier si c'est une erreur Axios avec réponse
        if (error.response?.data) {
            // Si c'est un blob, le convertir en texte
            if (error.response.data instanceof Blob) {
                try {
                    errorMessage = await error.response.data.text();
                } catch {
                    errorMessage = "Une erreur s'est produite lors du téléchargement du PDF";
                }
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            // Erreur lancée manuellement (conversion blob texte)
            errorMessage = error.message;
        }

        toast.value = {
            message: errorMessage,
            show: true,
            title: "Erreur",
            type: "error"
        };
    } finally {
        loadingPdf.value = false;
    }
}

const getInitials = (name?: string, firstName?: string) => {
    if (!name || !firstName) return 'ET';
    return `${firstName.charAt(0)}${name.charAt(0)}`.toUpperCase();
}

// Helper rapide pour récupérer les données d'un module
const getModuleData = (moduleId: string) => {
    return modulesData.value.get(moduleId)
}

// 🚀 OPTIMISATION : Computed pour les statistiques globales
const totalStats = computed(() => {
    let totalGrade = 0
    let totalCoefficient = 0
    let totalModules = 0
    let totalCredits = 0
    let completedModules = 0
    let pendingGrades = 0

    grades.value.forEach(unit => {
        totalCredits += unit.teachingUnit.credits
        unit.modules.forEach(module => {
            totalModules++
            const data = modulesData.value.get(module._id)
            if (data) {
                if (data.finalGrade > 0) {
                    totalGrade += data.finalGrade * module.coefficient
                    totalCoefficient += module.coefficient
                }
                if (data.finalGrade >= 10) {
                    completedModules++
                }
                if (!data.hasNormalGrade && data.hasNormalExam) {
                    pendingGrades++
                }
            }
        })
    })

    return {
        totalModules,
        totalCredits,
        completedModules,
        pendingGrades,
        average: totalCoefficient > 0 ? (totalGrade / totalCoefficient).toFixed(2) : '0.00'
    }
})

// 🚀 OPTIMISATION : Computed pour les moyennes par unité
const unitAverages = computed(() => {
    const averagesMap = new Map<string, number>()

    grades.value.forEach(unit => {
        let totalGrade = 0
        let totalCoefficient = 0

        unit.modules.forEach(module => {
            const data = modulesData.value.get(module._id)
            if (data && data.finalGrade > 0) {
                totalGrade += data.finalGrade * module.coefficient
                totalCoefficient += module.coefficient
            }
        })

        const average = totalCoefficient > 0 ? totalGrade / totalCoefficient : 0
        averagesMap.set(unit.teachingUnit._id, average)
    })

    return averagesMap
})

// Calculs et statistiques (conservés pour compatibilité)
const calculateTotal = () => {
    return totalStats.value.average
}

const calculateUnitAverage = (unit: AllGradesInterface) => {
    return unitAverages.value.get(unit.teachingUnit._id) || 0
}

const getTotalModules = () => {
    return totalStats.value.totalModules
}

const getTotalCredits = () => {
    return totalStats.value.totalCredits
}

const getCompletedModules = () => {
    return totalStats.value.completedModules
}

const getPendingGrades = () => {
    return totalStats.value.pendingGrades
}

const getUnitStatus = (unit: AllGradesInterface) => {
    const average = calculateUnitAverage(unit)
    if (average >= 10) return 'Validé'
    if (average > 0) return 'En cours'
    return 'Non commencé'
}

const getUnitStatusClass = (unit: AllGradesInterface) => {
    const average = calculateUnitAverage(unit)
    if (average >= 10) return 'status-valid'
    if (average > 0) return 'status-progress'
    return 'status-pending'
}

const getAverageClass = () => {
    const average = parseFloat(calculateTotal())
    if (average >= 16) return 'excellent'
    if (average >= 14) return 'very-good'
    if (average >= 12) return 'good'
    if (average >= 10) return 'passable'
    return 'insufficient'
}

const getGradeClass = (grade: number) => {
    if (grade >= 10) return 'passing'
    return 'failing'
}

// Obtenir l'état de la note finale
const getFinalGradeState = (moduleData: any) => {
    if (!moduleData) return 'no-exam'

    // Vérifier s'il y a une note finale
    if (moduleData.finalGrade !== null && moduleData.finalGrade !== undefined && moduleData.finalGrade > 0) {
        return 'has-grade'
    }

    // Vérifier s'il y a une note en attente
    if (moduleData.hasNormalGrade === false && moduleData.hasNormalExam) {
        return 'pending'
    }
    if (moduleData.hasRattrapageGrade === false && moduleData.hasRattrapageExam) {
        return 'pending'
    }

    // Pas d'examen
    return 'no-exam'
}

// Obtenir l'état d'affichage de la note rattrapage
const getRattrapageDisplayState = (moduleData: any) => {
    if (!moduleData) return 'no-exam'

    const rattrapageGradeRaw = moduleData.rattrapageGrade

    // Si note est 0 -> afficher tiret (étudiant n'a pas fait le rattrapage)
    if (rattrapageGradeRaw === 0) {
        return 'no-attempt'
    }

    // Si note est null ET examen existe -> En attente
    if (rattrapageGradeRaw === null && moduleData.hasRattrapageExam) {
        return 'pending'
    }

    // Si examen existe avec note valide -> Afficher la note
    if (moduleData.hasRattrapageGrade) {
        return 'has-grade'
    }

    // Pas d'examen
    return 'no-exam'
}

// Gestion de l'expansion
const toggleUnit = (unitId: string) => {
    const index = expandedUnits.value.indexOf(unitId)
    if (index > -1) {
        expandedUnits.value.splice(index, 1)
    } else {
        expandedUnits.value.push(unitId)
    }
}

const toggleExpandAll = () => {
    if (allExpanded.value) {
        expandedUnits.value = []
    } else {
        expandedUnits.value = grades.value.map(unit => unit.teachingUnit._id)
    }
    allExpanded.value = !allExpanded.value
}

const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

const handleAction = () => {
    openModal.value = true
}

const handleSecondaryAction = () => {
    console.log('Paramètres déclenchés')
}



watchEffect(async () => {
    if (route.params.student) {

        await fetchAllGrades()
    }
})
</script>
<style scoped>
.grades-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    background: var(--background-light);
    min-height: 100vh;
}

/* Header épuré */
.header-refined {
    background: var(--white);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
}

.header-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.brand-icon {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    padding: 0.75rem;
    border-radius: 12px;
    color: white;
    font-size: 1.5rem;
}

.brand-text {
    display: flex;
    flex-direction: column;
}

.header-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
    line-height: 1.2;
}

.header-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0.25rem 0 0 0;
    font-weight: 400;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

/* Boutons améliorés */
.btn-primary,
.btn-secondary,
.btn-tertiary {
    border: none;
    border-radius: 10px;
    padding: 0.875rem 1.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-secondary {
    background: var(--white);
    color: var(--text-secondary);
    border: 1.5px solid var(--border-light);
}

.btn-secondary:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
}

.btn-tertiary {
    background: transparent;
    color: var(--text-secondary);
    border: 1.5px solid var(--border-light);
}

.btn-tertiary:hover:not(:disabled) {
    background: var(--tertiary-extra-light);
    transform: translateY(-1px);
}

/* Layout principal */
.main-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    align-items: start;
}

/* Sidebar raffinée */
.sidebar-refined {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 2rem;
}

/* Cartes élégantes */
.card-elevated {
    background: var(--white);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-light);
    transition: all 0.2s ease;
}

.card-elevated:hover {
    box-shadow: var(--shadow-md);
}

/* Profil étudiant */
.student-profile {
    padding: 1.5rem;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.avatar-container {
    flex-shrink: 0;
}

.student-avatar {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.25rem;
    box-shadow: var(--shadow-sm);
}

.profile-info {
    flex: 1;
}

.student-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
}

.student-matricule {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 500;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--background-light);
    border-radius: 10px;
    transition: background-color 0.2s ease;
}

.contact-item:hover {
    background: var(--primary-extra-light);
}

.contact-icon {
    font-size: 1.125rem;
    color: var(--primary-color);
    flex-shrink: 0;
}

.contact-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Statistiques rapides */
.quick-stats {
    padding: 1.5rem;
}

.stats-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 1.25rem 0;
}

.stats-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.stat-item {
    display: flex;
    align-items: center;
    justify-content: between;
    padding: 1rem;
    background: var(--background-light);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.stat-item:hover {
    background: var(--primary-extra-light);
    transform: translateX(4px);
}

.stat-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.2;
}

.stat-value.excellent {
    color: var(--success);
}

.stat-value.very-good {
    color: var(--success-light);
}

.stat-value.good {
    color: var(--primary-color);
}

.stat-value.passable {
    color: var(--warning);
}

.stat-value.insufficient {
    color: var(--error);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.stat-indicator {
    width: 4px;
    height: 32px;
    border-radius: 2px;
    margin-left: 0.75rem;
}

.stat-indicator.mod {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
}

.stat-indicator.cred {
    background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
}

.stat-indicator.avg {
    background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
}

/* Contenu principal */
.content-main {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Navigation rapide */
.quick-nav {
    padding: 1.25rem 1.5rem;
    display: flex;
    gap: 0.5rem;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: transparent;
    border: 1.5px solid var(--border-light);
    border-radius: 10px;
    color: var(--text-secondary);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
}

.nav-btn:hover,
.nav-btn.active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.nav-icon {
    font-size: 1.125rem;
}

/* Indicateurs de statut */
.status-indicators {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
}

.indicator-group {
    display: flex;
    gap: 2rem;
}

.indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.indicator-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.indicator-dot.verified {
    background: var(--success);
}

.indicator-dot.pending {
    background: var(--warning);
}

/* Sections */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
}

.expand-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--background-light);
    border: 1.5px solid var(--border-light);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.expand-toggle:hover {
    background: var(--primary-extra-light);
    border-color: var(--primary-color);
    color: var(--primary-color);
}

/* Unités d'enseignement */
.units-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.unit-card {
    overflow: hidden;
}

.unit-summary {
    padding: 1.5rem;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s ease;
}

.unit-summary:hover {
    background: var(--background-light);
}

.unit-main {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.expand-icon {
    font-size: 1.25rem;
    color: var(--primary-color);
    transition: transform 0.2s ease;
}

.unit-details {
    flex: 1;
}

.unit-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
}

.unit-meta {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.unit-code {
    font-size: 0.875rem;
    color: var(--primary-color);
    background: var(--primary-extra-light);
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
}

.unit-credits {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.unit-performance {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.performance-badge {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    background: var(--background-light);
    border-radius: 10px;
    font-weight: 600;
}

.performance-score {
    font-size: 1.25rem;
    color: var(--text-dark);
}

.performance-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.unit-status {
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-valid {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
}

.status-progress {
    background: rgba(var(--warning-rgb), 0.1);
    color: var(--warning-dark);
}

.status-pending {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-secondary);
}

/* Modules détaillés - NOUVEAU STYLE */
.modules-details {
    border-top: 1px solid var(--border-light);
    padding: 1.5rem;
    background: var(--background-light);
}

.module-item {
    background: var(--white);
    border-radius: 12px;
    border: 1px solid var(--border-light);
    overflow: hidden;
    margin-bottom: 1rem;
}

.module-item:last-child {
    margin-bottom: 0;
}

/* Module Header */
.module-header {
    padding: 1.5rem;
    background: var(--white);
}

.module-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.module-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
    line-height: 1.3;
}

.module-specs {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.module-code {
    font-size: 0.875rem;
    color: var(--primary-color);
    background: var(--primary-extra-light);
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-weight: 600;
}

.module-coef,
.module-credits {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Séparateur */
.module-separator {
    height: 1px;
    background: linear-gradient(90deg,
            transparent 0%,
            var(--border-light) 20%,
            var(--border-light) 80%,
            transparent 100%);
    margin: 0 1.5rem;
}

/* Sessions alignées horizontalement */
.sessions-horizontal {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    padding: 1.5rem;
}

.session-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    position: relative;
}

.session-column:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 60%;
    background: var(--border-light);
}

.session-column.final {
    border-left: 1px solid var(--border-light);
    margin-left: -1px;
}

.session-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
}

.session-icon {
    font-size: 1.5rem;
    color: var(--text-secondary);
}

.session-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.session-grade {
    display: flex;
    justify-content: center;
    min-height: 60px;
    align-items: center;
}

.loading {
    min-height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Badges de notes */
.grade-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.2s ease;
    border: 1.5px solid transparent;
}

.grade-badge.passing {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
}

.grade-badge.failing {
    background: rgba(var(--error-rgb), 0.1);
    color: var(--error-dark);
}

.grade-badge.verified {
    border-color: var(--success);
}

.grade-badge.pending {
    border-color: var(--warning);
}

.grade-number {
    font-size: 1.125rem;
    font-weight: 700;
}

.grade-status {
    font-size: 1rem;
    color: var(--success);
}

.final-grade {
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 1.25rem;
    font-weight: 800;
    text-align: center;
    min-width: 100px;
}

.final-grade.passing {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: white;
}

.final-grade.failing {
    background: linear-gradient(135deg, var(--error), var(--error-dark));
    color: white;
}

.grade-placeholder {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--background-light);
    border-radius: 10px;
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.875rem;
}

.grade-absent {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: var(--background-light);
    border-radius: 10px;
    color: var(--text-tertiary);
    font-size: 1.125rem;
    font-weight: 300;
}

/* Section résumé */
.summary-section {
    margin-top: 1rem;
    padding: 2rem;
}

.summary-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--background-light);
    border-radius: 12px;
    transition: all 0.2s ease;
}

.summary-card:hover {
    background: var(--primary-extra-light);
    transform: translateY(-2px);
}

.summary-icon {
    font-size: 2rem;
    color: var(--primary-color);
}

.summary-content {
    display: flex;
    flex-direction: column;
}

.summary-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text-dark);
    margin-bottom: 0.25rem;
}

.summary-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* État vide */
.empty-state {
    padding: 4rem 2rem;
    text-align: center;
}

.empty-content {
    max-width: 400px;
    margin: 0 auto;
}

.empty-icon {
    font-size: 4rem;
    color: var(--tertiary-light);
    margin-bottom: 1.5rem;
    opacity: 0.5;
}

.empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.75rem 0;
}

.empty-text {
    color: var(--text-secondary);
    font-size: 1rem;
    margin: 0;
    line-height: 1.6;
}

/* Responsive */
@media (max-width: 1200px) {
    .main-layout {
        grid-template-columns: 280px 1fr;
        gap: 1rem;
    }
}

@media (max-width: 1024px) {
    .main-layout {
        grid-template-columns: 1fr;
    }

    .sidebar-refined {
        position: static;
        order: 2;
    }

    .content-main {
        order: 1;
    }

    .header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
    }

    .header-brand {
        justify-content: center;
        text-align: center;
    }

    .header-actions {
        justify-content: center;
    }

    .sessions-horizontal {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .session-column:not(:last-child)::after {
        display: none;
    }

    .session-column.final {
        border-left: none;
        border-top: 1px solid var(--border-light);
        padding-top: 1.5rem;
        margin-left: 0;
    }
}

@media (max-width: 768px) {
    .grades-container {
        padding: 1rem;
    }

    .header-refined {
        padding: 1.5rem;
    }

    .header-title {
        font-size: 1.5rem;
    }

    .header-actions {
        flex-direction: column;
    }

    .btn-primary,
    .btn-secondary,
    .btn-tertiary {
        justify-content: center;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .expand-toggle {
        align-self: center;
    }

    .unit-summary {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .unit-performance {
        justify-content: space-between;
    }

    .summary-cards {
        grid-template-columns: 1fr;
    }

    .module-specs {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .sessions-horizontal {
        padding: 1rem;
    }

    .session-column {
        padding: 0 0.5rem;
    }
}

@media (max-width: 640px) {
    .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .unit-main {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .expand-icon {
        align-self: center;
    }

    .unit-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}

/* Modal d'avertissement PDF */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.pdf-warning-modal {
    background: var(--white);
    border-radius: var(--radius-xl);
    max-width: 600px;
    width: 90%;
    padding: 2rem;
    box-shadow: var(--shadow-dark);
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.warning-modal-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--warning);
}

.warning-icon {
    font-size: 2rem;
    color: var(--warning);
}

.warning-modal-header h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-dark);
}

.warning-modal-body {
    margin-bottom: 2rem;
}

.warning-text {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%);
    border-left: 4px solid var(--warning);
    border-radius: var(--radius);
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-dark);
}

.warning-text svg {
    font-size: 1.5rem;
    color: var(--warning);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.warning-text strong {
    color: var(--warning-dark);
}

.warning-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.warning-details p {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0;
    padding: 0.75rem;
    background: var(--background-light);
    border-radius: var(--radius);
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-secondary);
}

.warning-details p svg {
    font-size: 1.25rem;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.125rem;
}

.warning-modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.warning-modal-actions .btn-warning {
    background: linear-gradient(135deg, var(--warning), var(--warning-dark));
    color: var(--white);
}

.warning-modal-actions .btn-warning:hover {
    background: linear-gradient(135deg, var(--warning-dark), var(--warning));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--warning-rgb), 0.3);
}

/* Responsive modal */
@media (max-width: 640px) {
    .pdf-warning-modal {
        padding: 1.5rem;
        width: 95%;
    }

    .warning-modal-header h3 {
        font-size: 1.25rem;
    }

    .warning-text {
        flex-direction: column;
        text-align: center;
    }

    .warning-modal-actions {
        flex-direction: column-reverse;
    }

    .warning-modal-actions button {
        width: 100%;
    }
}

/* Helper function pour les initiales */
</style>