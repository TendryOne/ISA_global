const router = require('express').Router()
const multer = require('multer');
const { createFileDirectory, createFileDirectoryUserProof } = require('../function');
const { generateInscriptionNumber } = require('../function/generateInscriptionNumber');
const sharp = require('sharp')
const fsPromises = require('fs/promises');
const fs = require('fs')
const path = require('path');
const pendingStudentsQueries = require('../queries/pendingStudents.queries');
const { SendMailForInscription } = require('../mail/SendMailForInscription');
const XLSX = require('xlsx');
const UserQueries = require('../queries/UserQueries');
const { SendMailForAdmission } = require('../mail/sendMailForAdmission');
const FeesManagementQueries = require('../queries/FeesManagement.queries');
const crypto = require("crypto");
const { hashToken } = require('../function/HashToken');
const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose");
const { generateMatriculeNumber } = require('../function/generateMatriculeNumber');
const TutionFeesQueries = require('../queries/TutionFees.queries');
const { SendMailForSuccessAdmission } = require('../mail/sendMailForAdmissionSuccess');
const TutionFees = require('../models/tutionFees.model');
const ReportQueries = require('../queries/Report.queries');
const { encryptCIN, decryptCIN } = require('../function/EncryptCIN');
const ejs = require('ejs');
const { isAdminAndSuperAdmin } = require('../middleware/AdminVerification');





// ==================== FONCTIONS UTILITAIRES ====================

async function compressImage(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .webp({ quality: 85 })
            .toFile(outputPath);

        await fsPromises.unlink(inputPath);
        return true;
    } catch (err) {
        console.error('Erreur compression image:', err.message);
        return false;
    }
}

async function fileExists(filePath) {
    try {
        await fsPromises.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Fonction pour compresser et redimensionner une image avant base64
async function compressAndBase64(imagePath, { width = 600, quality = 75 } = {}) {
    try {
        const absolutePath = path.join(__dirname, '..', 'private', imagePath);
        const buffer = await sharp(absolutePath)
            .resize({ width })
            .webp({ quality })
            .toBuffer();
        return `data:image/webp;base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error(`Erreur lors de la compression de l'image ${imagePath}:`, error);
        return null;
    }
}

// ==================== RATE LIMITERS ====================

const inscriptionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: true,
    message: "Trop de tentatives d'inscription depuis cette IP. Réessayez dans 15 minutes."
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Trop de tentatives depuis cette IP. Réessayez dans 15 minutes.",
    skipSuccessfulRequests: true,
});

// ==================== MULTER CONFIGURATION ====================

// Dossier temporaire pour les uploads
const TEMP_UPLOAD_DIR = path.join(__dirname, '../temp/uploads');

