<template>
  <div class="document-card" :class="{ locked: locked }">
    <div class="document-icon">
      <Icon v-if="file" icon="mdi:file-document" />
      <Icon v-else icon="mdi:file-upload-outline" />
    </div>
    <div class="document-info">
      <h3 class="document-title">{{ title }}</h3>
      <p class="document-filename" v-if="file">{{ file }}</p>
      <p class="document-missing" v-else>Document manquant</p>
    </div>
    <div class="document-actions">
      <button v-if="!locked && !file" class="upload-button" @click="triggerUpload">
        <Icon icon="mdi:upload" />
        <span>Téléverser</span>
      </button>
      <button v-if="file" class="view-button">
        <Icon icon="mdi:eye-outline" />
        <span>Voir</span>
      </button>
      <input v-if="!locked" type="file" ref="fileInput" @change="handleFileChange" class="file-input" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

/* =====================
   PROPS
===================== */
const props = defineProps<{
  title?: string
  file?: string
  locked?: boolean
}>()


const emit = defineEmits<{
  (e: 'upload', file: File): void
}>()


const fileInput = ref<HTMLInputElement | null>(null)


const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]

  if (file) {
    emit('upload', file)
  }
}
</script>


<style scoped>
.document-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background-color: var(--white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-lighter);
  transition: all 0.2s ease;
}

.document-card.locked {
  background-color: var(--gray-super-light);
  border-color: var(--gray-light);
}

.document-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-light);
}

.document-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background-color: var(--primary-extra-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 1.75rem;
  flex-shrink: 0;
}

.document-card.locked .document-icon {
  background-color: var(--gray-lighter);
  color: var(--gray);
}

.document-info {
  flex: 1;
  min-width: 0;
}

.document-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--black);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-filename {
  font-size: 0.85rem;
  color: var(--gray);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.document-missing {
  font-size: 0.85rem;
  color: var(--error);
  margin: 0;
}

.document-actions {
  display: flex;
  flex-shrink: 0;
}

.upload-button,
.view-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.upload-button {
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
}

.upload-button:hover {
  background-color: var(--primary-color-light);
}

.view-button {
  background-color: var(--gray-lighter);
  color: var(--gray-dark);
}

.view-button:hover {
  background-color: var(--gray-light);
}

.file-input {
  display: none;
}
</style>
