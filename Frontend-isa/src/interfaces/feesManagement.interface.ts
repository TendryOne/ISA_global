export interface FeesManagementInterface {
  _id: string
  field: string
  level: string
  fees: number
  echeances: [
    {
      date: Date
      amount: number
      label: string
    },
  ]
  createdAt: string
  updatedAt: Date
  vague: string
}
