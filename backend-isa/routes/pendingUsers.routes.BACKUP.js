const router = require("express").Router();
const multer = require("multer");
const {
  createFileDirectory,
  createFileDirectoryUserProof,
} = require("../function");
const {
  generateInscriptionNumber,
  DecreaseInscriptionNumberSequence,
} = require("../function/generateInscriptionNumber");
const sharp = require("sharp");
const fsPromises = require("fs/promises");
const fs = require("fs");
const path = require("path");
const pendingStudentsQueries = require("../queries/pendingStudents.queries");
const { SendMailForInscription } = require("../mail/SendMailForInscription");
const XLSX = require("xlsx");
const UserQueries = require("../queries/UserQueries");
const { SendMailForAdmission } = require("../mail/sendMailForAdmission");
const FeesManagementQueries = require("../queries/FeesManagement.queries");
const crypto = require("crypto");
const { hashToken } = require("../function/HashToken");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const {
  generateMatriculeNumber,
} = require("../function/generateMatriculeNumber");
const TutionFeesQueries = require("../queries/TutionFees.queries");
const {
  SendMailForSuccessAdmission,
} = require("../mail/sendMailForAdmissionSuccess");
const TutionFees = require("../models/tutionFees.model");
const ReportQueries = require("../queries/Report.queries");
const { encryptCIN } = require("../function/EncryptCIN");

// Fonctions utilitaires
async function cleanupFiles(files) {
  if (!files) return;

  const cleanupPromises = Object.values(files)
    .flat()
    .filter((file) => file?.path)
    .map((file) => {
      return fsPromises
        .unlink(file.path)
        .catch((err) =>
          console.error(`Erreur suppression ${file.path}:`, err.message)
        );
    });

  await Promise.all(cleanupPromises);
}

async function cleanupDirectory(directory) {
  try {
    const files = await fsPromises.readdir(directory);
    if (files.length === 0) {
      await fsPromises.rm(directory, { recursive: true });
    }
  } catch (err) {
    console.error("Erreur nettoyage dossier:", err.message);
  }
}

async function compressImage(inputPath, outputPath) {
  try {
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);

    await fsPromises.unlink(inputPath);
    return true;
  } catch (err) {
    console.error("Erreur compression image:", err.message);
    return false;
  }
}
const inscriptionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // autorise jusqu'à 5 inscriptions toutes les 15 min depuis une même IP
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.log(`IP bloquée : ${req.ip}`);
    res.status(429).json({
      error: "Trop de tentatives d'inscription. Réessayez plus tard.",
    });
  },
});

// Dossier temporaire pour les uploads
const TEMP_UPLOAD_DIR = path.join(__dirname, "../temp/uploads");

