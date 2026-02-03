<template>
  <div class="quill-viewer-wrapper">
    <!-- Barre de téléchargement -->
    <div v-if="downloadable" class="download-toolbar">
      <div class="download-section">
        <p class="download-invitation">Cliquez ci-dessous pour télécharger ce document</p>
        <div class="download-buttons">
          <button @click="downloadAsPDFF" :disabled="loadingDownload" class="download-btn download-pdf"
            title="Télécharger au format PDF">
            <span v-if="loadingDownload" class="btn-spinner">
              <Icon icon="line-md:loading-twotone-loop" :width="16" :height="16" />
            </span>
            <span v-else class="btn-icon">📋</span>
            <span class="btn-text">{{
              loadingDownload ? 'Téléchargement...' : 'Télécharger en PDF'
            }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu du document -->
    <div ref="contentRef" class="quill-content-viewer" :data-show-border="showBorder" :data-compact="compact"
      :data-watermark="watermark" v-html="content"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import Prism from 'prismjs'
import html2pdf from 'html2pdf.js'
// Thème VS Code Dark Plus
import 'prism-themes/themes/prism-vsc-dark-plus.css'
// Plugin numéros de ligne Prism
import 'prismjs/plugins/line-numbers/prism-line-numbers.css'
import 'prismjs/plugins/line-numbers/prism-line-numbers'
// Langages supplémentaires
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-java'
import axios from 'axios'
import type { AssignmentInterface } from '@/interfaces/assignment.interface'
import { PostEventLog } from '@/utils/EventLog'
import { useMyUserStore } from '@/stores/userStore'

interface Props {
  content: string
  maxHeight?: string
  showBorder?: boolean
  compact?: boolean
  defaultLanguage?: string // ex: 'javascript'
  lineNumbers?: boolean // activer numéros de ligne
  watermark?: boolean // afficher le watermark du logo
  downloadable?: boolean // permettre le téléchargement
  assignment?: AssignmentInterface
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  maxHeight: 'none',
  showBorder: true,
  compact: false,
  defaultLanguage: 'javascript',
  lineNumbers: true,
  watermark: false,
  downloadable: false,
})

const loadingDownload = ref(false)

