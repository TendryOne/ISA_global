export interface SettingsInterface {
  registrationDate: Date | null;
  documentReviewDate: Date | null;
  resultsPublicationDate: Date | null;
  finalEnrollmentDate: Date | null;
  isResultAvailable: boolean;
  isInscriptionOpen: boolean;
  maintenanceMode: boolean;
  plannedStartDate: Date | null;
  isAutomatic: boolean;
}