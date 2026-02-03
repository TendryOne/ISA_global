<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
    <!-- Header élégant avec titre "Dashboard" -->
    <div class="sidebar__header">
      <transition name="fade">
        <h3 v-if="!isCollapsed" class="dashboard-title">Dashboard</h3>
      </transition>
      <button class="sidebar__toggle" @click="toggleCollapse">
        <Icon :icon="isCollapsed ? 'material-symbols:menu-rounded' : 'material-symbols:chevron-left-rounded'
          " />
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
        <div v-for="(section, index) in navSections" :key="index" class="nav-section">
          <template v-if="hasRole(section.role)">
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
          </template>
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
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { useMyUserStore } from '@/stores/userStore'
import { RouterLink, useRoute } from 'vue-router'

const isCollapsed = ref(false)
const activeLink = ref('0-0')
const openSections = ref<number[]>([0])
const route = useRoute()
const store = useMyUserStore()
// Helper: comparaison robuste des rôles (l'interface User.role est typée atypiquement)
const hasRole = (sectionRole: string | string[]) => {
  const userRole = store.currentUser?.role as unknown as string | string[] | undefined
  if (!userRole) return false
  const sec = Array.isArray(sectionRole) ? sectionRole : [sectionRole]
  const usr = Array.isArray(userRole) ? userRole : [userRole]
  return usr.some((r) => sec.includes(r))
}

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
  // {
  //   role: ['professor'],
  //   title: 'Annonces & Communications',
  //   icon: 'material-symbols:group-outline',
  //   links: [
  //     {
  //       label: 'Annonces',
  //       icon: 'material-symbols:campaign-outline',
  //       slug: '/professor/announcements',
  //     },
  //   ],
  // },

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

// Déterminer et ouvrir la section/lien en fonction de la route active
const updateActiveFromRoute = () => {
  const path = route.path

  // Si on est exactement sur le dashboard, aucun lien de section n'est actif
  if (path === dashboardLink.value) {
    activeLink.value = ''
    return
  }

  let bestI: number | null = null
  let bestJ: number | null = null
  let bestLen = -1

  navSections.forEach((section, i) => {
    if (!hasRole(section.role)) return
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
  } else {
    activeLink.value = ''
  }
}

// Helper pour le template
const isSectionActive = (i: number) => activeLink.value !== '' && activeLink.value.startsWith(`${i}-`)

// Vérifier si le lien d'aide est actif
const isHelpLinkActive = computed(() => {
  const path = route.path
  return path === '/report' || path.startsWith('/report/')
})

// Lien Dashboard selon le rôle
const dashboardLink = computed(() => {
  const userRole = store.currentUser?.role as unknown as string | string[] | undefined
  if (!userRole) return '/'

  const role = Array.isArray(userRole) ? userRole[0] : userRole

  if (role === 'student') return '/student'
  if (role === 'professor') return '/professor'
  if (role === 'admin' || role === 'superAdmin') return '/admin'

  return '/'
})

// Vérifier si le dashboard est actif
const isDashboardActive = computed(() => {
  const path = route.path
  const link = dashboardLink.value
  return path === link
})

const isMobile = ref<boolean>(false)

const checkMobile = () => {
  if (window.innerWidth < 1000) {
    isMobile.value = true
    isCollapsed.value = true
  } else {
    isMobile.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  updateActiveFromRoute()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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

/* Dashboard Link */
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
  background-color: var(--primary-color);
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
  color: var(--tertiary-light);
  transition: transform 0.3s;
}

.section-links {
  padding-left: 4rem;
  padding-right: 1rem;
  padding-top: 0.35rem;
  /* Espace au-dessus du premier lien */
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

/* Un peu d'air lorsque le premier lien est actif ou au top */
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

/* Lien d'aide amélioré */
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

/* Copyright */
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

/* Animations */
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

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: var(--sidebar-collapsed-width);
  }

  .sidebar:not(.sidebar--collapsed) {
    width: 280px;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.3);
  }
}
</style>
