const { isSuperAdmin } = require("../middleware/AdminVerification");
const { isConnectedMiddleware } = require("../middleware/middleware.global");
const bugReportsQueries = require("../queries/bugReports.queries");
const router = require("express").Router();
const rateLimit = require("express-rate-limit");

const bugReportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message: "Vous avez atteint la limite de rapports de signalement. Veuillez réessayer dans 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
  // Utiliser le matricule de session comme clé pour identifier l'utilisateur
  keyGenerator: (req) => {
    return req.session?.matricule || req.ip;
  },
});

router.get("/all", isSuperAdmin, async (req, res) => {
  try {
    const reports = await bugReportsQueries.getAllbugReports(
      req.query.page,
      req.query.perPage,
      req.query.priority,
      req.query.isResolved,
      req.query.reporterMatricule,
      req.query.type
    );
    res.status(200).json(reports);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des rapports de bugs:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur lors de la récupération des rapports de bugs",
    });
  }
});



router.post("/", isConnectedMiddleware, bugReportLimiter, async (req, res) => {
  try {
    const { title, description, priority, type } = req.body;
    if (!title || !description || !priority || !type) {
      return res.status(400).send("Champs requis manquants");
    }
    const newReport = await bugReportsQueries.createBugReport({
      title,
      description,
      type,
      priority,
      reporterMatricule: req.session.matricule,
      reporter: req.session._id,
    });
    res.status(201).json(newReport);
  } catch (error) {
    console.error("Erreur lors de la création du rapport de bug:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la création du rapport de bug",
    });
  }
});

router.get("/report/:id", isSuperAdmin, async (req, res) => {
  try {
    const reportId = req.params.id;
    const report = await bugReportsQueries.getReportById(reportId);
    if (!report) {
      return res.status(404).send("Rapport de bug non trouvé");
    }
    res.status(200).json(report);
  } catch (error) {
    console.error("Erreur lors de la récupération du rapport de bug:", error);
    res.status(500).json({
      message: "Erreur serveur lors de la récupération du rapport de bug",
    });
  }
});

router.patch("/:id", isSuperAdmin, async (req, res) => {
  try {
    const reportId = req.params.id;
    const { isResolved } = req.body;

    const updatedReport = await bugReportsQueries.updateBugReport(reportId, {
      isResolved,
    });
    if (!updatedReport) {
      return res.status(404).send("Rapport de bug non trouvé");
    }
    res.status(200).send("Statut du rapport de bug mis à jour avec succès");
  } catch (error) {
    return res
      .status(500)
      .send(
        "Erreur serveur lors de la mise à jour du statut du rapport de bug"
      );
  }
});

module.exports = router;
