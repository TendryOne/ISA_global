import type StudentInterface from './student.intefaces'
import type UserInterface from './user.interfaces'

export interface InstallmentsInterface {
  label: string
  dueDate: Date
  amount: number
  proofFile: string
  transactionRef: string
  method: string
  verified: boolean
  verifiedBy: string
  paymentDate: Date
  numberOfReminders: number
  lastReminderDate: Date
  updatedAt: string
  createdAt: string
}
export default interface TutionFeesInterface {
  _id: string
  year: number
  user: StudentInterface
  promotion: string
  field: string
  level: string
  totalAmount: number
  installments: InstallmentsInterface[]
  createdAt: string
  updatedAt: string
}
