<template>
  <!-- Version desktop -->
  <div v-if="!isMobile" class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <!-- Header élégant avec titre "Dashboard" -->
    <div class="sidebar__header">
      <transition name="fade">
        <h3 v-if="!isCollapsed" class="dashboard-title">Dashboard</h3>
      </transition>
      <button class="sidebar__toggle" @click="toggleCollapse">
        <Icon :icon="isCollapsed ? 'material-symbols:menu-rounded' : 'material-symbols:chevron-left-rounded'" />
      </button>
    </div>

    <!-- Contenu principal avec effet de profondeur -->
    <div class="sidebar__content">
      <!-- Lien Dashboard -->
      <RouterLink :to="dashboardLink" class="dashboard-link"
        :class="{ collapsed: isCollapsed, active: isDashboardActive }">
        <div class="dashboard-icon-wrapper">
          <Icon icon="material-symbols:dashboard-outline" class="dashboard-icon" />
        </div>
        <transition name="slide-fade">
          <span v-if="!isCollapsed" class="dashboard-text">Tableau de bord</span>
        </transition>
        <div v-if="isCollapsed" class="dashboard-tooltip">Dashboard</div>
      </RouterLink>

      <nav class="sidebar__nav">
        <div v-for="(section, index) in filteredNavSections" :key="index" class="nav-section">
          <div class="section-header" :class="{ active: isSectionActive(index) }" @click="toggleSection(index)">
            <div class="icon-wrapper">
              <Icon :icon="section.icon" class="section-icon" />
            </div>
            <transition name="slide-fade">
              <span v-if="!isCollapsed" class="section-title">{{ section.title }}</span>
            </transition>
            <transition name="fade">
              <Icon v-if="!isCollapsed" :icon="openSections.includes(index)
                ? 'material-symbols:keyboard-arrow-up-rounded'
                : 'material-symbols:keyboard-arrow-down-rounded'
                " class="chevron" />
            </transition>
          </div>

          <div v-show="!isCollapsed && openSections.includes(index)" class="section-links">
            <RouterLink v-for="(link, linkIndex) in section.links" :key="linkIndex" :to="link.slug"
              class="sidebar__link" :aria-current="activeLink === `${index}-${linkIndex}` ? 'page' : undefined"
              :class="{ active: activeLink === `${index}-${linkIndex}` }">
              <span class="link-indicator"></span>
              <Icon :icon="link.icon" class="link-icon" />
              <transition name="slide-fade">
                <span v-if="!isCollapsed" class="link-text">{{ link.label }}</span>
              </transition>
            </RouterLink>
          </div>
        </div>
      </nav>
    </div>

    <!-- Footer institutionnel -->
    <div class="sidebar__footer">
      <div class="footer-content">
        <!-- Lien d'aide amélioré -->
        <RouterLink to="/report" class="help-link" :class="{ collapsed: isCollapsed, active: isHelpLinkActive }">
          <div class="help-icon-wrapper">
            <Icon icon="material-symbols:help-outline" class="help-icon" />
          </div>
          <transition name="fade-slide">
            <span v-if="!isCollapsed" class="help-text">Aide & Support</span>
          </transition>
          <div v-if="isCollapsed" class="help-tooltip">Aide</div>
        </RouterLink>

        <!-- Copyright -->
        <div class="copyright" :class="{ collapsed: isCollapsed }">
          <Icon icon="material-symbols:copyright" class="copyright-icon" />
          <transition name="fade-slide">
            <span v-if="!isCollapsed">Tous droits réservés</span>
          </transition>
        </div>
      </div>
    </div>
  </div>


  <div v-else class="mobile-layout">
    <!-- <header class="mobile-header-main">
      <div class="mobile-header-left">
        <button class="mobile-menu-button" @click="toggleMobileMenu">
          <Icon :icon="isMenuOpen ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'" />
        </button>
        <router-link to="/" class="mobile-university-logo">
          <img :src="universityLogo" alt="Logo Université" class="mobile-logo-img" />
        </router-link>
      </div>

      <div class="mobile-header-right">
        <TheHeaderNotification :notifications="notifications" class="mobile-header-action" />
        <div class="mobile-divider"></div>
        <TheHeaderProfileAvatar :user="store.currentUser" university-logo="/logo-300x300.svg"
          class="mobile-header-action" />
      </div>
    </header> -->


    <div v-if="isCollapsed" class="mobile-overlay" @click="controlStore.toggleSidebar()"></div>
    <div class="mobile-sidebar" :class="{ 'mobile-sidebar--open': isCollapsed }">
      <div class="mobile-sidebar__header">
        <div class="mobile-user-info">
          <div class="mobile-user-avatar">
            <Icon icon="material-symbols:account-circle" />
          </div>
          <div class="mobile-user-details">
            <h3>{{ store.currentUser?.firstName }} {{ store.currentUser?.name }}</h3>
            <span class="mobile-user-role">{{ formatUserRole(store.currentUser?.role) }}</span>
          </div>
        </div>
        <button class="mobile-close-button" @click="controlStore.toggleSidebar()">
          <Icon icon="material-symbols:close-rounded" />
        </button>
      </div>

      <div class="mobile-sidebar__content">
        <!-- Navigation principale mobile -->
        <nav class="mobile-nav">
          <!-- Lien Dashboard mobile -->
          <RouterLink :to="dashboardLink" class="mobile-dashboard-nav-link" @click="controlStore.toggleSidebar()"
            :class="{ active: isDashboardActive }">
            <Icon icon="material-symbols:dashboard-outline" class="mobile-dashboard-icon" />
            <span>Tableau de bord</span>
          </RouterLink>

          <div v-for="(section, index) in filteredNavSections" :key="index" class="mobile-nav-section">
            <div class="mobile-section-header" @click="toggleMobileSection(index)">
              <div class="mobile-section-header__left">
                <Icon :icon="section.icon" class="mobile-section-icon" />
                <span class="mobile-section-title">{{ section.title }}</span>
              </div>
              <Icon :icon="openMobileSections.includes(index)
                ? 'material-symbols:keyboard-arrow-up-rounded'
                : 'material-symbols:keyboard-arrow-down-rounded'
                " class="mobile-chevron" />
            </div>

            <div v-show="openMobileSections.includes(index)" class="mobile-section-links">
              <RouterLink v-for="(link, linkIndex) in section.links" :key="linkIndex" :to="link.slug"
                class="mobile-nav-link" @click="controlStore.toggleSidebar()"
                :class="{ active: activeLink === `${index}-${linkIndex}` }">
                <Icon :icon="link.icon" class="mobile-link-icon" />
                <span class="mobile-link-text">{{ link.label }}</span>
                <div v-if="activeLink === `${index}-${linkIndex}`" class="mobile-link-indicator"></div>
              </RouterLink>
            </div>
          </div>
        </nav>

        <!-- Lien d'aide -->
        <RouterLink to="/report" class="mobile-help-link" @click="controlStore.toggleSidebar()"
          :class="{ active: isHelpLinkActive }">
          <Icon icon="material-symbols:help-outline" />
          <span>Aide & Support</span>
        </RouterLink>
      </div>

      <div class="mobile-sidebar__footer">
        <div class="mobile-copyright">
          <Icon icon="material-symbols:copyright" />
          <span>Tous droits réservés</span>
        </div>
      </div>
    </div>

    <!-- Navigation inférieure mobile -->


    <!-- Contenu principal avec padding pour éviter le chevauchement -->
    <div class="mobile-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useMyUserStore } from '@/stores/userStore'
