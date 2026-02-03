import type AdminInterface from './admin.interface'
import type PromotionInterface from './promotion.interface'
import type StudentInterface from './student.intefaces'

export interface AdministrativeRequestInterface {
  _id: string
  student: Pick<StudentInterface, '_id' | 'matricule' | 'firstName' | 'name' | 'field' | 'level'>
  promotion: Pick<PromotionInterface, '_id' | 'name' | 'level' | 'field'>
  status: 'pending' | 'in-progress' | 'recoverable' | 'delivered' | 'cancelled'
  requestType: 'transcript' | 'enrollment_certificate' | 'diploma'
  recoveryDate: Date | null
  handledBy: Pick<AdminInterface, '_id' | 'firstName' | 'name'> | null
  createdAt: Date
  updatedAt: Date
}
