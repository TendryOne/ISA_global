<template>
  <div class="elite-modal-overlay" @click.self="closeModal">
    <div class="elite-modal-container">
      <!-- Header avec effet verre -->
      <div class="modal-header-glass">
        <div class="header-content">
          <div class="title-wrapper">
            <h2 class="modal-title">{{ module.title }}</h2>
            <div class="module-badges">
              <div class="badge luxury-badge" :class="module.type.replace(' ', '-').toLowerCase()">
                <Icon :icon="getTypeIcon(module.type)" width="16" height="16" />
                {{ getTypeLabel(module.type) }}
              </div>
              <div class="badge code-badge">
                <Icon icon="mdi:identifier" width="14" height="14" />
                {{ module.code }}
              </div>
            </div>
          </div>
        </div>
        <button class="close-button-luxury" @click="closeModal">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="modal-content-luxury">
        <!-- Carte d'identité du module -->
        <div class="luxury-card">
          <div class="card-border-glow"></div>
          <div class="card-content">
            <h3 class="card-title">
              <Icon icon="mdi:certificate-outline" width="24" height="24" />
              Identité du Module
            </h3>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon">
                  <Icon icon="mdi:weight" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ module.credits }}</div>
                  <div class="stat-label">Crédits</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <Icon icon="mdi:percent" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ module.coefficient }}</div>
                  <div class="stat-label">Coefficient</div>
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-icon">
                  <Icon icon="mdi:clock-outline" width="20" height="20" />
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ module.hours }}</div>
                  <div class="stat-label">Heures</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Enseignant avec état vide géré élégamment -->
        <div class="section-luxury" :class="{ 'no-teacher': !hasTeacher }">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:account-tie" width="22" height="22" />
            Enseignant Assigné
          </h3>

          <div v-if="hasTeacher" class="teacher-card-luxury">
            <div class="teacher-avatar-luxury">
              <Icon icon="mdi:account-circle" width="44" height="44" />
            </div>
            <div class="teacher-info-luxury">
              <div class="teacher-name">Pr. {{ (module.teacher as ProfessorInterface).firstName }} {{ (module.teacher as ProfessorInterface).name }}</div>
              <div class="teacher-id">ID: {{ (module.teacher as ProfessorInterface).matricule }}</div>
            </div>
            <button class="teacher-contact-btn">
              <Icon icon="mdi:email-outline" width="18" height="18" />
              Contacter
            </button>
          </div>

          <div v-else class="no-teacher-placeholder">
            <div class="placeholder-icon">
              <Icon icon="mdi:account-question" width="32" height="32" />
            </div>
            <div class="placeholder-content">
              <h4>Aucun enseignant assigné</h4>
              <p>Ce module n'a pas encore d'enseignant attitré.</p>
            </div>

          </div>
        </div>

        <!-- Description -->
        <div class="section-luxury">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:text-box-outline" width="22" height="22" />
            Description
          </h3>
          <div class="description-luxury">
            <p>{{ module.description }}</p>
          </div>
        </div>

        <!-- Fichiers -->
        <div class="section-luxury" v-if="module.files && module.files.length > 0">
          <h3 class="section-title-luxury">
            <Icon icon="mdi:paperclip" width="22" height="22" />
            Ressources ({{ module.files.length }})
          </h3>

          <div class="files-list-luxury">
            <div v-for="(file, index) in module.files" :key="index" class="file-item-luxury">
              <div class="file-icon">
                <Icon icon="mdi:file-document-outline" width="20" height="20" />
              </div>
              <div class="file-info">
                <div class="file-name">{{ transformFiles(file).name }}</div>
              </div>
              <button class="file-download-btn-luxury" @click="downloadByPathAxios(transformFiles(file).path)">
                <Icon icon="mdi:download" width="18" height="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions-luxury">
        <ActionButton icon="mdi:close" @click="closeModal" variant="danger">
          Fermer
        </ActionButton>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {  computed } from 'vue'
import type ModuleInterface from '@/interfaces/module.interface'
import { Icon } from '@iconify/vue';
import { downloadByPathAxios } from '@/utils/Download';
import ActionButton from '@/components/ui/ActionButton.vue';
import type ProfessorInterface from '@/interfaces/professor.interface';


const props = defineProps<{
  module: ModuleInterface
}>()



const emit = defineEmits(['close', 'edit'])

const hasTeacher = computed(() => {
  return props.module.teacher && (props.module.teacher as ProfessorInterface)._id && (props.module.teacher as ProfessorInterface)._id !== ''
})

const transformFiles = (file: string) => {
  const fileParts = file.split('/');
  return { name: fileParts[fileParts.length - 1], path: file }
}

const closeModal = () => {
  emit('close')
}