import { RouterLink, useRoute } from 'vue-router'
import TheHeaderNotification from '../header/TheHeaderNotification.vue'
import TheHeaderProfileAvatar from '../header/TheHeaderPorfileAvatar.vue'
import useControlStore from '@/stores/control'
import { storeToRefs } from 'pinia'



const activeLink = ref('0-0')
const openSections = ref<number[]>([0])
const openMobileSections = ref<number[]>([0])
const route = useRoute()
const store = useMyUserStore()

const universityLogo = '/logo-write.svg'

const notifications = ref([
  {
    id: 1,
    senderName: 'Dr. Einstein',
    senderAvatar: 'https://i.pravatar.cc/150?img=5',
    message: 'Vous a invité à rejoindre le projet "Physique Quantique"',
    time: '10 min',
    read: false,
  },
  {
    id: 2,
    senderName: 'Système',
    senderAvatar: '',
    message: 'Votre cours de chimie a été programmé pour demain',
    time: '1h',
    read: true,
  },
  {
    id: 3,
    senderName: 'Étudiant Dupont',
    senderAvatar: 'https://i.pravatar.cc/150?img=10',
    message: 'A soumis un devoir dans "Chimie Avancée"',
    time: '3h',
    read: false,
  },
])

// Navigation inférieure pour mobile
const mobileBottomNav = computed(() => {
  const userRole = store.currentUser?.role as unknown as string | string[] | undefined
  if (!userRole) return []

  const role = Array.isArray(userRole) ? userRole[0] : userRole

  const commonItems = [
    { to: dashboardLink.value, icon: 'material-symbols:dashboard-outline', label: 'Accueil' },
    { to: '/report', icon: 'material-symbols:help-outline', label: 'Aide' },
  ]

  if (role === 'student') {
    return [
      commonItems[0],
      { to: '/student/courses', icon: 'material-symbols:menu-book-outline', label: 'Cours' },
      { to: '/student/schedule', icon: 'material-symbols:calendar-month-outline-rounded', label: 'EDT' },
      { to: '/student/grades', icon: 'material-symbols:grade', label: 'Notes' },
      commonItems[1]
    ]
  }

  if (role === 'professor') {
    return [
      commonItems[0],
      { to: '/professor/modules', icon: 'material-symbols:menu-book-outline', label: 'Cours' },
      { to: '/professor/schedule', icon: 'material-symbols:calendar-month-outline-rounded', label: 'EDT' },
      commonItems[1]
    ]
  }

  if (role === 'admin' || role === 'superAdmin') {
    return [
      commonItems[0],
      { to: '/admin/users/students', icon: 'material-symbols:group-outline', label: 'Utilisateurs' },
      { to: '/admin/course', icon: 'material-symbols:menu-book-outline', label: 'Cours' },
      { to: '/admin/fees', icon: 'material-symbols:payments-outline', label: 'Frais' },
      commonItems[1]
    ]
  }

  return commonItems
})

