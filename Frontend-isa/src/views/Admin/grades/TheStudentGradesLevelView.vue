<template>
    <div class="luxury-promotions-container" v-if="!route.params.promotion">
        <!-- Header cohérent avec les autres pages -->
        <header class="luxury-header">
            <BreadCrumbsBack />

            <div class="header-content">
                <h1 class="luxury-title">
                    <span class="title-main">Promotions</span>
                    <span class="title-subtitle">{{ getFieldDisplayName(route.params.field as string) }}</span>
                </h1>

                <div class="luxury-divider">
                    <div class="divider-line"></div>
                    <div class="divider-ornament">✧</div>
                    <div class="divider-line"></div>
                </div>
            </div>
        </header>

        <!-- États avec style luxury -->
        <div v-if="loading" class="luxury-state">
            <div class="state-content">
                <SpinningLoader :loading="true" />
                <p class="state-text">Chargement des promotions...</p>
            </div>
        </div>

        <div v-else-if="errorServer" class="luxury-state">
            <div class="state-content">
                <ErrorComponent :message="errorServer" />
                <button class="luxury-button" @click="fetchPromotions">
                    <svg class="button-icon" viewBox="0 0 24 24">
                        <path
                            d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Réessayer
                </button>
            </div>
        </div>

        <div v-else-if="promotions.length === 0" class="luxury-state">
            <div class="state-content">
                <div class="empty-icon">🎓</div>
                <h3 class="state-title">Aucune promotion</h3>
                <p class="state-description">Aucune promotion n'est disponible pour le moment</p>
            </div>
        </div>

        <!-- Filtres -->
        <div v-else-if="!loading && promotions.length > 0" class="filter-controls">
            <div class="filter-group">
                <button :class="['filter-button', { active: statusFilter === 'all' }]" @click="statusFilter = 'all'">
                    <svg viewBox="0 0 24 24" class="filter-icon">
                        <path
                            d="M3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm16 0v14H5V5h14z" />
                    </svg>
                    Tous
                </button>
                <button :class="['filter-button', { active: statusFilter === 'active' }]"
                    @click="statusFilter = 'active'">
                    <svg viewBox="0 0 24 24" class="filter-icon">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
                    </svg>
                    Actif
                </button>
                <button :class="['filter-button', { active: statusFilter === 'inactive' }]"
                    @click="statusFilter = 'inactive'">
                    <svg viewBox="0 0 24 24" class="filter-icon">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                    </svg>
                    Inactif
                </button>
            </div>
            <span class="filter-count">{{ filteredPromotions.length }} résultat(s)</span>
        </div>

        <!-- Grid luxury cohérent -->
        <div v-if="filteredPromotions.length > 0" class="luxury-grid">
            <article v-for="promotion in filteredPromotions" :key="promotion._id" class="luxury-card"
                :class="{ 'active': promotion.isActive }" @click="selectPromotion(promotion)">
                <!-- Éléments décoratifs de fond -->
                <div class="card-background">
                    <div class="bg-shape shape-1"></div>
                    <div class="bg-shape shape-2"></div>
                </div>

                <!-- Contenu principal -->
                <div class="card-content">
                    <div class="card-header">
                        <h2 class="card-title">{{ promotion.name }}</h2>
                        <div class="status-indicator" :class="promotion.isActive ? 'active' : 'inactive'"></div>
                    </div>

                    <div class="card-body">
                        <div class="date-info">
                            <span class="date-range">
                                {{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Footer avec CTA -->
                <footer class="card-footer">
                    <span class="cta-text">Explorer</span>
                    <div class="arrow-wrapper">
                        <svg class="cta-arrow" viewBox="0 0 24 24">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </div>
                </footer>

                <!-- Effets de hover -->
                <div class="card-hover">
                    <div class="hover-glow"></div>
                </div>
            </article>
        </div>

        <!-- Aucun résultat après filtrage -->
        <div v-if="!loading && promotions.length > 0 && filteredPromotions.length === 0" class="luxury-state">
            <div class="state-content">
                <div class="empty-icon">🔍</div>
                <h3 class="state-title">Aucun résultat</h3>
                <p class="state-description">Aucune promotion {{ statusFilter === 'active' ? 'active' : statusFilter ===
                    'inactive' ? 'inactive' : '' }} n'a été trouvée</p>
            </div>
        </div>
    </div>
    <div v-else>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import ErrorComponent from '@/components/error/ErrorComponent.vue';
import SpinningLoader from '@/components/loader/SpinningLoader.vue';
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import type PromotionInterface from '@/interfaces/promotion.interface';
import axios from 'axios';
import { ref, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()
const loading = ref<boolean>(false)
const errorServer = ref<string>("")
const promotions = ref<PromotionInterface[]>([])
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

const fetchPromotions = async () => {
    try {
        loading.value = true
        errorServer.value = ""
        const response = await axios.get('/api/v1/promotions', {
            params: {
                field: route.params.field,
                level: route.params.level
            }
        });
        promotions.value = response.data
    } catch (error) {
        errorServer.value = error.response?.data || "Erreur serveur inconnue."
    } finally {
        loading.value = false
    }
}


const selectPromotion = (promotion: PromotionInterface) => {
    router.push(`/admin/grades/${route.params.field}/${route.params.level}/${promotion._id}`)
}

const getFieldDisplayName = (field: string): string => {
    const fields: { [key: string]: string } = {
        'informatique': 'Informatique',
        'gestion': 'Gestion',
        'btp': 'BTP'
    }
    return fields[field] || field
}

const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

const filteredPromotions = computed(() => {
    return promotions.value.filter(promo => {
        if (statusFilter.value === 'active') return promo.isActive
        if (statusFilter.value === 'inactive') return !promo.isActive
        return true
    })
})

watchEffect(async () => {
    if (!route.params.promotion) {
        await fetchPromotions()
    }
})
</script>

<style scoped>
.luxury-promotions-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--background-light) 0%, var(--white) 50%, var(--gray-extra-light) 100%);
}