// Multer avec stockage temporaire uniquement
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        // Valider la filière
        const { field } = req.body;
        if (!field) {
          return cb(new Error('Le champ "field" est requis'));
        }

        const validFields = ["informatique", "btp", "gestion"];
        if (!validFields.includes(field)) {
          return cb(new Error("Filière invalide"));
        }

        // Créer un dossier temporaire unique pour cette requête
        if (!req.tempUploadId) {
          req.tempUploadId = `temp-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          req.tempUploadPath = path.join(TEMP_UPLOAD_DIR, req.tempUploadId);
          await fsPromises.mkdir(req.tempUploadPath, { recursive: true });
        }

        cb(null, req.tempUploadPath);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Seuls les fichiers PNG et JPEG sont autorisés."), false);
    }
  },
}).fields([
  { name: "identityPhoto", maxCount: 1 },
  { name: "bacTranscript", maxCount: 1 },
  { name: "idDocument", maxCount: 1 },
  { name: "residenceCertificate", maxCount: 1 },
]);

// Route principale
router.post("/", inscriptionLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Gestion de l'upload avec multer
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Vérification des fichiers requis
    if (
      !req.files ||
      !req.files.identityPhoto ||
      !req.files.idDocument ||
      !req.files.residenceCertificate
    ) {
      throw new Error("Fichiers requis manquants");
    }
    const existingUser = await UserQueries.GetUserByEmail(req.body.email);
    if (existingUser)
      return res
        .status(409)
        .json({
          error:
            "Certaines informations sont déjà utilisées. Veuillez vérifier le CIN, l’email, le numéro de téléphone ou la référence de transaction.",
        });

    // Compression des images
    const compressionPromises = Object.entries(req.files).map(
      async ([field, files]) => {
        for (const file of files) {
          const originalPath = file.path;
          const compressedPath = originalPath.replace(
            path.extname(originalPath),
            ".webp"
          );

          const success = await compressImage(originalPath, compressedPath);
          if (success) {
            file.path = compressedPath;
          }
        }
      }
    );

    await Promise.all(compressionPromises);

    // Préparation des données pour la base de données
    const filePaths = {
      residenceCertificate: path.relative(
        "private",
        req.files.residenceCertificate[0].path
      ),
      idDocument: path.relative("private", req.files.idDocument[0].path),
      identityPhoto: path.relative("private", req.files.identityPhoto[0].path),
      bacTranscript: req.files.bacTranscript
        ? path.relative("private", req.files.bacTranscript[0].path)
        : null,
    };

    console.log(req.body);

    if (req.body.website) {
      return res.status(400).json({ error: "Requête invalide." });
    }

    const studentData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      inscriptionId: req.inscriptionNumber,
      cin: encryptCIN(req.body.cin),
      ...filePaths,
    };

    await pendingStudentsQueries.create(studentData, session);
    //envoi d'email
    await SendMailForInscription(req.body.email, req.inscriptionNumber);

    // Enregistrement en base de données
    await session.commitTransaction();
    session.endSession();

    // Réponse réussie
    return res.status(200).json({
      success: true,
      inscriptionNumber: req.inscriptionNumber,
    });
  } catch (error) {
    // Nettoyage en cas d'erreur
    if (req.files) await cleanupFiles(req.files);
    if (req.uploadPath) await cleanupDirectory(req.uploadPath);
    if (req.inscriptionNumber && req.filiere) {
      await DecreaseInscriptionNumberSequence(req.filiere);
    }

    // Gestion des erreurs spécifiques
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Le fichier dépasse 3Mo." });
    }

    if (error.message.includes("Fichiers requis manquants")) {
      return res.status(400).json({ error: error.message });
    }

    if (error.errorResponse?.code === 11000) {
      const keyPattern = error.errorResponse.keyPattern;
      console.error("Conflit de clé unique détecté :", keyPattern);

      return res.status(409).json({
        error:
          "Certaines informations sont déjà utilisées. Veuillez vérifier le CIN, l’email, le numéro de téléphone ou la référence de transaction.",
      });
    }

    await session.abortTransaction();
    session.endSession();
    console.error("Erreur inscription :", error);

    return res.status(500).json({
      error: "Une erreur est survenue lors du traitement de votre candidature.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { pageQuery, perPageQuery, searchQuery, fieldsQuery, statusQuery } =
      req.query;
    const students = await pendingStudentsQueries.getStudent(
      pageQuery,
      Number(perPageQuery),
      searchQuery,
      fieldsQuery,
      statusQuery
    );
    res.status(200).json(students);
  } catch (error) {
    res
      .status(500)
      .send(
        "Une erreur s'est produite lors de la récupération des étudiants. Veuillez réessayer ultérieurement."
      );
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const students = await pendingStudentsQueries.getStudentById(
      req.params.userId
    );
    if (!students) {
      return res
        .status(404)
        .send(
          `L'étudiant avec le numéro d'inscription "${req.params.userId}" n'existe pas dans la base de données.`
        );
    }
    res.status(200).json(students);
  } catch (error) {
    res
      .status(500)
      .send("Une erreur s'est produite lors de la recuperation de l'etudiant");
  }
});

