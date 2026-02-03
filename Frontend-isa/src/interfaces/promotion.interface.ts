export default interface PromotionInterface {
  _id?: string
  name: string
  startDate: Date
  endDate: Date
  level: string
  field: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}
