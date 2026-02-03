/**
 * Helpers et fonctions utilitaires pour Socket.IO
 * Utilise le système de rooms pour une compatibilité avec PM2 (multi-instances)
 */

/**
 * Génère le nom de la room personnelle d'un utilisateur basé sur son ID
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {string} Le nom de la room
 */
const getUserRoom = (userId) => `user:${userId.toString()}`;

// Fonction pour vérifier le rôle d'un utilisateur
const verifyUserRole = (socket, role) => {
    if (socket.isAuthenticated && socket.user.role === role) {
        return true;
    }
    return false;
};

// Fonction pour envoyer une notification à un professeur spécifique (via room)
const sendNotificationToProfessor = (io, professorId, notification) => {
    const roomName = getUserRoom(professorId);
    io.to(roomName).emit("receiveScheduleNotification", notification);
};

// Fonction pour envoyer une notification aux promotions
const sendNotificationToPromotions = (io, promotionIds, notification) => {
    for (const promotionId of promotionIds) {
        io.to(promotionId.toString()).emit(
            "receiveScheduleNotification",
            notification
        );
    }
};

// Fonction pour envoyer une mise à jour à un utilisateur spécifique (via room)
const sendUpdateToUser = (io, userId) => {
    const roomName = getUserRoom(userId);
    io.to(roomName).emit("receiveUserUpdate");
};

// Fonction pour envoyer une notification à un étudiant spécifique (via room)
const sendNotificationToStudent = (io, studentId, notification) => {
    const roomName = getUserRoom(studentId);
    io.to(roomName).emit("receiveScheduleNotification", notification);
};

// Fonction pour envoyer une notification à la salle admin
const sendNotificationToAdminRoom = (io, notification) => {
    io.to("adminRoom").emit("receiveScheduleNotification", notification);
};

// Fonction pour envoyer une notification à la salle étudiants
const sendNotificationToStudentRoom = (io, notification) => {
    io.to("studentRoom").emit("receiveScheduleNotification", notification);
};

const sendNotificationToProfessorsRoom = (io, notification) => {
    io.to("professorRoom").emit("receiveScheduleNotification", notification);
};

const sendNotificationToAll = (io, notification) => {
    io.emit("receiveScheduleNotification", notification);
}

const sendToSuperAdmins = (io, notification) => {
    io.to("superAdminRoom").emit("receiveScheduleNotification", notification);
}

module.exports = {
    getUserRoom,
    verifyUserRole,
    sendNotificationToProfessor,
    sendNotificationToPromotions,
    sendUpdateToUser,
    sendNotificationToStudent,
    sendNotificationToAdminRoom,
    sendNotificationToStudentRoom,
    sendNotificationToProfessorsRoom,
    sendNotificationToAll,
    sendToSuperAdmins,
};
