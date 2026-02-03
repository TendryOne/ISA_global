export interface NotificationInterface {
  title: string
  _id: string
  user: string
  message: string
  promotion: string[]
  type: 'individual' | 'global' | 'promotion' | 'admin' | 'professor' | 'student' | 'superAdmin'
  informationType:
    | 'schedule'
    | 'academic'
    | 'administrative'
    | 'financial'
    | 'announcement'
    | 'pedagogical'
    | 'alert'
    | 'account'
    | 'system'
  warningLevel: 'info' | 'warning' | 'critical' | null
  linkTo: string
  expireAt: Date
  createdAt: Date
}

export interface NotificationSeen {
  lastSeenAt: Date
  user: string
}
