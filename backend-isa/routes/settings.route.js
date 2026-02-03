const { isSuperAdmin } = require("../middleware/AdminVerification")
const settingsQueries = require("../queries/settings.queries")
const { DateTime } = require("luxon")

const router = require("express").Router()

router.get("/", async (req, res) => {
    try {
        const settings = await settingsQueries.GetSettings()
        if (!settings) {
            return res.status(404).json({ message: 'Aucun paramètre trouvé' })
        }
        res.status(200).json(settings)
    } catch (error) {
        console.error('[Settings Route] Erreur GET:', error)
        res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' })
    }
})

// router.get("/status", async (req, res) => {
//     try {
//         const settings = await settingsQueries.GetSettings()
//         if (!settings) {
//             return res.status(404).json({ message: 'Aucun paramètre trouvé' })
//         }

//         const TIMEZONE = 'Indian/Antananarivo'
//         const now = DateTime.now().setZone(TIMEZONE)

//         // Calculer le statut des périodes
//         const status = {
//             isAutomatic: settings.isAutomatic,
//             maintenanceMode: settings.maintenanceMode,
//             currentTime: now.toFormat('dd/MM/yyyy HH:mm'),
//             inscription: {
//                 isOpen: settings.isInscriptionOpen,
//                 period: null,
//                 status: 'Non configuré'
//             },
//             results: {
//                 isAvailable: settings.isResultAvailable,
//                 period: null,
//                 status: 'Non configuré'
//             }
//         }

//         // Analyser la période d'inscription
//         if (settings.registrationDate && settings.finalEnrollmentDate) {
//             const startDate = DateTime.fromISO(settings.registrationDate, { zone: TIMEZONE })
//             const endDate = DateTime.fromISO(settings.finalEnrollmentDate, { zone: TIMEZONE })

//             status.inscription.period = {
//                 start: startDate.toFormat('dd/MM/yyyy HH:mm'),
//                 end: endDate.toFormat('dd/MM/yyyy HH:mm')
//             }

//             if (now < startDate) {
//                 status.inscription.status = 'À venir'
//             } else if (now >= startDate && now <= endDate) {
//                 status.inscription.status = 'En cours'
//             } else {
//                 status.inscription.status = 'Terminé'
//             }
//         }

//         // Analyser la période des résultats
//         if (settings.resultsPublicationDate) {
//             const publicationDate = DateTime.fromISO(settings.resultsPublicationDate, { zone: TIMEZONE })
//             const endDate = publicationDate.plus({ weeks: 3 })

//             status.results.period = {
//                 start: publicationDate.toFormat('dd/MM/yyyy HH:mm'),
//                 end: endDate.toFormat('dd/MM/yyyy HH:mm')
//             }

//             if (now < publicationDate) {
//                 status.results.status = 'À venir'
//             } else if (now >= publicationDate && now <= endDate) {
//                 status.results.status = 'Disponible'
//             } else {
//                 status.results.status = 'Expiré'
//             }
//         }

//         res.status(200).json({ settings, status })
//     } catch (error) {
//         console.error('[Settings Route] Erreur GET status:', error)
//         res.status(500).json({ message: 'Erreur lors de la récupération du statut' })
//     }
// })

router.patch("/", isSuperAdmin, async (req, res) => {
    try {
        const settings = await settingsQueries.GetSettings()
        if (!settings) {
            return res.status(404).json({ message: 'Aucun paramètre trouvé' })
        }

        // Utiliser la fonction avec reprogrammation automatique
        const updatedSettings = await settingsQueries.UpdateSettingsWithReschedule(settings._id, req.body)

        console.log('[Settings Route] Paramètres mis à jour avec reprogrammation automatique')
        res.status(200).json(updatedSettings)
    } catch (error) {
        console.error('[Settings Route] Erreur PATCH:', error)
        res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres' })
    }
})

// router.post("/force-reschedule", async (req, res) => {
//     try {
//         const { rescheduleJobsAfterSettingsUpdate, showScheduledJobsSummary } = require('../script/resultAndInscription')

//         await rescheduleJobsAfterSettingsUpdate()

//         // Afficher le résumé des tâches (optionnel pour debug)
//         showScheduledJobsSummary()

//         res.status(200).json({ message: 'Reprogrammation forcée effectuée avec succès' })
//     } catch (error) {
//         console.error('[Settings Route] Erreur force-reschedule:', error)
//         res.status(500).json({ message: 'Erreur lors de la reprogrammation forcée' })
//     }
// })

module.exports = router