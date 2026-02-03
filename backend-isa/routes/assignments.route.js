const assignmentQueries = require("../queries/assignment.queries");
const AssignmentQueries = require("../queries/assignment.queries");
const ModuleQueries = require("../queries/Module.queries");
const promotionQueries = require("../queries/promotion.queries");
const submissionQueries = require("../queries/submission.queries");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fsPromises = require("fs").promises;
const { isRestrictedPromotionMiddleware, isProfessorMiddleware, isRestrictedMiddleware, isStudentMiddleware } = require("../middleware/middleware.global");
const router = require("express").Router();

router.get(
  "/module/:moduleId/professor/:professorId/promotion/:promotionId",
  isProfessorMiddleware,
  async (req, res) => {
    try {
      const { moduleId, professorId, promotionId } = req.params;

      if (promotionId === "null") {
        const module =
          await ModuleQueries.getModuleByIdWiTeachingUnit(moduleId);
        if (!module) {
          return res.status(400).send("Module invalide");
        }
        const promotion =
          await promotionQueries.GetActivePromotionsForCurrentYear(
            module.teachingUnit.field,
            module.teachingUnit.level
          );
        if (!promotion) {
          return res
            .status(404)
            .send(
              "Aucune promotion active trouvée pour l'année en cours. veuillez contacter l'administrateur."
            );
        }

        const { numberOfStudentPromotion, result } =
          await AssignmentQueries.getAssignmentByCriteria(
            moduleId,
            promotion._id,
            professorId
          );

        return res
          .status(200)
          .json({
            assignments: result,
            numberOfStudents: numberOfStudentPromotion,
          });
      }

      if (professorId === "null") {
        const { numberOfStudentPromotion, result } =
          await AssignmentQueries.getAssignmentByCriteria(
            moduleId,
            promotionId
          );
        return res
          .status(200)
          .json({
            assignments: result,
            numberOfStudents: numberOfStudentPromotion,
          });
      }
      const { numberOfStudentPromotion, result } =
        await AssignmentQueries.getAssignmentByCriteria(
          moduleId,
          promotionId,
          professorId
        );

      return res
        .status(200)
        .json({
          assignments: result,
          numberOfStudents: numberOfStudentPromotion,
        });
    } catch (error) {
      console.log(error);

      res.status(500).send("Erreur serveur");
    }
  }
);

router.get(
  "/module/:moduleId/student/promotion/:promotionId",
  isStudentMiddleware,
  isRestrictedPromotionMiddleware,
  async (req, res) => {
    try {
      const { moduleId, promotionId } = req.params;

      if (promotionId === "null") {
        const module =
          await ModuleQueries.getModuleByIdWiTeachingUnit(moduleId);
        if (!module) {
          return res.status(400).send("Module invalide");
        }
        const promotion =
          await promotionQueries.GetActivePromotionsForCurrentYear(
            module.teachingUnit.field,
            module.teachingUnit.level
          );
        if (!promotion) {
          return res
            .status(404)
            .send(
              "Aucune promotion active trouvée pour l'année en cours. veuillez contacter l'administrateur."
            );
        }

        const assignments =
          await AssignmentQueries.getAllAssignmentWithSubmissionsForPromotion(
            moduleId,
            req.session._id,
            promotion._id
          );
        return res.status(200).json(assignments);
      }

      const assignments =
        await AssignmentQueries.getAllAssignmentWithSubmissionsForPromotion(
          moduleId,
          req.session._id,
          promotionId
        );

      return res.status(200).json(assignments);
    } catch (error) {
      console.log(error);

      res.status(500).send("Erreur serveur");
    }
  }
);

router.post("/", isProfessorMiddleware, async (req, res) => {
  try {
    const data = req.body;
    data.professor = req.session._id;
    const module = await ModuleQueries.getModuleByIdWiTeachingUnit(data.module);

    if (module.teacher != req.session._id) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à créer un devoir pour ce module");
    }

    if (!module) {
      return res.status(400).send("Module invalide");
    }
    const promotion = await promotionQueries.GetActivePromotionsForCurrentYear(
      module.teachingUnit.field,
      module.teachingUnit.level
    );
    if (!promotion) {
      return res
        .status(404)
        .send(
          "Aucune promotion active trouvée pour l'année en cours. veuillez contacter l'administrateur."
        );
    }

    if (data.dueDate) {
      const dueDate = DateTime.fromJSDate(new Date(data.dueDate)).setZone(
        "Africa/Nairobi"
      );
      const now = DateTime.now().setZone("Africa/Nairobi");
      if (dueDate < now) {
        return res
          .status(400)
          .send("La date du devoir ne peut pas être dans le passé");
      }
    }

    // Validation spécifique pour les examens : maximum 2 (normal + rattrapage)
    if (data.type === "exam" && data.session) {
      const existingExams = await AssignmentQueries.model
        .find({
          module: data.module,
          promotion: promotion._id,
          type: "exam",
          isActive: true, // Seulement les examens actifs (non annulés)
        })
        .lean();

      // Vérifier si un examen avec cette session existe déjà
      const sessionExists = existingExams.some(
        (exam) => exam.session === data.session
      );
      if (sessionExists) {
        return res
          .status(400)
          .send(
            `Un examen de session "${data.session}" existe déjà pour ce module. Vous devez l'annuler avant d'en créer un nouveau.`
          );
      }

      // Vérifier qu'on ne dépasse pas 2 examens actifs
      if (existingExams.length >= 2) {
        return res
          .status(400)
          .send(
            "Vous ne pouvez pas créer plus de 2 examens actifs (normal + rattrapage) pour ce module. Annulez un examen existant si nécessaire."
          );
      }
    }

    data.promotion = promotion._id;
    const assignment = await AssignmentQueries.createAssignment(data);
    const result = { ...assignment.toObject(), numberOfSubmissions: 0 };
    return res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur serveur");
  }
});

