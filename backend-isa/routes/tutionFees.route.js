const mongoose = require("mongoose");
const TutionFeesQueries = require("../queries/TutionFees.queries");
const ReportQueries = require("../queries/Report.queries");
const StudentQueries = require("../queries/Student.queries");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const fsPromises = require("fs").promises;
const { createFileDirectoryUserProof } = require("../function");

const router = require("express").Router();
const multer = require("multer");
const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { isStudentMiddleware } = require("../middleware/middleware.global");



router.get("/user/:userId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const tutionFee = await TutionFeesQueries.GetTutionFeesByUserId(userId);

    res.status(200).json(tutionFee);
  } catch (error) {
    res.sendStatus(500);
  }
});

router.get("/promotion/:promotionId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const promotionId = req.params.promotionId;
    const tutionFees =
      await TutionFeesQueries.getTutionFeesByPromotion(promotionId);

    res.status(200).json(tutionFees);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/student/promotion/:promotionId", isStudentMiddleware, async (req, res) => {
  try {
    const promotionId = req.params.promotionId;
    const studentId = req.session._id;

    const tutionFees =
      await TutionFeesQueries.getTutionFeesByStudentAndPromotion(
        studentId,
        promotionId
      );

    res.status(200).json(tutionFees);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Route pour que l'admin puisse verifier une tranche de paiement

router.patch("/:tutionFeesId/installments", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tutionFeesId } = req.params;
    let result = null;
    let updateData;
    let report;

    if (req.body.verified === true) {
      updateData = {
        verified: true,
        verifiedBy: req.session._id,
      };
      result = await TutionFeesQueries.updateInstallmentByLabel(
        tutionFeesId,
        req.body.label,
        updateData,
        session
      );

      report = {
        authorId: req.session.matricule,
        authorName: req.session.fullName,
        action: `Validation du paiement de la ${req.body.label} des frais de scolarité`,
        details: `La ${req.body.label} des frais de scolarité de l'étudiant matricule ${result.user.matricule} a été validée.`,
        role: req.session.role,
      };

      if (result.user.isRestricted) {
        await StudentQueries.UpdateStudentById(
          result.user._id,
          { isRestricted: false },
          session
        );
      }
    } else {
      updateData = {
        verified: false,
        verifiedBy: null,
        paymentDate: null,
        proofFile: null,
        transactionRef: null,
        method: null,
      };

      result = await TutionFeesQueries.updateInstallmentByLabel(
        tutionFeesId,
        req.body.label,
        updateData,
        session
      );
      report = {
        authorId: req.session.matricule,
        authorName: req.session.fullName,
        action: `Annulation de la validation du paiement de la ${req.body.label} des frais de scolarité`,
        details: `La validation de la ${req.body.label} des frais de scolarité de l'étudiant matricule ${result.user.matricule} a été annulée.`,
        role: req.session.role,
      };
    }

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    res.status(200).json(result);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);

    res.sendStatus(500);
  } finally {
    session.endSession();
  }
});

// Configuration multer pour le stockage temporaire sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(__dirname, "..", "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "temp-proof-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Seules les images (jpeg, jpg, png, webp) sont autorisées"));
    }
  },
});

// Fonction de compression d'image
async function compressImage(inputPath, outputPath) {
  await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
}

