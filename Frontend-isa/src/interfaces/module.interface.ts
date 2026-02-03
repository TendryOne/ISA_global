import type ProfessorInterface from './professor.interface'
import type TeachingUnitInterface from './teachingUnit.interface'

// type générique pour les refs mongoose
type Ref<T> = string | T

export default interface ModuleInterface {
  _id: string
  code: string
  title: string
  coefficient: number
  credits: number
  teacher: Ref<ProfessorInterface>
  teachingUnit: Ref<TeachingUnitInterface>
  type: 'Cours Magistral' | 'TD' | 'TP'
  hours: number
  description: string
  files: string[]
}
