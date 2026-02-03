<template>
  <div class="quill-editor-wrapper">
    <div ref="editor" class="quill-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// Props pour avoir du v-model
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Rédigez votre contenu...'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '200px'
  }
})

const emit = defineEmits(['update:modelValue', 'text-change', 'selection-change'])

const editor = ref<HTMLElement | null>(null)
let quillInstance: Quill | null = null

onMounted(() => {
  if (!editor.value) return

  // Configuration de la toolbar avec les couleurs de l'institut
  const toolbarOptions = [
    // Formatage de base
    ['bold', 'italic', 'underline', 'strike'],

    // Titres et citations
    [{ 'header': [1, 2, 3, false] }],
    ['blockquote', 'code-block'],

    // Listes
    [{ 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],

    // Couleurs avec les thèmes de l'institut
    [{
      'color': [
        // Couleurs primaires de l'institut
        '#5086c1', '#1a252f', '#3498db', '#5aa8e8',
        // Couleurs secondaires
        '#30a855', '#1e7a3d', '#4abd6a', '#6fd487',
        // États et accents
        '#eb4d4b', '#2ecc71', '#f39c12', '#3498db',
        // Neutres
        '#2d3436', '#636e72', '#b2bec3', '#000000'
      ]
    }],
    [{
      'background': [
        // Arrière-plans avec les couleurs de l'institut
        '#5087c12f', '#30a8552f', '#eb4d4b2f', '#2ecc712f',
        '#f39c122f', '#f8f9fa', '#e9ecef', '#ffffff'
      ]
    }],

    // Alignement et liens
    [{ 'align': [] }],
    ['link'],

    // Nettoyage
    ['clean']
  ]

  quillInstance = new Quill(editor.value, {
    theme: 'snow',
    placeholder: props.placeholder,
    readOnly: props.readonly,
    modules: {
      toolbar: toolbarOptions
    }
  })

  // Initialise le contenu
  if (props.modelValue) {
    quillInstance.root.innerHTML = props.modelValue
  } else {
    quillInstance.root.innerHTML = ''
  }

  // Écoute les changements de texte
  quillInstance.on('text-change', (delta, oldDelta, source) => {
    if (!quillInstance) return
    const html = quillInstance.root.innerHTML
    emit('update:modelValue', html)
    emit('text-change', { delta, oldDelta, source, html })
  })

  // Écoute les changements de sélection
  quillInstance.on('selection-change', (range, oldRange, source) => {
    emit('selection-change', { range, oldRange, source })
  })
})

// Surveillance des changements de props
watch(
  () => props.modelValue,
  (newVal) => {
    if (quillInstance) {
      const currentContent = quillInstance.root.innerHTML
      const newContent = newVal || ''
      if (newContent !== currentContent) {
        quillInstance.root.innerHTML = newContent
      }
    }
  }
)

watch(
  () => props.readonly,
  (newVal) => {
    if (quillInstance) {
      quillInstance.enable(!newVal)
    }
  }
)

// Méthodes exposées
const focus = () => {
  if (quillInstance) {
    quillInstance.focus()
  }
}

const blur = () => {
  if (quillInstance) {
    quillInstance.blur()
  }
}

const getLength = () => {
  return quillInstance ? quillInstance.getLength() : 0
}

const getContents = () => {
  return quillInstance ? quillInstance.getContents() : null
}

const getText = () => {
  return quillInstance ? quillInstance.getText() : ''
}

defineExpose({
  focus,
  blur,
  getLength,
  getContents,
  getText,
  quillInstance
})

onBeforeUnmount(() => {
  quillInstance = null
})
</script>

<style scoped>
.quill-editor-wrapper {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.quill-editor-wrapper:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.quill-editor {
  min-height: v-bind(height);
}
</style>

<style>
/* Styles globaux pour Quill avec le thème de l'institut */

/* Toolbar simplifiée avec les couleurs de l'institut */
.ql-toolbar {
  background: var(--background-light) !important;
  border: none !important;
  border-bottom: 1px solid var(--border-light) !important;
  padding: 0.75rem 1rem !important;
}

.ql-toolbar .ql-stroke {
  stroke: var(--text-dark) !important;
}

.ql-toolbar .ql-fill {
  fill: var(--text-dark) !important;
}

.ql-toolbar button {
  color: var(--text-dark) !important;
  border-radius: var(--radius) !important;
  margin: 0 0.125rem !important;
  padding: 0.375rem !important;
  transition: all 0.2s ease !important;
  background: transparent !important;
  border: 1px solid transparent !important;
}

.ql-toolbar button:hover {
  background: var(--primary-extra-light) !important;
  border-color: var(--primary-color) !important;
}

.ql-toolbar button.ql-active {
  background: var(--primary-color) !important;
  color: var(--white) !important;
}

.ql-toolbar .ql-picker {
  color: var(--text-dark) !important;
}

.ql-toolbar .ql-picker-label {
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius) !important;
  padding: 0.25rem 0.5rem !important;
  margin: 0 0.125rem !important;
  transition: all 0.2s ease !important;
  background: var(--white) !important;
}

.ql-toolbar .ql-picker-label:hover {
  background: var(--primary-extra-light) !important;
  border-color: var(--primary-color) !important;
}

.ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
  background: var(--primary-color) !important;
  color: var(--white) !important;
}

