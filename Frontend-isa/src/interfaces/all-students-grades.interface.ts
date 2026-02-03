// Types/Interfaces pour les données que tu as fournies

export type SessionType = 'normal' | 'rattrapage' | string
export type GradeStatus = 'graded' | 'not_submitted' | 'missing' | string

export interface Grade {
  teachingUnitCode: string
  teachingUnitName: string
  moduleCode: string
  moduleTitle: string
  moduleCoefficient: number
  semester: number
  assignmentId: string
  assignmentTitle: string
  session: SessionType
  grade: number | null // null si non rendu
  status: GradeStatus
}

export interface StudentInterfaceGrades {
  _id: string
  matricule: string
  firstName: string // <--- demandé
  name: string
  grades: Grade[]
}

export interface ModuleInterfaceGrades {
  _id: string
  code: string
  title: string
  coefficient: number
  credits: number
}

export interface TeachingUnitInterfaceGrades {
  _id: string
  name: string
  code: string
  field: string
  level: string
  semester: number
  credits: number
  modules: ModuleInterfaceGrades[]
}

export interface RootData {
  students: StudentInterfaceGrades[]
  teachingUnits: TeachingUnitInterfaceGrades[]
}
