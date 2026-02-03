const EventLog = require('../models/eventLogs.model');
const { LOG_STATUS } = require('./eventTypes.constants');

/**
 * Enregistre un événement dans la base de données
 * @param {Object} logData - Données de l'événement
 * @param {string} logData.userId - ID de l'utilisateur
 * @param {string} logData.userRole - Rôle de l'utilisateur (STUDENT, PROFESSOR, ADMIN, SUPER_ADMIN)
 * @param {string} logData.eventType - Type d'événement
 * @param {string} logData.description - Description de l'événement
 * @param {string} logData.entityType - Type d'entité affectée (module, assignment, submission, etc.)
 * @param {string} logData.entityId - ID de l'entité affectée
 * @param {string} logData.ipAddress - Adresse IP de l'utilisateur
 * @param {string} logData.userAgent - User agent du navigateur
 * @param {string} logData.status - Statut (success ou failure)
 * @param {string} logData.errorMessage - Message d'erreur (si applicable)
 * @param {Object} logData.changes - Données des modifications
 * @param {Object} logData.metadata - Données additionnelles
 * @returns {Promise<Object>} L'événement créé
 */
async function logEvent(logData) {
    try {
        const eventLog = new EventLog({
            userId: logData.userId,
            userRole: logData.userRole,
            eventType: logData.eventType,
            description: logData.description || null,
            entityType: logData.entityType || null,
            entityId: logData.entityId || null,
            assigmentId: logData.assigmentId || null,
            submissionId: logData.submissionId || null,
            moduleId: logData.moduleId || null,
            ipAddress: logData.ipAddress || null,
            userAgent: logData.userAgent || null,
            status: logData.status || LOG_STATUS.SUCCESS,
            errorMessage: logData.errorMessage || null,
            changes: logData.changes || null,
            metadata: logData.metadata || null,
            timestamp: new Date()
        });

        await eventLog.save();
        return eventLog;
    } catch (error) {
        console.error('Error logging event:', error);
        // Ne pas lever d'erreur - les logs ne doivent pas bloquer l'application
        return null;
    }
}

/**
 * Enregistre un événement d'authentification (login/logout)
 */
async function logAuthEvent(userId, userRole, eventType, ipAddress, userAgent, status = LOG_STATUS.SUCCESS) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description: `${userRole} - ${eventType}`,
        ipAddress,
        userAgent,
        status,
        entityType: 'user'
    });
}

/**
 * Enregistre un événement d'action sur un module
 */
async function logModuleEvent(userId, userRole, eventType, moduleId, description, changes = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description,
        entityType: 'module',
        entityId: moduleId,
        moduleId,
        changes
    });
}

/**
 * Enregistre un événement d'action sur un devoir/assignment
 */
async function logAssignmentEvent(userId, userRole, eventType, assignmentId, description, changes = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description,
        entityType: 'assignment',
        entityId: assignmentId,
        assigmentId: assignmentId,
        changes
    });
}

/**
 * Enregistre un événement de soumission
 */
async function logSubmissionEvent(userId, userRole, eventType, submissionId, assignmentId, description, changes = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description,
        entityType: 'submission',
        entityId: submissionId,
        submissionId,
        assigmentId: assignmentId,
        changes
    });
}

/**
 * Enregistre un événement de note/grading
 */
async function logGradeEvent(userId, userRole, eventType, submissionId, grade, feedback = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description: `Grade: ${grade}`,
        entityType: 'grade',
        entityId: submissionId,
        submissionId,
        changes: { grade, feedback }
    });
}

/**
 * Enregistre un événement de paiement
 */
async function logPaymentEvent(userId, userRole, eventType, paymentId, amount, description, status = LOG_STATUS.SUCCESS) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description: description || `Payment: ${amount}`,
        entityType: 'payment',
        entityId: paymentId,
        status,
        changes: { amount }
    });
}

/**
 * Enregistre un événement d'utilisateur (création, suppression, etc.)
 */
async function logUserEvent(userId, userRole, targetUserId, eventType, description, changes = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description,
        entityType: 'user',
        entityId: targetUserId,
        changes
    });
}

/**
 * Enregistre un événement de ressource
 */
async function logResourceEvent(userId, userRole, eventType, resourceId, description, changes = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description,
        entityType: 'resource',
        entityId: resourceId,
        changes
    });
}

/**
 * Enregistre un événement d'erreur/système
 */
async function logErrorEvent(userId, userRole, eventType, errorMessage, metadata = null) {
    return logEvent({
        userId,
        userRole,
        eventType,
        description: errorMessage,
        status: LOG_STATUS.FAILURE,
        errorMessage,
        metadata
    });
}

/**
 * Récupère les logs d'un utilisateur
 */
async function getUserLogs(userId, limit = 50, skip = 0) {
    try {
        const logs = await EventLog.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await EventLog.countDocuments({ userId });

        return {
            logs,
            total,
            limit,
            skip,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching user logs:', error);
        return { logs: [], total: 0, limit, skip, pages: 0 };
    }
}

/**
 * Récupère les logs par type d'événement
 */
async function getLogsByEventType(eventType, limit = 50, skip = 0) {
    try {
        const logs = await EventLog.find({ eventType })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await EventLog.countDocuments({ eventType });

        return { logs, total, pages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching logs by event type:', error);
        return { logs: [], total: 0, pages: 0 };
    }
}

/**
 * Récupère les logs par rôle d'utilisateur
 */
async function getLogsByUserRole(userRole, limit = 50, skip = 0) {
    try {
        const logs = await EventLog.find({ userRole })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await EventLog.countDocuments({ userRole });

        return { logs, total, pages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching logs by user role:', error);
        return { logs: [], total: 0, pages: 0 };
    }
}

/**
 * Récupère les logs par entité (module, assignment, etc.)
 */
async function getLogsByEntity(entityType, entityId) {
    try {
        const logs = await EventLog.find({ entityType, entityId })
            .sort({ timestamp: -1 })
            .lean();

        return logs;
    } catch (error) {
        console.error('Error fetching logs by entity:', error);
        return [];
    }
}

/**
 * Récupère les logs d'erreur
 */
async function getErrorLogs(limit = 50, skip = 0) {
    try {
        const logs = await EventLog.find({ status: LOG_STATUS.FAILURE })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await EventLog.countDocuments({ status: LOG_STATUS.FAILURE });

        return { logs, total, pages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching error logs:', error);
        return { logs: [], total: 0, pages: 0 };
    }
}

/**
 * Récupère les logs dans une plage de dates
 */
async function getLogsByDateRange(startDate, endDate, limit = 50, skip = 0) {
    try {
        const logs = await EventLog.find({
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        })
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await EventLog.countDocuments({
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        });

        return { logs, total, pages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching logs by date range:', error);
        return { logs: [], total: 0, pages: 0 };
    }
}

module.exports = {
    logEvent,
    logAuthEvent,
    logModuleEvent,
    logAssignmentEvent,
    logSubmissionEvent,
    logGradeEvent,
    logPaymentEvent,
    logUserEvent,
    logResourceEvent,
    logErrorEvent,
    getUserLogs,
    getLogsByEventType,
    getLogsByUserRole,
    getLogsByEntity,
    getErrorLogs,
    getLogsByDateRange
};
