const schedule = require("node-schedule")
const settingsQueries = require("../queries/settings.queries")
const { DateTime } = require("luxon")

// Stockage des tâches programmées pour pouvoir les annuler
let scheduledJobs = {
    inscriptionStart: null,
    inscriptionEnd: null,
    resultsStart: null,
    resultsEnd: null
};

// Timezone de Madagascar
const TIMEZONE = 'Indian/Antananarivo';

/**
 * Ouvre les inscriptions automatiquement
 */
const openInscriptions = async () => {
    try {
        console.log('[Auto Settings] 🔓 Ouverture automatique des inscriptions...');
        await settingsQueries.UpdateInscriptionStatus(true);
        console.log('[Auto Settings] ✅ Inscriptions OUVERTES automatiquement');
    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de l\'ouverture des inscriptions:', error.message);
    }
};

/**
 * Ferme les inscriptions automatiquement
 */
const closeInscriptions = async () => {
    try {
        console.log('[Auto Settings] 🔒 Fermeture automatique des inscriptions...');
        await settingsQueries.UpdateInscriptionStatus(false);
        console.log('[Auto Settings] ✅ Inscriptions FERMÉES automatiquement');
    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de la fermeture des inscriptions:', error.message);
    }
};

/**
 * Active les résultats automatiquement
 */
const enableResults = async () => {
    try {
        console.log('[Auto Settings] 📊 Activation automatique des résultats...');
        await settingsQueries.UpdateResultStatus(true);
        console.log('[Auto Settings] ✅ Résultats DISPONIBLES automatiquement');
    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de l\'activation des résultats:', error.message);
    }
};

/**
 * Désactive les résultats automatiquement
 */
const disableResults = async () => {
    try {
        console.log('[Auto Settings] 📊 Désactivation automatique des résultats...');
        await settingsQueries.UpdateResultStatus(false);
        console.log('[Auto Settings] ✅ Résultats NON DISPONIBLES automatiquement');
    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de la désactivation des résultats:', error.message);
    }
};

/**
 * Annule toutes les tâches programmées
 */
const cancelAllScheduledJobs = () => {
    console.log('[Auto Settings] 🗑️ Annulation de toutes les tâches programmées...');
    let cancelledCount = 0;

    Object.keys(scheduledJobs).forEach(jobName => {
        if (scheduledJobs[jobName]) {
            scheduledJobs[jobName].cancel();
            scheduledJobs[jobName] = null;
            cancelledCount++;
        }
    });

    if (cancelledCount > 0) {
        console.log(`[Auto Settings] ✅ ${cancelledCount} tâche(s) annulée(s)`);
    } else {
        console.log('[Auto Settings] ℹ️ Aucune tâche à annuler');
    }
};

/**
 * Convertit une date en DateTime avec timezone Madagascar
 */
const parseDate = (dateValue, fieldName) => {
    try {
        console.log(`[Auto Settings] Parsing ${fieldName}:`, dateValue, typeof dateValue);

        if (!dateValue) {
            return null;
        }

        let dateTime;

        // Si c'est une string (format ISO "2025-09-16T23:00")
        if (typeof dateValue === 'string') {
            dateTime = DateTime.fromISO(dateValue, { zone: TIMEZONE });
        }
        // Si c'est un objet Date (depuis MongoDB)
        else if (dateValue instanceof Date) {
            dateTime = DateTime.fromJSDate(dateValue, { zone: TIMEZONE });
        }
        // Si c'est un objet avec une propriété toISOString (Date-like)
        else if (dateValue && typeof dateValue.toISOString === 'function') {
            dateTime = DateTime.fromJSDate(new Date(dateValue), { zone: TIMEZONE });
        }
        else {
            console.error(`[Auto Settings] Format de date non supporté pour ${fieldName}:`, typeof dateValue);
            return null;
        }

        if (!dateTime.isValid) {
            console.error(`[Auto Settings] Date invalide pour ${fieldName}:`, dateTime.invalidReason);
            return null;
        }

        console.log(`[Auto Settings] ${fieldName} parsée avec succès: ${dateTime.toFormat('dd/MM/yyyy HH:mm')}`);
        return dateTime;

    } catch (error) {
        console.error(`[Auto Settings] Erreur parsing ${fieldName}:`, error.message);
        return null;
    }
};

/**
 * Programme une tâche à une date spécifique
 */
