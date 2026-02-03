const cron = require('node-cron');
const Schedule = require('../models/schedule.model');
const { DateTime } = require('luxon');
const notificationQueries = require('../queries/notification.queries');

// Variable pour stocker l'instance io de Socket.IO
let socketIO = null;

// Fonction pour initialiser Socket.IO
function setSocketIO(io) {
    socketIO = io;
}

/**
 * Génère le nom de la room personnelle d'un utilisateur basé sur son ID
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {string} Le nom de la room
 */
const getUserRoom = (userId) => `user:${userId.toString()}`;

// Fonction pour envoyer une notification via Socket.IO au professeur (utilise les rooms)
function emitNotificationToProfessor(professorId, notification) {
    if (!socketIO) {
        console.log('[schedule-cron] Socket.IO non initialisé, notification non envoyée en temps réel');
        return;
    }
    const roomName = getUserRoom(professorId);
    socketIO.to(roomName).emit('receiveScheduleNotification', notification);
    console.log(`[schedule-cron] Notification envoyée au professeur ${professorId} via room ${roomName}`);
}

// Fonction pour envoyer une notification à la salle admin
function emitNotificationToAdminRoom(notification) {
    if (!socketIO) {
        console.log('[schedule-cron] Socket.IO non initialisé, notification non envoyée en temps réel');
        return;
    }
    socketIO.to('adminRoom').emit('receiveScheduleNotification', notification);
    console.log('[schedule-cron] Notification envoyée à la salle admin');
}

const TIMEZONE = 'Indian/Antananarivo';

function getYesterdayRange() {
    // Hier à Antananarivo (début et fin de journée)
    const yesterday = DateTime.now().setZone(TIMEZONE).minus({ days: 1 });

    const startOfDay = yesterday.startOf('day').toUTC().toJSDate();
    const endOfDay = yesterday.endOf('day').toUTC().toJSDate();

    return { startOfDay, endOfDay };
}

async function processYesterdaySchedules() {
    try {
        const { startOfDay, endOfDay } = getYesterdayRange();

        // Logging avec format lisible à Antananarivo
        const yesterdayLocal = DateTime.now().setZone(TIMEZONE).minus({ days: 1 });
        console.log(`[Schedule Cron] Traitement des séances du ${yesterdayLocal.toFormat('dd/MM/yyyy')} (${yesterdayLocal.toFormat('cccc')})`);

        // Récupérer toutes les schedules pending de la veille
        const pendingSchedules = await Schedule.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: 'pending',
            approvedByCron: false
        });

        console.log(`[Schedule Cron] ${pendingSchedules.length} séances pending trouvées pour la veille`);

        let processedCount = 0;
        let missedCount = 0;
        let doneCount = 0;

        // Traiter chaque séance
        for (const schedule of pendingSchedules) {
            try {
                let newStatus;
                console.log(schedule.studentReclamations);
                // Vérifier s'il y a des réclamations étudiantes
                if (schedule.studentReclamations && schedule.studentReclamations.length > 0) {
                    newStatus = 'missed';
                    missedCount++;
                    console.log(`[Schedule Cron] Séance ${schedule._id} marquée comme 'missed' (${schedule.studentReclamations.length} réclamations)`);
                } else {
                    newStatus = 'done';
                    doneCount++;
                    console.log(`[Schedule Cron] Séance ${schedule._id} marquée comme 'done' (aucune réclamation)`);
                }

                // Mettre à jour la séance
                await Schedule.findByIdAndUpdate(schedule._id, {
                    status: newStatus,
                    approvedByCron: true
                });

                processedCount++;

            } catch (scheduleError) {
                console.error(`[Schedule Cron] Erreur lors du traitement de la séance ${schedule._id}:`, scheduleError);
            }
        }

        console.log(`[Schedule Cron] Traitement terminé: ${processedCount} séances traitées (${doneCount} done, ${missedCount} missed)`);

        // Envoyer les notifications pour les séances manquées
        if (missedCount > 0) {
            console.log(`[Schedule Cron] Envoi des notifications pour ${missedCount} séances manquées`);

            // Récupérer les séances marquées comme 'missed' pour envoyer les notifications
            const missedSchedules = await Schedule.find({
                date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                status: 'missed',
                approvedByCron: true
            }).populate('professor module promotions');

            // Notifier chaque professeur concerné
            for (const schedule of missedSchedules) {
                if (schedule.professor && schedule.professor._id) {
                    const notificationProf = {
                        title: 'Cours marqué comme manqué',
                        message: `Le cours ${schedule.module ? schedule.module.code : schedule.title} prévu le ${DateTime.fromJSDate(schedule.date).setZone(TIMEZONE).toFormat('dd/MM/yyyy')} a été marqué comme manqué suite à des réclamations étudiantes (${schedule.studentReclamations.length} réclamation(s)). s'il s'agit d'une erreur, veuillez contacter l'administration.`,
                        type: 'individual',
                        user: schedule.professor._id,
                        informationType: 'schedule',
                        warningLevel: 'critical',
                        linkTo: '/professor/schedule'
                    };

                    // Sauvegarder en base de données
                    const savedNotifProf = await notificationQueries.createNotification(notificationProf);

                    // Envoyer via Socket.IO
                    emitNotificationToProfessor(schedule.professor._id, savedNotifProf);
                }
            }

            // Notification récapitulative pour les admins
            const adminNotification = {
                title: 'Récapitulatif des cours manqués',
                message: `${missedCount} cours ont été marqués comme manqués hier (${yesterdayLocal.toFormat('dd/MM/yyyy')}). Veuillez consulter la liste des séances pour plus de détails.`,
                type: 'admin',
                informationType: 'schedule',
                warningLevel: 'warning',
                linkTo: '/admin/schedule'
            };

            // Sauvegarder en base de données
            const savedAdminNotif = await notificationQueries.createNotification(adminNotification);

            // Envoyer via Socket.IO à la salle admin
            emitNotificationToAdminRoom(savedAdminNotif);

            console.log(`[Schedule Cron] ${missedCount} notifications envoyées aux professeurs et admins`);
        }

    } catch (error) {
        console.error('[Schedule Cron] Erreur lors du traitement des séances:', error);
    }
}

exports.setSocketIO = setSocketIO;

exports.StartScheduleCron = function () {
    // Tous les jours à 00:00 heure Antananarivo
    cron.schedule('0 0 * * *', async () => {
        const now = DateTime.now().setZone(TIMEZONE);
        console.log(`[Schedule Cron] Démarrage du traitement des séances de la veille - ${now.toFormat('dd/MM/yyyy à HH:mm')} (${TIMEZONE})`);
        try {
            await processYesterdaySchedules();
        } catch (e) {
            console.error('[Schedule Cron] Erreur critique:', e);
        }
    }, {
        timezone: TIMEZONE
    });

    console.log(`[Schedule Cron] Cron job planifié - 00:00 tous les jours (${TIMEZONE})`);
};

// Export pour tests manuels
exports.__processYesterdaySchedulesNow = processYesterdaySchedules;
