<template>
  <div class="notifications-container">
    <!-- Bouton de déclenchement -->
    <button class="notification-trigger" @click="toggleNotifications">
      <span class="icon">
        <icon icon="mdi:bell" />
      </span>
      <span class="badge" v-if="notificationStore.unseenCount && notificationStore.unseenCount > 0">
        {{ notificationStore.unseenCount > 99 ? '99+' : notificationStore.unseenCount }}
      </span>
    </button>

    <!-- Modal des notifications -->
    <div class="notifications-modal" :class="{ active: notificationStore.isOpen }">
      <div class="notifications-header">
        <div class="header-content">
          <icon icon="mdi:bell-ring" class="header-icon" />
          <div>
            <h3>Notifications</h3>
            <span class="header-subtitle" v-if="notificationStore.notifications.length > 0">
              {{ notificationStore.unseenCount }} nouvelle(s)
            </span>
          </div>
        </div>
        <button class="close-btn" @click="toggleNotifications">
          <icon icon="mdi:close" />
        </button>
      </div>

      <!-- Filtres rapides -->
      <div class="notifications-filters">
        <button v-for="filter in filters" :key="filter.value" class="filter-btn"
          :class="{ active: activeFilter === filter.value }"
          @click="activeFilter = filter.value as 'all' | 'unread' | 'critical'">
          <icon :icon="filter.icon" />
          {{ filter.label }}
        </button>
      </div>

      <!-- Bannière pour demander la permission des notifications natives -->
      <div v-if="showNotificationPermissionBanner" class="notification-permission-banner">
        <div class="banner-icon">
          <icon icon="mdi:bell-ring" />
        </div>
        <div class="banner-content">
          <h4>Activez les notifications</h4>
          <p>Recevez des alertes même lorsque vous n'êtes pas sur la page</p>
        </div>
        <div class="banner-actions">
          <button class="banner-btn dismiss" @click="dismissPermissionBanner">
            <icon icon="mdi:close" />
          </button>
          <button class="banner-btn activate" @click="requestNotificationPermission">
            <icon icon="mdi:check" />
            Activer
          </button>
        </div>
      </div>

      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-icon-wrapper">
            <icon icon="mdi:bell-sleep" class="empty-icon" />
          </div>
          <h4>Aucune notification</h4>
          <p>Vous êtes à jour !</p>
        </div>

        <TransitionGroup name="notification-list" tag="div" v-else>
          <div v-for="notification in filteredNotifications" :key="notification._id" class="notification-card" :class="[
            { unread: !notification.seen },
            { clickable: notification.linkTo },
            `level-${notification.warningLevel || 'info'}`,
          ]" @click="handleNotificationClick(notification)">
            <!-- Indicateur de niveau -->
            <div class="level-indicator" :class="`level-${notification.warningLevel || 'info'}`"></div>

            <!-- Icône principale -->
            <div class="notification-icon-wrapper" :class="`type-${notification.informationType}`">
              <icon :icon="getInformationTypeIcon(notification.informationType)" />
            </div>

            <!-- Contenu -->
            <div class="notification-body">
              <div class="notification-top">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <span v-if="notification.warningLevel && notification.warningLevel !== 'info'" class="warning-pill"
                  :class="`pill-${notification.warningLevel}`">
                  <icon :icon="getWarningIcon(notification.warningLevel)" />
                  {{ getWarningLabel(notification.warningLevel) }}
                </span>
              </div>

              <p class="notification-message" :class="{ expanded: isExpanded(notification._id) }">
                {{ truncateMessage(notification.message, isExpanded(notification._id)) }}
              </p>

              <!-- Bouton Voir plus/moins -->
              <button v-if="isMessageLong(notification.message)" class="expand-btn"
                @click="toggleExpand(notification._id, $event)">
                <icon :icon="isExpanded(notification._id) ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
                {{ isExpanded(notification._id) ? 'Voir moins' : 'Voir plus' }}
              </button>

              <div class="notification-meta">
                <span class="meta-category">
                  <icon :icon="getInformationTypeIcon(notification.informationType)" />
                  {{ getCategoryLabel(notification.informationType) }}
                </span>
                <span class="meta-time">
                  <icon icon="mdi:clock-outline" />
                  {{ formatDate(notification.createdAt) }}
                </span>
              </div>
            </div>

            <!-- Point non lu -->
            <div v-if="!notification.seen" class="unread-dot"></div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Footer -->
      <div class="notifications-footer" v-if="notificationStore.notifications.length > 0">
        <ActionButton full-width @click="fetchNextNotifications" variant="outline" outline-color="prim"
          icon="eva:arrow-down-fill" :disabled="page >= totalPages">
          Voir plus
        </ActionButton>
        <p class="footer-info">
          <icon icon="mdi:information-outline" />
          Les notifications sont automatiquement supprimées après 30 jours
        </p>
      </div>
    </div>
    <!-- Overlay -->
    <div class="modal-overlay" :class="{ active: notificationStore.isOpen }" @click="toggleNotifications"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { UseNotificationStore } from '@/stores/notificationStore'
