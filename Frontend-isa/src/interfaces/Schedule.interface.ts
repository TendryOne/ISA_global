import type AdminInterface from './admin.interface'
import type ModuleInterface from './module.interface'
import type ProfessorInterface from './professor.interface'
import type StudentInterface from './student.intefaces'

export default interface ScheduleInterface {
  _id: string
  promotions: string[]
  module: ModuleInterface
  title: string
  description: string
  room: string
  courseType: 'cm' | 'td' | 'tp' | 'exam' | 'other'
  date: Date
  startTime: string
  endTime: string
  duration: number
  type: 'presentiel' | 'distanciel' | 'hybride'
  googleMeetLink?: string
  department: ('informatique' | 'btp' | 'gestion')[]
  createdAt: Date
  updatedAt: Date
  createdBy: AdminInterface
  professor: ProfessorInterface
  approvedByCron: boolean
  status: 'pending' | 'missed' | 'done'
  studentReclamations: Partial<StudentInterface>[]
  approvedManuallyAfterCronBy: Partial<AdminInterface>
  modifiedBy: Partial<AdminInterface>
}
