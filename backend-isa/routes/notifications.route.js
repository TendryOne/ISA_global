const notificationSeen = require("../models/notificationSeen");
const notificationQueries = require("../queries/notification.queries");
const UserQueries = require("../queries/UserQueries");

const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const { page } = req.query;
    const userId = req.session._id;
    const userRole = req.session.role;
    let promotionIds = [];
    if (!userId || !userRole) {
      return res.status(401).send("Non autorisé");
    }

    if (userRole === "student") {
      const user = await UserQueries.GetUserByMatricule(req.session.matricule);
      if (
        user &&
        user.parcours.length !== 0 &&
        user.parcours.find((p) => p.status === "in progress").promotion
      ) {
        promotionIds = [
          user.parcours.find((p) => p.status === "in progress").promotion._id,
        ].map((id) => id.toString());
      }
    }

    const notificationsData =
      await notificationQueries.getNotificationsByUserId(
        userId,
        userRole,
        promotionIds,
        page
      );
    return res.json(notificationsData);
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

router.patch("/mark-as-read", async (req, res) => {
  try {
    const userId = req.session._id;
    const notificationUnSeen = await notificationSeen.findOne({ user: userId });
    let data = null;
    if (notificationUnSeen) {
      data = await notificationSeen.updateOne(
        { user: userId },
        {
          lastSeenAt: new Date(),
        }
      );
    } else {
      data = await notificationSeen.create({
        user: userId,
        lastSeenAt: new Date(),
      });
    }
    return res.status(200).send("ok");
  } catch (error) {
    return res.sendStatus(500);
  }
});

module.exports = router;