const hasRole = (sectionRole: string | string[]) => {
  const userRole = store.currentUser?.role as unknown as string | string[] | undefined
  if (!userRole) return false
  const sec = Array.isArray(sectionRole) ? sectionRole : [sectionRole]
  const usr = Array.isArray(userRole) ? userRole : [userRole]
  return usr.some((r) => sec.includes(r))
}

// Filtrer les sections selon le rôle
const filteredNavSections = computed(() => {
  return navSections.filter(section => hasRole(section.role))
})

const navSections = [
  // === ÉTUDIANT ===
  {
    role: ['student'],
    title: 'Scolarité',
    icon: 'material-symbols:school-outline-rounded',
    links: [
      { label: 'Mes Cours', icon: 'material-symbols:menu-book-outline', slug: '/student/courses' },
      {
        label: 'Emploi du Temps',
        icon: 'material-symbols:calendar-month-outline-rounded',
        slug: '/student/schedule',
      },
      { label: 'Mes Notes', icon: 'material-symbols:grade', slug: '/student/grades' },
    ],
  },
  {
    role: ['student'],
    title: 'Frais & Paiements',
    icon: 'material-symbols:payments-outline',
    links: [
      { label: 'Suivi des frais de scolarité', icon: 'material-symbols:receipt-outline', slug: '/student/fees' },
      { label: 'Frais de scolarité', icon: 'mdi:cash-marker', slug: '/student/newFees' },
    ],
  },
  {
    role: ['student'],
    title: 'Services Étudiants',
    icon: 'material-symbols:handshake-outline-rounded',
    links: [
      {
        label: 'Demande de Document',
        icon: 'material-symbols:description-outline',
        slug: '/student/administrative-requests',
      },
    ],
  },

  // === ENSEIGNANT ===
  {
    role: ['professor'],
    title: 'Enseignement',
    icon: 'material-symbols:school-outline-rounded',
    links: [
      {
        label: 'Mes Cours',
        icon: 'material-symbols:menu-book-outline',
        slug: '/professor/modules',
      },
      {
        label: 'Emploi du Temps',
        icon: 'material-symbols:calendar-month-outline-rounded',
        slug: '/professor/schedule',
      },
    ],
  },

  // === ADMINISTRATEUR ===
  {
    role: ['admin', 'superAdmin'],
    title: 'Admissions',
    icon: 'clarity:list-line',
    links: [
      {
        label: 'Utilisateurs pre-inscrits',
        icon: 'material-symbols:person-add-outline-rounded',
        slug: '/admin/pre-inscription',
      },
      { label: 'Liste des Admis', icon: 'mdi:account-check-outline', slug: '/admin/admission' },
      {
        label: 'Utilisateurs inscrits',
        icon: 'fluent:person-add-32-filled',
        slug: '/admin/subscribed',
      },
    ],
  },

  {
    role: ['admin', 'superAdmin'],
    title: 'Gestion des cours',
    icon: 'material-symbols:menu-book-outline',
    links: [
      {
        label: 'Emploi du temps',
        icon: 'material-symbols:calendar-month-outline-rounded',
        slug: '/admin/schedule',
      },
      { label: 'Programmes Académiques', icon: 'mdi:school-outline', slug: '/admin/course' },
    ],
  },
  {
    role: ['admin', 'superAdmin'],
    title: 'Annonces & Communications',
    icon: 'material-symbols:campaign-outline',
    links: [
      {
        label: 'Annonces',
        icon: 'material-symbols:campaign-outline',
        slug: '/admin/announcements',
      },
    ],
  },

  {
    role: ['admin', 'superAdmin'],
    title: 'Frais de Scolarité',
    icon: 'material-symbols:payments-outline',
    links: [
      {
        label: 'Gestion des frais de scolarite',
        icon: 'material-symbols:money-bag',
        slug: '/admin/fees',
      },
      {
        label: 'Suivi des paiements',
        icon: 'material-symbols:receipt-outline',
        slug: '/admin/suivi-paiements',
      },
    ],
  },
  {
    role: ['admin', 'superAdmin'],
    title: 'Gestions des notes',
    icon: 'clarity:star-line',
    links: [
      { label: "Notes des étudiants", icon: 'mdi:note-outline', slug: '/admin/grades' },
    ],
  },

  {
    role: ['admin', 'superAdmin'],
    title: 'Gestion Utilisateurs',
    icon: 'material-symbols:group-outline',
    links: [
      {
        label: 'Étudiants',
        icon: 'material-symbols:school-outline-rounded',
        slug: '/admin/users/students',
      },
      {
        label: 'Enseignants',
        icon: 'fluent:person-ribbon-20-filled',
        slug: '/admin/users/teachers',
      },
      {
        label: 'Personnel Administratif',
        icon: 'material-symbols:badge-outline-rounded',
        slug: '/admin/users/departments',
      },
    ],
  },
  {
    role: ['admin', 'superAdmin'],
    title: 'Gestion Admnistrative',
    icon: 'material-symbols:admin-panel-settings-outline-rounded',
    links: [
      { label: 'Promotions', icon: 'mdi:school-outline', slug: '/admin/promotions' },
      { label: 'demandes administratives', icon: 'material-symbols:assignment-outline', slug: '/admin/administrative-requests' },

    ],
  },

  // === SUPER ADMIN ===
  {
    role: ['superAdmin'],
    title: 'BUGS & LOGS',
    icon: 'material-symbols:settings-outline',
    links: [
      { label: 'Rapports de Bugs', icon: 'mdi:bug-outline', slug: '/admin/bug-reports' },
      { label: 'Logs Techniques', icon: 'material-symbols:list-alt-outline', slug: '/admin/logs' },
      { label: 'Paramètres Système', icon: 'material-symbols:settings-outline', slug: '/admin/settings' },
    ],
  },
]

