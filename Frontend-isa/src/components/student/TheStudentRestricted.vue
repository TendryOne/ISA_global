<template>
    <div class="restricted-container">
        <ModalRestrictedAccess @close="handleClose" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ModalRestrictedAccess from '@/components/modal/ModalRestrictedAccess.vue'

const router = useRouter()

const handleClose = () => {
    // Rediriger vers la page d'accueil lors de la fermeture du modal
    router.push('/')
}

// Afficher le modal automatiquement au montage du composant
onMounted(() => {
    // Le modal s'affichera automatiquement
})
</script>

<style scoped>
.restricted-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
}
</style>