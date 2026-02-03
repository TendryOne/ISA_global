const { isConnectedMiddleware } = require("../middleware/middleware.global");
const eventLogsQueries = require("../queries/eventLogs.queries");

const router = require("express").Router();

// best efforts logging - ne doit pas bloquer la requête principale ***

router.post("/", isConnectedMiddleware, async (req, res) => {
    const { userId } = req.body
    if (req.session._id !== userId) {
        return res.status(200).end()
    }
    await eventLogsQueries.createLog(req.body);
    res.status(200).end();
});

router.get("/:userId", isConnectedMiddleware, async (req, res) => {
    const { userId } = req.params;
    const { date } = req.query;

    if (req.session.role === "admin" || req.session.role === "superAdmin" || req.session._id.toString() === userId) {
        const logs = await eventLogsQueries.getLogsByUserIdAndDate(userId, date);
        return res.status(200).json(logs);
    } else {
        return res.status(403).send("Access denied");
    }
});

// router.get("/eventDetails/:entityId/:entityType", isConnectedMiddleware, async (req, res) => {
//     try {
//         const { entityId, entityType } = req.params;
//         const logDetails = await eventLogsQueries.getLogDetailsByentityIdAndEntityType(entityId, entityType);
//         return res.status(200).json(logDetails);
//     } catch (error) {
//         console.log(error);
//         return res.sendStatus(500);
//     }
// })

module.exports = router;