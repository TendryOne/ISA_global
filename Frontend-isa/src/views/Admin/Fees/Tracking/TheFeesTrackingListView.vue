<template>
  <div class="fees-container">
    <BreadCrumbsBack title="Retour au choix de promotion" />

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon paid">
          <Icon icon="mdi:check-circle" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ paidCount }}</div>
          <div class="stat-label">Étudiants à jour</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon late">
          <Icon icon="mdi:alert-circle" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ lateCount }}</div>
          <div class="stat-label">En retard</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pending">
          <Icon icon="mdi:clock-outline" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ pendingCount }}</div>
          <div class="stat-label">En attente</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <Icon icon="mdi:currency-usd" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(totalRemaining) }}</div>
          <div class="stat-label">Montant total restant</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <div class="header-section">
          <h2>Suivi des paiements par étudiant</h2>
          <p class="subtitle">Gestion des échéances et relances</p>
        </div>
        <div class="header-right">
          <div class="toolbar">
            <button class="info-btn premium-btn" @click="infoOpen = true" title="Comment ça marche ?">
              <Icon icon="mdi:information-outline" />
              <span class="btn-text">Aide</span>
            </button>
            <div class="search-group">
              <Icon icon="mdi:magnify" class="search-icon" />
              <input v-model.trim="searchMatricule" class="search-input premium-input"
                placeholder="Recherche par matricule…" />
            </div>
            <div class="filter-group">
              <select v-model="statusFilter" class="filter-select premium-input">
                <option value="">Tous les statuts</option>
                <option value="paid">À jour</option>
                <option value="late">En retard</option>
                <option value="pending">En attente</option>
                <option value="not-due">Pas encore dû</option>
              </select>
            </div>
          </div>
          <div class="meta">
            <span class="count">{{ displayedTutions.length }} dossiers</span>
            <button class="refresh-btn premium-btn" @click="fetchTutionFeesData" :disabled="loadingServer"
              title="Actualiser les données">
              <Icon icon="mdi:refresh" :class="{ 'spin': loadingServer }" />
            </button>
          </div>
        </div>
      </div>

      <div class="table-scroll">
        <table class="fees-table premium-table" role="grid" aria-label="Suivi des tranches par étudiant">
          <thead>
            <tr>
              <th class="column-matricule">Matricule</th>
              <th class="column-student">Étudiant</th>
              <th class="column-tranche">Prochaine échéance</th>
              <th class="column-status">Statut</th>
              <th class="column-amount num">Montant payé</th>
              <th class="column-amount num">Restant dû</th>
              <th class="column-reminders center">Relances</th>
              <th class="column-date">Dernière relance</th>
              <th class="column-actions">Actions</th>
            </tr>
          </thead>

          <tbody v-if="!loadingServer && !errorServer && displayedTutions.length">
            <tr v-for="t in displayedTutions" :key="t._id" class="table-row">
              <td class="mono matricule-cell">{{ t.user?.matricule || '—' }}</td>
              <td class="student-cell">
                <div class="student">
                  <div class="avatar premium-avatar" :style="avatarStyle(studentFullName(t))">
                    {{ initials(studentFullName(t)) }}
                  </div>
                  <div class="names">
                    <div class="name">{{ studentFullName(t) }}</div>
                    <div class="promotion">{{ getPromotionName(t) }}</div>
                  </div>
                </div>
              </td>
              <td class="installment-cell">
                <div v-if="getNextInstallment(t)" class="installment-info">
                  <div class="installment-label">{{ getNextInstallment(t)?.label }}</div>
                  <div class="due-date">{{ formatDate(getNextInstallment(t)?.dueDate) }}</div>
                </div>
                <span v-else class="no-due">Aucune échéance</span>
              </td>
              <td class="status-cell">
                <span v-if="getNextInstallment(t)" class="status-badge"
                  :class="statusClass(checkLateInstallment(getNextInstallment(t)!))">
                  {{ checkLateInstallment(getNextInstallment(t)!) }}
                </span>
                <span v-else class="status-badge paid">
                  <Icon icon="mdi:check-circle" class="status-icon" />
                  Solde réglé
                </span>
              </td>
              <td class="num amount-cell paid-amount">{{ formatCurrency(sumPaid(t)) }}</td>
              <td class="num amount-cell remaining-amount">{{ formatCurrency(remaining(t)) }}</td>
              <td class="center reminders-cell">
                <div class="reminders-count"
                  :class="{ highlighted: (getNextInstallment(t)?.numberOfReminders || 0) > 0 }">
                  {{ getNextInstallment(t)?.numberOfReminders ?? 0 }}
                </div>
              </td>
              <td class="date-cell">{{ formatDate(getNextInstallment(t)?.lastReminderDate) }}</td>
              <td class="actions-cell">
                <div class="actions">
                  <ActionButton icon="mdi:eye-outline" icon-size="16" size="small" variant="outline"
                    @click="tutionInModal = t" title="Voir le détail">
                    Détails
                  </ActionButton>
                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!loadingServer && !errorServer && !displayedTutions.length">
            <tr>
              <td colspan="9" class="empty">
                <div class="empty-state">
                  <div class="empty-icon">
                    <Icon icon="mdi:file-document-outline" />
                  </div>
                  <div class="empty-text">
                    <h3>Aucun dossier de frais de scolarité disponible</h3>
                    <p>Aucun enregistrement correspondant n’a été trouvé.</p>
                  </div>

                </div>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="!loadingServer && errorServer">
            <tr>
              <td colspan="9" class="error-state">
                <div class="error-content">
                  <Icon icon="mdi:alert-circle-outline" class="error-icon" />
                  <div class="error-text">
                    <h3>Erreur de chargement</h3>
                    <p>{{ errorServer }}</p>
                  </div>
                  <ActionButton size="small" @click="fetchTutionFeesData">Réessayer</ActionButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loadingServer" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Chargement des données...</span>
      </div>
    </div>

    <TheTrackingItem v-if="tutionInModal" :tution-fees="tutionInModal" @close="tutionInModal = null"
      @accept-payment="AcceptPayment" @reject-payment="RejectPayment" />

    <div v-if="infoOpen" class="luxury-modal-overlay " @click.self="infoOpen = false">
      <div class="modal-card premium-modal" role="dialog" aria-modal="true" aria-label="Aide suivi des rappels">
        <header class="modal-header">
          <h3>Comment fonctionne le suivi des paiements</h3>
          <button class="close premium-close" @click="infoOpen = false" aria-label="Fermer">
            <Icon icon="mdi:close" />
          </button>
        </header>
        <div class="modal-body">
          <div class="info-item">
            <Icon icon="mdi:calendar-clock" class="info-icon" />
            <div class="info-content">
              <h4>Prochaine échéance</h4>
              <p>La prochaine échéance non vérifiée, triée par date d'échéance.</p>
            </div>
          </div>
          <div class="info-item">
            <Icon icon="mdi:progress-check" class="info-icon" />
            <div class="info-content">
              <h4>Statuts de paiement</h4>
              <p><span class="status-example paid">Payé</span> (vert),
                <span class="status-example pending">En attente</span> (orange),
                <span class="status-example late">En retard</span> (rouge),
                <span class="status-example not-due">Non échu</span> (gris).
              </p>
            </div>
          </div>
          <div class="info-item">
            <Icon icon="mdi:email-fast" class="info-icon" />
            <div class="info-content">
              <h4>Gestion des relances</h4>
              <p>Le système compte le nombre de relances envoyées pour chaque échéance et affiche la date du dernier
                envoi.</p>
            </div>
          </div>
          <div class="info-item">
            <Icon icon="mdi:send" class="info-icon" />
            <div class="info-content">
              <h4>Envoi automatique des rappels</h4>
              <p>Le système génère et transmet automatiquement des notifications aux étudiants : cinq (5) jours avant
                l’échéance, le jour de l’échéance et cinq (5) jours après celle-ci.</p>
            </div>
          </div>

          <div class="info-item">
            <Icon icon="mdi:block-helper" class="info-icon" />
            <div class="info-content">
              <h4>Application des restrictions</h4>
              <p>À défaut de règlement dans un délai de sept (7) jours suivant l’échéance, l’accès de l’étudiant à la
                plateforme est automatiquement suspendu. Le rétablissement de l’accès intervient uniquement après
                vérification et validation du paiement par l’administration.</p>
            </div>
          </div>

        </div>
        <footer class="modal-footer">
          <ActionButton size="medium" @click="infoOpen = false">Compris</ActionButton>
        </footer>
      </div>
    </div>
  </div>
  <SuccessToast v-if="toast.show" :message="toast.message" :type="toast.type" :title="toast.title"
    @dismissed="toast.show = false" />
