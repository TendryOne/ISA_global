<template>
  <div class="elite-detail-container" v-if="!isLoading && student && !isError">
    <!-- En-tête élégant -->
    <div class="elite-header">
      <div class="header-top-bar">
        <button class="elite-back-btn" @click="goBack">
          <Icon icon="mdi:arrow-left" width="20" />
          <span>Retour</span>
        </button>

        <div class="header-actions-wrapper">
          <div class="elite-status-badge" :class="student.status"
            v-if="student.status === 'rejected' || student.status === 'approved'">
            <Icon :icon="statusIcons[student.status]" width="16" />
            <span>{{ getStatusName(student.status) }}</span>
            <span v-if="student.status === 'rejected'" class="rejection-reason">
              • {{ formatRejectionReason(student.rejectionReason) }}
            </span>
          </div>

          <button class="elite-download-btn" @click="downloadPdf" :disabled="loadingDownload"
            :class="{ loading: loadingDownload }">
            <Icon :icon="!loadingDownload ? 'mdi:download' : 'eos-icons:loading'" width="20"
              :class="{ spinning: loadingDownload }" />
            <span v-if="!isMobile">{{
              loadingDownload ? 'Téléchargement...' : 'Télécharger la fiche'
            }}</span>
          </button>

          <div class="elite-action-buttons" v-if="student.status === 'pending'">
            <button class="elite-btn success" @click="updateStatus('approved')">
              <Icon icon="mdi:check-circle-outline" width="18" />
              <span>Approuver</span>
            </button>
            <button class="elite-btn danger" @click="updateStatus('rejected')">
              <Icon icon="mdi:close-circle-outline" width="18" />
              <span>Rejeter</span>
            </button>
          </div>
        </div>
      </div>

      <div class="elite-profile-header">
        <div class="elite-avatar-container">
          <img :src="`/api/v1/document?fullPath=${student.identityPhoto}`" alt="Photo étudiant"
            @error="handleImageError" class="elite-avatar" />
          <div class="elite-avatar-badge">
            <Icon icon="mdi:camera" width="16" />
          </div>
        </div>

        <div class="elite-profile-title">
          <h1>
            <span class="last-name">{{ student.lastName }}</span>
            <span class="first-name">{{ student.firstName }}</span>
          </h1>
          <div class="elite-profile-meta">
            <div class="meta-item">
              <Icon icon="mdi:identifier" width="16" />
              <span>{{ student.inscriptionId }}</span>
            </div>
            <div class="meta-item">
              <Icon :icon="student.gender === 'male' ? 'mdi:gender-male' : 'mdi:gender-female'" width="16" />
              <span>{{ student.gender === 'male' ? 'Homme' : 'Femme' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation premium -->
    <div class="elite-tab-navigation">
      <div class="elite-tabs">
        <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          <Icon :icon="tabIcons[tab.id]" width="18" />
          <span v-if="!isMobile">{{ tab.label }}</span>
          <div class="elite-tab-indicator"></div>
        </button>
      </div>
      <div class="elite-tab-underline"></div>
    </div>

    <!-- Contenu des onglets -->
    <div class="elite-tab-content">
      <!-- Onglet Informations personnelles -->
      <div v-if="activeTab === 'personal'" class="elite-personal-info">
        <div class="elite-section-card">
          <div class="section-header">
            <div class="section-icon">
              <Icon icon="mdi:account-circle" width="24" />
            </div>
            <h3>Identité</h3>
          </div>

          <div class="elite-info-grid">
            <div class="elite-info-group">
              <h4 class="info-group-title">
                <Icon icon="mdi:account-details" width="18" />
                <span>Informations personnelles</span>
              </h4>
              <div class="elite-info-item">
                <div class="info-label">Date de naissance</div>
                <div class="info-value">{{ formatDate(student.birthDate) }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Lieu de naissance</div>
                <div class="info-value">{{ student.birthPlace }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">CIN/Passeport</div>
                <div class="info-value">{{ student.cin }}</div>
              </div>
            </div>

            <div class="elite-info-group">
              <h4 class="info-group-title">
                <Icon icon="mdi:contact-mail" width="18" />
                <span>Coordonnées</span>
              </h4>
              <div class="elite-info-item">
                <div class="info-label">Adresse</div>
                <div class="info-value">{{ student.address }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Téléphone</div>
                <div class="info-value">{{ student.phone }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Email</div>
                <div class="info-value">{{ student.email }}</div>
              </div>
            </div>

            <div class="elite-info-group">
              <h4 class="info-group-title">
                <Icon icon="mdi:account-alert" width="18" />
                <span>Contact d'urgence</span>
              </h4>
              <div class="elite-info-item">
                <div class="info-label">Nom</div>
                <div class="info-value">{{ student.emergencyContactName }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Relation</div>
                <div class="info-value">{{ student.emergencyContactRelation }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Téléphone</div>
                <div class="info-value">{{ student.emergencyContactPhone }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet Informations académiques -->
      <div v-if="activeTab === 'academic'" class="elite-academic-info">
        <div class="elite-section-card">
          <div class="section-header">
            <div class="section-icon">
              <Icon icon="mdi:school" width="24" />
            </div>
            <h3>Parcours académique</h3>
          </div>

          <div class="elite-info-grid">
            <div class="elite-info-group">
              <h4 class="info-group-title">
                <Icon icon="mdi:certificate" width="18" />
                <span>Diplômes</span>
              </h4>
              <div class="elite-info-item">
                <div class="info-label">Dernier diplôme</div>
                <div class="info-value">{{ getDiplomaName(student.lastDiploma) }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Série BAC</div>
                <div class="info-value">{{ student.bacSeries }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Année BAC</div>
                <div class="info-value">{{ student.bacYear }}</div>
              </div>
            </div>

            <div class="elite-info-group">
              <h4 class="info-group-title">
                <Icon icon="mdi:bookshelf" width="18" />
                <span>Formation</span>
              </h4>
              <div class="elite-info-item">
                <div class="info-label">Établissement précédent</div>
                <div class="info-value">{{ student.previousInstitution }}</div>
              </div>
              <div class="elite-info-item">
                <div class="info-label">Filière choisie</div>
                <div class="info-value">
                  <span class="elite-field-badge" :class="student.field">
                    {{ getFieldName(student.field) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglet Documents -->
      <div v-if="activeTab === 'documents'" class="elite-documents-info">
        <div class="elite-section-card">
          <div class="section-header">
            <div class="section-icon">
              <Icon icon="mdi:file-document-multiple" width="24" />
            </div>
            <h3>Documents fournis</h3>
          </div>

          <div class="elite-documents-grid">
            <DocumentCardElite title="Photo d'identité" :url="`/api/v1/document?fullPath=${student.identityPhoto}`"
              type="image" icon="mdi:account-box" />

            <DocumentCardElite title="CIN ou Passeport" :url="`/api/v1/document?fullPath=${student.idDocument}`"
              :type="student.idDocument.endsWith('.pdf') ? 'pdf' : 'image'" icon="mdi:card-account-details" />

            <DocumentCardElite title="Certificat de résidence"
              :url="`/api/v1/document?fullPath=${student.residenceCertificate}`"
              :type="student.residenceCertificate.endsWith('.pdf') ? 'pdf' : 'image'" icon="mdi:home-city" />

            <DocumentCardElite title="Relevé de notes BAC" :url="`/api/v1/document?fullPath=${student.bacTranscript}`"
              :type="student.bacTranscript?.endsWith('.pdf') ? 'pdf' : 'image'" icon="mdi:file-certificate"
              v-if="student.bacTranscript" />
          </div>
        </div>
      </div>

      <!-- Onglet Paiement -->
      <div v-if="activeTab === 'payment'" class="elite-payment-info">
        <div class="elite-section-card">
          <div class="section-header">
            <div class="section-icon">
              <Icon icon="mdi:credit-card-check" width="24" />
            </div>
            <h3>Informations de paiement</h3>
          </div>

          <div class="elite-payment-content">
            <div class="elite-payment-card">
              <div class="payment-card-header">
                <div class="payment-icon">
                  <Icon icon="mdi:receipt" width="24" />
                </div>
                <h4>Détails de transaction</h4>
              </div>
              <div class="payment-card-body">
                <div class="elite-payment-item">
                  <div class="payment-label">Numéro de transaction</div>
                  <div class="payment-value">{{ student.transactionNumber }}</div>
                </div>
                <div class="elite-payment-item">
                  <div class="payment-label">Montant</div>
                  <div class="payment-value">30.000 Ar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- État de chargement élégant -->
  <div v-else-if="isLoading && !isError" class="elite-loading-screen">
    <div class="loading-animation">
      <div class="loading-spinner"></div>
      <div class="loading-text">Chargement en cours...</div>
    </div>
  </div>
  <div v-else-if="!isLoading && isError">
    <ErrorComponent :message="isError" @retry="fetchStudent" />
  </div>
  <div v-if="userInModal && student">
    <ApprovalModal :type="modalType" :isOpen="true" @close="userInModal = null" @confirm="handleStatusConfirmation"
      :student="student" :isInProgress="isInProgress" confirmButtonText="Confirmer" />
  </div>
  <SuccessToast :message="MessageToast" :type="typeToast" :title="TitleToast" v-if="isOpenToast"
    @dismissed="isOpenToast = false" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import axios from 'axios'
import DocumentCardElite from '@/components/admin/Admission/DocumentCard.vue'
import type { UserPendingInterface } from '@/interfaces/pendingUsers.interface'
import ApprovalModal from '@/components/admin/Admission/ApprovalModal.vue'
import { useMyUserStore } from '@/stores/userStore'
import SuccessToast from '@/components/toast/successToast.vue'
import ErrorComponent from '@/components/error/ErrorComponent.vue'

const MessageToast = ref<string>('')
const typeToast = ref<'error' | 'success'>('error')
const TitleToast = ref<string>('')
const isOpenToast = ref<boolean>(false)

const modalType = ref<'approval' | 'rejection'>('rejection')
const showModal = ref<boolean>(false)
const userInModal = ref<UserPendingInterface | null>(null)
const route = useRoute()
const router = useRouter()
const student = ref<UserPendingInterface | null>(null)
const activeTab = ref('personal')
const isLoading = ref<boolean>(false)
const isError = ref<string>('')
const isInProgress = ref<boolean>(false)
const loadingDownload = ref<boolean>(false)

const downloadPdf = async () => {
  try {
    loadingDownload.value = true
    await axios
      .get(`/api/v1/pendingUsers/registrationForm/${student.value?.inscriptionId}`, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `fiche-inscription-${student.value?.inscriptionId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      })
      .finally(() => {
        loadingDownload.value = false
      })
    isOpenToast.value = true
    typeToast.value = 'success'
    MessageToast.value = "Fiche d'inscription téléchargée avec succès."
    TitleToast.value = 'Téléchargement réussi'
  } catch (error: any) {
    loadingDownload.value = false
    isOpenToast.value = true
    typeToast.value = 'error'
    MessageToast.value = error.response?.data || 'Erreur lors du téléchargement du PDF.'
    TitleToast.value = "Une erreur s'est produite"
  }
}

const tabs = [
  { id: 'personal', label: 'Personnel' },
  { id: 'academic', label: 'Académique' },
  { id: 'documents', label: 'Documents' },
  { id: 'payment', label: 'Paiement' },
]

const statusIcons = {
  pending: 'mdi:clock-outline',
  approved: 'mdi:check-circle-outline',
  rejected: 'mdi:close-circle-outline',
}

const tabIcons: Record<string, string> = {
  personal: 'mdi:account-details',
  academic: 'mdi:school',
  documents: 'mdi:file-document-multiple',
  payment: 'mdi:credit-card-check',
}

const fetchStudent = async () => {
  isLoading.value = true
  isError.value = ''

  try {
    const response = await axios.get(`/api/v1/pendingUsers/user/${route.params.id}`)
    student.value = response.data
  } catch (error: any) {
    isError.value = error.response?.data || 'Erreur inattendue lors du chargement.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchStudent()
})

const goBack = () => {
  router.go(-1)
}

const formatDate = (dateString: Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
  }
  return statusMap[status] || status
}

const formatRejectionReason = (reason: string | null) => {
  if (!reason) return 'Aucun motif spécifié'
  return reason.charAt(0).toUpperCase() + reason.slice(1)
}

const getFieldName = (field: string) => {
  const fieldMap: Record<string, string> = {
    btp: 'BTP',
    informatique: 'Informatique',
    gestion: 'Gestion',
  }
  return fieldMap[field] || field
}

const getDiplomaName = (diploma: string) => {
  const diplomaMap: Record<string, string> = {
    Bepc: 'BEPC',
    bac: 'BAC',
    licence: 'Licence',
  }
  return diplomaMap[diploma] || diploma
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-profile.png'
}

const handleStatusConfirmation = async (rejectionReason?: string) => {
  isInProgress.value = true
  try {
    if (modalType.value === 'rejection') {
      await axios.delete(
        `/api/v1/pendingUsers/${student.value?.inscriptionId}/${student.value?.field}`,
        {
          data: {
            rejectionReason,
          },
        },
      )
    } else {
      await axios.patch(`/api/v1/pendingUsers/${route.params.id}`, {
        status: 'approved',
      })
    }

    student.value!.status = modalType.value === 'approval' ? 'approved' : 'rejected'

    showModal.value = false
    isOpenToast.value = true
    userInModal.value = null
    TitleToast.value = 'Opération Réussie'
    typeToast.value = 'success'
    MessageToast.value = `L'étudiant a été ${student.value?.status === 'approved' ? 'approuvé' : 'rejeté'} avec succès !`
  } catch (error: any) {
    isInProgress.value = false
    userInModal.value = null
    isOpenToast.value = true
    TitleToast.value = "Une erreur s'est produite"
    typeToast.value = 'error'
    MessageToast.value = error.response?.data || 'Une erreur est survenue'
  } finally {
    isInProgress.value = false
  }
}

const updateStatus = (status: 'approved' | 'rejected') => {
  modalType.value = status === 'approved' ? 'approval' : 'rejection'
  userInModal.value = student.value
}

const isMobile = ref<boolean>(false)

const checkMobile = () => {
  if (window.innerWidth < 778) isMobile.value = true
  else isMobile.value = false
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Styles élégants avec votre palette de couleurs */
.elite-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  color: var(--black);
  font-family: 'Roboto', sans-serif;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* En-tête premium */
.elite-header {
  background: linear-gradient(135deg,
      var(--primary-extra-light) 0%,
      rgba(255, 255, 255, 0.95) 100%);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-lighter);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.elite-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
      var(--primary-color),
      var(--primary-light),
      var(--secondary-color));
}

.meta-item.strong {
  font-weight: bold;
}

.header-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.elite-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: var(--white);
  color: var(--primary-dark);
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.elite-back-btn:hover {
  background-color: var(--primary-color);
  color: var(--white);
  transform: translateX(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-color);
}

.elite-back-btn:active {
  transform: translateX(-2px);
}

.header-actions-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.elite-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.elite-download-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.elite-download-btn:hover::before {
  left: 100%;
}

.elite-download-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.elite-download-btn:active {
  transform: translateY(0);
}

.elite-download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.elite-download-btn.loading {
  pointer-events: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

.elite-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: 0.875rem;
  box-shadow: var(--shadow-light);
  transition: all 0.3s ease;
}

.elite-status-badge.pending {
  background-color: var(--warning-light);
  color: var(--warning-dark);
  border-left: 3px solid var(--warning);
}

.elite-status-badge.approved {
  background-color: var(--success-light);
  color: var(--success-dark);
  border-left: 3px solid var(--success);
}

.elite-status-badge.rejected {
  background-color: var(--error-light);
  color: var(--error-dark);
  border-left: 3px solid var(--error);
}

.rejection-reason {
  font-style: italic;
  margin-left: 0.25rem;
  color: inherit;
  opacity: 0.9;
}

.elite-status-badge.rejected .rejection-reason {
  color: var(--error-darker);
}

.elite-action-buttons {
  display: flex;
  gap: 0.75rem;
}

.elite-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-light);
}

.elite-btn.success {
  background-color: var(--success-light);
  color: var(--success-dark);
}

.elite-btn.success:hover {
  background-color: var(--success);
  color: var(--white);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.elite-btn.danger {
  background-color: var(--error-light);
  color: var(--error-dark);
}

.elite-btn.danger:hover {
  background-color: var(--error);
  color: var(--white);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

/* Profil étudiant élégant */
.elite-profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  animation: slideIn 0.6s ease-out 0.2s both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.elite-avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--white);
  box-shadow:
    0 0 0 4px var(--primary-light),
    var(--shadow-md);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.elite-avatar-container:hover {
  transform: scale(1.05);
  box-shadow:
    0 0 0 4px var(--primary-color),
    var(--shadow-lg);
}

.elite-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.elite-avatar-container:hover .elite-avatar {
  transform: scale(1.1);
}

.elite-avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: var(--white);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(20%, 20%);
  box-shadow: var(--shadow-md);
  border: 3px solid var(--white);
}

.elite-profile-title h1 {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-dark);
  line-height: 1.3;
}

.last-name {
  font-weight: 700;
  color: var(--primary-dark);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.first-name {
  font-weight: 500;
  color: var(--black);
}

.elite-profile-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-dark);
  padding: 0.375rem 0.75rem;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.meta-item:hover {
  background-color: var(--white);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Navigation par onglets premium */
.elite-tab-navigation {
  margin-bottom: 2rem;
  position: relative;
  background-color: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-lighter);
  padding: 0.5rem;
}

.elite-tabs {
  display: flex;
  position: relative;
  gap: 0.25rem;
}

.elite-tabs button {
  position: relative;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: var(--gray-dark);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9375rem;
  border-radius: var(--radius-lg);
  flex: 1;
  justify-content: center;
}

.elite-tabs button:hover {
  color: var(--primary-color);
  background-color: var(--primary-extra-light);
}

.elite-tabs button.active {
  color: var(--white);
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  box-shadow: var(--shadow-sm);
}

.elite-tabs button.active .elite-tab-indicator {
  display: none;
}

.elite-tab-underline {
  display: none;
}

/* Contenu des onglets */
.elite-tab-content {
  background-color: var(--white);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-lighter);
  animation: tabContentFadeIn 0.4s ease-in-out;
}

@keyframes tabContentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.elite-section-card {
  margin-bottom: 2.5rem;
}

.elite-section-card:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gray-lighter);
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-extra-light);
  color: var(--primary-color);
}

.section-header h3 {
  margin: 0;
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--primary-dark);
}

/* Grille d'informations */
.elite-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.elite-info-group {
  background: linear-gradient(135deg, var(--white) 0%, var(--tertiary-extra-light) 100%);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  border: 1px solid var(--gray-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.elite-info-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-color), var(--primary-light));
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.elite-info-group:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.elite-info-group:hover::before {
  transform: scaleY(1);
}

.info-group-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary-dark);
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--gray-lighter);
}

.elite-info-item {
  margin-bottom: 1.25rem;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: background-color 0.2s ease;
}

.elite-info-item:last-child {
  margin-bottom: 0;
}

.elite-info-item:hover {
  background-color: rgba(80, 134, 193, 0.05);
}

.info-label {
  font-size: 0.8125rem;
  color: var(--gray-dark);
  margin-bottom: 0.375rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-label::before {
  content: '';
  width: 3px;
  height: 12px;
  background-color: var(--primary-color);
  border-radius: 2px;
}

.info-value {
  font-weight: 500;
  color: var(--black);
  font-size: 1rem;
  padding-left: 0.5rem;
}

.rejection-details {
  padding: 1rem;
  background-color: var(--error-extra-light);
  border-left: 3px solid var(--error);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  font-style: italic;
}

/* Badges de filière */
.elite-field-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: var(--shadow-light);
}

.elite-field-badge.btp {
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
  border-left: 3px solid var(--primary-color);
}

.elite-field-badge.informatique {
  background-color: var(--secondary-extra-light);
  color: var(--secondary-dark);
  border-left: 3px solid var(--secondary-color);
}

.elite-field-badge.gestion {
  background-color: var(--tertiary-extra-light);
  color: var(--tertiary-dark);
  border-left: 3px solid var(--tertiary-color);
}

/* Section Documents */
.elite-documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* Section Paiement */
.elite-payment-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.elite-payment-card {
  background: linear-gradient(135deg, var(--white) 0%, var(--tertiary-extra-light) 100%);
  border-radius: var(--radius-lg);
  padding: 2rem;
  border: 1px solid var(--gray-lighter);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.elite-payment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary-color), var(--secondary-light));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.elite-payment-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-light);
}

