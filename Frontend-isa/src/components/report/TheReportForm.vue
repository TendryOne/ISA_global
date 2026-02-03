<template>
    <div class="new-ticket-form">
        <div class="form-header">
            <h2>Nouveau Ticket</h2>
            <button class="close-btn" @click="$emit('close')">
                <Icon icon="solar:close-circle-bold-duotone" />
            </button>
        </div>

        <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors }">
            <div class="form-body">
                <!-- Title -->
                <div class="form-group">
                    <label for="title">Titre du problème *</label>
                    <Field id="title" name="title" type="text" placeholder="Décrivez brièvement le problème"
                        class="form-input" :class="{ error: errors.title }" />
                    <ErrorMessage name="title" class="error-message" />
                </div>

                <!-- Problem Type -->
                <div class="form-group">
                    <label for="problemType">Type de problème *</label>
                    <Field id="problemType" name="problemType" as="select" class="form-select"
                        :class="{ error: errors.problemType }">
                        <option value="">Sélectionnez un type</option>
                        <option value="connexion">Problème de connexion</option>
                        <option value="documents">Documents manquants</option>
                        <option value="notes">Erreur dans les notes</option>
                        <option value="inscription">Problème d'inscription</option>
                        <option value="paiement">Question sur les paiements</option>
                        <option value="autre">Autre problème</option>
                    </Field>
                    <ErrorMessage name="problemType" class="error-message" />
                </div>

                <!-- Priority -->
                <div class="form-group">
                    <label>Priorité *</label>
                    <div class="priority-options">
                        <label v-for="priority in priorityOptions" :key="priority.value"
                            :class="['priority-option', priority.value]">
                            <Field type="radio" name="priority" :value="priority.value" class="priority-radio" />
                            <div class="priority-content">
                                <Icon :icon="priority.icon" />
                                <span>{{ priority.label }}</span>
                            </div>
                        </label>
                    </div>
                    <ErrorMessage name="priority" class="error-message" />
                </div>

                <!-- Description -->
                <div class="form-group">
                    <label for="description">Description détaillée *</label>
                    <Field id="description" name="description" as="textarea" rows="6"
                        placeholder="Décrivez votre problème en détail..." class="form-textarea"
                        :class="{ error: errors.description }" />
                    <div class="textarea-footer">
                        <ErrorMessage name="description" class="error-message" />
                        <span class="char-counter">{{ descriptionLength }}/1000</span>
                    </div>
                </div>

                <!-- Attachments -->
                <div class="form-group">
                    <label>Pièces jointes</label>
                    <div class="attachments-section">
                        <div class="attachment-upload">
                            <input type="file" id="attachments" multiple @change="handleFileUpload" ref="fileInput"
                                style="display: none" />
                            <label for="attachments" class="upload-btn">
                                <Icon icon="solar:paperclip-bold-duotone" />
                                <span>Ajouter des fichiers</span>
                            </label>
                            <span class="upload-hint">(Max 5 fichiers, 10MB chacun)</span>
                        </div>

                        <div v-if="attachments.length > 0" class="attachments-list">
                            <div v-for="(file, index) in attachments" :key="index" class="attachment-item">
                                <Icon icon="solar:document-text-bold-duotone" />
                                <span class="file-name">{{ file.name }}</span>
                                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                <button class="remove-file-btn" @click="removeAttachment(index)">
                                    <Icon icon="solar:close-circle-bold-duotone" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-footer">
                <button type="button" class="btn btn-secondary" @click="$emit('close')">
                    Annuler
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    <Icon v-if="isSubmitting" icon="eos-icons:loading" class="spin" />
                    <span v-else>Créer le ticket</span>
                </button>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { Icon } from '@iconify/vue';
import * as yup from 'yup';
import { useToast } from '@/composables/useToast';

const emit = defineEmits(['close', 'created']);

const { showToast } = useToast();
const isSubmitting = ref(false);
const attachments = ref<File[]>([]);
const descriptionLength = ref(0);
const fileInput = ref<HTMLInputElement | null>(null);

const priorityOptions = [
    { value: 'low', label: 'Basse', icon: 'solar:info-circle-bold-duotone' },
    { value: 'medium', label: 'Moyenne', icon: 'solar:exclamation-circle-bold-duotone' },
    { value: 'high', label: 'Haute', icon: 'solar:danger-triangle-bold-duotone' }
];

