import { useMyUserStore } from '@/stores/userStore'

export const isProfessorGuard = () => {
  if (useMyUserStore().currentUser?.role.includes('professor')) {
    return '/'
  }
}

export const isNotProfessorGuard = () => {
  if (useMyUserStore().currentUser?.role.includes('professor')) {
    return '/professor'
  }
}