const formatUserRole = (role: any) => {
  if (!role) return ''
  const roleStr = Array.isArray(role) ? role[0] : role
  const rolesMap: Record<string, string> = {
    'student': 'Étudiant',
    'professor': 'Enseignant',
    'admin': 'Administrateur',
    'superAdmin': 'Super Admin'
  }
  return rolesMap[roleStr] || roleStr
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}



const toggleSection = (index: number) => {
  if (isCollapsed.value) {
    isCollapsed.value = false
    setTimeout(() => toggleSection(index), 300)
    return
  }

  const sectionIndex = openSections.value.indexOf(index)
  if (sectionIndex > -1) {
    openSections.value.splice(sectionIndex, 1)
  } else {
    openSections.value.push(index)
  }
}

const toggleMobileSection = (index: number) => {
  const sectionIndex = openMobileSections.value.indexOf(index)
  if (sectionIndex > -1) {
    openMobileSections.value.splice(sectionIndex, 1)
  } else {
    openMobileSections.value.push(index)
  }
}

const updateActiveFromRoute = () => {
  const path = route.path

  if (path === dashboardLink.value) {
    activeLink.value = ''
    return
  }

  let bestI: number | null = null
  let bestJ: number | null = null
  let bestLen = -1

  filteredNavSections.value.forEach((section, i) => {
    section.links.forEach((link: { slug: string }, j: number) => {
      const slug = link.slug
      if (path === slug || path.startsWith(slug + '/')) {
        if (slug.length > bestLen) {
          bestI = i
          bestJ = j
          bestLen = slug.length
        }
      }
    })
  })

  if (bestI !== null && bestJ !== null) {
    activeLink.value = `${bestI}-${bestJ}`
    if (!openSections.value.includes(bestI)) openSections.value.push(bestI)
    if (!openMobileSections.value.includes(bestI)) openMobileSections.value.push(bestI)
  } else {
    activeLink.value = ''
  }
}

