<template>
    <div class="overlay">
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">Statut de l'étudiant</h2>
                <p class="modal-subtitle">Définir le statut académique pour <strong>{{ student?.matricule }}</strong>
                </p>
            </div>

            <Form class="status-form" @submit="handleSubmit" v-slot="{ errors, isSubmitting, meta, values }"
                :validation-schema="validationSchema">
                <div class="radio-group">
                    <legend class="radio-legend">Choisir une option :</legend>
                    <div class="radio-options">
                        <label v-for="option in statusOptions" :key="option.value" class="radio-label">
                            <Field type="radio" name="status" :value="option.value" class="radio-input" />
                            <span class="radio-custom"></span>
                            <span class="radio-text">{{ option.label }}</span>
                        </label>
                    </div>
                </div>
                <div class="modal-actions">
                    <ActionButton variant="danger" icon="mdi:cancel" class="action-btn" type="button"
                        @click="emit('close')">
                        Annuler
                    </ActionButton>
                    <ActionButton icon="mdi:check-circle" class="action-btn" type="submit"
                        :disabled="!meta.valid || isSubmitting">
                        Confirmer
                    </ActionButton>
                </div>
                <ModalConfirmation :message="`Voulez-vous vraiment ${getStatus(statusSelected)}?`"
                    :show="!!statusSelected" :confirmation-text="`${student?.matricule}`" variant="text-confirmation"
                    title="Confirmation de changement de statut" @confirm="confirmStatusChange" :loading="loading"
                    @close="statusSelected = ''" />
            </Form>


        </div>
    </div>
</template>

<script setup lang="ts">
import ModalConfirmation from '@/components/modal/ModalConfirmation.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import InputSelect from '@/components/ui/InputSelect.vue';
import type StudentInterface from '@/interfaces/student.intefaces';
import { toTypedSchema } from '@vee-validate/zod';
import { values } from 'lodash';
import { Form, Field } from 'vee-validate';
import { computed, ref } from 'vue';
import * as z from 'zod';


const validationZod = z.object({
    status: z.string().min(1, 'Veuillez sélectionner un statut')
})

const getStatus = (status: string) => {
    if (status === 'repeated') return `Redoubler en ${levelComptetedOptions.value}`
    if (status === 'dropped') return 'Remise à la famille'
    if (status === 'completed') return `Faire passer en ${levelComptetedOptions.value}`
    return ''
}

const validationSchema = toTypedSchema(validationZod)

const props = defineProps<{
    student: StudentInterface | null
    loading?: boolean
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submit', status: string): void
}>()

const levelComptetedOptions = computed(() => {
    if (props.student?.level === 'L1') return 'L2'
    if (props.student?.level === 'L2') return 'L3'
    if (props.student?.level === 'L3') return 'Master 1'
    if (props.student?.level === 'Master 1') return 'Master 2'
    return 'N/A'
})

const statusOptions = computed(() => [
    { label: `Redoubler en ${props.student?.level || 'N/A'}`, value: 'repeated' },
    { label: 'Remise à la famille', value: 'dropped' },
    { label: `Faire passer en ${levelComptetedOptions.value}`, value: 'completed' },
])

const statusSelected = ref<string>('')

const handleSubmit = (values: any) => {
    statusSelected.value = values.status
}

const confirmStatusChange = () => {
    emit('submit', statusSelected.value);
}
</script>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-container {
    background: linear-gradient(135deg, var(--white) 0%, var(--gray-extra-light) 100%);
    border-radius: var(--radius-xl);
    padding: 2.5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: var(--shadow-dark);
    border: 1px solid var(--border-light);
    position: relative;
    overflow: hidden;
}

.modal-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
}

.modal-header {
    text-align: center;
    margin-bottom: 2rem;
}

.modal-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.02em;
}

.modal-subtitle {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin: 0;
    font-weight: 400;
}

.status-form {
    margin: 2rem 0;
}

.radio-group {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border: 1px solid var(--border-secondary);
    box-shadow: var(--shadow-sm);
}

.radio-legend {
    font-weight: 500;
    color: var(--text-dark);
    margin-bottom: 1rem;
    font-size: 1rem;
    display: block;
}

.radio-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.radio-label {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid transparent;
    position: relative;
}

.radio-label:hover {
    background: var(--primary-extra-light);
    border-color: var(--primary-color-light);
    transform: translateY(-1px);
    box-shadow: var(--shadow-light);
}

.radio-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.radio-input:checked+.radio-custom {
    border-color: var(--primary-color);
    background: var(--primary-color);
}

.radio-input:checked+.radio-custom::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: var(--rounded);
    background: var(--white);
}

.radio-input:checked~.radio-text {
    color: var(--primary-color);
    font-weight: 500;
}

.radio-custom {
    width: 20px;
    height: 20px;
    border: 2px solid var(--tertiary-light);
    border-radius: var(--rounded);
    display: inline-block;
    position: relative;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.radio-text {
    color: var(--text-dark);
    font-size: 0.95rem;
    transition: color 0.3s ease;
    line-height: 1.4;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-light);
}

.action-btn {
    min-width: 120px;
}

/* Animation d'entrée */
.modal-container {
    animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Responsive */
@media (max-width: 640px) {
    .modal-container {
        padding: 2rem 1.5rem;
        margin: 1rem;
    }

    .modal-actions {
        flex-direction: column;
    }

    .action-btn {
        min-width: auto;
        width: 100%;
    }
}
</style>