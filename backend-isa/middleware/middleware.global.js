const UserQueries = require("../queries/UserQueries");

const isProfessorMiddleware = (req, res, next) => {
  try {
    if (req.session && req.session.role === "professor") {
      return next();
    } else {
      return res.status(403).send("Accès réservé aux professeurs.");
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const isStudentMiddleware = async (req, res, next) => {
  try {
    if (req.session && req.session.role === "student") {
      const student = await UserQueries.GetUserByMatricule(req.session.matricule);
      if (student.verified) {

        return next();
      } else {
        return res.status(403).send("Compte étudiant non vérifié.");
      }
    } else {
      return res.status(403).send("Accès réservé aux étudiants.");
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const isRestrictedMiddleware = async (req, res, next) => {
  try {
    const matricule = req.session.matricule;
    const user = await UserQueries.GetUserByMatricule(matricule);

    if (user && user.isRestricted) {
      return res
        .status(403)
        .send(
          "La demande ne peut être traitée en raison des restrictions appliquées au compte utilisateur. Veuillez contacter l'administration."
        );
    } else {
      return next();
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const isRestrictedPromotionMiddleware = async (req, res, next) => {
  try {
    const { promotionId } = req.params;
    const matricule = req.session.matricule;
    const user = await UserQueries.GetUserByMatricule(matricule);
    if (user && user.role === "student" && user.isRestricted) {
      const currentPromotion = user.parcours.find(
        (p) => p.status === "in progress"
      );
      if (currentPromotion.promotion._id.toString() === promotionId) {
        return res
          .status(403)
          .send(
            "La demande ne peut être traitée en raison des restrictions appliquées au compte utilisateur. Veuillez contacter l'administration."
          );
      }


    } else {
      return next();
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

const isConnectedMiddleware = (req, res, next) => {
  try {
    if (req.session && req.session.matricule) {
      return next();
    } else {
      return res.status(401).send("Utilisateur non authentifié.");
    }
  } catch (error) {
    res.sendStatus(500);
  }
};

module.exports = {
  isProfessorMiddleware,
  isStudentMiddleware,
  isRestrictedMiddleware,
  isRestrictedPromotionMiddleware,
  isConnectedMiddleware
};
