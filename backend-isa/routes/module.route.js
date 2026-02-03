const ModuleQueries = require('../queries/Module.queries');
const ProfessorQueries = require('../queries/Professor.queries');
const ReportQueries = require('../queries/Report.queries');
const TeachingUnitQueries = require('../queries/TeachingUnit.queries');
const mongoose = require("mongoose");
const router = require('express').Router()
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');
const crypto = require('crypto');
const getDiff = require('../function/getDiff');
const promotionQueries = require('../queries/promotion.queries');
const scheduleQueries = require('../queries/schedule.queries');
const { isAdminAndSuperAdmin } = require('../middleware/AdminVerification');
const { isConnectedMiddleware, isStudentMiddleware } = require('../middleware/middleware.global');

// Configuration sécurisée Multer (PDF uniquement, 0 à 5 fichiers)
const allowedMimeTypes = new Set(['application/pdf']);
const materialsRootDir = path.join(__dirname, '..', 'private', 'module-materials');
const tempUploadDir = path.join(materialsRootDir, '_tmp');

function sanitizeCode(input) {
    return String(input || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '_');
}

function sanitizePdfName(original) {
    // Conserver le nom du fichier d'origine (sans chemin), retirer caractères dangereux
    let base = path.basename(String(original || 'document.pdf')).replace(/[\\/]/g, '');
    base = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Forcer l'extension .pdf
    if (!/\.pdf$/i.test(base)) {
        base = base.replace(/\.[^\.]+$/, '');
        base = `${base}.pdf`;
    }
    // Normaliser l'extension en minuscule
    if (/\.PDF$/.test(base)) {
        base = base.replace(/\.PDF$/, '.pdf');
    }
    return base;
}

async function ensureUniqueFilename(dir, filename) {
    const ext = path.extname(filename);
    const name = path.basename(filename, ext);
    let candidate = filename;
    let counter = 1;
    while (true) {
        try {
            await fsPromises.access(path.join(dir, candidate));
            // existe déjà, essayer un autre
            candidate = `${name}-${counter}${ext}`;
            counter += 1;
        } catch {
            // n'existe pas
            return candidate;
        }
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdir(tempUploadDir, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, tempUploadDir);
        });
    },
    filename: (req, file, cb) => {
        const safeOriginal = sanitizePdfName(file.originalname);
        cb(null, safeOriginal);
    }
});

const uploadModulePdfs = multer({
    storage,
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new Error('Seuls les fichiers PDF sont autorisés.'));
        }
        cb(null, true);
    }
}).array('files', 5);

router.get("/admin/UE/:UE/:field", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { UE, field } = req.params
        const teachingUnit = await TeachingUnitQueries.getTeachingUnitByCode(UE);
        if (!teachingUnit) {
            return res.status(404).send("Unité d'enseignement introuvable");
        }
        const modules = await ModuleQueries.GetModulesByTeachingUnit(teachingUnit._id);
        const professors = await ProfessorQueries.getProfessorByDepartment(field);
        res.status(200).json({
            teachingUnit,
            modules,
            professors
        })

    } catch (error) {
        console.log(error);

        res.sendStatus(500)
    }
})


