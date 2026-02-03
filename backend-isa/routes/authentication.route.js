const LoginAttemps = require("../models/loginAttempts.model");
const User = require("../models/user.model");
const UserQueries = require("../queries/UserQueries");
const { CheckLoginAttempts } = require("../secure/CheckLoginAttempts");
const {
  VerifyPasswordMatch,
  EncryptPassword,
} = require("../secure/securepassword");
const rateLimit = require("express-rate-limit");
const { generateRadomBytes } = require("../utils/generateRandomBytes");
const {
  SendMailForResetingPassword,
} = require("../mail/sendMailForResetPassword");
const { decryptCIN } = require("../function/EncryptCIN");
const { isConnectedMiddleware } = require("../middleware/middleware.global");
const router = require("express").Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives depuis cette IP. Réessayez dans 15 minutes.",
  skipSuccessfulRequests: true,
});

router.post("/login", loginLimiter, CheckLoginAttempts, async (req, res) => {
  try {
    const { matricule } = req.body;
    const passwordBody = req.body.password;
    const user = await UserQueries.GetUserByMatricule(
      matricule.toLocaleUpperCase()
    );
    if (user) {
      const isPasswordMatched = await VerifyPasswordMatch(
        user.password,
        passwordBody
      );
      if (isPasswordMatched) {
        req.session.matricule = user.matricule;
        req.session.role = user.role;
        req.session._id = user._id;
        req.session.fullName = `${user.name} ${user.firstName}`;
      } else {
        await LoginAttemps.updateOne(
          { matricule },
          { $inc: { attempts: 1 } },
          { upsert: true }
        );

        return res
          .status(403)
          .send(
            "Identifiant ou mot de passe incorrect. Veuillez réessayer ou contacter l'administration."
          );
      }
    } else {
      return res
        .status(404)
        .send(
          "Identifiant ou mot de passe incorrect. Veuillez réessayer ou contacter l'administration."
        );
    }

    await LoginAttemps.findOneAndDelete({ matricule });

    const userToSend = user;
    const { password, ...safeUser } = userToSend;

    return res.status(200).json(userToSend);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.sendStatus(500);
    }
    res.clearCookie("ISA_auth");
    return res.sendStatus(200);
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { matricule } = req.body;
    console.log(matricule);

    const user = await UserQueries.GetUserByMatricule(matricule);
    if (!user) {
      return res.status(404).send("Utilisateur introuvable");
    }

    const PASSWORD_CHANGE_COOLDOWN = 24 * 60 * 60 * 1000 * 15; // 15 jours

    if (user.configs.lastPasswordChange) {
      const lastChange = new Date(user.configs.lastPasswordChange).getTime();
      const now = Date.now();
      const passwordChangeDays = Math.floor((now - lastChange) / (1000 * 60 * 60 * 24));


      if (now - lastChange < PASSWORD_CHANGE_COOLDOWN) {
        return res.status(400).send(`Vous avez changé de mot de passe récemment. Veuillez réessayer dans ${15 - passwordChangeDays} jours.`);
      }
    }

    const randomBytes = generateRadomBytes();
    const expiresDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 1);
    const updatedData = {
      resetPasswordToken: randomBytes,
      resetPasswordExpires: expiresDate,
    };

    if (user.resetPasswordExpires) {
      const resetPasswordExpiresTimestamps = new Date(
        user.resetPasswordExpires
      ).getTime();
      const dateNow = Date.now();

      if (dateNow < resetPasswordExpiresTimestamps) {
        return res
          .status(400)
          .send(
            "Un lien de réinitialisation a déjà été envoyé. Veuillez vérifier votre boîte mail."
          );
      }
    }
    // await SendMailForResetingPassword(user.email, randomBytes);
    // await UserQueries.PatchUserByMatricule(matricule, updatedData);
    res
      .status(200)
      .send("Un lien de réinitialisation a été envoyé à votre adresse email.");
  } catch (error) {
    console.error(
      "Erreur lors de la demande de réinitialisation de mot de passe:",
      error
    );
    res
      .status(500)
      .send("Une erreur est survenue, veuillez réessayer plus tard.");
  }
});

router.patch("/reinitialise-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).send("Le mot de passe est requis.");
    }

    const user = await UserQueries.GetUserByToken(token);

    if (!user) {
      return res.status(404).send("Utilisateur non trouvé ou token invalide.");
    }

    const currentDate = Date.now();
    if (currentDate > new Date(user.resetPasswordExpires).getTime()) {
      return res.status(400).send("Le token de réinitialisation a expiré.");
    }

    const hashedPassword = await EncryptPassword(password);

    const updatedData = {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    };

    await UserQueries.PatchUserByMatricule(user.matricule, updatedData);

    res.status(200).send("Mot de passe réinitialisé avec succès.");
  } catch (error) {
    console.error(
      "Erreur lors de la réinitialisation du mot de passe :",
      error
    );
    res
      .status(500)
      .send("Une erreur est survenue, veuillez réessayer plus tard.");
  }
});

router.get("/user", isConnectedMiddleware, async (req, res) => {
  try {
    const userMatricule = req.session.matricule;

    const user = await UserQueries.GetUserByMatricule(userMatricule);
    if (user) {
      const { password, ...safeUser } = user;
      if (safeUser.cin) {
        safeUser.cin = decryptCIN(safeUser.cin);
      }

      res.status(200).json(safeUser);
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
