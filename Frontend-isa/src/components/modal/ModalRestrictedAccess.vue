<template>
    <div class="luxury-modal-overlay" @click.self="closeModal">
        <div class="luxury-modal-container">
            <div class="modal-header" :style="{ background: headerColor }">
                <div class="header-icon-container" v-if="icon">
                    <div class="header-icon" :style="{ color: iconColor }">
                        <Icon :icon="icon" width="28" />
                    </div>
                </div>
                <div class="header-text">
                    <h3>{{ title }}</h3>
                    <p class="header-subtitle" v-if="subtitle">{{ subtitle }}</p>
                </div>
                <button class="close-btn" @click="closeModal" type="button">
                    <Icon icon="mdi:close" width="22" />
                </button>
            </div>

            <div class="modal-content">
                <div class="content-glass">
                    <slot>
                        <p class="modal-message" v-if="message">
                            <Icon v-if="messageIcon" :icon="messageIcon" width="24" class="message-icon"
                                :style="{ color: messageIconColor }" />
                            <span>{{ message }}</span>
                        </p>
                        <p class="help-text" v-if="helpText">
                            <Icon icon="mdi:information-outline" width="20" />
                            <span>{{ helpText }}</span>
                        </p>
                    </slot>
                </div>
            </div>

            <div class="modal-footer" v-if="showFooter">
                <div class="footer-separator"></div>
                <div class="footer-buttons">
                    <slot name="footer">
                        <button class="modal-btn secondary" @click="closeModal" type="button">
                            <Icon icon="mdi:arrow-left" width="20" />
                            <span>{{ closeButtonText }}</span>
                        </button>
                        <button v-if="primaryButtonText" class="modal-btn primary" @click="onPrimaryAction"
                            type="button">
                            <Icon v-if="primaryButtonIcon" :icon="primaryButtonIcon" width="20" />
                            <span>{{ primaryButtonText }}</span>
                        </button>
                    </slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
    title?: string
    subtitle?: string
    message?: string
    helpText?: string
    icon?: string
    iconColor?: string
    messageIcon?: string
    messageIconColor?: string
    headerColor?: string
    closeButtonText?: string
    primaryButtonText?: string
    primaryButtonIcon?: string
    showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Modal',
    subtitle: '',
    message: '',
    helpText: '',
    icon: '',
    iconColor: '#5086c1',
    messageIcon: '',
    messageIconColor: '#5086c1',
    headerColor: 'linear-gradient(90deg, #5086c1 0%, #6a9fd8 100%)',
    closeButtonText: 'Fermer',
    primaryButtonText: '',
    primaryButtonIcon: '',
    showFooter: true
})

const emit = defineEmits(['close', 'primary-action'])

const closeModal = () => {
    emit('close')
}

const onPrimaryAction = () => {
    emit('primary-action')
}
</script>


<style scoped>
.luxury-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}

.luxury-modal-container {
    width: 100%;
    max-width: 480px;
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border-radius: 16px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16), 0 24px 48px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.4);
    transform: translateY(0);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.modal-header {
    display: flex;
    align-items: center;
    padding: 1.5rem 2rem;
    gap: 1rem;
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
    background-color: white;
    box-shadow: 0 4px 12px rgba(80, 134, 193, 0.3);
}

.header-text {
    flex-grow: 1;
}

.header-text h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.header-subtitle {
    margin: 0.25rem 0 0 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 400;
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

.close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

.modal-content {
    padding: 2rem;
}

.content-glass {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    padding: 1.5rem;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.05);
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

.message-icon {
    flex-shrink: 0;
    margin-top: 2px;
}

.help-text {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
    line-height: 1.5;
}

.help-text :deep(svg) {
    flex-shrink: 0;
    margin-top: 1px;
    color: #5086c1;
}

.modal-footer {
    padding: 0 2rem 2rem;
}

.footer-separator {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
    margin-bottom: 1.5rem;
}

.footer-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.modal-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    outline: none;
}

.modal-btn.secondary {
    background: #f1f5f9;
    color: #64748b;
}

.modal-btn.secondary:hover {
    background: #e2e8f0;
    color: #475569;
}

.modal-btn.primary {
    background: linear-gradient(90deg, #5086c1 0%, #6a9fd8 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(80, 134, 193, 0.3);
}

.modal-btn.primary:hover {
    box-shadow: 0 4px 12px rgba(80, 134, 193, 0.4);
    transform: translateY(-1px);
}

@media (max-width: 640px) {
    .modal-content {
        padding: 1.5rem;
    }

    .modal-footer {
        padding: 0 1.5rem 1.5rem;
    }

    .footer-buttons {
        flex-direction: column-reverse;
    }

    .modal-btn {
        width: 100%;
        justify-content: center;
    }
}
</style>