router.get("/export-data", async (req, res) => {
  try {
    // Récupération des données
    const data = (await pendingStudentsQueries.getStudent(1, 600))
      .pendingStudents;

    // Suppression des champs inutiles
    const newData = data.map(({ _id, status, ...rest }) => rest);

    // Regroupement par filière
    const btpStudents = newData.filter((s) => s.field === "btp");
    const gestionStudents = newData.filter((s) => s.field === "gestion");
    const infoStudents = newData.filter((s) => s.field === "informatique");

    const workbook = XLSX.utils.book_new();

    const btpSheet = XLSX.utils.json_to_sheet(btpStudents);
    XLSX.utils.book_append_sheet(workbook, btpSheet, "BTP");

    const gestionSheet = XLSX.utils.json_to_sheet(gestionStudents);
    XLSX.utils.book_append_sheet(workbook, gestionSheet, "Gestion");

    const infoSheet = XLSX.utils.json_to_sheet(infoStudents);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Informatique");

    // Génération du fichier Excel en mémoire
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const filename = `pre-inscription-${new Date().getFullYear()}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer).status(200);
  } catch (error) {
    console.error("Erreur lors de l'export :", error);
    res.sendStatus(500);
  }
});

router.patch("/:inscriptionId", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const body = req.body;
    const inscriptionId = req.params.inscriptionId;
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashToken(token);
    const update = {
      ...body,
      token: hashedToken,
    };
    const oldStudent =
      await pendingStudentsQueries.getStudentById(inscriptionId);
    const fee = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(
      oldStudent.levelAsked,
      oldStudent.field
    );
    if (!fee) {
      return res
        .status(500)
        .send(
          `Veuillez configurer les frais de scolarite pour ${oldStudent.field} ${oldStudent.levelAsked} `
        );
    }
    const candidateName = `${oldStudent.firstName} ${oldStudent.lastName}`;
    console.log(token);
    const studentUpdated =
      await pendingStudentsQueries.UpdatePendingStudentsById(
        inscriptionId,
        update,
        session
      );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Approbation de la préinscription du dossier ${studentUpdated.inscriptionId}`,
      details: `Le dossier a été validé : complet et paiement confirmé.`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    session.endSession();
    await SendMailForAdmission(
      oldStudent.email,
      candidateName,
      oldStudent.inscriptionId,
      oldStudent.field,
      token,
      fee.fees,
      fee.level,
      fee.echeances
    );
    res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    res.sendStatus(500);
  }
});

router.get("/export-data-approved", async (req, res) => {
  try {
    // Récupération des données
    const data = (
      await pendingStudentsQueries.getStudent(1, 600, "", "", "approved")
    ).pendingStudents;

    // Suppression des champs inutiles
    const newData = data.map(({ _id, status, ...rest }) => rest);

    // Regroupement par filière
    const btpStudents = newData.filter((s) => s.field === "btp");
    const gestionStudents = newData.filter((s) => s.field === "gestion");
    const infoStudents = newData.filter((s) => s.field === "informatique");

    const workbook = XLSX.utils.book_new();

    const btpSheet = XLSX.utils.json_to_sheet(btpStudents);
    XLSX.utils.book_append_sheet(workbook, btpSheet, "BTP");

    const gestionSheet = XLSX.utils.json_to_sheet(gestionStudents);
    XLSX.utils.book_append_sheet(workbook, gestionSheet, "Gestion");

    const infoSheet = XLSX.utils.json_to_sheet(infoStudents);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Informatique");

    // Génération du fichier Excel en mémoire
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const filename = `listes-des-admis-${new Date().getFullYear()}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(excelBuffer).status(200);
  } catch (error) {
    console.error("Erreur lors de l'export :", error);
    res.sendStatus(500);
  }
});

router.delete("/:inscriptionId/:field", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let report;
  try {
    const { field, inscriptionId } = req.params;
    const studentDeleted = await pendingStudentsQueries.DeleteStudent(
      inscriptionId,
      field,
      session
    );
    if (req.body && req.body.rejectionReason) {
      report = {
        authorId: req.session.matricule,
        authorName: req.session.fullName,
        action: `Rejet de la préinscription (ID : ${studentDeleted.inscriptionId})`,
        details: `La préinscription a été rejetée et supprimée pour le motif suivant : "${req.body.rejectionReason.reason}".`,
        role: req.session.role,
      };
    } else {
      report = {
        authorId: req.session.matricule,
        authorName: req.session.fullName,
        action: `Suppression de la liste des admis de l'étudiant ${studentDeleted.inscriptionId}`,
        details: `L'étudiant ${studentDeleted.lastName} ${studentDeleted.firstName}, inscrit sous le numero d'inscription ${studentDeleted.inscriptionId}, appartenant à la filière ${studentDeleted.field}, a été supprimé de la liste des admis.`,
        role: req.session.role,
      };
    }

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    session.endSession();

    res.sendStatus(200);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);

    res.sendStatus(500);
  }
});

