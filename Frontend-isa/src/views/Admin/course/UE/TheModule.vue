<template>
  <div class="modules-container">
    <div class="breadcrumb-nav">
      <span class="back-link" @click="router.back()">
        <Icon icon="mdi:arrow-left" width="20" />
        Retour aux choix de UE de la {{ route.params.semester }}
      </span>
    </div>
    <div class="modules-header">
      <h1 class="modules-title">
        Gestion des Modules pour {{ route.params.UE }}
        <span v-if="teachingUnit" class="credits-badge" :class="creditClass">
          Crédit dispo: {{ creditsUsed }} / {{ teachingUnit.credits }}
          <span class="remaining">(reste {{ remainingCredits }})</span>
        </span>
      </h1>

      <ActionButton icon="mdi:plus-box" @click="openModal = true" :disabled="remainingCredits <= 0">
        Ajouter un module
      </ActionButton>

    </div>

    <!-- Tableau des modules -->
    <div class="modules-table-container" v-if="modules.length > 0 && !loading && !errorServer">
      <table class="modules-table">
        <thead>
          <tr>
            <th class="text-left">Code</th>
            <th class="text-left">Titre</th>
            <th class="text-left">Enseignant</th>
            <th class="text-center">Type</th>
            <th class="text-center">Crédits</th>
            <th class="text-center">Heures</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="module in modules" :key="module._id">
            <td class="font-mono">{{ module.code }}</td>
            <td>{{ module.title }}</td>
            <td>{{ module.teacher && typeof module.teacher !== 'string' ? `Pr. ${module.teacher.firstName} ${module.teacher.name}` : 'Aucun enseignant' }}
            </td>
            <td style="text-align: center;">
              <span class="module-type-badge" :class="getTypeClass(module.type)">
                {{ module.type }}
              </span>
            </td>
            <td style="text-align: center;">{{ module.credits }}</td>
            <td style="text-align: center;">{{ module.hours }}h</td>
            <td class="actions-cell">
              <button class="action-click view-button" @click="viewModule(module)">
                <Icon icon="ei:eye" />
              </button>
              <button class="action-click edit-button" @click="editModule(module._id)">
                <Icon icon="flowbite:edit-outline" />
              </button>
              <button class="action-click delete-button" @click="openDeleteModal(module)">
                <Icon icon="iconoir:trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- État vide -->
    <div class="empty-state" v-else-if="modules.length === 0 && !loading && !errorServer">
      <div class="empty-state-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h3>Aucun module disponible</h3>
        <p>Commencez par créer votre premier module</p>
        <ActionButton icon="mdi:plus-box-outline" @click="openModal = true">
          Ajouter un module
        </ActionButton>
      </div>
    </div>
    <div v-else-if="!loading && errorServer">
      <ErrorComponent :message="errorServer" @retry="fetchModule" />
    </div>
    <div v-else-if="loading && !errorServer"
      style="display: flex; align-items: center; justify-content: center; min-height: 50vh;">
      <SpinningLoader />
    </div>

    <SuccessToast v-if="toast" @dismissed="toast = false" :message="toastMessage" :type="toastType"
      :title="toastTitle" />


  </div>
  <ModuleForm v-if="openModal || moduleInModal" :teaching-unit="teachingUnit" :module="moduleInModal"
    :teachers="teachers" @close="openModal = false, moduleInModal = null" @submit="handleSubmit"
    @remove-existing-file="removeExistingFiles" :loading="loadingChange" :remainingCredits="remainingCredits" />

  <ConfirmModal v-if="deletedModule" @close="deletedModule = null" @confirm="confirmDelete(deletedModule!._id)"
    title="Confirmer la suppression" :message="`Êtes-vous sûr de vouloir supprimer le module ${deletedModule!.code}  ?`"
    :show="!!deletedModule" @cancel="deletedModule = null" :loading="loadingDelete" />

  <ViewModuleModal v-if="ViewModuleInToModal" :module="ViewModuleInToModal" @close="ViewModuleInToModal = null" />

</template>

<script setup lang="ts">
import ConfirmModal from '@/components/admin/Admission/confirmModal.vue'
import ModuleForm from '@/components/admin/course/ModuleForm.vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'
import SpinningLoader from '@/components/loader/SpinningLoader.vue'
import SuccessToast from '@/components/toast/successToast.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import type ModuleInterface from '@/interfaces/module.interface'
import type ProfessorInterface from '@/interfaces/professor.interface'
import type TeachingUnitInterface from '@/interfaces/teachingUnit.interface'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ViewModuleModal from '@/components/admin/course/ViewModuleModal.vue'
// import ModuleDialog from '@/components/ModuleDialog.vue'
// import ConfirmationDialog from '@/components/ConfirmationDialog.vue'

