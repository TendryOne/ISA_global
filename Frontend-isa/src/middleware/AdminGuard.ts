import { useMyUserStore } from '@/stores/userStore'

export const isAdminGuard = () => {
  if (
    useMyUserStore().currentUser?.role?.includes('admin') ||
    useMyUserStore().currentUser?.role?.includes('superAdmin')
  ) {
    return '/'
  }
}

export const isNotAdminGuard = () => {
  if (
    useMyUserStore().currentUser?.role?.includes('admin') ||
    useMyUserStore().currentUser?.role?.includes('superAdmin')
  ) {
    return '/admin'
  }
}
