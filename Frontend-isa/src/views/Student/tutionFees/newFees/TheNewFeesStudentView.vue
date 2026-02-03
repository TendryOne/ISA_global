<template>
    <div class="fees-container">
        <!-- Contenu principal -->
        <div class="fees-content">
            <!-- Loader -->
            <div v-if="loading" class="loader-wrapper">
                <SpinningLoader :loading="loading" />
            </div>

            <!-- Erreur -->
            <div v-else-if="errorServer" class="error-wrapper">
                <ErrorComponent :message="errorServer" @retry="getFees" />
            </div>

            <!-- Contenu des frais -->
            <template v-else>
                <!-- En-tête -->
                <div class="fees-header">
                    <div class="header-icon">
                        <Icon icon="ph:graduation-cap-duotone" />
                    </div>
                    <div class="header-text">
                        <h1 class="header-title">Frais de Scolarité</h1>
                        <p class="header-subtitle">Année académique {{ currentAcademicYear }}</p>
                    </div>
                </div>

                <!-- Bannière d'information -->
                <div class="info-banner">
                    <div class="info-icon">
                        <Icon icon="ph:info-duotone" />
                    </div>
                    <div class="info-content">
                        <h4>Information importante</h4>
                        <p>
                            Les frais de scolarité peuvent varier selon l'année académique.
                            Vous serez <strong>automatiquement notifié(e)</strong> en cas de modification des tarifs.
                            Pour toute question, contactez le service de scolarité.
                        </p>
                    </div>
                </div>

                <!-- Résumé des frais -->
                <div class="fees-summary" v-if="fees.length > 0">
                    <div class="summary-card">
                        <div class="summary-icon">
                            <Icon icon="ph:graduation-cap-duotone" />
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Niveaux disponibles</span>
                            <span class="summary-value">{{ fees.length }} niveau{{ fees.length > 1 ? 'x' : '' }}</span>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon secondary">
                            <Icon icon="ph:books-duotone" />
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Votre filière</span>
                            <span class="summary-value">{{ student.field }}</span>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon tertiary">
                            <Icon icon="ph:student-duotone" />
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Votre niveau</span>
                            <span class="summary-value">{{ student.level }}</span>
                        </div>
                    </div>
                </div>

                <!-- Tableaux par niveau -->
                <div v-for="fee in fees" :key="fee._id" class="level-section">
                    <!-- Badge du niveau -->
                    <div class="level-badge" :class="{ 'current-level': fee.level === student.level }">
                        <Icon :icon="fee.level === student.level ? 'ph:star-fill' : 'ph:graduation-cap'" />
                        <span>{{ fee.level }}</span>
                        <span v-if="fee.level === student.level" class="badge-tag">Votre niveau</span>
                    </div>

                    <!-- Tableau des échéances pour ce niveau -->
                    <div class="fees-table-container" v-if="fee.echeances?.length > 0">
                        <div class="table-header">
                            <h3>
                                <Icon icon="ph:list-checks-duotone" />
                                Calendrier des paiements - {{ fee.level }}
                            </h3>
                            <div class="level-total">
                                <span class="total-label-inline">Total:</span>
                                <span class="total-value-inline">{{ formatCurrency(fee.fees) }}</span>
                            </div>
                        </div>
                        <div class="table-wrapper">
                            <table class="fees-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <Icon icon="ph:hash" />
                                            N°
                                        </th>
                                        <th>
                                            <Icon icon="ph:text-aa" />
                                            Désignation
                                        </th>
                                        <th>
                                            <Icon icon="ph:currency-circle-dollar" />
                                            Montant
                                        </th>
                                        <th>
                                            <Icon icon="ph:calendar" />
                                            Date limite
                                        </th>
                                        <th>
                                            <Icon icon="ph:flag" />
                                            Statut
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(echeance, index) in fee.echeances" :key="index">
                                        <td class="cell-number">{{ index + 1 }}</td>
                                        <td class="cell-label">{{ echeance.label }}</td>
                                        <td class="cell-amount">{{ formatCurrency(echeance.amount) }}</td>
                                        <td class="cell-date">{{ formatDate(echeance.date) }}</td>
                                        <td class="cell-status">
                                            <span class="status-badge" :class="getStatusClass(echeance.date)">
                                                <Icon :icon="getStatusIcon(echeance.date)" />
                                                {{ getStatusText(echeance.date) }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" class="total-label">Total à payer</td>
                                        <td class="total-amount">{{ formatCurrency(fee.fees) }}</td>
                                        <td colspan="2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <!-- Message si pas d'échéances pour ce niveau -->
                    <div v-else class="no-schedule">
                        <Icon icon="ph:calendar-x" />
                        <span>Aucun calendrier de paiement défini pour ce niveau</span>
                    </div>
                </div>

                <!-- Message si pas de frais -->
                <div class="no-fees" v-if="fees.length === 0">
                    <Icon icon="ph:file-search-duotone" class="no-fees-icon" />
                    <h3>Aucun frais trouvé</h3>
                    <p>Les frais de scolarité pour votre filière <strong>{{ student.field }}</strong> n'ont pas encore
                        été configurés.</p>
                    <p>Veuillez contacter le service de scolarité pour plus d'informations.</p>
                </div>

                <!-- Section contact scolarité -->
                <div class="contact-section">
                    <div class="contact-card">
                        <div class="contact-icon">
                            <Icon icon="ph:phone-duotone" />
                        </div>
                        <div class="contact-info">
                            <h4>Service Scolarité</h4>
                            <p>Pour toute question concernant les frais ou les mises à jour</p>
                            <RouterLink to="/contact" class="contact-link">
                                <Icon icon="ph:arrow-right" />
                                Contacter la scolarité
                            </RouterLink>
                        </div>
                    </div>
                </div>

                <!-- Footer d'avertissement -->
                <div class="disclaimer">
                    <Icon icon="ph:warning-circle" />
                    <span>
                        Les montants affichés sont indicatifs et susceptibles de modification.
                        Consultez régulièrement cette page ou contactez la scolarité pour les dernières mises à jour.
                    </span>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import type { FeesManagementInterface } from '@/interfaces/feesManagement.interface';
import type StudentInterface from '@/interfaces/student.intefaces';
import { useMyUserStore } from '@/stores/userStore';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const errorServer = ref<string>('');
const loading = ref<boolean>(false);
const userStore = useMyUserStore()
const { currentUser } = storeToRefs(userStore)
const student = currentUser.value as StudentInterface

const fees = ref<FeesManagementInterface[]>([])

// Année académique courante
const currentAcademicYear = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    // Si on est après septembre, l'année académique est année/année+1
    if (month >= 8) {
        return `${year} - ${year + 1}`
    }
    return `${year - 1} - ${year}`
})