import type { NotificationInterface } from '@/interfaces/notification.interface'
import { useSocket } from '@/composables/useSocket'
import ActionButton from '../ui/ActionButton.vue'
import type UserInterface from '@/interfaces/user.interfaces'
import { useMyUserStore } from '@/stores/userStore'
import { storeToRefs } from 'pinia'


const { on } = useSocket()
const router = useRouter()

const notificationStore = UseNotificationStore()
const activeFilter = ref<'all' | 'unread' | 'critical'>('all')

const { unseenCount } = storeToRefs(notificationStore)
function notificationOnglet() {
  if (unseenCount.value > 0) {
    document.title = `(${unseenCount.value}) Institut Supérieur d'Ambatomirahavavy`
  } else {
    document.title = `Institut Supérieur d'Ambatomirahavavy`
  }
}

watch(unseenCount, () => {
  notificationOnglet()
})

interface GetData {
  notifications: NotificationInterface[]
  total: number
  unseenCount: number
  lastSeenAt: Date
  page: number
  totalPages: number
  perPage: number
}

const lastSeenNotification = ref<Date | null>(null)
const page = ref<number>(0)
const totalPages = ref<number>(0)
const showNotificationPermissionBanner = ref(false)
const expandedNotifications = ref<Set<string>>(new Set())

// Vérifier si les notifications natives sont supportées
const isNotificationSupported = computed(() => {
  return typeof window !== 'undefined' && 'Notification' in window
})

// Obtenir le statut de permission actuel
const notificationPermission = computed(() => {
  if (!isNotificationSupported.value) return 'unsupported'
  return Notification.permission
})

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Toutes', icon: 'mdi:bell-outline' },
  { value: 'unread', label: 'Non lues', icon: 'mdi:email-outline' },
  { value: 'critical', label: 'Urgentes', icon: 'mdi:alert-circle-outline' },
]

const fetchNotifications = async () => {
  try {
    const response = await axios.get<GetData>('/api/v1/notifications')
    notificationStore.SetNotifications(response.data.notifications)
    notificationStore.setUnseenCount(response.data.unseenCount)
    lastSeenNotification.value = response.data.lastSeenAt
      ? new Date(response.data.lastSeenAt)
      : null
    notificationStore.loaded = true
    page.value = response.data.page
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.log(error)
  }
}

const fetchNextNotifications = async () => {
  try {
    if (page.value >= totalPages.value) return
    page.value += 1
    const response = await axios.get<GetData>('/api/v1/notifications', {
      params: { page: page.value },
    })
    notificationStore.SetNotifications(response.data.notifications)
  } catch (error) {
    console.log(error)
  }
}

const toggleNotifications = () => {
  notificationStore.toggleNotificationDropdown()
  if (!notificationStore.isOpen) {
    lastSeenNotification.value = new Date()
  } else {
    // Quand le panneau s'ouvre, vérifier si on doit afficher la bannière de permission
    checkAndShowPermissionBanner()
  }
}

const lastSeenTimestamp = computed(() =>
  lastSeenNotification.value ? new Date(lastSeenNotification.value).getTime() : 0,
)

const notificationsWithSeen = computed(() =>
  notificationStore.notifications.map((n) => ({
    ...n,
    seen: new Date(n.createdAt).getTime() <= lastSeenTimestamp.value,
  })),
)

// Notifications filtrées
const filteredNotifications = computed(() => {
  let notifications = notificationsWithSeen.value

  if (activeFilter.value === 'unread') {
    notifications = notifications.filter((n) => !n.seen)
  } else if (activeFilter.value === 'critical') {
    notifications = notifications.filter(
      (n) => n.warningLevel === 'critical' || n.warningLevel === 'warning',
    )
  }

  return notifications
})


