<template>
    <div class="tuition-fees-container" v-if="!route.params.promotionId">
        <!-- En-tête -->
        <div class="fees-header">
            <div class="header-gradient"></div>
            <div class="header-content">
                <div class="header-icon-wrapper">
                    <Icon icon="material-symbols:receipt-long" class="header-icon" />
                </div>
                <div class="header-text">
                    <h1>Suivi des Frais de Scolarité</h1>
                    <p class="header-subtitle">
                        Consultez l'historique complet de vos paiements depuis votre intégration à l'université
                        et effectuez les paiements non réglés
                    </p>
                </div>
            </div>
        </div>

        <!-- Avertissement de validation -->
        <div class="validation-notice">
            <div class="notice-icon">
                <Icon icon="material-symbols:info" />
            </div>
            <div class="notice-content">
                <h3>Validation des paiements</h3>
                <p>
                    Tous les paiements effectués seront soumis à validation par l'administration de
                    l'université. L'université se réserve le droit de refuser tout bordereau de paiement après
                    vérification. Les paiements non validés ou suspectés d'être frauduleux seront
                    automatiquement rejetés. Assurez-vous de fournir des justificatifs authentiques et
                    conformes aux procédures établies.
                </p>
            </div>
        </div>

        <!-- État vide -->
        <div v-if="!user.parcours || user.parcours.length < 1" class="empty-state">
            <Icon icon="material-symbols:receipt-long-outline" class="empty-icon" />
            <h3>Aucun parcours disponible</h3>
            <p>Vous n'êtes inscrit dans aucune promotion pour le moment.</p>
        </div>

        <!-- Liste des promotions avec frais -->
        <div v-else class="promotions-grid">
            <div v-for="(parcours, index) in user.parcours" :key="(parcours.promotion as PromotionInterface)._id" class="promotion-card"
                :class="'status-' + parcours.status.replace(' ', '-')">
                <!-- Badge de statut -->
                <div class="status-badge" :class="'status-' + parcours.status.replace(' ', '-')">
                    <Icon :icon="getStatusIcon(parcours.status)" />
                    <span>{{ getStatusLabel(parcours.status) }}</span>
                </div>

                <!-- En-tête de la promotion -->
                <div class="promotion-header">
                    <div class="promotion-icon">
                        <Icon icon="material-symbols:receipt" />
                    </div>
                    <div class="promotion-info">
                        <h3 class="promotion-name">{{ (parcours.promotion as PromotionInterface).name }}</h3>
                        <p class="promotion-field">{{ (parcours.promotion as PromotionInterface).field }}</p>
                    </div>
                </div>

                <!-- Informations détaillées -->
                <div class="promotion-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <Icon icon="material-symbols:calendar-today" class="detail-icon" />
                            <div class="detail-content">
                                <span class="detail-label">Début</span>
                                <span class="detail-value">{{ formatDate((parcours.promotion as PromotionInterface).startDate) }}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <Icon icon="material-symbols:event-available" class="detail-icon" />
                            <div class="detail-content">
                                <span class="detail-label">Fin</span>
                                <span class="detail-value">{{ formatDate((parcours.promotion as PromotionInterface).endDate) }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <Icon icon="material-symbols:school" class="detail-icon" />
                            <div class="detail-content">
                                <span class="detail-label">Niveau</span>
                                <span class="detail-value">{{ (parcours.promotion as PromotionInterface).level }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action button -->
                <div class="promotion-actions">
                    <router-link v-if="parcours.status === 'in progress'"
                        :to="`/student/fees/${(parcours.promotion as PromotionInterface)._id}`" class="view-fees-btn">
                        <Icon icon="material-symbols:payments" />
                        <span>Voir mes paiements en cours</span>
                    </router-link>
                    <router-link v-else :to="`/student/fees/${(parcours.promotion as PromotionInterface)._id}`" class="view-fees-btn">
                        <Icon icon="material-symbols:receipt" />
                        <span>Voir l'historique de paiement</span>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
    <div>
        <RouterView />
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type StudentInterface from '@/interfaces/student.intefaces'
import { useMyUserStore } from '@/stores/userStore'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import type PromotionInterface from '@/interfaces/promotion.interface'

const route = useRoute()
const { currentUser } = storeToRefs(useMyUserStore())
const user = currentUser as Ref<StudentInterface>

const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
        'in progress': 'material-symbols:schedule',
        completed: 'material-symbols:check-circle',
        paused: 'material-symbols:pause-circle',
        dropped: 'material-symbols:cancel',
    }
    return icons[status] || 'material-symbols:help'
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'in progress': 'En cours',
        completed: 'Complété',
        paused: 'En pause',
        dropped: 'Abandonné',
    }
    return labels[status] || status
}
</script>