</template>

<script setup lang="ts">
import TheTrackingItem from '@/components/admin/Fees/tracking/TheTrackingItem.vue'
import ActionButton from '@/components/ui/ActionButton.vue'
import BreadCrumbsBack from '@/components/ui/BreadCrumbsBack.vue';
import type { InstallmentsInterface } from '@/interfaces/tutionFees.interface';
import type TutionFeesInterface from '@/interfaces/tutionFees.interface';
import axios, { AxiosError } from 'axios';
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue'
import { useSocket } from '@/composables/useSocket';
import SuccessToast from '@/components/toast/successToast.vue';
import type { ToastInterface } from '@/interfaces/toast.interface';
const route = useRoute();
const errorServer = ref<string>('');
const loadingServer = ref<boolean>(true);
const tutionFeesData = ref<TutionFeesInterface[]>([]);
const tutionInModal = ref<TutionFeesInterface | null>(null)
const searchMatricule = ref('')
const searchName = ref('')
const statusFilter = ref('')
const infoOpen = ref(false)
const toast = ref<ToastInterface>({
  show: false,
  message: '',
  type: 'success',
  title: '',
})

const { on, emit } = useSocket()

const fetchTutionFeesData = async () => {
  loadingServer.value = true
  errorServer.value = ''
  try {
    const { data } = await axios.get(`/api/v1/tutionFees/promotion/${route.params.promotionId}`)
    tutionFeesData.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e: unknown) {
    const err = e as AxiosError
    errorServer.value = (err.response?.data as string) || err.message || 'Erreur serveur'
  } finally {
    loadingServer.value = false;
  }
}

