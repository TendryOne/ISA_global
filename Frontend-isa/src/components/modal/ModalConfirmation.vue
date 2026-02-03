<template>
    <Transition name="elite-modal">
        <div v-if="show" class="elite-modal-overlay" @click.self="handleOverlayClick"
            :aria-busy="loading ? 'true' : 'false'">
            <div class="elite-modal-container" role="dialog" aria-modal="true" :aria-label="title">
                <!-- Header avec gradient premium -->
                <div class="elite-modal-header" :class="variantClass">
                    <div class="header-icon-container">
                        <div class="header-icon" :class="variantClass">
                            <Icon :icon="iconName" width="28" />
                        </div>
                    </div>
                    <div class="header-text">
                        <h3>{{ title }}</h3>
                        <p v-if="subtitle" class="header-subtitle">{{ subtitle }}</p>
                    </div>
                    <button class="close-btn" @click="closeModal" :disabled="loading"
                        :aria-disabled="loading ? 'true' : 'false'" type="button">
                        <Icon icon="mdi:close" width="22" />
                    </button>
                </div>

                <!-- Contenu avec effet de verre -->
                <div class="elite-modal-content">
                    <div class="content-glass">
                        <p v-if="message" class="modal-message">
                            <Icon :icon="iconName" width="24" class="message-icon" />
                            <span>{{ message }}</span>
                        </p>

                        <!-- Mode confirmation textuelle -->
                        <div v-if="variant === 'text-confirmation'" class="confirmation-section">
                            <label class="confirmation-label">
                                Tapez <span class="confirmation-text">"{{ confirmationText }}"</span> pour confirmer
                            </label>
                            <input v-model="userInput" type="text" class="confirmation-input"
                                :placeholder="`Tapez: ${confirmationText}`" @keyup.enter="handleConfirm"
                                :disabled="loading" />
                            <div v-if="userInput && userInput !== confirmationText" class="input-hint">
                                ⚠️ Le texte ne correspond pas exactement
                            </div>
                        </div>

                        <!-- Mode checkbox -->
                        <div v-else-if="variant === 'checkbox'" class="checkbox-section">
                            <label class="checkbox-wrapper">
                                <input v-model="checkboxConfirmed" type="checkbox" class="checkbox-input"
                                    :disabled="loading" />
                                <span class="checkbox-label">{{ checkboxLabel }}</span>
                            </label>
                        </div>

                        <!-- Mode simple (juste des boutons) -->
                        <div v-else-if="variant === 'simple'">
                            <p v-if="details" class="details-text">{{ details }}</p>
                        </div>
                    </div>
                </div>

                <!-- Footer avec séparateur élégant -->
                <div class="elite-modal-footer">
                    <div class="footer-separator"></div>
                    <div class="footer-buttons">
                        <button class="modal-btn secondary" @click="closeModal" :disabled="loading"
                            :aria-disabled="loading ? 'true' : 'false'" type="button">
                            <Icon icon="mdi:close-circle-outline" width="20" />
                            <span>{{ cancelLabel }}</span>
                        </button>
                        <button class="modal-btn primary" :class="[variantClass, { 'loading': loading }]"
                            @click="handleConfirm" :disabled="isConfirmDisabled"
                            :aria-disabled="isConfirmDisabled ? 'true' : 'false'" type="button">
                            <Icon v-if="!loading" :icon="confirmIcon" width="20" />
                            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg" class="spinner">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.2" />
                                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" />
                            </svg>
                            <span>{{ loading ? 'chargement ...' : confirmLabel }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'

type ConfirmationVariant = 'simple' | 'text-confirmation' | 'checkbox'
type ConfirmationVariantClass = 'danger' | 'warning' | 'success' | 'info'

interface Props {
    show: boolean
    title: string
    subtitle?: string
    message?: string
    details?: string
    variant?: ConfirmationVariant
    variantClass?: ConfirmationVariantClass
    confirmationText?: string
    checkboxLabel?: string
    icon?: string
    confirmIcon?: string
    confirmLabel?: string
    cancelLabel?: string
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    show: false,
    variant: 'simple',
    variantClass: 'info',
    confirmationText: 'je confirme',
    checkboxLabel: 'Je confirme cette action',
    icon: 'mdi:shield-check-outline',
    confirmIcon: 'mdi:check-circle-outline',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    loading: false
})