<style scoped>
/* Container */
.tuition-fees-container {
    min-height: 100vh;
    background: var(--background-light);
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
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
    gap: 1.5rem;
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

.header-text h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 700;
}

.header-subtitle {
    margin: 0;
    font-size: 1.1rem;
    opacity: 0.95;
}

/* Validation Notice */
.validation-notice {
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1rem;
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.2);
}

.notice-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 193, 7, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f57c00;
}

.notice-icon svg {
    font-size: 1.8rem;
}

.notice-content h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    color: #e65100;
    font-weight: 600;
}

.notice-content p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: #6d4c41;
}

/* Empty state */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
    font-size: 5rem;
    color: var(--text-secondary);
    opacity: 0.5;
    margin-bottom: 1rem;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

.empty-state p {
    font-size: 1rem;
    color: var(--text-secondary);
}

/* Grid des promotions */
.promotions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
    gap: 2rem;
}

/* Carte de promotion */
.promotion-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    position: relative;
}

.promotion-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.promotion-card.status-in-progress {
    border-color: var(--primary-color);
}

.promotion-card.status-in-progress::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.promotion-card.status-completed {
    border-color: var(--success);
}

.promotion-card.status-completed::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--success-dark), var(--success));
}

.promotion-card.status-dropped {
    border-color: var(--error-light);
    opacity: 0.85;
}

.promotion-card.status-dropped::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--error), var(--error-light));
}

.promotion-card.status-repeated {
    border-color: var(--warning);
}

.promotion-card.status-repeated::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--warning-dark), var(--warning));
}

/* Badge de statut */
.status-badge {
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

.status-badge.status-in-progress {
    background: rgba(var(--primary-color-rgb), 0.15);
    color: var(--primary-color);
}

.status-badge.status-completed {
    background: rgba(var(--success-rgb), 0.15);
    color: var(--success-dark);
}

.status-badge.status-dropped {
    background: rgba(var(--error-rgb), 0.15);
    color: var(--error);
}

.status-badge.status-repeated {
    background: rgba(var(--warning-rgb), 0.15);
    color: var(--warning-dark);
}

.status-badge svg {
    font-size: 1.1rem;
}

/* Header de la promotion */
.promotion-header {
    padding: 2rem 2rem 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background: linear-gradient(to bottom, #f8fafc, white);
    border-bottom: 1px solid #e2e8f0;
}

.promotion-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    flex-shrink: 0;
}

.promotion-info {
    flex: 1;
    padding-top: 0.25rem;
}

.promotion-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-dark);
    line-height: 1.3;
}

.promotion-field {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
    font-weight: 500;
}

/* Détails */
.promotion-details {
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

.detail-item.full-width {
    grid-column: 1 / -1;
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

/* Actions */
.promotion-actions {
    padding: 1.5rem 2rem 2rem;
    border-top: 1px solid #e2e8f0;
}

.view-fees-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    width: 100%;
}

.view-fees-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
}

.view-fees-btn svg {
    font-size: 1.25rem;
}

.status-message {
    text-align: center;
    padding: 0.875rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 600;
}

.status-message.status-completed {
    background: rgba(var(--success-rgb), 0.1);
    color: var(--success-dark);
}

.status-message.status-dropped {
    background: rgba(var(--error-rgb), 0.1);
    color: var(--error);
}

.status-message.status-repeated {
    background: rgba(var(--warning-rgb), 0.1);
    color: var(--warning-dark);
}

/* Responsive */
@media (max-width: 768px) {
    .tuition-fees-container {
        padding: 1rem;
    }

    .promotions-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .header-content {
        padding: 2rem 1.5rem;
        flex-direction: column;
        text-align: center;
    }

    .header-text h1 {
        font-size: 1.75rem;
    }

    .header-subtitle {
        font-size: 1rem;
    }

    .promotion-header {
        padding: 1.5rem;
    }

    .promotion-name {
        font-size: 1.2rem;
    }

    .status-badge {
        top: 1rem;
        right: 1rem;
        font-size: 0.75rem;
        padding: 0.4rem 0.85rem;
    }

    .detail-row {
        grid-template-columns: 1fr;
    }
}
</style>
