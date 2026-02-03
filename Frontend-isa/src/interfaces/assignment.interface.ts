import type SubmissionInterface from './submission.interface'

export interface AssignmentInterface {
  _id: string
  title: string
  description: string
  dueDate: Date
  module: string
  promotion: string
  professor: string
  session: 'normal' | 'rattrapage'
  type: 'homework' | 'project' | 'exam'
  fileUrl?: string
  submissionLocation?: 'online' | 'in-person'
  isActive: boolean
  lockedGrade?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentStudentInterface extends AssignmentInterface {
  submitted: boolean
}

export interface AssigmentsSubmissionInterface extends AssignmentInterface {
  submission: SubmissionInterface | null
}
