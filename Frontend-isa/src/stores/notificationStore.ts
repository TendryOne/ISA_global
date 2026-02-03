import type { NotificationInterface } from '@/interfaces/notification.interface'
import axios from 'axios'
import { defineStore } from 'pinia'

interface NotificationStateStoreInterface {
  notifications: NotificationInterface[]
  unseenCount: number
  isOpen: boolean
  loaded: boolean
}

export const UseNotificationStore = defineStore('notificationStore', {
  state: (): NotificationStateStoreInterface => ({
    notifications: [],
    unseenCount: 0,
    isOpen: false,
    loaded: false,
  }),

  actions: {
    // 🔥 MERGE (PAS ÉCRASER)
    SetNotifications(data: NotificationInterface[]) {
      this.notifications = [...this.notifications, ...data]

      this.loaded = true
    },

    addNotification(notification: NotificationInterface) {
      // éviter doublon
      if (this.notifications.some((n) => n._id === notification._id)) return

      this.notifications.unshift(notification)
      this.unseenCount++
      this.loaded = true
    },

    setUnseenCount(count: number) {
      this.unseenCount = count
    },

    toggleNotificationDropdown() {
      this.isOpen = !this.isOpen
    },

    resetNotificationsStore() {
      this.notifications = []
      this.unseenCount = 0
      this.isOpen = false
      this.loaded = false
    },
  },
})