// Multer avec stockage temporaire uniquement
const upload = multer({
    storage: multer.diskStorage({
        destination: async (req, file, cb) => {
            try {
                // Valider la filière
                const { field } = req.body;
                if (!field) {
                    return cb(new Error('Le champ "field" est requis'));
                }

                const validFields = ['informatique', 'btp', 'gestion'];
                if (!validFields.includes(field)) {
                    return cb(new Error('Filière invalide'));
                }

                // Créer un dossier temporaire unique pour cette requête
                if (!req.tempUploadId) {
                    req.tempUploadId = `temp-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
                    req.tempUploadPath = path.join(TEMP_UPLOAD_DIR, req.tempUploadId);
                    await fsPromises.mkdir(req.tempUploadPath, { recursive: true });
                }

                cb(null, req.tempUploadPath);
            } catch (err) {
                cb(err);
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PNG et JPEG sont autorisés.'), false);
        }
    }
}).fields([
    { name: 'identityPhoto', maxCount: 1 },
    { name: 'bacTranscript', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 },
    { name: 'residenceCertificate', maxCount: 1 }
]);

const uploadProof = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const tempDir = path.join(__dirname, '../temp');
            fs.mkdir(tempDir, { recursive: true }, (err) => {
                if (err) return cb(err);
                cb(null, tempDir);
            });
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, `proof-${uniqueSuffix}${ext}`);
        }
    }),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Seuls les fichiers image sont autorisés.'), false);
    }
}).single('proofFile');


// ==================== ROUTE PRINCIPALE D'INSCRIPTION ====================

router.post('/', inscriptionLimiter, async (req, res) => {
    let session = null;
    let tempUploadPath = null;
    let finalUploadPath = null;
    let inscriptionNumber = null;

    try {
        // 1. Gestion de l'upload dans le dossier temporaire
        await new Promise((resolve, reject) => {
            upload(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        tempUploadPath = req.tempUploadPath;

        // 2. Vérification des fichiers requis
        if (!req.files ||
            !req.files.identityPhoto ||
            !req.files.idDocument ||
            !req.files.residenceCertificate) {
            throw new Error('Fichiers requis manquants');
        }

        // 3. Vérification anti-spam
        if (req.body.website !== "") {

            throw new Error('Requête invalide');
        }

        // 4. Vérification de l'email existant
        const existingUser = await UserQueries.GetUserByEmailOrPhone(req.body.email, req.body.phone);
        if (existingUser) {
            throw new Error('EMAIL_EXISTS');
        }

        // 5. Compression des images dans le dossier temporaire
        const compressionPromises = Object.entries(req.files).map(async ([field, files]) => {
            for (const file of files) {
                const originalPath = file.path;
                const compressedPath = originalPath.replace(path.extname(originalPath), '.webp');

                const success = await compressImage(originalPath, compressedPath);
                if (success) {
                    file.path = compressedPath;
                }
            }
        });

        await Promise.all(compressionPromises);

        // 6. Démarrer la transaction MongoDB
        session = await mongoose.startSession();
        session.startTransaction();

        // 7. Générer le numéro d'inscription DANS la transaction
        const { field } = req.body;
        let nameFiliere = '';
        switch (field) {
            case 'informatique': nameFiliere = 'INFO'; break;
            case 'btp': nameFiliere = 'BTP'; break;
            case 'gestion': nameFiliere = 'GES'; break;
            default: throw new Error('Filière invalide');
        }

        inscriptionNumber = await generateInscriptionNumber(nameFiliere, session);

        // 8. Créer le dossier de destination final
        finalUploadPath = createFileDirectory(field, inscriptionNumber);
        await fsPromises.mkdir(finalUploadPath, { recursive: true });

        // 9. Déplacer les fichiers du dossier temporaire vers le dossier final
        const movedFiles = {};
        for (const [fieldName, files] of Object.entries(req.files)) {
            movedFiles[fieldName] = [];
            for (const file of files) {
                const tempFilePath = file.path;
                const fileName = path.basename(tempFilePath);
                const finalFilePath = path.join(finalUploadPath, fileName);

                // Déplacer le fichier
                await fsPromises.rename(tempFilePath, finalFilePath);

                movedFiles[fieldName].push({
                    ...file,
                    path: finalFilePath
                });
            }
        }

        // 10. Préparer les chemins relatifs pour la base de données
        const filePaths = {
            residenceCertificate: path.relative('private', movedFiles.residenceCertificate[0].path),
            idDocument: path.relative('private', movedFiles.idDocument[0].path),
            identityPhoto: path.relative('private', movedFiles.identityPhoto[0].path),
            bacTranscript: movedFiles.bacTranscript
                ? path.relative('private', movedFiles.bacTranscript[0].path)
                : null
        };

        console.log('Données reçues:', req.body);

        // 11. Créer les données de l'étudiant
        const studentData = {
            ...req.body,
            email: req.body.email.toLowerCase(),
            inscriptionId: inscriptionNumber,
            cin: encryptCIN(req.body.cin),
            ...filePaths
        };

        // 12. Enregistrer en base de données
        await pendingStudentsQueries.create(studentData, session);

        // 13. Commiter la transaction
        await session.commitTransaction();
        session.endSession();

        // 14. Nettoyer le dossier temporaire (maintenant vide)
        if (tempUploadPath) {
            await fsPromises.rm(tempUploadPath, { recursive: true, force: true })
                .catch(err => console.error('Erreur nettoyage temp:', err.message));
        }

        // 15. Envoyer l'email de confirmation (hors transaction)
        await SendMailForInscription(req.body.email, inscriptionNumber)
            .catch(err => console.error('Erreur envoi email:', err.message));

        // 16. Réponse réussie
        return res.status(200).json({
            success: true,
            inscriptionNumber: inscriptionNumber
        });

    } catch (error) {
        // Rollback de la transaction MongoDB
        if (session) {
            try {
                await session.abortTransaction();
                session.endSession();
            } catch (abortErr) {
                console.error('Erreur abort transaction:', abortErr.message);
            }
        }

        // Nettoyage des fichiers temporaires
        if (tempUploadPath) {
            await fsPromises.rm(tempUploadPath, { recursive: true, force: true })
                .catch(err => console.error('Erreur suppression temp:', err.message));
        }

        // Nettoyage du dossier final s'il a été créé
        if (finalUploadPath) {
            await fsPromises.rm(finalUploadPath, { recursive: true, force: true })
                .catch(err => console.error('Erreur suppression final:', err.message));
        }

        // Gestion des erreurs spécifiques
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Le fichier dépasse 3Mo.' });
        }

        if (error.message === 'Fichiers requis manquants') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'Requête invalide') {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'EMAIL_EXISTS') {
            return res.status(409).json({
                error: "Certaines informations sont déjà utilisées. Veuillez vérifier le CIN, l'email, le numéro de téléphone ou la référence de transaction."
            });
        }

        if (error.errorResponse?.code === 11000) {
            const keyPattern = error.errorResponse.keyPattern;
            console.error("Conflit de clé unique détecté :", keyPattern);

            return res.status(409).json({
                error: "Certaines informations sont déjà utilisées. Veuillez vérifier le CIN, l'email, le numéro de téléphone ou la référence de transaction.",
            });
        }

        console.error('Erreur inscription :', error);

        return res.status(500).json({
            error: 'Une erreur est survenue lors du traitement de votre candidature.',
        });
    }
});


// ==================== AUTRES ROUTES ====================

router.get('/', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { pageQuery, perPageQuery, searchQuery, fieldsQuery, statusQuery } = req.query
        const students = await pendingStudentsQueries.getStudent(pageQuery, Number(perPageQuery), searchQuery, fieldsQuery, statusQuery);
        res.status(200).json(students)
    } catch (error) {
        res.status(500).send("Une erreur s'est produite lors de la récupération des étudiants. Veuillez réessayer ultérieurement.");
    }
})

router.get('/user/:userId', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const students = await pendingStudentsQueries.getStudentById(req.params.userId);
        const realStudent = {
            ...students,
            cin: decryptCIN(students.cin)
        }
        if (!students) {
            return res.status(404).send(`L'étudiant avec le numéro d'inscription "${req.params.userId}" n'existe pas dans la base de données.`);
        }
        res.status(200).json(realStudent)
    } catch (error) {
        console.log(error);

        res.status(500).send("Une erreur s'est produite lors de la recuperation de l'etudiant")
    }
})

router.get('/approved-students', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const students = await pendingStudentsQueries.getApprovedStudentWithLessInfo();
        res.status(200).json(students);
    } catch (error) {
        console.error("Erreur lors de la récupération des étudiants approuvés :", error);
        res.status(500).send("Une erreur s'est produite lors de la récupération des étudiants approuvés.");
    }
});

router.get('/export-data', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const data = (await pendingStudentsQueries.getStudent(1, 600)).pendingStudents;
        const newData = data.map(({ _id, status, ...rest }) => rest);

        const btpStudents = newData.filter(s => s.field === "btp");
        const gestionStudents = newData.filter(s => s.field === "gestion");
        const infoStudents = newData.filter(s => s.field === "informatique");

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(btpStudents), "BTP");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(gestionStudents), "Gestion");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(infoStudents), "Informatique");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        const filename = `pre-inscription-${new Date().getFullYear()}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer).status(200);
    } catch (error) {
        console.error("Erreur lors de l'export :", error);
        res.sendStatus(500);
    }
});

router.patch('/:inscriptionId', isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const body = req.body
        const inscriptionId = req.params.inscriptionId;
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(token);
        const update = {
            ...body,
            token: hashedToken
        }
        const oldStudent = await pendingStudentsQueries.getStudentById(inscriptionId);
        const fee = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(oldStudent.levelAsked, oldStudent.field)
        if (!fee) {
            return res.status(500).send(`Veuillez configurer les frais de scolarite pour ${oldStudent.field} ${oldStudent.levelAsked} `)
        }
        const candidateName = `${oldStudent.firstName} ${oldStudent.lastName}`

        const studentUpdated = await pendingStudentsQueries.UpdatePendingStudentsById(inscriptionId, update, session);

        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Approbation de la préinscription du dossier ${studentUpdated.inscriptionId}`,
            details: `Le dossier a été validé : complet et paiement confirmé.`,
            role: req.session.role
        }

        await ReportQueries.CreateReport(report, session);
        await session.commitTransaction()
        session.endSession()

        await SendMailForAdmission(oldStudent.email, candidateName, oldStudent.inscriptionId, oldStudent.field, token, fee.fees, fee.level, fee.echeances)
        res.sendStatus(200)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error);
        res.sendStatus(500)
    }
})

