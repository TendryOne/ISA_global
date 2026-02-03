const pendingStudentsQueries = require('../queries/pendingStudents.queries')
const path = require('path')
const router = require('express').Router()
const fs = require('fs').promises;
const crypto = require('crypto');

// Stockage temporaire des tokens (en mémoire)
const tempTokens = new Map();

// Fonction pour générer un token temporaire (valide 5 minutes)
function generateTempToken(inscriptionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    tempTokens.set(token, { inscriptionId, expiresAt });
    
    // Nettoyer les tokens expirés
    setTimeout(() => tempTokens.delete(token), 5 * 60 * 1000);
    
    return token;
}

// Fonction pour valider un token temporaire
function validateTempToken(token, inscriptionId) {
    const tokenData = tempTokens.get(token);
    if (!tokenData) return false;
    if (tokenData.expiresAt < Date.now()) {
        tempTokens.delete(token);
        return false;
    }
    return tokenData.inscriptionId === inscriptionId;
}

// Endpoint pour servir les fichiers
router.get('/', async (req, res) => {
    try {
        // Vérifier la présence du paramètre fullPath
        const fileAsked = req.query.fullPath;
        const tempToken = req.query.token;
        const inscriptionId = req.query.inscriptionId;
        
        if (!fileAsked) {
            return res.status(400).json({ error: 'Paramètre fullPath requis.' });
        }

        // Vérifier l'authentification : soit session connectée, soit token temporaire valide
        const isAuthenticated = req.session?._id || (tempToken && inscriptionId && validateTempToken(tempToken, inscriptionId));
        
        if (!isAuthenticated) {
            return res.status(401).json({ error: 'Non autorisé. Authentification requise.' });
        }

        // Sanitisation du chemin pour éviter la traversée de chemin
        const safePath = path.normalize(fileAsked).replace(/^(\.\.[\/\\])+/, '');
        const allowedDir = path.join(__dirname, '..', 'private');
        const fullPath = path.join(allowedDir, safePath);

        // Vérifier que le chemin reste dans le dossier autorisé
        if (!fullPath.startsWith(allowedDir)) {
            const userInfo = req.session?.matricule ? `${req.session.matricule} (${req.session.role})` : `Token temporaire pour ${inscriptionId}`;
            console.log(`Tentative d'accès non autorisé à ${fullPath} par ${userInfo} à ${new Date()}`);
            return res.status(403).json({ error: 'Accès non autorisé au chemin demandé.' });
        }

        // ✅ RESTRICTIONS PAR RÔLE
        if (req.session?._id) {
            const normalizedPath = safePath.replace(/\\/g, '/'); // Uniformiser les séparateurs
            
            // 1. PROFESSEUR : AUCUN ACCÈS
            if (req.session.role === 'professor') {
                console.log(`Professeur ${req.session.matricule} a tenté d'accéder à ${normalizedPath} (REFUSÉ)`);
                return res.status(403).json({ 
                    error: 'Accès refusé. Les professeurs n\'ont pas accès aux fichiers privés.' 
                });
            }
            
            // 2. ÉTUDIANT : Uniquement ses propres fichiers (user/{matricule}/)
            if (req.session.role === 'student') {
                const userMatricule = req.session.matricule;
                
                if (!normalizedPath.startsWith(`user/${userMatricule}/`)) {
                    console.log(`Étudiant ${userMatricule} a tenté d'accéder à ${normalizedPath} (REFUSÉ)`);
                    return res.status(403).json({ 
                        error: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres fichiers.' 
                    });
                }
            }
            
            // 3. ADMIN : Accès total (pas de restriction)
            // Les admins passent directement
        }

        // Vérifier que le fichier existe
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({ error: 'Fichier non trouvé.' });
        }

        // Journalisation de l'accès
        const userInfo = req.session?.matricule ? `${req.session.matricule} (${req.session.role})` : `Token temporaire pour ${inscriptionId}`;
        console.log(`${userInfo} a accédé à ${fullPath} à ${new Date()}`);

        // Envoyer le fichier
        res.sendFile(fullPath, (err) => {
            if (err) {
                // ECONNABORTED signifie que le client (Puppeteer) a fermé la connexion après avoir reçu les données
                // C'est normal pour Puppeteer qui charge les images plusieurs fois
                if (err.code === 'ECONNABORTED') {
                    // Ne pas logger cette erreur, c'est un comportement normal de Puppeteer
                    return;
                }
                
                console.error('Erreur lors de l\'envoi du fichier:', err);
                // Vérifier si les headers n'ont pas déjà été envoyés
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Erreur serveur lors de l\'envoi du fichier.' });
                }
            }
        });

    } catch (error) {
        console.error('Erreur dans l\'endpoint:', error);
        if (!res.headersSent) {
            return res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
});

// Exporter aussi les fonctions pour les utiliser dans d'autres routes
router.generateTempToken = generateTempToken;
router.validateTempToken = validateTempToken;

module.exports = router