const isSectionActive = (i: number) => activeLink.value !== '' && activeLink.value.startsWith(`${i}-`)

const isHelpLinkActive = computed(() => {
  const path = route.path
  return path === '/report' || path.startsWith('/report/')
})

const dashboardLink = computed(() => {
  const userRole = store.currentUser?.role as unknown as string | string[] | undefined
  if (!userRole) return '/'

  const role = Array.isArray(userRole) ? userRole[0] : userRole

  if (role === 'student') return '/student'
  if (role === 'professor') return '/professor'
  if (role === 'admin' || role === 'superAdmin') return '/admin'

  return '/'
})

const isDashboardActive = computed(() => {
  const path = route.path
  const link = dashboardLink.value
  return path === link
})

const isBottomNavActive = (to: string) => {
  const path = route.path
  return path === to || path.startsWith(to + '/')
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const controlStore = useControlStore();
const { isMobile, isCollapsed } = storeToRefs(controlStore);

const checkMobile = () => {
  if (window.innerWidth < 1000) {
    isMobile.value = true
  } else {
    isMobile.value = false
    isCollapsed.value = false
    document.body.style.overflow = ''
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  updateActiveFromRoute()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.body.style.overflow = ''
})

watch(
  [() => route.path, () => store.currentUser?.role],
  () => {
    updateActiveFromRoute()
  },
  { immediate: true },
)
</script>

<style scoped>
/* Variables CSS */
:root {
  --primary-dark: #1a365d;
  --primary-darker: #0d1b2a;
  --primary-color-light: #4299e1;
  --primary-lighter: #63b3ed;
  --white: #ffffff;
  --gray-lighter: #cbd5e0;
  --gray-light: #a0aec0;
  --gray-50: #f7fafc;
  --gray-100: #edf2f7;
  --gray-600: #718096;
  --radius: 8px;
  --radius-lg: 12px;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Styles Desktop */
.sidebar {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --header-height: 70px;
  --footer-height: 90px;

  width: var(--sidebar-width);
  background: linear-gradient(to bottom, var(--primary-darker) 0%, var(--primary-dark) 100%);
  color: var(--white);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 10px 20px rgba(0, 0, 0, 0.2);
  height: 100%;
  position: relative;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar--collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar__header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--primary-dark);
}

.dashboard-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin: 1rem 1rem 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  color: var(--white);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dashboard-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.dashboard-link.active {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.15));
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dashboard-link.collapsed {
  padding: 1rem;
  margin: 1rem 1rem 0.5rem 1rem;
  justify-content: center;
}

.dashboard-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
}

.dashboard-icon {
  font-size: 1.5rem;
  color: var(--white);
}

.dashboard-text {
  font-size: 0.95rem;
  white-space: nowrap;
}

.dashboard-tooltip {
  position: absolute;
  left: calc(100% + 1rem);
  background: var(--primary-darker);
  color: var(--white);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.dashboard-link.collapsed:hover .dashboard-tooltip {
  opacity: 1;
}

.dashboard-title {
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
  background: linear-gradient(to right, var(--primary-lighter), var(--white));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar__toggle {
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: var(--primary-lighter);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar__toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--white);
  transform: scale(1.1);
}

.sidebar__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 0;
}

.sidebar__content::-webkit-scrollbar {
  width: 8px;
}

.sidebar__content::-webkit-scrollbar-track {
  background-color: var(--primary-dark);
}

.sidebar__content::-webkit-scrollbar-thumb {
  background-color: var(--primary-color-light);
  border-radius: 10px;
}

