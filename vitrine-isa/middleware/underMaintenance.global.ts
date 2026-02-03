// middleware/maintenance.ts
export default defineNuxtRouteMiddleware((to) => {
    const isUnderMaintenance = useRuntimeConfig().public.maintenanceMode
  
    if (isUnderMaintenance) {      
      if (to.path !== '/underMaintenance') {
        return navigateTo({ path : '/underMaintenance'})
      }
    }else{
      if (to.path == '/underMaintenance') {
        return navigateTo({ path : '/'})
      }
    }
  })