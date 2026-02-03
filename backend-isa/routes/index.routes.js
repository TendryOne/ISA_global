const router = require("express").Router();
const userRoutes = require("./user.routes");
const pendingStudents = require("./pendingUsers.routes");
const uploadRoutes = require("./upload.routes");
const documentRoutes = require("./document.routes");
const authRoutes = require("./authentication.route");
const reportRoutes = require("./report.route");
const feesManagement = require("./feesManagement.route");
const {
  isSuperAdmin,
  isAdminAndSuperAdmin,
} = require("../middleware/AdminVerification");
const studentsRoutes = require("./student.route");
const tutionFeesRoutes = require("./tutionFees.route.js");
const teachingUnit = require("./teachingUnit.route.js");
const ProfessorRoutes = require("./professor.route.js");
const moduleRoutes = require("./module.route.js");
const adminRoutes = require("./admin.route.js");
const promotionRoutes = require("./promotion.route");
const scheduleRoutes = require("./schedule.route.js");
const settingsRoutes = require("./settings.route");
const resourcesRoutes = require("./resources.route");
const assignmentsRoutes = require("./assignments.route");
const submissionRoutes = require("./submission.route");
const bugReportsRoutes = require("./bugReports.route");
const StudentQueries = require("../queries/Student.queries.js");
const promotionQueries = require("../queries/promotion.queries.js");
const submissionQueries = require("../queries/submission.queries.js");
const gradesAuthenticationRoutes = require("./gradesAuthentication.route");
const administrativeRequestsRoute = require("./administrative-requests.route");
const notificationsRoutes = require("./notifications.route.js");
const dashboardRoutes = require("./dashboard.route.js");
const usage = require("./usage.route.js");
const eventLogsRoutes = require("./eventLog.route.js");
const { isConnectedMiddleware } = require("../middleware/middleware.global");

router.use("/api/v1/user", userRoutes); // safe routes

router.use("/api/v1/pendingUsers", pendingStudents); // safe routes

router.use("/api/v1/upload", uploadRoutes); // safe routes

// Middleware personnalisé pour /api/v1/document qui accepte soit l'auth normale, soit un token temporaire
const documentAuthMiddleware = async (req, res, next) => {
  // Si un token temporaire est présent, on passe directement (la validation sera faite dans la route)
  if (req.query.token && req.query.inscriptionId) {
    return next();
  }

  // Vérifier que l'utilisateur est authentifié (peu importe le rôle)
  if (!req.session || !req.session.matricule) {
    console.log(
      `[documentAuthMiddleware] Tentative d'accès sans session à ${new Date()}`
    );
    return res
      .status(401)
      .json({ error: "Authentification requise. Veuillez vous connecter." });
  }

  // Récupérer l'utilisateur pour vérifier qu'il existe
  const UserQueries = require("../queries/UserQueries");
  const user = await UserQueries.GetUserByMatricule(req.session.matricule);
  if (!user) {
    console.log(
      `[documentAuthMiddleware] Tentative d'accès avec matricule invalide ${req.session.matricule} à ${new Date()}`
    );
    return res.status(403).json({ error: "Utilisateur non trouvé." });
  }

  console.log(
    `[documentAuthMiddleware] Accès autorisé pour ${req.session.matricule} (${user.role}) à ${new Date()}`
  );

  // Tous les utilisateurs authentifiés peuvent accéder (la vérification des droits se fait dans document.routes.js)
  next();
};

router.use("/api/v1/document", documentAuthMiddleware, documentRoutes); // safe routes

router.use("/api/v1/auth", authRoutes); // safe routes

router.use("/api/v1/report", reportRoutes); // safe routes

router.use("/api/v1/feesManagement", feesManagement); // safe routes

router.use("/api/v1/students", studentsRoutes); // safe routes

router.use("/api/v1/tutionFees", tutionFeesRoutes); // safe routes

router.use("/api/v1/teachingUnits", teachingUnit); // safe routes

router.use("/api/v1/professor", ProfessorRoutes); // SAFE ROUTES

router.use("/api/v1/modules", moduleRoutes); // safe routes

router.use("/api/v1/admins", isSuperAdmin, adminRoutes); // safe routes

router.use("/api/v1/promotions", promotionRoutes); // safe routes

router.use("/api/v1/schedules", scheduleRoutes); // safe routes

router.use("/api/v1/settings", settingsRoutes); // safe routes

