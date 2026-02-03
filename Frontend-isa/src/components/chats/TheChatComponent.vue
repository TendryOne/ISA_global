<template>
  <div class="chat-container">
    <!-- En-tête du chat -->
    <div class="chat-header">
      <div class="header-content">
        <div class="avatar-container">
          <div class="avatar">
            <span>🤖</span>
          </div>
          <div class="status-indicator online"></div>
        </div>
        <div class="header-info">
          <h3>Support Technique</h3>
          <p class="status-text">En ligne • Réponse rapide</p>
        </div>
      </div>
      <button class="close-btn" @click="$emit('close')" aria-label="Fermer le chat">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Zone de messages -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.sender]">
        <div class="message-content">
          <div class="message-bubble">
            <p>{{ message.content }}</p>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>Le support écrit...</p>
      </div>
    </div>

    <!-- Zone de saisie -->
    <div class="chat-input-area">
      <div class="input-wrapper">
        <textarea v-model="newMessage" @keydown.enter.prevent="sendMessage" placeholder="Tapez votre message..."
          rows="1" ref="textarea" @input="autoResize"></textarea>
        <button class="send-btn" @click="sendMessage" :disabled="!newMessage.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" />
          </svg>
        </button>
      </div>
      <div class="quick-actions">
        <button v-for="action in quickActions" :key="action" @click="sendQuickAction(action)" class="quick-action-btn">
          {{ action }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

interface Message {
  id: number
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const props = defineProps<{
  initialMessages?: Message[]
}>()

const emit = defineEmits<{
  close: []
  messageSent: [message: string]
}>()

// Messages
const messages = ref<Message[]>([
  {
    id: 1,
    content: 'Bonjour ! 👋 Je suis là pour vous aider. Comment puis-je vous assister aujourd\'hui ?',
    sender: 'bot',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 2,
    content: 'J\'ai un problème avec mon compte.',
    sender: 'user',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 3,
    content: 'Je comprends. Pouvez-vous me décrire plus précisément le problème que vous rencontrez avec votre compte ?',
    sender: 'bot',
    timestamp: new Date(Date.now() - 1200000)
  }
])

const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement>()
const textarea = ref<HTMLTextAreaElement>()

// Actions rapides
const quickActions = [
  'Problème de connexion',
  'Question facturation',
  'Bug technique',
  'Demande fonctionnalité'
]

// Envoyer un message
const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userMessage: Message = {
    id: Date.now(),
    content: newMessage.value.trim(),
    sender: 'user',
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  emit('messageSent', userMessage.content)
  newMessage.value = ''
  autoResize()

  // Réponse automatique du bot
  isTyping.value = true
  await simulateTyping()

  const botResponses = [
    'Merci pour votre message. Je vais examiner cela.',
    'Je comprends votre préoccupation. Laissez-moi vérifier cela pour vous.',
    'Bonne question ! Permettez-moi de vous aider avec cela.',
    'Je note votre demande. Notre équipe y répondra rapidement.'
  ]

  const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

  const botMessage: Message = {
    id: Date.now() + 1,
    content: randomResponse,
    sender: 'bot',
    timestamp: new Date()
  }

  messages.value.push(botMessage)
  isTyping.value = false
}

// Envoyer une action rapide
const sendQuickAction = (action: string) => {
  newMessage.value = action
  sendMessage()
}

// Simuler l'écriture du bot
const simulateTyping = () => {
  return new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
}

// Formatage de l'heure
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Redimensionnement automatique du textarea
const autoResize = () => {
  nextTick(() => {
    if (textarea.value) {
      textarea.value.style.height = 'auto'
      textarea.value.style.height = Math.min(textarea.value.scrollHeight, 120) + 'px'
    }
  })
}

// Défilement automatique vers le bas
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Surveiller les nouveaux messages
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
  if (props.initialMessages) {
    messages.value = [...props.initialMessages, ...messages.value]
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  max-height: 90vh;
  width: 400px;
  max-width: 90vw;
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* En-tête */
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--white);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 48px;
  height: 48px;
  background: var(--primary-light);
  border-radius: var(--rounded);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: var(--rounded);
  border: 2px solid var(--white);
}

.status-indicator.online {
  background: var(--success);
}

.status-indicator.offline {
  background: var(--gray);
}

.header-info h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.status-text {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: var(--rounded);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background: var(--background-light);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg);
  position: relative;
}

.message.user .message-bubble {
  background: var(--primary-color);
  color: var(--white);
  border-bottom-right-radius: var(--radius-sm);
}

.message.bot .message-bubble {
  background: var(--white);
  color: var(--text-dark);
  border: 1px solid var(--border-light);
  border-bottom-left-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.message-bubble p {
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  display: block;
  text-align: right;
}

/* Indicateur d'écriture */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  width: fit-content;
  box-shadow: var(--shadow-sm);
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--tertiary-color);
  border-radius: var(--rounded);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

.typing-indicator p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Zone de saisie */
.chat-input-area {
  padding: 1rem 1.5rem;
  background: var(--white);
  border-top: 1px solid var(--border-secondary);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  background: var(--background-light);
  transition: all 0.2s ease;
}

textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  background: var(--white);
  box-shadow: 0 0 0 3px var(--primary-extra-light);
}

.send-btn {
  width: 44px;
  height: 44px;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--rounded);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: var(--gray-light);
  cursor: not-allowed;
  opacity: 0.6;
}

/* Actions rapides */
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.quick-action-btn {
  padding: 0.5rem 0.75rem;
  background: var(--primary-extra-light);
  color: var(--primary-color);
  border: 1px solid var(--primary-color-light);
  border-radius: var(--radius);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.quick-action-btn:hover {
  background: var(--primary-color-light);
  transform: translateY(-1px);
}

/* Scrollbar personnalisée */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--gray-light);
  border-radius: var(--radius);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--tertiary-color);
}

/* Responsive */
@media (max-width: 480px) {
  .chat-container {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
  }

  .chat-header {
    padding: 1rem;
  }

  .chat-messages {
    padding: 1rem;
  }

  .chat-input-area {
    padding: 1rem;
  }

  .message-bubble {
    max-width: 90%;
  }
}
</style>