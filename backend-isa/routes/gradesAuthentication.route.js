const gradesAuthenticationQueries = require('../queries/grades-authentication.queries');

const router = require('express').Router();

// Note: Le token original ne peut pas être récupéré une fois hashé en DB.
// Le token est uniquement disponible lors du téléchargement du PDF du relevé de notes.

const gradesLimiter = require("express-rate-limit");
const gradesAuthLimiter = gradesLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Trop de tentatives de vérification de Notes. Réessayez dans 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
    // Utiliser l'IP comme clé pour identifier l'utilisateur
    keyGenerator: (req) => {
        return req.ip;
    },
});


router.get('/', gradesAuthLimiter, async (req, res) => {
    try {
        const { token } = req.query;
        // checkTokenExists va hasher le token avant de le comparer
        const isValid = await gradesAuthenticationQueries.checkTokenExists(token);

        res.status(200).json({ authenticated: isValid });
    } catch (error) {
        res.status(500).send('Erreur serveur lors de la récupération des authentifications des relevés de notes.');
    }
})


module.exports = router;