router.use("/api/v1/resources", resourcesRoutes); //  safe routes

router.use("/api/v1/assignments", assignmentsRoutes); // safe routes

router.use("/api/v1/submissions", submissionRoutes); // safe routes

router.use("/api/v1/bugReports", bugReportsRoutes); // safe routes

router.use("/api/v1/gradesAuthentication", gradesAuthenticationRoutes); // safe routes

router.use("/api/v1/administrativeRequests", administrativeRequestsRoute); // safe routes

router.use("/api/v1/notifications", isConnectedMiddleware, notificationsRoutes);  // safe routes

router.use("/api/v1/dashboard", dashboardRoutes); // safe routes

router.use("/api/v1/usage", usage); // safe routes)

router.use("/api/v1/eventLogs", eventLogsRoutes);

router.get("/test", (req, res) => {
  const registrationNumber = "123123123";
  const submissionDate = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });


  const resultsDate = "31 juillet 2025";
  const reviewEndDate = "15 juillet 2025";
  const registrationStartDate = "1 août 2025";
  const registrationEndDate = "15 août 2025";
  const mail = "mail@isa-ambato.mg"
  const telephone = "+261 34 08 123 45"


  res.render("mailForInscription", {
    registrationNumber,
    submissionDate,
    resultsDate,
    reviewEndDate,
    registrationStartDate,
    registrationEndDate,
    mail,
    telephone,
  });
});

router.get("/test2", (req, res) => {
  res.render("mailForResetPassword", {
    resetLink: "/hello",
    mail: "mail@isa-ambato.mg",
    telephone: "+261 34 08 123 45",
  });
});

router.get("/test3", (req, res) => {
  res.render("mailForAdmission", {
    candidateName: "John Rakoto",
    registrationNumber: "ISA2023-45678",
    programName: "Informatique de Gestion",
    academicYear: "2023-2024",
    registrationLink: "https://isa-ambato.mg/inscription?token=ABC123XYZ456",
    tuitionFees: "800 000",
    level: "L1",


    fixedFees: [
      { name: "Frais de dossier", amount: "50 000 Ar" },
      { name: "Frais de bibliothèque", amount: "20 000 Ar" },
    ],
    totalFixedFees: "70 000 Ar",


    paymentInstallments: [
      { name: "1ère tranche", amount: "300 000 Ar", deadline: "15/09/2023" },
      { name: "2ème tranche", amount: "250 000 Ar", deadline: "15/12/2023" },
      { name: "3ème tranche", amount: "250 000 Ar", deadline: "15/03/2024" },
    ],


    paymentMethods: [
      "Paiement en espèces à la trésorerie de l'ISA",
      "Virement bancaire (coordonnées fournies après finalisation)",
      "Paiement mobile (MVola, Airtel Money, Orange Money)",
    ],


    admissionEmail: "admission@isa-ambato.mg",
    admissionPhone: "+261 34 56 789 10",
    workingHours: "Lundi-Vendredi, 8h-16h",
  });
});

router.get("/test4", (req, res) => {
  res.render("mailForSuccesAdmission", {
    password: "123",
    matricule: "1234",
    mail: "",
    telephone: "",
  });
});

router.get("/test5", (req, res) => {
  res.render("mailForPasswordGive", {
    temporaryPassword: "abcd1234",
    matriculeNumber: "ISA2023-45678",
  });
});

