<template>
    <div class="overlay" @click.self="closeModal">
        <div class="form-modal">
            <div class="modal-header">
                <div class="header-icon">
                    <Icon icon="material-symbols:payments" />
                </div>
                <div class="header-text">
                    <h2>Effectuer un paiement</h2>
                    <p>Soumettez la preuve de votre paiement pour validation</p>
                </div>
                <button class="close-btn" @click="closeModal" type="button">
                    <Icon icon="material-symbols:close" />
                </button>
            </div>

            <Form v-slot="{ errors, values }" @submit="handleSubmit">
                <div class="modal-body">
                    <!-- Informations sur le paiement -->
                    <div class="payment-info-card">
                        <div class="info-row">
                            <span class="info-label">
                                <Icon icon="material-symbols:label" />
                                Libellé
                            </span>
                            <span class="info-value">{{ installment.label }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">
                                <Icon icon="material-symbols:payments" />
                                Montant
                            </span>
                            <span class="info-value amount">{{ installment.amount?.toLocaleString() }} Ar</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">
                                <Icon icon="material-symbols:calendar-today" />
                                Date d'échéance
                            </span>
                            <span class="info-value">{{ new Date(installment.dueDate).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }) }}</span>
                        </div>
                        <div v-if="paymentMethod === 'mobile'">
                            <div class="info-row">
                                <span class="info-label">
                                    <Icon icon="streamline-freehand:cash-payment-bill" />
                                    Numero MVola
                                </span>
                                <span class="info-value">{{ DataPayments.mobileMoneyNumber }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">
                                    <Icon icon="material-symbols:account-circle" />
                                    Au nom de
                                </span>
                                <span class="info-value">{{ DataPayments.mobileMoneyOwner }}</span>
                            </div>
                        </div>
                        <div v-else>
                            <div class="info-row">
                                <span class="info-label">
                                    <Icon icon="mdi:bank" />
                                    Nom de la banque
                                </span>
                                <span class="info-value">{{ DataPayments.BankName }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">
                                    <Icon icon="solar:card-bold" />
                                    Numero de compte
                                </span>
                                <span class="info-value">{{ DataPayments.BankAccountNumber }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">
                                    <Icon icon="material-symbols:account-circle" />
                                    Proprietaire du compte
                                </span>
                                <span class="info-value">{{ DataPayments.BankAccountOwner }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sélection de la méthode de paiement -->
                    <div class="form-section">
                        <label class="section-label">Méthode de paiement</label>
                        <div class="payment-methods">
                            <div class="payment-method-card" :class="{ active: paymentMethod === 'bank' }"
                                @click="paymentMethod = 'bank'">
                                <div class="method-icon">
                                    <Icon icon="material-symbols:account-balance" />
                                </div>
                                <div class="method-info">
                                    <h3>Virement bancaire</h3>
                                    <p>Télécharger le reçu bancaire</p>
                                </div>
                                <div class="method-radio">
                                    <div class="radio-dot"></div>
                                </div>
                            </div>

                            <div class="payment-method-card" :class="{ active: paymentMethod === 'mobile' }"
                                @click="paymentMethod = 'mobile'">
                                <div class="method-icon">
                                    <Icon icon="material-symbols:smartphone" />
                                </div>
                                <div class="method-info">
                                    <h3>Mobile Money</h3>
                                    <p>Référence de transaction</p>
                                </div>
                                <div class="method-radio">
                                    <div class="radio-dot"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Champ conditionnel selon la méthode -->
                    <div v-if="paymentMethod === 'bank'" class="form-section">
                        <label class="section-label">Preuve de paiement</label>
                        <Field name="proofFile" v-slot="{ handleChange, errorMessage }" :rules="proofFileValidation">
                            <div class="file-upload-zone"
                                :class="{ 'has-file': selectedFile, 'has-error': errorMessage }">
                                <input type="file" accept="image/jpeg,image/jpg,image/png"
                                    @change="(e) => handleFileChange(e, handleChange)" class="file-input"
                                    id="proof-file" />

                                <label for="proof-file" class="file-upload-label">
                                    <div v-if="!selectedFile" class="upload-placeholder">
                                        <Icon icon="material-symbols:cloud-upload" class="upload-icon" />
                                        <h4>Cliquez pour télécharger</h4>
                                        <p>ou glissez-déposez votre fichier ici</p>
                                        <span class="file-info">JPG, JPEG ou PNG • Max 3 MB</span>
                                    </div>
                                    <div v-else class="file-preview">
                                        <Icon icon="material-symbols:image" class="preview-icon" />
                                        <div class="file-details">
                                            <span class="file-name">{{ selectedFile.name }}</span>
                                            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
                                        </div>
                                        <button type="button" @click.prevent="removeFile(handleChange)"
                                            class="remove-file-btn">
                                            <Icon icon="material-symbols:close" />
                                        </button>
                                    </div>
                                </label>
                            </div>
                            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
                        </Field>
                    </div>

                    <div v-if="paymentMethod === 'mobile'" class="form-section">
                        <InputField name="transactionRef" :error="!!errors.transactionRef" floating
                            label="Référence de transaction" placeholder="Ex: TXN123456789"
                            :rules="transactionValidation" />
                        <p class="field-hint">
                            <Icon icon="material-symbols:info" />
                            <span>Entrez le numéro de référence fourni après votre paiement mobile</span>
                        </p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" @click="closeModal" class="btn-cancel">
                        Annuler
                    </button>
                    <button type="submit" class="btn-submit" :disabled="loading">
                        <Icon v-if="!loading" icon="material-symbols:check-circle" />
                        <Icon v-else icon="material-symbols:sync" class="spinning" />
                        <span>{{ loading ? 'Envoi en cours...' : 'Soumettre le paiement' }}</span>
                    </button>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { toTypedSchema } from '@vee-validate/zod';
import { Form, Field } from 'vee-validate';
import * as z from 'zod';
import InputField from '../ui/InputField.vue';
import { ref } from 'vue';
import type { InstallmentsInterface } from '@/interfaces/tutionFees.interface';
import DataPayments from '@/data/paymentData';

const paymentMethod = ref<'bank' | 'mobile'>('bank');
const selectedFile = ref<File | null>(null);


const props = defineProps<{
    installment: InstallmentsInterface
    loading: boolean
}>()

const transactionValidation = toTypedSchema(z.string({ required_error: 'La référence est requise' }).min(3, 'La référence doit contenir au moins 3 caractères').max(100))
const proofFileValidation = toTypedSchema(z.instanceof(File, { message: 'veuillez uploader un fichier valide' })
    .refine((file) => {
        if (!file) return true;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        return allowedTypes.includes(file.type);
    }, {
        message: 'Format non supporté. Veuillez utiliser JPG, JPEG ou PNG.'
    })
    .refine((file) => {
        if (!file) return true;
        const maxSize = 3 * 1024 * 1024; // 3 MB
        return file.size <= maxSize;
    }, {
        message: 'Le fichier est trop volumineux. Maximum 3 MB.'
    }))



const emit = defineEmits<{
    (e: 'submit', data: any): void;
    (e: 'close'): void;
}>()

const handleFileChange = (event: Event, handleChange: Function) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
        selectedFile.value = null;
        handleChange(null);
        return;
    }

    selectedFile.value = file;
    handleChange(file);
}

const removeFile = (handleChange: Function) => {
    selectedFile.value = null;
    handleChange(null);
    // Réinitialiser l'input file
    const fileInput = document.getElementById('proof-file') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

const handleSubmit = async (data: any) => {
    // Validation finale
    if (paymentMethod.value === 'bank' && !selectedFile.value) {
        return; // VeeValidate gère la validation
    }

    if (paymentMethod.value === 'mobile' && !data.transactionRef) {
        return;
    }


    const formData = new FormData();
    formData.append('method', paymentMethod.value === 'bank' ? 'bank' : 'mobileMoney');

    if (paymentMethod.value === 'bank' && selectedFile.value) {
        formData.append('proofFile', selectedFile.value);
    } else if (paymentMethod.value === 'mobile') {
        formData.append('transactionRef', data.transactionRef);
    }

    emit('submit', formData);

}

const closeModal = () => {
    paymentMethod.value = 'bank';
    selectedFile.value = null;
    emit('close');
}



</script>

<style scoped>
/* Overlay */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(8px);
    padding: 1rem;
    animation: overlayFadeIn 0.3s ease-out;
}

@keyframes overlayFadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* Modal */
.form-modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

.form-modal form {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-height: 0;
}

/* Custom scrollbar */
.modal-body::-webkit-scrollbar {
    width: 8px;
}

.modal-body::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Header */
.modal-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 1.5rem 2rem;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    border-radius: 20px 20px 0 0;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.header-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
}

.header-text {
    flex: 1;
    min-width: 0;
}

.header-text h2 {
    margin: 0 0 0.25rem 0;
    font-size: 1.25rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.header-text p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
}

/* Payment Info Card */
.payment-info-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border: 1px solid #dee2e6;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

.info-row:not(:last-child) {
    border-bottom: 1px solid #dee2e6;
}

.info-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #6c757d;
}

