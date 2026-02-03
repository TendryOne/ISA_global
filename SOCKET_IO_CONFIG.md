# Configuration Socket.IO - ISA Ambato

## ✅ Nginx configuré pour WebSocket

Le reverse proxy Nginx est déjà configuré pour supporter Socket.IO sur toutes les routes.

## 🔌 Connexion Socket.IO depuis le Frontend

### Frontend Vue.js (edu.isa-ambato.mg)

```javascript
// src/plugins/socket.js ou src/composables/useSocket.js
import { io } from 'socket.io-client';

const socket = io('https://api.isa-ambato.mg', {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
```

**Usage dans un composant:**

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue';
import socket from '@/plugins/socket';

onMounted(() => {
  // Écouter les événements
  socket.on('notification', (data) => {
    console.log('Nouvelle notification:', data);
  });
  
  socket.on('connect', () => {
    console.log('Socket connecté:', socket.id);
  });
});

onUnmounted(() => {
  // Nettoyer les listeners
  socket.off('notification');
  socket.off('connect');
});

// Émettre un événement
const sendMessage = () => {
  socket.emit('message', { text: 'Hello' });
};
</script>
```

---

### Vitrine Nuxt.js (isa-ambato.mg)

**Installation:**
```bash
npm install socket.io-client
```

**Composable:**
```javascript
// composables/useSocket.js
import { io } from 'socket.io-client';

export const useSocket = () => {
  const config = useRuntimeConfig();
  
  const socket = io(config.public.apiUrl, {
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    withCredentials: true
  });

  return socket;
};
```

**Usage dans une page:**
```vue
<script setup>
const socket = useSocket();

onMounted(() => {
  socket.on('update', (data) => {
    console.log('Mise à jour:', data);
  });
});

onBeforeUnmount(() => {
  socket.disconnect();
});
</script>
```

---

## 🔧 Configuration Backend (backend-isa)

Votre backend Node.js doit être configuré comme suit:

```javascript
// backend-isa/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: [
      'https://edu.isa-ambato.mg',
      'https://isa-ambato.mg',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware Socket.IO
io.on('connection', (socket) => {
  console.log('Client connecté:', socket.id);

  socket.on('message', (data) => {
    console.log('Message reçu:', data);
    // Broadcast à tous les clients
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté:', socket.id);
  });
});

// Routes Express
app.use(cors({
  origin: [
    'https://edu.isa-ambato.mg',
    'https://isa-ambato.mg',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Rendre io accessible dans les routes
app.set('io', io);

// Vos routes
const routes = require('./routes/index.routes');
app.use('/api/v1', routes);

// Démarrer le serveur
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.IO ready');
});
```

---

## 🔄 Utiliser Socket.IO dans vos routes

```javascript
// routes/notifications.routes.js
router.post('/send-notification', async (req, res) => {
  const io = req.app.get('io');
  
  // Envoyer une notification à tous les clients
  io.emit('notification', {
    message: 'Nouvelle annonce',
    timestamp: Date.now()
  });
  
  res.json({ success: true });
});

// Envoyer à un utilisateur spécifique
router.post('/notify-user/:userId', async (req, res) => {
  const io = req.app.get('io');
  const { userId } = req.params;
  
  // Vous devez stocker les socket.id par userId lors de la connexion
  const socketId = getUserSocketId(userId);
  
  if (socketId) {
    io.to(socketId).emit('private-notification', {
      message: 'Message privé'
    });
  }
  
  res.json({ success: true });
});
```

---

## 📊 Test de connexion Socket.IO

### Depuis la console du navigateur

```javascript
// Sur https://edu.isa-ambato.mg ou https://isa-ambato.mg
const socket = io('https://api.isa-ambato.mg', {
  path: '/socket.io/',
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✓ Socket connecté:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('✗ Erreur connexion:', error);
});

// Émettre un événement de test
socket.emit('ping', { data: 'test' });
```

### Test avec curl (polling)

```bash
curl "https://api.isa-ambato.mg/socket.io/?EIO=4&transport=polling"
```

---

## 🔐 Authentification Socket.IO

Pour authentifier les connexions Socket.IO:

```javascript
// Backend
const io = new Server(server, {
  // ...config
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (token) {
    // Vérifier le token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.userId;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Joindre une room par userId
  socket.join(`user:${socket.userId}`);
});
```

```javascript
// Frontend
const token = localStorage.getItem('auth_token');

const socket = io('https://api.isa-ambato.mg', {
  auth: {
    token: token
  }
});
```

---

## 📡 Événements recommandés

```javascript
// Backend - Événements standard
io.emit('notification', data);           // À tous
io.to(socketId).emit('message', data);  // À un client
io.to(room).emit('update', data);       // À une room

// Frontend - Écouter
socket.on('notification', handleNotification);
socket.on('message', handleMessage);
socket.on('update', handleUpdate);
socket.on('connect', () => console.log('Connecté'));
socket.on('disconnect', () => console.log('Déconnecté'));
socket.on('connect_error', (err) => console.error(err));
```

---

## ✅ Vérifications

- [x] Nginx configuré pour WebSocket (`/socket.io/`)
- [x] CORS configuré pour les 3 domaines
- [x] Timeouts WebSocket longs (7 jours)
- [x] Keepalive activé
- [x] Support polling + websocket

---

## 🐛 Dépannage

### Socket ne se connecte pas

```javascript
// Activer les logs de debug
localStorage.debug = 'socket.io-client:*';
```

### Vérifier que nginx transmet bien

```bash
# Logs nginx
docker-compose logs nginx | grep socket.io

# Logs backend
docker-compose logs backend | grep Socket
```

### Test manuel

```bash
# Test WebSocket
wscat -c "wss://api.isa-ambato.mg/socket.io/?EIO=4&transport=websocket"
```

---

**Socket.IO est prêt à l'emploi ! 🚀**
