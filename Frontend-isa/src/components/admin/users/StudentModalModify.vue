<template>
    <div class="modal-overlay" v-if="show" @click.self="emit('close')">
        <div class="modal-container">
            <div class="modal-header">
                <div class="header-icon">
                    <Icon icon="mdi:account-edit" width="24" height="24" />
                </div>
                <h2 class="modal-title">{{ props.student ? 'Modifier l\'étudiant' : 'Ajouter un étudiant' }}</h2>
                <p class="modal-subtitle">
                    {{ props.student ? 'Modifiez les informations de l\'étudiant' : 'Ajoutez un nouvel étudiant' }}
                </p>
            </div>

            <Form v-slot="{ errors, values, isSubmitting }" @submit="handleSubmit" :initial-values="initialValues"
                :key="props.student?._id" :validation-schema="schemaValidation" class="modal-form">
                <div class="modal-content">
                    <div class="form-fields">
                        <div class="form-row">
                            <div class="form-group">
                                <InputField name="firstName" floating label="Prénom" :error="!!errors.firstName"
                                    size="small" />
                            </div>
                            <div class="form-group">
                                <InputField name="name" floating label="Nom" :error="!!errors.name" size="small" />
                            </div>
                        </div>

                        <div class="form-group">
                            <InputSelect name="gender" :options="genderOptions" floating label="Genre"
                                :error="!!errors.gender" size="small" />
                        </div>

                        <div class="form-group">
                            <InputField name="email" floating label="Email" type="email" :error="!!errors.email"
                                size="small" />
                        </div>

                        <div class="form-group">
                            <InputField name="address" floating label="Adresse" :error="!!errors.address"
                                size="small" />
                        </div>

                        <div class="form-group">
                            <InputField name="phone" floating label="Téléphone" type="tel" :error="!!errors.phone"
                                size="small" />
                        </div>

                        <div class="section-divider">
                            <span>Contact d'urgence</span>
                        </div>

                        <div class="form-group">
                            <InputField name="emergencyContactName" floating label="Nom du contact d'urgence"
                                :error="!!errors.emergencyContactName" size="small" />
                        </div>

                        <div class="form-group">
                            <InputField name="emergencyContactPhone" floating label="Téléphone du contact d'urgence"
                                type="tel" :error="!!errors.emergencyContactPhone" size="small" />
                        </div>

                        <div class="form-group">
                            <InputSelect name="emergencyContactRelation" :options="contactRelationOptions" floating
                                label="Relation avec le contact d'urgence" :error="!!errors.emergencyContactRelation"
                                size="small" />
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="form-actions">
                        <ActionButton variant="danger" type="button" @click="emit('close')" icon="ph:x-circle"
                            iconPosition="left">
                            Annuler
                        </ActionButton>
                        <ActionButton type="submit" :disabled="isSubmitting" icon="ph:check-circle"
                            iconPosition="right">
                            {{ props.student ? 'Modifier l\'étudiant' : 'Ajouter l\'étudiant' }}
                        </ActionButton>
                    </div>
                </div>
            </Form>
        </div>
    </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/ui/ActionButton.vue';
import InputField from '@/components/ui/InputField.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import type StudentInterface from '@/interfaces/student.intefaces';
import { toTypedSchema } from '@vee-validate/zod';
import { Form } from 'vee-validate';
import { computed } from 'vue';
import * as z from 'zod';
import { Icon } from '@iconify/vue';

const props = defineProps<{
    show: boolean;
    student: StudentInterface | null;
}>()

const schemaValidation = toTypedSchema(z.object({
    firstName: z.string().min(1, 'Le prénom est requis'),
    name: z.string().min(1, 'Le nom est requis'),
    emergencyContactName: z.string().min(1, "Le nom du contact d'urgence est requis"),
    emergencyContactPhone: z.string().min(1, "Le téléphone du contact d'urgence est requis"),
    emergencyContactRelation: z.string().min(1, "La relation avec le contact d'urgence est requise"),
    email: z.string().email('Email invalide').min(1, "L'email est requis"),
    address: z.string().min(1, "L'adresse est requise"),
    phone: z.string().min(1, 'Le téléphone est requis'),
    gender: z.string().min(1, 'Le genre est requis'),
}));

const initialValues = computed(() => {
    return {
        firstName: props.student?.firstName || '',
        name: props.student?.name || '',
        emergencyContactName: props.student?.emergencyContactName || '',
        emergencyContactPhone: props.student?.emergencyContactPhone || '',
        emergencyContactRelation: props.student?.emergencyContactRelation || '',
        email: props.student?.email || '',
        address: props.student?.address || '',
        phone: props.student?.phone || '',
        gender: props.student?.gender || '',
    };
});

