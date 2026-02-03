<template>
    <div class="luxury-container">
        <div v-if="!route.params.field" class="luxury-selection">
            <!-- Header prestige avec les couleurs de l'institut -->
            <header class="luxury-header">
                <div class="institute-crest">
                    <div class="crest-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="crest-svg">
                            <defs>
                                <linearGradient id="instituteBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="var(--primary-color)" />
                                    <stop offset="50%" stop-color="var(--primary-light)" />
                                    <stop offset="100%" stop-color="var(--primary-color)" />
                                </linearGradient>
                                <linearGradient id="instituteGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="var(--secondary-color)" />
                                    <stop offset="50%" stop-color="var(--secondary-light)" />
                                    <stop offset="100%" stop-color="var(--secondary-color)" />
                                </linearGradient>
                            </defs>
                            <path class="crest-base" d="M50 5L5 30v40l45 25 45-25V30L50 5z"
                                fill="url(#instituteBlue)" />
                            <path class="crest-detail" d="M50 35L30 45v20l20 10 20-10V45L50 35z"
                                fill="url(#instituteGreen)" />
                            <circle class="crest-center" cx="50" cy="50" r="8" fill="var(--white)" />
                        </svg>
                    </div>
                </div>

                <div class="header-content">
                    <h1 class="luxury-title">
                        <span class="title-main">Programmes Académiques</span>
                        <span class="title-subtitle">Savoir faire , Savoir vivre , Savoir être : Bâtissons un avenir
                            responsable</span>
                    </h1>

                    <div class="luxury-divider">
                        <div class="divider-line gradient-line"></div>
                        <div class="divider-ornament">
                            <span class="ornament-dot blue-dot"></span>
                            <span class="ornament-dot green-dot"></span>
                            <span class="ornament-dot blue-dot"></span>
                        </div>
                        <div class="divider-line gradient-line"></div>
                    </div>

                    <p class="header-description">
                        Choisissez la filière
                    </p>
                </div>
            </header>

            <!-- Grid des filières avec design premium -->
            <div class="luxury-grid">
                <article v-for="(filiere, index) in filieres" :key="filiere" class="luxury-card"
                    :class="[filiere.toLowerCase(), `card-${index + 1}`]" @click="goToFiliere(filiere)"
                    @mouseenter="hoverCard = filiere" @mouseleave="hoverCard = null">
                    <!-- Éléments de fond décoratifs -->
                    <div class="card-background">
                        <div class="bg-shape shape-1"></div>
                        <div class="bg-shape shape-2"></div>
                        <div class="bg-shape shape-3"></div>
                    </div>

                    <!-- Contenu principal de la carte -->
                    <div class="card-content">
                        <div class="card-icon-wrapper">
                            <div class="icon-container" :class="filiere.toLowerCase()">
                                <svg class="discipline-icon" viewBox="0 0 24 24">
                                    <path v-if="filiere === 'Informatique'"
                                        d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"
                                        fill-rule="evenodd" />
                                    <path v-else-if="filiere === 'Gestion'"
                                        d="M3 3h18c.6 0 1 .4 1 1v16c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1zm1 2v14h16V5H4zm2 2h12v2H6V7zm0 4h12v2H6v-2zm0 4h8v2H6v-2z"
                                        clip-rule="evenodd" />
                                    <path v-else
                                        d="M12 2L1 7v10l11 5 11-5V7L12 2zM5.13 15.64l6.87 3.02 6.87-3.02V8.36L12 5.34 5.13 8.36v7.28z"
                                        fill-rule="nonzero" />
                                </svg>
                            </div>
                            <div class="icon-glow"></div>
                        </div>

                        <h2 class="card-title">{{ filiere }}</h2>

                    </div>

                    <!-- Footer avec CTA -->
                    <footer class="card-footer">
                        <div class="footer-content">
                            <span class="cta-text">Choisir</span>
                            <div class="arrow-wrapper">
                                <svg class="cta-arrow" viewBox="0 0 24 24">
                                    <path d="M8.59 16.58L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.42z" />
                                </svg>
                            </div>
                        </div>
                        <div class="footer-glow"></div>
                    </footer>

                    <!-- Éléments de hover -->
                    <div class="card-hover-elements">
                        <div class="hover-shine"></div>
                        <div class="hover-sparkle"></div>
                    </div>

                    <!-- Bordure animée -->
                    <div class="card-border">
                        <div class="border-top"></div>
                        <div class="border-right"></div>
                        <div class="border-bottom"></div>
                        <div class="border-left"></div>
                    </div>
                </article>
            </div>


        </div>

        <router-view />
    </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const filieres = ref<string[]>(['Informatique', 'Gestion', 'BTP'])
const router = useRouter()
const route = useRoute()
const hoverCard = ref<string | null>(null)

function goToFiliere(filiere: string) {
    router.push(`/admin/grades/${filiere.toLowerCase()}`);
}


</script>

<style scoped>
/* Container principal */
.luxury-container {

    margin: 0 auto;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, var(--background-light) 0%, var(--white) 50%, var(--background-secondary) 100%);
    min-height: 100vh;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* Header prestige */
.luxury-header {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
}

.institute-crest {
    margin-bottom: 2rem;
}

.crest-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto;
    filter: drop-shadow(0 4px 12px rgba(80, 134, 193, 0.2));
}

.crest-svg {
    width: 100%;
    height: 100%;
}

.header-content {
    position: relative;
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
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 0.5rem;
}

