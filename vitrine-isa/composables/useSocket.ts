import { io } from 'socket.io-client'
import { ref, onUnmounted, computed } from 'vue'

const socketUrl = import.meta.env.VITE_SOCKET_URL || (process.env.NODE_ENV === 'production' ? 'https://api.isa-ambato.mg' : 'http://localhost:4000')

export const socketIo = io(socketUrl, {
  withCredentials: true, 
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})



const connected = ref(false)
const reconnectAttempts = ref(0)
const MAX_RECONNECT_ATTEMPTS = 5
let isInitialized = false

// Stocker les références des handlers pour éviter les doublons
const handleConnect = () => {
  connected.value = true
  reconnectAttempts.value = 0

}

const handleDisconnect = (reason: string) => {
  connected.value = false


  if (reason !== 'io client disconnect' && reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts.value++
    setTimeout(() => socketIo.connect(), 3000)
  }
}

const handleConnectError = (error: Error) => {
  console.error('🚨 Socket connection error:', error.message)
}



export function useSocket() {
  const listeners: Array<{ event: string; callback: (...args: any[]) => void }> = []

  // Initialize socket connection once
  const initializeSocket = () => {
    if (isInitialized) {
      return
    }

    // IMPORTANT : Nettoyer les anciens listeners avant d'en ajouter de nouveaux
    socketIo.off('connect', handleConnect)
    socketIo.off('disconnect', handleDisconnect)
    socketIo.off('connect_error', handleConnectError)

    // Ajouter les nouveaux listeners (une seule fois)
    socketIo.on('connect', handleConnect)
    socketIo.on('disconnect', handleDisconnect)
    socketIo.on('connect_error', handleConnectError)

    // Connecter si pas déjà connecté
    if (!socketIo.connected) {
      socketIo.connect()
    } else {
      // Si déjà connecté, rejoindre les rooms immédiatement
      connected.value = true

    }

    isInitialized = true
  }

  // Subscribe to socket event
  const on = <T = any>(event: string, callback: (data: T) => void) => {
    // Vérifier si ce listener existe déjà pour éviter les doublons
    const existingListener = listeners.find((l) => l.event === event && l.callback === callback)
    if (existingListener) {
      return
    }

    socketIo.on(event, callback)
    listeners.push({ event, callback })
  }

  // Emit socket event with optional callback
  const emit = <T = any, R = any>(event: string, data?: T, callback?: (response: R) => void) => {
    if (!connected.value) {
      return false
    }

    if (callback) {
      // Avec callback (acknowledgement)
      socketIo.emit(event, data, callback)
    } else {
      // Sans callback
      socketIo.emit(event, data)
    }

    return true
  }

  // Emit with acknowledgement using Promise (for async/await usage)
  const emitWithAck = <T = any, R = any>(event: string, data?: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (!connected.value) {
        reject(new Error(`Cannot emit "${event}": Socket not connected`))
        return
      }

      socketIo.emit(event, data, (response: R) => {
        resolve(response)
      })

      // Timeout après 10 secondes
      setTimeout(() => {
        reject(new Error(`Timeout waiting for acknowledgement of "${event}"`))
      }, 10000)
    })
  }

  // Remove specific listener
  const off = (event: string, callback?: (...args: any[]) => void) => {
    socketIo.off(event, callback)

    // Retirer du tableau des listeners
    const index = listeners.findIndex(
      (l) => l.event === event && (!callback || l.callback === callback),
    )
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  // Connect socket manually
  const connect = () => {
    initializeSocket()
  }

  // Disconnect socket manually
  const disconnect = () => {
    if (!isInitialized) {
      return
    }

    // Nettoyer les listeners système
    socketIo.off('connect', handleConnect)
    socketIo.off('disconnect', handleDisconnect)
    socketIo.off('connect_error', handleConnectError)

    // Déconnecter
    socketIo.disconnect()

    // Réinitialiser les états
    connected.value = false
    reconnectAttempts.value = 0
    isInitialized = false

  }

  // Cleanup on unmount (ne déconnecte pas, juste nettoie les listeners du composant)
  onUnmounted(() => {
    listeners.forEach(({ event, callback }) => {
      socketIo.off(event, callback)
    })
    listeners.length = 0
  })

  return {
    on,
    emit,
    emitWithAck,
    off,
    connect,
    disconnect,
    isConnected: computed(() => connected.value),
    reconnectAttempts: computed(() => reconnectAttempts.value),
  }
}
