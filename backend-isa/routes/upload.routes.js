const router = require('express').Router();

const path = require('path');
const { isAdminAndSuperAdmin } = require('../middleware/AdminVerification');

// Liste blanche des fichiers autorisés
const allowedFiles = {
    'brochure.pdf': true,
    'ISA_Processus_Admission.pdf': true
};
const fs = require('fs').promises;



router.get('/file/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        if (!fileName) {
            return res.status(400).json({ error: 'Paramètre fileName requis.' });
        }

        if (/[\/\\]/.test(fileName)) {
            console.log(`Tentative d'accès avec fileName invalide ${fileName} à ${new Date()}`);
            return res.status(400).json({ error: 'Nom de fichier invalide.' });
        }

        if (!allowedFiles[fileName]) {
            console.log(`Tentative d'accès à un fichier non autorisé ${fileName} à ${new Date()}`);
            return res.status(403).json({ error: 'Accès refusé : fichier non autorisé.' });
        }

        const uploadDir = path.join(__dirname, '..', 'upload');
        const filePath = path.join(uploadDir, fileName);

        if (!filePath.startsWith(uploadDir)) {
            console.log(`Tentative d'accès non autorisé à ${filePath} à ${new Date()}`);
            return res.status(403).json({ error: 'Accès refusé : chemin non autorisé.' });
        }

        try {
            await fs.access(filePath);
        } catch {
            console.log(`Fichier non trouvé ${filePath} à ${new Date()}`);
            return res.status(404).json({ error: 'Fichier non trouvé.' });
        }

        console.log(`Téléchargement du fichier ${filePath} à ${new Date()}`);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error('Erreur lors du téléchargement du fichier:', err);
                if (!res.headersSent) {
                    return res.status(500).json({ error: 'Erreur serveur lors du téléchargement du fichier.' });
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





// Variante: téléchargement via le chemin relatif tel qu'enregistré en DB
// Exemple: path=module-materials/maths_101/UML_ANALYSE_ET_CONCEPTION_N_2_2025__1_.pdf
router.get('/materials/by-path', async (req, res) => {
    try {
        const rawRel = req.query.path || req.query.p;
        if (!rawRel || typeof rawRel !== 'string') {
            return res.status(400).json({ error: 'Paramètre path requis.' });
        }

        // Normaliser en POSIX et filtrer
        let norm = path.posix.normalize(rawRel.trim());
        // Interdire la remontée
        norm = norm.replace(/^(\.\.\/)+/, '');

        // Doit commencer par module-materials/
        if (!norm.toLowerCase().startsWith('module-materials/')) {
            return res.status(400).json({ error: 'Chemin invalide.' });
        }

        // Doit être un PDF
        if (!/\.pdf$/i.test(norm)) {
            return res.status(400).json({ error: 'Seuls les fichiers PDF sont autorisés.' });
        }

        const privateRoot = path.join(__dirname, '..', 'private');
        const materialsRoot = path.join(privateRoot, 'module-materials');
        const absPath = path.resolve(privateRoot, norm.replace(/\//g, path.sep));

        // Containment checks
        if (!absPath.startsWith(materialsRoot)) {
            return res.status(403).json({ error: 'Accès refusé.' });
        }

        try {
            await fs.access(absPath);
        } catch {
            return res.status(404).json({ error: 'Fichier non trouvé.' });
        }

        const actor = req.user ? `${req.user.matricule} (${req.user.role})` : 'unknown';
        console.log(`Téléchargement matériel (by-path): ${absPath} par ${actor} @ ${new Date().toISOString()}`);

        const downloadName = path.basename(absPath);
        res.download(absPath, downloadName, (err) => {
            if (err && !res.headersSent) {
                console.error('Erreur lors du téléchargement (by-path):', err);
                return res.status(500).json({ error: 'Erreur serveur lors du téléchargement.' });
            }
        });
    } catch (error) {
        console.error('Erreur route materials/by-path:', error);
        if (!res.headersSent) return res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;