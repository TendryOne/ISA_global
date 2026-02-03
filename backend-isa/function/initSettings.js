const settingQueries = require('../queries/settings.queries')

async function initSettings() {
    try {
        const settings = await settingQueries.GetSettings()
        if (!settings) {
            await settingQueries.CreateSettings({
                resultsPublicationDate: null,
                finalEnrollmentDate: null,
                registrationDate: null,
                documentReviewDate: null,
                isResultAvailable: false,
                isInscriptionOpen: false,
                isAutomatic: false,
                maintenanceMode: false
            })
        }

        console.log("Settings initialized")
    } catch (error) {
        console.error("Error initializing settings:", error)
    }
}


module.exports = initSettings