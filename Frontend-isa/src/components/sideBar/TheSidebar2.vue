<template>
  <div class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">
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
      <nav class="sidebar__nav">
        <div v-for="(section, index) in navSections" :key="index" class="nav-section">
          <div class="section-header" @click="toggleSection(index)">
            <div class="icon-wrapper">
              <Icon :icon="section.icon" class="section-icon" />
            </div>
            <transition name="slide-fade">
              <span v-if="!isCollapsed" class="section-title">{{ section.title }}</span>
            </transition>
            <transition name="fade">
              <Icon v-if="!isCollapsed"
                :icon="openSections.includes(index) ? 'material-symbols:keyboard-arrow-up-rounded' : 'material-symbols:keyboard-arrow-down-rounded'"
                class="chevron" />
            </transition>
          </div>

          <div v-show="!isCollapsed && openSections.includes(index)" class="section-links">
            <a v-for="(link, linkIndex) in section.links" :key="linkIndex" href="#" class="sidebar__link"
              :class="{ 'active': activeLink === `${index}-${linkIndex}` }">
              <span class="link-indicator"></span>
              <Icon :icon="link.icon" class="link-icon" />
              <transition name="slide-fade">
                <span v-if="!isCollapsed" class="link-text">{{ link.label }}</span>
              </transition>
            </a>
          </div>

        </div>
      </nav>
    </div>

    <!-- Footer institutionnel -->
    <div class="sidebar__footer">
      <a href="/aide" class="help-link">
        <Icon icon="material-symbols:help" />
        <transition name="fade">
          <span v-if="!isCollapsed">Aide & Support</span>
        </transition>
      </a>
      <div class="copyright">
        <Icon icon="material-symbols:copyright-rounded" />
        <transition name="fade">
          <span v-if="!isCollapsed">Tous droits réservés</span>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'


const isCollapsed = ref(false)
const activeLink = ref('0-0')
const openSections = ref([0])

const navSections = [
  {
    title: 'Utilisateurs',
    icon: 'material-symbols:group-rounded',
    links: [
      { label: 'Étudiants', icon: 'material-symbols:school-outline-rounded' },
      { label: 'Enseignants', icon: 'material-symbols:person-book-outline-rounded' },
      { label: 'Administration', icon: 'material-symbols:admin-panel-settings-outline-rounded' },
      { label: 'Permissions', icon: 'material-symbols:lock-outline-rounded' }
    ]
  },
  {
    title: 'Logistiques',
    icon: 'material-symbols:precision-manufacturing-outline-rounded',
    links: [
      { label: 'Salles de cours', icon: 'material-symbols:meeting-room-outline-rounded' },
      { label: 'Réservations', icon: 'material-symbols:calendar-month-outline-rounded' },
      { label: 'Matériel', icon: 'material-symbols:computer-outline-rounded' },
      { label: 'Maintenance', icon: 'material-symbols:engineering-outline-rounded' }
    ]
  }
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
</script>

<style scoped>
.sidebar {
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 80px;
  --header-height: 70px;
  --footer-height: 90px;

  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: linear-gradient(to bottom,
      var(--primary-darker) 0%,
      var(--primary-dark) 100%);
  color: var(--white);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
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
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
}

.help-link {
  display: flex;
  align-items: center;
  color: var(--gray-lighter);
  text-decoration: none;
  padding: 0.7rem 1rem;
  border-radius: var(--radius);
  transition: all 0.3s;
  margin-bottom: 0.8rem;
}

.help-link:hover {
  color: var(--white);
  background: rgba(255, 255, 255, 0.05);
}

.help-link> :first-child {
  margin-right: 0.8rem;
  font-size: 1.2rem;
}

.copyright {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--gray-light);
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.copyright> :first-child {
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
