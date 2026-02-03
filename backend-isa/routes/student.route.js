const ReportQueries = require("../queries/Report.queries");
const StudentQueries = require("../queries/Student.queries");
const TutionFeesQueries = require("../queries/TutionFees.queries");
const mongoose = require("mongoose");
const promotionQueries = require("../queries/promotion.queries");
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs/promises");
const sharp = require("sharp");
const { decryptCIN } = require("../function/EncryptCIN");
const UserQueries = require("../queries/UserQueries");
const submissionQueries = require("../queries/submission.queries");
const FeesManagementQueries = require("../queries/FeesManagement.queries");
const { isAdminAndSuperAdmin, isSuperAdmin } = require("../middleware/AdminVerification");


// cette route permet de recuperer la liste des etudiants non verifies

router.get("/notVerified", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { pageQuery, perPageQuery, searchQuery, fieldsQuery } = req.query;
    const { student, totalStudent } =
      await StudentQueries.GetStudentByVerification(
        pageQuery,
        perPageQuery,
        searchQuery,
        fieldsQuery
      );
    res.status(200).json({ student, totalStudent });
  } catch (error) {
    res.sendStatus(500);
  }
});


// cette route permet de verifier le paiement de la premiere tranche d'un etudiant

router.post("/verified/:studentId/:tutionfeesId", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { tutionfeesId, studentId } = req.params;

    const student = await StudentQueries.GetStudentById(studentId);

    const currentPromotions =
      await promotionQueries.GetActivePromotionsForCurrentYear(
        student.field,
        student.level
      );

    if (!currentPromotions) {
      return res
        .status(400)
        .send(
          `Aucune promotion active trouvée pour l'année en cours pour ${student.level} ${student.field}. Veuillez faire cela avant de valider l'etudiant.`
        );
    }

    const StudentUpdate = {
      verified: true,
      $set: {
        parcours: [{ promotion: currentPromotions._id, status: "in progress" }],
      },
    };

    const updateFields = {
      verifiedBy: req.session._id,
      verified: true,
    };


    await TutionFeesQueries.updateInstallmentByLabel(
      tutionfeesId,
      "Tranche 1",
      updateFields,
      session
    );

    await TutionFeesQueries.updatePromotionInTutionFees(
      student._id,
      currentPromotions._id,
      session
    );

    const updatedStudent = await StudentQueries.UpdateStudentById(
      studentId,
      StudentUpdate,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Vérification du paiement de la tranche 1 pour l'étudiant matricule ${updatedStudent.matricule}`,
      details: `L'étudiant matricule ${updatedStudent.matricule}, inscrit en filière ${updatedStudent.field}, a été vérifié et admis suite à la validation correcte du paiement de la première tranche.`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    session.endSession();

    res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Erreur lors de la vérification du paiement");
  }
});

// cette route permet de recuperer la liste des etudiants par promotion

// router.get("/promotion/:promotionId", isAdminAndSuperAdmin, async (req, res) => {
//   try {
//     const { promotionId } = req.params;

//     const students = await StudentQueries.GetStudentByPromotionId(promotionId);
//     res.status(200).json(students);
//   } catch (error) {
//     res
//       .status(500)
//       .send("Erreur lors de la récupération des étudiants par promotion");
//   }
// });

// ==================== FONCTIONS UTILITAIRES ====================

