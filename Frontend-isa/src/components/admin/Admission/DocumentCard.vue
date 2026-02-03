<template>
  <div class="document-card-premium" @click="openDocument">
    <div class="document-preview" :class="type">
      <div v-if="type === 'image'" class="image-wrapper">
        <img :src="url" alt="Document" @error="handleImageError">
      </div>
      <div v-else class="file-icon">
        <Icon :icon="icon" width="48" />
        <span v-if="type === 'pdf'">PDF</span>
      </div>
    </div>

    <div class="document-footer">
      <h4>{{ title }}</h4>
      <button class="view-btn" @click.stop="openDocument">
        <Icon icon="mdi:eye-outline" width="18" />
        <span>Visualiser</span>
      </button>
    </div>

    <div class="document-actions">
      <button class="download-btn" @click.stop="downloadDocument">
        <Icon icon="mdi:download" width="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value: string) => ['image', 'pdf'].includes(value)
  },
  icon: {
    type: String,
    default: 'mdi:file'
  }
})

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/default-document.png'
}

const openDocument = () => {
  window.open(props.url, '_blank')
}

const downloadDocument = () => {
  const link = document.createElement('a')
  link.href = props.url
  link.download = props.title
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.document-card-premium {
  background-color: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-light);
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid var(--gray-lighter);
}

.document-card-premium:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
}

.document-preview {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: var(--tertiary-extra-light);
}

.document-preview.image {
  background-color: var(--gray-lighter);
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
}

.file-icon span {
  font-weight: 500;
  font-size: 0.875rem;
}

.document-footer {
  padding: 1rem;
  border-top: 1px solid var(--gray-lighter);
}

.document-footer h4 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--primary-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:hover {
  background-color: var(--primary-color-light);
}

.document-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.download-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  box-shadow: var(--shadow-light);
  cursor: pointer;
  color: var(--primary-dark);
  transition: all 0.2s ease;
}

.download-btn:hover {
  background-color: var(--white);
  color: var(--primary-color);
  transform: scale(1.1);
}
</style>
