import type { AssignmentInterface } from './assignment.interface'
import type StudentInterface from './student.intefaces'

export default interface SubmissionInterface {
  _id: string
  student: Partial<StudentInterface>
  assignment: string
  fileUrl: string
  grade: number | null
  feedback: string | null
  status: 'submitted' | 'graded' | 'late' | 'missing' | 'not-submitted'
  lockedGrade: boolean
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface SubmissionProfessorInterface {
  studentId: string
  name: string
  firstName: string
  email: string
  matricule: string
  submission: Partial<SubmissionInterface>
}

export interface SubmissionGradesInterface {
  student: {
    _id: string
    name: string
    firstName: string
    email: string
    matricule: string
    role: string
  }
  submissions: Partial<SubmissionInterface>[]
}

export interface SubmissionStudentInterface extends SubmissionInterface {
  assignmentInfo: Partial<AssignmentInterface>
}