// Formater la devise
const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-MG', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

// Formater la date
const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date))
}

// Obtenir le statut de l'échéance
const getStatusClass = (date: Date): string => {
    const now = new Date()
    const echeanceDate = new Date(date)
    const diffTime = echeanceDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'overdue'
    if (diffDays <= 7) return 'urgent'
    if (diffDays <= 30) return 'upcoming'
    return 'pending'
}

const getStatusIcon = (date: Date): string => {
    const statusClass = getStatusClass(date)
    switch (statusClass) {
        case 'overdue': return 'ph:x-circle-fill'
        case 'urgent': return 'ph:warning-circle-fill'
        case 'upcoming': return 'ph:clock-fill'
        default: return 'ph:check-circle'
    }
}

const getStatusText = (date: Date): string => {
    const statusClass = getStatusClass(date)
    switch (statusClass) {
        case 'overdue': return 'Dépassé'
        case 'urgent': return 'Urgent'
        case 'upcoming': return 'Bientôt'
        default: return 'À venir'
    }
}

const getFees = async () => {
    loading.value = true
    errorServer.value = ''
    try {
        const response = await axios.get('/api/v1/feesManagement', {
            params: {
                field: student.field
            }
        })

        fees.value = (response.data as FeesManagementInterface[]).sort((a, b) => {
            // Ordre de tri: L1, L2, L3, M1, M2
            const levelOrder = ['L1', 'L2', 'L3', 'M1', 'M2']
            return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
        })

    } catch (error: unknown) {
        const err = error as { response?: { data?: string } }
        errorServer.value = err.response?.data || 'Une erreur est survenue lors de la récupération des frais de scolarité.';
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await getFees()
})

</script>

<style scoped>
.fees-container {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}

.fees-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

/* Loader et Error wrappers */
.loader-wrapper,
.error-wrapper {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* En-tête */
.fees-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--gray-lighter);
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.15) 0%, rgba(80, 134, 193, 0.05) 100%);
    border-radius: 14px;
    border: 1px solid rgba(80, 134, 193, 0.2);
}

