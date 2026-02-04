import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_ROUTES } from './AUTH_ROUTES'
import { isAuthenticatedGuard, isNotAuthenticatedGuard } from '@/middleware/AuthGuard'
import { isNotAdminGuard } from '@/middleware/AdminGuard'
import { isNotProfessorGuard } from '@/middleware/ProfessorGuard'
import { isNotStudentGuard } from '@/middleware/StudentGuard'
import { useMyUserStore } from '@/stores/userStore'
import { ADMIN_ROUTES } from './ADMIN_ROUTES'
import { PROF_ROUTES } from './PROF_ROUTES'
import { STUDENT_ROUTES } from './STUDENT_ROUTES'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'loginLayout',
      component: () => import('@/Layouts/AuthenticationLayout.vue'),
      beforeEnter: [isNotAuthenticatedGuard],
      redirect: () => {
        return '/login'
      },
      children: AUTH_ROUTES,
    },
    {
      path: '/register',
      beforeEnter: [
        isNotAuthenticatedGuard,
        (to, from) => {
          if (!to.query.token) {
            return '/login'
          }
        },
      ],
      component: () => import('@/Layouts/LayoutRegistration.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/help/TheHelpView.vue'),
    },
    {
      path: '/report',
      component: () => import('@/Layouts/MainLayout.vue'),
      beforeEnter: [isAuthenticatedGuard],
      redirect: () => {
        return '/report/list'
      },
      children: [
        {
          path: 'list',
          component: () => import('@/views/bugReports/TheBugReportListView.vue'),
        },
      ],
    },
    {
      name: 'catchAll',
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/error/TheErrorView.vue'),
    },
    {
      name: 'student',
      path: '/student',
      beforeEnter: [isAuthenticatedGuard, isNotAdminGuard, isNotProfessorGuard],
      component: () => import('@/Layouts/MainLayout.vue'),
      children: STUDENT_ROUTES,
      redirect: () => {
        return '/student/dashboard'
      },
    },
    {
      name: 'Admin',
      path: '/admin',
      beforeEnter: [isAuthenticatedGuard, isNotProfessorGuard, isNotStudentGuard],
      component: () => import('@/Layouts/MainLayout.vue'),
      redirect: () => {
        return '/admin/dashboard'
      },
      children: ADMIN_ROUTES,
    },
    {
      name: 'Professor',
      path: '/professor',
      beforeEnter: [isAuthenticatedGuard, isNotAdminGuard, isNotStudentGuard],
      component: () => import('@/Layouts/MainLayout.vue'),
      children: PROF_ROUTES,
      redirect: () => {
        return '/professor/dashboard'
      },
    },
    {
      name: 'contact',
      path: '/contact',
      component: () => import('@/views/contact/TheContactView.vue'),
    },
    {
      name: 'settings',
      path: '/settings',
      beforeEnter: [isAuthenticatedGuard],
      component: () => import('@/views/settings/TheSettingsView.vue'),
    },
  ],
})

router.beforeEach(async () => {
  try {
    if (!useMyUserStore().loaded) {
      await useMyUserStore().GetUser()
    }
  } catch (error) {
    console.log(error)
  }
})

export default router