async function compressImage(inputPath, outputPath) {
  try {
    await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);

    await fsPromises.unlink(inputPath);
    return true;
  } catch (err) {
    console.error("Erreur compression image:", err.message);
    return false;
  }
}

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ==================== MULTER CONFIGURATION ====================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const { matricule } = req.query;
      if (!matricule)
        return cb(new Error("Matricule manquant dans la requête."));

      // Dossier privé de l'étudiant
      const tempDir = path.join(
        __dirname,
        "..",
        "private",
        "user",
        matricule,
        "info"
      );

      // Création récursive du dossier s'il n'existe pas
      fs.mkdir(tempDir, { recursive: true }, (err) => {
        if (err) return cb(err);
        cb(null, tempDir);
      });
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "_"); // éviter les espaces
    cb(null, `bacTranscript-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 Mo max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seuls les fichiers image sont autorisés."), false);
  },
}).single("bacTranscript");

// --- Route upload ---
router.post("/uploadBacTranscript", async (req, res) => {
  let originalFilePath = null;
  let compressedFilePath = null;

  upload(req, res, async (err) => {
    try {
      // Gestion des erreurs Multer
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ error: `Erreur Multer : ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Aucun fichier téléchargé." });
      }

      const { studentId, matricule } = req.query;

      if (!studentId || !matricule) {
        // Nettoyer le fichier uploadé
        if (req.file.path && (await fileExists(req.file.path))) {
          await fsPromises.unlink(req.file.path);
        }
        return res
          .status(400)
          .json({ error: "studentId et matricule sont requis." });
      }

      originalFilePath = req.file.path;
      compressedFilePath = originalFilePath.replace(
        path.extname(originalFilePath),
        ".webp"
      );

      // Compresser l'image en WebP
      const success = await compressImage(originalFilePath, compressedFilePath);

      if (!success) {
        // Nettoyer les fichiers en cas d'échec de compression
        if (originalFilePath && (await fileExists(originalFilePath))) {
          await fsPromises.unlink(originalFilePath);
        }
        if (compressedFilePath && (await fileExists(compressedFilePath))) {
          await fsPromises.unlink(compressedFilePath);
        }
        return res
          .status(500)
          .json({ error: "Erreur lors de la compression du fichier." });
      }

      // Créer le chemin relatif pour la base de données (format: user\ETU-250001\info\bacTranscript-xxx.webp)
      const relativePath = path.relative("private", compressedFilePath);

      // Enregistrer le chemin dans la base de données
      const student = await StudentQueries.UpdateStudentById(studentId, {
        bacTranscript: relativePath,
      });

      res.status(200).json(student);
    } catch (error) {
      console.error("Erreur principale :", error);

      // Nettoyage des fichiers en cas d'erreur
      try {
        if (originalFilePath && (await fileExists(originalFilePath))) {
          await fsPromises.unlink(originalFilePath);
        }
        if (compressedFilePath && (await fileExists(compressedFilePath))) {
          await fsPromises.unlink(compressedFilePath);
        }
      } catch (cleanupErr) {
        console.error(
          "Erreur lors de la suppression du fichier :",
          cleanupErr.message
        );
      }

      res
        .status(500)
        .json({ error: "Erreur lors du téléchargement du relevé de notes." });
    }
  });
});

// cette route permet de recuperer un etudiant par son id
router.get("/:studentId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await StudentQueries.GetStudentById(studentId, {
      populate: true,
    });
    const realStudent = {
      ...student,
      cin: decryptCIN(student.cin),
    };

    if (!student) {
      return res.status(404).send("Étudiant non trouvé");
    }

    res.status(200).json(realStudent);
  } catch (error) {
    res.status(500).send("Erreur lors de la récupération de l'étudiant");
  }
});

// cette route permet de basculer l'etat de restriction d'un etudiant

router.patch("/:studentId/toggle-restriction", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId } = req.params;

    const student = await StudentQueries.GetStudentById(studentId);
    if (!student) {
      return res.status(404).send("Étudiant non trouvé");
    }

    const currentPromotion = student.parcours.find(
      (p) => p.status === "in progress"
    );
    const fees = await TutionFeesQueries.getTutionFeesByStudentAndPromotion(
      studentId,
      currentPromotion.promotion
    );

    let isNotVerified = false;
    const now = new Date();

    for (let installment of fees.installments) {
      if (!installment.verified) {
        // Vérifier si la date d'échéance est dépassée
        const dueDate = new Date(installment.dueDate);
        if (dueDate < now) {
          // L'échéance est dépassée et le paiement n'est pas vérifié
          isNotVerified = true;
          break;
        }
        // Si l'échéance est dans le futur, c'est ok, on continue
      }
    }

    if (isNotVerified && student.isRestricted === true) {
      return res
        .status(400)
        .send(
          "Impossible de modifier la restriction. L'étudiant a des paiements en retard non vérifiés."
        );
    }

    // Mettre à jour la restriction de l'étudiant
    await StudentQueries.UpdateStudentById(
      studentId,
      { isRestricted: !student.isRestricted },
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Modification de la restriction pour l'étudiant matricule ${student.matricule}`,
      details: `${student.isRestricted ? "Levée" : "Application"} de la restriction pour l'étudiant matricule ${student.matricule}.`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).send("ok");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .send("Erreur lors de la mise à jour de la restriction de l'étudiant");
  }
});

