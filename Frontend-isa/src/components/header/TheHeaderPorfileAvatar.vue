<template>
  <div class="profile-wrapper" @click.stop="toggleProfileDropdown" :class="{ active: showProfileDropdown }"
    ref="profileWrapper">
    <!-- Trigger - Version compacte sur mobile -->
    <div class="user-profile">
      <!-- <div class="avatar-container" v-if="user.avatar">
        <img :src="user.avatar" :alt="user.name" class="user-avatar" />
        <div class="premium-badge"></div>
      </div> -->
      <div class="avatar-container">
        <div class="avatar-initials"><span>{{ user?.name[0] }}</span><span>{{ user?.firstName[0] }}</span></div>
      </div>

      <div class="user-meta" v-if="!isMobile">
        <span class="user-name">{{ user?.name }}</span>
        <span class="user-role">{{ user?.role }}</span>
      </div>

      <icon icon="mdi:chevron-down" class="dropdown-arrow" :class="{ rotated: showProfileDropdown }" />
    </div>

    <!-- Dropdown - Adapté pour mobile -->
    <transition name="dropdown-transition">
      <div v-if="showProfileDropdown" class="profile-dropdown" :class="{ 'mobile-view': isMobile }" @click.stop>
        <!-- Header avec infos utilisateur -->
        <div class="dropdown-header">
          <!-- <div class="dropdown-avatar" v-if="user?.avatar">
            <img :src="user?.avatar" :alt="user?.name" />
          </div> -->
          <div class="dropdown-avatar">
            <div class="avatar-initials"><span>{{ user?.name[0] }}</span><span>{{ user?.firstName[0] }}</span></div>
          </div>
          <div class="dropdown-user-info">
            <div class="name-wrapper">
              <span class="dropdown-name">{{ user?.name }} {{ user?.firstName }}</span>
              <span class="premium-tag">{{ user?.matricule }}</span>
            </div>
            <span class="dropdown-email">{{ user?.email }}</span>
            <div class="university-info">
              <icon :icon="IconRole" />
              <span>{{ user?.role }}</span>
            </div>
          </div>
        </div>

        <!-- Corps du dropdown -->
        <div class="dropdown-body">
          <div class="dropdown-section">
            <h4 class="section-title">Mon Compte</h4>


            <router-link :to="{ path: '/settings' }" class="dropdown-item">
              <div class="item-icon">
                <icon icon="mdi:cog" />
              </div>
              <div class="item-content">
                <span>Paramètres</span>
                <small>Personnalisation</small>
              </div>
              <icon icon="mdi:chevron-right" class="item-arrow" />
            </router-link>
          </div>

          <div class="dropdown-section">
            <h4 class="section-title">Support</h4>

            <router-link to="/help" class="dropdown-item">
              <div class="item-icon">
                <icon icon="mdi:help-circle" />
              </div>
              <div class="item-content">
                <span>Aide</span>
                <small>FAQ et guide utilisateur</small>
              </div>
              <icon icon="mdi:chevron-right" class="item-arrow" />
            </router-link>

            <router-link to="/contact" class="dropdown-item">
              <div class="item-icon">
                <icon icon="mdi:account-question" />
              </div>
              <div class="item-content">
                <span>Contacter l'administration</span>
                <small>Support ou signaler un bug</small>
              </div>
              <icon icon="mdi:chevron-right" class="item-arrow" />
            </router-link>
          </div>

        </div>

        <!-- Footer avec bouton de déconnexion -->
        <div class="dropdown-footer">
          <button class="logout-btn" @click="logout">
            <icon icon="mdi:logout" />
            <span>Déconnexion sécurisée</span>
          </button>
          <div class="university-brand">
            <img src="/logo300x300.svg" alt="University Logo" class="university-logo" />
            <span class="version">v1.0.0</span>

          </div>
        </div>
      </div>
    </transition>

    <!-- Overlay pour mobile -->
    <div v-if="showProfileDropdown && isMobile" class="dropdown-overlay" @click.stop="toggleProfileDropdown"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Icon } from '@iconify/vue';
import type UserInterface from '@/interfaces/user.interfaces';
import { useMyUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const props = defineProps<{
  user: UserInterface | null;
}>()
const router = useRouter();
const showProfileDropdown = ref(false);
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < 768);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  // Fermer le dropdown si on passe en mode mobile et qu'il est ouvert
  if (isMobile.value && showProfileDropdown.value) {
    showProfileDropdown.value = false;
  }
};

const IconRole = computed(() => {
  if (props.user?.role.includes('admin')) return 'mdi:administrator'
  else if (props.user?.role.includes('superAdmin')) return 'mdi:administrator-outline'
  else if (props.user?.role.includes('professor')) return "fa-solid:chalkboard-teacher"
  else return 'mdi:account-student-outline'
})


