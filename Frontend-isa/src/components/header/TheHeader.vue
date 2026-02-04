<template>
  <header class="header">
    <!-- Partie gauche avec logo -->
    <div class="header-left">
      <button class="mobile-menu-button" @click="controlStore.toggleSidebar()" v-if="isMobile">
        <Icon :icon="isCollapsed ? 'material-symbols:close-rounded' : 'material-symbols:menu-rounded'" />
      </button>
      <router-link to="/" class="university-logo">
        <img :src="universityLogo" alt="Logo Université" class="logo-img" />
      </router-link>
    </div>

    <!-- Partie droite avec notifications et profil -->
    <div class="header-right">
      <div class="actions-container">
        <TheHeaderNotification :notifications="notifications" class="header-action" />
        <div class="divider"></div>
        <TheHeaderProfileAvatar :user="useMyUserStore().currentUser" university-logo="/logo-300x300.svg"
          class="header-action" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TheHeaderNotification from './TheHeaderNotification.vue'
import TheHeaderProfileAvatar from './TheHeaderPorfileAvatar.vue'
import { useMyUserStore } from '@/stores/userStore'
import useControlStore from '@/stores/control';
import { storeToRefs } from 'pinia';
import { Icon } from '@iconify/vue';
const controlStore = useControlStore();
const { isCollapsed, isMobile } = storeToRefs(controlStore);
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
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background-color: var(--white);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 64px;
}

.mobile-menu-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 42px;
  width: auto;
  object-fit: contain;
}

.header-right {
  display: flex;
  align-items: center;
  height: 100%;
}

.actions-container {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 0.5rem;
}

.divider {
  width: 1px;
  height: 32px;
  background: var(--gray-lighter);
  margin: 0 0.5rem;
}

/* Style global pour les actions du header */
.header-action {
  height: 100%;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .header {
    padding: 0.75rem 1rem;
    height: 56px;
  }

  .logo-img {
    height: 36px;
  }

  .divider {
    height: 24px;
  }
}
</style>