router.delete("/:studentId", isSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { studentId } = req.params;

    // 1️⃣ Suppression DB
    const deletedStudent = await StudentQueries.deleteStudentById(
      studentId,
      session
    );

    // 2️⃣ Rapport (DB)
    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Suppression de l'étudiant (${studentId})`,
      details: `Suppression de l'étudiant avec l'ID ${studentId}`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);

    // 3️⃣ COMMIT
    await session.commitTransaction();
    session.endSession();

    // =================================================
    // 🟢 FILESYSTEM APRÈS COMMIT
    // =================================================
    try {
      const directory = path.join(
        __dirname,
        "..",
        "private",
        "user",
        deletedStudent.matricule
      );

      await fsPromises.rm(directory, {
        recursive: true,
        force: true
      });
    } catch (fsError) {
      console.error(
        "⚠️ Erreur suppression fichiers étudiant:",
        fsError.message
      );
      // DB OK → réparation manuelle possible
    }

    res.sendStatus(204);

  } catch (error) {
    try {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
    } finally {
      session.endSession();
    }

    console.error("❌ Erreur suppression étudiant:", error);
    res.status(500).send("Erreur lors de la suppression de l'étudiant");
  }
});


// cette route permet de mettre a jour les informations d'un etudiant

router.patch("/:studentId", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    const authorizedFields = [
      "email",
      "name",
      "firstName",
      "phone",
      "address",
      "gender",
      "emergencyContactName",
      "emergencyContactPhone",
      "emergencyContactRelation",
    ];

    if (
      !Object.keys(updateData).every((field) =>
        authorizedFields.includes(field)
      )
    ) {
      return res.status(400).send("Champs de mise à jour non autorisés.");
    }

    if (updateData.email) {
      const existingStudent = await UserQueries.GetUserByEmail(
        updateData.email
      );
      if (existingStudent && existingStudent._id.toString() !== studentId) {
        return res
          .status(400)
          .send("L'email est déjà utilisé par un autre utilisateur.");
      }
    }

    const updatedStudent = await StudentQueries.UpdateStudentById(
      studentId,
      updateData,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Mise à jour des informations de l'étudiant (${updatedStudent.matricule})`,
      details: `Mise à jour des informations de l'étudiant avec l'ID ${studentId}`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(updatedStudent);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .send("Erreur lors de la mise à jour des informations de l'étudiant");
  }
});



// cette route permet de recuperer la liste des etudiants par promotion

router.get("/parcours/:promotionId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { promotionId } = req.params;
    const students =
      await StudentQueries.getStudentByPromotionForGrades(promotionId);
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send("Erreur lors de la récupération des étudiants par promotion");
  }
});

// c'est la route pour faire passer l'etudiant a une autre promotion  , la faire redoubler ou le faire abandonner

