import { io } from 'socket.io-client'
const socketUrl = process.env.NODE_ENV === 'production' ? 'https://api.isa-ambato.mg' : 'http://localhost:4000'
export const socketIo = io(socketUrl, {
  withCredentials: true, // ✅ IMPORTANT : Envoyer les cookies de session
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
})