router.post("/inscription-student/:cin/:email", async (req, res) => {
  try {
    const { cin, email } = req.params;
    const param = {
      cin,
      email,
    };
    await pendingStudentsQueries.getStudentByParam(param);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives depuis cette IP. Réessayez dans 15 minutes.",

  skipSuccessfulRequests: true,
});

router.get("/token/:token", loginLimiter, async (req, res) => {
  try {
    const DehashedToken = hashToken(req.params.token);
    const user = await pendingStudentsQueries.getStudentByToken(DehashedToken);

    if (!user || user.expiredToken) {
      if (!user || user.expiredToken) {
        return res
          .status(403)
          .send(
            "Échec de l'inscription : le lien d'accès est invalide, expiré ou non autorisé."
          );
      }
    }

    res.status(200).json(user);
  } catch (error) {
    res.sendStatus(500);
  }
});

const tempUploadDir = path.join(__dirname, "../temp");

const uploadProof = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdir(tempUploadDir, { recursive: true }, (err) => {
        if (err) return cb(err);
        cb(null, tempUploadDir);
      });
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `proof-${uniqueSuffix}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seuls les fichiers image sont autorisés."), false);
  },
}).single("proofFile");

async function fileExists(path) {
  try {
    await fsPromises.access(path);
    return true;
  } catch {
    return false;
  }
}

router.post("/confirmation/:inscriptionId", loginLimiter, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let tempFilePath = null;
  let finalFilePath = null;
  let finalDir = null;
  let compressedPath = null;
  let transactionCommitted = false;

  try {
    // 1. Upload fichier (optionnel)
    await new Promise((resolve, reject) => {
      uploadProof(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const exists = await TutionFeesQueries.GetTutionByRef(
      req.body.transactionRef
    );
    if (exists) {
      if (req.file) {
        await fsPromises.unlink(req.file.path);
      }
      return res
        .status(400)
        .send(
          "Ce numéro de transaction a déjà été utilisé pour une autre inscription. Veuillez vérifier les informations fournies."
        );
    }

    const matricule = await generateMatriculeNumber("ETU", session);

    const user = await UserQueries.CreateStudent(
      matricule,
      req.params.inscriptionId,
      req.body,
      session
    );

    // 2. Gérer le fichier s’il existe
    if (req.file) {
      tempFilePath = req.file.path;

      finalDir = createFileDirectoryUserProof(matricule);
      await fsPromises.mkdir(finalDir, { recursive: true });

      finalFilePath = path.join(finalDir, path.basename(tempFilePath));
      await fsPromises.rename(tempFilePath, finalFilePath);

      compressedPath = finalFilePath.replace(
        path.extname(finalFilePath),
        ".webp"
      );
      await compressImage(finalFilePath, compressedPath);
    }

    // 3. Création des frais de scolarité
    const tution = await TutionFeesQueries.CreateFeesWithSession(
      user._id,
      req.body,
      session
    );

    const updateTution = {
      method: req.body.method,
      proofFile: compressedPath
        ? path.relative("private", compressedPath)
        : null,
      transactionRef: req.body.transactionRef,
      paymentDate: new Date(),
    };

    await TutionFeesQueries.updateInstallmentByLabel(
      tution._id,
      req.body.label,
      updateTution,
      session
    );

    await pendingStudentsQueries.UpdatePendingStudentsById(
      req.params.inscriptionId,
      { expiredToken: true }
    );

    // await SendMailForSuccessAdmission(user.email, matricule, user.password);

    await session.commitTransaction();
    transactionCommitted = true;
    session.endSession();

    res.status(200).json({ matricule, password: user.password });
  } catch (error) {
    if (!transactionCommitted) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "Erreur lors de l'annulation de la transaction :",
          abortError.message
        );
      }
    }
    session.endSession();

    // Nettoyage des fichiers
    try {
      if (tempFilePath && (await fileExists(tempFilePath))) {
        console.log("deleted");

        await fsPromises.unlink(tempFilePath);
      }
      if (finalFilePath && (await fileExists(finalFilePath))) {
        await fsPromises.unlink(finalFilePath);
      }
      if (compressedPath && (await fileExists(compressedPath))) {
        await fsPromises.unlink(compressedPath);
      }
    } catch (e) {
      console.error("Erreur lors de la suppression du fichier :", e.message);
    }

    console.error("Erreur principale :", error);
    res
      .status(500)
      .send(
        "Une erreur est survenue. Merci de réessayer plus tard ou de contacter le service de la scolarité si le problème persiste."
      );
  }
});

module.exports = router;
