const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { isConnectedMiddleware } = require("../middleware/middleware.global");
const FeesManagementQueries = require("../queries/FeesManagement.queries")

const router = require("express").Router()


router.get("/", async (req, res) => {
    try {
        const query = req.query
        const feesManagement = await FeesManagementQueries.GetFeesManagement(query);
        res.status(200).json(feesManagement)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

router.get("/:id", isConnectedMiddleware, async (req, res) => {
    try {
        const fee = await FeesManagementQueries.GetFeesManagementById(req.params.id);
        res.status(200).json(fee);
    } catch (error) {
        res.sendStatus(500)
    }
})


router.post("/", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const body = req.body
        const levelExistingAlready = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(body.level, body.field)
        const { fees, echeances } = req.body
        const totalAmountInEcheances = echeances.reduce((sum, e) => sum + (e.amount || 0), 0);
        if (!(fees === totalAmountInEcheances)) {
            return res.status(409).send("Le total des frais de scolarité ne correspond pas au montant total des échéances fournies.")
        }
        if (levelExistingAlready) {
            return res.status(409).send(`Impossible de dupliquer les frais de scolarité : ce niveau academique ${body.level} existe déjà .`);
        }


        await FeesManagementQueries.CreateFeesManagement(req.body);

        res.sendStatus(200);
    } catch (error) {
        console.log(error);

        res.sendStatus(500)
    }
})

router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { fees, echeances } = req.body
        const totalAmountInEcheances = echeances.reduce((sum, e) => sum + (e.amount || 0), 0);
        if (!(fees === totalAmountInEcheances)) {
            return res.status(409).send("Le total des frais de scolarité ne correspond pas au montant total des échéances fournies.")
        }

        await FeesManagementQueries.UpdateFeesManagement(req.params.id, req.body)
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500)
    }

})

router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
    try {
        await FeesManagementQueries.DeleteFeesManagement(req.params.id);
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
    }
})


router.get("/:field/:level", async (req, res) => {
    try {
        const fee = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(req.params.level, req.params.field)
        res.status(200).json(fee);

    } catch (error) {
        res.sendStatus(500)
    }
})
module.exports = router