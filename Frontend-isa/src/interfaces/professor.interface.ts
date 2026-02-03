import type UserInterface from './user.interfaces'

export default interface ProfessorInterface extends UserInterface {
  department: ('informatique' | 'btp' | 'gestion')[]
  isPermanent: boolean
  hireDate: Date
  emailProfessional: string
  salaryType: 'mensuel' | 'horaire'
  salaryAmount: number
}