.info-label svg {
    font-size: 1.2rem;
    color: var(--primary-color);
}

.info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-dark);
    text-align: right;
}

.info-value.amount {
    color: var(--primary-color);
    font-size: 1.1rem;
}

/* Form sections */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section-label {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

/* Payment Methods */
.payment-methods {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.payment-method-card {
    position: relative;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.payment-method-card:hover {
    border-color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.02);
    transform: translateY(-2px);
}

.payment-method-card.active {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.08) 0%, rgba(var(--primary-color-rgb), 0.04) 100%);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
}

.method-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--primary-extra-light);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s ease;
}

.payment-method-card.active .method-icon {
    background: var(--primary-color);
    color: white;
}

.method-info h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-dark);
}

.method-info p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.method-radio {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.payment-method-card.active .method-radio {
    border-color: var(--primary-color);
}

.radio-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: transparent;
    transition: all 0.3s ease;
}

.payment-method-card.active .radio-dot {
    background: var(--primary-color);
}

/* File Upload */
.file-upload-zone {
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.file-upload-zone:hover {
    border-color: var(--primary-color);
    background: rgba(var(--primary-color-rgb), 0.02);
}

.file-upload-zone.has-file {
    border-color: var(--success);
    background: rgba(var(--success-rgb), 0.05);
}

.file-upload-zone.has-error {
    border-color: var(--error);
    background: rgba(var(--error-rgb), 0.05);
}

.file-input {
    display: none;
}

.file-upload-label {
    display: block;
    cursor: pointer;
}

.upload-placeholder {
    padding: 3rem 2rem;
    text-align: center;
}

.upload-icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.upload-placeholder h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-dark);
}

