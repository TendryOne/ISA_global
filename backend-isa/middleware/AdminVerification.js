const UserQueries = require("../queries/UserQueries")

exports.isSuperAdmin = async (req, res, next) => {
    if (req.session) {
        const matricule = req.session.matricule
        if (matricule) {
            const user = await UserQueries.GetUserByMatricule(matricule)

            if (user) {


                if (user.role === "superAdmin") {
                    return next()
                } else {
                    return res.status(403).send('Accès réservé aux superAdmins.')
                }
            } else {
                return res.status(403).send('Utilisateur non trouvé.')
            }
        } else {
            return res.status(403).send('Matricule non trouvé.')
        }
    } else {
        return res.status(403).send('Accès interdit.')
    }
}


exports.isAdminAndSuperAdmin = async (req, res, next) => {
    try {
        // Vérifier l'existence de la session
        if (!req.session || !req.session.matricule) {
            console.log(`Tentative d'accès sans session ou matricule à ${new Date()}`);
            return res.status(401).json({ error: 'Authentification requise. Veuillez vous connecter.' });
        }

        // Récupérer l'utilisateur depuis la base de données
        const user = await UserQueries.GetUserByMatricule(req.session.matricule);
        if (!user) {
            console.log(`Tentative d'accès avec matricule invalide ${req.session.matricule} à ${new Date()}`);
            return res.status(403).json({ error: 'Utilisateur non trouvé.' });
        }

        // Vérifier le rôle
        if (user.role !== 'admin' && user.role !== 'superAdmin') {
            console.log(`Tentative d'accès non autorisé par ${req.session.matricule} (${user.role}) à ${new Date()}`);
            return res.status(403).json({ error: 'Accès réservé aux admins et superAdmins.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur dans le middleware isAdminAndSuperAdmin:', error);
        return res.status(500).json({ error: 'Erreur serveur lors de la vérification des autorisations.' });
    }
};