.header-icon svg {
    font-size: 1.75rem;
    color: var(--primary-color);
}

.header-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-dark);
    margin: 0;
    letter-spacing: -0.3px;
}

.header-subtitle {
    font-size: 0.9rem;
    color: var(--tertiary-color);
    margin: 0.25rem 0 0 0;
}

/* Bannière d'information */
.info-banner {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.08) 0%, rgba(80, 134, 193, 0.02) 100%);
    border: 1px solid rgba(80, 134, 193, 0.15);
    border-radius: 12px;
    border-left: 4px solid var(--primary-color);
}

.info-icon {
    display: flex;
    align-items: flex-start;
    padding-top: 0.125rem;
}

.info-icon svg {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.info-content h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--primary-dark);
}

.info-content p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--tertiary-dark);
    line-height: 1.6;
}

.info-content strong {
    color: var(--secondary-color);
}

/* Résumé des frais */
.fees-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.summary-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--gray-lighter);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;
}

.summary-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.15) 0%, rgba(80, 134, 193, 0.05) 100%);
    border-radius: 12px;
    flex-shrink: 0;
}

.summary-icon svg {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.summary-icon.secondary {
    background: linear-gradient(135deg, rgba(48, 168, 85, 0.15) 0%, rgba(48, 168, 85, 0.05) 100%);
}

.summary-icon.secondary svg {
    color: var(--secondary-color);
}

.summary-icon.tertiary {
    background: linear-gradient(135deg, rgba(243, 156, 18, 0.15) 0%, rgba(243, 156, 18, 0.05) 100%);
}

.summary-icon.tertiary svg {
    color: #f39c12;
}

.summary-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.summary-label {
    font-size: 0.8125rem;
    color: var(--tertiary-color);
}

.summary-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--primary-dark);
}

/* Section par niveau */
.level-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Badge du niveau */
.level-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.08) 0%, rgba(80, 134, 193, 0.02) 100%);
    border: 1px solid rgba(80, 134, 193, 0.15);
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-dark);
    width: fit-content;
    transition: all 0.2s ease;
}

.level-badge svg {
    font-size: 1.25rem;
    color: var(--primary-color);
}

.level-badge.current-level {
    background: linear-gradient(135deg, rgba(48, 168, 85, 0.12) 0%, rgba(48, 168, 85, 0.03) 100%);
    border: 1px solid rgba(48, 168, 85, 0.25);
    border-left: 4px solid var(--secondary-color);
}

.level-badge.current-level svg {
    color: var(--secondary-color);
}

.badge-tag {
    margin-left: 0.5rem;
    padding: 0.25rem 0.625rem;
    background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-light) 100%);
    color: white;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

/* Message sans échéance */
.no-schedule {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: rgba(243, 156, 18, 0.06);
    border: 1px solid rgba(243, 156, 18, 0.15);
    border-radius: 10px;
    color: #a67c00;
    font-size: 0.875rem;
    font-style: italic;
}

.no-schedule svg {
    font-size: 1.25rem;
    flex-shrink: 0;
}

/* Tableau des frais */
.fees-table-container {
    background: white;
    border-radius: 12px;
    border: 1px solid var(--gray-lighter);
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.05) 0%, transparent 100%);
    border-bottom: 1px solid var(--gray-lighter);
    flex-wrap: wrap;
    gap: 0.75rem;
}

.table-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-dark);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.table-header h3 svg {
    font-size: 1.25rem;
    color: var(--primary-color);
}

.level-total {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.total-label-inline {
    font-size: 0.875rem;
    color: var(--tertiary-color);
    font-weight: 500;
}

.total-value-inline {
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary-color);
}

.table-wrapper {
    overflow-x: auto;
}

.fees-table {
    width: 100%;
    border-collapse: collapse;
}

.fees-table th {
    padding: 1rem 1.25rem;
    text-align: left;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--tertiary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: rgba(248, 249, 250, 0.8);
    border-bottom: 1px solid var(--gray-lighter);
}

.fees-table th svg {
    font-size: 0.875rem;
    margin-right: 0.375rem;
    vertical-align: middle;
    opacity: 0.7;
}

.fees-table td {
    padding: 1rem 1.25rem;
    font-size: 0.9375rem;
    color: var(--text-dark);
    border-bottom: 1px solid var(--gray-lighter);
}

.fees-table tbody tr:hover {
    background: rgba(80, 134, 193, 0.03);
}