router.patch(
  "/student/payment/:tutionFeesId/:installmentLabel", isStudentMiddleware,
  upload.single("proofFile"),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    let tempFilePath = null;
    let finalFilePath = null;
    let compressedPath = null;

    try {
      const { tutionFeesId, installmentLabel } = req.params;
      const { method, transactionRef } = req.body;
      const studentId = req.session._id;




      // Vérifier que les frais existent
      const tutionFees =
        await TutionFeesQueries.getTutionFeesById(tutionFeesId);
      if (!tutionFees) {
        return res.status(404).send("Frais de scolarité introuvables");
      }

      // Vérifier que l'étudiant est propriétaire
      if (tutionFees.user.toString() !== studentId.toString()) {
        return res
          .status(403)
          .send("Vous n'êtes pas autorisé à payer ces frais");
      }

      // Récupérer le matricule de l'étudiant
      const student = await StudentQueries.GetStudentById(studentId);
      if (!student) {
        return res.status(404).send("Étudiant introuvable");
      }

      // Vérifier que la tranche existe
      const installment = tutionFees.installments.find(
        (inst) => inst.label === installmentLabel
      );
      if (!installment) {
        return res
          .status(404)
          .send(`La tranche "${installmentLabel}" n'existe pas`);
      }

      if (installment.proofFile || installment.transactionRef) {
        return res
          .status(400)
          .send(
            "Un paiement pour cette tranche a déjà été soumis et est en attente de vérification"
          );
      }

      const hasAlreadyUsed =
        await TutionFeesQueries.hasAlreadyUsedTransactionRef(transactionRef);

      console.log("hasAlreadyUsed:", hasAlreadyUsed);

      if (hasAlreadyUsed && method === "mobileMoney") {
        return res
          .status(400)
          .send(
            "La référence de transaction a déjà été utilisée pour un autre paiement"
          );
      }

      // Vérifier que la tranche n'est pas déjà payée/vérifiée
      if (installment.verified) {
        return res
          .status(400)
          .send("Cette tranche a déjà été vérifiée et payée");
      }

      // Validation selon la méthode de paiement
      if (!method || !["bank", "mobileMoney"].includes(method)) {
        return res
          .status(400)
          .send("La méthode de paiement doit être 'bank' ou 'mobileMoney'");
      }

      // Si bank → proofFile obligatoire
      if (method === "bank" && !req.file) {
        return res
          .status(400)
          .send(
            "Une preuve de paiement (image) est obligatoire pour le paiement bancaire"
          );
      }

      // Si mobileMoney → transactionRef obligatoire
      if (method === "mobileMoney" && !transactionRef) {
        return res
          .status(400)
          .send(
            "La référence de transaction est obligatoire pour le paiement Mobile Money"
          );
      }

      // Traiter l'image si c'est un paiement bancaire
      if (method === "bank" && req.file) {
        console.log("📸 Traitement de l'image pour paiement bancaire");
        console.log("req.file:", req.file);

        tempFilePath = req.file.path;
        console.log("tempFilePath:", tempFilePath);

        // Créer le répertoire final dans private/user/matricule/proof
        const finalDir = createFileDirectoryUserProof(student.matricule);
        console.log("finalDir:", finalDir);

        await fsPromises.mkdir(finalDir, { recursive: true });

        // Déplacer le fichier temporaire vers le répertoire final
        finalFilePath = path.join(finalDir, path.basename(tempFilePath));
        console.log("finalFilePath:", finalFilePath);

        await fsPromises.rename(tempFilePath, finalFilePath);

        // Compresser l'image en webp
        compressedPath = finalFilePath.replace(
          path.extname(finalFilePath),
          ".webp"
        );
        console.log("compressedPath:", compressedPath);

        await compressImage(finalFilePath, compressedPath);

        // Supprimer l'original après compression
        await fsPromises.unlink(finalFilePath);

        console.log("✅ Image traitée avec succès");
      } else {
        console.log(
          "⚠️ Pas d'image à traiter - method:",
          method,
          "- req.file:",
          !!req.file
        );
      }

      // Préparer les données de mise à jour
      const privateDir = path.join(__dirname, "..", "private");
      console.log("privateDir:", privateDir);
      console.log("compressedPath avant calcul relatif:", compressedPath);

      const updateData = {
        paymentDate: new Date(),
        method: method,
        transactionRef: transactionRef || null,
        proofFile: compressedPath
          ? path.relative(privateDir, compressedPath)
          : null,
        verified: false, // En attente de vérification
      };

      console.log("📝 updateData.proofFile:", updateData.proofFile);
      console.log(
        "📝 updateData complet:",
        JSON.stringify(updateData, null, 2)
      );

      // Mettre à jour la tranche
      console.log(installmentLabel);

      const updatedTutionFees =
        await TutionFeesQueries.updateInstallmentByLabel(
          tutionFeesId,
          installmentLabel,
          updateData,
          session
        );

      // Créer un rapport d'activité
      const report = {
        authorId: req.session.matricule,
        authorName: req.session.fullName,
        action: `Soumission de paiement - ${installmentLabel}`,
        details: `Paiement de la ${installmentLabel} soumis par l'étudiant ${req.session.matricule} via ${method === "bank" ? "banque" : "Mobile Money"}${transactionRef ? ` (Ref: ${transactionRef})` : ""}. En attente de vérification.`,
        role: req.session.role,
      };

      await ReportQueries.CreateReport(report, session);

      await session.commitTransaction();
      res.status(200).json(updatedTutionFees);
    } catch (error) {
      await session.abortTransaction();
      console.error("Erreur lors du paiement:", error);

      // Nettoyer les fichiers en cas d'erreur
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          await fsPromises.unlink(tempFilePath);
        }
        if (finalFilePath && fs.existsSync(finalFilePath)) {
          await fsPromises.unlink(finalFilePath);
        }
        if (compressedPath && fs.existsSync(compressedPath)) {
          await fsPromises.unlink(compressedPath);
        }
      } catch (cleanupError) {
        console.error("Erreur lors du nettoyage des fichiers:", cleanupError);
      }

      if (error.message && error.message.includes("images")) {
        return res.status(400).send(error.message);
      }

      res.status(500).send("Erreur lors de la soumission du paiement");
    } finally {
      session.endSession();
    }
  }
);

module.exports = router;
