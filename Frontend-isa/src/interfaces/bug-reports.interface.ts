import type UserInterface from './user.interfaces'

export interface BugReportsInterface {
  _id: string
  title: string
  type: 'bug' | 'improvement' | 'other' | 'feature'
  description: string
  reporterMatricule: string
  reporter: UserInterface
  priority: 'low' | 'medium' | 'high' | 'critical'
  isResolved: boolean
  createdAt: Date
  updatedAt: Date
}
