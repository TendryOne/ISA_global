/**
 * Gestion des événements Socket.IO pour les administrateurs
 * Utilise le système de rooms pour une compatibilité avec PM2 (multi-instances)
 */

const notificationQueries = require("../queries/notification.queries");
const ModuleQueries = require("../queries/Module.queries");
const {
    verifyUserRole,
    sendNotificationToProfessor,
    sendNotificationToPromotions,
    sendNotificationToStudent,
    sendUpdateToUser,
    sendNotificationToStudentRoom,
    sendNotificationToAll,
    sendNotificationToProfessorsRoom,
    sendNotificationToAdminRoom,
    sendToSuperAdmins,


} = require("./helpers.socket");

const registerAdminEvents = (io, socket) => {
    // Rejoindre la salle admin
    socket.on("joinAdminRoom", () => {
        try {
            if (
                verifyUserRole(socket, "admin") ||
                verifyUserRole(socket, "superAdmin")
            ) {
                socket.join("adminRoom");
                console.log(`User ${socket.user.matricule} joined admin room`);
            }
        } catch (err) {
            console.error("Error joining admin room:", err);
        }
    });

    socket.on("joinSuperAdminRoom", () => {
        try {
            if (verifyUserRole(socket, "superAdmin")) {
                socket.join("superAdminRoom");
                console.log(`User ${socket.user.matricule} joined super admin room`);
            }
        } catch (err) {
            console.error("Error joining super admin room:", err);
        }
    });

    // Notification d'emploi du temps (envoyée par l'admin)
    socket.on(
        "sendScheduleNotification",
        async ({ message, schedule, oldScheduleValue }) => {
            try {
                // Déterminer les promotions retirées lors de la mise à jour
                const removedPromotions = oldScheduleValue
                    ? oldScheduleValue.promotions.filter(
                        (oldPromoId) =>
                            !schedule.promotions.some(
                                (newPromoId) =>
                                    newPromoId.toString() === oldPromoId.toString()
                            )
                    )
                    : [];

                const remainingPromotions = oldScheduleValue
                    ? oldScheduleValue.promotions.filter((oldPromoId) =>
                        schedule.promotions.some(
                            (newPromoId) =>
                                newPromoId.toString() === oldPromoId.toString()
                        )
                    )
                    : [];

                // =============================
                // 1. GESTION DES PROMOTIONS RETIRÉES (Annulation)
                // =============================
                if (removedPromotions.length > 0) {
                    const cancelNotification = {
                        title: "Annulation de l'emploi du temps",
                        message: `L'emploi du temps prévu le ${new Date(
                            oldScheduleValue.date
                        ).toLocaleDateString()} a été annulé.`,
                        type: "promotion",
                        promotion: removedPromotions,
                        informationType: "schedule",
                        warningLevel: "critical",
                        linkTo: "/student/schedule",
                    };

                    const notif =
                        await notificationQueries.createNotification(cancelNotification);
                    sendNotificationToPromotions(io, removedPromotions, notif);
                }

                // =============================
                // 2. GESTION DU CHANGEMENT DE PROFESSEUR
                // =============================
                if (oldScheduleValue) {
                    const oldProfId = oldScheduleValue.professor?._id?.toString();
                    const newProfId = schedule.professor?._id?.toString();

                    // Le professeur a changé
                    if (oldProfId && newProfId && oldProfId !== newProfId) {
                        // Annulation pour l'ancien professeur
                        const cancelNotifOldProf = {
                            title: "Annulation de l'emploi du temps",
                            message: `L'emploi du temps pour le module ${oldScheduleValue.module.code} prévu le ${new Date(
                                oldScheduleValue.date
                            ).toLocaleDateString()} a été annulé.`,
                            type: "individual",
                            user: oldScheduleValue.professor._id,
                            informationType: "schedule",
                            warningLevel: "critical",
                            linkTo: "/professor/schedule",
                        };

                        // Nouvel emploi du temps pour le nouveau professeur
                        const newNotifNewProf = {
                            title: "Nouvel emploi du temps disponible",
                            message: `Un nouvel emploi du temps pour le module ${schedule.module.code} est prévu le ${new Date(
                                schedule.date
                            ).toLocaleDateString()}.`,
                            type: "individual",
                            user: schedule.professor._id,
                            informationType: "schedule",
                            warningLevel: null,
                            linkTo: "/professor/schedule",
                        };

                        const [notifOldProf, notifNewProf] = await Promise.all([
                            notificationQueries.createNotification(cancelNotifOldProf),
                            notificationQueries.createNotification(newNotifNewProf),
                        ]);

                        sendNotificationToProfessor(
                            io,
                            oldScheduleValue.professor._id,
                            notifOldProf
                        );
                        sendNotificationToProfessor(io, schedule.professor._id, notifNewProf);
                    }
                    // L'ancien professeur a été retiré (pas de nouveau professeur)
                    else if (oldProfId && !newProfId) {
                        const cancelNotifOldProf = {
                            title: "Annulation de l'emploi du temps",
                            message: `L'emploi du temps pour le module ${oldScheduleValue.module.code} prévu le ${new Date(
                                oldScheduleValue.date
                            ).toLocaleDateString()} a été annulé.`,
                            type: "individual",
                            user: oldScheduleValue.professor._id,
                            informationType: "schedule",
                            warningLevel: "critical",
                            linkTo: "/professor/schedule",
                        };

                        const notifOldProf =
                            await notificationQueries.createNotification(
                                cancelNotifOldProf
                            );
                        sendNotificationToProfessor(
                            io,
                            oldScheduleValue.professor._id,
                            notifOldProf
                        );
                    }
                    // Un nouveau professeur a été ajouté (pas d'ancien professeur)
                    else if (!oldProfId && newProfId) {
                        const newNotifNewProf = {
                            title: "Nouvel emploi du temps disponible",
                            message: `Un nouvel emploi du temps pour le module ${schedule.module.code} est prévu le ${new Date(
                                schedule.date
                            ).toLocaleDateString()}.`,
                            type: "individual",
                            user: schedule.professor._id,
                            informationType: "schedule",
                            warningLevel: null,
                            linkTo: "/professor/schedule",
                        };

                        const notifNewProf =
                            await notificationQueries.createNotification(newNotifNewProf);
                        sendNotificationToProfessor(io, schedule.professor._id, notifNewProf);
                    }
                    // Le même professeur, mise à jour
                    else if (oldProfId && newProfId && oldProfId === newProfId) {
                        const updateNotifProf = {
                            title: "Mise à jour de l'emploi du temps",
                            message,
                            type: "individual",
                            user: schedule.professor._id,
                            informationType: "schedule",
                            warningLevel: "warning",
                            linkTo: "/professor/schedule",
                        };

                        const notifProf =
                            await notificationQueries.createNotification(updateNotifProf);
                        sendNotificationToProfessor(io, schedule.professor._id, notifProf);
                    }
                }
                // Nouvel emploi du temps (pas d'ancien) avec professeur
                else if (schedule.professor) {
                    const newNotifProf = {
                        title: "Nouvel emploi du temps disponible",
                        message,
                        type: "individual",
                        user: schedule.professor._id,
                        informationType: "schedule",
                        warningLevel: null,
                        linkTo: "/professor/schedule",
                    };

                    const notifProf =
                        await notificationQueries.createNotification(newNotifProf);
                    sendNotificationToProfessor(io, schedule.professor._id, notifProf);
                }

                // =============================
                // 3. GESTION DES PROMOTIONS (Mise à jour ou Nouveau)
                // =============================
                const promotionsToNotify = schedule.promotions || [];
                if (promotionsToNotify.length > 0) {
                    const isUpdate = oldScheduleValue && remainingPromotions.length > 0;
                    const isNew = !oldScheduleValue;

                    const title = isUpdate
                        ? "Mise à jour de l'emploi du temps"
                        : "Nouvel emploi du temps disponible";

                    const modifiedHours =
                        schedule.startTime !== oldScheduleValue?.startTime ||
                        schedule.endTime !== oldScheduleValue?.endTime;
                    const modifiedDate =
                        new Date(schedule.date).toDateString() !==
                        new Date(oldScheduleValue?.date).toDateString();
                    const dateInfo = modifiedDate
                        ? ` le ${new Date(schedule.date).toLocaleDateString()}`
                        : "";
                    const timeInfo = modifiedHours
                        ? ` de ${schedule.startTime} à ${schedule.endTime}`
                        : "";

                    const notifForPromotions = {
                        title,
                        message: isUpdate
                            ? `L'emploi du temps ${schedule.module && schedule.module.code ? "pour le module " + schedule.module.code : ""} : ${schedule.title} a été mis à jour${dateInfo}${timeInfo}.`
                            : message,
                        type: "promotion",
                        promotion: promotionsToNotify,
                        informationType: "schedule",
                        warningLevel: isUpdate ? "warning" : null,
                        linkTo: "/student/schedule",
                    };

                    const notif =
                        await notificationQueries.createNotification(notifForPromotions);
                    sendNotificationToPromotions(io, promotionsToNotify, notif);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification d'emploi du temps :",
                    error
                );
            }
        }
    );

    // Annulation d'emploi du temps
    socket.on("cancelScheduleNotification", async (schedule) => {
        try {
            // Notification pour les promotions
            const notificationForPromotions = {
                title: "Annulation de l'emploi du temps",
                message: `L'emploi du temps prévu le ${new Date(
                    schedule.date
                ).toLocaleDateString()} a été annulé.`,
                type: "promotion",
                promotion: schedule.promotions,
                informationType: "schedule",
                warningLevel: "critical",
                linkTo: "/student/schedule",
            };

            const notifPromotions = await notificationQueries.createNotification(
                notificationForPromotions
            );
            sendNotificationToPromotions(io, schedule.promotions, notifPromotions);

            // Notification pour le professeur (si présent)
            if (schedule.professor) {
                const notificationForProf = {
                    title: "Annulation de l'emploi du temps",
                    message: `L'emploi du temps prévu le ${new Date(
                        schedule.date
                    ).toLocaleDateString()} a été annulé.`,
                    type: "individual",
                    user: schedule.professor._id,
                    informationType: "schedule",
                    warningLevel: "critical",
                    linkTo: "/professor/schedule",
                };

                const notifProf =
                    await notificationQueries.createNotification(notificationForProf);
                sendNotificationToProfessor(io, schedule.professor._id, notifProf);
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'annulation de la notification d'emploi du temps :",
                error
            );
        }
    });

    // Changement de statut de demande administrative par l'admin
    socket.on(
        "administrativeRequestStatusChangeByAdmin",
        async ({ request }) => {
            try {
                if (
                    !verifyUserRole(socket, "admin") &&
                    !verifyUserRole(socket, "superAdmin")
                ) {
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

                let notification = null;
                if (request.status === "in-progress") {
                    notification = {
                        title:
                            request.requestType === "transcript"
                                ? "Demande de relevé de notes"
                                : request.requestType === "enrollment_certificate"
                                    ? "Demande de certificat de scolarité"
                                    : "Demande de diplôme",
                        message: `Votre demande de ${requestTypeMap[request.requestType]} a été prise en charge par l'administration.`,
                        type: "individual",
                        user: request.student._id,
                        informationType: "administrative",
                        warningLevel: null,
                        linkTo: `/student/administrative-requests`,
                    };
                } else if (request.status === "cancelled") {
                    notification = {
                        title:
                            request.requestType === "transcript"
                                ? "Demande de relevé de notes annulée"
                                : request.requestType === "enrollment_certificate"
                                    ? "Demande de certificat de scolarité annulée"
                                    : "Demande de diplôme annulée",
                        message: `Votre demande de ${requestTypeMap[request.requestType]} a été annulée par l'administration.`,
                        type: "individual",
                        user: request.student._id,
                        informationType: "administrative",
                        warningLevel: "warning",
                        linkTo: `/student/administrative-requests`,
                    };
                } else if (request.status === "recoverable") {
                    notification = {
                        title:
                            request.requestType === "transcript"
                                ? "Demande de relevé de notes prête"
                                : request.requestType === "enrollment_certificate"
                                    ? "Demande de certificat de scolarité prête"
                                    : "Demande de diplôme prêt",
                        message: `Votre demande de ${requestTypeMap[request.requestType]} est prête à être récupérée.`,
                        type: "individual",
                        user: request.student._id,
                        informationType: "administrative",
                        warningLevel: null,
                        linkTo: `/student/administrative-requests`,
                    };
                } else if (request.status === "delivered") {
                    notification = {
                        title:
                            request.requestType === "transcript"
                                ? "Demande de relevé de notes livrée"
                                : request.requestType === "enrollment_certificate"
                                    ? "Demande de certificat de scolarité livrée"
                                    : "Demande de diplôme livré",
                        message: `Votre demande de ${requestTypeMap[request.requestType]} a été livrée le ${new Date(request.recoveryDate).toLocaleDateString("fr-FR")}.`,
                        type: "individual",
                        user: request.student._id,
                        informationType: "administrative",
                        warningLevel: null,
                        linkTo: `/student/administrative-requests`,
                    };
                }

                if (notification) {
                    const notif =
                        await notificationQueries.createNotification(notification);
                    sendNotificationToStudent(io, request.student._id, notif);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification de changement de statut de la demande administrative par l'administrateur :",
                    error
                );
            }
        }
    );

    // Notification de vérification/rejet des frais de scolarité par l'admin
    socket.on("sendNotificationForFeesByAdmin", async ({ accept, tutionFees, label }) => {
        try {
            if (
                !verifyUserRole(socket, "admin") &&
                !verifyUserRole(socket, "superAdmin")
            ) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }

            const notification = {
                title: accept
                    ? "Frais de scolarité vérifiés"
                    : "Frais de scolarité rejetés",
                message: accept
                    ? `Vos frais de scolarité pour le niveau ${tutionFees.level} ${label} ont été vérifiés par l'administration.`
                    : `Vos frais de scolarité pour le niveau ${tutionFees.level} ${label} ont été rejetés par l'administration. Veuillez les mettre à jour.`,
                type: "individual",
                user: tutionFees.user._id,
                informationType: "financial",
                warningLevel: accept ? null : "warning",
                linkTo: `/student/fees/${tutionFees.promotion}`,
            };

            const notif =
                await notificationQueries.createNotification(notification);
            sendNotificationToStudent(io, tutionFees.user._id, notif);

        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de la notification des frais de scolarité par l'administrateur :",
                error
            );
        }
    });

    // Notification de changement de statut d'utilisateur par l'admin
    socket.on(
        "SendNotificationpatchUserStatusByAdmin",
        async ({ student, status }) => {
            try {
                if (
                    !verifyUserRole(socket, "admin") &&
                    !verifyUserRole(socket, "superAdmin")
                ) {
                    console.log(
                        `❌ Unauthorized access attempt by socket ID ${socket.id}`
                    );
                    return;
                }

                const notificationTemplates = {
                    completed: {
                        title: "Validation du niveau",
                        message: (level) =>
                            `Félicitations ! Vous accédez au niveau ${level}.`,
                        warningLevel: null,
                    },

                    repeated: {
                        title: "Redoublement",
                        message: (level) =>
                            `Vous êtes maintenu au niveau ${level}. Nous vous encourageons à persévérer.`,
                        warningLevel: "warning",
                    },

                    dropped: {
                        title: "Interruption du parcours",
                        message: (level) =>
                            `Votre parcours académique est interrompu à partir du niveau ${level}. Veuillez contacter l'administration.`,
                        warningLevel: "critical",
                    },
                };

                const template = notificationTemplates[status];

                const notification = {
                    title: template.title,
                    message: template.message(student.level),
                    type: "individual",
                    user: student._id,
                    informationType: "academic",
                    warningLevel: template.warningLevel,
                    linkTo: null,
                };

                const notif =
                    await notificationQueries.createNotification(notification);
                sendNotificationToStudent(io, student._id, notif);

                sendUpdateToUser(io, student._id);
            } catch (err) {
                console.error(
                    "Erreur lors de l'envoi de la notification de changement de statut de l'utilisateur par l'administrateur :",
                    err
                );
            }
        }
    );

    socket.on("SendNotificationForscheduleReclamationByAdmin", async ({ schedule }) => {
        try {
            if (
                !verifyUserRole(socket, "admin") &&
                !verifyUserRole(socket, "superAdmin")
            ) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }

            const notificationForStudent = {
                title: "Cours Manqué - Réclamation examinée",
                message: `Une réclamation concernant l'emploi du temps prévu le ${new Date(
                    schedule.date
                ).toLocaleDateString()} a été examinée par l'administration. Veuillez vérifier le statut mis à jour de cette séance.`,
                type: "promotion",
                promotion: schedule.promotions,
                informationType: "schedule",
                warningLevel: null,
                linkTo: "/student/schedule",
            };

            const notificationForProfessor = {
                title: "Cours Manqué - Réclamation examinée",
                message: `La réclamation étudiante concernant l'emploi du temps prévu le ${new Date(
                    schedule.date
                ).toLocaleDateString()} a été examinée par l'administration. Veuillez vérifier le statut mis à jour de cette séance.`,
                type: "individual",
                user: schedule.professor._id,
                informationType: "schedule",
                warningLevel: null,
                linkTo: "/professor/schedule",
            };

            const [notifForStudent, notifForProfessor] = await Promise.all([
                notificationQueries.createNotification(
                    notificationForStudent
                ),
                notificationQueries.createNotification(
                    notificationForProfessor
                )
            ]);

            sendNotificationToPromotions(io, schedule.promotions, notifForStudent);
            sendNotificationToProfessor(io, schedule.professor._id, notifForProfessor);

        } catch (err) {
            console.error("Erreur lors de l'envoi de la notification de réclamation d'emploi du temps par l'administrateur :", err);
        }
    })

    socket.on("sendNotificationForFeesUpdateToStudentRoom", async () => {
        try {
            if (
                !verifyUserRole(socket, "admin") &&
                !verifyUserRole(socket, "superAdmin")
            ) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }
            const notification = {
                title: "Mise à jour des frais de scolarité",
                message: "Les frais de scolarité ont été mis à jour. Veuillez consulter les détails.",
                type: "student",
                informationType: "financial",
                warningLevel: null,
                linkTo: "/student/newFees",
            };
            const notif =
                await notificationQueries.createNotification(notification);
            sendNotificationToStudentRoom(io, notif);
        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de la notification de mise à jour des frais de scolarité à la salle des étudiants par l'administrateur :",
                error
            );
        }
    });

    socket.on("sendAnnouncementNotificationToAllUsers", async (values, ack) => {
        try {

            if (
                !verifyUserRole(socket, "admin") &&
                !verifyUserRole(socket, "superAdmin")
            ) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }
            let type = "global";

            if (values.targetAudience === "all") {
                type = "global";
            } else {
                type = values.targetAudience;
            }

            const notification = {
                title: values.title,
                message: values.message,
                type: type,
                informationType: values.informationType || "announcement",
                warningLevel: values.warningLevel || null,
                linkTo: values.linkTo || null,
            };
            const notif =
                await notificationQueries.createNotification(notification);
            if (type === "global") {
                sendNotificationToAll(io, notif);
                ack({ success: true, message: "Annonce envoyée à tous les utilisateurs." });
                return
            } else if (type === "student") {
                sendNotificationToStudentRoom(io, notif);
                ack({ success: true, message: "Annonce envoyée aux étudiants." });
                return
            } else if (type === "professor") {
                sendNotificationToProfessorsRoom(io, notif);
                ack({ success: true, message: "Annonce envoyée aux professeurs." });
                return
            } else if (type === "admin" || type === "superAdmin") {
                sendNotificationToAdminRoom(io, notif);
                ack({ success: true, message: "Annonce envoyée aux administrateurs." });
                return
            }




        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de l'annonce par l'administrateur :",
                error
            );

            ack({ success: false, message: "Erreur lors de l'envoi de l'annonce." });
        }
    })


    socket.on("newBugReport", async (values) => {
        try {

            if (
                !verifyUserRole(socket, "superAdmin")
            ) {
                console.log(
                    `❌ Unauthorized access attempt by socket ID ${socket.id}`
                );
                return;
            }

            const typeMap = {
                bug: "un bug",
                feature: "une Nouvelle fonctionnalité",
                improvement: "une Amélioration",
                other: "autre chose"
            }

            const notification = {
                title: "Nouveau signalement reçu",
                message: `Un nouvel utilisateur a soumis ${typeMap[values.type]} avec le titre : ${values.title}`,
                type: "superAdmin",
                informationType: "alert",
                warningLevel: values.priority === "high" || values.priority === "critical" ? "critical" : null,
                linkTo: "/admin/bug-reports/list",
            };
            const notif =
                await notificationQueries.createNotification(notification);
            sendToSuperAdmins(io, notif);




        } catch (error) {
            console.error(
                "Erreur lors de l'envoi de la notification de nouveau rapport de bug par l'administrateur :",
                error
            );
        }
    })

};

module.exports = registerAdminEvents;
