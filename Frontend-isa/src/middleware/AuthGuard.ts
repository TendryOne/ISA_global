import { useMyUserStore } from '@/stores/userStore'

export const isNotAuthenticatedGuard = () => {
  const userStore = useMyUserStore()
  if (userStore.isAuthenticated && userStore.currentUser?.role) {
    const role = userStore.currentUser.role
    const roleStr = typeof role === 'string' ? role : ''

    if (role === 'student' || roleStr.includes('student')) {
      return '/student'
    }
    if (role === 'professor' || roleStr.includes('professor')) {
      return '/professor'
    }
    if (role === 'admin' || role === 'superAdmin' || roleStr.includes('admin') || roleStr.includes('superAdmin')) {
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
