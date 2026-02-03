const LoginAttemps = require("../models/loginAttempts.model")

exports.CheckLoginAttempts = async (req, res, next) => {
  try {

    const { matricule } = req.body
    const response = await LoginAttemps.findOne({ matricule });
    if (response && response.attempts >= 5) {
      return res.status(403).send("Trop de tentatives infructueuse sur ce matricule, veuillez réessayer dans 15 minutes.")
    } else {
      next()
    }

  } catch (error) {
    console.log(error);

    return res.sendStatus(500);
  }
}