router.post("/admin/UE/:teachingUnit", isAdminAndSuperAdmin, async (req, res) => {
    // Étape 1: upload des PDFs (0 à 5) via Multer (en dossier temporaire)
    uploadModulePdfs(req, res, async (err) => {
        if (err) {
            if (req.files && Array.isArray(req.files)) {
                await Promise.all(req.files.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('Chaque fichier PDF doit être ≤ 5 Mo.');
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send('Nombre maximum de fichiers dépassé (5).');
            }
            return res.status(400).send(err.message || 'Erreur lors du téléversement des PDF.');
        }

        const files = req.files || [];
        // 0 fichier est accepté
        if (files.length > 5) {
            await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
            return res.status(400).send('Nombre maximum de fichiers dépassé (5).');
        }

        // Étape 1.5: valider données (code, crédits) et capacité de l'UE
        const rawCode = req.body?.code;
        if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
            await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
            return res.status(400).send('Le champ "code" du module est requis.');
        }
        // Valider crédits et capacité de l'UE
        const newCredits = Number(req.body?.credits);
        if (!Number.isFinite(newCredits) || newCredits < 0) {
            await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
            return res.status(400).send('Le champ "credits" est requis et doit être un nombre positif.');
        }
        try {
            const tu = await TeachingUnitQueries.getTeachingUnitById(req.params.teachingUnit);
            if (!tu) {
                await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
                return res.status(404).send("Unité d'enseignement introuvable");
            }
            const existingModules = await ModuleQueries.GetModulesByTeachingUnit(tu._id);
            const used = existingModules.reduce((acc, m) => acc + (Number(m.credits) || 0), 0);
            if (used + newCredits > (Number(tu.credits) || 0)) {
                await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
                return res.status(400).send(`Crédits UE dépassés: utilisés ${used}, ajout ${newCredits}, maximum ${tu.credits}.`);
            }
        } catch (e) {
            await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
            return res.status(500).send("Erreur lors de la vérification des crédits de l'UE.");
        }
        const safeCode = sanitizeCode(rawCode); // ex: INF_02 -> inf_02
        let finalDir;
        if (files.length > 0) {
            finalDir = path.join(materialsRootDir, safeCode);
            try {
                await fsPromises.mkdir(finalDir, { recursive: true });
            } catch (mkErr) {
                await Promise.all(files.map(f => fsPromises.unlink(f.path).catch(() => { })));
                return res.status(500).send('Impossible de créer le dossier du module.');
            }
        }

        // Étape 2: déplacer les fichiers du tmp vers le dossier du module en conservant les noms
        let movedFiles = [];
        if (files.length > 0) {
            try {
                for (const f of files) {
                    const desiredName = sanitizePdfName(f.originalname);
                    const uniqueName = await ensureUniqueFilename(finalDir, desiredName);
                    const targetPath = path.join(finalDir, uniqueName);
                    await fsPromises.rename(f.path, targetPath);
                    movedFiles.push(targetPath);
                }
            } catch (moveErr) {
                // Nettoyer: supprimer ce qui a été déplacé et ce qui reste en tmp
                await Promise.all([
                    ...movedFiles.map(p => fsPromises.unlink(p).catch(() => { })),
                    ...files.map(f => fsPromises.unlink(f.path).catch(() => { }))
                ]);
                return res.status(500).send('Erreur lors du placement des fichiers du module.');
            }
        }

        // Étape 3: transaction DB pour créer le module avec les liens des fichiers
        const session = await mongoose.startSession();
        session.startTransaction();
        try {


            const privateRoot = path.join(__dirname, '..', 'private');
            const filePaths = movedFiles.slice(0, 5).map(p => path.relative(privateRoot, p));


            const payload = {
                ...req.body,
                code: req.body.code.toLowerCase(),
                teacher: req.body.teacher === '' ? null : req.body.teacher,
                teachingUnit: req.params.teachingUnit,
                files: filePaths

            };
            const moduleExist = await ModuleQueries.getModuleByCode(req.body.code);
            if (moduleExist) {
                console.log(moduleExist);

                throw new Error('Un module avec ce code existe déjà.');
            }

            const moduleCreated = await ModuleQueries.CreateModule(payload, session);

            const report = {
                authorId: req.session?.matricule,
                authorName: req.session?.fullName,
                action: `Création d'un module (ID : ${moduleCreated._id})`,
                details: `Le module a été créé avec succès avec ${filePaths.length} PDF(s).`,
                role: req.session?.role
            };
            await ReportQueries.CreateReport(report, session);

            await session.commitTransaction();
            session.endSession();

            return res.status(201).json(moduleCreated);
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            // Nettoyage des fichiers déjà déplacés si la transaction échoue
            await Promise.all(movedFiles.map(p => fsPromises.unlink(p).catch(() => { })));
            // Nettoyage dossier si vide
            try {
                const left = await fsPromises.readdir(finalDir);
                if (left.length === 0) await fsPromises.rmdir(finalDir).catch(() => { });
            } catch { }
            return res.status(500).send(error.message);
        }
    });
})

router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        const deletedModule = await ModuleQueries.DeleteModule(req.params.id, session);
        await session.commitTransaction();


        const report = {
            authorId: req.session?.matricule,
            authorName: req.session?.fullName,
            action: `Suppression d'un module (code : ${deletedModule.code})`,
            details: `Le module ${deletedModule.code} intitule ${deletedModule.title} a été supprimé .`,
            role: req.session?.role
        };
        await ReportQueries.CreateReport(report, session);

        return res.status(200).json(deletedModule);
    } catch (error) {
        await session.abortTransaction();
        return res.status(500).send(error.message);
    } finally {
        session.endSession();
    }
});