watchEffect(async () => {
  if (route.params.promotionId) {
    await fetchTutionFeesData();
  }

})



// Statistics computed properties
const paidCount = computed(() => {
  return tutionFeesData.value.filter(t => {
    const nextInstallment = getNextInstallment(t)
    return !nextInstallment // No next installment means all paid
  }).length
})

const lateCount = computed(() => {
  return tutionFeesData.value.filter(t => {
    const nextInstallment = getNextInstallment(t)
    return nextInstallment && checkLateInstallment(nextInstallment) === 'En retard'
  }).length
})

const pendingCount = computed(() => {
  return tutionFeesData.value.filter(t => {
    const nextInstallment = getNextInstallment(t)
    return nextInstallment && checkLateInstallment(nextInstallment) === 'En attente de vérification'
  }).length
})

const totalRemaining = computed(() => {
  return tutionFeesData.value.reduce((total, t) => total + remaining(t), 0)
})

const sortedTutions = computed(() =>
  [...tutionFeesData.value].sort((a, b) =>
    (a.user?.matricule || '').localeCompare(b.user?.matricule || '', 'fr', { sensitivity: 'base' })
  )
)

const displayedTutions = computed(() => {
  const m = searchMatricule.value.trim().toLowerCase()
  const n = searchName.value.trim().toLowerCase()
  const statusF = statusFilter.value

  return sortedTutions.value.filter(t => {
    const matricule = (t.user?.matricule || '').toLowerCase()
    const name = studentFullName(t).toLowerCase()
    const matchesSearch = (!m || matricule.includes(m)) && (!n || name.includes(n))

    if (!matchesSearch) return false

    if (!statusF) return true

    const nextInstallment = getNextInstallment(t)
    if (statusF === 'paid') {
      return !nextInstallment // No next installment means all paid
    }

    if (!nextInstallment) return false

    const status = checkLateInstallment(nextInstallment)
    switch (statusF) {
      case 'late':
        return status === 'En retard'
      case 'pending':
        return status === 'En attente de vérification'
      case 'not-due':
        return status === 'Pas encore dû'
      default:
        return true
    }
  })
})

