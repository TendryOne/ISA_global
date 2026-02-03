const router = require("express").Router();
const { isAdminAndSuperAdmin, } = require("../middleware/AdminVerification");
const { isStudentMiddleware, isConnectedMiddleware } = require("../middleware/middleware.global");
const DashboardQueries = require("../queries/dashboard.queries");
const promotionQueries = require("../queries/promotion.queries");
const UserQueries = require("../queries/UserQueries");

router.get("/admin", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const role = req.session.role
    const dashboardData = await DashboardQueries.getAdminDashboardData(role);
    res.status(200).json(dashboardData);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/student", isConnectedMiddleware, async (req, res) => {
  try {
    if (req.session.role !== "student") {
      return res.status(403).send("Accès réservé aux étudiants.");
    }
    const user = await UserQueries.GetUserByMatricule(req.session.matricule);
    const dashboardData = await DashboardQueries.getStudentDashboardData(user);
    res.status(200).json(dashboardData);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/professor", isConnectedMiddleware, async (req, res) => {
  try {
    if (req.session.role !== "professor") {
      return res.status(403).send("Accès réservé aux professeurs.");
    }
    const user = await UserQueries.GetUserByMatricule(req.session.matricule);
    const promotions =
      await promotionQueries.GetAllActivePromotionsIdForCurrentYear();
    const promotionIds = promotions.map((p) => p._id);

    const dashboardData = await DashboardQueries.getProfessorDashboardData(
      user,
      promotionIds
    );
    res.status(200).json(dashboardData);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
