const router = require("express").Router();
const { isRestrictedPromotionMiddleware, isProfessorMiddleware } = require("../middleware/middleware.global");
const ModuleQueries = require("../queries/Module.queries");
const promotionQueries = require("../queries/promotion.queries");
const RessourceQueries = require("../queries/resources.queries");
router.get(
  "/module/:moduleId/professor/:professorId/promotion/:promotionId",
  isProfessorMiddleware,
  async (req, res) => {
    try {
      const { moduleId, professorId, promotionId } = req.params;
      if (promotionId === "null") {
        const module =
          await ModuleQueries.getModuleByIdWiTeachingUnit(moduleId);

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
        const resources =
          await RessourceQueries.getResourcesByModuleProfessorPromotion(
            moduleId,
            professorId,
            promotion._id
          );
        return res.status(200).json(resources);
      }
      const resources =
        await RessourceQueries.getResourcesByModuleProfessorPromotion(
          moduleId,
          professorId,
          promotionId
        );

      return res.status(200).json(resources);
    } catch (error) {
      console.log(error);

      res.status(500).send("Erreur serveur");
    }
  }
);

router.get("/module/:moduleId/promotion/:promotionId", isRestrictedPromotionMiddleware, async (req, res) => {
  try {
    const { moduleId, promotionId } = req.params;

    const resources =
      await RessourceQueries.getResourcesByModuleProfessorPromotion(
        moduleId,
        null,
        promotionId
      );
    console.log(resources);
    return res.status(200).json(resources);
  } catch (error) {
    console.log(error);

    res.status(500).send("Erreur serveur");
  }
});

router.post("/", isProfessorMiddleware, async (req, res) => {
  try {
    const data = req.body;
    const module = await ModuleQueries.getModuleByIdWiTeachingUnit(data.module);
    if (!module) {
      return res.status(400).send("Module invalide");
    }

    if (module.teacher != req.session._id) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à créer un devoir pour ce module");
    }

    if (!data.promotion) {
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
      data.promotion = promotion._id;
      data.professor = req.session._id;
    }

    const newResource = await RessourceQueries.CreateRessources(data);
    res.status(201).json(newResource);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur serveur");
  }
});

router.patch("/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const resource = await RessourceQueries.getResourceById(id);
    if (!resource) {
      return res.status(404).send("Ressource non trouvée");
    }
    if (resource.professor != req.session._id) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à modifier cette ressource");
    }

    const updatedResource = await RessourceQueries.UpdateRessources(id, data);
    res.json(updatedResource);
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

router.delete("/:id", isProfessorMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await RessourceQueries.getResourceById(id);
    if (!resource) {
      return res.status(404).send("Ressource non trouvée");
    }
    if (resource.professor != req.session._id) {
      return res
        .status(403)
        .send("Vous n'êtes pas autorisé à supprimer cette ressource");
    }

    await RessourceQueries.DeleteRessources(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;