const { DateTime } = require("luxon");
const StudentQueries = require("../queries/Student.queries");


router.patch("/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const resource = await AssignmentQueries.getAssignmentById(id);

    if (!resource) {
      return res.status(404).send("Devoir non trouvé");
    }

    if (resource.professor.toString() !== req.session._id.toString()) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier ce devoir");
    }

    // Cas particulier : examen
    if (resource.type === "exam") {
      // On récupère la date actuelle à Antananarivo
      const now = DateTime.now().setZone("Africa/Nairobi"); // Antananarivo = UTC+3

      // On convertit la dueDate stockée (UTC en DB) vers le fuseau Antananarivo
      const examDueDate = DateTime.fromJSDate(resource.dueDate).setZone(
        "Africa/Nairobi"
      );

      // Vérifier si l'examen est déjà passé
      if (now > examDueDate) {
        return res
          .status(400)
          .send("Vous ne pouvez pas modifier un examen déjà passé");
      }

      // Autoriser uniquement certaines modifs (ex: title et dueDate)
      const allowedFields = [
        "title",
        "dueDate",
        "description",
        "isActive",
        "submissionLocation",
        "session",
      ];
      const safeData = {};
      for (const field of allowedFields) {
        if (data[field] !== undefined) {
          safeData[field] = data[field];
        }
      }

      // Bloquer si aucune modif autorisée
      if (Object.keys(safeData).length === 0) {
        return res
          .status(400)
          .send(
            "Seul le titre ou la date peuvent être modifiés avant l'examen"
          );
      }

      // Validation si on change la session
      if (safeData.session && safeData.session !== resource.session) {
        const existingExams = await AssignmentQueries.model
          .find({
            _id: { $ne: id }, // Exclure l'examen actuel
            module: resource.module,
            promotion: resource.promotion,
            type: "exam",
            session: safeData.session,
            isActive: true,
          })
          .lean();

        if (existingExams.length > 0) {
          return res
            .status(400)
            .send(
              `Un examen de session "${safeData.session}" existe déjà pour ce module. Impossible de changer la session.`
            );
        }
      }

      const updatedResource = await AssignmentQueries.updateAssignment(
        id,
        safeData
      );
      return res.json(updatedResource);
    }

    // Cas normal : devoir ou projet
    if (data.dueDate) {
      const dueDate = DateTime.fromJSDate(new Date(data.dueDate)).setZone(
        "Africa/Nairobi"
      );
      const now = DateTime.now().setZone("Africa/Nairobi");

      if (dueDate < now) {
        return res
          .status(400)
          .send("La nouvelle date du devoir ne peut pas être dans le passé");
      }
    }

    const updatedResource = await AssignmentQueries.updateAssignment(id, data);
    res.json(updatedResource);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

router.patch("/active/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await AssignmentQueries.getAssignmentById(id);

    if (!resource) {
      return res.status(404).send("Devoir non trouvé");
    }

    if (resource.professor.toString() !== req.session._id.toString()) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier ce devoir");
    }

    // Vérifier si le devoir est déjà actif
    if (resource.isActive) {
      return res.status(400).send("Le devoir est déjà actif");
    }

    // Activer le devoir
    await AssignmentQueries.updateAssignment(id, { isActive: true });
    return res.status(200).send("Devoir activé avec succès");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

router.patch("/cancel-exam/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await AssignmentQueries.getAssignmentById(id);

    if (!resource) {
      return res.status(404).send("Devoir non trouvé");
    }

    if (resource.professor.toString() !== req.session._id.toString()) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier ce devoir");
    }

    // Vérifier si le devoir est un examen
    if (resource.type !== "exam") {
      return res.status(400).send("Ce devoir n'est pas un examen");
    }

    // Annuler l'examen
    await AssignmentQueries.updateAssignment(id, { isActive: false });
    return res.status(200).send("Examen annulé avec succès");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

