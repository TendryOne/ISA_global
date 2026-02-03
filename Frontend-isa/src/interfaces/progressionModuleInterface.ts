export default interface ProggressionInterface {
  moduleId: string
  title: string
  code: string
  coefficient: number
  credits: number
  promotion: {
    _id: string
    name: string
  }
  hoursPlanned: number
  hoursDone: number
  sessions: Array<{
    _id: string
    date: Date
    duration: number
    startTime: string
    endTime: string
    status: 'pending' | 'missed' | 'done'
  }>
}
