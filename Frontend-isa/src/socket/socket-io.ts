import { io } from 'socket.io-client'
const socketUrl = 'https://api.isa-ambato.mg'
export const socketIo = io(socketUrl, {
  withCredentials: true, // ✅ IMPORTANT : Envoyer les cookies de session
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})