function getNextInstallment(t: TutionFeesInterface): InstallmentsInterface | undefined {
  const list = (t.installments || [])
    .filter((i) => !i.verified)
    .sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY
      return da - db
    })
  return list[0]
}

const checkLateInstallment = (installments: InstallmentsInterface) => {
  const today = new Date();
  const dueDate = new Date(installments.dueDate);

  // Si déjà vérifié et payé
  if (installments.verified) {
    return "Payé";
  }

  // Si paiement soumis (method + transactionRef OU proofFile) = En attente de vérification
  if (installments.method && (installments.transactionRef || installments.proofFile)) {
    return "En attente de vérification";
  }

  // Si date d'échéance dépassée et aucun paiement soumis = En retard
  if (today > dueDate) {
    return "En retard";
  }

  // Sinon = Pas encore dû
  return "Pas encore dû";
};

function studentFullName(t: TutionFeesInterface) {
  const n = (t.user?.name || '').trim()
  const f = (t.user?.firstName || '').trim()
  return [n, f].filter(Boolean).join(' ') || '—'
}

function getPromotionName(t: TutionFeesInterface) {
  if (typeof t.promotion === 'string') {
    return t.promotion || '—'
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (t.promotion as any)?.name || '—'
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function avatarStyle(seed: string) {
  const colors = ['#5086c1', '#2c5fa3', '#6fa8dc', '#80c6a3', '#b39ddb']
  const i = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length
  return { background: colors[i], color: 'white' }
}

function sumPaid(t: TutionFeesInterface) {
  const items = t.installments || []
  return items.filter((i) => i.verified).reduce((s, i) => s + (Number(i.amount) || 0), 0)
}

function remaining(t: TutionFeesInterface) {
  const val = (t.totalAmount || 0) - sumPaid(t)
  return val < 0 ? 0 : val
}

function formatCurrency(v?: number) {
  const value = v || 0;
  try {
    // Formatage classique avec séparateur de milliers et décimales
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0, // l'Ariary n'a pas de centimes
      maximumFractionDigits: 0
    }).format(value) + ' Ar';
  } catch {
    return `${value} Ar`;
  }
}


function statusClass(status?: string) {
  switch (status) {
    case 'Payé':
      return 'paid'
    case 'En attente de vérification':
      return 'pending'
    case 'En retard':
      return 'late'
    case 'Pas encore dû':
      return 'not-due'
    default:
      return 'neutral'
  }
}

function formatDate(d?: Date | string) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


const AcceptPayment = async (item: string) => {
  try {
    const response = await axios.patch(`/api/v1/tutionFees/${tutionInModal.value?._id}/installments`, {
      label: item,
      verified: true,
    })

    tutionInModal.value = response.data;
    tutionFeesData.value = tutionFeesData.value.map(t => t._id === response.data._id ? response.data : t);
    toast.value = {
      message: 'Paiement accepté avec succès',
      show: true,
      title: 'Succès',
      type: 'success'
    }

    emit("sendNotificationForFeesByAdmin", ({ accept: true, tutionFees: response.data, label: item }))


  } catch (error) {
    toast.value = {
      message: axios.isAxiosError(error) && error.response ? error.response.data : 'Erreur lors de l\'acceptation du paiement',
      show: true,
      title: 'Erreur',
      type: 'error'
    }

  }
}

