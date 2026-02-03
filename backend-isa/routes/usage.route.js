const router = require("express").Router();
const { isConnectedMiddleware } = require("../middleware/middleware.global");
const usageQueries = require("../queries/usage.queries");

// best efforts logging - ne doit pas bloquer la requête principale ***

router.post("/", isConnectedMiddleware, async (req, res) => {
    console.log(req.body);
    const { userId, date, duration } = req.body;
    await usageQueries.trackHours(userId, date, duration);
    res.status(200).end();


})

router.post("/sync", isConnectedMiddleware, async (req, res) => {
    const sessions = req.body.sessions || [];
    await usageQueries.syncHours(sessions);
    return res.status(204).end();

});

router.get("/:id", isConnectedMiddleware, async (req, res) => {
    if (req.session.role === "admin" || req.session.role === "superAdmin" || req.session._id.toString() === req.params.id) {
        const userId = req.params.id;
        const year = req.query.year || new Date().getFullYear();
        const usageData = await usageQueries.getUserUsage(userId, year);
        res.status(200).json(usageData);
    } else {
        res.status(403).send("Access denied");
    }
});


module.exports = router;