router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
    // On réutilise Multer (PDF uniquement, 0–5 fichiers)
    uploadModulePdfs(req, res, async (err) => {
        // Gestion des erreurs Multer
        if (err) {
            if (req.files && Array.isArray(req.files)) {
                await Promise.all(req.files.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('Chaque fichier PDF doit être ≤ 5 Mo.');
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send('Nombre maximum de fichiers dépassé (5).');
            }
            return res.status(400).send(err.message || 'Erreur lors du téléversement des PDF.');
        }

        const tmpFiles = Array.isArray(req.files) ? req.files : [];
        if (tmpFiles.length > 5) {
            await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
            return res.status(400).send('Nombre maximum de fichiers dépassé (5).');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const privateRoot = path.join(__dirname, '..', 'private');

        // Pour nettoyage/rollback
        const movedNewFilesAbs = [];     // nouveaux fichiers déplacés vers le dossier du module
        const rollbackMovedExisting = []; // [{fromAbs, toAbs}] si fusion dossier (code changé et les 2 dossiers existent)
        let didRenameDir = false;
        let oldDir, newDir, safeOldCode, safeNewCode;

        try {
            // Charger le module avant modification
            const oldUnit = await ModuleQueries.getModuleById(req.params.id);
            if (!oldUnit) {
                await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                await session.abortTransaction();
                session.endSession();
                return res.status(404).send('Module introuvable.');
            }

            // Déterminer le code cible (stocké en DB en minuscule)
            const bodyCodeRaw = typeof req.body?.code === 'string' ? req.body.code.trim() : oldUnit.code;
            const nextCodeDb = (bodyCodeRaw || oldUnit.code).toLowerCase();

            // Vérifier unicité du code si modifié
            if (nextCodeDb !== oldUnit.code) {
                const conflict = await ModuleQueries.getModuleByCode(nextCodeDb);
                if (conflict && String(conflict._id) !== String(oldUnit._id)) {
                    await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).send('Un module avec ce code existe déjà.');
                }
            }

            // Vérifier crédits et capacité de l'UE cible
            const targetTeachingUnitId = req.body?.teachingUnit || oldUnit.teachingUnit;
            const newCredits = req.body?.credits !== undefined ? Number(req.body.credits) : Number(oldUnit.credits);
            if (!Number.isFinite(newCredits) || newCredits < 0) {
                await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send('Le champ "credits" doit être un nombre positif.');
            }
            try {
                const tu = await TeachingUnitQueries.getTeachingUnitById(targetTeachingUnitId);
                if (!tu) {
                    await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(404).send("Unité d'enseignement introuvable");
                }
                const existingModules = await ModuleQueries.GetModulesByTeachingUnit(tu._id);
                const usedWithoutCurrent = existingModules
                    .filter(m => String(m._id) !== String(oldUnit._id))
                    .reduce((acc, m) => acc + (Number(m.credits) || 0), 0);
                if (usedWithoutCurrent + newCredits > (Number(tu.credits) || 0)) {
                    await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).send(`Crédits UE dépassés: utilisés ${usedWithoutCurrent}, nouveau ${newCredits}, maximum ${tu.credits}.`);
                }
            } catch (e) {
                await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));
                await session.abortTransaction();
                session.endSession();
                return res.status(500).send("Erreur lors de la vérification des crédits de l'UE.");
            }

            // Préparer les dossiers (un module = un dossier sous code normalisé)
            safeOldCode = sanitizeCode(oldUnit.code);
            safeNewCode = sanitizeCode(nextCodeDb);
            oldDir = path.join(materialsRootDir, safeOldCode);
            newDir = path.join(materialsRootDir, safeNewCode);

            // Créer le dossier cible si nouveaux fichiers
            if (tmpFiles.length > 0) {
                await fsPromises.mkdir(newDir, { recursive: true });
            }

            // Si code change, gérer dossier (rename/fusion)
            const codeChanged = safeNewCode !== safeOldCode;
            const mapOldRelToNewRel = new Map();

            if (codeChanged) {
                const oldDirExists = await fsPromises.access(oldDir).then(() => true).catch(() => false);
                const newDirExists = await fsPromises.access(newDir).then(() => true).catch(() => false);

                if (oldDirExists && !newDirExists) {
                    await fsPromises.mkdir(path.dirname(newDir), { recursive: true });
                    await fsPromises.rename(oldDir, newDir);
                    didRenameDir = true;
                } else if (oldDirExists && newDirExists) {
                    const entries = await fsPromises.readdir(oldDir, { withFileTypes: true });
                    for (const ent of entries) {
                        if (!ent.isFile()) continue;
                        const fromAbs = path.join(oldDir, ent.name);
                        const uniqueName = await ensureUniqueFilename(newDir, ent.name);
                        const toAbs = path.join(newDir, uniqueName);
                        await fsPromises.rename(fromAbs, toAbs);
                        rollbackMovedExisting.push({ fromAbs: toAbs, toAbs: path.join(oldDir, ent.name) });
                        const oldRel = path.relative(privateRoot, path.join(oldDir, ent.name));
                        const newRel = path.relative(privateRoot, toAbs);
                        mapOldRelToNewRel.set(oldRel.replace(/\\/g, '/'), newRel.replace(/\\/g, '/'));
                    }
                    await fsPromises.rmdir(oldDir).catch(() => { });
                } else {
                    if (!newDirExists) {
                        await fsPromises.mkdir(newDir, { recursive: true });
                    }
                }
            }

            // Déplacer les nouveaux fichiers du _tmp vers le dossier final
            const newUploadedRelPaths = [];
            for (const f of tmpFiles) {
                const desiredName = sanitizePdfName(f.originalname);
                const uniqueName = await ensureUniqueFilename(newDir, desiredName);
                const finalAbs = path.join(newDir, uniqueName);
                await fsPromises.rename(f.path, finalAbs);
                movedNewFilesAbs.push(finalAbs);
                const rel = path.relative(privateRoot, finalAbs).replace(/\\/g, '/');
                newUploadedRelPaths.push(rel);
            }

            // Construire la nouvelle liste files (max 5)
            const currentFiles = Array.isArray(oldUnit.files) ? oldUnit.files.slice() : [];
            let remappedFiles = currentFiles;

            if (codeChanged) {
                if (didRenameDir) {
                    // Dossier renommé en bloc: rebaser sur basename
                    remappedFiles = currentFiles.map(p => {
                        const base = path.basename(p);
                        return path.join('module-materials', safeNewCode, base).replace(/\\/g, '/');
                    });
                } else if (mapOldRelToNewRel.size > 0) {
                    remappedFiles = currentFiles.map(p => {
                        const key = p.replace(/\\/g, '/');
                        return mapOldRelToNewRel.get(key) || path.join('module-materials', safeNewCode, path.basename(p)).replace(/\\/g, '/');
                    });
                } else {
                    remappedFiles = currentFiles.map(p => path.join('module-materials', safeNewCode, path.basename(p)).replace(/\\/g, '/'));
                }
            }

            // Merge + déduplication
            let merged = [...remappedFiles, ...newUploadedRelPaths];
            const seen = new Set();
            merged = merged.filter(p => {
                const key = p.replace(/\\/g, '/');
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });

            // Si > 5, supprimer physiquement l'excédent (priorité: nouveaux)
            if (merged.length > 5) {
                const overflow = merged.length - 5;
                const removeList = [];
                for (let i = merged.length - 1; i >= 0 && removeList.length < overflow; i--) {
                    const rel = merged[i].replace(/\\/g, '/');
                    if (newUploadedRelPaths.includes(rel)) removeList.push(rel);
                }
                for (let i = merged.length - 1; i >= 0 && removeList.length < overflow; i--) {
                    const rel = merged[i].replace(/\\/g, '/');
                    if (!removeList.includes(rel)) removeList.push(rel);
                }
                for (const rel of removeList) {
                    const abs = path.join(privateRoot, rel);
                    await fsPromises.unlink(abs).catch(() => { });
                    const idxAbs = movedNewFilesAbs.indexOf(abs);
                    if (idxAbs >= 0) movedNewFilesAbs.splice(idxAbs, 1);
                }
                merged = merged.slice(0, 5);
            }

            // Construire l'update
            const updatePayload = {
                ...req.body,
                code: nextCodeDb,
                teacher: req.body.teacher === '' ? null : req.body.teacher,
                files: merged
            };

            // Exécuter la mise à jour
            const updatedModule = await ModuleQueries.UpdateModule(req.params.id, updatePayload, session);

            // Diff pour le report
            const changes = getDiff(oldUnit.toObject ? oldUnit.toObject() : oldUnit, updatedModule.toObject ? updatedModule.toObject() : updatedModule);

            const report = {
                authorId: req.session?.matricule,
                authorName: req.session?.fullName,
                action: `Mise à jour d'un module (code : ${updatedModule.code})`,
                details: JSON.stringify({
                    changes,
                    uploadedPdfs: newUploadedRelPaths.length,
                    codeChanged: safeNewCode !== safeOldCode ? { from: oldUnit.code, to: nextCodeDb } : false
                }, null, 2),
                role: req.session?.role
            };
            await ReportQueries.CreateReport(report, session);

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json(updatedModule);
        } catch (error) {
            await session.abortTransaction().catch(() => { });
            session.endSession();

            // Nettoyage des nouveaux fichiers déplacés
            await Promise.all(movedNewFilesAbs.map(p => fsPromises.unlink(p).catch(() => { })));
            // Nettoyage des fichiers restés en _tmp
            await Promise.all(tmpFiles.map(f => f?.path && fsPromises.unlink(f.path).catch(() => { })));

            // Rollback du renommage de dossier si effectué
            if (didRenameDir && oldDir && newDir) {
                const newExists = await fsPromises.access(newDir).then(() => true).catch(() => false);
                const oldExists = await fsPromises.access(oldDir).then(() => true).catch(() => false);
                if (newExists && !oldExists) {
                    await fsPromises.rename(newDir, oldDir).catch(() => { });
                }
            }
            // Rollback des déplacements individuels (fusion)
            if (rollbackMovedExisting.length > 0) {
                for (const { fromAbs, toAbs } of rollbackMovedExisting.reverse()) {
                    await fsPromises.rename(fromAbs, toAbs).catch(() => { });
                }
            }

            console.error(error);
            return res.status(500).send(error.message || 'Erreur lors de la mise à jour du module.');
        }
    });
});


