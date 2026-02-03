import { io } from 'socket.io-client'
export const socketIo = io('http://localhost:4000', {
  withCredentials: true, // ✅ IMPORTANT : Envoyer les cookies de session
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})