const downloadAsPDFF = async () => {
  try {
    loadingDownload.value = true

    const response = await axios.get(
      `/api/v1/assignments/student/download/${props.assignment._id}`,
      {
        responseType: 'blob',
      },
    )

    await PostEventLog({
      entityId: props.assignment._id,
      entityType: "assignment",
      eventType: "STUDENT_ASSIGNMENT_DOWNLOADED",
      timestamp: new Date(),
      userId: useMyUserStore().currentUser!._id,
      // userId à remplir côté serveur
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${props.assignment.title}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Nettoyer l'URL de l'objet blob
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement du PDF:', error)
    alert('Erreur lors du téléchargement du PDF. Veuillez réessayer.')
  } finally {
    loadingDownload.value = false
  }
}

const contentRef = ref<HTMLDivElement | null>(null)

// Fonction pour copier du texte dans le presse-papiers
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}

// Fonction pour simplifier les liens
const simplifyLinks = () => {
  if (!contentRef.value) return

  const links = contentRef.value.querySelectorAll('a')
  links.forEach((link) => {
    const href = link.getAttribute('href')
    if (href && href.startsWith('http')) {
      // Ajouter un attribut title avec l'URL complète
      link.setAttribute('title', href)

      // Ajouter une icône pour les liens externes
      if (!link.querySelector('.external-link-icon')) {
        const icon = document.createElement('span')
        icon.className = 'external-link-icon'
        icon.innerHTML = '↗'
        link.appendChild(icon)
      }

      // Assurer que les liens externes s'ouvrent dans un nouvel onglet
      link.setAttribute('target', '_blank')
      link.setAttribute('rel', 'noopener noreferrer')
    }
  })
}

// Fonction pour ajouter les boutons de copie aux blocs de code
const addCopyButtons = () => {
  if (!contentRef.value) return

  const preElements = contentRef.value.querySelectorAll('pre')
  preElements.forEach((pre) => {
    if ((pre as HTMLElement).getAttribute('data-copy-enhanced') === 'true') return
    const codeElement = pre.querySelector('code')
    const codeText = codeElement ? codeElement.textContent || '' : ''

    // Créer le conteneur du bouton
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'copy-button-container'

    // Créer le bouton de copie
    const copyButton = document.createElement('button')
    copyButton.className = 'copy-button'
    copyButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
      </svg>
      <span class="copy-text">Copier</span>
    `

    copyButton.addEventListener('click', async () => {
      const success = await copyToClipboard(codeText)
      if (success) {
        copyButton.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
          </svg>
          <span class="copy-text">Copié!</span>
        `
        copyButton.classList.add('copied')

        setTimeout(() => {
          copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
            </svg>
            <span class="copy-text">Copier</span>
          `
          copyButton.classList.remove('copied')
        }, 2000)
      }
    })

    buttonContainer.appendChild(copyButton)
      ; (pre as HTMLElement).style.position = 'relative'
    pre.appendChild(buttonContainer)
      ; (pre as HTMLElement).setAttribute('data-copy-enhanced', 'true')
  })
}

// Fonction pour initialiser toutes les améliorations
const enhanceContent = async () => {
  await nextTick()
  normalizeQuillCodeBlocks()
  highlightWithPrism()
  addCopyButtons()
  simplifyLinks()
}

// Initialiser au montage
onMounted(() => {
  enhanceContent()
})

// Réinitialiser quand le contenu change
watch(
  () => props.content,
  () => {
    enhanceContent()
  },
)

// ================= Prism =================
// Détection simple basée sur contenu
const detectLanguage = (code: string): string => {
  const trimmed = code.trim()
  if (/^\s*</.test(trimmed) && /<\/?[a-zA-Z]/.test(trimmed)) return 'markup'
  if (
    /\b(class|public|static|void|new)\b/.test(trimmed) &&
    /;/.test(trimmed) &&
    /System\./.test(trimmed)
  )
    return 'java'
  if (/\b(def |import |from |print\(|self\b)/.test(trimmed)) return 'python'
  if (/SELECT\s+.+FROM\s+/i.test(trimmed)) return 'sql'
  if (/\b(function|const |let |var |=>)\b/.test(trimmed)) return 'javascript'
  if (/interface\s+\w+|:\s*\w+<|implements\s+\w+/.test(trimmed)) return 'typescript'
  if (/^\s*\{|\"[\w-]+\"\s*:/.test(trimmed) && /[\{\}\[\]]/.test(trimmed)) return 'json'
  if (/\b(display:|color:|flex|justify-content)\b/.test(trimmed)) return 'css'
  return props.defaultLanguage || 'javascript'
}

// Regrouper les lignes Quill .ql-code-block en un seul bloc <pre><code>
const normalizeQuillCodeBlocks = () => {
  if (!contentRef.value) return
  const lineNodes = Array.from(contentRef.value.querySelectorAll('.ql-code-block')) as HTMLElement[]
  if (!lineNodes.length) return
  let group: HTMLElement[] = []
  const flush = () => {
    if (!group.length) return
    const first = group[0]
    const codeText = group.map((l) => l.textContent || '').join('\n')
    const pre = document.createElement('pre')
    const code = document.createElement('code')
    const lang = detectLanguage(codeText)
    code.className = `language-${lang}`
    code.textContent = codeText
    pre.appendChild(code)
    if (props.lineNumbers) pre.classList.add('line-numbers')
    first.parentElement?.insertBefore(pre, first)
    group.forEach((l) => l.remove())
    group = []
  }
  lineNodes.forEach((node, i) => {
    const prev = lineNodes[i - 1]
    if (prev && node.previousElementSibling === prev) {
      group.push(node)
    } else {
      flush()
      group = [node]
    }
  })
  flush()
}

const highlightWithPrism = () => {
  if (!contentRef.value) return
  const preBlocks = Array.from(contentRef.value.querySelectorAll('pre')) as HTMLElement[]
  preBlocks.forEach((pre) => {
    if (props.lineNumbers) pre.classList.add('line-numbers')
    else pre.classList.remove('line-numbers')
  })
  const codeBlocks = preBlocks.map((p) => p.querySelector('code')).filter(Boolean) as HTMLElement[]
  codeBlocks.forEach((code) => {
    if (!code.className.includes('language-')) {
      const auto = detectLanguage(code.textContent || '')
      code.classList.add(`language-${auto}`)
    }
    Prism.highlightElement(code)
  })
}
</script>

<style scoped>
.quill-content-viewer {
  background: var(--white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}

.quill-content-viewer[data-show-border='true'] {
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.quill-content-viewer[data-compact='true'] {
  padding: 0.75rem 1rem;
}

.quill-content-viewer[data-compact='false'] {
  padding: 1rem 1.25rem;
}

/* Scrollbar personnalisée */
.quill-content-viewer::-webkit-scrollbar {
  width: 6px;
}

.quill-content-viewer::-webkit-scrollbar-track {
  background: var(--background-light);
}

.quill-content-viewer::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.quill-content-viewer::-webkit-scrollbar-thumb:hover {
  background: var(--primary-dark);
}
</style>

<style>
/* Styles globaux pour le contenu Quill avec les thèmes de l'institut */
.quill-content-viewer {
  font-family: 'Roboto', sans-serif;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--text-dark);
  /* Empêcher la sélection/copie du contenu général */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Paragraphes */
.quill-content-viewer p {
  margin-bottom: 0.75rem;
  text-align: justify;
}

.quill-content-viewer p:last-child {
  margin-bottom: 0;
}

/* Titres avec les couleurs de l'institut */
.quill-content-viewer h1,
.quill-content-viewer h2,
.quill-content-viewer h3,
.quill-content-viewer h4,
.quill-content-viewer h5,
.quill-content-viewer h6 {
  font-weight: 600;
  margin: 1.5rem 0 0.75rem 0;
  line-height: 1.3;
}

.quill-content-viewer h1:first-child,
.quill-content-viewer h2:first-child,
.quill-content-viewer h3:first-child {
  margin-top: 0;
}

.quill-content-viewer h1 {
  font-size: 1.75rem;
  color: var(--primary-dark);
  border-bottom: 3px solid var(--primary-color);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.quill-content-viewer h2 {
  font-size: 1.5rem;
  color: var(--primary-color);
  position: relative;
}

.quill-content-viewer h2::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
}

.quill-content-viewer h3 {
  font-size: 1.25rem;
  color: var(--secondary-color);
}

.quill-content-viewer h4 {
  font-size: 1.1rem;
  color: var(--text-dark);
}

.quill-content-viewer h5,
.quill-content-viewer h6 {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Citations avec style institut */
.quill-content-viewer blockquote {
  border-left: 4px solid var(--primary-color);
  background: linear-gradient(135deg, var(--primary-extra-light) 0%, rgba(80, 134, 193, 0.05) 100%);
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  font-style: italic;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.quill-content-viewer blockquote::before {
  content: '"';
  font-size: 3rem;
  color: var(--primary-color);
  position: absolute;
  top: -0.5rem;
  left: 0.5rem;
  font-weight: bold;
  opacity: 0.3;
}

.quill-content-viewer blockquote p {
  margin: 0;
  font-size: 0.95rem;
}

/* Code et blocs de code */
.quill-content-viewer code {
  background: var(--gray-extra-light);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  padding: 0.2rem 0.4rem;
  font-family:
    'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', Consolas, 'Liberation Mono',
    Menlo, Monaco, 'Courier New', monospace;
  font-size: 0.82rem;
  color: var(--error);
  font-weight: 500;
}

/* Conteneur visuel des blocs de code (Prism gère les couleurs internes) */
.quill-content-viewer pre {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: var(--radius-lg);
  padding: 1.25rem 1rem 1.25rem 1.25rem;
  overflow-x: auto;
  margin: 1.5rem 0;
  box-shadow: var(--shadow-sm);
  position: relative;
  font-family:
    'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', Consolas, 'Liberation Mono',
    Menlo, Monaco, 'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.45;
  tab-size: 2;
  /* Réactiver la sélection pour les blocs de code */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.quill-content-viewer pre::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.quill-content-viewer pre code {
  background: transparent;
  border: none;
  padding: 0;
  font-size: inherit;
  white-space: pre;
  /* S'assurer que le code reste sélectionnable */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* Forcer la même police pour tous les tokens de syntaxe Prism */
.quill-content-viewer pre code .token,
.quill-content-viewer pre code .token.string,
.quill-content-viewer pre code .token.number,
.quill-content-viewer pre code .token.keyword,
.quill-content-viewer pre code .token.function,
.quill-content-viewer pre code .token.comment,
.quill-content-viewer pre code .token.operator,
.quill-content-viewer pre code .token.punctuation,
.quill-content-viewer pre code .token.class-name,
.quill-content-viewer pre code .token.tag,
.quill-content-viewer pre code .token.attr-name,
.quill-content-viewer pre code .token.attr-value,
.quill-content-viewer pre code .token.property,
.quill-content-viewer pre code .token.selector,
.quill-content-viewer pre code .token.important,
.quill-content-viewer pre code .token.builtin {
  font-family:
    'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', Consolas, 'Liberation Mono',
    Menlo, Monaco, 'Courier New', monospace !important;
  font-weight: normal !important;
}

/* Style spécifique pour les blocs de code Quill */
/* Lignes de code Quill restantes (si non regroupées) */
.quill-content-viewer .ql-code-block {
  font-family:
    'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Source Code Pro', Consolas, 'Liberation Mono',
    Menlo, Monaco, 'Courier New', monospace;
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 0.25rem 0.75rem;
  margin: 0;
  border-left: 3px solid var(--primary-color);
  /* Permettre la sélection pour les blocs Quill aussi */
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

/* Bouton de copie pour les blocs de code */
.copy-button-container {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.copy-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
  color: var(--white);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.copy-button.copied {
  background: rgba(46, 204, 113, 0.2);
  border-color: rgba(46, 204, 113, 0.4);
  color: #2ecc71;
}

.copy-button svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.copy-text {
  white-space: nowrap;
}

/* Listes avec style institut */
.quill-content-viewer ul,
.quill-content-viewer ol {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.quill-content-viewer ul {
  list-style: none;
}

.quill-content-viewer ul li {
  position: relative;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
}

.quill-content-viewer ul li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.7rem;
  width: 6px;
  height: 6px;
  background: var(--primary-color);
  border-radius: 50%;
  transform: translateY(-50%);
}

.quill-content-viewer ol li {
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.quill-content-viewer ol li::marker {
  color: var(--primary-color);
  font-weight: 600;
}

/* Listes imbriquées */
.quill-content-viewer ul ul li::before {
  background: var(--secondary-color);
  width: 4px;
  height: 4px;
}

.quill-content-viewer ul ul ul li::before {
  background: var(--text-secondary);
  width: 2px;
  height: 2px;
}

/* Liens avec hover simple */
.quill-content-viewer a {
  color: var(--primary-color);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.quill-content-viewer a:hover {
  text-decoration-color: var(--primary-color);
}

/* Icône pour les liens externes */
.external-link-icon {
  font-size: 0.75rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  margin-left: 0.125rem;
}

.quill-content-viewer a:hover .external-link-icon {
  opacity: 1;
}

/* Texte en gras et italique */
.quill-content-viewer strong {
  font-weight: 700;
  color: var(--primary-dark);
}

.quill-content-viewer em {
  font-style: italic;
  color: var(--text-secondary);
}

.quill-content-viewer u {
  text-decoration: underline;
  text-decoration-color: var(--primary-color);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* Texte barré */
.quill-content-viewer s {
  text-decoration: line-through;
  text-decoration-color: var(--error);
  opacity: 0.7;
}

/* Alignement du texte */
.quill-content-viewer .ql-align-center {
  text-align: center;
}

.quill-content-viewer .ql-align-right {
  text-align: right;
}

.quill-content-viewer .ql-align-justify {
  text-align: justify;
}

/* Indentation */
.quill-content-viewer .ql-indent-1 {
  padding-left: 2rem;
}

.quill-content-viewer .ql-indent-2 {
  padding-left: 4rem;
}

.quill-content-viewer .ql-indent-3 {
  padding-left: 6rem;
}

/* Couleurs personnalisées (celles de l'institut) */
.quill-content-viewer .ql-color-5086c1 {
  color: #5086c1;
}

.quill-content-viewer .ql-color-30a855 {
  color: #30a855;
}

.quill-content-viewer .ql-color-eb4d4b {
  color: #eb4d4b;
}

.quill-content-viewer .ql-color-f39c12 {
  color: #f39c12;
}

/* Arrière-plans personnalisés */
.quill-content-viewer .ql-bg-5087c12f {
  background-color: rgba(80, 135, 193, 0.18);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
}

.quill-content-viewer .ql-bg-30a8552f {
  background-color: rgba(48, 168, 85, 0.18);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
}

/* Tables (si supportées) */
.quill-content-viewer table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.quill-content-viewer th,
.quill-content-viewer td {
  border: 1px solid var(--border-light);
  padding: 0.75rem 1rem;
  text-align: left;
}

.quill-content-viewer th {
  background: var(--primary-color);
  color: var(--white);
  font-weight: 600;
}

.quill-content-viewer tr:nth-child(even) {
  background: var(--background-light);
}

.quill-content-viewer tr:hover {
  background: var(--primary-extra-light);
}

/* Images (si supportées) */
.quill-content-viewer img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin: 1rem 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .quill-content-viewer {
    font-size: 0.8rem;
  }

  .quill-content-viewer h1 {
    font-size: 1.5rem;
  }

  .quill-content-viewer h2 {
    font-size: 1.25rem;
  }

  .quill-content-viewer h3 {
    font-size: 1.1rem;
  }

  .quill-content-viewer blockquote {
    padding: 0.75rem 1rem;
    margin: 1rem 0;
  }

  .quill-content-viewer pre,
  .quill-content-viewer .ql-code-block-container {
    padding: 1rem;
    font-size: 0.75rem;
  }

  .copy-button-container {
    top: 0.5rem;
    right: 0.5rem;
  }

  .copy-button {
    padding: 0.375rem 0.5rem;
    font-size: 0.7rem;
  }

  .copy-button .copy-text {
    display: none;
  }

  .quill-content-viewer .ql-indent-1 {
    padding-left: 1.5rem;
  }

  .quill-content-viewer .ql-indent-2 {
    padding-left: 3rem;
  }

  .quill-content-viewer .ql-indent-3 {
    padding-left: 4.5rem;
  }
}

@media (max-width: 480px) {
  .quill-content-viewer {
    font-size: 0.75rem;
  }

  .quill-content-viewer h1 {
    font-size: 1.25rem;
  }

  .quill-content-viewer h2 {
    font-size: 1.1rem;
  }

  .quill-content-viewer h3 {
    font-size: 1rem;
  }

  .quill-content-viewer blockquote {
    padding: 0.5rem 0.75rem;
  }

  .quill-content-viewer pre,
  .quill-content-viewer .ql-code-block-container {
    padding: 0.75rem;
  }

  .copy-button-container {
    top: 0.375rem;
    right: 0.375rem;
  }

  .copy-button {
    padding: 0.25rem;
    gap: 0;
  }

  .copy-button .copy-text {
    display: none;
  }

  .copy-button svg {
    width: 12px;
    height: 12px;
  }

  .quill-content-viewer ul,
  .quill-content-viewer ol {
    padding-left: 1rem;
  }

  .quill-content-viewer .ql-indent-1 {
    padding-left: 1rem;
  }

  .quill-content-viewer .ql-indent-2 {
    padding-left: 2rem;
  }

  .quill-content-viewer .ql-indent-3 {
    padding-left: 3rem;
  }
}

/* États vides */
.quill-content-viewer:empty::before {
  content: 'Aucun contenu à afficher';
  color: var(--text-secondary);
  font-style: italic;
  opacity: 0.7;
}

/* Styles pour la barre de téléchargement */
.quill-viewer-wrapper {
  position: relative;
}

.download-toolbar {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.download-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.download-invitation {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
  text-align: right;
}

.download-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
  color: #495057;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.btn-icon {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.btn-text {
  position: relative;
  z-index: 2;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-btn:hover .btn-icon {
  transform: scale(1.2);
}

.download-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.download-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none !important;
}

.download-btn:disabled:hover {
  transform: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06) !important;
}

.btn-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.download-html:hover {
  color: white;
  border-color: #e67e22;
  background: linear-gradient(45deg, #e67e22, #f39c12);
}

.download-pdf:hover {
  color: white;
  border-color: #e74c3c;
  background: linear-gradient(45deg, #e74c3c, #c0392b);
}

.download-pdf:disabled:hover {
  color: #495057;
  background: white;
  border-color: #dee2e6;
}

/* Responsive pour la barre de téléchargement */
@media (max-width: 1024px) {
  .download-section {
    align-items: center;
  }

  .download-invitation {
    text-align: center;
  }
}

@media (max-width: 768px) {
  .download-toolbar {
    padding: 0.875rem;
  }

  .download-invitation {
    font-size: 0.8rem;
  }

  .download-buttons {
    gap: 0.5rem;
  }

  .download-btn {
    padding: 0.5rem 0.875rem;
    font-size: 0.75rem;
    gap: 0.375rem;
  }

  .btn-icon {
    font-size: 0.8rem;
  }
}

@media (max-width: 640px) {
  .download-buttons {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .download-btn {
    width: 100%;
    justify-content: center;
    padding: 0.625rem 1rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .download-toolbar {
    padding: 0.75rem;
  }

  .download-invitation {
    font-size: 0.75rem;
  }

  .download-btn {
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
  }
}

/* Watermark de l'université */
.quill-content-viewer[data-watermark='true'] {
  position: relative;
}

.quill-content-viewer[data-watermark='true']::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/logo300x300.svg');
  background-repeat: repeat;
  background-size: 200px 200px;
  background-position: center;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
  mix-blend-mode: multiply;
}

.quill-content-viewer[data-watermark='true']>* {
  position: relative;
  z-index: 2;
}

/* Watermark alternatif avec texte si le logo n'est pas disponible */
.quill-content-viewer[data-watermark='true']::after {
  content: "ISA - Institut Supérieur d'Ambatomirahavavy";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 3rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.02);
  white-space: nowrap;
  pointer-events: none;
  z-index: 1;
  user-select: none;
}

/* Pour les écrans plus petits */
@media (max-width: 768px) {
  .quill-content-viewer[data-watermark='true']::before {
    background-size: 150px 150px;
  }

  .quill-content-viewer[data-watermark='true']::after {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .quill-content-viewer[data-watermark='true']::before {
    background-size: 100px 100px;
  }

  .quill-content-viewer[data-watermark='true']::after {
    font-size: 1.5rem;
  }
}
</style>