const editModule = () => {
  emit('edit', props.module)
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    'cours Magistral': 'Cours Magistral',
    'TD': 'Travaux Dirigés',
    'TP': 'Travaux Pratiques'
  }
  return typeMap[type] || type
}

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'cours Magistral': 'mdi:lectern',
    'TD': 'mdi:book-education-outline',
    'TP': 'mdi:flask-outline'
  }
  return iconMap[type] || 'mdi:book-open-page-variant'
}
</script>

<style scoped>
/* Variables de couleurs cohérentes avec le style existant */


.elite-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 22, 31, 0.92);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(15px);
  animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.elite-modal-container {
  width: 100%;
  max-width: 840px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header-glass {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--primary-darker), var(--primary-color));
  color: white;
  position: relative;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}



.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ffffff, #e6e9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.module-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.luxury-badge {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.luxury-badge.cours-magistral {
  background: rgba(103, 58, 183, 0.7);
}

.luxury-badge.td {
  background: rgba(0, 150, 136, 0.7);
}

.luxury-badge.tp {
  background: rgba(229, 57, 53, 0.7);
}

.code-badge {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.close-button-luxury {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: 1rem;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.close-button-luxury:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.modal-content-luxury {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.luxury-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.card-border-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(67, 97, 238, 0.1);
  pointer-events: none;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 1.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--primary-lightest);
  border-radius: 12px;
  border: 1px solid var(--primary-lighter);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border-radius: 10px;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-darker);
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--gray);
  font-weight: 500;
}

.section-luxury {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05), 0 5px 10px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-luxury.no-teacher {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.section-title-luxury {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 0 0 1.25rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--gray-light);
}

.teacher-card-luxury {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-lighter);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.teacher-avatar-luxury {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--primary-lightest);
  color: var(--primary-color);
  border-radius: 50%;
  flex-shrink: 0;
}

.teacher-info-luxury {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.teacher-name {
  font-weight: 600;
  color: var(--gray-darker);
  font-size: 1.1rem;
}

.teacher-id {
  font-size: 0.85rem;
  color: var(--gray);
}

.teacher-contact-btn {
  background: var(--primary-lightest);
  color: var(--primary-dark);
  border: 1px solid var(--primary-lighter);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.teacher-contact-btn:hover {
  background: var(--primary-color);
  color: white;
}

.no-teacher-placeholder {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border: 2px dashed var(--gray-light);
  border-radius: 12px;
  text-align: left;
}

.placeholder-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--gray);
  border-radius: 50%;
  flex-shrink: 0;
}

.placeholder-content {
  flex: 1;
}

.placeholder-content h4 {
  margin: 0 0 0.25rem 0;
  color: var(--gray-dark);
  font-weight: 600;
}

.placeholder-content p {
  margin: 0;
  color: var(--gray);
  font-size: 0.9rem;
}

.assign-teacher-btn {
  background: var(--primary-lightest);
  color: var(--primary-dark);
  border: 1px solid var(--primary-lighter);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.assign-teacher-btn:hover {
  background: var(--primary-color);
  color: white;
}

.description-luxury {
  line-height: 1.6;
  color: var(--gray-dark);
  white-space: pre-line;
  font-size: 0.95rem;
}

.files-list-luxury {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item-luxury {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--gray-lighter);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.file-item-luxury:hover {
  border-color: var(--primary-light);
  background: var(--primary-lightest);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--primary-lightest);
  color: var(--primary-color);
  border-radius: 10px;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: var(--gray-darker);
  margin-bottom: 0.25rem;
}

.file-type {
  font-size: 0.8rem;
  color: var(--gray);
}

.file-download-btn-luxury {
  background: var(--primary-lightest);
  color: var(--primary-dark);
  border: 1px solid var(--primary-lighter);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.file-download-btn-luxury:hover {
  background: var(--primary-color);
  color: white;
}

.modal-actions-luxury {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: rgba(248, 250, 252, 0.7);
  backdrop-filter: blur(10px);
}

.action-btn-luxury {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  border: 1px solid;
}

.action-btn-luxury.secondary {
  background: white;
  border-color: var(--gray-light);
  color: var(--gray-dark);
}

.action-btn-luxury.secondary:hover {
  background: var(--gray-lightest);
  border-color: var(--gray);
}

.action-btn-luxury.primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
}

.action-btn-luxury.primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(67, 97, 238, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0);
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    backdrop-filter: blur(15px);
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .elite-modal-container {
    max-width: 95%;
    margin: 1rem;
  }

  .modal-header-glass {
    padding: 1.5rem;
  }

  .modal-content-luxury {
    padding: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .teacher-card-luxury,
  .no-teacher-placeholder {
    flex-direction: column;
    text-align: center;
  }

  .modal-actions-luxury {
    flex-direction: column;
  }

  .action-btn-luxury {
    width: 100%;
    justify-content: center;
  }
}
</style>
