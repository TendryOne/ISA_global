import type UserInterface from '@/interfaces/user.interfaces'
import axios from 'axios'
import { defineStore } from 'pinia'
import { UseNotificationStore } from './notificationStore'
import { flushUsageBeforeLogout } from '@/composables/userTracking'
import { PostEventLog } from '@/utils/eventLog'

interface userStateStoreInterface {
  loaded: boolean
  currentUser: UserInterface | null
}

export const useMyUserStore = defineStore('userStore', {
  state: (): userStateStoreInterface => ({
    currentUser: null,
    loaded: false,
  }),

  getters: {
    isAuthenticated(state: userStateStoreInterface): boolean | null {
      if (state.currentUser) {
        return true
      } else if (!state.currentUser && state.loaded) {
        return false
      } else {
        return null
      }
    },
    isStudent(state: userStateStoreInterface) {
      if (state.currentUser && state.currentUser.role && state.currentUser.role.includes('student')) {
        return true
      } else {
        return false
      }
    },
  },

  actions: {
    async Login(values: any) {
      const response = (await axios.post('/api/v1/auth/login', values)).data
      this.currentUser = response
      if (this.currentUser) {
        if (this.currentUser.role === 'student') {
          await PostEventLog({
            entityId: this.currentUser._id,
            entityType: "user",
            eventType: "STUDENT_LOGIN",
            timestamp: new Date(),
            userId: this.currentUser._id,
          })
        } else if (this.currentUser.role === 'professor') {
          await PostEventLog({
            entityId: this.currentUser._id,
            entityType: "user",
            eventType: "PROFESSOR_LOGIN",
            timestamp: new Date(),
            userId: this.currentUser._id,
          })
        }

      }

    },
    async GetUser() {
      try {
        const user = (await axios.get('/api/v1/auth/user')).data
        this.currentUser = user
        this.loaded = true
      } catch (error) {
        this.currentUser = null
        this.loaded = true
        return error
      }
    },
    async Logout() {
      // Forcer l'envoi des données de tracking avant la déconnexion
      flushUsageBeforeLogout()

      // Attendre un court instant pour que la requête /api/v1/usage parte
      await new Promise(resolve => setTimeout(resolve, 100))
      if (this.currentUser!.role === "student") {
        await PostEventLog({
          entityId: this.currentUser!._id,
          entityType: "user",
          eventType: "STUDENT_LOGOUT",
          timestamp: new Date(),
          userId: this.currentUser!._id,
        })
      } else if (this.currentUser!.role === "professor") {
        await PostEventLog({
          entityId: this.currentUser!._id,
          entityType: "user",
          eventType: "PROFESSOR_LOGOUT",
          timestamp: new Date(),
          userId: this.currentUser!._id,
        })
      }

      await axios.post('/api/v1/auth/logout')

      this.currentUser = null
      const notificationStore = UseNotificationStore()
      notificationStore.resetNotificationsStore()
    },
    async updateUserDefaultPassword(values: any) {
      const response = (await axios.patch('/api/v1/user/default-password', values)).data
      this.currentUser = response
    },
    UpdateUserLocally(values: UserInterface) {
      this.currentUser = values as UserInterface
    },

    UpdateUserLocallyWithPartialInfo(values: Partial<UserInterface>) {
      if (!this.currentUser) return;
      this.currentUser = {
        ...this.currentUser,
        ...values,
      }
    },
  },
})