.upload-placeholder p {
    margin: 0 0 1rem 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
}

.file-info {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--background-light);
    border-radius: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    font-weight: 600;
}

.file-preview {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.preview-icon {
    font-size: 3rem;
    color: var(--success);
    flex-shrink: 0;
}

.file-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.file-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-dark);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.remove-file-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: var(--error-light);
    color: var(--error);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.remove-file-btn:hover {
    background: var(--error);
    color: white;
}

.error-message {
    display: block;
    color: var(--error);
    font-size: 0.85rem;
    font-weight: 600;
    margin-top: 0.5rem;
}

.field-hint {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(var(--primary-color-rgb), 0.05);
    border-radius: 8px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
}

.field-hint svg {
    font-size: 1.1rem;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.1rem;
}

/* Footer */
.modal-footer {
    position: sticky;
    bottom: 0;
    background: white;
    padding: 1.25rem 2rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    border-radius: 0 0 20px 20px;
}

.btn-cancel,
.btn-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.btn-cancel {
    background: var(--background-light);
    color: var(--text-dark);
}

.btn-cancel:hover {
    background: #e2e8f0;
}

.btn-submit {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
}

.btn-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.4);
}

.btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-submit svg,
.btn-cancel svg {
    font-size: 1.15rem;
    flex-shrink: 0;
}

.spinning {
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
@media (max-width: 640px) {
    .modal-header {
        padding: 1.25rem 1.5rem;
    }

    .header-icon {
        width: 40px;
        height: 40px;
        font-size: 1.25rem;
    }

    .header-text h2 {
        font-size: 1.1rem;
    }

    .header-text p {
        font-size: 0.8rem;
    }

    .close-btn {
        width: 36px;
        height: 36px;
        font-size: 1.25rem;
    }

    .modal-body {
        padding: 1.5rem;
    }

    .payment-methods {
        grid-template-columns: 1fr;
    }

    .modal-footer {
        padding: 1rem 1.5rem;
        flex-direction: column;
    }

    .btn-cancel,
    .btn-submit {
        width: 100%;
        padding: 0.875rem 1.25rem;
    }
}
</style>