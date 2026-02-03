import type { RouteRecordRaw } from 'vue-router'

export const SETTINGS_ROUTES: RouteRecordRaw[] = [
  {
    name: 'profiles',
    path: 'profiles',
    component: () => import('@/views/settings/TheProfileSettingsView.vue'),
  },
  {
    name: 'contact',
    path: 'contact',
    component: () => import('@/views/settings/TheContactSettingsView.vue'),
  },
  {
    name: 'account',
    path: 'account',
    component: () => import('@/views/settings/TheAccountSettingsView.vue'),
  },
  {
    name: 'preferences',
    path: 'preferences',
    component: () => import('@/views/settings/ThePreferencesSettingsView.vue'),
  },
  {
    name: 'security',
    path: 'security',
    component: () => import('@/views/settings/TheSecuritySettingsView.vue'),
  },
  {
    name: 'files',
    path: 'files',
    component: () => import('@/views/settings/TheDocumentsSettingsView.vue'),
  },
  {
    name: 'payment',
    path: 'payment',
    component: () => import('@/views/settings/ThePaymentSettingsView.vue'),
  },
]