router.delete("/admin/file/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const response = await ModuleQueries.DeleteFile(req.body.path, id, session);
        const fileName = path.basename(req.body.path);
        const report = {
            authorId: req.session?.matricule,
            authorName: req.session?.fullName,
            action: `Suppression d'un fichier d'un module (Code matière : ${response.code})`,
            details: `Le fichier ${fileName} a été supprimé du module ${response.code}.`,
            role: req.session?.role
        };
        await ReportQueries.CreateReport(report, session);
        await session.commitTransaction();
        session.endSession()

        return res.status(200).json(response);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.sendStatus(500);
    }
})

router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const deletedModule = await ModuleQueries.DeleteModule(id, session);


        const report = {
            authorId: req.session?.matricule,
            authorName: req.session?.fullName,
            action: `Suppression d'un module (code : ${deletedModule.code})`,
            details: `Le module ${deletedModule.code} intitule ${deletedModule.title} a été supprimé .`,
            role: req.session?.role
        };

        await ReportQueries.CreateReport(report, session);

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(deletedModule);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        return res.status(500).send(error.message || 'Erreur lors de la suppression du module.');
    }
})


router.get("/professor/:professorId", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const modules = await ModuleQueries.GetModulesByProfessor(req.params.professorId);
        res.status(200).json(modules)
    } catch (error) {
        console.log(error);
        res.status(500).send("Erreur serveur");
    }
})


