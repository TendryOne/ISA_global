<template>
    <div class="tuition-fees-promotion-container">
        <BreadCrumbsBack />

        <SpinningLoader :loading="loading" />
        <ErrorComponent v-if="errorServer" :message="errorServer" @retry="fecthTutionFees" />

        <div v-if="tutionFees && !loading" class="fees-content">
            <!-- En-tête -->
            <div class="fees-header">
                <div class="header-gradient"></div>
                <div class="header-content">
                    <div class="header-icon-wrapper">
                        <Icon icon="material-symbols:receipt-long" class="header-icon" />
                    </div>
                    <div class="header-info">
                        <h1>Frais de Scolarité {{ tutionFees.year }}-{{ tutionFees.year + 1 }}</h1>
                        <div class="header-details">
                            <div class="detail-chip">
                                <Icon icon="material-symbols:school" />
                                <span>{{ tutionFees.field }}</span>
                            </div>
                            <div class="detail-chip">
                                <Icon icon="material-symbols:workspace-premium" />
                                <span>{{ tutionFees.level }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-amount">
                        <span class="amount-label">Montant total</span>
                        <span class="amount-value">{{ formatAmount(tutionFees.totalAmount) }} Ar</span>
                    </div>
                </div>
            </div>

            <!-- Résumé des paiements -->
            <div class="payment-summary">
                <div class="summary-card">
                    <div class="summary-icon paid">
                        <Icon icon="material-symbols:check-circle" />
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">Payé</span>
                        <span class="summary-value">{{ formatAmount(getTotalPaid()) }} Ar</span>
                    </div>
                </div>

                <!-- Prochaine échéance -->
                <div class="summary-card next-payment" :class="getNextPaymentClass()">
                    <div class="summary-icon next" :class="getNextPaymentClass()">
                        <Icon :icon="getNextPaymentIcon()" />
                    </div>
                    <div class="summary-content">
                        <span class="summary-label">{{ getNextPaymentLabel() }}</span>
                        <span class="summary-value next-payment-value">{{ getNextPaymentValue() }}</span>
                        <span v-if="getNextPaymentDate()" class="next-payment-date">
                            <Icon icon="material-symbols:event" />
                            {{ getNextPaymentDate() }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Liste des tranches -->
            <div class="installments-section">
                <h2 class="section-title">
                    <Icon icon="material-symbols:payments" />
                    <span>Échéancier de paiement</span>
                </h2>

                <div class="installments-list">
                    <div v-for="(installment, index) in tutionFees.installments" :key="index" class="installment-card"
                        :class="getInstallmentStatus(installment)">

                        <!-- Badge de statut -->
                        <div class="installment-status-badge" :class="getInstallmentStatus(installment)">
                            <Icon :icon="getStatusIcon(installment)" />
                            <span>{{ getStatusLabel(installment) }}</span>
                        </div>

                        <!-- En-tête de la tranche -->
                        <div class="installment-header">
                            <div class="installment-number">
                                <Icon icon="material-symbols:numbers" />
                                <span>Tranche {{ index + 1 }}</span>
                            </div>
                            <h3 class="installment-label">{{ installment.label }}</h3>
                            <div class="installment-amount">{{ formatAmount(installment.amount) }} Ar</div>
                        </div>

                        <!-- Détails de la tranche -->
                        <div class="installment-details">
                            <div class="detail-row">
                                <div class="detail-item">
                                    <Icon icon="material-symbols:event" class="detail-icon" />
                                    <div class="detail-content">
                                        <span class="detail-label">Date d'échéance</span>
                                        <span class="detail-value">{{ formatDate(installment.dueDate) }}</span>
                                    </div>
                                </div>
                                <div v-if="installment.paymentDate" class="detail-item">
                                    <Icon icon="material-symbols:calendar-today" class="detail-icon" />
                                    <div class="detail-content">
                                        <span class="detail-label">Date de paiement</span>
                                        <span class="detail-value">{{ formatDate(installment.paymentDate) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="installment.transactionRef" class="detail-row">
                                <div class="detail-item">
                                    <Icon icon="material-symbols:tag" class="detail-icon" />
                                    <div class="detail-content">
                                        <span class="detail-label">Référence</span>
                                        <span class="detail-value">{{ installment.transactionRef }}</span>
                                    </div>
                                </div>
                                <div v-if="installment.method" class="detail-item">
                                    <Icon icon="fluent:payment-16-filled" class="detail-icon" />
                                    <div class="detail-content">
                                        <span class="detail-label">Méthode</span>
                                        <span class="detail-value">{{ installment.method }}</span>
                                    </div>
                                </div>
                            </div>
                            <TheImageVisualizer v-if="installment.proofFile"
                                :url="`/api/v1/document?fullPath=${installment.proofFile}`" type="image"
                                :title="`${installment.label}`">
                                <template #trigger>
                                    <span>Voir la preuve de paiement</span>
                                </template>
                            </TheImageVisualizer>


                            <div v-if="installment.verified" class="verification-info">
                                <Icon icon="material-symbols:verified" />
                                <span>Paiement vérifié et validé</span>
                            </div>

                            <!-- Informations sur les rappels -->
                            <div v-if="!installment.method && (installment.numberOfReminders || installment.lastReminderDate)"
                                class="reminder-info">
                                <div class="reminder-header">
                                    <Icon icon="material-symbols:notification-important" />
                                    <span class="reminder-title">Rappels de paiement</span>
                                </div>
                                <div class="reminder-details">
                                    <div v-if="installment.numberOfReminders" class="reminder-item">
                                        <Icon icon="material-symbols:counter-1" class="reminder-icon" />
                                        <div class="reminder-content">
                                            <span class="reminder-label">Nombre de rappels</span>
                                            <span class="reminder-value">{{ installment.numberOfReminders }}
                                                rappel(s)</span>
                                        </div>
                                    </div>
                                    <div v-if="installment.lastReminderDate" class="reminder-item">
                                        <Icon icon="material-symbols:schedule" class="reminder-icon" />
                                        <div class="reminder-content">
                                            <span class="reminder-label">Dernier rappel envoyé</span>
                                            <span class="reminder-value">{{ formatDate(installment.lastReminderDate)
                                            }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <!-- Actions -->
                        <div class="installment-actions">
                            <button
                                v-if="!installment.verified && (!installment.proofFile && !installment.transactionRef)"
                                @click="openPaymentModal(installment)" class="action-btn pay-now">
                                <Icon icon="material-symbols:add-card" />
                                <span>Effectuer le paiement</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <TheStudentTutionFeesForm v-if="installmentInModal" @submit="handleSubmitPayment"
            @close="installmentInModal = null" :installment="installmentInModal" :loading="loadingForm" />

        <SuccessToast v-if="toast.show" :title="toast.title" :message="toast.message" :type="toast.type"
            @dismissed="toast.show = false" />

    </div>
</template>

<script setup lang="ts">
import TheImageVisualizer from '@/components/images/TheImageVisualizer.vue';
import { Icon } from '@iconify/vue';
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import TheStudentTutionFeesForm from '@/components/student/TheStudentTutionFeesFormModal.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import type TutionFeesInterface from '@/interfaces/tutionFees.interface';
import type { InstallmentsInterface } from '@/interfaces/tutionFees.interface';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SuccessToast from '@/components/toast/successToast.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
import { useSocket } from '@/composables/useSocket';

const toast = ref<ToastInterface>({
    show: false,
    message: '',
    type: 'success',
    title: "Success"
})

const loading = ref<boolean>(false)
const errorServer = ref<string>("");
const tutionFees = ref<TutionFeesInterface | null>(null);
const loadingForm = ref<boolean>(false);


const route = useRoute();

const fecthTutionFees = async () => {
    try {
        loading.value = true;
        const response = await axios.get(`/api/v1/tutionFees/student/promotion/${route.params.promotionId}`);
        tutionFees.value = response.data;
    } catch (error: any) {
        errorServer.value = error.response?.data || "Une erreur est survenue";
    } finally {
        loading.value = false;
    }
}

const { emit } = useSocket()

const handleSubmitPayment = async (formData: FormData) => {
    if (!installmentInModal.value) return;

    try {
        loadingForm.value = true
        const response = await axios.patch(
            `/api/v1/tutionFees/student/payment/${tutionFees.value!._id}/${installmentInModal.value.label}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        tutionFees.value = response.data;
        emit("sendNotificationForFeesByStudent", ({ tutionFees: tutionFees.value }))
        installmentInModal.value = null;

        toast.value = {
            show: true,
            title: "Succès",
            message: "Paiement soumis avec succès , en attente de validation !",
            type: "success"
        };

    } catch (error: any) {
        toast.value = {
            show: true,
            title: "Erreur",
            message: error.response?.data || "Erreur lors de la soumission du paiement",
            type: "error"
        };
    } finally {
        loadingForm.value = false;
    }
}

const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
}

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const getTotalPaid = () => {
    if (!tutionFees.value) return 0;
    return tutionFees.value.installments
        .filter(i => i.verified)
        .reduce((sum, i) => sum + i.amount, 0);
}

const getTotalPending = () => {
    if (!tutionFees.value) return 0;
    return tutionFees.value.installments
        .filter(i => i.proofFile && !i.verified)
        .reduce((sum, i) => sum + i.amount, 0);
}

const getTotalRemaining = () => {
    if (!tutionFees.value) return 0;
    return tutionFees.value.installments
        .filter(i => !i.proofFile)
        .reduce((sum, i) => sum + i.amount, 0);
}

// Fonctions pour la prochaine échéance
const getNextInstallmentToPay = () => {
    if (!tutionFees.value) return null;

    // Trouver la première tranche non vérifiée et sans preuve
    return tutionFees.value.installments.find(i => !i.verified && !i.proofFile);
}

const getNextPaymentLabel = () => {
    if (!tutionFees.value) return '';

    const allPaid = tutionFees.value.installments.every(i => i.verified);
    if (allPaid) {
        return 'Statut';
    }

    const nextInstallment = getNextInstallmentToPay();
    if (nextInstallment) {
        return 'Prochaine échéance';
    }

    return 'En attente de validation';
}

const getNextPaymentValue = () => {
    if (!tutionFees.value) return '';

    const allPaid = tutionFees.value.installments.every(i => i.verified);
    if (allPaid) {
        return 'Tout payé ✓';
    }

    const nextInstallment = getNextInstallmentToPay();
    if (nextInstallment) {
        return `${formatAmount(nextInstallment.amount)} Ar`;
    }

    const pendingCount = tutionFees.value.installments.filter(i => i.proofFile && !i.verified).length;
    return `${pendingCount} en attente`;
}

const getNextPaymentDate = () => {
    const nextInstallment = getNextInstallmentToPay();
    if (!nextInstallment) return '';

    return formatDate(nextInstallment.dueDate);
}

const getNextPaymentIcon = () => {
    if (!tutionFees.value) return 'material-symbols:schedule';

    const allPaid = tutionFees.value.installments.every(i => i.verified);
    if (allPaid) {
        return 'material-symbols:check-circle';
    }

    const nextInstallment = getNextInstallmentToPay();
    if (nextInstallment) {
        const now = new Date();
        const dueDate = new Date(nextInstallment.dueDate);
        if (now > dueDate) {
            return 'material-symbols:warning';
        }
        return 'material-symbols:schedule';
    }

    return 'material-symbols:pending';
}

const getNextPaymentClass = () => {
    if (!tutionFees.value) return '';

    const allPaid = tutionFees.value.installments.every(i => i.verified);
    if (allPaid) {
        return 'all-paid';
    }

    const nextInstallment = getNextInstallmentToPay();
    if (nextInstallment) {
        const now = new Date();
        const dueDate = new Date(nextInstallment.dueDate);
        if (now > dueDate) {
            return 'overdue';
        }
        return 'upcoming';
    }

    return 'pending';
}

const getInstallmentStatus = (installment: InstallmentsInterface) => {
    if (installment.verified) return 'paid';
    if ((installment.proofFile || installment.transactionRef) && !installment.verified) return 'pending';
    const now = new Date();
    const dueDate = new Date(installment.dueDate);
    if (now > dueDate) return 'overdue';
    return 'unpaid';
}

const getStatusIcon = (installment: InstallmentsInterface) => {
    const status = getInstallmentStatus(installment);
    const icons: Record<string, string> = {
        'paid': 'material-symbols:check-circle',
        'pending': 'material-symbols:pending',
        'overdue': 'material-symbols:warning',
        'unpaid': 'material-symbols:schedule'
    }
    return icons[status] || 'material-symbols:help';
}

const getStatusLabel = (installment: InstallmentsInterface) => {
    const status = getInstallmentStatus(installment);
    const labels: Record<string, string> = {
        'paid': 'Payé',
        'pending': 'En attente de validation',
        'overdue': 'En retard',
        'unpaid': 'Non payé'
    }
    return labels[status] || 'Inconnu';
}

const viewProof = (proofFile: string) => {
    window.open(proofFile, '_blank');
}

const installmentInModal = ref<InstallmentsInterface | null>(null);

const openPaymentModal = (installment: InstallmentsInterface) => {
    installmentInModal.value = installment;
}

onMounted(() => {
    fecthTutionFees();
});

</script>

<style scoped>
.tuition-fees-promotion-container {
    min-height: 100vh;
    background: var(--background-light);
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
}

.fees-content {
    margin-top: 2rem;
}

/* Header */
.fees-header {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.header-gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    z-index: 1;
}

.header-content {
    position: relative;
    z-index: 2;
    padding: 2.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    color: white;
}

.header-icon-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.header-icon {
    font-size: 2.5rem;
}

.header-info {
    flex: 1;
}

.header-info h1 {
    margin: 0 0 0.75rem 0;
    font-size: 2rem;
    font-weight: 700;
}

.header-details {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: flex-start;
}

.detail-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.detail-chip svg {
    font-size: 1.2rem;
}

.header-amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.amount-label {
    font-size: 0.9rem;
    opacity: 0.9;
}

.amount-value {
    font-size: 2rem;
    font-weight: 700;
}

/* Payment Summary */
.payment-summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.summary-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.summary-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    flex-shrink: 0;
}

.summary-icon.paid {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--success-dark);
}

.summary-icon.next {
    font-size: 2rem;
}

.summary-icon.next.all-paid {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--success-dark);
}

.summary-icon.next.upcoming {
    background: rgba(var(--primary-rgb), 0.15);
    color: var(--primary-color);
}

.summary-icon.next.overdue {
    background: rgba(var(--error-rgb), 0.15);
    color: var(--error);
}

.summary-icon.next.pending {
    background: rgba(var(--warning-rgb), 0.15);
    color: var(--warning-dark);
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.summary-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.summary-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-dark);
}

/* Next Payment Styles */
.summary-card.next-payment {
    position: relative;
    overflow: hidden;
}

.summary-card.next-payment.all-paid {
    border: 2px solid var(--success);
    background: linear-gradient(135deg, rgba(var(--success-rgb), 0.05), white);
}

.summary-card.next-payment.upcoming {
    border: 2px solid var(--primary-color);
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), white);
}

.summary-card.next-payment.overdue {
    border: 2px solid var(--error);
    background: linear-gradient(135deg, rgba(var(--error-rgb), 0.05), white);
}

.summary-card.next-payment.pending {
    border: 2px solid var(--warning);
    background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.05), white);
}

.next-payment-value {
    font-size: 1.35rem;
}

.next-payment-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.next-payment-date svg {
    font-size: 1rem;
}

/* Installments Section */
.installments-section {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0 0 2rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-dark);
}

.section-title svg {
    font-size: 1.75rem;
    color: var(--primary-color);
}

.installments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Installment Card */
.installment-card {
    background: white;
    border-radius: 12px;
    border: 2px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.installment-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
}

.installment-card.paid {
    border-color: var(--success);
}

.installment-card.paid::before {
    background: linear-gradient(90deg, var(--success-dark), var(--success));
}

.installment-card.pending {
    border-color: var(--warning);
}

.installment-card.pending::before {
    background: linear-gradient(90deg, var(--warning-dark), var(--warning));
}

.installment-card.overdue {
    border-color: var(--error);
}

.installment-card.overdue::before {
    background: linear-gradient(90deg, var(--error), var(--error-light));
}

.installment-card.unpaid {
    border-color: #e2e8f0;
}

.installment-card.unpaid::before {
    background: linear-gradient(90deg, #94a3b8, #cbd5e1);
}

.installment-status-badge {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 10;
}

.installment-status-badge.paid {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--success-dark);
}

.installment-status-badge.pending {
    background: rgba(var(--warning-rgb), 0.15);
    color: var(--warning-dark);
}

.installment-status-badge.overdue {
    background: rgba(var(--error-rgb), 0.15);
    color: var(--error);
}

.installment-status-badge.unpaid {
    background: rgba(100, 116, 139, 0.15);
    color: #475569;
}

.installment-status-badge svg {
    font-size: 1.1rem;
}

.installment-header {
    padding: 2rem 2rem 1.5rem;
    background: linear-gradient(to bottom, #f8fafc, white);
    border-bottom: 1px solid #e2e8f0;
}

.installment-number {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--primary-color);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
}

.installment-number svg {
    font-size: 1.1rem;
}

.installment-label {
    margin: 0 0 0.75rem 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.3;
    padding-right: 10rem;
}

.installment-amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
}

.installment-details {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.detail-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.detail-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--primary-extra-light);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.detail-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-value {
    font-size: 0.95rem;
    color: var(--text-dark);
    font-weight: 600;
}

.verification-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(var(--success-rgb), 0.1);
    border-radius: 8px;
    color: var(--success-dark);
    font-weight: 600;
    font-size: 0.95rem;
}

.verification-info svg {
    font-size: 1.5rem;
}

/* Reminder Info */
.reminder-info {
    margin-top: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.05), rgba(255, 193, 7, 0.05));
    border: 1px solid rgba(255, 152, 0, 0.2);
    border-radius: 10px;
}

.reminder-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 152, 0, 0.15);
}

.reminder-header svg {
    font-size: 1.5rem;
    color: var(--warning-dark);
}

.reminder-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--warning-dark);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.reminder-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.reminder-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.reminder-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(255, 152, 0, 0.15);
    color: var(--warning-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
}

.reminder-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.reminder-label {
    font-size: 0.7rem;
    color: var(--warning-dark);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
}

.reminder-value {
    font-size: 0.9rem;
    color: var(--text-dark);
    font-weight: 700;
}

.installment-actions {
    padding: 1.5rem 2rem 2rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
}

.action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
}

.action-btn svg {
    font-size: 1.25rem;
}

.view-proof {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
}

.view-proof:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
}

.pay-now {
    background: linear-gradient(135deg, var(--success), var(--success-dark));
    color: white;
    flex: 1;
}

.pay-now:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--success-rgb), 0.4);
}

/* Responsive */
@media (max-width: 768px) {
    .tuition-fees-promotion-container {
        padding: 1rem;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1.5rem;
    }

    .header-info h1 {
        font-size: 1.5rem;
    }

    .header-amount {
        align-items: center;
    }

    .amount-value {
        font-size: 1.5rem;
    }

    .payment-summary {
        grid-template-columns: 1fr;
    }

    .installments-section {
        padding: 1.5rem;
    }

    .installment-header {
        padding: 1.5rem;
    }

    .installment-label {
        font-size: 1.1rem;
        padding-right: 0;
        margin-bottom: 1rem;
    }

    .installment-status-badge {
        position: static;
        margin-bottom: 1rem;
        align-self: flex-start;
    }

    .detail-row {
        grid-template-columns: 1fr;
    }

    .reminder-details {
        grid-template-columns: 1fr;
    }

    .installment-actions {
        flex-direction: column;
    }

    .header-details {

        justify-content: center;
    }
}
</style>