router.get('/export-data-approved', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const data = (await pendingStudentsQueries.getStudent(1, 600, '', '', 'approved')).pendingStudents;
        const newData = data.map(({ _id, status, ...rest }) => rest);

        const btpStudents = newData.filter(s => s.field === "btp");
        const gestionStudents = newData.filter(s => s.field === "gestion");
        const infoStudents = newData.filter(s => s.field === "informatique");

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(btpStudents), "BTP");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(gestionStudents), "Gestion");
        XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(infoStudents), "Informatique");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        const filename = `listes-des-admis-${new Date().getFullYear()}.xlsx`;

        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer).status(200);
    } catch (error) {
        console.error("Erreur lors de l'export :", error);
        res.sendStatus(500);
    }
});

router.delete('/:inscriptionId/:field', isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession()
    session.startTransaction()
    let report
    try {
        const { field, inscriptionId } = req.params
        const studentDeleted = await pendingStudentsQueries.DeleteStudent(inscriptionId, field, session);

        if (req.body && req.body.rejectionReason) {
            report = {
                authorId: req.session.matricule,
                authorName: req.session.fullName,
                action: `Rejet de la préinscription (ID : ${studentDeleted.inscriptionId})`,
                details: `La préinscription a été rejetée et supprimée pour le motif suivant : "${req.body.rejectionReason.reason}".`,
                role: req.session.role
            };
        } else {
            report = {
                authorId: req.session.matricule,
                authorName: req.session.fullName,
                action: `Suppression de la liste des admis de l'étudiant ${studentDeleted.inscriptionId}`,
                details: `L'étudiant ${studentDeleted.lastName} ${studentDeleted.firstName}, inscrit sous le numero d'inscription ${studentDeleted.inscriptionId}, appartenant à la filière ${studentDeleted.field}, a été supprimé de la liste des admis.`,
                role: req.session.role
            };
        }

        await ReportQueries.CreateReport(report, session);
        await session.commitTransaction()
        session.endSession()
        res.sendStatus(200)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error);
        res.sendStatus(500)
    }
})

