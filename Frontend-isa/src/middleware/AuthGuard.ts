import { useMyUserStore } from '@/stores/userStore'

export const isNotAuthenticatedGuard = () => {
  if (useMyUserStore().isAuthenticated) {
    return '/student'
  }
}

export const isAuthenticatedGuard = () => {
  if (!useMyUserStore().isAuthenticated) {
    return '/login'
  }
}
