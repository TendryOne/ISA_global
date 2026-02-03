import {
  validateFiliereGuard,
  validateLevelGuard,
  validateSemesterGuard,
} from '@/middleware/utilsGuard'
import type { RouteRecordRaw } from 'vue-router'

export const ADMIN_ROUTES: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    component: () => import('@/views/Admin/TheAdminView.vue'),
  },
  {
    path: 'pre-inscription',
    component: () => import('@/views/Admin/Admission/ThePreInscriptionView.vue'),
    redirect: () => {
      return '/admin/pre-inscription/list'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/Admin/Admission/ThePreInscriptionListUserView.vue'),
      },
      {
        path: 'pending-user/:id',
        component: () => import('@/views/Admin/Admission/ThePreinscriptionUserView.vue'),
      },
    ],
  },
  {
    path: 'admission',
    component: () => import('@/views/Admin/Admission/TheAdmissionView.vue'),
    redirect: () => {
      return '/admin/admission/list'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/Admin/Admission/TheAdmissionViewList.vue'),
      },
    ],
  },
  {
    path: 'subscribed',
    component: () => import('@/views/Admin/Admission/TheSubscribedUserList.vue'),
  },
  {
    path: 'fees',
    component: () => import('@/views/Admin/Fees/TheFeesView.vue'),
    redirect: () => {
      return '/admin/fees/manage/list'
    },
    children: [
      {
        path: 'manage/list',
        component: () => import('@/views/Admin/Fees/Management/TheFeesManagementList.vue'),
      },
      {
        path: 'manage/new',
        component: () => import('@/views/Admin/Fees/Management/TheFeesManagementForm.vue'),
      },
      {
        path: 'manage/modify/:id',
        component: () => import('@/views/Admin/Fees/Management/TheFeesManagementForm.vue'),
      },
    ],
  },
  {
    path: 'suivi-paiements',
    component: () => import('@/views/Admin/Fees/Tracking/TheFeesTrackingView.vue'),
    children: [
      {
        path: ':filiere',
        component: () => import('@/views/Admin/Fees/Tracking/TheFeesTrackingFiliereView.vue'),
        beforeEnter: validateFiliereGuard('filiere'),
        children: [
          {
            path: ':level',
            component: () => import('@/views/Admin/Fees/Tracking/TheFeesTrackingLevelView.vue'),
            beforeEnter: validateLevelGuard,
            children: [
              {
                path: ':promotionId',
                component: () => import('@/views/Admin/Fees/Tracking/TheFeesTrackingListView.vue'),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'bug-reports',
    component: () => import('@/views/Admin/bugReports/TheAdminBugReportsView.vue'),
    redirect: () => {
      return '/admin/bug-reports/list'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/Admin/bugReports/TheAdminBugReportsList.vue'),
      },
      {
        path: ':reportId',
        component: () => import('@/views/Admin/bugReports/TheAdminBugReportsDetails.vue'),
      },
    ],
  },
  {
    path: 'course',
    component: () => import('@/views/Admin/course/TheCourseView.vue'),
    redirect: () => {
      return '/admin/course/UE'
    },
    children: [
      {
        path: 'UE',
        component: () => import('@/views/Admin/course/UE/TheUEView.vue'),
        children: [
          {
            path: ':filiere',
            component: () => import('@/views/Admin/course/UE/TheFiliere.vue'),
            beforeEnter: validateFiliereGuard('filiere'),
            children: [
              {
                path: ':semester',
                component: () => import('@/views/Admin/course/UE/TheSemester.vue'),
                beforeEnter: validateSemesterGuard,
                children: [
                  {
                    path: ':UE',
                    component: () => import('@/views/Admin/course/UE/TheModule.vue'),
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
    path: 'schedule',
    component: () => import('@/views/Admin/Schedule/TheScheduleView.vue'),
  },

  {
    path: 'users/departments',
    component: () => import('@/views/Admin/users/departments/TheDepartmentsUsersView.vue'),
    redirect: () => {
      return '/admin/users/departments/list'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/Admin/users/departments/TheDepartmentsUsersListView.vue'),
      },
      {
        path: 'new',
        component: () => import('@/views/Admin/users/departments/TheDepartmentsUsersForm.vue'),
      },
      {
        path: 'modify/:id',
        component: () => import('@/views/Admin/users/departments/TheDepartmentsUsersForm.vue'),
      },
    ],
  },

  {
    path: 'users/students',
    component: () => import('@/views/Admin/users/Students/TheStudentsUsersView.vue'),
    children: [
      {
        path: ':id',
        component: () => import('@/views/Admin/users/Students/TheStudentsDetailView.vue'),
        beforeEnter: (to, from, next) => {
          const id = to.params.id as string
          if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            next()
          } else {
            next({ path: '/not-found' }) // ou une autre page d’erreur
          }
        },
      },
    ],
  },
  {
    path: 'users/teachers',
    component: () => import('@/views/Admin/users/Professors/TheProfessorsUsersView.vue'),
    children: [
      {
        path: ':id',
        component: () => import('@/views/Admin/users/Professors/TheProfessorsDetailView.vue'),
        beforeEnter: (to, from, next) => {
          const id = to.params.id as string
          if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
            next()
          } else {
            next({ path: '/not-found' }) // ou une autre page d’erreur
          }
        },
      },
    ],
  },
  {
    path: 'logs',
    component: () => import('@/views/Admin/LOGS/TheLogsView.vue'),
  },
  {
    path: 'announcements',
    component: () => import('@/views/Admin/announcement/TheAdminAnnouncementView.vue'),
  },
  {
    path: 'settings',
    component: () => import('@/views/Admin/settings/TheAdminSettings.vue'),
  },
  {
    path: 'grades',
    component: () => import('@/views/Admin/grades/TheStudentGradesManagement.vue'),
    children: [
      {
        path: ':field',
        component: () => import('@/views/Admin/grades/TheStudentGradesFieldView.vue'),
        beforeEnter: validateFiliereGuard('field'),
        children: [
          {
            path: ':level',
            component: () => import('@/views/Admin/grades/TheStudentGradesLevelView.vue'),
            beforeEnter: validateLevelGuard,
            children: [
              {
                path: ':promotion',
                component: () => import('@/views/Admin/grades/TheStudentGradesPromotionView.vue'),
                beforeEnter: (to, from, next) => {
                  const promotionId = to.params.promotion as string
                  if (promotionId && promotionId.length === 24) {
                    next()
                  } else {
                    next({ path: '/not-found' }) // ou une autre page d’erreur
                  }
                },
                children: [
                  {
                    path: ':student',
                    component: () => import('@/views/Admin/grades/TheStudentGradesView.vue'),
                    beforeEnter: (to, from, next) => {
                      const studentId = to.params.student as string
                      if (studentId && studentId.length === 24) {
                        next()
                      } else {
                        next({ path: '/not-found' }) // ou une autre page d’erreur
                      }
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
    path: 'administrative-requests',
    component: () => import('@/views/Admin/administrativeRequests/AdministrativeRequestsView.vue'),
  },
  {
    path: 'promotions',
    component: () => import('@/views/Admin/promotion/ThePromotionView.vue'),
    children: [
      {
        path: ':filiere',
        component: () => import('@/views/Admin/promotion/ThePromotionFieldView.vue'),
        beforeEnter: validateFiliereGuard('filiere'),
        children: [
          {
            path: ':level',
            component: () => import('@/views/Admin/promotion/ThePromotionLevelView.vue'),
            beforeEnter: validateLevelGuard,
          },
        ],
      },
    ],
  },
]