const RejectPayment = async (item: string) => {
  try {
    const response = await axios.patch(`/api/v1/tutionFees/${tutionInModal.value?._id}/installments`, {
      label: item,
      verified: false,
    })
    tutionFeesData.value = tutionFeesData.value.map(t => t._id === response.data._id ? response.data : t);
    tutionInModal.value = response.data;
    emit("sendNotificationForFeesByAdmin", ({ accept: false, tutionFees: response.data, label: item }))
    toast.value = {
      message: 'Paiement rejeté avec succès',
      show: true,
      title: 'Succès',
      type: 'success'
    }

  } catch (error) {
    toast.value = {
      message: axios.isAxiosError(error) && error.response ? error.response.data : 'Erreur lors du rejet du paiement',
      show: true,
      title: 'Erreur',
      type: 'error'
    }

  }
}


</script>

<style scoped>
.luxury-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 37, 64, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.fees-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary, linear-gradient(90deg, #4299e1, #667eea));
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.stat-icon.paid {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.stat-icon.late {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.stat-icon.total {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 500;
}

.table-card {
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #f1f3f7;
  background: linear-gradient(135deg, #fafbfc 0%, #f7fafc 100%);
  position: relative;
}

.table-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 2rem;
  right: 2rem;
  height: 3px;
  background: linear-gradient(90deg, #4299e1, #667eea);
  border-radius: 2px;
}

.header-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, #2d3748, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0;
  font-size: 1rem;
  color: #718096;
  font-weight: 500;
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.premium-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  color: #4a5568;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.premium-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.premium-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  display: inline-block;
}

.search-group,
.filter-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #a0aec0;
  z-index: 1;
  font-size: 1.125rem;
}

.premium-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  height: 2.75rem;
  padding: 0 1rem;
  outline: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-input {
  padding-left: 2.75rem;
  width: 220px;
}

.filter-select {
  width: 180px;
  cursor: pointer;
}

.premium-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.count {
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: rgba(66, 153, 225, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(66, 153, 225, 0.2);
}

.refresh-btn {
  padding: 0.75rem;
  min-width: 2.75rem;
}

.spin {
  animation: spin 1s linear infinite;
}

.table-scroll {
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1200px;
}

.premium-table thead th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #718096;
  text-transform: uppercase;
  padding: 1rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.premium-table td {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f3f7;
  vertical-align: middle;
  font-size: 0.875rem;
}

.table-row {
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f8fafc;
}

.mono {
  font-family: "SF Mono", "Roboto Mono", "Fira Code", monospace;
  font-size: 0.8125rem;
}

.student {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.premium-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.names {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: #2d3748;
}

.promotion {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.125rem;
}

.installment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.installment-label {
  font-weight: 500;
  color: #2d3748;
}

.due-date {
  font-size: 0.75rem;
  color: #718096;
}

.no-due {
  color: #a0aec0;
  font-style: italic;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-icon {
  font-size: 1rem;
}

.status-badge.paid {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
  border-color: rgba(72, 187, 120, 0.2);
}

.status-badge.pending {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
  border-color: rgba(237, 137, 54, 0.2);
}

.status-badge.late {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border-color: rgba(245, 101, 101, 0.2);
}

.status-badge.not-due {
  background: rgba(160, 174, 192, 0.1);
  color: #a0aec0;
  border-color: rgba(160, 174, 192, 0.2);
}

.paid-amount {
  color: #48bb78;
  font-weight: 600;
}

.remaining-amount {
  color: #f56565;
  font-weight: 600;
}

.reminders-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: #f7fafc;
  color: #718096;
  font-weight: 600;
  font-size: 0.75rem;
}

.reminders-count.highlighted {
  background: #ebf8ff;
  color: #3182ce;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  color: #718096;
}

.error-state {
  padding: 2rem;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  color: #f56565;
}

.error-text h3 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-weight: 600;
}

.error-text p {
  margin: 0;
  color: #718096;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #718096;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e2e8f0;
  border-left-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Modal Styles */
.premium-modal {
  width: min(800px, 92vw);
  max-height: 90vh;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #fafbfc;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
}

.premium-close {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.premium-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
  height: 50vh;
  overflow-y: auto;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #f1f3f7;
}

.info-icon {
  font-size: 1.5rem;
  color: #4299e1;
  flex-shrink: 0;
}

.info-content h4 {
  margin: 0 0 0.5rem 0;
  color: #2d3748;
  font-weight: 600;
}

.info-content p {
  margin: 0;
  color: #718096;
  line-height: 1.5;
}

.status-example {
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-example.paid {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.status-example.pending {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.status-example.late {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
}

.status-example.not-due {
  background: rgba(160, 174, 192, 0.1);
  color: #a0aec0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #fafbfc;
}

/* Column widths for better proportion */
.column-matricule {
  width: 120px;
}

.column-student {
  width: 220px;
}

.column-tranche {
  width: 160px;
}

.column-status {
  width: 160px;
}

.column-amount {
  width: 120px;
}

.column-reminders {
  width: 80px;
}

.column-date {
  width: 120px;
}

.column-actions {
  width: 200px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .fees-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .table-header {
    padding: 1.5rem;
  }

  .premium-input.search-input {
    width: 180px;
  }

  .filter-select {
    width: 150px;
  }
}

@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .header-right {
    align-items: stretch;
  }

  .toolbar {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .meta {
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .stat-value {
    font-size: 1.75rem;
  }

  .premium-table {
    min-width: 900px;
  }
}

@media (max-width: 768px) {
  .fees-container {
    padding: 0.75rem;
    background: #f8fafc;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .table-card {
    border-radius: 12px;
    margin: 0;
  }

  .table-header {
    padding: 1rem;
    gap: 1rem;
  }

  .header-section h2 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-group,
  .filter-group {
    width: 100%;
  }

  .premium-input {
    width: 100%;
  }

  .meta {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .count {
    text-align: center;
  }

  .premium-table {
    min-width: 700px;
  }

  .premium-table th,
  .premium-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8125rem;
  }

  .student {
    gap: 0.5rem;
  }

  .premium-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  .name {
    font-size: 0.875rem;
  }

  .promotion {
    font-size: 0.6875rem;
  }

  .btn-text {
    display: none;
  }

  .premium-btn {
    padding: 0.75rem;
    min-width: 2.75rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.375rem;
  }
}

@media (max-width: 480px) {
  .fees-container {
    padding: 0.5rem;
  }

  .stats-grid {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    padding: 0.75rem;
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .stat-label {
    font-size: 0.8125rem;
  }

  .table-header {
    padding: 0.75rem;
  }

  .header-section h2 {
    font-size: 1.25rem;
  }

  .table-scroll {
    border-radius: 0;
    margin: 0 -0.5rem;
    padding: 0 0.5rem;
  }

  .premium-table {
    min-width: 600px;
  }

  .premium-table th,
  .premium-table td {
    padding: 0.5rem 0.375rem;
    font-size: 0.75rem;
  }

  .premium-avatar {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.6875rem;
    border-radius: 6px;
  }

  .name {
    font-size: 0.8125rem;
  }

  .promotion {
    font-size: 0.625rem;
  }

  .status-badge {
    padding: 0.25rem 0.5rem;
    font-size: 0.6875rem;
  }

  .reminders-count {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 0.6875rem;
  }

  .installment-label {
    font-size: 0.8125rem;
  }

  .due-date {
    font-size: 0.6875rem;
  }

  /* Mobile table optimizations */
  .column-matricule {
    width: 80px;
  }

  .column-student {
    width: 150px;
  }

  .column-tranche {
    width: 120px;
  }

  .column-status {
    width: 100px;
  }

  .column-amount {
    width: 80px;
  }

  .column-reminders {
    width: 60px;
  }

  .column-date {
    width: 80px;
  }

  .column-actions {
    width: 80px;
  }
}
</style>
