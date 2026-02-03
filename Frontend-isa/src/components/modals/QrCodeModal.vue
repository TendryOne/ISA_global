<template>
    <div v-if="show" class="qr-modal-overlay" @click.self="close">
        <div class="qr-modal-content">
            <!-- Header -->
            <div class="qr-modal-header">
                <h2 class="qr-modal-title">
                    <Icon icon="mdi:qrcode" class="qr-title-icon" />
                    Code QR - {{ title }}
                </h2>
                <button class="qr-modal-close" @click="close" aria-label="Fermer">
                    <Icon icon="mdi:close" />
                </button>
            </div>

            <!-- Body -->
            <div class="qr-modal-body">
                <div class="qr-code-container">
                    <div class="qr-code-wrapper">
                        <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="qr-code-image" />
                    </div>
                    <p class="qr-code-description">{{ description }}</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="qr-modal-footer">
                <button class="qr-btn qr-btn-secondary" @click="close">
                    <Icon icon="mdi:close" />
                    Fermer
                </button>
                <button class="qr-btn qr-btn-primary" @click="downloadQrCode" :disabled="isDownloading">
                    <Icon v-if="!isDownloading" icon="mdi:download" />
                    <Icon v-else icon="mdi:loading" class="spinner" />
                    {{ isDownloading ? 'Téléchargement...' : 'Télécharger en PNG' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'

interface Props {
    show: boolean
    data: string
    title: string
    description?: string
}

interface Emits {
    (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
    description: 'Scannez ce code pour accéder aux informations'
})

const emit = defineEmits<Emits>()

const isDownloading = ref(false)

// Générer le QR code URL
const qrCodeUrl = useQRCode(computed(() => props.data))

// Télécharger le QR code en image
const downloadQrCode = async () => {
    if (!qrCodeUrl.value) return

    isDownloading.value = true
    try {
        // Créer un élément image pour extraire les données
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = qrCodeUrl.value

        img.onload = () => {
            // Créer un canvas
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height

            // Dessiner l'image sur le canvas
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(img, 0, 0)

                // Convertir en data URL et télécharger
                const imageData = canvas.toDataURL('image/png')
                const link = document.createElement('a')
                link.href = imageData
                link.download = `qrcode-${props.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`

                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
            isDownloading.value = false
        }

        img.onerror = () => {
            console.error('Erreur lors du chargement du QR code')
            isDownloading.value = false
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement du QR code:', error)
        isDownloading.value = false
    }
}

// Fermer le modal
const close = () => {
    emit('close')
}
</script>

<style scoped>
.qr-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 20px;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.qr-modal-content {
    background: var(--white);
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    max-width: 500px;
    width: 100%;
    animation: slideUp 0.3s ease;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.qr-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid var(--border-light);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: 16px 16px 0 0;
}

.qr-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 12px;
}

.qr-title-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.qr-modal-close {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.qr-modal-close:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

/* Body */
.qr-modal-body {
    padding: 40px 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.qr-code-wrapper {
    padding: 20px;
    background: var(--background-secondary);
    border-radius: 12px;
    border: 2px dashed var(--border-light);
    display: flex;
    align-items: center;
    justify-content: center;
}

.qr-code-wrapper canvas {
    max-width: 100%;
    height: auto;
    display: block;
}

.qr-code-description {
    margin: 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    text-align: center;
    max-width: 100%;
}

/* Footer */
.qr-modal-footer {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid var(--border-light);
    background: var(--background-secondary);
    border-radius: 0 0 16px 16px;
}

.qr-btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.qr-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.qr-btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
}

.qr-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(var(--primary-color-rgb), 0.3);
}

.qr-btn-secondary {
    background: white;
    color: var(--text-dark);
    border: 1px solid var(--border-light);
}

.qr-btn-secondary:hover:not(:disabled) {
    background: var(--background-secondary);
    border-color: var(--primary-color);
    color: var(--primary-color);
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
@media (max-width: 480px) {
    .qr-modal-content {
        max-width: 100%;
    }

    .qr-modal-header {
        padding: 16px;
    }

    .qr-modal-title {
        font-size: 1.1rem;
    }

    .qr-modal-body {
        padding: 24px 16px;
    }

    .qr-modal-footer {
        flex-direction: column;
        padding: 16px;
    }

    .qr-btn {
        width: 100%;
    }
}
</style>
