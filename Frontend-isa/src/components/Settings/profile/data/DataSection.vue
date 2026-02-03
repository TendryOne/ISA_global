<template>
    <div class="data-section">
        <div class="section-header">
            <h2>
                <Icon icon="mdi:database" /> Mes données
            </h2>
        </div>

        <div class="section-content">


            <!-- Suppression de compte -->
            <div class="data-group danger-zone">
                <div class="group-header">
                    <Icon icon="mdi:alert-octagon" />
                    <h3>Zone de danger</h3>
                </div>
                <div class="data-card danger">
                    <div class="danger-header">
                        <Icon icon="mdi:account-remove" />
                        <div>
                            <h4>Suppression du compte</h4>
                            <p>Cette action est irréversible et entraînera la perte de toutes vos données.</p>
                        </div>
                    </div>

                    <div class="danger-notice">
                        <Icon icon="mdi:information" />
                        <div class="notice-content">
                            <h5>Procédure de suppression</h5>
                            <p>
                                Pour des raisons de sécurité et de conformité administrative, la suppression de votre
                                compte
                                doit être effectuée par le service de scolarité. Cette mesure permet de garantir la
                                bonne
                                gestion de votre dossier académique.
                            </p>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <Icon icon="mdi:office-building" />
                                    <span><strong>Service de scolarité</strong></span>
                                </div>
                                <div class="contact-item">
                                    <Icon icon="mdi:email" />
                                    <span>{{ UnivesityInformation.emailScolarite }}</span>
                                </div>
                                <div class="contact-item">
                                    <Icon icon="mdi:phone" />
                                    <span>{{ UnivesityInformation.phoneNumber }}</span>
                                </div>
                                <div class="contact-item">
                                    <Icon icon="mdi:map-marker" />
                                    <span>Bureau de la scolarité, Bâtiment administratif</span>
                                </div>
                            </div>
                            <p class="important-note">
                                <Icon icon="mdi:alert" />
                                Veuillez vous munir de votre carte d'étudiant et d'une pièce d'identité lors de votre
                                demande.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import { useMyUserStore } from '@/stores/userStore';
import { UnivesityInformation } from '@/data/universityInformation';

const userStore = useMyUserStore();
const isExporting = ref(false);

const exportData = async () => {
    isExporting.value = true;

    try {
        // Simulate export
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Create a JSON blob with user data
        const userData = {
            exportDate: new Date().toISOString(),
            profile: {
                name: userStore.currentUser?.name,
                firstName: userStore.currentUser?.firstName,
                email: userStore.currentUser?.email,
                matricule: userStore.currentUser?.matricule,
                phone: userStore.currentUser?.phone,
                address: userStore.currentUser?.address,
            }
        };

        const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
    } finally {
        isExporting.value = false;
    }
};

const viewLoginHistory = () => {
    // TODO: Implement login history modal
    console.log('View login history');
};
</script>

<style scoped>
.data-section {
    background: white;
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.05), rgba(var(--secondary-rgb), 0.05));
}

.section-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--primary-dark);
}

.section-content {
    padding: 1.5rem;
}

.data-group {
    margin-bottom: 1.5rem;
}

.data-group:last-child {
    margin-bottom: 0;
}

.group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.group-header svg {
    color: var(--primary-color);
    font-size: 1.25rem;
}

.danger-zone .group-header svg {
    color: var(--error);
}

.group-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-darker);
    margin: 0;
}

.data-card {
    background: var(--tertiary-extra-light);
    border-radius: var(--radius-lg);
    padding: 1rem;
}

.data-card.danger {
    background: rgba(235, 77, 75, 0.05);
    border: 1px solid rgba(235, 77, 75, 0.2);
}

.data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: white;
    border-radius: var(--radius);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.item-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.item-icon {
    font-size: 1.5rem;
    color: var(--primary-color);
}

.item-text h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--gray-darker);
}

.item-text p {
    margin: 0;
    font-size: 0.8rem;
    color: var(--gray-dark);
}

/* Danger zone styles */
.danger-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: var(--radius);
    margin-bottom: 1rem;
}

.danger-header>svg {
    font-size: 2rem;
    color: var(--error);
    flex-shrink: 0;
}

.danger-header h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--error);
}

.danger-header p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--gray-dark);
}

.danger-notice {
    display: flex;
    gap: 1rem;
    padding: 1.25rem;
    background: white;
    border-radius: var(--radius);
    border-left: 4px solid var(--primary-color);
}

.danger-notice>svg {
    font-size: 1.5rem;
    color: var(--primary-color);
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.notice-content h5 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--gray-darker);
}

.notice-content>p {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    color: var(--gray-dark);
    line-height: 1.6;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--tertiary-extra-light);
    border-radius: var(--radius);
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--gray-darker);
}

.contact-item svg {
    color: var(--primary-color);
    font-size: 1.125rem;
    flex-shrink: 0;
}

.important-note {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--warning-extra-light);
    border-radius: var(--radius);
    font-size: 0.8rem;
    color: var(--warning-dark);
    margin: 0;
}

.important-note svg {
    flex-shrink: 0;
    font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
    .data-item {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
    }

    .danger-header {
        flex-direction: column;
    }

    .danger-notice {
        flex-direction: column;
    }

    .contact-info {
        grid-template-columns: 1fr;
    }
}
</style>