/* Header identique aux autres pages */
.luxury-header {
    margin-bottom: 3rem;
}

/* Contrôles de filtre */
.filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--white);
    border-radius: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--border-light);
}

.filter-group {
    display: flex;
    gap: 0.75rem;
}

.filter-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border: 2px solid var(--border-light);
    border-radius: 0.75rem;
    background: var(--white);
    color: var(--text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-button:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: rgba(80, 134, 193, 0.05);
}

.filter-button.active {
    background: linear-gradient(135deg, var(--primary-color) 0%, #7ba4d4 100%);
    color: white;
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(80, 134, 193, 0.3);
}

.filter-icon {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
}

.filter-count {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.breadcrumb-nav {
    margin-bottom: 2rem;
}

.back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--white);
    border: 1px solid var(--border-light);
    border-radius: var(--radius);
    padding: 0.75rem 1.5rem;
    color: var(--text-dark);
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
}

.back-button:hover {
    border-color: var(--primary-color);
    transform: translateX(-5px);
}

.back-icon {
    width: 18px;
    height: 18px;
    fill: var(--primary-color);
}

.header-content {
    text-align: center;
}

.luxury-title {
    margin-bottom: 1.5rem;
}

.title-main {
    display: block;
    font-size: 2.5rem;
    font-weight: 300;
    background: linear-gradient(135deg, var(--primary-darker), var(--primary-color));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
}

.title-subtitle {
    display: block;
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 400;
    text-transform: capitalize;
}

.luxury-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
}

.divider-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
}

.divider-ornament {
    color: var(--primary-color);
    font-size: 1rem;
}

/* États luxury */
.luxury-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

.state-content {
    text-align: center;
}

.state-text {
    margin-top: 1rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.state-title {
    font-size: 1.5rem;
    color: var(--text-dark);
    margin-bottom: 0.75rem;
}

.state-description {
    color: var(--text-secondary);
    line-height: 1.6;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
}

.luxury-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--primary-color);
    color: var(--white);
    border: none;
    border-radius: var(--radius);
    padding: 0.75rem 1.5rem;
    margin-top: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.luxury-button:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
}

.button-icon {
    width: 18px;
    height: 18px;
    fill: currentColor;
}

/* Grid luxury identique */
.luxury-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2.5rem;
}

/* Cartes luxury cohérentes */
.luxury-card {
    position: relative;
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
    border-radius: var(--radius-xl);
    padding: 2.5rem 2rem;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-light);
    display: flex;
    flex-direction: column;
    min-height: 200px;
}

.luxury-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-dark);
    border-color: var(--primary-color-light);
}

.luxury-card.active {
    border-left: 4px solid var(--success);
}

/* Éléments de fond décoratifs */
.card-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.bg-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.03;
    transition: all 0.6s ease;
}

.shape-1 {
    width: 100px;
    height: 100px;
    background: var(--primary-color);
    top: -25px;
    right: -25px;
}

.shape-2 {
    width: 60px;
    height: 60px;
    background: var(--secondary-color);
    bottom: -15px;
    left: -15px;
}

.luxury-card:hover .bg-shape {
    transform: scale(1.2);
}

/* Contenu des cartes */
.card-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.card-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0;
    line-height: 1.2;
}

.status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid var(--white);
    box-shadow: 0 0 0 2px var(--border-light);
}

.status-indicator.active {
    background: var(--success);
    box-shadow: 0 0 0 2px var(--success-light);
}

.status-indicator.inactive {
    background: var(--text-tertiary);
}

.card-body {
    margin-bottom: 1.5rem;
}

.date-info {
    display: flex;
    align-items: center;
}

.date-range {
    color: var(--text-secondary);
    font-size: 0.95rem;
}

/* Footer des cartes */
.card-footer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: auto;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
}

.cta-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.arrow-wrapper {
    width: 28px;
    height: 28px;
    background: var(--primary-extra-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.cta-arrow {
    width: 14px;
    height: 14px;
    fill: var(--primary-color);
    transition: transform 0.3s ease;
}

/* Effets de hover */
.card-hover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.hover-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(80, 134, 193, 0.05) 0%, transparent 70%);
    border-radius: var(--radius-xl);
}

.luxury-card:hover .card-hover {
    opacity: 1;
}

.luxury-card:hover .arrow-wrapper {
    background: var(--primary-color);
    transform: scale(1.1);
}

.luxury-card:hover .cta-arrow {
    fill: var(--white);
    transform: translateX(2px);
}

/* Responsive identique */
@media (max-width: 768px) {
    .luxury-promotions-container {
        padding: 1.5rem 1rem;
    }

    .title-main {
        font-size: 2rem;
    }

    .luxury-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .luxury-card {
        padding: 2rem 1.5rem;
        min-height: 180px;
    }
}

@media (min-width: 1024px) {
    .luxury-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1440px) {
    .luxury-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}
</style>