const patchLastSeenNotificatons = async () => {
  try {
    await axios.patch('/api/v1/notifications/mark-as-read')
    notificationStore.setUnseenCount(0)
  } catch (error) {
    console.log(error)
  }
}

// Vérifier si on doit afficher la bannière de permission
const checkAndShowPermissionBanner = () => {
  if (!isNotificationSupported.value) return

  // Ne pas afficher si déjà accordée ou refusée
  if (notificationPermission.value !== 'default') return

  // Ne pas afficher si l'utilisateur l'a déjà refusée dans cette session
  const dismissed = sessionStorage.getItem('notificationPermissionDismissed')
  if (dismissed) return

  // Afficher la bannière
  showNotificationPermissionBanner.value = true
}

// Masquer la bannière
const dismissPermissionBanner = () => {
  showNotificationPermissionBanner.value = false
  sessionStorage.setItem('notificationPermissionDismissed', 'true')
}

// Demander la permission pour les notifications natives
const requestNotificationPermission = async () => {
  if (!isNotificationSupported.value) return

  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      showNotificationPermissionBanner.value = false
      console.log('Permission de notification accordée.')
      // Optionnel : afficher une notification de confirmation
      showWelcomeNotification()
    } else if (permission === 'denied') {
      showNotificationPermissionBanner.value = false
      console.log('Permission de notification refusée.')
    }
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error)
  }
}

// Afficher une notification de bienvenue
const showWelcomeNotification = () => {
  if (!isNotificationSupported.value || Notification.permission !== 'granted') return

  const notification = new Notification('Notifications activées ! 🎉', {
    body: 'Vous recevrez maintenant des alertes pour les événements importants.',
    icon: '/logo300x300.svg',
    tag: 'welcome-notification',
  })

  setTimeout(() => notification.close(), 5000)
}

// Afficher une notification native
const showNativeNotification = (notification: NotificationInterface) => {
  if (!isNotificationSupported.value || Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body: notification.message,
    icon: '/logo300x300.svg',
    badge: '/logo300x300.svg',
    tag: notification._id,
    requireInteraction: notification.warningLevel === 'critical',
    data: {
      linkTo: notification.linkTo,
      notificationId: notification._id,
    },
  }

  const nativeNotif = new Notification(notification.title, options)

  // Gestion du clic sur la notification native
  nativeNotif.onclick = () => {
    window.focus()
    if (notification.linkTo) {
      router.push(notification.linkTo)
    }
    notificationStore.toggleNotificationDropdown()
    nativeNotif.close()
  }

  // Fermer automatiquement après un certain temps (sauf si critique)
  if (notification.warningLevel !== 'critical') {
    setTimeout(() => {
      nativeNotif.close()
    }, 8000)
  }
}

const checkNotificationPermission = async () => {
  if (!('Notification' in window)) return
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    console.log('Permission de notification accordée.')
  }
}

// Utiliser watch au lieu de watchEffect pour éviter les déclenchements multiples
watch(
  () => notificationStore.isOpen,
  (isOpen) => {
    if (isOpen) {
      patchLastSeenNotificatons()
    }
  }
)

// Fetch notifications seulement une fois au montage si pas encore chargé
onMounted(() => {
  if (!notificationStore.loaded) {
    fetchNotifications()
  }

  // Écouter les notifications en temps réel
  on<NotificationInterface>('receiveScheduleNotification', (notification) => {
    notificationStore.addNotification(notification)
    // Afficher une notification native si la permission est accordée
    showNativeNotification(notification)
  })

  on<UserInterface>('receiveUserUpdate', async () => {
    await useMyUserStore().GetUser()
  })
})

// Icônes par type d'information
const getInformationTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    schedule: 'mdi:calendar-clock',
    academic: 'mdi:school',
    administrative: 'mdi:file-document-edit',
    financial: 'mdi:cash-multiple',
    announcement: 'mdi:bullhorn',
    pedagogical: 'mdi:book-open-page-variant',
    alert: 'mdi:alert-circle',
    account: 'mdi:account-circle',
    system: 'mdi:cog',
  }
  return icons[type] || 'mdi:information'
}

// Icônes par niveau d'avertissement
const getWarningIcon = (level: string | null) => {
  const icons: Record<string, string> = {
    critical: 'mdi:alert-octagon',
    warning: 'mdi:alert',
    info: 'mdi:information',
  }
  return icons[level || 'info']
}

