<template>
  <div v-if="isDefaultPassword">
    <ModalPassword />
  </div>
  <div v-else-if="needsBacTranscript">
    <ModalDocumentStudent />
  </div>
  <div v-else-if="needsVerification">
    <ModalPaymentStudent />
  </div>

  <div class="app-layout" v-else>
    <TheHeader />
    <div class="main-container">
      <TheSideBar />
      <main class="content-pro" v-if="route.path.includes('/admin/users/departments/list')">
        <RouterView />
      </main>
      <main class="content" v-else>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import TheHeader from '@/components/header/TheHeader.vue'
import ModalPassword from '@/components/modal/ModalPassword.vue'
import TheSideBar from '@/components/sideBar/TheSideBar.vue'
import { useMyUserStore } from '@/stores/userStore'
import { RouterView, useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import type StudentInterface from '@/interfaces/student.intefaces'
import ModalDocumentStudent from '@/components/modal/ModalDocumentStudent.vue'
import ModalPaymentStudent from '@/components/modal/ModalPaymentStudent.vue'
import { storeToRefs } from 'pinia'
import { useUsageTracker } from '@/composables/userTracking'

const route = useRoute()
const userStore = useMyUserStore()
const { currentUser } = storeToRefs(userStore)
const { connect, disconnect } = useSocket()


const isDefaultPassword = computed(() => !!currentUser.value?.configs?.defaultPassword)
const isStudent = computed(() => currentUser.value?.role?.includes('student') ?? false)
const needsBacTranscript = computed(() => {
  const student = currentUser.value as StudentInterface | null
  return !!currentUser.value && isStudent.value && !student?.bacTranscript
})
const needsVerification = computed(() => {
  const student = currentUser.value as StudentInterface | null
  return !!currentUser.value && isStudent.value && !!student?.bacTranscript && !student?.verified
})

// Initialiser le tracking d'usage si l'utilisateur est connecté

useUsageTracker(currentUser.value!._id)


// Connecter la socket quand l'utilisateur est authentifié
onMounted(() => {
  connect()
})

// Déconnecter la socket au démontage du layout
onUnmounted(() => {
  disconnect()
})



</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
  /* Empêche le débordement global */
}

.content {
  flex: 1;
  overflow-y: auto;
  /* Permet le scroll seulement pour le contenu */
  padding: 1.5rem;
  background-color: var(--tertiary-extra-light);
}

.content-pro {
  flex: 1;
  overflow-y: auto;
  /* Permet le scroll seulement pour le contenu */

  background-color: var(--tertiary-extra-light);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .content {
    padding: 1rem;
  }
}
</style>