const scheduleJob = (jobName, dateValue, callback, description) => {
    try {
        const dateTime = parseDate(dateValue, jobName);

        if (!dateTime) {
            console.error(`[Auto Settings] ❌ Impossible de programmer ${description} - date invalide`);
            return null;
        }

        const now = DateTime.now().setZone(TIMEZONE);

        // Vérifier si la date est dans le futur
        if (dateTime <= now) {
            console.log(`[Auto Settings] ⚠️ ${description} - Date passée (${dateTime.toFormat('dd/MM/yyyy HH:mm')}), exécution immédiate`);
            callback();
            return null;
        }

        // Programmer la tâche
        const job = schedule.scheduleJob(dateTime.toJSDate(), callback);

        if (job) {
            console.log(`[Auto Settings] ⏰ ${description} programmée pour le ${dateTime.toFormat('dd/MM/yyyy HH:mm')} (Madagascar)`);
            return job;
        } else {
            console.error(`[Auto Settings] ❌ Échec de la programmation: ${description}`);
            return null;
        }
    } catch (error) {
        console.error(`[Auto Settings] ❌ Erreur lors de la programmation de ${description}:`, error.message);
        return null;
    }
};/**
 * Programme toutes les tâches basées sur les paramètres actuels
 */
const scheduleAllJobs = async () => {
    try {
        console.log('[Auto Settings] 🚀 Programmation de toutes les tâches automatiques...');

        const settings = await settingsQueries.GetSettings();
        if (!settings) {
            console.log('[Auto Settings] ❌ Aucun paramètre trouvé');
            return;
        }

        if (!settings.isAutomatic) {
            console.log('[Auto Settings] ⚠️ Mode automatique désactivé - aucune tâche programmée');
            return;
        }

        // Annuler toutes les tâches existantes avant d'en programmer de nouvelles
        cancelAllScheduledJobs();

        let jobsScheduled = 0;

        // === PROGRAMMATION DES INSCRIPTIONS ===
        if (settings.registrationDate) {
            scheduledJobs.inscriptionStart = scheduleJob(
                'inscriptionStart',
                settings.registrationDate,
                openInscriptions,
                'Ouverture des inscriptions'
            );
            if (scheduledJobs.inscriptionStart) jobsScheduled++;
        }

        if (settings.finalEnrollmentDate) {
            scheduledJobs.inscriptionEnd = scheduleJob(
                'inscriptionEnd',
                settings.finalEnrollmentDate,
                closeInscriptions,
                'Fermeture des inscriptions'
            );
            if (scheduledJobs.inscriptionEnd) jobsScheduled++;
        }

        // === PROGRAMMATION DES RÉSULTATS ===
        if (settings.resultsPublicationDate) {
            scheduledJobs.resultsStart = scheduleJob(
                'resultsStart',
                settings.resultsPublicationDate,
                enableResults,
                'Activation des résultats'
            );
            if (scheduledJobs.resultsStart) jobsScheduled++;

            // Calculer la date de fin (3 semaines après publication)
            const publicationDate = parseDate(settings.resultsPublicationDate, 'resultsPublicationDate');
            if (publicationDate) {
                const resultsEndDate = publicationDate.plus({ weeks: 3 });

                scheduledJobs.resultsEnd = scheduleJob(
                    'resultsEnd',
                    resultsEndDate.toISO(),
                    disableResults,
                    'Désactivation des résultats (fin 3 semaines)'
                );
                if (scheduledJobs.resultsEnd) jobsScheduled++;
            }
        }

        console.log(`[Auto Settings] ✅ ${jobsScheduled} tâche(s) programmée(s) avec succès`);

        // Afficher le résumé des tâches actives
        showScheduledJobsSummary();

    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de la programmation des tâches:', error.message);
    }
};

/**
 * Affiche un résumé des tâches programmées
 */
const showScheduledJobsSummary = () => {
    console.log('\n[Auto Settings] 📋 RÉSUMÉ DES TÂCHES PROGRAMMÉES:');

    Object.keys(scheduledJobs).forEach(jobName => {
        if (scheduledJobs[jobName]) {
            const nextInvocation = scheduledJobs[jobName].nextInvocation();
            if (nextInvocation) {
                const dateTime = DateTime.fromJSDate(nextInvocation).setZone(TIMEZONE);
                console.log(`  ⏰ ${jobName}: ${dateTime.toFormat('dd/MM/yyyy HH:mm')} (Madagascar)`);
            } else {
                console.log(`  ⚠️ ${jobName}: Erreur - pas de prochaine exécution`);
            }
        } else {
            console.log(`  ❌ ${jobName}: Non programmée (date invalide ou passée)`);
        }
    });

    const activeJobs = Object.values(scheduledJobs).filter(job => job !== null).length;
    console.log(`  📊 Total: ${activeJobs} tâche(s) active(s)\n`);
};/**
 * Vérifie et corrige le statut actuel basé sur les dates
 */
