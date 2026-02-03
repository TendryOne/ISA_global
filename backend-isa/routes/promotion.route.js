const express = require("express");
const PromotionQueries = require("../queries/promotion.queries");
const mongoose = require("mongoose");
const router = express.Router();
const ReportQueries = require("../queries/Report.queries");
const StudentQueries = require("../queries/Student.queries");
const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { isConnectedMiddleware } = require("../middleware/middleware.global");

router.get("/", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { level, field } = req.query;
    const promotions = await PromotionQueries.GetPromotionByLevelAndField(
      level,
      field
    );
    res.status(200).json(promotions);
  } catch (error) {
    res.sendStatus(500);
  }
});
router.post("/", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const promotionsExists = await PromotionQueries.GetPromotionsByName(
      req.body.name
    );
    if (promotionsExists) {
      return res.status(409).send(`La promotion ${req.body.name} existe déjà.`);
    }

    if (req.body.startYear >= req.body.endYear) {
      return res
        .status(400)
        .send("L'année de début doit être inférieure à l'année de fin.");
    }

    if (!["L1", "L2", "L3"].includes(req.body.level)) {
      return res.status(400).send("Niveau de promotion invalide.");
    }

    if (!["informatique", "gestion", "btp"].includes(req.body.field)) {
      return res.status(400).send("Filière de promotion invalide.");
    }

    const createdPromotion = await PromotionQueries.CreatePromotion(
      req.body,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Création de la promotion ${createdPromotion.name}`,
      details: `La promotion ${createdPromotion.name}, de niveau ${createdPromotion.level} et filière ${createdPromotion.field}, a été créée.`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(createdPromotion);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Erreur lors de la création de la promotion");
  }
});

router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (req.body.name) {
      const promotionExists = await PromotionQueries.GetPromotionsByName(
        req.body.name
      );
      if (promotionExists && promotionExists._id.toString() !== req.params.id) {
        return res
          .status(409)
          .send(`La promotion ${req.body.name} existe déjà.`);
      }
    }

    if (req.body.isActive === undefined) {
      if (req.body.startYear >= req.body.endYear) {
        return res
          .status(400)
          .send("L'année de début doit être inférieure à l'année de fin.");
      }

      if (!["L1", "L2", "L3"].includes(req.body.level)) {
        return res.status(400).send("Niveau de promotion invalide.");
      }

      if (!["informatique", "gestion", "btp"].includes(req.body.field)) {
        return res.status(400).send("Filière de promotion invalide.");
      }
    }

    if (req.body.isActive === true) {

      const activePromotions = await PromotionQueries.getPromotionActive(req.body.field, req.body.level);
      if (activePromotions !== null) {
        return res.status(400).send(`Il y a déjà une promotion active pour ${req.body.level} - ${req.body.field}. Veuillez désactiver la promotion active avant d'en activer une nouvelle.`);
      }
    }


    const updatedPromotion = await PromotionQueries.UpdatePromotionById(
      req.params.id,
      req.body,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Mise à jour de la promotion ${updatedPromotion.name}`,
      details: `La promotion ${updatedPromotion.name}, de niveau ${updatedPromotion.level} et filière ${updatedPromotion.field}, a été mise à jour.`,
      role: req.session.role,
    };



    await ReportQueries.CreateReport(report, session);
    await session.commitTransaction();
    session.endSession();
    res.status(200).json(updatedPromotion);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Erreur lors de la mise à jour de la promotion");
  }
});

router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const promotionExists = await PromotionQueries.GetPromotionById(
      req.params.id
    );
    if (!promotionExists) {
      return res
        .status(404)
        .send(
          `La promotion que vous voulez supprimer n'existe plus ou a déjà été supprimée.`
        );
    }

    const deletedPromotion = await PromotionQueries.deletePromotion(
      req.params.id,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Suppression de la promotion ${deletedPromotion.name}`,
      details: `La promotion ${deletedPromotion.name}, de niveau ${deletedPromotion.level} et filière ${deletedPromotion.field}, a été supprimée.`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);
    await session.commitTransaction();
    session.endSession();
    res.sendStatus(204);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).send("Erreur lors de la suppression de la promotion");
  }
});

router.get("/students-count/:promotionId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const count = await StudentQueries.GetStudentByPromotions(
      req.params.promotionId
    );
    res.status(200).json(count);
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la récupération du nombre d'étudiants");
  }
});

router.get("/active", isConnectedMiddleware, async (req, res) => {
  try {
    const levels = ["L1", "L2", "L3", "M1", "M2"];
    const fields = ["informatique", "gestion", "btp"];
    const promotions =
      await PromotionQueries.GetClosestActivePromotionsOptimized(
        levels,
        fields
      );
    res.status(200).json(promotions);
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors de la récupération des promotions actives");
  }
});

module.exports = router;