router.get("/test6", async (req, res) => {
  try {
    const [student, promotion, gradesData] = await Promise.all([
      StudentQueries.GetStudentById("68ed46e0e6f6a1f71655c1dc"),
      promotionQueries.GetPromotionById("68fd177077184b92cffb898a"),
      submissionQueries.getAllExamGradesByStudentAndPromotion(
        "68ed46e0e6f6a1f71655c1dc",
        "68fd177077184b92cffb898a"
      ),
    ]);


    const teachingUnits = gradesData;
    const gradesMap = new Map();


    teachingUnits.forEach((tu) => {
      tu.modules.forEach((module) => {
        module.examSubmissions.forEach((exam) => {
          const moduleKey = module._id.toString();
          const currentGrade = exam.submission.grade;


          if (gradesMap.has(moduleKey)) {
            const existing = gradesMap.get(moduleKey);

            if (
              currentGrade !== null &&
              (existing.grade === null || currentGrade > existing.grade)
            ) {
              gradesMap.set(moduleKey, {
                teachingUnitCode: tu.teachingUnit.code,
                teachingUnitName: tu.teachingUnit.name,
                semester: tu.teachingUnit.semester,
                moduleId: module._id,
                moduleCode: module.code,
                moduleTitle: module.title,
                moduleCoefficient: module.coefficient,
                grade: currentGrade,
                status: exam.submission.status,
              });
            }
          } else {

            gradesMap.set(moduleKey, {
              teachingUnitCode: tu.teachingUnit.code,
              teachingUnitName: tu.teachingUnit.name,
              semester: tu.teachingUnit.semester,
              moduleId: module._id,
              moduleCode: module.code,
              moduleTitle: module.title,
              moduleCoefficient: module.coefficient,
              grade: currentGrade,
              status: exam.submission.status,
            });
          }
        });
      });
    });


    const grades = Array.from(gradesMap.values());


    const QRCode = require("qrcode");
    const qrCodeData = `ISA-TRANSCRIPT-${student.matricule}-${promotion._id}`;
    const qrCode = await QRCode.toDataURL(qrCodeData);


    const formattedTeachingUnits = teachingUnits.map((tu) => ({
      _id: tu.teachingUnit._id,
      code: tu.teachingUnit.code,
      name: tu.teachingUnit.name,
      semester: tu.teachingUnit.semester,
      credits: tu.teachingUnit.credits,
      modules: tu.modules,
    }));

    res.render("StudentTranscript", {
      student: {
        firstName: student.firstName,
        name: student.name,
        matricule: student.matricule,
        field: student.field,
      },
      promotion: {
        name: promotion.name,
      },
      academicYear: promotion.name,
      qrCode: qrCode,
      logoUrl: "/logo-write.png",
      teachingUnits: formattedTeachingUnits,
      grades: grades,
    });
  } catch (error) {
    console.error("Erreur lors de la génération du relevé de notes:", error);
    res.status(500).send("Erreur lors de la génération du relevé de notes");
  }
});

router.get("/test7", (req, res) => {
  try {
    const studentData = {
      name: "Dupont",
      firstName: "Jean",
      matricule: "ET2024001",
      birthDate: "2000-05-15",
      birthPlace: "Antananarivo",
      nationality: "Malagasy",
      fieldOfStudy: "Informatique",
      academicLevel: "Licence 3",
      status: "active",
    };

    const academicYear = "2023-2024";
    const qrCodeData = null;
    res.render("studentCard", {
      student: studentData,
      academicYear: academicYear,
      qrCodeData: qrCodeData,
    });
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get("/test8", (req, res) => {
  const student = {
    firstName: "Jean",
    lastName: "Rakotoarisoa",
    inscriptionId: "ISA-2025-00421",
    submissionDate: "2025-01-10T09:30:00.000Z",

    logoUrl: "/logo-write.png",

    identityPhoto: "uploads/students/jean-rakoto-photo.jpg",
    identityPhotoUrl: "/uploads/students/jean-rakoto-photo.jpg",

    birthDate: "2004-06-18",
    birthPlace: "Antananarivo",
    gender: "male",
    cin: "201 021 045 678",
    address: "Lot II A 45, Ambatomirahavavy, Antananarivo",

    phone: "+261 34 12 345 67",
    email: "jean.rakotoarisoa@example.com",

    emergencyContactName: "Marie Rakoto",
    emergencyContactRelation: "Mère",
    emergencyContactPhone: "+261 32 45 678 90",

    lastDiploma: "Baccalauréat",
    bacSeries: "Série C",
    bacYear: "2024",
    previousInstitution: "Lycée Moderne d'Antananarivo",
    field: "Informatique",
    levelAsked: "Licence 1",

    transactionNumber: "TXN-98541236",
    acceptingTerms: true,

    idDocument: "uploads/documents/cin-jean-rakoto.jpg",
    idDocumentUrl: "/uploads/documents/cin-jean-rakoto.jpg",

    residenceCertificate: "uploads/documents/certificat-residence-jean.jpg",
    residenceCertificateUrl: "/uploads/documents/certificat-residence-jean.jpg",

    bacTranscript: "uploads/documents/releve-bac-jean.jpg",
    bacTranscriptUrl: "/uploads/documents/releve-bac-jean.jpg"
  };

  const qrCode = "/uploads/qrcodes/ISA-2025-00421.png";

  res.render("studentRegistrationForm", {
    student,
    qrCode
  });



});


module.exports = router;
