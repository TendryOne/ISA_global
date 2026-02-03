# 🔌 Guide d'utilisation du Composable Socket

## Installation

Le composable `useSocket` est déjà configuré et prêt à l'emploi dans votre projet.

## Utilisation dans un composant

### 1. Importer le composable

```typescript
import { useSocket } from '@/composables/useSocket'

const { on, emit, isConnected } = useSocket()
```

### 2. Écouter des événements (dans `onMounted`)

```typescript
import { onMounted } from 'vue'

onMounted(() => {
  // Écouter un événement
  on<DataType>('eventName', (data) => {
    console.log('Données reçues:', data)
    // Faire quelque chose avec les données
  })
})
```

### 3. Émettre des événements

```typescript
const saveData = async () => {
  // Sauvegarder dans la base de données
  await axios.post('/api/data', data)

  // Notifier les autres utilisateurs via socket
  emit('dataCreated', data)
}
```

## Exemples Complets

### Exemple 1 : Emploi du temps (TheScheduleView.vue)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocket } from '@/composables/useSocket'
import type ScheduleInterface from '@/interfaces/Schedule.interface'

const { on, emit, isConnected } = useSocket()
const schedules = ref<ScheduleInterface[]>([])

onMounted(() => {
  // Écouter les nouveaux cours
  on<ScheduleInterface>('scheduleCreated', (schedule) => {
    schedules.value.push(schedule)
  })

  // Écouter les mises à jour
  on<ScheduleInterface>('scheduleUpdated', (schedule) => {
    const index = schedules.value.findIndex((s) => s._id === schedule._id)
    if (index !== -1) {
      schedules.value[index] = schedule
    }
  })

  // Écouter les suppressions
  on<{ id: string }>('scheduleDeleted', ({ id }) => {
    const index = schedules.value.findIndex((s) => s._id === id)
    if (index !== -1) {
      schedules.value.splice(index, 1)
    }
  })
})

const createSchedule = async (data: ScheduleInterface) => {
  const response = await axios.post('/api/schedules', data)
  emit('scheduleCreated', response.data)
}
</script>
```

### Exemple 2 : Notifications (TheHeaderNotification.vue)

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocket } from '@/composables/useSocket'
import type { NotificationInterface } from '@/interfaces/notification.interface'

const { on, emit } = useSocket()
const notifications = ref<NotificationInterface[]>([])

onMounted(() => {
  // Écouter les nouvelles notifications
  on<NotificationInterface>('newNotification', (notification) => {
    notifications.value.unshift(notification)
  })

  on<NotificationInterface>('receiveScheduleNotification', (notification) => {
    notifications.value.unshift(notification)
  })
})

const markAsRead = (notificationId: string) => {
  emit('markNotificationRead', { notificationId })
}
</script>
```

### Exemple 3 : Chat en temps réel

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSocket } from '@/composables/useSocket'

const { on, emit, isConnected } = useSocket()
const messages = ref<any[]>([])

onMounted(() => {
  // Écouter les nouveaux messages
  on<{ message: string; user: string; timestamp: Date }>('newMessage', (data) => {
    messages.value.push(data)
  })

  // Écouter quand quelqu'un tape
  on<{ user: string; isTyping: boolean }>('userTyping', (data) => {
    console.log(`${data.user} est en train de taper...`)
  })
})

const sendMessage = (message: string) => {
  if (isConnected.value) {
    emit('sendMessage', { message })
  } else {
    console.error('Socket non connecté')
  }
}

const notifyTyping = (isTyping: boolean) => {
  emit('typing', { isTyping })
}
</script>
```

### Exemple 4 : Présence utilisateur

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSocket } from '@/composables/useSocket'

const { on, emit } = useSocket()
const onlineUsers = ref<string[]>([])

onMounted(() => {
  // Écouter les utilisateurs en ligne
  on<{ userId: string }>('userOnline', ({ userId }) => {
    if (!onlineUsers.value.includes(userId)) {
      onlineUsers.value.push(userId)
    }
  })

  on<{ userId: string }>('userOffline', ({ userId }) => {
    const index = onlineUsers.value.indexOf(userId)
    if (index !== -1) {
      onlineUsers.value.splice(index, 1)
    }
  })

  // Notifier que je suis en ligne
  emit('imOnline')
})

onUnmounted(() => {
  // Notifier que je me déconnecte
  emit('imOffline')
})
</script>
```

## Événements Socket Disponibles

### Emploi du temps

- **Écouter :**
  - `scheduleCreated` - Nouveau cours créé
  - `scheduleUpdated` - Cours mis à jour
  - `scheduleDeleted` - Cours supprimé
- **Émettre :**
  - `sendScheduleNotification` - Envoyer une notification de cours

### Notifications

- **Écouter :**
  - `newNotification` - Nouvelle notification
  - `receiveScheduleNotification` - Notification d'emploi du temps
- **Émettre :**
  - `markNotificationRead` - Marquer comme lu

## Bonnes Pratiques

### ✅ À FAIRE

1. **Toujours écouter dans `onMounted`**

   ```typescript
   onMounted(() => {
     on('event', handler)
   })
   ```

2. **Utiliser TypeScript pour typer les données**

   ```typescript
   on<ScheduleInterface>('scheduleCreated', (schedule) => {
     // schedule est typé
   })
   ```

3. **Vérifier la connexion avant d'émettre**

   ```typescript
   if (isConnected.value) {
     emit('event', data)
   }
   ```

4. **Nettoyer automatiquement** (géré par le composable)
   - Les listeners sont automatiquement supprimés avec `onUnmounted`

### ❌ À ÉVITER

1. **Ne pas écouter en dehors de `onMounted`**

   ```typescript
   // ❌ MAUVAIS
   const { on } = useSocket()
   on('event', handler) // Peut créer des doublons
   ```

2. **Ne pas créer de listeners conditionnels sans cleanup**

   ```typescript
   // ❌ MAUVAIS
   if (condition) {
     on('event', handler) // Pas de cleanup si condition change
   }
   ```

3. **Ne pas utiliser `socketIo` directement**

   ```typescript
   // ❌ MAUVAIS
   import { socketIo } from '@/socket/socket-io'
   socketIo.emit('event', data)

   // ✅ BON
   const { emit } = useSocket()
   emit('event', data)
   ```

## Debug

Le composable inclut des logs automatiques :

- 🔌 Socket connected
- ❌ Socket disconnected
- 👂 Listening to "eventName"
- 📤 Emitted "eventName"
- 🧹 Cleaning up X listeners

Pour voir ces logs, ouvrez la console du navigateur.

## Configuration

La configuration socket se trouve dans [`src/socket/socket-io.ts`](src/socket/socket-io.ts):

```typescript
import { io } from 'socket.io-client'

export const socketIo = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
})
```

## Variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
VITE_SOCKET_URL=http://localhost:3000
```

## Troubleshooting

### Le socket ne se connecte pas ?

- Vérifiez que le serveur socket est démarré
- Vérifiez l'URL dans `.env`
- Regardez les logs dans la console

### Les événements sont reçus plusieurs fois ?

- Le composable gère automatiquement les doublons
- Assurez-vous d'appeler `on()` uniquement dans `onMounted`

### Les listeners ne sont pas nettoyés ?

- Le composable nettoie automatiquement avec `onUnmounted`
- Si vous utilisez `off()` manuellement, passez le même callback

## Support

Pour toute question ou problème, contactez l'équipe de développement.
