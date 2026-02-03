import { useMyUserStore } from '@/stores/userStore'

export const isNotStudentGuard = () => {
  if (useMyUserStore().currentUser?.role.includes('student')) {
    return '/student'
  }
}