const schema = yup.object({
    title: yup.string().required('Le titre est obligatoire').max(100, 'Maximum 100 caractères'),
    problemType: yup.string().required('Veuillez sélectionner un type'),
    priority: yup.string().required('Veuillez sélectionner une priorité'),
    description: yup.string()
        .required('La description est obligatoire')
        .min(10, 'Minimum 10 caractères')
        .max(1000, 'Maximum 1000 caractères')
});

const handleSubmit = async (values: any) => {
    isSubmitting.value = true;

    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newTicket = {
            _id: Date.now().toString(),
            ...values,
            status: 'open',
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        emit('created', newTicket);
        showToast('Ticket créé avec succès', 'success');
    } catch (error) {
        showToast('Erreur lors de la création du ticket', 'error');
    } finally {
        isSubmitting.value = false;
    }
};

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    const totalFiles = attachments.value.length + newFiles.length;

    if (totalFiles > 5) {
        showToast('Maximum 5 fichiers autorisés', 'warning');
        return;
    }

    for (const file of newFiles) {
        if (file.size > 10 * 1024 * 1024) {
            showToast(`Le fichier ${file.name} dépasse 10MB`, 'warning');
            continue;
        }
        attachments.value.push(file);
    }

    // Reset file input
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

const removeAttachment = (index: number) => {
    attachments.value.splice(index, 1);
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.new-ticket-form {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--gray-lighter);
}

.form-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--primary-dark);
}

.close-btn {
    background: none;
    border: none;
    color: var(--tertiary-light);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s ease;
}

.close-btn:hover {
    color: var(--danger-color);
}

.form-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--tertiary-dark);
}

.form-input,
.form-select,
.form-textarea {
    padding: 0.75rem 1rem;
    border: 1px solid var(--gray-lighter);
    border-radius: 8px;
    font-size: 0.9rem;
    font-family: inherit;
    transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
    border-color: var(--danger-color);
}

.form-textarea {
    resize: vertical;
    min-height: 120px;
}

.textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.char-counter {
    font-size: 0.8rem;
    color: var(--tertiary-light);
}

.priority-options {
    display: flex;
    gap: 0.5rem;
}

.priority-option {
    flex: 1;
    border: 1px solid var(--gray-lighter);
    border-radius: 8px;
    padding: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.priority-option:hover {
    border-color: var(--primary-color);
}

.priority-option.low:hover {
    border-color: var(--info-color);
}

.priority-option.medium:hover {
    border-color: var(--warning-color);
}

.priority-option.high:hover {
    border-color: var(--danger-color);
}

.priority-radio {
    display: none;
}

.priority-radio:checked+.priority-content {
    opacity: 1;
}

.priority-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.priority-option.low .priority-content {
    color: var(--info-color);
}

.priority-option.medium .priority-content {
    color: var(--warning-color);
}

.priority-option.high .priority-content {
    color: var(--danger-color);
}

.priority-radio:checked+.priority-content {
    opacity: 1;
    font-weight: 500;
}

.attachments-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.attachment-upload {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.upload-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--tertiary-extra-light);
    border: 2px dashed var(--gray-lighter);
    border-radius: 8px;
    color: var(--primary-color);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.upload-btn:hover {
    background: rgba(var(--primary-color-rgb), 0.1);
    border-color: var(--primary-color);
}

.upload-hint {
    font-size: 0.8rem;
    color: var(--tertiary-light);
}

.attachments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--tertiary-extra-light);
    border-radius: 8px;
    font-size: 0.9rem;
}

.attachment-item svg {
    color: var(--primary-color);
    font-size: 1.2rem;
}

.file-name {
    flex: 1;
    color: var(--tertiary-dark);
}

.file-size {
    font-size: 0.8rem;
    color: var(--tertiary-light);
}

.remove-file-btn {
    background: none;
    border: none;
    color: var(--tertiary-light);
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.2s ease;
}

.remove-file-btn:hover {
    color: var(--danger-color);
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--gray-lighter);
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-secondary {
    background: var(--tertiary-extra-light);
    color: var(--tertiary-dark);
}

.btn-secondary:hover {
    background: var(--gray-lighter);
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error-message {
    font-size: 0.8rem;
    color: var(--danger-color);
    margin-top: 0.25rem;
}

.spin {
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

@media (max-width: 768px) {
    .new-ticket-form {
        padding: 1.5rem;
    }

    .priority-options {
        flex-direction: column;
    }

    .form-footer {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        justify-content: center;
    }
}
</style>