/**
 * Gestion des événements Socket.IO pour les étudiants
 * Utilise le système de rooms pour une compatibilité avec PM2 (multi-instances)
 */

const UserQueries = require("../queries/UserQueries");
const notificationQueries = require("../queries/notification.queries");
const ModuleQueries = require("../queries/Module.queries");
const {
    verifyUserRole,
    sendNotificationToProfessor,
    sendNotificationToAdminRoom,
} = require("./helpers.socket");

const registerStudentEvents = (io, socket) => {
    // Rejoindre une salle de promotion
    socket.on("joinPromotionRoom", async (promotion) => {
        try {
            if (!verifyUserRole(socket, "student")) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }

            const user = await UserQueries.GetUserByMatricule(
                socket.user.matricule
            );

            if (
                user &&
                user.parcours.length !== 0 &&
                user.parcours
                    .find((p) => p.status === "in progress")
                    .promotion._id.toString() !== promotion._id
            ) {
                console.log(
                    `❌ User ${socket.user.matricule} attempted to join unauthorized room ${promotion._id}`
                );
                return;
            }
            socket.join(promotion._id.toString());
            console.log(
                `User ${socket.user.matricule} joined room ${promotion._id}`
            );
        } catch (err) {
            console.error("Error joining promotion room:", err);
        }
    });

    socket.on("joinStudentRoom", () => {
        try {
            if (!verifyUserRole(socket, "student")) {

                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }
            socket.join("studentRoom");
            console.log(
                `User ${socket.user.matricule} joined room studentRoom`
            );
        } catch (err) {
            console.error("Error joining student room:", err);
        }
    });

    // Notification de soumission de devoir par l'étudiant
    socket.on(
        "submissionNotificationByStudent",
        async ({ assignment, matricule, update }) => {
            try {
                if (!verifyUserRole(socket, "student")) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }
                const module = await ModuleQueries.getModuleByIdWiTeachingUnit(
                    assignment.module
                );

                const notification = {
                    title: update
                        ? "Devoir re-soumis"
                        : "Nouvelle soumission de devoir",
                    message: `L'étudiant(e) portant le matricule ${matricule} a ${update ? "re-soumis" : "soumis"} le devoir "${assignment.title}" pour le module ${module.code}.`,
                    type: "individual",
                    user: assignment.professor,
                    informationType: "pedagogical",
                    warningLevel: null,
                    linkTo: `/professor/modules/${module._id}/assignments/${assignment._id}/promotion/${assignment.promotion}`,
                };

                const notif =
                    await notificationQueries.createNotification(notification);
                sendNotificationToProfessor(io, assignment.professor, notif);
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification par l'étudiant :",
                    error
                );
            }
        }
    );

    // Notification de demande administrative par l'étudiant
    socket.on(
        "administrativeRequestNotificationByStudent",
        async ({ request }) => {
            try {
                if (!verifyUserRole(socket, "student")) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }
                const requestTypeMap = {
                    transcript: "relevé de notes",
                    enrollment_certificate: "certificat de scolarité",
                    diploma: "diplôme",
                };

                const notification = {
                    title: `Demande de ${requestTypeMap[request.requestType]}`,
                    message: `L'étudiant(e) portant le matricule ${request.matricule} a soumis une demande de ${requestTypeMap[request.requestType]}.`,
                    type: "admin",
                    informationType: "administrative",
                    warningLevel: null,
                    linkTo: `/admin/administrative-requests`,
                };
                const notif =
                    await notificationQueries.createNotification(notification);

                sendNotificationToAdminRoom(io, notif);
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification de demande administrative par l'étudiant :",
                    error
                );
            }
        }
    );

    // Notification de mise à jour des frais de scolarité par l'étudiant
    socket.on("sendNotificationForFeesByStudent", async ({ tutionFees }) => {
        try {
            if (!verifyUserRole(socket, "student")) {
                console.log(`❌ Unauthorized access attempt by socket ID ${socket.id}`);
                return;
            }

            const notification = {
                title: "Mise à jour des frais de scolarité",
                message: `L'étudiant(e) portant le matricule ${socket.user.matricule} en ${tutionFees.level} ${tutionFees.field} a mis à jour ses frais de scolarité.`,
                type: "admin",
                informationType: "financial",
                warningLevel: null,
                linkTo: `/admin/suivi-paiements/${tutionFees.field}/${tutionFees.level}/${tutionFees.promotion}`,
            };
            const notif = await notificationQueries.createNotification(notification);

            sendNotificationToAdminRoom(io, notif);
        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de la notification de frais par l'étudiant :",
                error
            );
        }
    });



};

module.exports = registerStudentEvents;
