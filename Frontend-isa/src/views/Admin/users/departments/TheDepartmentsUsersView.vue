<template>
  <div class="admin-users-container" v-if="useMyUserStore().currentUser?.role.includes('superAdmin')">
    <!-- Header avec effet de verre -->
    <div class="admin-header-glass">
      <h1 class="admin-title">
        <Icon icon="material-symbols:badge-outline-rounded" width="36" height="36" />
        Gestion des Personnels Administratifs
      </h1>
    </div>

    <!-- Navigation contextuelle -->
    <div class="contextual-navigation">
      <ActionButton v-if="route.path.includes('/list')" @click="() => $router.push('/admin/users/departments/new')"
        icon="mdi:account-plus">
        Ajouter un administrateur
      </ActionButton>

      <ActionButton v-if="route.path.includes('/new') || route.path === '/admin/users/departments' || route.params.id"
        @click="() => $router.push('/admin/users/departments/list')" icon="mdi:account-group">
        Voir les administrateurs
      </ActionButton>

    </div>

    <!-- Vue du routeur avec cadre luxury -->
    <div class="router-view-container">
      <div class="router-view-glass">

        <Suspense>
          <template #default>
            <router-view></router-view>
          </template>
          <template #fallback>
            <p>Chargement de la page...</p>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
  <div v-else style="background-color: red;">
    <TheProhibitedArea />
  </div>
</template>

<script setup lang="ts">
import TheProhibitedArea from '@/components/admin/prohibitedArea/TheProhibitedArea.vue';
import ActionButton from '@/components/ui/ActionButton.vue';
import { useMyUserStore } from '@/stores/userStore';
import { Icon } from '@iconify/vue';
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<style scoped>
.admin-users-container {
  min-height: 100vh;

  padding: 2rem;
}

.admin-header-glass {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-dark);
  color: white;
  position: relative;
  overflow: hidden;
}

.admin-header-glass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  z-index: -1;
}

.admin-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.admin-subtitle {
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
  font-size: 1.1rem;
}

.contextual-navigation {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
  gap: 1rem;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
}

.nav-button.primary {
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-dark));
  color: white;
}

.nav-button.primary:hover {
  background: linear-gradient(135deg, var(--secondary-dark), var(--secondary-darker));
  transform: translateY(-2px);
  box-shadow: var(--shadow-dark);
}

.nav-button.secondary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
}

.nav-button.secondary:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  transform: translateY(-2px);
  box-shadow: var(--shadow-dark);
}

.router-view-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9));
  border-radius: var(--radius-xl);
  padding: 1px;
  box-shadow: var(--shadow-light);
}

/* .router-view-glass {
  background: var(--white);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(10px);
  min-height: 400px;

  border: 1px solid rgba(255, 255, 255, 0.5);
} */

/* Animation d'entrée */
.contextual-navigation {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .admin-users-container {
    padding: 1rem;
  }

  .admin-title {
    font-size: 1.75rem;
  }

  .contextual-navigation {
    flex-direction: column;
    align-items: stretch;
  }

  .router-view-glass {
    padding: 1.5rem;
  }
}
</style>