.elite-payment-card:hover::before {
  transform: scaleX(1);
}

.payment-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-lighter);
}

.payment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-light));
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.payment-card-header h4 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-dark);
}

.elite-payment-item {
  margin-bottom: 1.25rem;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.elite-payment-item:hover {
  background-color: var(--white);
  transform: translateX(4px);
  box-shadow: var(--shadow-sm);
}

.payment-label {
  font-size: 0.8125rem;
  color: var(--gray-dark);
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.payment-value {
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--primary-dark);
}

.elite-status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-color: var(--tertiary-extra-light);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: all 0.3s ease;
  border: 1px solid var(--gray-lighter);
}

.elite-status-card.verified {
  background-color: var(--success-light);
  border-color: var(--success);
}

.elite-status-card:not(.verified) {
  background-color: var(--warning-light);
  border-color: var(--warning);
}

.status-icon {
  margin-bottom: 1rem;
}

.status-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.status-content p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--gray-dark);
}

.elite-verify-btn {
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.elite-verify-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

/* État de chargement élégant */
.elite-loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.loading-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 5px solid var(--primary-extra-light);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.125rem;
  color: var(--gray-dark);
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .elite-payment-content {
    grid-template-columns: 1fr;
  }

  .elite-info-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .elite-detail-container {
    padding: 0 1rem 2rem;
  }

  .elite-header {
    padding: 1.25rem;
  }

  .header-top-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .header-actions-wrapper {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .elite-download-btn {
    width: 100%;
    justify-content: center;
  }

  .elite-action-buttons {
    width: 100%;
    gap: 0.5rem;
  }

  .elite-action-buttons button {
    flex: 1;
    justify-content: center;
  }

  .elite-profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1.25rem;
  }

  .elite-profile-meta {
    justify-content: center;
    gap: 0.75rem;
  }

  .elite-tab-navigation {
    padding: 0.25rem;
  }

  .elite-tabs {
    overflow-x: auto;
    gap: 0.125rem;
    scrollbar-width: thin;
  }

  .elite-tabs::-webkit-scrollbar {
    height: 4px;
  }

  .elite-tabs::-webkit-scrollbar-thumb {
    background-color: var(--primary-light);
    border-radius: 2px;
  }

  .elite-tabs button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    white-space: nowrap;
    flex: none;
  }

  .elite-tab-content {
    padding: 1.5rem;
  }

  .elite-info-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .section-header {
    flex-direction: row;
    gap: 0.75rem;
  }

  .section-icon {
    width: 40px;
    height: 40px;
  }

  .section-header h3 {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .elite-detail-container {
    padding: 0 0.75rem 1.5rem;
  }

  .elite-header {
    padding: 1rem;
    border-radius: var(--radius-lg);
  }

  .elite-avatar-container {
    width: 100px;
    height: 100px;
  }

  .elite-avatar-badge {
    width: 30px;
    height: 30px;
  }

  .elite-profile-title h1 {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .elite-profile-meta {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .meta-item {
    width: 100%;
    justify-content: center;
  }

  .elite-status-badge {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .rejection-reason {
    display: none;
  }

  .elite-info-group {
    padding: 1.25rem;
  }

  .info-group-title {
    font-size: 1rem;
  }

  .elite-tab-content {
    padding: 1.25rem;
    border-radius: var(--radius-lg);
  }

  .payment-icon {
    width: 40px;
    height: 40px;
  }

  .payment-card-header h4 {
    font-size: 1rem;
  }
}
</style>