// Données simulées - à remplacer par votre appel API
const router = useRouter();
const loadingChange = ref<boolean>(false)
const deletedModule = ref<ModuleInterface | null>(null);
const moduleInModal = ref<ModuleInterface | null>(null)
const route = useRoute()
const errorServer = ref<string>("")
const loading = ref<boolean>(true)
const teachers = ref<ProfessorInterface[]>([])
const modules = ref<ModuleInterface[]>([])
const teachingUnit = ref<TeachingUnitInterface | null>(null);
const ViewModuleInToModal = ref<ModuleInterface | null>(null);
const openModal = ref<boolean>(false)

const getTypeClass = (type: string) => {
  switch (type) {
    case 'Cours Magistral': return 'type-cm'
    case 'Travaux Dirigés': return 'type-td'
    case 'TP': return 'type-tp'
    default: return ''
  }
}

const creditsUsed = computed(() => modules.value.reduce((acc, module) => acc + module.credits, 0))

const remainingCredits = computed(() => {
  const total = teachingUnit.value?.credits ?? 0
  return total - creditsUsed.value
})

const creditClass = computed(() => {
  const remain = remainingCredits.value
  if (remain < 0) return 'credits-over'
  if (remain <= 2) return 'credits-warn'
  return 'credits-ok'
})

const fetchModule = async () => {
  loading.value = true
  errorServer.value = ''
  try {
    const response = (await axios.get(`/api/v1/modules/admin/UE/${route.params.UE}/${route.params.filiere}`)).data
    teachers.value = response.professors
    modules.value = response.modules
    teachingUnit.value = response.teachingUnit

  } catch (err) {
    loading.value = false
    if (axios.isAxiosError(err)) {
      errorServer.value = err.response?.data as string || 'Une erreur est survenue.'
    } else {
      errorServer.value = 'Une erreur est survenue.'
    }

  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchModule()
})


const removeExistingFiles = async (url: string, module: ModuleInterface) => {
  try {
    const response = await axios.delete(`/api/v1/modules/admin/file/${module._id}`, {
      data: { path: url }
    });

    const updatedModule = response.data;

    // Mets à jour dans la liste locale
    const index = modules.value.findIndex(m => m._id === module._id);
    if (index !== -1) {
      modules.value[index] = updatedModule;
    }

    // Mets aussi à jour la modale si elle est ouverte sur ce module
    if (moduleInModal.value && moduleInModal.value._id === updatedModule._id) {
      moduleInModal.value = updatedModule;
    }

  } catch (error) {
    console.log(error);
  }
};
const toastMessage = ref<string>('')
const toastType = ref<'success' | 'error'>('success')
const toastTitle = ref<string>('')
const toast = ref<boolean>(false)


type ModuleFormValues = {
  code: string
  title: string
  type: string
  hours: number
  credits: number
  coefficient: number
  description: string
  teacher?: string
  files: File[]
}

