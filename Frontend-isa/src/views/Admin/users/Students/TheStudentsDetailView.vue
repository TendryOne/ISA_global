<template>
    <div class="student-detail-container">
        <BreadCrumbsBack />

        <!-- Loader -->
        <SpinningLoader :loading="loading" />
        <ErrorComponent v-if="errorServer" :message="errorServer" @retry="fetchStudent" />

        <!-- Fiche scolaire -->
        <div v-if="!loading && !errorServer && student" class="student-record">
            <!-- En-tête de la fiche -->
            <div class="record-header">
                <div class="header-content">
                    <div v-if="student.identityPhoto" class="student-photo-container">
                        <img :src="`/api/v1/document?fullPath=${student.identityPhoto}`"
                            :alt="`Photo d'identité de ${student.firstName} ${student.name}`"
                            class="student-identity-photo" />
                    </div>
                    <div v-else class="student-avatar-large">
                        {{ student.firstName.charAt(0) }}{{ student.name.charAt(0) }}
                    </div>
                    <div class="student-identity">
                        <h1>{{ student.firstName }} {{ student.name }}</h1>
                        <p class="matricule">Matricule : {{ student.matricule }}</p>
                        <div class="identity-badges">
                            <span class="badge-level">
                                <Icon icon="material-symbols:workspace-premium" />
                                {{ student.level }}
                            </span>
                            <span class="badge-year">
                                <Icon icon="material-symbols:school" />
                                {{ student.field.toUpperCase() }}
                            </span>
                            <span :class="['badge-gender', student.gender === 'male' ? 'male' : 'female']">
                                <Icon
                                    :icon="student.gender === 'male' ? 'material-symbols:male' : 'material-symbols:female'" />
                                {{ student.gender === 'male' ? 'Masculin' : 'Féminin' }}
                            </span>
                        </div>
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
                </div>
            </div>

            <!-- Informations personnelles -->
            <div class="section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:person" />
                    Informations Personnelles
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:badge" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Nom complet</span>
                            <span class="info-value">{{ student.firstName }} {{ student.name }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:fingerprint" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">CIN</span>
                            <span class="info-value">{{ student.cin || 'Non renseigné' }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:cake" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Date de naissance</span>
                            <span class="info-value">{{ formatDate(student.birthDate) }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:location-city" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Lieu de naissance</span>
                            <span class="info-value">{{ student.birthPlace || 'Non renseigné' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact -->
            <div class="section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:contact-phone" />
                    Informations de Contact
                </h2>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:mail" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Email</span>
                            <span class="info-value">{{ student.email }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:phone" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Téléphone</span>
                            <span class="info-value">{{ student.phone || 'Non renseigné' }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:contact-emergency" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Contact d'urgence</span>
                            <span class="info-value">{{ student.emergencyContactName || 'Non renseigné' }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:phone-in-talk" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Téléphone d'urgence</span>
                            <span class="info-value">{{ student.emergencyContactPhone || 'Non renseigné' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cursus actuel -->
            <div class="section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:school" />
                    Cursus Actuel
                </h2>
                <div class="info-grid">
                    <div class="info-card highlight">
                        <div class="info-icon">
                            <Icon icon="material-symbols:school" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Filière</span>
                            <span class="info-value">{{ student.field.toUpperCase() }}</span>
                        </div>
                    </div>

                    <div class="info-card highlight">
                        <div class="info-icon">
                            <Icon icon="material-symbols:workspace-premium" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Niveau</span>
                            <span class="info-value">{{ student.level }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:calendar-month" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Date d'inscription</span>
                            <span class="info-value">{{ formatDate(student.createdAt) }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:numbers" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Matricule</span>
                            <span class="info-value">{{ student.matricule }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Parcours antérieur -->
            <div class="section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:history-edu" />
                    Parcours Antérieur
                </h2>
                <div class="info-grid">


                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:menu-book" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Série BAC</span>
                            <span class="info-value">{{ student.bacSeries || 'Non renseigné' }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:event" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Année BAC</span>
                            <span class="info-value">{{ student.bacYear || 'Non renseigné' }}</span>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-icon">
                            <Icon icon="material-symbols:domain" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Établissement précédent</span>
                            <span class="info-value">{{ student.previousInstitution || 'Non renseigné' }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Parcours antérieur -->
            <div class="section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:history-edu" />
                    Document fournis
                </h2>
                <div class="info-grid">


                    <TheImageVisualizer title="CIN " :url="`/api/v1/document?fullPath=${student.idDocument}`"
                        v-if="student.idDocument" type="image" />
                    <div v-else class="info-card danger">
                        <div class="info-icon">
                            <Icon icon="material-symbols:badge" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">CIN </span>
                            <span class="info-value">Non renseigné</span>
                        </div>
                    </div>
                    <TheImageVisualizer title="Relevé de notes BAC"
                        :url="`/api/v1/document?fullPath=${student.bacTranscript}`" v-if="student.bacTranscript"
                        type="image" />
                    <div v-else class="info-card danger">
                        <div class="info-icon">
                            <Icon icon="material-symbols:grade" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Relevé de notes BAC</span>
                            <span class="info-value">Non renseigné</span>
                        </div>
                    </div>
                    <TheImageVisualizer title="Certificat de résidence"
                        :url="`/api/v1/document?fullPath=${student.residenceCertificate}`"
                        v-if="student.residenceCertificate" type="image" />
                    <div v-else class="info-card danger">
                        <div class="info-icon">
                            <Icon icon="ic:outline-place" />
                        </div>
                        <div class="info-content">
                            <span class="info-label">Certificat de résidence</span>
                            <span class="info-value">Non renseigné</span>
                        </div>
                    </div>



                </div>
            </div>

            <!-- Historique d'activité -->
            <div class="section">
                <div class="section-header">
                    <h2 class="section-title">
                        <Icon icon="material-symbols:history" />
                        Historique d'activité
                    </h2>
                    <ActionButton @click="openActivityYearView = !openActivityYearView"
                        :icon="openActivityYearView ? 'mdi:eye-off' : 'mdi:eye'" size="small">
                        {{ openActivityYearView ? 'Cacher' : 'Voir' }}
                    </ActionButton>
                </div>
                <div v-if="openActivityYearView" class="activity-content">
                    <ActivityYearView :user="student" />
                </div>
                <div v-else class="activity-empty">
                    <Icon icon="material-symbols:visibility-off" />
                    <p>Cliquez sur « Voir » pour afficher l'historique d'activité</p>
                </div>
            </div>

            <!-- Historique de Parcours -->
            <div class="section" v-if="student.parcours && student.parcours.length > 0">
                <h2 class="section-title">
                    <Icon icon="material-symbols:timeline" />
                    Historique de Parcours
                </h2>
                <div class="parcours-list">
                    <div v-for="(item, index) in student.parcours" :key="index" class="parcours-item"
                        :class="item.status.replace(' ', '-')">
                        <div class="parcours-status">
                            <Icon v-if="item.status === 'in progress'" icon="material-symbols:play-circle" />
                            <Icon v-else-if="item.status === 'completed'" icon="material-symbols:check-circle" />
                            <Icon v-else-if="item.status === 'dropped'" icon="material-symbols:cancel" />
                            <Icon v-else icon="mdi:replay" />
                            <span>{{ getStatusLabel(item.status) }}</span>
                        </div>
                        <div class="parcours-info">
                            <h4>{{ (item.promotion as PromotionInterface)?.name || 'Promotion non définie' }}</h4>
                            <div class="parcours-dates" v-if="item.promotion">
                                <span v-if="(item.promotion as PromotionInterface).startDate">
                                    <Icon icon="material-symbols:calendar-today" />
                                    Début: {{ formatDate((item.promotion as PromotionInterface).startDate) }}
                                </span>
                                <span v-if="(item.promotion as PromotionInterface).endDate">
                                    <Icon icon="material-symbols:event-available" />
                                    Fin: {{ formatDate((item.promotion as PromotionInterface).endDate) }}
                                </span>
                            </div>
                        </div>
                        <div>
                            <ActionButton icon="mdi:eye-circle" size="small" @click="ViewGrades(item.promotion as PromotionInterface)">
                                voir note
                            </ActionButton>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Actions -->
            <div class="actions-section">

                <ActionButton :icon="student.isRestricted ? 'material-symbols:lock-open' : 'material-symbols:lock'"
                    :variant="student.isRestricted ? 'secondary' : 'warning'" @click="openModal = true">
                    {{ student.isRestricted ? 'Débloquer' : 'Restreindre' }}
                </ActionButton>
                <ActionButton variant="primary" icon="mdi:account-cancel" @click="openModalModify = true">
                    Modifier l'étudiant
                </ActionButton>
                <ActionButton variant="danger" icon="mdi:delete-circle" @click="openModalDelete = true">
                    Supprimer l'étudiant
                </ActionButton>

            </div>
        </div>
    </div>
    <ModalConfirmation :show="openModal" variant="checkbox"
        :title="!student?.isRestricted ? `Restreindre l’accès de l’étudiant` : `Débloquer l’accès de l’étudiant`"
        checkboxLabel="Je confirme avoir pris connaissance des conséquences de cette action"
        :variantClass="!student?.isRestricted ? 'warning' : 'danger'" @confirm="toggleRestriction"
        @close="openModal = false" />

    <ModalConfirmation :show="openModalDelete" variant="text-confirmation"
        message="Êtes-vous sûr de vouloir supprimer cet étudiant ?" variant-class="danger"
        :confirmation-text="student?.matricule" title="Supprimer l’étudiant" @confirm="deleteStudent"
        @close="openModalDelete = false" />

    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
        @dismissed="toast.show = false" />

    <StudentModalModify :show="openModalModify" :student="student" @close="openModalModify = false"
        @submit="handleSubmit" />

</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import type StudentInterface from '@/interfaces/student.intefaces';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionButton from '@/components/ui/ActionButton.vue';
import DocumentCard from '@/components/admin/Admission/DocumentCard.vue';
import TheImageVisualizer from '@/components/images/TheImageVisualizer.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import SuccessToast from '@/components/toast/successToast.vue';
import ModalConfirmation from '@/components/modal/ModalConfirmation.vue';
import StudentModalModify from '@/components/admin/users/StudentModalModify.vue';
import type PromotionInterface from '@/interfaces/promotion.interface';
import ActivityYearView from '@/components/heatmap/ActivityYearView.vue';

const openActivityYearView = ref<boolean>(false);
const openModalModify = ref<boolean>(false);
const openModalDelete = ref<boolean>(false);
const openModal = ref<boolean>(false);
const loading = ref<boolean>(false);
const errorServer = ref<string>("");
const student = ref<StudentInterface | null>(null);
const route = useRoute()
const router = useRouter()
const toast = ref<ToastInterface>({
    message: '',
    show: false,
    title: 'succes',
    type: 'success'
})

const ViewGrades = (promotion: PromotionInterface) => {
    router.push(`/admin/grades/${student.value?.field}/${promotion.level}/${promotion._id}/${student.value?._id}`);
}


const toggleRestriction = async () => {
    try {
        await axios.patch(`/api/v1/students/${student.value?._id}/toggle-restriction`);

        if (student.value) {
            student.value!.isRestricted = !student.value!.isRestricted;
        }
        toast.value = {
            message: !student.value!.isRestricted ? 'L\'étudiant a été débloqué' : 'L\'étudiant a été restreint',
            show: true,
            title: 'Succès',
            type: 'success'
        };

        openModal.value = false;

    } catch (error) {
        toast.value = {
            message: axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue lors du changement de statut',
            show: true,
            title: 'Erreur',
            type: 'error'
        }
    }
}

const deleteStudent = async () => {
    try {
        const response = await axios.delete(`/api/v1/students/${student.value?._id}`);
        toast.value = {
            message: 'L\'étudiant a été supprimé avec succès',
            show: true,
            title: 'Succès',
            type: 'success'
        }
        student.value = null;
        router.push('/admin/users/students');
    } catch (error) {
        toast.value = {
            message: axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue lors de la suppression de l’étudiant',
            show: true,
            title: 'Erreur',
            type: 'error'
        }
    }
}

const handleSubmit = async (values: StudentInterface) => {
    try {
        await axios.patch(`/api/v1/students/${student.value?._id}`, values);

        student.value = { ...student.value, ...values };
        toast.value = {
            message: 'Les informations de l\'étudiant ont été mises à jour avec succès',
            show: true,
            title: 'Succès',
            type: 'success'
        }
        openModalModify.value = false;
    } catch (error) {
        toast.value = {
            message: axios.isAxiosError(error) && error.response ? error.response.data : 'Une erreur est survenue lors de la modification de l’étudiant',
            show: true,
            title: 'Erreur',
            type: 'error'
        }
    }
}


const fetchStudent = async () => {
    errorServer.value = "";
    try {
        loading.value = true;
        const response = await axios.get(`/api/v1/students/${route.params.id}`);
        student.value = response.data;
    } catch (error: any) {
        errorServer.value = axios.isAxiosError(error) && error.response ? error.response.data : "Une erreur est survenue";
    } finally {
        loading.value = false;
    }
}

const formatDate = (date: string | Date) => {
    if (!date) return 'Non renseigné';
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'in progress': 'En cours',
        'completed': 'Terminé',
        'dropped': 'Abandonné',
        'repeated': 'Redoublé'
    };
    return labels[status] || status;
}




onMounted(async () => {
    await fetchStudent();
});
</script>

<style scoped>
.student-detail-container {
    min-height: 100vh;
    background: var(--background-light);
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

/* Fiche scolaire */
.student-record {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    margin-top: 1.5rem;
}

/* Header de la fiche */
.record-header {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    padding: 2rem;
    position: relative;
}

.header-content {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.student-avatar-large {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: white;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    flex-shrink: 0;
}

.student-photo-container {
    position: relative;
    flex-shrink: 0;
}

.student-identity-photo {
    width: 120px;
    height: 160px;
    object-fit: cover;
    border-radius: 8px;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.student-identity h1 {
    margin: 0 0 0.375rem 0;
    font-size: 1.75rem;
    font-weight: 700;
}

.matricule {
    margin: 0 0 0.75rem 0;
    font-size: 0.9375rem;
    opacity: 0.9;
    font-weight: 600;
}

.identity-badges {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.badge-level,
.badge-year {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 24px;
    font-size: 0.875rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.badge-gender {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 24px;
    font-size: 0.875rem;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.badge-gender.male {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%);
    color: #ffffff;
}

.badge-gender.female {
    background: linear-gradient(135deg, rgba(236, 72, 153, 0.3) 0%, rgba(219, 39, 119, 0.3) 100%);
    color: #ffffff;
}

.badge-level svg,
.badge-year svg {
    font-size: 1rem;
}

.badge-gender svg {
    font-size: 1rem;
}

.status-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

}

.status-badges .badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.status-badges .badge svg {
    font-size: 0.875rem;
}

.status-badges .badge.verified {
    background: rgba(var(--success-rgb), 0.2);
    color: white;
}

.status-badges .badge.not-verified {
    background: rgba(var(--warning-rgb), 0.2);
    color: white;
}

.status-badges .badge.restricted {
    background: rgba(var(--error-rgb), 0.2);
    color: white;
}

/* Sections */
.section {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.section:last-of-type {
    border-bottom: none;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-dark);
}

.section-title svg {
    font-size: 1.375rem;
    color: var(--primary-color);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.section-header .section-title {
    margin: 0;
}

.activity-content {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.activity-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px dashed #e2e8f0;
    color: var(--text-secondary);
    text-align: center;
}

.activity-empty svg {
    font-size: 2rem;
    opacity: 0.5;
}

.activity-empty p {
    margin: 0;
    font-size: 0.9375rem;
}

/* Info Grid */
.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
}

.info-card {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.info-card:hover {
    border-color: var(--primary-color);
}

.info-card.highlight {
    background: rgba(var(--primary-rgb), 0.05);
    border-color: var(--primary-color);
}

.info-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.info-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.info-label {
    font-size: 0.6875rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 0.9375rem;
    color: var(--text-dark);
    font-weight: 600;
    word-wrap: break-word;
}

/* Parcours List */
.parcours-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.parcours-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #e2e8f0;
    border-radius: 6px;
}

.parcours-item.in-progress {
    border-left-color: var(--primary-color);
    background: rgba(var(--primary-rgb), 0.02);
}

.parcours-item.completed {
    border-left-color: var(--success);
    background: rgba(var(--success-rgb), 0.02);
}

.parcours-item.dropped {
    border-left-color: var(--error);
    background: rgba(var(--error-rgb), 0.02);
}

.parcours-item.repeated {
    border-left-color: var(--warning);
    background: rgba(var(--warning-rgb), 0.02);
}

.parcours-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    min-width: 80px;
}

.parcours-status svg {
    font-size: 1.5rem;
}

.parcours-item.in-progress .parcours-status {
    color: var(--primary-color);
}

.parcours-item.completed .parcours-status {
    color: var(--success);
}

.parcours-item.dropped .parcours-status {
    color: var(--error);
}

.parcours-item.repeated .parcours-status {
    color: var(--warning);
}

.parcours-status span {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
}

.parcours-info {
    flex: 1;
}

.parcours-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dark);
}

.parcours-dates {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.parcours-dates span {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.parcours-dates svg {
    font-size: 1rem;
}

/* Actions Section */
.actions-section {
    padding: 1.5rem 2rem;
    background: #f8fafc;
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    border-top: 2px solid #e2e8f0;
    justify-content: flex-end;
}

.btn-action {
    flex: 1;
    min-width: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    background: white;
    color: var(--text-dark);
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-action svg {
    font-size: 1.25rem;
}

.btn-action:hover {
    border-color: var(--primary-color);
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

.btn-action.verify {
    border-color: var(--success);
    color: var(--success);
}

.btn-action.verify:hover {
    background: var(--success);
    color: white;
}

.btn-action.unverify {
    border-color: var(--warning);
    color: var(--warning);
}

.btn-action.unverify:hover {
    background: var(--warning);
    color: white;
}


.info-card.danger .info-icon {
    background: var(--error);
}

.info-card.danger {
    border-color: var(--error);
    background: rgba(var(--error-rgb), 0.1);
}


/* Responsive */
@media (max-width: 768px) {
    .student-detail-container {
        padding: 1rem;
    }

    .record-header {
        padding: 1.5rem;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
    }

    .student-identity h1 {
        font-size: 1.5rem;
    }

    .section {
        padding: 1.25rem 1.5rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .actions-section {
        padding: 1.25rem 1.5rem;
        flex-direction: column;
    }

    .identity-badges {

        justify-content: center;
    }

    .btn-action {
        min-width: 100%;
    }

    .parcours-item {
        flex-direction: column;
    }

    .parcours-status {
        flex-direction: row;
    }

    .status-badges {
        justify-content: center;
    }
}
</style>