const emit = defineEmits<{
    confirm: []
    close: []
}>()

const userInput = ref('')
const checkboxConfirmed = ref(false)

const iconName = computed(() => {
    const iconMap: Record<ConfirmationVariantClass, string> = {
        danger: 'mdi:alert-circle-outline',
        warning: 'mdi:alert-outline',
        success: 'mdi:check-circle-outline',
        info: props.icon || 'mdi:shield-check-outline'
    }
    return iconMap[props.variantClass] || props.icon || 'mdi:shield-check-outline'
})

const isConfirmDisabled = computed(() => {
    if (props.loading) return true

    switch (props.variant) {
        case 'text-confirmation':
            return userInput.value !== props.confirmationText
        case 'checkbox':
            return !checkboxConfirmed.value
        case 'simple':
        default:
            return false
    }
})

const handleConfirm = () => {
    if (!isConfirmDisabled.value) {
        emit('confirm')
    }
}

const closeModal = () => {
    userInput.value = ''
    checkboxConfirmed.value = false
    emit('close')
}

const handleOverlayClick = () => {
    if (!props.loading) closeModal()
}
</script>

<style scoped>
/* Animation premium */
.elite-modal-enter-active,
.elite-modal-leave-active {
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.elite-modal-enter-from,
.elite-modal-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.98);
}

/* Overlay luxueux */
.elite-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(10, 22, 31, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    padding: 1rem;
}

/* Container principal */
.elite-modal-container {
    width: 100%;
    max-width: 480px;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    box-shadow:
        0 12px 24px rgba(0, 0, 0, 0.16),
        0 24px 48px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.4);
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.elite-modal-overlay:hover .elite-modal-container {
    transform: translateY(-2px);
    box-shadow:
        0 16px 32px rgba(0, 0, 0, 0.2),
        0 32px 64px rgba(0, 0, 0, 0.16);
}

/* En-tête avec gradient */
.elite-modal-header {
    display: flex;
    align-items: center;
    padding: 1.5rem 2rem;
    position: relative;
    gap: 1rem;
}

