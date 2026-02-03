import type { RouteRecordRaw } from 'vue-router'

export const AUTH_ROUTES: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/Authentication/TheLoginView.vue'),
  },
  {
    name: 'forgotPassword',
    path: '/forgot-password',
    component: () => import('@/views/Authentication/TheForgotPasswordView.vue'),
  },
  {
    name: 'reinitialisePassword',
    path: '/reset-password',
    component: () => import('@/views/Authentication/TheReinitializePasswordView.vue'),
  },
]
