import { useMyUserStore } from '@/stores/userStore'

export const isNotAuthenticatedGuard = () => {
  const userStore = useMyUserStore()
  if (userStore.isAuthenticated && userStore.currentUser?.role) {
    const role = userStore.currentUser.role
    if (role === 'student' || role?.includes?.('student')) {
      return '/student'
    } else if (role === 'professor' || role?.includes?.('professor')) {
      return '/professor'
    } else if (role === 'admin' || role === 'superAdmin' || role?.includes?.('admin') || role?.includes?.('superAdmin')) {
      return '/admin'
    }
    return '/student'
  }
}

export const isAuthenticatedGuard = () => {
  if (!useMyUserStore().isAuthenticated) {
    return '/login'
  }
}
