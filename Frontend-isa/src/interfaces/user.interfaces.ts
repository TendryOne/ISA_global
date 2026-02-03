export default interface UserInterface {
  _id: string
  matricule: string
  password: string
  name: string
  email: string
  firstName: string
  role: 'admin' | 'student' | 'professor' | 'superAdmin'
  address: string
  phone: string
  gender: 'male' | 'female'
  resetPasswordToken: string
  resetPasswordExpires: string
  configs: {
    defaultPassword: boolean
    lastPasswordChange: Date | null
  }
  createdAt: Date
}