// router.post("/inscription-student/:cin/:email", async (req, res) => {
//     try {
//         const { cin, email } = req.params
//         const param = { cin, email }
//         await pendingStudentsQueries.getStudentByParam(param);
//         res.sendStatus(200)
//     } catch (error) {
//         res.sendStatus(500)
//     }
// })

router.get("/token/:token", loginLimiter, async (req, res) => {
    try {
        const DehashedToken = hashToken(req.params.token)
        const user = await pendingStudentsQueries.getStudentByToken(DehashedToken);

        if (!user || user.expiredToken) {
            return res.status(403).send("Échec de l'inscription : le lien d'accès est invalide, expiré ou non autorisé.");
        }

        res.status(200).json(user)
    } catch (error) {
        res.sendStatus(500)
    }
})

router.post("/getNewToken/:inscriptionId", isAdminAndSuperAdmin, loginLimiter, async (req, res) => {
    try {
        const inscriptionId = req.params.inscriptionId
        const student = await pendingStudentsQueries.getStudentById(inscriptionId)
        if (!student) {
            return res.status(404).send("Étudiant non trouvé");
        }
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(token);
        await pendingStudentsQueries.UpdatePendingStudentsById(inscriptionId, { token: hashedToken, expiredToken: false });
        const fee = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(student.levelAsked, student.field)
        if (student.expiredToken === true) {
            return res.status(400).send("Le token a déjà été utilisé. il ne peut pas être renvoyé.")
        }
        if (!fee) {
            return res.status(500).send(`Veuillez configurer les frais de scolarite pour ${student.field} ${student.levelAsked} `)
        }

        await SendMailForAdmission(student.email, `${student.firstName} ${student.lastName}`, student.inscriptionId, student.field, token, fee.fees, fee.level, fee.echeances)
        res.sendStatus(200);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        res.status(500).send("Une erreur s'est produite lors de l'envoi de l'email.");
    }
});

