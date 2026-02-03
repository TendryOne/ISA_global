<template>
  <div class="elite-document-card">
    <!-- Carte document (version compacte) -->
    <div class="elite-document-icon">
      <Icon :icon="getFileIcon" width="32" height="32" />
    </div>
    <div class="elite-document-info">
      <span class="elite-document-title">{{ title }}</span>
      <span class="elite-document-type">{{ getFileType }}</span>
    </div>
    <button class="elite-preview-btn" @click.stop="openFullscreen">
      <Icon icon="mdi:eye-outline" width="20" height="20" />
    </button>

    <!-- Overlay Fullscreen (hors du modal parent) -->
    <Teleport to="body">



      <div v-if="isFullscreen" class="elite-fullscreen-overlay" @click="closeFullscreen">
        <div class="elite-fullscreen-content">
          <button class="elite-close-fullscreen" @click.stop="closeFullscreen">
            <Icon icon="mdi:close" width="28" height="28" />
          </button>
          <img :src="url" alt="Preview" class="elite-fullscreen-image" />
          <div class="elite-fullscreen-footer">
            <span>{{ title }}</span>
            <a :href="url" download class="elite-download-fullscreen">
              <Icon icon="mdi:download" width="20" height="20" />
              Télécharger
            </a>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'

const props = defineProps({
  icon: { type: String, default: 'mdi:file-document' },
  url: { type: String, required: true },
  type: { type: String, default: 'file' },
  title: { type: String, required: true }
})

const isFullscreen = ref(false)

const getFileIcon = computed(() => {
  if (props.type === 'image') return 'mdi:image-outline'
  const ext = props.url.split('.').pop()?.toLowerCase()
  const icons = {
    pdf: 'mdi:file-pdf-box',
    doc: 'mdi:file-word-box',
    docx: 'mdi:file-word-box',
    xls: 'mdi:file-excel-box',
    xlsx: 'mdi:file-excel-box',
    ppt: 'mdi:file-powerpoint-box',
    pptx: 'mdi:file-powerpoint-box',
    zip: 'mdi:folder-zip-outline',
    rar: 'mdi:folder-zip-outline'
  }
  // @ts-ignore
  return icons[ext] || props.icon || 'mdi:file-document-outline'
})

const getFileType = computed(() => {
  if (props.type === 'image') return 'Image'
  const ext = props.url.split('.').pop()?.toUpperCase()
  return ext ? `Fichier ${ext}` : 'Document'
})

const openFullscreen = () => {
  if (props.type === 'image') {
    isFullscreen.value = true
    document.body.style.overflow = 'hidden'
  } else {
    window.open(props.url, '_blank')
  }
}

const closeFullscreen = () => {
  isFullscreen.value = false
  document.body.style.overflow = ''
}
</script>

<style scoped>
/* Styles de base de la carte document */
.elite-document-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.elite-document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-color: rgba(80, 134, 193, 0.2);
}

.elite-document-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--primary-color), var(--primary-light));
}

.elite-document-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(80, 134, 193, 0.1);
  border-radius: 8px;
  color: var(--primary-color);
}

.elite-document-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.elite-document-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.elite-document-type {
  font-size: 0.75rem;
  color: var(--tertiary-color);
  letter-spacing: 0.5px;
}

.elite-preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 50%;
  border: none;
  color: var(--tertiary-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.elite-preview-btn:hover {
  background: rgba(80, 134, 193, 0.1);
  color: var(--primary-color);
}

/* Styles Fullscreen (hors modal) */
.elite-fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.96);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.25s ease-out;
}

.elite-fullscreen-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.elite-close-fullscreen {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
}

.elite-close-fullscreen:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.elite-fullscreen-image {
  max-width: 100%;
  max-height: 100vh;
  object-fit: contain;
  padding: 4rem;
}

.elite-fullscreen-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
}

.elite-download-fullscreen {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
}

.elite-download-fullscreen:hover {
  background: rgba(255, 255, 255, 0.25);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
