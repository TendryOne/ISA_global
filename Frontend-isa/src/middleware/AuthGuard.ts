import { useMyUserStore } from '@/stores/userStore'

export const isNotAuthenticatedGuard = () => {
  const userStore = useMyUserStore()
  if (userStore.isAuthenticated && userStore.currentUser?.role) {
    const role = userStore.currentUser.role
    if (role === 'student' || (typeof role === 'string' && role.includes('student'))) {
      return '/student'
    } else if (role === 'professor' || (typeof role === 'string' && role.includes('professor'))) {
      return '/professor'
    } else if (role === 'admin' || role === 'superAdmin' || (typeof role === 'string' && (role.includes('admin') || role.includes('superAdmin')))) {
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