.nav-section {
  margin-bottom: 0.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.section-header.active {
  background: rgba(255, 255, 255, 0.08);
}

.section-header.active .icon-wrapper {
  background: var(--primary-color-light);
}

.section-header.active .section-title {
  color: var(--white);
}

.icon-wrapper {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  transition: all 0.3s;
}

.section-header:hover .icon-wrapper {
  background: var(--primary-color-light);
}

.section-icon {
  font-size: 1.2rem;
  color: var(--primary-lighter);
}

.section-title {
  font-weight: 500;
  font-size: 0.95rem;
  flex-grow: 1;
}

.chevron {
  color: var(--gray-light);
  transition: transform 0.3s;
}

.section-links {
  padding-left: 4rem;
  padding-right: 1rem;
  padding-top: 0.35rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  padding: 0.7rem 1rem;
  color: var(--gray-lighter);
  text-decoration: none;
  transition: all 0.3s;
  font-size: 0.9rem;
  position: relative;
  border-radius: var(--radius);
  margin-bottom: 0.3rem;
}

.section-links .sidebar__link:first-child {
  margin-top: 0.15rem;
}

.section-links .sidebar__link:first-child.active {
  margin-top: 0.35rem;
}

.sidebar__link:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar__link.active {
  color: var(--white);
  background: rgba(255, 255, 255, 0.08);
}

.sidebar__link.active .link-indicator {
  opacity: 1;
  width: 4px;
}

.link-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 0;
  background: var(--primary-lighter);
  border-radius: 0 var(--radius) var(--radius) 0;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.link-icon {
  margin-right: 0.8rem;
  font-size: 1.1rem;
}

.sidebar__footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.help-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--gray-lighter);
  transition: all 0.3s ease;
  position: relative;
}

.help-link.collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.help-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--primary-lighter);
}

.help-link.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--white);
}

.help-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background: var(--primary-lighter);
  border-radius: 0 var(--radius) var(--radius) 0;
}

.help-link.active .help-icon {
  color: var(--primary-lighter);
  transform: scale(1.1);
}

.help-icon-wrapper {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-icon {
  font-size: 1.4rem;
  transition: all 0.3s ease;
}

.help-link:hover .help-icon {
  transform: scale(1.1);
}

.help-text {
  margin-left: 0.75rem;
  font-size: 0.9rem;
}

.help-tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-dark);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius);
  font-size: 0.85rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: var(--shadow);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.help-tooltip::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid var(--primary-dark);
}

.help-link.collapsed:hover .help-tooltip {
  opacity: 1;
  left: calc(100% + 8px);
}

.copyright {
  display: flex;
  align-items: center;
  color: var(--gray-light);
  font-size: 0.75rem;
  padding: 0.5rem 1rem;
}

.copyright.collapsed {
  justify-content: center;
  padding: 0.5rem;
}

.copyright-icon {
  font-size: 1rem;
  margin-right: 0.5rem;
  opacity: 0.7;
}

/* Animations desktop */
.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}

.fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-5px);
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

/* =========================================== */
/* STYLES MOBILE */
/* =========================================== */

.mobile-layout {
  min-height: 100vh;
  background: var(--white);
}

/* Header mobile intégré */
.mobile-header-main {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: var(--white);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 1000;
}

