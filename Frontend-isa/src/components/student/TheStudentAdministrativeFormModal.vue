<template>
    <div class="overlay" @click.self="emitComponent('close')">
        <div class="modal-container">
            <div class="modal-card">
                <!-- Header with gradient -->
                <div class="modal-header">
                    <div class="header-content">
                        <div class="icon-wrapper">
                            <Icon icon="material-symbols:request-quote" class="header-icon" />
                        </div>
                        <div class="header-text">
                            <h2>{{ props.request?.requestType === 'transcript' ? 'Demande de relevé de notes' :
                                props.request?.requestType === "diploma" ? "Demande de diplôme" :
                                    props.request?.requestType === "enrollment_certificate" ?
                                        "Demande de certificat de scolarité" : "Nouvelle demande administrative"
                            }}</h2>
                            <p class="header-subtitle">Remplissez le formulaire ci-dessous</p>
                        </div>
                    </div>
                    <button @click="$emit('close')" class="close-btn">
                        <Icon icon="material-symbols:close" />
                    </button>
                </div>

                <!-- Form Content -->
                <Form @submit="handleSubmit" :initial-values="initialValues"
                    v-slot="{ errors, values, setFieldValue, meta }" :validation-schema="schemaValidation">
                    <div class="modal-body">


                        <!-- Request Type Selection -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <Icon icon="material-symbols:category" />
                                Type de demande
                            </h3>

                            <div class="request-type-grid">
                                <label v-for="option in requestTypeOptions" :key="option.value"
                                    class="request-type-card" :class="{
                                        'selected': values.requestType === option.value,
                                        'disabled': isEditMode
                                    }"
                                    @click="!isEditMode && (setFieldValue('requestType', option.value), handleRequestTypeChange(option.value, setFieldValue))">
                                    <Field name="requestType" type="radio" :value="option.value" v-slot="{ field }">
                                        <input type="radio" v-bind="field" :value="option.value"
                                            :checked="values.requestType === option.value" :disabled="isEditMode" />
                                    </Field>
                                    <div class="card-content">
                                        <Icon :icon="option.icon" class="card-icon" />
                                        <span class="card-label">{{ option.label }}</span>
                                    </div>
                                    <div class="card-checkmark">
                                        <Icon icon="material-symbols:check-circle" />
                                    </div>
                                </label>
                            </div>
                            <ErrorMessage name="requestType" class="error-message" />
                        </div>
                        <!-- Promotion Selection -->
                        <div class="form-section">
                            <h3 class="section-title">
                                <Icon icon="material-symbols:school" />
                                Promotion concernée
                            </h3>

                            <InputSelect name="promotion" label="Sélectionner une promotion"
                                :options="filteredPromotions" floating placeholder="" :error="!!errors.promotion"
                                :disabled="isEditMode || !values.requestType || values.requestType === 'enrollment_certificate'" />

                            <div v-if="!values.requestType" class="info-message">
                                <Icon icon="material-symbols:info" />
                                <span>Veuillez d'abord sélectionner un type de demande</span>
                            </div>
                            <div v-else-if="values.requestType === 'enrollment_certificate'" class="info-message">
                                <Icon icon="material-symbols:info" />
                                <span>Le certificat de scolarité est automatiquement associé à votre promotion en
                                    cours</span>
                            </div>
                        </div>

                        <!-- Form Actions -->

                    </div>
                    <div class="modal-footer">
                        <ActionButton type="button" @click="$emit('close')" icon="material-symbols:cancel"
                            variant="danger">
                            Annuler
                        </ActionButton>
                        <ActionButton type="submit" icon="material-symbols:send" iconPosition="right"
                            :disabled="isSubmitting || !meta.valid">
                            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande' }}
                        </ActionButton>
                    </div>
                </Form>
            </div>
        </div>
    </div>
    <SuccessToast v-if="toast.show" :message="toast.message" :title="toast.title" :type="toast.type"
        @dismissed="toast.show = false" />

</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import InputSelect from '../ui/InputSelect.vue';
import SuccessToast from '../toast/successToast.vue';
import ActionButton from '../ui/ActionButton.vue';
import type { AdministrativeRequestInterface } from '@/interfaces/administrative-requests.interface';
import { computed, ref, watch } from 'vue';
import { useMyUserStore } from '@/stores/userStore';
import type StudentInterface from '@/interfaces/student.intefaces';
import * as z from 'zod';
import { toTypedSchema } from '@vee-validate/zod';
import type { ToastInterface } from '@/interfaces/toast.interface';
import axios from 'axios';
import { useSocket } from '@/composables/useSocket';
import type PromotionInterface from '@/interfaces/promotion.interface';
const { emit } = useSocket();

const toast = ref<ToastInterface>({
    message: '',
    type: 'success',
    show: false,
    title: ''
})

const props = defineProps<{
    request: Pick<AdministrativeRequestInterface, 'requestType' | 'promotion'> | null
}>();

const emitComponent = defineEmits<{
    close: [];
    submit: [data: AdministrativeRequestInterface];
}>();