.elite-modal-header.delete {
    background: linear-gradient(90deg, #eb4d4b 0%, #f87171 100%);
}

.elite-modal-header.danger {
    background: linear-gradient(90deg, #eb4d4b 0%, #f87171 100%);
}

.elite-modal-header.warning {
    background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.elite-modal-header.success {
    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
}

.elite-modal-header.confirm {
    background: linear-gradient(90deg, #5086c1 0%, #6a9fd8 100%);
}

.elite-modal-header.info {
    background: linear-gradient(90deg, #5086c1 0%, #6a9fd8 100%);
}

.elite-modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-text {
    flex-grow: 1;
}

.header-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 400;
}

.header-icon-container {
    position: relative;
    margin-right: 0.5rem;
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    position: relative;
    z-index: 2;
}

.header-icon.delete,
.header-icon.danger {
    background-color: white;
    color: #eb4d4b;
    box-shadow: 0 4px 12px rgba(235, 77, 75, 0.3);
}

.header-icon.warning {
    background-color: white;
    color: #f59e0b;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.header-icon.success {
    background-color: white;
    color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.header-icon.confirm,
.header-icon.info {
    background-color: white;
    color: #5086c1;
    box-shadow: 0 4px 12px rgba(80, 134, 193, 0.3);
}

.header-icon::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    z-index: -1;
    opacity: 0.4;
}

.header-icon.delete::after,
.header-icon.danger::after {
    background: #eb4d4b;
}

.header-icon.warning::after {
    background: #f59e0b;
}

.header-icon.success::after {
    background: #10b981;
}

.header-icon.confirm::after,
.header-icon.info::after {
    background: #5086c1;
}

.close-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 0.5rem;
    backdrop-filter: blur(4px);
    flex-shrink: 0;
}

.close-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.close-btn:disabled {
    cursor: not-allowed;
}

/* Contenu avec effet de verre */
.elite-modal-content {
    padding: 2rem;
}

.content-glass {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    padding: 1.5rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow:
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        0 4px 12px rgba(0, 0, 0, 0.05);
}

.modal-message {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0 0 1rem 0;
    color: #4b5563;
    font-size: 0.9375rem;
    line-height: 1.6;
}

.modal-message:last-child {
    margin-bottom: 0;
}

.message-icon {
    flex-shrink: 0;
    margin-top: 0.125rem;
    color: #5086c1;
}

/* Confirmation textuelle */
.confirmation-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.confirmation-label {
    font-size: 0.9rem;
    color: #4b5563;
    display: block;
    font-weight: 500;
}

.confirmation-text {
    background: rgba(80, 134, 193, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: #5086c1;
    font-weight: 700;
    font-family: monospace;
}

.confirmation-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(80, 134, 193, 0.2);
    border-radius: 8px;
    color: #4b5563;
    font-size: 0.95rem;
    font-family: monospace;
    transition: all 0.2s ease;
}

.confirmation-input:focus {
    outline: none;
    background: white;
    border-color: #5086c1;
    box-shadow: 0 0 0 3px rgba(80, 134, 193, 0.1);
}

.confirmation-input::placeholder {
    color: rgba(75, 85, 99, 0.5);
}

.input-hint {
    font-size: 0.8rem;
    color: #f59e0b;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

/* Checkbox */
.checkbox-section {
    display: flex;
    align-items: center;
    margin-top: 1rem;
}

.checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    user-select: none;
}

.checkbox-input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #5086c1;
}

.checkbox-label {
    color: #4b5563;
    font-size: 0.95rem;
    font-weight: 500;
}

/* Simple section */
.details-text {
    margin: 0;
    color: #4b5563;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* Pied de page */
.elite-modal-footer {
    display: flex;
    flex-direction: column;
}

.footer-separator {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%);
    position: relative;
}

.footer-separator::after {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 8px;
    background: #5086c1;
    border-radius: 4px;
    opacity: 0.2;
}

.footer-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 2rem;
}

.modal-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    font-weight: 500;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 140px;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.modal-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-btn:hover::after {
    opacity: 1;
}

.modal-btn.secondary {
    background-color: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.modal-btn.secondary:hover:not(:disabled) {
    background-color: #f9fafb;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-btn.primary {
    color: white;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.modal-btn.primary.delete,
.modal-btn.primary.danger {
    background: linear-gradient(135deg, #eb4d4b 0%, #f87171 100%);
}

.modal-btn.primary.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: #333;
}

.modal-btn.primary.success {
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
}

.modal-btn.primary.confirm,
.modal-btn.primary.info {
    background: linear-gradient(135deg, #5086c1 0%, #6a9fd8 100%);
}

.modal-btn.primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-btn.primary.loading {
    pointer-events: none;
    opacity: 0.7;
}

.modal-btn[disabled] {
    cursor: not-allowed;
    opacity: 0.7;
}

.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (max-width: 600px) {

    .elite-modal-header,
    .footer-buttons {
        padding: 1.25rem;
    }

    .elite-modal-content {
        padding: 1.5rem;
    }

    .content-glass {
        padding: 1.25rem;
    }

    .footer-buttons {
        flex-direction: column;
        gap: 0.75rem;
    }

    .modal-btn {
        width: 100%;
        min-width: auto;
    }
}
</style>
