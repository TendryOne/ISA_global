export default interface ResourcesInterface {
  _id: string
  title: string
  description: string
  link: string
  module: string
  type: 'video' | 'document'
  promotion: string
  createdAt: Date
  updatedAt: Date
}