/* Dropdown des couleurs et options */
.ql-picker-options {
  background: var(--white) !important;
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius) !important;
  box-shadow: var(--shadow-lg) !important;
  padding: 0.5rem !important;
}

.ql-picker-item {
  border-radius: var(--radius) !important;
  margin: 0.125rem !important;
  transition: all 0.2s ease !important;
}

.ql-picker-item:hover {
  background: var(--primary-extra-light) !important;
}

/* Zone d'édition */
.ql-editor {
  font-family: 'Roboto', sans-serif !important;
  font-size: 0.875rem !important;
  line-height: 1.6 !important;
  color: var(--text-dark) !important;
  padding: 1rem 1.25rem !important;
  min-height: 150px !important;
}

.ql-editor.ql-blank::before {
  color: var(--text-secondary) !important;
  font-style: normal !important;
  opacity: 0.7 !important;
}

.ql-editor p {
  margin-bottom: 0.75rem !important;
}

.ql-editor h1,
.ql-editor h2,
.ql-editor h3 {
  color: var(--primary-dark) !important;
  font-weight: 600 !important;
  margin: 1rem 0 0.5rem 0 !important;
}

.ql-editor h1 {
  font-size: 1.5rem !important;
  border-bottom: 2px solid var(--primary-color) !important;
  padding-bottom: 0.25rem !important;
}

.ql-editor h2 {
  font-size: 1.25rem !important;
  color: var(--primary-color) !important;
}

.ql-editor h3 {
  font-size: 1.1rem !important;
  color: var(--secondary-color) !important;
}

.ql-editor blockquote {
  border-left: 4px solid var(--primary-color) !important;
  background: var(--primary-extra-light) !important;
  margin: 1rem 0 !important;
  padding: 0.75rem 1rem !important;
  border-radius: 0 var(--radius) var(--radius) 0 !important;
  font-style: italic !important;
}

.ql-editor code {
  background: var(--gray-extra-light) !important;
  border: 1px solid var(--border-light) !important;
  border-radius: var(--radius) !important;
  padding: 0.125rem 0.25rem !important;
  font-family: 'Courier New', monospace !important;
  color: var(--error) !important;
}

.ql-editor pre {
  background: var(--primary-darker) !important;
  color: var(--white) !important;
  border-radius: var(--radius) !important;
  padding: 1rem !important;
  overflow-x: auto !important;
  margin: 1rem 0 !important;
}

.ql-editor ul,
.ql-editor ol {
  margin: 0.75rem 0 !important;
  padding-left: 1.5rem !important;
}

.ql-editor li {
  margin-bottom: 0.25rem !important;
}

.ql-editor a {
  color: var(--primary-color) !important;
  text-decoration: none !important;
  border-bottom: 1px solid var(--primary-color) !important;
  transition: all 0.2s ease !important;
}

.ql-editor a:hover {
  color: var(--primary-dark) !important;
  border-bottom-color: var(--primary-dark) !important;
}

/* États de focus et sélection */
.ql-editor:focus {
  outline: none !important;
}

/* Scrollbar personnalisée */
.ql-editor::-webkit-scrollbar {
  width: 6px !important;
}

.ql-editor::-webkit-scrollbar-track {
  background: var(--background-light) !important;
}

.ql-editor::-webkit-scrollbar-thumb {
  background: var(--primary-color) !important;
  border-radius: 3px !important;
}

.ql-editor::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark) !important;
}

/* Responsive design */
@media (max-width: 768px) {
  .ql-toolbar {
    padding: 0.5rem !important;
  }

  .ql-toolbar button {
    padding: 0.25rem !important;
    margin: 0.05rem !important;
  }

  .ql-editor {
    padding: 0.75rem 1rem !important;
    font-size: 0.8rem !important;
  }
}
</style>
