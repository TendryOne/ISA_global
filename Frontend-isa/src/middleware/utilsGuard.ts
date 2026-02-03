import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { levelAvailable } from '@/data/levelData'
import { semesters } from '@/data/semester'
/**
 * Guard pour valider le paramètre level (L1, L2, L3)
 */
export const validateLevelGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const validLevels = levelAvailable.filter((level) => level.available).map((level) => level.value)
  const level = to.params.level as string

  if (!level || !validLevels.includes(level.toUpperCase())) {
    next({ path: '/not-found' })
    return
  }

  next()
}

/**
 * Guard pour valider le paramètre semester (S1, S2, S3, S4, S5, S6)
 */
export const validateSemesterGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const validSemesters = semesters.filter((sem) => sem.available).map((sem) => sem.code)
  const semester = to.params.semester as string

  if (!semester || !validSemesters.includes(semester.toUpperCase())) {
    next({ path: '/not-found' })
    return
  }

  next()
}

/**
 * Guard pour valider un ID MongoDB (format hexadécimal 24 caractères)
 */
export const validateMongoIdGuard = (paramName: string = 'id') => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const id = to.params[paramName] as string
    const mongoIdRegex = /^[a-f\d]{24}$/i

    if (!id || !mongoIdRegex.test(id)) {
      next({ path: '/not-found' })
      return
    }

    next()
  }
}

/**
 * Guard combiné pour valider level ET semester
 */
export const validateLevelAndSemesterGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) => {
  const validLevels = ['L1', 'L2', 'L3', 'M1', 'M2']
  const validSemesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10']

  const level = to.params.level as string
  const semester = to.params.semester as string

  // Valider le level
  if (!level || !validLevels.includes(level.toUpperCase())) {
    next({ path: '/not-found' })
    return
  }

  // Valider le semester
  if (!semester || !validSemesters.includes(semester.toUpperCase())) {
    next({ path: '/not-found' })
    return
  }

  next()
}

/**
 * Guard pour valider plusieurs IDs MongoDB dans les paramètres
 */
export const validateMultipleMongoIdsGuard = (...paramNames: string[]) => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const mongoIdRegex = /^[a-f\d]{24}$/i

    for (const paramName of paramNames) {
      const id = to.params[paramName] as string

      if (!id || !mongoIdRegex.test(id)) {
        next({ path: '/not-found' })
        return
      }
    }

    next()
  }
}

/**
 * Guard pour valider le paramètre filière (avec paramName flexible)
 * Filières autorisées : BTP, Informatique, Gestion
 * Peut être utilisé pour 'field', 'filiere', ou tout autre nom de paramètre
 */
export const validateFiliereGuard = (paramName: string = 'filiere') => {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const validFilieres = ['btp', 'informatique', 'gestion']
    const filiere = to.params[paramName] as string

    if (!filiere || !validFilieres.includes(filiere.toLowerCase())) {
      next({ path: '/not-found' })
      return
    }

    next()
  }
}
