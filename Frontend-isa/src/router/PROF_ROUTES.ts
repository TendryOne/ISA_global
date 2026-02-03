import type { RouteRecordRaw } from 'vue-router'

export const PROF_ROUTES: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    component: () => import('@/views/Professor/dashboard/dashboard/TheProfessorDashboard.vue'),
  },
  {
    path: 'schedule',
    component: () => import('@/views/Professor/schedule/TheScheduleProfessorView.vue'),
  },
  // {
  //   path: 'announcements',
  //   component: () => import('@/views/Professor/announcements/TheProfessorAnnouncementView.vue'),
  // },
  {
    path: 'modules',
    component: () => import('@/views/Professor/modules/TheProfessorModulesView.vue'),
    children: [
      {
        path: ':moduleId',
        component: () => import('@/views/Professor/modules/module/TheProfessorModuleDetail.vue'),
        beforeEnter: (to, from, next) => {
          const id = to.params.moduleId as string
          if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            next()
          } else {
            next({ path: '/not-found' }) // ou une autre page d’erreur
          }
        },
        children: [
          {
            path: 'resources',
            component: () =>
              import('@/views/Professor/modules/module/ressources/TheProfessorRessourcesView.vue'),
          },
          {
            path: 'grades',
            component: () =>
              import('@/views/Professor/modules/module/grades/TheProfessorGradesView.vue'),
          },
          {
            path: 'assignments',
            component: () =>
              import(
                '@/views/Professor/modules/module/assignments/TheProfessorAssignmentsView.vue'
              ),
            children: [
              {
                path: ':assignmentId/promotion/:promotionId',
                component: () =>
                  import(
                    '@/views/Professor/modules/module/assignments/TheAssignmentSubmissionView.vue'
                  ),
              },
            ],
          },
        ],
      },
    ],
  },
]
