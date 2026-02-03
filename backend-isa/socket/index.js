/**
 * Configuration principale de Socket.IO
 * Initialise les connexions Socket.IO et distribue les événements par rôle d'utilisateur
 * Utilise le système de rooms pour une compatibilité avec PM2 (multi-instances)
 */

const socketIo = require("socket.io");
const { sessionMiddleware, server } = require("../index");
const { setSocketIO: setFeesSocketIO } = require("../script/checkFeesAndSendReminder");
const { setSocketIO: setScheduleSocketIO } = require("../script/cronTocheckSchedule");
const { getUserRoom } = require("./helpers.socket");

const notificationQueries = require("../queries/notification.queries");
const { sendNotificationToAdminRoom } = require("./helpers.socket");


// Importation des gestionnaires d'événements par rôle
const registerAdminEvents = require("./admin.socket");
const registerStudentEvents = require("./student.socket");
const registerProfessorEvents = require("./professor.socket");

const allowedOrigins = (process.env.SOCKET_ORIGINS || process.env.CLIENT_ORIGINS || "http://localhost:5173,http://localhost:3000,https://edu.isa-ambato.mg,https://isa-ambato.mg")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

// Origines qui doivent rester anonymes même avec une session valide
const anonymousOrigins = (process.env.ANONYMOUS_ORIGINS || "http://localhost:3000,https://isa-ambato.mg")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: (origin, callback) => {
                // Permet les clients non-navigateurs (pas d'Origin)
                if (!origin) return callback(null, true);
                if (allowedOrigins.includes(origin)) return callback(null, true);
                return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
            },
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true,
        },
    });

    // Middleware pour gérer l'authentification des connexions Socket.IO
    io.use((socket, next) => {
        sessionMiddleware(socket.request, socket.request.res || {}, (err) => {
            if (err) {
                console.error("Session middleware error:", err);
                return next(err);
            }

            const session = socket.request.session;
            const origin = socket.handshake.headers.origin;

            // Forcer mode anonyme pour certaines origines (ex: localhost:3000)
            const forceAnonymous = anonymousOrigins.includes(origin);

            if (session && session.matricule && !forceAnonymous) {
                socket.isAuthenticated = true;

                // Stocker les infos utilisateur sur le socket
                socket.user = {
                    _id: session._id,
                    matricule: session.matricule,
                    role: session.role,
                    fullName: session.fullName,
                };

                console.log(
                    `✅ User ${session.matricule} connected (socket: ${socket.id})`
                );
            } else {
                socket.isAuthenticated = false;
                console.log(`⚠️ Anonymous connection${forceAnonymous ? ` (forced for origin: ${origin})` : ""}`);
            }

            next();
        });
    });

    // Gestion des connexions
    io.on("connection", (socket) => {
        // Rejoindre automatiquement la room personnelle de l'utilisateur
        if (socket.isAuthenticated) {
            const userRoom = getUserRoom(socket.user._id);
            socket.join(userRoom);
            console.log(`🚪 User ${socket.user.matricule} joined personal room: ${userRoom}`);

            const userRole = socket.user.role;

            // Enregistrer les événements pour les administrateurs
            if (userRole === "admin" || userRole === "superAdmin") {
                registerAdminEvents(io, socket);
            }

            // Enregistrer les événements pour les étudiants
            if (userRole === "student") {
                registerStudentEvents(io, socket);
            }

            // Enregistrer les événements pour les professeurs
            if (userRole === "professor") {
                registerProfessorEvents(io, socket);
            }

            // Événement test uniquement pour les utilisateurs authentifiés
            socket.on('test', () => {
                console.log(`Test socket io from ${socket.user.matricule}`);
            });
        } else {
            // Déconnecter immédiatement les utilisateurs anonymes (optionnel)
            // socket.disconnect(true);
        }

        // Événement accessible aux utilisateurs anonymes (préinscription)
        socket.on("newPendingUser", async ({ inscriptionNumber }) => {
            try {
                console.log(`📝 Nouvelle préinscription reçue: ${inscriptionNumber}`);

                // Validation du numéro d'inscription
                if (!inscriptionNumber || typeof inscriptionNumber !== 'string') {
                    console.log(`❌ Invalid inscriptionNumber from socket ${socket.id}`);
                    return;
                }


                const notification = {
                    title: "Nouvel Etudiant préinscrit",
                    message: `Un nouvel étudiant avec le numéro d'inscription ${inscriptionNumber} a soumis une demande de préinscription.`,
                    type: "admin",
                    informationType: "account",
                    warningLevel: null,
                    linkTo: "/admin/pre-inscription/list",
                };
                const notif = await notificationQueries.createNotification(notification);
                sendNotificationToAdminRoom(io, notif);

            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification de nouvel étudiant préinscrit:",
                    error
                );
            }
        });

        // Événement accessible aux utilisateurs anonymes (inscription)
        socket.on("newInscription", async ({ user }) => {
            try {
                console.log(`📋 Nouvelle inscription reçue pour: ${user?.matricule || 'matricule inconnu'}`);
                if (!user || !user.matricule) {
                    console.log(`❌ Invalid user data from socket ${socket.id}`);
                    return;
                }

                const notification = {
                    title: "Nouvelle inscription étudiante",
                    message: `Une nouvelle inscription étudiante a été effectuée pour l'étudiant(e) portant le matricule ${user.matricule}.`,
                    type: "admin",
                    informationType: "account",
                    warningLevel: null,
                    linkTo: "/admin/subscribed",
                };
                const notif = await notificationQueries.createNotification(notification);
                sendNotificationToAdminRoom(io, notif);

            } catch (error) {
                console.error(
                    "Erreur lors de l'envoi de la notification de nouvelle inscription:",
                    error
                );
            }
        });

        // Gestion de la déconnexion (commun à tous les rôles)
        socket.on("disconnect", () => {
            console.log(
                `✅ User ${socket.user ? socket.user.matricule : "unknown"} disconnected`
            );
        });
    });

    // Initialiser Socket.IO pour les scripts cron
    setFeesSocketIO(io); // Script de rappel de paiement
    setScheduleSocketIO(io); // Script de vérification des emplois du temps

    return io;
};

initSocket(server);

module.exports = initSocket;
