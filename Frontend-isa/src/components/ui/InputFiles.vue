<template>
  <div class="file-input-group" :class="{ 'has-error': hasError, 'is-disabled': disabled }">
    <Field :name="name" v-slot="{ field, errorMessage: fieldError, handleChange }">
      <label v-if="label" :for="name" class="file-input-label">
        {{ label }}
      </label>

      <div class="file-input-wrapper">
        <input :id="name" type="file" class="file-input" :multiple="multiple" :accept="accept" :disabled="disabled"
          @change="(e) => handleInputChange(e, handleChange)" ref="fileInput" />

        <div class="file-input-dropzone" @click="triggerFileInput" @dragover.prevent="dragOver"
          @drop.prevent="(e) => handleDrop(e, handleChange)" @dragleave.prevent="dragLeave"
          :class="{ 'drag-active': isDragOver }">
          <div class="dropzone-content">
            <Icon icon="uil:cloud-upload" width="48" class="upload-icon" />
            <p>Glissez-déposez vos fichiers ici ou cliquez pour sélectionner</p>
            <p v-if="hint" class="hint-text">{{ hint }}</p>
          </div>
        </div>
      </div>

      <!-- File previews -->
      <div v-if="previewFiles.length > 0" class="file-previews">
        <div v-for="(file, index) in previewFiles" :key="file.id" class="file-preview">
          <div class="preview-content">
            <img v-if="file.preview" :src="file.preview" class="image-preview" />
            <div v-else class="file-icon">
              <Icon :icon="getFileIcon(file.type)" width="32" />
            </div>
            <div class="file-info">
              <p class="file-name">{{ file.name }}</p>
              <p class="file-size">{{ formatFileSize(file.size) }}</p>
            </div>
            <button type="button" class="remove-file" @click="() => removeFile(index, handleChange)"
              :disabled="disabled">
              <Icon icon="uil:times" width="16" />
            </button>
          </div>
          <div v-if="file.progress" class="upload-progress">
            <div class="progress-bar" :style="{ width: file.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <div v-if="errorMessage || fieldError" class="error-message">
        {{ errorMessage || fieldError }}
      </div>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Field } from 'vee-validate';
import { Icon } from '@iconify/vue';

interface PreviewFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  preview?: string;
  progress?: number;
}

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  accept: {
    type: String,
    default: '*/*',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  maxFiles: {
    type: Number,
    default: null,
  },
  maxSize: {
    type: Number, // in bytes
    default: null,
  },
});

const previewFiles = ref<PreviewFile[]>([]);
const errorMessage = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const hasError = computed(() => props.error || !!errorMessage.value);

const triggerFileInput = () => {
  if (!props.disabled && fileInput.value) {
    fileInput.value.click();
  }
};

const handleInputChange = (event: Event, handleChange: (value: any) => void) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const files = processFiles(Array.from(input.files));
    if (files) {
      handleChange(props.multiple ? files : files[0]);
    }
  }
};

const handleDrop = (event: DragEvent, handleChange: (value: any) => void) => {
  if (props.disabled) return;
  isDragOver.value = false;

  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const files = processFiles(Array.from(event.dataTransfer.files));
    if (files) {
      handleChange(props.multiple ? files : files[0]);
    }
  }
};

const processFiles = (files: File[]) => {
  errorMessage.value = '';
  resetFileInput();

  // Check max files
  if (props.maxFiles && (previewFiles.value.length + files.length) > props.maxFiles) {
    errorMessage.value = `Vous ne pouvez télécharger que ${props.maxFiles} fichier(s) maximum.`;
    return null;
  }

  const validFiles: File[] = [];

  files.forEach((file) => {
    // Check file size
    if (props.maxSize && file.size > props.maxSize) {
      errorMessage.value = `Le fichier ${file.name} dépasse la taille maximale autorisée (${formatFileSize(props.maxSize)}).`;
      return;
    }

    const previewFile: PreviewFile = {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
    };

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewFile.preview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    previewFiles.value.push(previewFile);
    validFiles.push(file);
  });

  return validFiles.length > 0 ? validFiles : null;
};

const removeFile = (index: number, handleChange: (value: any) => void) => {
  previewFiles.value.splice(index, 1);
  const currentFiles = previewFiles.value.map((f) => f.file);
  handleChange(props.multiple ? currentFiles : currentFiles[0] || null);
};

const resetFileInput = () => {
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const dragOver = (event: DragEvent) => {
  if (!props.disabled) {
    isDragOver.value = true;
    event.preventDefault();
  }
};

const dragLeave = () => {
  isDragOver.value = false;
};

// Helpers
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string): string => {
  const icons: Record<string, string> = {
    'application/pdf': 'vscode-icons:file-type-pdf2',
    'application/msword': 'vscode-icons:file-type-word2',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'vscode-icons:file-type-word2',
    'application/vnd.ms-excel': 'vscode-icons:file-type-excel2',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'vscode-icons:file-type-excel2',
    'application/vnd.ms-powerpoint': 'vscode-icons:file-type-powerpoint2',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'vscode-icons:file-type-powerpoint2',
    'application/zip': 'vscode-icons:file-type-zip',
    'text/plain': 'vscode-icons:file-type-text',
    'text/csv': 'vscode-icons:file-type-csv',
  };

  return icons[mimeType] || 'uil:file-alt';
};
</script>

<style scoped>
.file-input-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.file-input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.file-input-wrapper {
  position: relative;
  background: var(--primary-extra-light);
  border-radius: var(--radius);
}

.file-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  top: 0;
  left: 0;
}

.file-input-dropzone {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--background-light);
}

.file-input-dropzone:hover {
  border-color: var(--primary-color);
}

.file-input-dropzone.drag-active {
  border-color: var(--primary-color);
  background-color: rgba(var(--primary-color-rgb), 0.1);
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  color: var(--primary-color);
}

.hint-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.file-previews {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-preview {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 0.75rem;
  background-color: var(--background-light);
}

.preview-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.image-preview {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.file-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.file-info {
  flex: 1;
  overflow: hidden;
}

.file-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.remove-file {
  background: none;
  border: none;
  color: var(--error);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-file:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 0.5rem;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.error-message {
  margin-top: 0.5rem;
  color: var(--error);
  font-size: 0.85rem;
}

/* États */
.has-error .file-input-dropzone {
  border-color: var(--error);
}

.is-disabled .file-input-dropzone {
  background-color: var(--background-disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

.is-disabled .file-input-dropzone * {
  pointer-events: none;
}
</style>