const handleSubmit = async (values: ModuleFormValues) => {
  // Garde-fou: ne pas dépasser les crédits de l'UE
  const totalAllowed = teachingUnit.value?.credits ?? 0
  const currentUsed = creditsUsed.value
  const newCredits = Number(values.credits || 0)
  let prospectiveTotal = currentUsed + newCredits

  if (moduleInModal.value) {
    const oldCredits = Number(moduleInModal.value.credits || 0)
    prospectiveTotal = currentUsed - oldCredits + newCredits
  }

  if (prospectiveTotal > totalAllowed) {
    const remaining = moduleInModal.value
      ? totalAllowed - (currentUsed - Number(moduleInModal.value.credits || 0))
      : totalAllowed - currentUsed
    toastMessage.value = `Impossible d'enregistrer: total des crédits (${prospectiveTotal}) > limite UE (${totalAllowed}). Restant: ${Math.max(remaining, 0)}.`
    toastType.value = 'error'
    toastTitle.value = 'Crédits dépassés'
    toast.value = true
    return
  }

  loadingChange.value = true
  try {
    const formdata = new FormData();
    const { code, title, type, hours, credits, coefficient, description, teacher } = values;

    formdata.append('code', code || '');
    formdata.append('title', title || '');
    formdata.append('type', type || '');
    formdata.append('hours', String(hours || 0));
    formdata.append('credits', String(credits || 0));
    formdata.append('coefficient', String(coefficient || 0));
    formdata.append('description', description || '');
    if (teacher) formdata.append('teacher', teacher);

    if (values.files?.length) {
      values.files.forEach((file: File) => {
        formdata.append('files', file);
      });
    }

    let response: import('axios').AxiosResponse<ModuleInterface>;

    if (moduleInModal.value) {

      // Update
      response = await axios.patch(`/api/v1/modules/${moduleInModal.value._id}`, formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Remplace dans la liste locale
      modules.value = modules.value.map(m => m._id === response.data._id ? response.data : m)
      console.log(response.data);


      toastMessage.value = 'Module mis à jour avec succès';
      toastType.value = 'success';
      toastTitle.value = 'Succès';
      toast.value = true;
      moduleInModal.value = null;
    } else {
      // Create
      response = await axios.post(`/api/v1/modules/admin/UE/${teachingUnit.value?._id}`, formdata, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Ajoute dans la liste locale
      modules.value.push(response.data);

      toastMessage.value = 'Module créé avec succès';
      toastType.value = 'success';
      toastTitle.value = 'Succès';
      toast.value = true;
      openModal.value = false;
    }


  } catch (err) {
    console.log(err);
    if (axios.isAxiosError(err)) {
      toastMessage.value = (err.response?.data)
        || 'Échec lors de la création/mise à jour du module';
    } else {
      toastMessage.value = 'Échec lors de la création/mise à jour du module';
    }
    toastType.value = 'error';
    toastTitle.value = 'Échec';
    toast.value = true;
    loadingChange.value = false
  } finally {
    loadingChange.value = false
  }

};


// Stubs pour les actions (à remplacer par la logique réelle si nécessaire)
const viewModule = (module: ModuleInterface) => {
  ViewModuleInToModal.value = module;
}
const editModule = (id: string) => {
  moduleInModal.value = modules.value.find(m => m._id === id) || null
}

const openDeleteModal = (module: ModuleInterface) => {
  deletedModule.value = module;
}
const loadingDelete = ref<boolean>(false);

const confirmDelete = async (id: string) => {
  loadingDelete.value = true;
  try {
    await axios.delete(`/api/v1/modules/${id}`);
    modules.value = modules.value.filter(m => m._id !== id);
    toastMessage.value = 'Module supprimé avec succès';
    toastType.value = 'success';
    toastTitle.value = 'Succès';
    toast.value = true;
    deletedModule.value = null;

  } catch (error) {
    toastMessage.value = axios.isAxiosError(error) && error.response ? error.response.data : 'Échec lors de la suppression du module';
    toastType.value = 'error';
    toastTitle.value = 'Échec';
    toast.value = true;
    loadingDelete.value = false;
  } finally {
    loadingDelete.value = false;
  }
}

</script>

<style scoped>
.modules-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.modules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.modules-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.credits-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.credits-badge .remaining {
  font-weight: 500;
  opacity: 0.9;
}

.credits-ok {
  background: #ecfdf5;
  color: #065f46;
}

.credits-warn {
  background: #fffbeb;
  color: #92400e;
}

.credits-over {
  background: #fee2e2;
  color: #991b1b;
}

.add-module-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #5e72e4;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-module-button:hover {
  background-color: #4a5acf;
  transform: translateY(-1px);
}

.add-module-button svg {
  width: 16px;
  height: 16px;
}

.modules-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.modules-table {
  width: 100%;
  border-collapse: collapse;
}

.modules-table th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem 1.5rem;
  text-align: left;
}

.modules-table th.text-center {
  text-align: center;
}

.modules-table td {
  padding: 1rem 1.5rem;
  color: #334155;
  border-top: 1px solid #f1f5f9;
}

.modules-table tr:hover td {
  background-color: #f8fafc;
}

.font-mono {
  font-family: 'Fira Code', monospace;
  color: #5e72e4;
  font-weight: 500;
}

.module-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-cm {
  background-color: var(--primary-extra-light);
  color: var(--primary-color);
}

.type-td {
  background-color: var(--secondary-extra-light);
  color: var(--secondary-color);
}

.type-tp {
  background-color: var(--tertiary-extra-light);
  color: var(--tertiary-color);
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-click {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-click svg {
  width: 16px;
  height: 16px;
}

.view-button {
  color: #64748b;
}

.view-button:hover {
  background: rgba(100, 116, 139, 0.1);
}

.edit-button {
  color: #5e72e4;
}

.edit-button:hover {
  background: rgba(94, 114, 228, 0.1);
}

.delete-button {
  color: #ef4444;
}

.delete-button:hover {
  background: rgba(239, 68, 68, 0.1);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #2d3748;
  margin: 1rem 0 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.breadcrumb-nav {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: var(--primary-dark);
}

.back-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

@media (max-width: 768px) {
  .modules-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modules-table th,
  .modules-table td {
    padding: 0.75rem;
  }

  .empty-state {
    min-height: 300px;
  }
}
</style>