router.delete("/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await AssignmentQueries.getAssignmentById(id);
    if (!resource) {
      return res.status(404).send("devoir non trouvé");
    }
    if (resource.professor != req.session._id) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer ce devoir");
    }

    if (resource.type === "exam") {
      return res
        .status(400)
        .send(
          "Vous ne pouvez pas supprimer un examen, vous pouvez seulement l'annuler."
        );
    }

    const submission =
      await submissionQueries.getFirstSubmissionByAssignment(id);
    if (submission) {
      return res
        .status(400)
        .send(
          "Vous ne pouvez pas supprimer ce devoir car des rendus y sont associés"
        );
    }

    await AssignmentQueries.deleteAssignment(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

router.patch("/lock-grade/:assignmentId/:promotionId", isProfessorMiddleware, async (req, res) => {
  try {
    const { assignmentId, promotionId } = req.params;
    const resource = await AssignmentQueries.getAssignmentById(assignmentId);

    if (!resource) {
      return res.status(404).send("Devoir non trouvé");
    }

    if (resource.professor.toString() !== req.session._id.toString()) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier ce devoir");
    }

    // Vérifier si le devoir est déjà verrouillé
    if (resource.lockedGrade) {
      return res.status(400).send("Le devoir est déjà verrouillé");
    }

    // Verrouiller le devoir
    await AssignmentQueries.updateAssignment(assignmentId, {
      lockedGrade: true,
    });
    return res.status(200).send("Devoir verrouillé avec succès");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

///////////////* PARTIES ETUDIANT *///////////////

router.get("/student/:assignmentId", isStudentMiddleware, isRestrictedMiddleware, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.session._id;
    if (!studentId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à accéder à ce devoir");
    }
    const result =
      await assignmentQueries.getAssignmentWithSubmissionForStudent(
        assignmentId,
        studentId
      );

    if (result.isActive === false) {
      return res
        .status(403)
        .send("Ce devoir/examen a été annulé par le professeur");
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/student/download/:assignmentId", isRestrictedMiddleware, async (req, res) => {
  let browser = null;
  try {
    const { assignmentId } = req.params;
    const studentId = req.session._id;

    if (!studentId) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à accéder à ce devoir");
    }

    // Charger le logo une seule fois en parallèle avec la requête DB
    const [assignment, logoBuffer] = await Promise.all([
      assignmentQueries.getAssignmentByIdWithModule(assignmentId),
      fsPromises
        .readFile(path.join(__dirname, "..", "public", "logo300x300.png"))
        .catch((err) => {
          console.error("Erreur lors du chargement du logo:", err);
          return null;
        }),
    ]);

    if (!assignment) {
      return res.status(404).send("Devoir non trouvé");
    }

    // Convertir en objet simple pour EJS
    const assignmentObject = assignment.toObject();

    // Convertir le logo en base64 si disponible
    const logoUrl = logoBuffer
      ? `data:image/png;base64,${logoBuffer.toString("base64")}`
      : null;

    // Charger le template EJS
    const templatePath = path.join(__dirname, "../views/AssignmentPDF.ejs");
    const html = await ejs.renderFile(templatePath, {
      assignment: assignmentObject,
      logoUrl: logoUrl,
    });

    // Configuration Puppeteer optimisée
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--disable-software-rasterizer",
      ],
    });

    const page = await browser.newPage();

    // Optimisations de performance
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Bloquer les ressources inutiles pour accélérer le rendu
      if (["font", "stylesheet"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Charger le HTML avec timeout réduit
    await page.setContent(html, {
      waitUntil: "domcontentloaded", // Plus rapide que networkidle2
      timeout: 20000,
    });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "15mm",
        bottom: "20mm",
        left: "15mm",
      },
      preferCSSPageSize: false,
    });

    await browser.close();
    browser = null;

    // Créer un nom de fichier sécurisé avec code du module
    const moduleCode = assignmentObject.module?.code || "";
    const moduleName = assignmentObject.module?.name || "";
    const safeTitle = (assignmentObject.title || "devoir")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase()
      .substring(0, 40);

    const filename = moduleCode
      ? `${moduleCode}-${safeTitle}.pdf`
      : `devoir-${safeTitle}.pdf`;

    // Envoyer le PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF du devoir:", error);

    // Fermer le browser en cas d'erreur
    if (browser) {
      await browser
        .close()
        .catch((err) => console.error("Erreur fermeture browser:", err));
    }

    if (!res.headersSent) {
      res
        .status(500)
        .send("Une erreur est survenue lors de la génération du PDF.");
    }
  }
});



module.exports = router;