router.get("/all", isConnectedMiddleware, async (req, res) => {
    try {
        const modules = await ModuleQueries.GetAllModules();
        res.status(200).json(modules);
    } catch (error) {
        console.log(error);
        res.status(500).send("Erreur serveur");
    }
})


router.get("/progression/:professorId", isConnectedMiddleware, async (req, res) => {
    try {
        const { professorId } = req.params
        console.log(professorId !== req.session._id.toString(), req.session.role);
        if (
            professorId !== req.session._id.toString() &&
            req.session.role !== 'admin' &&
            req.session.role !== 'superAdmin'
        ) {
            return res.status(403).send("Accès refusé");
        }


        const promotionIds = await promotionQueries.GetAllActivePromotionsIdForCurrentYear()

        const restructuredPromotionIds = promotionIds.map((s) => s._id)


        const modules = await scheduleQueries.getProfProgression(restructuredPromotionIds, professorId);


        return res.status(200).json(modules)
    } catch (error) {
        console.log(error);

    }
})

router.get("/progression/student/:promotionId/:semester", isStudentMiddleware, async (req, res) => {
    try {
        const { promotionId, semester } = req.params

        const modules = await scheduleQueries.getPromotionProgression(promotionId, { semester });

        return res.status(200).json(modules)
    } catch (error) {
        console.log(error);

    }
})

router.get("/by-id/:id", isConnectedMiddleware, async (req, res) => {
    try {
        const module = await ModuleQueries.getModuleById(req.params.id);
        res.status(200).json(module);
    } catch (error) {
        console.log(error);
        res.status(500).send("Erreur serveur");
    }
});


router.get("/by-teaching-unit/:teachingUnitId", async (req, res) => {
    try {
        const modules = await ModuleQueries.GetModulesByTeachingUnitWithoutPopulateAndFiles(req.params.teachingUnitId);
        res.status(200).json(modules);
    } catch (error) {
        console.log(error);
        res.status(500).send("Erreur serveur");
    }
});

module.exports = router