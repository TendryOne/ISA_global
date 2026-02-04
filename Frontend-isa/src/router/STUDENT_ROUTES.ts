import { validateSemesterGuard } from '@/middleware/utilsGuard'
import type { RouteRecordRaw } from 'vue-router'

export const STUDENT_ROUTES: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    component: () => import('@/views/Student/TheStudentView.vue'),
  },
  {
    path: 'administrative-requests',
    component: () =>
      import('@/views/Student/administrative-requests/TheStudentAdministrativeRequests.vue'),
  },
  {
    path: 'courses',
    component: () => import('@/views/Student/courses/TheStudentCousrsesView.vue'),
    children: [
      {
        path: ':semester/:promotionId',
        component: () => import('@/views/Student/courses/Semester/TheCoursesSemester.vue'),
        beforeEnter: validateSemesterGuard,
        children: [
          {
            path: ':moduleId',
            component: () =>
              import('@/views/Student/courses/Semester/modules/TheCoursesSemesterModule.vue'),
            beforeEnter: (to, from, next) => {
              const moduleId = to.params.moduleId as string
              if (!moduleId || moduleId.length !== 24) {
                return next({ path: '/not-found' })
              }
              next()
            },
            children: [
              {
                path: 'resources',
                component: () =>
                  import(
                    '@/views/Student/courses/Semester/modules/resources/TheRessourcesStudentView.vue'
                  ),
              },
              {
                path: 'grades',
                component: () =>
                  import(
                    '@/views/Student/courses/Semester/modules/grades/TheGradesStudentView.vue'
                  ),
              },
              {
                path: 'assignments',
                component: () =>
                  import(
                    '@/views/Student/courses/Semester/modules/assignment/TheAssignmentStudentView.vue'
                  ),
                children: [
                  {
                    path: ':assignmentId',
                    component: () =>
                      import(
                        '@/views/Student/courses/Semester/modules/assignment/submission/TheStudentSubmissionAssignmentView.vue'
                      ),
                    beforeEnter: (to, from, next) => {
                      const assignmentId = to.params.assignmentId as string
                      if (!assignmentId || assignmentId.length !== 24) {
                        return next({ path: '/not-found' })
                      }
                      next()
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'grades',
    component: () => import('@/views/Student/grades/TheStudentGrades.vue'),
    children: [
      {
        path: ':promotionId',
        component: () =>
          import('@/views/Student/grades/promotion/TheStudentGradesPromotionView.vue'),
      },
    ],
  },
  {
    path: 'schedule',
    component: () => import('@/views/Student/Schedule/TheStudentScheduleView.vue'),
  },
  {
    path: 'newFees',
    component: () => import('@/views/Student/tutionFees/newFees/TheNewFeesStudentView.vue'),
  },
  {
    path: 'fees',
    component: () => import('@/views/Student/tutionFees/TheTutionFeesView.vue'),
    children: [
      {
        path: ':promotionId',
        component: () => import('@/views/Student/tutionFees/TheTutionFeesPromotionView.vue'),
      },
    ],
  },
]
