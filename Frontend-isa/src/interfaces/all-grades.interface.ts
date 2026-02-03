import type { AssignmentInterface } from './assignment.interface'
import type SubmissionInterface from './submission.interface'
import type TeachingUnitInterface from './teachingUnit.interface'
import type ModuleInterface from './module.interface'

export interface ExamSubmissionInterface {
  assignment: Pick<
    AssignmentInterface,
    '_id' | 'title' | 'session' | 'dueDate' | 'submissionLocation' | 'lockedGrade'
  >
  submission: Pick<
    SubmissionInterface,
    'assignment' | 'fileUrl' | 'submittedAt' | 'grade' | 'status' | 'feedback'
  >
}

export interface ModuleGradesInterface {
  _id: string
  code: string
  title: string
  coefficient: number
  credits: number
  hours: number
  examSubmissions: ExamSubmissionInterface[]
}

export interface AllGradesInterface {
  teachingUnit: Pick<
    TeachingUnitInterface,
    '_id' | 'name' | 'code' | 'field' | 'level' | 'semester' | 'credits'
  >
  modules: ModuleGradesInterface[]
}