const isSubmitting = ref<boolean>(false);
const isEditMode = computed(() => !!props.request);

const requestTypeOptions = [
    { label: 'Relevé de notes', value: 'transcript', icon: 'material-symbols:description' },
    { label: 'Certificat de scolarité', value: 'enrollment_certificate', icon: 'material-symbols:badge' },
    { label: 'Diplôme', value: 'diploma', icon: 'material-symbols:workspace-premium' },
];

const schemaValidation = toTypedSchema(
    z.object({
        requestType: z.string().min(1, 'Le type de demande est requis'),
        promotion: z.string().min(1, 'La promotion est requise'),
    })
);

const user = useMyUserStore().currentUser as StudentInterface;
const promotions = computed(() =>
    user.parcours.map(promo => ({
        label: (promo.promotion as PromotionInterface).name || '',
        value: (promo.promotion as PromotionInterface)._id || '',
        inProgress: promo.status === 'in progress' || false,
    }))
);


const filteredPromotions = computed(() => {
    // Pour enrollment_certificate, afficher uniquement la promotion en cours
    if (props.request?.requestType === 'enrollment_certificate' || initialValues.value.requestType === 'enrollment_certificate') {
        return promotions.value.filter(promo => promo.inProgress);
    }
    return promotions.value;
});

const initialValues = computed(() => {
    return {
        requestType: props.request?.requestType || '',
        promotion: props.request?.promotion || '',
    }
});

const handleRequestTypeChange = (requestType: string, setFieldValue: any) => {
    // Si c'est enrollment_certificate, sélectionner automatiquement la promotion en cours
    if (requestType === 'enrollment_certificate') {
        const inProgressPromo = promotions.value.find(promo => promo.inProgress);
        if (inProgressPromo) {
            setFieldValue('promotion', inProgressPromo.value);
        }
    }
};

const handleSubmit = async (values: any) => {
    isSubmitting.value = true;
    try {
        const response = await axios.post("/api/v1/administrativeRequests", {
            requestType: values.requestType,
            promotion: values.promotion
        });
        toast.value = {
            message: 'Votre demande a été envoyée avec succès.',
            type: 'success',
            show: true,
            title: 'Succès'
        };
        emit("administrativeRequestNotificationByStudent", { request: response.data });
        emitComponent('close');

        emitComponent('submit', response.data);

    } catch (e) {
        toast.value = {
            message: axios.isAxiosError(e) && e.response ? e.response.data : "Une erreur s'est produite lors de l'envoi de la demande.",
            type: 'error',
            show: true,
            title: 'Erreur'
        };
    }
    finally {
        isSubmitting.value = false;
    }
};
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 37, 64, 0.95);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
    padding: 2rem 1rem;
    overflow-y: auto;
}

.modal-container {
    max-width: 700px;
    width: 100%;
    position: relative;
    z-index: 1001;
}

.modal-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    border: 1px solid #e5e7eb;
    animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.modal-header {
    background: linear-gradient(135deg, #5086c1, #1a252f);
    color: white;
    padding: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    overflow: hidden;
}

.modal-header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
        opacity: 0.5;
    }

    50% {
        transform: scale(1.1);
        opacity: 0.8;
    }
}

.header-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
}

.icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-icon {
    font-size: 2.5rem;
    color: white;
}

.header-text h2 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
}

.header-subtitle {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9375rem;
}

.close-btn {
    background: rgba(255, 255, 255, 0.15);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
}

.close-btn :global(svg) {
    font-size: 1.5rem;
}

/* Modal Body */
.modal-body {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    overflow-y: auto;
    height: 60vh;
}

/* Form Section */
.form-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
}

.section-title :global(svg) {
    font-size: 1.5rem;
    color: var(--primary-color);
}

/* Request Type Grid */
.request-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.request-type-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.request-type-card:not(.disabled):hover {
    border-color: var(--primary-color);
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.15);
    transform: translateY(-2px);
}

.request-type-card.selected {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, rgba(var(--primary-color-rgb), 0.1), rgba(var(--primary-color-rgb), 0.05));
}

.request-type-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.request-type-card input[type="radio"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
}

.card-icon {
    font-size: 3rem;
    color: var(--primary-color);
    transition: all 0.3s ease;
}

.request-type-card.selected .card-icon {
    transform: scale(1.1);
}

.card-label {
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--text-primary);
}

.card-checkmark {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 1.5rem;
    color: var(--primary-color);
    opacity: 0;
    transition: all 0.3s ease;
}

.request-type-card.selected .card-checkmark {
    opacity: 1;
    transform: scale(1);
}

/* Info Message */
.info-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(59, 130, 246, 0.1);
    border-left: 3px solid #3b82f6;
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.info-message :global(svg) {
    font-size: 1.25rem;
    flex-shrink: 0;
}

/* Info Card */
.info-card {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
    border-left: 4px solid #10b981;
    border-radius: 8px;
}

