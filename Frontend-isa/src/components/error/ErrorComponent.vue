<template>
  <div class="elite-error-container">
    <div class="elite-error-content">
      <div class="elite-error-icon">
        <Icon icon="mdi:alert-circle-outline" width="48" />
      </div>
      <h3 class="elite-error-title">{{ title }}</h3>
      <p class="elite-error-message">{{ message }}</p>
      <div class="elite-error-actions" v-if="showAction">
        <button class="elite-error-btn" @click="retry">
          <Icon icon="mdi:reload" width="18" />
          <span>Réessayer</span>
        </button>
        <button class="elite-error-btn outline" @click="goBack" v-if="showBack">
          <Icon icon="mdi:arrow-left" width="18" />
          <span>Retour</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps({
  title: {
    type: String,
    default: 'Une erreur est survenue'
  },
  message: {
    type: String,
    required: true
  },
  showAction: {
    type: Boolean,
    default: true
  },
  showBack: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])

const retry = () => {
  emit('retry')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.elite-error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  background-color: var(--white);
  box-shadow: var(--shadow-light);
}

.elite-error-content {
  text-align: center;
  max-width: 500px;
}

.elite-error-icon {
  color: var(--error);
  margin-bottom: 1.5rem;
}

.elite-error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--error-dark);
  margin-bottom: 1rem;
}

.elite-error-message {
  font-size: 1rem;
  color: var(--gray-dark);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.elite-error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.elite-error-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--error);
  color: var(--white);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.elite-error-btn:hover {
  background-color: var(--error-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.elite-error-btn.outline {
  background-color: transparent;
  color: var(--gray-dark);
  border: 1px solid var(--gray-light);
}

.elite-error-btn.outline:hover {
  background-color: var(--gray-extra-light);
  color: var(--black);
  border-color: var(--gray);
  box-shadow: none;
}

@media (max-width: 768px) {
  .elite-error-container {
    padding: 1.5rem;
  }

  .elite-error-title {
    font-size: 1.25rem;
  }

  .elite-error-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .elite-error-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