const genderOptions = [
    { label: 'Masculin', value: 'male' },
    { label: 'Féminin', value: 'female' },
];

const contactRelationOptions = [
    { label: 'Parent', value: 'parent' },
    { label: 'Tuteur', value: 'tuteur' },
    { label: 'Conjoint', value: 'conjoint' },
    { label: "Frère/Soeur", value: "fratrie" }
];

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'submit', student: StudentInterface): void;
}>();

const handleSubmit = (values: any) => {
    emit("submit", values);
};
</script>

<style scoped>
/* Modal adapté à 100vh avec design clair */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-container {
    background: var(--white);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 520px;
    max-height: calc(100vh - 2rem);
    position: relative;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-light);
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
}

/* Header du modal */
.modal-header {
    text-align: center;
    padding: 2rem 2rem 1.5rem 2rem;
    border-bottom: 1px solid var(--border-light);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.header-icon {
    width: 56px;
    height: 56px;
    border-radius: var(--rounded);
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1rem;
    color: var(--white);
    box-shadow: var(--shadow-md);
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--white);
    margin: 0 0 0.5rem 0;
    line-height: 1.3;
}

.modal-subtitle {
    font-size: 0.95rem;
    color: var(--text-tertiary);
    margin: 0;
    line-height: 1.4;
}

/* Contenu principal */
.modal-content {
    padding: 2rem;
    flex: 1 1 auto;
    overflow-y: auto;
    max-height: 50vh;
}

.modal-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--border-light);
    background: var(--background-light);
    border-radius: 0 0 var(--radius-xl) var(--radius-xl);
    box-shadow: var(--shadow-xs);
    position: sticky;
    bottom: 0;
    z-index: 2;
}

.modal-form {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.form-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-group {
    position: relative;
}

/* Section divider */
.section-divider {
    position: relative;
    text-align: center;
    margin: 1rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 600;
}

.section-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--border-light);
    z-index: 1;
}

.section-divider span {
    background: var(--white);
    padding: 0 1rem;
    position: relative;
    z-index: 2;
}

/* Actions du formulaire */
.form-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.25rem;
}

.submit-button {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    width: 100%;
    cursor: pointer;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.submit-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.cancel-button {
    background: var(--gray-lighter);
    border: 1px solid var(--border-light);
    padding: 0.875rem 1.5rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    width: 100%;
    cursor: pointer;
}

.cancel-button:hover {
    background: var(--gray-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
}

/* Animations */
@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Responsive pour mobile */
@media (max-width: 768px) {
    .modal-overlay {
        padding: 0.5rem;
        align-items: flex-start;
        padding-top: 1rem;
    }

    .modal-container {
        max-height: calc(100vh - 1rem);
        max-width: 95%;
    }

    .modal-header {
        padding: 1.5rem 1.5rem 1.25rem 1.5rem;
    }

    .modal-content {
        padding: 1.5rem;
    }

    .modal-title {
        font-size: 1.375rem;
    }

    .modal-subtitle {
        font-size: 0.9rem;
    }

    .header-icon {
        width: 48px;
        height: 48px;
    }

    .form-row {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    .form-actions {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }
}

@media (max-width: 480px) {
    .modal-container {
        border-radius: var(--radius-lg);
    }

    .modal-header {
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        padding: 1.25rem 1.25rem 1rem 1.25rem;
    }

    .modal-content {
        padding: 1.25rem;
    }

    .modal-title {
        font-size: 1.25rem;
    }

    .header-icon {
        width: 44px;
        height: 44px;
    }

    .submit-button,
    .cancel-button {
        padding: 0.75rem 1.25rem;
        font-size: 0.85rem;
    }
}

/* Mode hauteur réduite */
@media (max-height: 700px) {
    .modal-header {
        padding: 1.25rem 2rem 1rem 2rem;
    }

    .modal-content {
        padding: 1.5rem 2rem;
        max-height: 40vh;
    }

    .form-fields {
        gap: 1rem;
    }

    .header-icon {
        width: 44px;
        height: 44px;
        margin-bottom: 0.75rem;
    }

    .modal-title {
        font-size: 1.375rem;
        margin-bottom: 0.25rem;
    }
}

/* Accessibilité */
@media (prefers-reduced-motion: reduce) {

    .modal-overlay,
    .modal-container,
    .submit-button,
    .cancel-button {
        animation: none;
        transition: none;
    }
}
</style>