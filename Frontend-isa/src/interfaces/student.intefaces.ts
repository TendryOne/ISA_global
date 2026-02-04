import type PromotionInterface from './promotion.interface'
import type UserInterface from './user.interfaces'

export default interface StudentInterface extends UserInterface {
  inscriptionId: string
  birthDate: string
  birthPlace: string
  emergencyContactName: string
  emergencyContactRelation: string
  emergencyContactPhone: string
  lastDiploma: string
  bacSeries: string
  bacYear: string
  previousInstitution: string
  field: string
  bacTranscript: string
  idDocument: string
  residenceCertificate: string
  identityPhoto: string
  createdAt: Date
  cin: string
  level: string
  verified: boolean
  isRestricted: boolean
  promotionYear: number
  terms: {
    cguAcceptance: boolean
    privacyAcceptance: boolean
    engagementAcceptance: boolean
    charterAcceptance: boolean
  }
  parcours: [
    {
      promotion: PromotionInterface | string
      status: 'in progress' | 'completed' | 'dropped' | 'repeated'
    },
  ]
}