.mobile-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-button {
  background: none;
  border: none;
  color: var(--primary-dark);
  font-size: 28px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-button:active {
  background: rgba(0, 0, 0, 0.05);
}

.mobile-university-logo {
  display: flex;
  align-items: center;
}

.mobile-logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.mobile-header-right {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 8px;
}

.mobile-divider {
  width: 1px;
  height: 32px;
  background: var(--gray-lighter);
  margin: 0 4px;
}

/* Style pour les composants du header dans la version mobile */
:deep(.mobile-header-action) {
  height: 100%;
  display: flex;
  align-items: center;
}

/* Overlay */
.mobile-overlay {
  position: fixed;
  top: 64px;
  /* Commence après le header */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Sidebar mobile */
.mobile-sidebar {
  position: fixed;
  top: 64px;
  /* Commence après le header */
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: var(--primary-dark);
  color: var(--white);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-sidebar--open {
  transform: translateX(0);
}

.mobile-sidebar__header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mobile-user-avatar {
  font-size: 48px;
  color: var(--primary-lighter);
}

.mobile-user-details h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.mobile-user-role {
  font-size: 12px;
  color: var(--gray-lighter);
  opacity: 0.8;
}

.mobile-close-button {
  background: none;
  border: none;
  color: var(--white);
  font-size: 28px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.mobile-close-button:active {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-sidebar__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

/* Navigation mobile */
.mobile-nav {
  padding: 0 8px;
}

.mobile-dashboard-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 12px;
  margin: 0 8px 12px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: var(--white);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.mobile-dashboard-nav-link:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.98);
}

.mobile-dashboard-nav-link.active {
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--primary-lighter);
}

.mobile-dashboard-icon {
  font-size: 20px;
}

.mobile-nav-section {
  margin-bottom: 4px;
}

.mobile-section-header {
  padding: 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.mobile-section-header:active {
  background: rgba(255, 255, 255, 0.05);
}

.mobile-section-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-section-icon {
  font-size: 20px;
  color: var(--primary-lighter);
}

.mobile-section-title {
  font-size: 15px;
  font-weight: 500;
}

.mobile-chevron {
  font-size: 20px;
  color: var(--gray-lighter);
  transition: transform 0.3s ease;
}

.mobile-section-links {
  padding-left: 44px;
  padding-right: 12px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  color: var(--gray-lighter);
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 2px;
  position: relative;
  transition: all 0.2s ease;
}

.mobile-nav-link:active {
  background: rgba(255, 255, 255, 0.05);
  transform: scale(0.98);
}

.mobile-nav-link.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--white);
}

.mobile-link-icon {
  font-size: 18px;
  margin-right: 12px;
  color: var(--primary-lighter);
}

.mobile-link-text {
  font-size: 14px;
  flex: 1;
}

.mobile-link-indicator {
  position: absolute;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-lighter);
}

/* Lien d'aide mobile */
.mobile-help-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  margin: 20px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  color: var(--white);
  text-decoration: none;
  font-size: 15px;
  transition: all 0.2s ease;
}

.mobile-help-link:active {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(0.98);
}

.mobile-help-link.active {
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid var(--primary-lighter);
}

/* Footer mobile sidebar */
.mobile-sidebar__footer {
  padding: 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-copyright {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--gray-lighter);
  font-size: 12px;
  opacity: 0.8;
}

/* Bottom navigation */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: var(--white);
  border-top: 1px solid var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 900;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  text-decoration: none;
  color: var(--gray-600);
  transition: all 0.2s ease;
  position: relative;
  padding: 8px 0;
}

.mobile-bottom-nav__item:active {
  background: var(--gray-50);
}

.mobile-bottom-nav__item.active {
  color: var(--primary-dark);
}

.mobile-bottom-nav__item.active::before {
  content: '';
  position: absolute;
  top: 0;
  width: 40%;
  height: 3px;
  background: var(--primary-dark);
  border-radius: 0 0 3px 3px;
}

.mobile-bottom-nav__icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.mobile-bottom-nav__label {
  font-size: 11px;
  font-weight: 500;
}

/* Contenu principal mobile */
.mobile-content {
  padding: 64px 0 72px 0;
  min-height: 100vh;
  background: var(--gray-50);
}

/* Animation pour le menu mobile */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

.mobile-sidebar--open {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar mobile */
.mobile-sidebar__content::-webkit-scrollbar {
  width: 4px;
}

.mobile-sidebar__content::-webkit-scrollbar-track {
  background: transparent;
}

.mobile-sidebar__content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

/* Responsive pour les tablettes */
@media (min-width: 768px) and (max-width: 1000px) {
  .mobile-sidebar {
    width: 70%;
    max-width: 280px;
  }

  .mobile-logo-img {
    height: 42px;
  }
}

/* Cacher la navigation desktop sur mobile */
@media (max-width: 1000px) {
  .sidebar {
    display: none;
  }
}

/* Responsive desktop */
@media (max-width: 768px) {
  .sidebar:not(.sidebar--collapsed) {
    width: 280px;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  }

  .mobile-header-main {
    padding: 0.75rem 1rem;
    height: 56px;
  }

  .mobile-sidebar {
    top: 56px;
  }

  .mobile-overlay {
    top: 56px;
  }

  .mobile-logo-img {
    height: 32px;
  }

  .mobile-divider {
    height: 24px;
  }

  .mobile-content {
    padding: 56px 0 72px 0;
  }
}
</style>