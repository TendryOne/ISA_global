const router = require("express").Router();
const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { isRestrictedMiddleware, isConnectedMiddleware, isStudentMiddleware } = require("../middleware/middleware.global");
const administrativeRequestsQueries = require("../queries/administrative-requests.queries");
const AdministrativeRequestsQueries = require("../queries/administrative-requests.queries");

router.post("/", isStudentMiddleware, isRestrictedMiddleware, async (req, res) => {
  try {
    const requestData = req.body;
    const student = req.session._id;
    requestData.student = student;
    requestData.matricule = req.session.matricule;
    const existingRequest =
      await AdministrativeRequestsQueries.checkStudentPendingAndInProgressRequest(
        requestData.student,
        requestData.promotion,
        requestData.requestType
      );

    if (existingRequest) {
      return res
        .status(400)
        .send(
          "Une demande similaire est déjà en cours de traitement. Veuillez attendre sa résolution avant d'en créer une nouvelle."
        );
    }

    const newRequest =
      await AdministrativeRequestsQueries.CreateAdministrativeRequest(
        requestData
      );
    res.status(201).json(newRequest);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send("Erreur serveur lors de la création de la demande administrative.");
  }
});

router.get("/", isAdminAndSuperAdmin, async (req, res) => {
  const { page, perPage, status, search, requestType } = req.query;
  try {
    const requests =
      await AdministrativeRequestsQueries.getAdministrativeRequestsByCriteria(
        page,
        perPage,
        status,
        search,
        requestType
      );
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "Erreur serveur lors de la récupération des demandes administratives."
      );
  }
});

router.get("/student/:id", isConnectedMiddleware, async (req, res) => {
  try {
    const studentId = req.params.id;
    const request =
      await administrativeRequestsQueries.getAdministrativeRequestByStudentId(
        studentId
      );
    if (request.length === 0) {
      return res.status(200).json(request);
    }

    if (
      req.session._id.toString() !== request[0].student.toString() &&
      req.session.role !== "admin" &&
      req.session.role !== "superAdmin"
    ) {
      return res
        .status(403)
        .send("Accès refusé à cette demande administrative.");
    }

    res.status(200).json(request);
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .send(
        "Erreur serveur lors de la récupération de la demande administrative."
      );
  }
});

router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const requestId = req.params.id;
    const updateData = req.body;
    updateData.handledBy = req.session._id;

    const request =
      await administrativeRequestsQueries.getAdministrativeRequestById(
        requestId
      );
    if (!request) {
      return res.status(404).send("Demande administrative non trouvée.");
    }

    if (
      (request.status === "delivered" || request.status === "recoverable") &&
      updateData.status === "cancelled"
    ) {
      return res
        .status(400)
        .send("Impossible d'annuler une demande déjà livrée ou récupérable.");
    }

    if (updateData.status === "delivered") {
      updateData.recoveryDate = new Date();
    }

    const updatedRequest =
      await administrativeRequestsQueries.patchAdministrativeRequest(
        requestId,
        updateData
      );
    res.status(200).json(updatedRequest);
  } catch (error) {
    res
      .status(500)
      .send(
        "Erreur serveur lors de la mise à jour de la demande administrative."
      );
  }
});

module.exports = router;