router.post("/confirmation/:inscriptionId", loginLimiter, async (req, res) => {
    const session = await mongoose.startSession();

    let tempUploadPath = null;
    let compressedPath = null;

    try {
        // ===============================
        // 🔵 PHASE 1 — TRANSACTION MONGO
        // ===============================
        session.startTransaction();

        // 1️⃣ Upload fichier (optionnel)
        await new Promise((resolve, reject) => {
            uploadProof(req, res, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        if (req.file) {
            tempUploadPath = req.file.path;
        }

        // 2️⃣ Vérifier unicité transactionRef
        const exists = await TutionFeesQueries.GetTutionByRef(
            req.body.transactionRef,
            session
        );

        if (exists) {
            throw new Error("TRANSACTION_REF_EXISTS");
        }

        // 3️⃣ Générer matricule
        const matricule = await generateMatriculeNumber("ETU", session);

        // 4️⃣ Créer l’étudiant (DB ONLY)
        const user = await UserQueries.CreateStudent(
            matricule,
            req.params.inscriptionId,
            req.body,
            session
        );
        // user = { _id, email, password, field }

        // 5️⃣ Créer frais de scolarité
        const tuition = await TutionFeesQueries.CreateFeesWithSession(
            user._id,
            req.body,
            session
        );

        // 6️⃣ Mettre à jour l’échéance (SANS fichier)
        await TutionFeesQueries.updateInstallmentByLabel(
            tuition._id,
            req.body.label,
            {
                method: req.body.method,
                proofFile: null,
                transactionRef: req.body.transactionRef,
                paymentDate: new Date()
            },
            session
        );

        // 7️⃣ Invalider le pending student (DANS la transaction)
        await pendingStudentsQueries.UpdatePendingStudentsById(
            req.params.inscriptionId,
            { expiredToken: true },
            session
        );

        // 8️⃣ COMMIT
        await session.commitTransaction();
        session.endSession();

        // ======================================================
        // 🟢 PHASE 2 — FILESYSTEM (APRÈS COMMIT)
        // ======================================================

        /* ----------------------------------------------------
           A) Déplacement des fichiers d’inscription
           ---------------------------------------------------- */
        try {
            const originalDir = path.join(
                __dirname,
                "..",
                "private",
                "inscription",
                user.field,
                req.params.inscriptionId
            );

            const destDir = path.join(
                __dirname,
                "..",
                "private",
                "user",
                matricule,
                "info"
            );

            const sourceExists = await fsPromises
                .stat(originalDir)
                .then(() => true)
                .catch(() => false);

            if (sourceExists) {
                // utilitaire safe : cp + rm
                await moveDirSafe(originalDir, destDir);

                // 🔁 Mise à jour des chemins fichiers dans Student
                const updates = {};
                const files = await fsPromises.readdir(destDir, { withFileTypes: true });

                for (const file of files) {
                    if (!file.isFile()) continue;

                    const abs = path.join(destDir, file.name);
                    const rel = path.relative("private", abs);

                    if (file.name.startsWith("identityPhoto")) updates.identityPhoto = rel;
                    if (file.name.startsWith("bacTranscript")) updates.bacTranscript = rel;
                    if (file.name.startsWith("idDocument")) updates.idDocument = rel;
                    if (file.name.startsWith("residenceCertificate")) updates.residenceCertificate = rel;
                }

                if (Object.keys(updates).length > 0) {
                    await Student.findByIdAndUpdate(user._id, updates);
                }
            }
        } catch (fsErr) {
            console.error("⚠️ Erreur fichiers inscription post-commit:", fsErr.message);
            // DB OK → réparation manuelle ou job async possible
        }

        /* ----------------------------------------------------
           B) Fichier de paiement (proofFile)
           ---------------------------------------------------- */
        if (tempUploadPath) {
            try {
                const finalDir = createFileDirectoryUserProof(matricule);
                await fsPromises.mkdir(finalDir, { recursive: true });

                const finalFilePath = path.join(
                    finalDir,
                    path.basename(tempUploadPath)
                );

                // Windows-safe
                await fsPromises.copyFile(tempUploadPath, finalFilePath);
                await fsPromises.unlink(tempUploadPath);

                compressedPath = finalFilePath.replace(
                    path.extname(finalFilePath),
                    ".webp"
                );

                await compressImage(finalFilePath, compressedPath);

                await TutionFeesQueries.updateInstallmentProof(
                    tuition._id,
                    req.body.label,
                    path.relative("private", compressedPath)
                );
            } catch (proofErr) {
                console.error("⚠️ Erreur fichier proof post-commit:", proofErr.message);
            }
        }

        // 9️⃣ Réponse OK
        res.status(200).json({
            matricule,
            password: user.password
        });

        await SendMailForSuccessAdmission(user.email, matricule, user.password);

    } catch (error) {
        // ❌ Rollback Mongo UNIQUEMENT
        try {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
        } catch (abortError) {
            console.error("Erreur abortTransaction:", abortError.message);
        } finally {
            session.endSession();
        }

        // 🧹 Nettoyage fichier TEMP seulement
        try {
            if (tempUploadPath && await fileExists(tempUploadPath)) {
                await fsPromises.unlink(tempUploadPath);
            }
        } catch (fsError) {
            console.error("Erreur nettoyage fichier temp:", fsError.message);
        }

        console.error("❌ Erreur confirmation inscription:", error);

        if (error.message === "TRANSACTION_REF_EXISTS") {
            return res.status(400).send(
                "Ce numéro de transaction a déjà été utilisé."
            );
        }

        res.status(500).send(
            "Une erreur est survenue. Merci de réessayer plus tard."
        );
    }
});

const puppeteer = require('puppeteer');
const qrcode = require('qrcode');
const documentRouter = require('./document.routes');
const { error } = require('console');
const { moveDirSafe } = require('../utils/moveDirSafe');
const Student = require('../models/student.model');


// Fonction pour convertir une image en base64
async function imageToBase64(imagePath) {
    try {
        const absolutePath = path.join(__dirname, '..', 'private', imagePath);
        const imageBuffer = await fsPromises.readFile(absolutePath);
        const base64 = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();

        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error(`Erreur lors de la conversion de l'image ${imagePath}:`, error);
        return null;
    }
}

router.get('/registrationForm/:inscriptionId', isAdminAndSuperAdmin, async (req, res) => {
    try {
        const student = await pendingStudentsQueries.getStudentById(req.params.inscriptionId);
        if (!student) {
            return res.status(404).send("Étudiant non trouvé");
        }
        const studentObject = student
        studentObject.cin = decryptCIN(studentObject.cin);
        studentObject.phone = "+261" + studentObject.phone;
        studentObject.emergencyContactPhone = "+261" + studentObject.emergencyContactPhone;

        // Compresser et convertir les images en base64 pour Puppeteer
        if (studentObject.identityPhoto) {
            studentObject.identityPhotoUrl = await compressAndBase64(studentObject.identityPhoto, { width: 400, quality: 80 });
        }
        if (studentObject.idDocument) {
            studentObject.idDocumentUrl = await compressAndBase64(studentObject.idDocument, { width: 600, quality: 75 });
        }
        if (studentObject.residenceCertificate) {
            studentObject.residenceCertificateUrl = await compressAndBase64(studentObject.residenceCertificate, { width: 600, quality: 75 });
        }
        if (studentObject.bacTranscript) {
            studentObject.bacTranscriptUrl = await compressAndBase64(studentObject.bacTranscript, { width: 600, quality: 75 });
        }

        // Convertir le logo en base64 (PNG, pas compressé)
        try {
            const logoPath = path.join(__dirname, '..', 'public', 'logo-write.png');
            const logoBuffer = await fsPromises.readFile(logoPath);
            studentObject.logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } catch (error) {
            console.error('Erreur lors du chargement du logo:', error);
            studentObject.logoUrl = null;
        }

        const data = `http://localhost:5173/admin/pre-inscription/pending-user/${studentObject.inscriptionId}`;
        const qrCodeDataURL = await qrcode.toDataURL(data, { errorCorrectionLevel: 'H', type: 'image/png', width: 200 });
        studentObject.qrCode = qrCodeDataURL;

        const templatePath = path.join(__dirname, '../views/StudentRegistrationForm.ejs');
        const html = await ejs.renderFile(templatePath, { student: studentObject, qrCode: qrCodeDataURL });

        // Configuration Puppeteer avec headless et timeout augmenté
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Augmenter le timeout de navigation
        page.setDefaultNavigationTimeout(60000); // 60 secondes

        // Charger le HTML avec un timeout plus long
        await page.setContent(html, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Attendre que toutes les images soient chargées (compatible avec toutes versions de Puppeteer)
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );
        });

        // Attendre encore un peu pour être sûr
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Générer le PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '0.5cm',
                right: '0.5cm',
                bottom: '0.5cm',
                left: '0.5cm'
            }
        });

        await browser.close();

        // Envoyer le PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=registration-form-${studentObject.inscriptionId}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erreur lors de la génération du PDF :", error);
        await browser.close();
        // Ne pas envoyer de réponse si les headers ont déjà été envoyés
        if (!res.headersSent) {
            res.status(500).send("Une erreur est survenue lors de la génération du PDF. Merci de réessayer plus tard ou de contacter le service de la scolarité si le problème persiste.");
        }
    }
});

module.exports = router;