const profileWrapper = ref<HTMLElement | null>(null);
const handleClickOutside = (event: MouseEvent) => {
  if (profileWrapper.value && !profileWrapper.value.contains(event.target as Node)) {
    showProfileDropdown.value = false;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  document.removeEventListener('click', handleClickOutside);
});


const toggleProfileDropdown = () => {
  showProfileDropdown.value = !showProfileDropdown.value;

};




const logout = async () => {
  try {
    await useMyUserStore().Logout();
    router.push('/login');
  } catch (error) {
    console.log(error);

  }
};
</script>

<style scoped>
.profile-wrapper {
  position: relative;
  z-index: 99;
}

/* Trigger styles */
.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem;
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--primary-extra-light);
  border: 1px solid var(--primary-color-light);
}

.user-profile:hover {
  background: var(--primary-color-light);
  box-shadow: var(--shadow-light);
}

.avatar-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: var(--rounded);
  object-fit: cover;
  border: 2px solid var(--white);
  box-shadow: var(--shadow-light);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: var(--rounded);
  background: var(--tertiary-light);
  border: 2px solid var(--white);
}

.status-indicator.online {
  background: var(--success);
}

.premium-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--secondary-color);
  color: white;
  width: 16px;
  height: 16px;
  border-radius: var(--rounded);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid var(--white);
}

.user-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--primary-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--tertiary-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-arrow {
  position: relative;
  transition: transform 0.3s ease;
  color: var(--primary-color);
  margin-left: 0.25rem;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown styles - Version desktop */
.profile-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 320px;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-dark);
  overflow: hidden;
  z-index: 1000;
  border: 1px solid var(--gray-lighter);
}

.dropdown-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.dropdown-avatar {
  display: flex;
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  border-radius: var(--rounded);
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.status-indicator-lg {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  border-radius: var(--rounded);
  background: var(--tertiary-light);
  border: 2px solid var(--primary-color);
}

.status-indicator-lg.online {
  background: var(--success-light);
}

.dropdown-user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-name {
  font-weight: 600;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.premium-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
}

.premium-tag::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background: gold;
  border-radius: var(--rounded);
}

.dropdown-email {
  font-size: 0.8rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.university-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.university-info svg {
  font-size: 1rem;
  flex-shrink: 0;
}

.dropdown-body {
  padding: 0.75rem 0;
  max-height: 60vh;
  overflow-y: auto;
}

.dropdown-section {
  margin-bottom: 0.5rem;
}

.section-title {
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--tertiary-dark);
  font-weight: 600;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: var(--black);
  transition: all 0.2s ease;
  gap: 1rem;
}

.dropdown-item:hover {
  background: var(--tertiary-extra-light);
}

.item-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius);
  background: var(--primary-extra-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-content span {
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-content small {
  font-size: 0.75rem;
  color: var(--tertiary-dark);
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-arrow {
  color: var(--tertiary-light);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.dropdown-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-lighter);
  margin-top: 0.5rem;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--tertiary-extra-light);
  border: none;
  border-radius: var(--radius);
  color: var(--error);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--error-light);
  color: var(--error-dark);
}

.university-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-lighter);
}

.university-logo {
  height: 24px;
  opacity: 0.8;
}

.version {
  font-size: 0.7rem;
  color: var(--tertiary-light);
}

.avatar-initials {
  background-color: var(--secondary-color);
  width: 100%;
  height: 100%;
  border-radius: var(--rounded);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
}

/* Version mobile */
@media (max-width: 767px) {

  .dropdown-arrow {
    position: absolute;
    transition: transform 0.3s ease;
    color: var(--primary-color);
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);

    margin-left: 0.25rem;
    flex-shrink: 0;
  }

  .dropdown-arrow.rotated {
    transform: rotate(180deg) translateX(50%);
  }

  .profile-dropdown.mobile-view {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 80vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.15);
  }

  .dropdown-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .user-profile {
    padding: 0.25rem;
    border-radius: var(--rounded);
  }

  .dropdown-header {
    padding: 1.25rem;
  }

  .dropdown-body {
    max-height: 60vh;
  }
}

/* Animations */
.dropdown-transition-enter-active {
  transition: all 0.3s ease-out;
}

.dropdown-transition-leave-active {
  transition: all 0.2s ease-in;
}

.dropdown-transition-enter-from,
.dropdown-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.mobile-view.dropdown-transition-enter-from,
.mobile-view.dropdown-transition-leave-to {
  transform: translateY(100%);
}
</style>