.fees-table tbody tr:last-child td {
    border-bottom: none;
}

.cell-number {
    font-weight: 600;
    color: var(--primary-color);
    width: 50px;
}

.cell-label {
    font-weight: 500;
}

.cell-amount {
    font-weight: 600;
    color: var(--primary-dark);
    white-space: nowrap;
}

.cell-date {
    color: var(--tertiary-dark);
    white-space: nowrap;
}

.cell-status {
    white-space: nowrap;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.status-badge svg {
    font-size: 0.875rem;
}

.status-badge.pending {
    background: rgba(48, 168, 85, 0.1);
    color: var(--secondary-color);
}

.status-badge.upcoming {
    background: rgba(80, 134, 193, 0.1);
    color: var(--primary-color);
}

.status-badge.urgent {
    background: rgba(243, 156, 18, 0.15);
    color: #e67e22;
}

.status-badge.overdue {
    background: rgba(235, 77, 75, 0.1);
    color: var(--error);
}

/* Footer tableau */
.fees-table tfoot td {
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(80, 134, 193, 0.08) 0%, rgba(80, 134, 193, 0.02) 100%);
    border-top: 2px solid var(--primary-color);
}

.total-label {
    font-weight: 700;
    color: var(--primary-dark);
    text-align: right;
}

.total-amount {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--primary-color);
}

/* Message aucun frais */
.no-fees {
    text-align: center;
    padding: 3rem 1.5rem;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--gray-lighter);
}

.no-fees-icon {
    font-size: 3.5rem;
    color: var(--tertiary-light);
    margin-bottom: 1rem;
}

.no-fees h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    color: var(--primary-dark);
}

.no-fees p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: var(--tertiary-color);
}

.no-fees p strong {
    color: var(--primary-color);
}

/* Section contact */
.contact-section {
    margin-top: 0.5rem;
}

.contact-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(48, 168, 85, 0.08) 0%, rgba(48, 168, 85, 0.02) 100%);
    border: 1px solid rgba(48, 168, 85, 0.15);
    border-radius: 12px;
}

.contact-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--secondary-color) 0%, var(--secondary-light) 100%);
    border-radius: 12px;
    flex-shrink: 0;
}

.contact-icon svg {
    font-size: 1.5rem;
    color: white;
}

.contact-info h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--secondary-dark);
}

.contact-info p {
    margin: 0 0 0.5rem 0;
    font-size: 0.8125rem;
    color: var(--tertiary-dark);
}

.contact-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--secondary-color);
    text-decoration: none;
    transition: all 0.2s ease;
}

.contact-link:hover {
    color: var(--secondary-dark);
}

.contact-link:hover svg {
    transform: translateX(3px);
}

.contact-link svg {
    font-size: 1rem;
    transition: transform 0.2s ease;
}

/* Disclaimer */
.disclaimer {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.875rem 1rem;
    background: rgba(243, 156, 18, 0.08);
    border: 1px solid rgba(243, 156, 18, 0.15);
    border-radius: 10px;
    font-size: 0.8125rem;
    color: #a67c00;
    line-height: 1.5;
}

.disclaimer svg {
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
}

/* Responsive */
@media (max-width: 768px) {
    .fees-container {
        padding: 1rem;
    }

    .fees-header {
        flex-direction: column;
        text-align: center;
    }

    .info-banner {
        flex-direction: column;
        text-align: center;
    }

    .fees-summary {
        grid-template-columns: 1fr;
    }

    .level-badge {
        width: 100%;
        justify-content: center;
    }

    .table-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .level-total {
        width: 100%;
        justify-content: space-between;
    }

    .fees-table th,
    .fees-table td {
        padding: 0.75rem 1rem;
        font-size: 0.8125rem;
    }

    .fees-table th svg {
        display: none;
    }

    .contact-card {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .header-icon {
        width: 48px;
        height: 48px;
    }

    .header-icon svg {
        font-size: 1.5rem;
    }

    .header-title {
        font-size: 1.25rem;
    }

    .summary-card {
        padding: 1rem;
    }

    .summary-icon {
        width: 40px;
        height: 40px;
    }

    .summary-icon svg {
        font-size: 1.25rem;
    }

    .level-badge {
        font-size: 0.9rem;
        padding: 0.625rem 1rem;
    }

    .badge-tag {
        display: none;
    }

    .fees-table th:nth-child(1),
    .fees-table td:nth-child(1) {
        display: none;
    }
}
</style>