router.patch("/status/parcours/:studentId/:promotionId", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = req.body;
    const { studentId, promotionId } = req.params;
    const data = {
      status: body.status,
    };
    const allowedFields = ["status"];

    if (!Object.keys(body).every((field) => allowedFields.includes(field))) {
      return res.status(400).send("Champs de mise à jour non autorisés.");
    }

    const student = await StudentQueries.GetStudentById(studentId);
    if (!student) {
      return res.status(404).send("Étudiant non trouvé");
    }

    const isFeesOK = await TutionFeesQueries.checkFeesStateByPromotionByStudent(
      promotionId,
      studentId
    );

    console.log("isFeesOK:", isFeesOK);

    if (isFeesOK === null) {
      return res
        .status(400)
        .send(
          "Impossible de modifier le statut du parcours. Les informations de frais de scolarité sont manquantes pour cette promotion."
        );
    }

    if (isFeesOK === false) {
      return res
        .status(400)
        .send(
          "Impossible de modifier le statut du parcours. Tous les paiements des frais de scolarité doivent être vérifiés pour cette promotion."
        );
    }

    const grades =
      await submissionQueries.getAllExamGradesByStudentAndPromotion(
        studentId,
        promotionId
      );

    if (grades.length === 0) {
      return res
        .status(400)
        .send(
          "Impossible de modifier le statut du parcours. Aucun module trouvé pour la promotion spécifiée."
        );
    }

    const allModulesHaveNormalLocked = grades.every((unit) =>
      unit.modules.every((module) => {
        // Trouver l'examen de session normale
        const normalExam = module.examSubmissions.find(
          (exam) => exam.assignment.session === "normal"
        );

        // Vérifications complètes :
        // 1. L'examen normal existe
        // 2. Il a une submission
        // 3. La submission a une note valide (pas null)
        // 4. L'examen est verrouillé
        return (
          normalExam &&
          normalExam.submission &&
          normalExam.submission.grade !== null &&
          normalExam.assignment.lockedGrade === true
        );
      })
    );

    if (!allModulesHaveNormalLocked) {
      return res
        .status(400)
        .send(
          "Impossible de modifier le statut du parcours. Tous les modules de la promotion doivent avoir des notes valides attribuées et verrouillées pour la session normale."
        );
    }

    const currentPromotion = student.parcours.find(
      (p) => p.status === "in progress"
    );

    if (promotionId !== currentPromotion.promotion.toString()) {
      return res
        .status(400)
        .send(
          "La promotion spécifiée ne correspond pas à la promotion actuelle de l'étudiant."
        );
    }

    const currentPromotionDetails = await promotionQueries.GetPromotionById(
      currentPromotion.promotion
    );

    let futurePromotion = null;
    let level = student.level;

    const availableLevel = ["L1", "L2", "L3"];

    if (currentPromotionDetails.isActive) {
      return res
        .status(400)
        .send(
          "Impossible de modifier le statut du parcours. La promotion actuelle est toujours active."
        );
    }

    if (data.status === "completed") {
      if (student.level === "L1") level = "L2";
      else if (student.level === "L2") level = "L3";
      else if (student.level === "L3") level = "M1";
      else if (student.level === "M1") level = "M2";

      futurePromotion = await promotionQueries.getFuturePromotion(
        level,
        currentPromotionDetails.field,
        currentPromotionDetails.endDate
      );
    } else if (data.status === "repeated") {
      level = student.level;
      futurePromotion = await promotionQueries.getFuturePromotion(
        level,
        currentPromotionDetails.field,
        currentPromotionDetails.endDate
      );
    }

    if (
      !futurePromotion &&
      availableLevel.includes(level) &&
      data.status !== "dropped"
    ) {
      return res
        .status(400)
        .send(
          "Aucune promotion future trouvée. Veuillez créer la promotion avant de procéder."
        );
    }

    const { isValid } =
      await FeesManagementQueries.checkFeesManagementisNotOutdated(
        futurePromotion.level,
        futurePromotion.field,
        currentPromotionDetails.endDate
      );

    if (!isValid) {
      return res
        .status(400)
        .send(
          `Les frais de scolarité pour la future promotion ${futurePromotion.level} ${futurePromotion.field} contiennent des échéances obsolètes par rapport à la date de début de la nouvelle promotion. Veuillez mettre à jour les frais de scolarité avant de procéder.`
        );
    }
    data.level = level;

    const updatedStudent = await StudentQueries.PatchStudentParcours(
      studentId,
      currentPromotionDetails._id,
      futurePromotion ? futurePromotion._id : null,
      data,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Mise à jour du parcours de l'étudiant (${student.matricule})`,
      details: `Mise à jour du statut de l'étudiant avec l'imatricule ${student.matricule} au statut "${data.status}" pour le niveau ${student.level} au ${level}.`,
      role: req.session.role,
    };

    const feesForFuturePromotion =
      await FeesManagementQueries.GetFeesManagementByFieldAndLevel(
        futurePromotion.level,
        futurePromotion.field
      );

    if (!feesForFuturePromotion) {
      return res
        .status(400)
        .send(
          "Aucun frais de scolarité n'est défini pour la future promotion de cet étudiant. Veuillez définir les frais de scolarité avant de procéder."
        );
    }

    await TutionFeesQueries.CreateFeesWithSessionAndPromotion(
      student._id,
      { field: futurePromotion.field, level: futurePromotion.level },
      futurePromotion._id,
      session
    );

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.log(error);

    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .send("Erreur lors de la mise à jour du statut de l'étudiant");
  }
});

module.exports = router;
