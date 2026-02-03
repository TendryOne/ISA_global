const cron = require('node-cron');
const mongoose = require('mongoose');
const TutionFees = require('../models/tutionFees.model');
const Student = require('../models/student.model');
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

// Fonction pour envoyer une notification via Socket.IO (utilise les rooms)
function emitFeeNotification(userId, notification) {
    if (!socketIO) {
        console.log('[fees-cron] Socket.IO non initialisé, notification non envoyée en temps réel');
        return;
    }
    const roomName = getUserRoom(userId);
    socketIO.to(roomName).emit('receiveScheduleNotification', notification);
    console.log(`[fees-cron] Notification envoyée à l'utilisateur ${userId} via room ${roomName}`);
}

function emitRestrictedNotification(userId, notification) {
    if (!socketIO) {
        console.log('[fees-cron] Socket.IO non initialisé, notification non envoyée en temps réel');
        return;
    }
    const roomName = getUserRoom(userId);
    socketIO.to(roomName).emit('receiveScheduleNotification', notification);
    socketIO.to(roomName).emit('receiveUserUpdate');
    console.log(`[fees-cron] Notification de restriction envoyée à l'utilisateur ${userId} via room ${roomName}`);
}


function startOfDay(d) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function diffInDays(a, b) {
    // a - b in whole days
    const ad = startOfDay(a).getTime();
    const bd = startOfDay(b).getTime();
    return Math.round((ad - bd) / (24 * 60 * 60 * 1000));
}

async function processReminders(now = new Date()) {

    // Récupérer tous les dossiers de frais avec au moins une échéance non vérifiée
    // On peuple l'utilisateur pour obtenir email/identité
    const feesList = await TutionFees.find({ 'installments.verified': false }).lean();

    const privateTZNow = now; // si nécessaire, ajuster fuseau
    const today = startOfDay(privateTZNow);

    const restrictStudentIds = new Set();

    for (const fees of feesList) {
        const userId = (fees.user && fees.user._id) ? fees.user._id : fees.user; // peut être null si réf cassée

        for (const inst of fees.installments || []) {
            if (inst.verified) continue;
            if (!inst.dueDate) continue;

            const days = diffInDays(inst.dueDate, privateTZNow);

            // Déterminer si on doit envoyer un rappel aujourd'hui
            let shouldRemind = (days === 5 || days === 0 || days === -5);

            // Éviter double envoi le même jour
            if (shouldRemind && inst.lastReminderDate) {
                if (startOfDay(inst.lastReminderDate).getTime() === today.getTime()) {
                    shouldRemind = false;
                }
            }

            if (shouldRemind) {
                // Créer la notification en base de données
                const warningLevel = days === -5 ? 'critical' : days === 0 ? 'warning' : 'info';
                const title = days === 5
                    ? 'Rappel de paiement à venir'
                    : days === 0
                        ? 'Échéance de paiement aujourd\'hui'
                        : 'Retard de paiement';

                const message = days === 5
                    ? `Votre échéance de paiement approche dans 5 jours (${new Date(inst.dueDate).toLocaleDateString()}). Montant à payer : ${inst.amount} Ar.`
                    : days === 0
                        ? `Votre échéance de paiement est aujourd'hui. Montant à payer : ${inst.amount} Ar.`
                        : `Votre paiement est en retard de 5 jours (échéance : ${new Date(inst.dueDate).toLocaleDateString()}). Montant dû : ${inst.amount} Ar. Veuillez régulariser votre situation rapidement.`;

                const notificationData = {
                    title,
                    message,
                    type: 'individual',
                    user: userId,
                    informationType: 'financial',
                    warningLevel,
                    linkTo: '/student/fees'
                };

                // Sauvegarder la notification en base de données
                const savedNotification = await notificationQueries.createNotification(notificationData);

                // Envoyer la notification via Socket.IO en temps réel
                if (userId) {
                    emitFeeNotification(userId, savedNotification);
                }

                // Incrémenter le compteur et mettre à jour la date du dernier rappel
                await TutionFees.updateOne({ _id: fees._id, 'installments._id': inst._id }, {
                    $inc: { 'installments.$.numberOfReminders': 1 },
                    $set: { 'installments.$.lastReminderDate': privateTZNow }
                });
            }

            // Restriction: si l'échéance est dépassée d'au moins 7 jours et toujours non payé
            if (days <= -7) {
                if (userId) restrictStudentIds.add(String(userId));
            }

        }
    }

    // Appliquer la restriction aux étudiants concernés
    if (restrictStudentIds.size > 0) {
        const ids = Array.from(restrictStudentIds);

        // Récupérer les étudiants qui ne sont pas encore restreints
        const studentsToRestrict = await Student.find({
            _id: { $in: ids },
            isRestricted: { $ne: true }
        }).select('_id');

        if (studentsToRestrict.length > 0) {
            // Appliquer la restriction
            await Student.updateMany(
                { _id: { $in: studentsToRestrict.map(s => s._id) } },
                { $set: { isRestricted: true } }
            );

            // Envoyer une notification de restriction à chaque étudiant nouvellement restreint
            for (const student of studentsToRestrict) {
                const restrictionNotification = {
                    title: 'Compte restreint',
                    message: 'Votre compte a été restreint en raison d\'un retard de paiement de plus de 7 jours. Veuillez régulariser votre situation auprès de l\'administration pour retrouver l\'accès complet aux services.',
                    type: 'individual',
                    user: student._id,
                    informationType: 'financial',
                    warningLevel: 'critical',
                    linkTo: '/student/fees'
                };

                // Sauvegarder la notification en base de données
                const savedNotification = await notificationQueries.createNotification(restrictionNotification);

                // Envoyer la notification via Socket.IO en temps réel
                emitRestrictedNotification(student._id, savedNotification);

                console.log(`[fees-cron] Notification de restriction envoyée à l'étudiant ${student._id}`);
            }
        }
    }
}

exports.StartFeesReminderCron = function () {
    // tous les jours a 8h
    cron.schedule('0 8 * * *', async () => {
        try {
            await processReminders(new Date());
            console.log('[fees-cron] Exécution terminée');
        } catch (e) {
            console.error('[fees-cron] Erreur:', e);
        }
    }, { timezone: 'Indian/Antananarivo' });
};

exports.setSocketIO = setSocketIO;


// pour test immédiat si lancé directement