// Labels pour les niveaux d'avertissement
const getWarningLabel = (level: string | null) => {
  const labels: Record<string, string> = {
    critical: 'Urgent',
    warning: 'Important',
    info: 'Info',
  }
  return labels[level || 'info']
}

// Labels pour les catégories
const getCategoryLabel = (type: string) => {
  const labels: Record<string, string> = {
    schedule: 'Emploi du temps',
    academic: 'Académique',
    administrative: 'Administratif',
    financial: 'Financier',
    announcement: 'Annonce',
    pedagogical: 'Pédagogique',
    alert: 'Alerte',
    account: 'Compte',
    system: 'Système',
  }
  return labels[type] || 'Général'
}

// Formatage de la date
const formatDate = (date: Date) => {
  const now = new Date()
  const notifDate = new Date(date)
  const diffMs = now.getTime() - notifDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `${diffMins} min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}j`
  return notifDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// Vérifier si le message est long (plus de 120 caractères)
const isMessageLong = (message: string) => {
  return message.length > 120
}

// Tronquer le message
const truncateMessage = (message: string, expanded: boolean) => {
  if (!isMessageLong(message) || expanded) return message
  return message.slice(0, 120) + '...'
}

// Toggle l'expansion d'une notification
const toggleExpand = (notificationId: string, event: Event) => {
  event.stopPropagation()
  if (expandedNotifications.value.has(notificationId)) {
    expandedNotifications.value.delete(notificationId)
  } else {
    expandedNotifications.value.add(notificationId)
  }
}

// Vérifier si une notification est expandée
const isExpanded = (notificationId: string) => {
  return expandedNotifications.value.has(notificationId)
}

// Gestion du clic sur une notification
const handleNotificationClick = (notification: NotificationInterface & { seen: boolean }) => {
  if (notification.linkTo) {
    router.push(notification.linkTo)
    notificationStore.toggleNotificationDropdown()
  }
}

// Écouter les notifications en temps réel
onMounted(() => {
  on<NotificationInterface>('receiveScheduleNotification', (notification) => {
    notificationStore.addNotification(notification)
    // Afficher une notification native si la permission est accordée
    showNativeNotification(notification)
  })

  on<UserInterface>('receiveUserUpdate', async () => {
    await useMyUserStore().GetUser()
  })
})


</script>

<style scoped>
/* ===== VARIABLES ===== */
.notifications-container {
  --critical-color: #ef4444;
  --critical-bg: #fef2f2;
  --warning-color: #f59e0b;
  --warning-bg: #fffbeb;
  --info-color: #3b82f6;
  --info-bg: #eff6ff;
  --success-color: #10b981;
  --success-bg: #ecfdf5;
}

/* ===== CONTAINER ===== */
.notifications-container {
  position: relative;
  display: inline-block;
}

/* ===== TRIGGER BUTTON ===== */
.notification-trigger {
  position: relative;
  background: linear-gradient(135deg, var(--primary-extra-light) 0%, rgba(99, 102, 241, 0.1) 100%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: var(--primary-color);
}

.notification-trigger:hover {
  background: linear-gradient(135deg, var(--primary-color-light) 0%, rgba(99, 102, 241, 0.2) 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.notification-trigger .icon {
  font-size: 1.5rem;
  display: flex;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 20px;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
}

@keyframes badge-pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

/* ===== MODAL ===== */
.notifications-modal {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  max-width: 420px;
  height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notifications-modal.active {
  right: 0;
}

/* ===== HEADER ===== */
.notifications-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.notifications-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1;
}

.header-icon {
  font-size: 1.75rem;
  opacity: 0.9;
}

.notifications-header h3 {
  margin: 0;
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: -0.01em;
}

.header-subtitle {
  font-size: 0.8125rem;
  opacity: 0.85;
  font-weight: 400;
}

.close-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 10px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

/* ===== FILTERS ===== */
.notifications-filters {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 20px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--primary-extra-light);
}

.filter-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* ===== PERMISSION BANNER ===== */
.notification-permission-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-bottom: 1px solid #bfdbfe;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%);
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.banner-content {
  flex: 1;
}

.banner-content h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e40af;
}

.banner-content p {
  margin: 0;
  font-size: 0.8125rem;
  color: #3b82f6;
  line-height: 1.4;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.banner-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.banner-btn.dismiss {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 0.5rem;
}

.banner-btn.dismiss:hover {
  background: rgba(59, 130, 246, 0.2);
}

.banner-btn.activate {
  background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.banner-btn.activate:hover {
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

/* ===== NOTIFICATIONS LIST ===== */
.notifications-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ===== EMPTY STATE ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 3rem 2rem;
  text-align: center;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.empty-icon {
  font-size: 2.5rem;
  color: #94a3b8;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
  color: #9ca3af;
}

/* ===== NOTIFICATION CARD ===== */
.notification-card {
  position: relative;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification-card.clickable {
  cursor: pointer;
}

.notification-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
}

/* Level Indicator (left border) */
.level-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 4px 0 0 4px;
}

.level-indicator.level-critical {
  background: linear-gradient(180deg, var(--critical-color) 0%, #dc2626 100%);
}

.level-indicator.level-warning {
  background: linear-gradient(180deg, var(--warning-color) 0%, #d97706 100%);
}

.level-indicator.level-info {
  background: linear-gradient(180deg, var(--info-color) 0%, #2563eb 100%);
}

/* Critical level styling */
.notification-card.level-critical {
  background: linear-gradient(135deg, var(--critical-bg) 0%, #fee2e2 100%);
  border: 1px solid #fecaca;
}

.notification-card.level-critical.unread {
  animation: critical-pulse 2s ease-in-out infinite;
}

@keyframes critical-pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

/* Warning level styling */
.notification-card.level-warning {
  background: linear-gradient(135deg, var(--warning-bg) 0%, #fef3c7 100%);
  border: 1px solid #fde68a;
}

/* ===== NOTIFICATION ICON ===== */
.notification-icon-wrapper {
  width: 48px;
  height: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  font-size: 1.375rem;
  transition: all 0.3s;
}

/* Type colors */
.notification-icon-wrapper.type-schedule {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

.notification-icon-wrapper.type-academic {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: #7c3aed;
}

.notification-icon-wrapper.type-administrative {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
}

.notification-icon-wrapper.type-financial {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #059669;
}

.notification-icon-wrapper.type-announcement {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #db2777;
}

.notification-icon-wrapper.type-pedagogical {
  background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
  color: #0d9488;
}

.notification-icon-wrapper.type-alert {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
}

.notification-icon-wrapper.type-account {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #d97706;
}

.notification-icon-wrapper.type-system {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
}

/* ===== NOTIFICATION BODY ===== */
.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.notification-title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.warning-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 20px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
  flex-shrink: 0;
}

.warning-pill.pill-critical {
  background: linear-gradient(135deg, var(--critical-color) 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.warning-pill.pill-warning {
  background: linear-gradient(135deg, var(--warning-color) 0%, #d97706 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.notification-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: all 0.3s ease;
}

.notification-message.expanded {
  -webkit-line-clamp: unset;
  max-height: none;
}

/* Bouton d'expansion */
.expand-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  margin-bottom: 0.5rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background: var(--primary-extra-light);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.expand-btn svg {
  font-size: 0.875rem;
  transition: transform 0.2s ease;
}

.notification-card.clickable .expand-btn {
  z-index: 2;
  position: relative;
}

/* ===== NOTIFICATION META ===== */
.notification-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-category,
.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.meta-category {
  background: #f3f4f6;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-weight: 500;
}

.meta-time {
  color: #9ca3af;
}

/* ===== UNREAD DOT ===== */
.unread-dot {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 10px;
  height: 10px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #4f46e5 100%);
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* ===== FOOTER ===== */
.notifications-footer {
  padding: 1rem 1.25rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-extra-light);
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: var(--primary-color);
  color: white;
}

.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.625rem;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
  line-height: 1.4;
}

.footer-info :deep(svg) {
  flex-shrink: 0;
  font-size: 1rem;
  color: #94a3b8;
}

/* ===== OVERLAY ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: all;
}

/* ===== ANIMATIONS ===== */
.notification-list-enter-active {
  animation: slideIn 0.3s ease-out;
}

.notification-list-leave-active {
  animation: slideOut 0.2s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }

  to {
    opacity: 0;
    transform: translateX(-20px);
  }
}

/* ===== SCROLLBAR ===== */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: transparent;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 480px) {
  .notifications-modal {
    max-width: 100%;
  }

  .notification-card {
    padding: 0.875rem;
  }

  .notification-icon-wrapper {
    width: 42px;
    height: 42px;
    min-width: 42px;
    font-size: 1.25rem;
  }

  .notifications-filters {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .filter-btn {
    white-space: nowrap;
  }
}
</style>