const checkAndCorrectCurrentStatus = async () => {
    try {
        console.log('[Auto Settings] 🔍 Vérification du statut actuel...');

        const settings = await settingsQueries.GetSettings();
        if (!settings) {
            console.log('[Auto Settings] ❌ Aucun paramètre trouvé');
            return;
        }

        if (!settings.isAutomatic) {
            console.log('[Auto Settings] ⚠️ Mode automatique désactivé - pas de vérification de statut');
            return;
        }

        const now = DateTime.now().setZone(TIMEZONE);
        let needsUpdate = false;

        console.log(`[Auto Settings] Heure actuelle: ${now.toFormat('dd/MM/yyyy HH:mm')} (Madagascar)`);

        // === VÉRIFIER LE STATUT DES INSCRIPTIONS ===
        if (settings.registrationDate && settings.finalEnrollmentDate) {
            const startDate = parseDate(settings.registrationDate, 'registrationDate');
            const endDate = parseDate(settings.finalEnrollmentDate, 'finalEnrollmentDate');

            if (startDate && endDate) {
                const shouldBeOpen = now >= startDate && now <= endDate;

                console.log(`[Auto Settings] Période d'inscription: ${startDate.toFormat('dd/MM/yyyy HH:mm')} → ${endDate.toFormat('dd/MM/yyyy HH:mm')}`);
                console.log(`[Auto Settings] Les inscriptions devraient être: ${shouldBeOpen ? 'OUVERTES' : 'FERMÉES'}`);
                console.log(`[Auto Settings] Statut actuel: ${settings.isInscriptionOpen ? 'OUVERTES' : 'FERMÉES'}`);

                if (settings.isInscriptionOpen !== shouldBeOpen) {
                    await settingsQueries.UpdateInscriptionStatus(shouldBeOpen);
                    console.log(`[Auto Settings] 🔄 Statut inscriptions corrigé: ${shouldBeOpen ? 'OUVERTES' : 'FERMÉES'}`);
                    needsUpdate = true;
                } else {
                    console.log('[Auto Settings] ✅ Statut inscriptions conforme');
                }
            } else {
                console.log('[Auto Settings] ⚠️ Dates d\'inscription invalides');
            }
        } else {
            console.log('[Auto Settings] ℹ️ Dates d\'inscription non configurées');
        }

        // === VÉRIFIER LE STATUT DES RÉSULTATS ===
        if (settings.resultsPublicationDate) {
            const publicationDate = parseDate(settings.resultsPublicationDate, 'resultsPublicationDate');

            if (publicationDate) {
                const endDate = publicationDate.plus({ weeks: 3 });
                const shouldBeAvailable = now >= publicationDate && now <= endDate;

                console.log(`[Auto Settings] Période des résultats: ${publicationDate.toFormat('dd/MM/yyyy HH:mm')} → ${endDate.toFormat('dd/MM/yyyy HH:mm')}`);
                console.log(`[Auto Settings] Les résultats devraient être: ${shouldBeAvailable ? 'DISPONIBLES' : 'NON DISPONIBLES'}`);
                console.log(`[Auto Settings] Statut actuel: ${settings.isResultAvailable ? 'DISPONIBLES' : 'NON DISPONIBLES'}`);

                if (settings.isResultAvailable !== shouldBeAvailable) {
                    await settingsQueries.UpdateResultStatus(shouldBeAvailable);
                    console.log(`[Auto Settings] 🔄 Statut résultats corrigé: ${shouldBeAvailable ? 'DISPONIBLES' : 'NON DISPONIBLES'}`);
                    needsUpdate = true;
                } else {
                    console.log('[Auto Settings] ✅ Statut résultats conforme');
                }
            } else {
                console.log('[Auto Settings] ⚠️ Date de publication des résultats invalide');
            }
        } else {
            console.log('[Auto Settings] ℹ️ Date de publication des résultats non configurée');
        }

        if (!needsUpdate) {
            console.log('[Auto Settings] ✅ Tous les statuts sont conformes aux dates configurées');
        }

    } catch (error) {
        console.error('[Auto Settings] ❌ Erreur lors de la vérification du statut:', error.message);
    }
};

/**
 * Fonction principale d'initialisation
 */
const StartResultAndInscriptionScheduler = async () => {
    console.log('\n[Auto Settings] 🎯 === DÉMARRAGE DU SYSTÈME DE PROGRAMMATION AUTOMATIQUE ===');
    console.log(`[Auto Settings] 🕐 Heure de démarrage: ${DateTime.now().setZone(TIMEZONE).toFormat('dd/MM/yyyy HH:mm')} (Madagascar)`);

    // 1. Vérifier et corriger le statut actuel
    await checkAndCorrectCurrentStatus();

    // 2. Programmer toutes les tâches futures
    await scheduleAllJobs();

    console.log('[Auto Settings] ✅ Système de programmation automatique initialisé\n');
};

/**
 * Fonction appelée quand les paramètres changent (depuis l'API)
 */
const rescheduleJobsAfterSettingsUpdate = async () => {
    console.log('[Auto Settings] 🔄 Reprogrammation suite à changement de paramètres...');
    await scheduleAllJobs();
};

// Export des fonctions
module.exports = {
    StartResultAndInscriptionScheduler,
    rescheduleJobsAfterSettingsUpdate,
    cancelAllScheduledJobs,
    showScheduledJobsSummary,
    checkAndCorrectCurrentStatus
};