.info-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: white;
    color: #10b981;
    flex-shrink: 0;
}

.info-icon-wrapper :global(svg) {
    font-size: 1.5rem;
}

.info-text {
    flex: 1;
}

.info-text p {
    margin: 0;
    font-size: 0.9375rem;
    color: var(--text-primary);
    line-height: 1.6;
}

.highlight {
    color: var(--primary-color);
    font-weight: 700;
}

/* Error Message */
.error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--error);
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

/* Footer */
.modal-footer {
    display: flex;
    gap: 1rem;
    padding: 1.5rem 1rem;
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
}

.cancel-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: #f3f4f6;
    color: var(--text-secondary);
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cancel-btn:hover {
    background: #e5e7eb;
    transform: translateY(-2px);
}

.cancel-btn :global(svg) {
    color: var(--danger);
}



/* Responsive */
@media (max-width: 1024px) {
    .modal-body {
        height: auto;
        max-height: 70vh;
    }

    .header-text h2 {
        font-size: 1.5rem;
    }

    .section-title {
        font-size: 1rem;
    }

    .section-title :global(svg) {
        font-size: 1.25rem;
    }
}

@media (max-width: 768px) {
    .overlay {
        padding: 0.75rem;
    }

    .modal-card {
        border-radius: 12px;
    }

    .modal-header {
        padding: 1.25rem;
    }

    .header-content {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .icon-wrapper {
        width: 60px;
        height: 60px;
    }

    .header-icon {
        font-size: 2rem;
    }

    .header-text h2 {
        font-size: 1.375rem;
        margin-bottom: 0.25rem;
    }

    .header-subtitle {
        font-size: 0.875rem;
    }

    .close-btn {
        width: 36px;
        height: 36px;
    }

    .close-btn :global(svg) {
        font-size: 1.25rem;
    }

    .modal-body {
        padding: 1.25rem;
        gap: 1.25rem;
        height: auto;
        max-height: 65vh;
    }

    .form-section {
        gap: 0.75rem;
    }

    .section-title {
        font-size: 1rem;
        gap: 0.5rem;
    }

    .section-title :global(svg) {
        font-size: 1.25rem;
    }

    .request-type-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .request-type-card {
        padding: 1.25rem 1rem;
    }

    .card-icon {
        font-size: 2.5rem;
    }

    .card-label {
        font-size: 0.875rem;
    }

    .info-message {
        padding: 0.75rem;
        gap: 0.5rem;
        font-size: 0.8125rem;
    }

    .info-message :global(svg) {
        font-size: 1rem;
    }

    .modal-footer {
        padding: 1rem;
        gap: 0.75rem;
        flex-direction: column-reverse;
    }

    .modal-footer :global(button) {
        width: 100%;
        font-size: 0.9375rem;
    }

    .modal-footer :global(button):global(svg) {
        font-size: 1rem;
    }
}

@media (max-width: 480px) {
    .overlay {
        padding: 0.5rem;
        align-items: center;
    }

    .modal-container {
        max-width: calc(100vw - 1rem);
    }

    .modal-card {
        border-radius: 8px;
        max-height: 90vh;
    }

    .modal-header {
        padding: 1rem;
    }

    .header-content {
        align-items: center;
    }

    .icon-wrapper {
        width: 50px;
        height: 50px;
    }

    .header-icon {
        font-size: 1.75rem;
    }

    .header-text h2 {
        font-size: 1.125rem;
        margin-bottom: 0.125rem;
    }

    .header-subtitle {
        font-size: 0.75rem;
    }

    .close-btn {
        width: 32px;
        height: 32px;
    }

    .close-btn :global(svg) {
        font-size: 1.125rem;
    }

    .modal-body {
        padding: 1rem;
        gap: 1rem;
        max-height: calc(90vh - 180px);
    }

    .form-section {
        gap: 0.625rem;
    }

    .section-title {
        font-size: 0.9375rem;
        gap: 0.375rem;
    }

    .section-title :global(svg) {
        font-size: 1.125rem;
    }

    .request-type-grid {
        grid-template-columns: 1fr;
        gap: 0.625rem;
    }

    .request-type-card {
        padding: 1rem;
        border-radius: 8px;
    }

    .card-icon {
        font-size: 2rem;
    }

    .card-label {
        font-size: 0.8125rem;
    }

    .card-checkmark {
        top: 0.5rem;
        right: 0.5rem;
        font-size: 1.25rem;
    }

    .info-message {
        padding: 0.625rem;
        gap: 0.375rem;
        font-size: 0.75rem;
        border-radius: 6px;
    }

    .info-message :global(svg) {
        font-size: 0.9rem;
        min-width: 0.9rem;
    }

    .modal-footer {
        padding: 0.875rem;
        gap: 0.625rem;
        border-radius: 0;
    }

    .modal-footer :global(button) {
        width: 100%;
        font-size: 0.875rem;
        padding: 0.75rem;
    }

    .modal-footer :global(button):global(svg) {
        font-size: 0.9rem;
    }
}
</style>