.title-subtitle {
    display: block;
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--secondary-color);
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.luxury-divider {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 400px;
}

.gradient-line {
    flex: 1;
    height: 2px;
    background: linear-gradient(90deg,
            transparent,
            var(--primary-color),
            var(--secondary-color),
            var(--primary-color),
            transparent);
}

.divider-ornament {
    display: flex;
    gap: 0.5rem;
}

.ornament-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.blue-dot {
    background: var(--primary-color);
}

.green-dot {
    background: var(--secondary-color);
}

.header-description {
    color: var(--text-secondary);
    font-size: 1.1rem;
    font-weight: 300;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
}

/* Grid des cartes */
.luxury-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 2.5rem;
    margin-top: 3rem;
}

/* Cartes luxueuses */
.luxury-card {
    position: relative;
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-light);
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

/* Éléments de fond */
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
    width: 120px;
    height: 120px;
    background: var(--primary-color);
    top: -30px;
    right: -30px;
}

.shape-2 {
    width: 80px;
    height: 80px;
    background: var(--secondary-color);
    bottom: -20px;
    left: -20px;
}

.shape-3 {
    width: 60px;
    height: 60px;
    background: var(--accent-color);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

/* Contenu des cartes */
.card-content {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.card-icon-wrapper {
    position: relative;
    margin-bottom: 2rem;
}

.icon-container {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.4s ease;
    position: relative;
    z-index: 2;
}

.icon-container.informatique {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    box-shadow: 0 8px 25px rgba(80, 134, 193, 0.3);
}

.icon-container.gestion {
    background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
    box-shadow: 0 8px 25px rgba(48, 168, 85, 0.3);
}

.icon-container.btp {
    background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
    box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.discipline-icon {
    width: 32px;
    height: 32px;
    fill: var(--white);
}

.icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    background: inherit;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    filter: blur(20px);
    transition: opacity 0.4s ease;
}

.card-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 1rem;
    line-height: 1.2;
}

.card-description {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 1rem;
    margin-bottom: 2rem;
    flex: 1;
}

.card-stats {
    display: flex;
    gap: 2rem;
    margin-top: auto;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Footer des cartes */
.card-footer {
    position: relative;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
}

.footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 2;
}

.cta-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.arrow-wrapper {
    width: 32px;
    height: 32px;
    background: var(--primary-extra-light);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.cta-arrow {
    width: 16px;
    height: 16px;
    fill: var(--primary-color);
    transition: transform 0.3s ease;
}

.footer-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--primary-extra-light), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

/* Éléments de hover */
.card-hover-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.hover-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.6s ease;
}

.hover-sparkle {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 16px;
    height: 16px;
    background: var(--primary-color);
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
    opacity: 0;
    transform: scale(0);
    transition: all 0.4s ease;
}

/* Bordure animée */
.card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.card-border div {
    position: absolute;
    background: var(--primary-color);
    opacity: 0;
    transition: all 0.4s ease;
}

.border-top {
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    transform: scaleX(0);
    transform-origin: left;
}

.border-right {
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
    transform: scaleY(0);
    transform-origin: top;
}

.border-bottom {
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    transform: scaleX(0);
    transform-origin: right;
}

.border-left {
    top: 0;
    left: 0;
    bottom: 0;
    width: 2px;
    transform: scaleY(0);
    transform-origin: bottom;
}

/* États de hover */
.luxury-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-dark);
    border-color: var(--primary-color-light);
}

.luxury-card:hover .bg-shape {
    transform: scale(1.2);
}

.luxury-card:hover .icon-container {
    transform: scale(1.1) rotate(5deg);
}

.luxury-card:hover .icon-glow {
    opacity: 0.3;
}

.luxury-card:hover .arrow-wrapper {
    background: var(--primary-color);
    transform: scale(1.1);
}

.luxury-card:hover .cta-arrow {
    fill: var(--white);
    transform: translateX(3px);
}

.luxury-card:hover .footer-glow {
    opacity: 1;
}

.luxury-card:hover .card-hover-elements {
    opacity: 1;
}

.luxury-card:hover .hover-shine {
    left: 100%;
}

.luxury-card:hover .hover-sparkle {
    opacity: 1;
    transform: scale(1);
    animation: sparkle 2s ease-in-out infinite;
}

.luxury-card:hover .card-border div {
    opacity: 1;
    transform: scale(1);
}

.luxury-card.informatique:hover .card-border div {
    background: var(--primary-color);
}

.luxury-card.gestion:hover .card-border div {
    background: var(--secondary-color);
}

.luxury-card.btp:hover .card-border div {
    background: var(--accent-color);
}

/* Indicateur de hover */
.hover-indicator {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}

.indicator-content {
    background: var(--white);
    color: var(--text-dark);
    padding: 1rem 2rem;
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 1rem;
    border: 1px solid var(--border-light);
}

.indicator-text {
    font-weight: 500;
}

.indicator-dots {
    display: flex;
    gap: 0.25rem;
}

.indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.indicator-dot.informatique {
    background: var(--primary-color);
}

.indicator-dot.gestion {
    background: var(--secondary-color);
}

.indicator-dot.btp {
    background: var(--accent-color);
}

/* Animations */
@keyframes sparkle {

    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.7;
        transform: scale(0.9);
    }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
    transition: all 0.4s ease;
}

.fade-scale-enter-from {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
}

.fade-scale-leave-to {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
    .luxury-container {
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
        min-height: 350px;
        padding: 2rem;
    }

    .card-stats {
        justify-content: center;
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