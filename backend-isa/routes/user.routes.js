const {
  generateMatriculeNumber,
} = require("../function/generateMatriculeNumber");
const { isAdminAndSuperAdmin } = require("../middleware/AdminVerification");
const { checkSession } = require("../middleware/checkSession");
const { isConnectedMiddleware } = require("../middleware/middleware.global");
const StudentQueries = require("../queries/Student.queries");
const UserQueries = require("../queries/UserQueries");
const {
  EncryptPassword,
  VerifyPasswordMatch,
} = require("../secure/securepassword");

const router = require("express").Router();

// router.get("/", checkSession, async (req, res) => {
//   try {
//     const matricule = await generateMatriculeNumber("ADMI");

//     res.status(200).json({
//       MatriculeNumber: matricule,
//     });
//   } catch (error) {
//     res.sendStatus(500);
//   }
// });

// router.post("/", async (req, res) => {
//   try {
//     const matricule = await generateMatriculeNumber("ETU");

//     res.status(200).json({
//       MatriculeNumber: matricule,
//     });
//   } catch (error) {
//     res.sendStatus(500);
//   }
// });

router.patch("/default-password", isConnectedMiddleware, async (req, res) => {
  try {
    const body = req.body;
    if (body && body.password) {
      const hashedPassword = await EncryptPassword(body.password);
      body.password = hashedPassword;
      let dataUpdated = {
        password: body.password,
        configs: {
          defaultPassword: false,
          lastPasswordChange: new Date(),
        },
      };

      const user = await UserQueries.UpdateUserById(
        req.session._id,
        dataUpdated
      );
      return res.status(200).json(user);
    }

    return res.status(400).send("Données manquantes ou invalides");
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

router.patch("/update-password", isConnectedMiddleware, async (req, res) => {
  try {
    const body = req.body;
    if (body && body.password && body.oldPassword) {
      const user = await UserQueries.GetUserByMatricule(req.session.matricule);

      const passwordMatch = await VerifyPasswordMatch(
        user.password,
        body.oldPassword
      );

      if (!passwordMatch) {
        return res.status(400).send("L'ancien mot de passe est incorrect.");
      }

      if (user.configs.lastPasswordChange) {
        const lastChange = new Date(user.configs.lastPasswordChange);
        const now = new Date();
        const diffInDays = Math.floor(
          (now - lastChange) / (1000 * 60 * 60 * 24)
        );
        if (diffInDays < 7) {
          return res
            .status(400)
            .send(
              `Vous avez récemment changé votre mot de passe. Merci de patienter ${7 - diffInDays} jour(s) avant de pouvoir le modifier à nouveau.`
            );
        }
      }

      const hashedPassword = await EncryptPassword(body.password);
      body.password = hashedPassword;
      let dataUpdated = {
        password: body.password,
        configs: {
          lastPasswordChange: new Date(),
        },
      };

      await UserQueries.UpdateUserById(req.session._id, dataUpdated);
      return res.sendStatus(200);
    }

    return res.status(400).send("Données manquantes ou invalides");
  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
});

router.patch("/update-all/:id", isConnectedMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    if (
      req.session._id.toString() !== userId.toString() &&
      req.session.role !== "superAdmin"
    ) {
      return res
        .status(403)
        .send("Vous n'avez pas la permission de modifier cet utilisateur.");
    }

    if (req.session.role === "student") {
      await StudentQueries.UpdateStudentById(userId, updateData, null);
    } else if (
      req.session.role === "admin" ||
      req.session.role === "superAdmin"
    ) {
      await UserQueries.UpdateUserById(userId, updateData);
    } else if (req.session.role === "professor") {
      await UserQueries.UpdateUserById(userId, updateData);
    }

    res.status(200).send("ok");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});


router.get("/students", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const students = await UserQueries.getAllStudents(
      req.query.page,
      req.query.limit,
      req.query.field,
      req.query.search,
      req.query.level,
      req.query.isRestricted,
      req.query.verified
    );

    return res.status(200).json(students);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get("/eventLogs/:entityId", isAdminAndSuperAdmin, async (req, res) => {
  try {
    const { entityId } = req.params;
    const logs = await UserQueries.getUserByIdForLogs(entityId);
    res.status(200).json(logs);
  } catch (error) {
    res.sendStatus(500);
  }
})

module.exports = router;
