<template>
    <div class="module-card">
        <div class="card-header">
            <div class="type-badge" :class="getTypeClass(module.type)">
                {{ module.type }}
            </div>
            <div class="credits-badge">
                {{ module.credits }} crédits
            </div>
        </div>

        <div class="card-content">
            <h3 class="module-title">{{ module.title }}</h3>
            <p class="module-code">{{ module.code }}</p>

            <div class="hours-info">
                <span class="hours-icon">⏱</span>
                {{ module.hours }}
            </div>
        </div>

        <div class="card-gradient-border"></div>
    </div>
</template>

<script setup lang="ts">
import type ModuleInterface from '@/interfaces/module.interface';

const props = defineProps<{
    module: ModuleInterface
}>()

const getTypeClass = (type: string) => {
    const typeMap: { [key: string]: string } = {
        'cours magistral': 'type-cm',
        'td': 'type-td',
        'tp': 'type-tp'
    }
    return typeMap[type.toLowerCase()] || 'type-default'
}
</script>

<style scoped>
.module-card {
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
    border-radius: var(--radius-xl);
    padding: 1.75rem;
    position: relative;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.module-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary-color-light), transparent);
}

.module-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-color-light);
}

.card-gradient-border {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-xl);
    padding: 1px;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--primary-color));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: subtract;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.module-card:hover .card-gradient-border {
    opacity: 1;
}

.card-header {
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    gap: 0.75rem;
}

.type-badge {
    padding: 0.375rem 1rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border: 1px solid;
    backdrop-filter: blur(10px);
}

.type-cm {
    background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.15), rgba(var(--primary-color-rgb), 0.05));
    color: var(--primary-dark);
    border-color: var(--primary-light);
    box-shadow: 0 2px 8px rgba(var(--primary-color-rgb), 0.15);
}

.type-td {
    background: linear-gradient(135deg, rgba(var(--secondary-color-rgb), 0.15), rgba(var(--secondary-color-rgb), 0.05));
    color: var(--secondary-dark);
    border-color: var(--secondary-light);
    box-shadow: 0 2px 8px rgba(var(--secondary-color-rgb), 0.15);
}

.type-tp {
    background: linear-gradient(135deg, rgba(var(--warning-rgb), 0.15), rgba(var(--warning-rgb), 0.05));
    color: var(--warning-dark);
    border-color: var(--warning-light);
    box-shadow: 0 2px 8px rgba(var(--warning-rgb), 0.15);
}

.type-default {
    background: linear-gradient(135deg, rgba(var(--tertiary-color-rgb), 0.15), rgba(var(--tertiary-color-rgb), 0.05));
    color: var(--tertiary-dark);
    border-color: var(--tertiary-light);
    box-shadow: 0 2px 8px rgba(var(--tertiary-color-rgb), 0.15);
}

.credits-badge {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: var(--white);
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 700;
    margin-left: auto;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
}

.credits-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
}

.credits-badge:hover::before {
    left: 100%;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.module-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, var(--text-dark), var(--primary-dark));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.module-code {
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 600;
    margin: 0 0 1.25rem 0;
    letter-spacing: 0.02em;
    opacity: 0.9;
}

.hours-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: auto;
    padding: 0.75rem 0;
    border-top: 1px solid var(--border-light);
}

.hours-icon {
    font-size: 1rem;
    opacity: 0.8;
}

/* Animation d'entrée */
.module-card {
    animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes cardSlideIn {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Effet de brillance au survol */
.module-card::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent);
    transform: rotate(45deg);
    transition: all 0.6s ease;
    opacity: 0;
}

.module-card:hover::after {
    opacity: 1;
    transform: rotate(45deg) translate(10%, 10%);
}

/* Responsive */
@media (max-width: 768px) {
    .module-card {
        padding: 1.5rem;
    }

    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .credits-badge {
        margin-left: 0;
        align-self: flex-start;
    }

    .module-title {
        font-size: 1.125rem;
    }

    .type-badge {
        font-size: 0.7rem;
        padding: 0.3rem 0.8rem;
    }
}
</style>