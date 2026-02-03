/**
 * Gestion des événements Socket.IO pour les professeurs
 * Utilise le système de rooms pour une compatibilité avec PM2 (multi-instances)
 */

const notificationQueries = require("../queries/notification.queries");
const ModuleQueries = require("../queries/Module.queries");
const assignmentQueries = require("../queries/assignment.queries");
const {
    verifyUserRole,
    sendNotificationToPromotions,
    sendNotificationToStudent,
    sendNotificationToProfessorsRoom,
} = require("./helpers.socket");

const registerProfessorEvents = (io, socket) => {


    socket.on("joinProfessorRoom", () => {
        try {
            if (!verifyUserRole(socket, "professor")) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }
            socket.join("professorRoom");
            console.log(
                `User ${socket.user.matricule} joined room professorRoom`
            );
        } catch (err) {
            console.error("Error joining professor room:", err);
        }
    });

    // Notification de ressources pédagogiques par le professeur
    socket.on(
        "ressourcesNotificationByProfessor",
        async ({ ressources, update }) => {
            try {
                if (!verifyUserRole(socket, "professor")) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }

                const module = await ModuleQueries.getModuleByIdWiTeachingUnit(
                    ressources.module
                );

                const notification = {
                    title: update
                        ? "Mise à jour des ressources pédagogiques"
                        : "Nouvelles ressources pédagogiques disponibles",
                    message: `Des ressources pédagogiques ont été ${update ? "mises à jour" : "ajoutées"} pour le module ${module.code}. Veuillez les consulter.`,
                    type: "promotion",
                    promotion: Array(ressources.promotion),
                    informationType: "pedagogical",
                    warningLevel: null,
                    linkTo: `/student/courses/${module.teachingUnit.semester}/${ressources.promotion}/${module._id}/resources`,
                };

                const notif =
                    await notificationQueries.createNotification(notification);
                const promotionArray = Array(ressources.promotion);
                sendNotificationToPromotions(io, promotionArray, notif);
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification par le professeur :",
                    error
                );
            }
        }
    );

    // Notification de devoir par le professeur
    socket.on(
        "assignmentNotificationByProfessor",
        async ({ assignment, type }) => {
            try {
                if (!verifyUserRole(socket, "professor")) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }

                let title = "";
                let message = "";
                let warningLevel = null;
                let linkTo = null;

                const dueDate = new Date(assignment.dueDate).toLocaleDateString(
                    "fr-FR",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }
                );
                const module = await ModuleQueries.getModuleByIdWiTeachingUnit(
                    assignment.module
                );

                const assignmentTypeLabel =
                    assignment.type === "project"
                        ? "Projet"
                        : assignment.type === "homework"
                            ? "Devoir"
                            : assignment.type === "exam"
                                ? "Examen"
                                : "Travail";

                switch (type) {
                    case "new":
                        title = `${assignmentTypeLabel === "Examen" ? "Nouvel examen disponible" : `Nouveau ${assignmentTypeLabel.toLowerCase()} disponible`}`;
                        message = `Un ${assignmentTypeLabel === "Examen" ? "nouvel" : "nouveau"} ${assignmentTypeLabel.toLowerCase()} pour le module ${module.code} : "${assignment.title}" a été ajouté. Date limite : ${dueDate}.`;
                        warningLevel = null;
                        linkTo = `/student/courses/${module.teachingUnit.semester}/${assignment.promotion}/${module._id}/assignments/${assignment._id}`;
                        break;

                    case "update":
                        title = `${assignmentTypeLabel === "Examen" ? "Mise à jour d'un examen" : "Mise à jour d'un devoir"}`;
                        message = `${assignmentTypeLabel === "Examen" ? "L'" : "Le"} ${assignmentTypeLabel.toLowerCase()} pour le module ${module.code} : "${assignment.title}" a été mis à jour. Date limite : ${dueDate}.`;
                        warningLevel = "warning";
                        linkTo = `/student/courses/${module.teachingUnit.semester}/${assignment.promotion}/${module._id}/assignments/${assignment._id}`;
                        break;

                    case "delete":
                        title = "Annulation d'un devoir";
                        message = `${assignmentTypeLabel === "Examen" ? "L'" : "Le"} ${assignmentTypeLabel.toLowerCase()} pour le module ${module.code} : "${assignment.title}" a été annulé.`;
                        warningLevel = "critical";
                        linkTo = null;
                        break;

                    case "cancel":
                        title = "Annulation d'un examen";
                        message = `${assignmentTypeLabel === "Examen" ? "L'" : "Le"} ${assignmentTypeLabel.toLowerCase()} pour le module ${module.code} : "${assignment.title}" a été annulé.`;
                        warningLevel = "critical";
                        linkTo = null;
                        break;

                    case "reactivate":
                        title = "Réactivation d'un examen";
                        message = `${assignmentTypeLabel === "Examen" ? "L'" : "Le"} ${assignmentTypeLabel.toLowerCase()} pour le module ${module.code} : "${assignment.title}" a été réactivé. Date limite : ${dueDate}.`;
                        warningLevel = "warning";
                        linkTo = `/student/courses/${module.teachingUnit.semester}/${assignment.promotion}/${module._id}/assignments/${assignment._id}`;
                        break;

                    default:
                        console.error(`Type de notification inconnu : ${type}`);
                        return;
                }

                const notification = {
                    title,
                    message,
                    type: "promotion",
                    promotion: [assignment.promotion],
                    informationType: "pedagogical",
                    warningLevel,
                    linkTo,
                };

                const notif =
                    await notificationQueries.createNotification(notification);
                sendNotificationToPromotions(io, [assignment.promotion], notif);
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification par le professeur :",
                    error
                );
            }
        }
    );

    // Notification de notes par le professeur
    socket.on(
        "gradesNotificationByProfessor",
        async ({ submission, update }) => {
            try {
                if (!verifyUserRole(socket, "professor")) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }

                const assignment = await assignmentQueries.getAssignmentById(
                    submission.assignment
                );
                const module = await ModuleQueries.getModuleByIdWiTeachingUnit(
                    assignment.module
                );

                const notification = {
                    title: update ? "Note mise à jour" : "Nouvelle note attribuée",
                    message: `Votre devoir "${assignment.title}" pour le module ${module.code} a été ${update ? "re-noté" : "noté"}. Veuillez verifier vos notes.`,
                    type: "individual",
                    user: submission.student,
                    informationType: "academic",
                    warningLevel: null,
                    linkTo: `/student/courses/${module.teachingUnit.semester}/${assignment.promotion}/${module._id}/assignments/${assignment._id}`,
                };

                const notif =
                    await notificationQueries.createNotification(notification);

                sendNotificationToStudent(io, submission.student, notif);
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification de notes par le professeur :",
                    error
                );
            }
        }
    );

    // Notification de verrouillage des notes par le professeur
    socket.on("lockGradesNotificationByProfessor", async ({ assignment }) => {
        try {
            if (!verifyUserRole(socket, "professor")) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }

            const module = await ModuleQueries.getModuleByIdWiTeachingUnit(
                assignment.module
            );

            const notification = {
                title: "Verrouillage des notes",
                message: `Les notes pour le devoir "${assignment.title}" du module ${module.code} ont été verrouillées.`,
                type: "promotion",
                promotion: [assignment.promotion],
                informationType: "academic",
                warningLevel: "info",
                linkTo: `/student/courses/${module.teachingUnit.semester}/${assignment.promotion}/${module._id}/assignments/${assignment._id}`,
            };

            const notif =
                await notificationQueries.createNotification(notification);
            sendNotificationToPromotions(io, [assignment.promotion], notif);
        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de la notification de verrouillage des notes par le professeur :",
                error
            );
        }
    });
};

module.exports = registerProfessorEvents;
