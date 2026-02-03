const assignmentQueries = require('../queries/assignment.queries');
const submissionQueries = require('../queries/submission.queries');
const xlsx = require('xlsx');
const router = require('express').Router()
const ModuleQueries = require('../queries/Module.queries');
const promotionQueries = require('../queries/promotion.queries');
const StudentQueries = require('../queries/Student.queries');
const gradesAuthenticationQueries = require('../queries/grades-authentication.queries');
const { hashToken } = require('../function/HashToken');
const { isProfessorMiddleware, isStudentMiddleware, isRestrictedMiddleware } = require('../middleware/middleware.global');
const { isAdminAndSuperAdmin } = require('../middleware/AdminVerification');


router.get("/promotion/:promotionId/assignment/:assignmentId", isProfessorMiddleware, async (req, res) => {
    try {
        const { promotionId, assignmentId } = req.params

        const assignmentData = await assignmentQueries.getAssignmentById(assignmentId);
        if (!assignmentData.isActive) {
            return res.status(400).send("Le devoir est inactif, vous ne pouvez pas corriger .");
        }

        const { assignment, results } = await submissionQueries.getSubmissionByAssignmentAndPromotions(assignmentId, promotionId)

        res.status(200).json({ assignment, results });
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des soumissions');
    }
})

router.post("/in-person/professor", isProfessorMiddleware, async (req, res) => {
    try {
        const data = req.body


        const allowedFields = ['student', 'assignment', 'grade', 'feedback'];
        const dataFields = Object.keys(data);
        for (const field of dataFields) {
            if (!allowedFields.includes(field)) {
                return res.status(400).send(`Champ invalide: ${field}`);
            }
        }


        if (data.grade !== undefined && data.grade !== null) {
            data.status = 'graded';
        } else {
            return res.status(400).send("La note est requise pour une soumission en présentiel");
        }
        const assignment = await assignmentQueries.getAssignmentById(data.assignment);

        if (!assignment) {
            return res.status(400).send("Devoir invalide");
        }

        if (assignment.lockedGrade) {
            return res.status(400).send("Le devoir est verrouillé , vous ne pouvez plus modifier ou ajouter des notes");
        }

        const submission = await submissionQueries.CreateSubmission(data);
        res.status(201).json(submission);
    } catch (error) {
        console.log(error);

        res.status(500).send('Erreur lors de la création de la soumission');
    }
})



router.patch("/:id/in-person/professor", isProfessorMiddleware, async (req, res) => {
    try {
        const { id } = req.params
        const data = req.body
        const { assignment, ...rest } = data

        const allowedFields = ['grade', 'status', 'feedback'];
        const updateData = {};
        for (const field of allowedFields) {
            if (rest.hasOwnProperty(field)) {
                updateData[field] = rest[field];
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send("Aucun champ valide à mettre à jour");
        }

        const assignmentData = await assignmentQueries.getAssignmentById(assignment);

        if (assignmentData.lockedGrade) {
            return res.status(400).send("Le devoir est verrouillé , vous ne pouvez plus modifier ou ajouter des notes");
        }

        const submission = await submissionQueries.updateSubmission(id, rest)
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).send('Erreur lors de la mise à jour de la soumission');
    }
})


router.patch("/:id/professor", isProfessorMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { assignment, student, ...rest } = data;




        // Validation : seuls grade, status, feedback sont autorisés pour la mise à jour
        const allowedFields = ['grade', 'status', 'feedback'];
        const updateData = {};
        for (const field of allowedFields) {
            if (rest.hasOwnProperty(field)) {
                updateData[field] = rest[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send("Aucun champ valide à mettre à jour");
        }

        // Vérifier que l'assignment existe et n'est pas verrouillé
        if (!assignment) {
            return res.status(400).send("L'ID du devoir est requis");
        }

        const assignmentData = await assignmentQueries.getAssignmentById(assignment);
        if (!assignmentData) {
            return res.status(404).send("Devoir non trouvé");
        }

        if (assignmentData.lockedGrade) {
            return res.status(400).send("Le devoir est verrouillé, vous ne pouvez plus modifier ou ajouter des notes");
        }

        let submission = null;

        // CAS 1: ID invalide (pas une soumission existante) → Créer une nouvelle soumission
        if (!id || id.length !== 24) {
            // Pour créer une soumission, on a besoin de student + assignment
            if (!student) {
                return res.status(400).send("L'ID de l'étudiant est requis pour créer une soumission");
            }

            // Vérifier que l'échéance est passée avant de permettre la création d'une soumission
            const now = new Date();
            const dueDate = new Date(assignmentData.dueDate);
            if (now <= dueDate) {
                return res.status(400).send("Vous ne pouvez noter un devoir non soumis qu'après l'échéance");
            }

            // Vérifier si une soumission existe déjà pour cet étudiant et ce devoir
            const existingSubmission = await submissionQueries.getSubmissionByStudentAndAssignment(student, assignment);
            if (existingSubmission) {
                return res.status(400).send("Une soumission existe déjà pour cet étudiant. Utilisez son ID pour la modifier.");
            }

            // Créer la soumission avec les bonnes données
            const submissionData = {
                student: student,
                assignment: assignment,
                grade: updateData.grade,
                feedback: updateData.feedback || '',
                status: updateData.status || 'graded', // Si le prof note, c'est 'graded'
                submittedAt: new Date() // Date de notation
            };

            submission = await submissionQueries.CreateSubmission(submissionData);
        }
        // CAS 2: ID valide → Mettre à jour la soumission existante
        else {
            // Vérifier que la soumission existe
            const existingSubmission = await submissionQueries.getSubmissionById(id);
            if (!existingSubmission) {
                return res.status(404).send("Soumission non trouvée");
            }

            // Vérifier que la soumission correspond bien à l'assignment
            if (existingSubmission.assignment.toString() !== assignment.toString()) {
                return res.status(400).send("Cette soumission n'appartient pas au devoir spécifié");
            }

            const submissionData = {
                ...updateData,
                status: 'graded'
            }


            // Mettre à jour avec les données validées (updateData, pas rest)
            submission = await submissionQueries.updateSubmission(id, submissionData);
        }

        res.status(200).json(submission);
    } catch (error) {
        console.error('Erreur lors de la mise à jour/création de la soumission:', error);
        res.status(500).send('Erreur lors de la mise à jour de la soumission');
    }
})


router.get("/promotion/:promotionId/assignment/:assignmentId/export", isProfessorMiddleware, async (req, res) => {
    try {
        const { promotionId, assignmentId } = req.params;

        // Récupération des soumissions
        const { assignment, results } = await submissionQueries.getSubmissionByAssignmentAndPromotions(
            assignmentId,
            promotionId
        );

        if (!results || results.length === 0) {
            return res.status(404).send("Aucune soumission trouvée pour ce devoir dans la promotion spécifiée");
        }

        // Préparer les données
        const worksheetData = results.map((result) => ({
            "Matricule de l'étudiant": result?.matricule || "N/A",
            "Nom de l'étudiant": result?.firstName && result?.name ? `${result.firstName} ${result.name}` : "N/A",
            "Email de l'étudiant": result?.email || "N/A",
            "Note": result?.submission?.grade ?? "N/A",
        }));

        // Création du workbook en mémoire
        const worksheet = xlsx.utils.json_to_sheet(worksheetData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Soumissions");

        // Convertir en buffer directement (sans passer par le disque)
        const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Définir les bons headers HTTP
        res.setHeader("Content-Disposition", `attachment; filename="${assignment.title}_submissions.xlsx"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        // Envoyer le fichier en réponse
        res.send(buffer);

    } catch (error) {
        console.error("Erreur export soumissions:", error);
        res.status(500).send("Erreur lors de l'exportation des soumissions");
    }
});

router.get("/grades/:moduleId", isProfessorMiddleware, async (req, res) => {
    try {
        const { moduleId } = req.params;

        const module = await ModuleQueries.getModuleByIdWiTeachingUnit(moduleId);

        if (!module) {
            return res.status(400).send("Module invalide");
        }
        const promotion = await promotionQueries.GetActivePromotionsForCurrentYear(module.teachingUnit.field, module.teachingUnit.level);
        if (!promotion) {
            return res.status(404).send("Aucune promotion active trouvée pour l'année en cours. veuillez contacter l'administrateur.");
        }


        // Récupération des devoirs
        const { assignments, submissions } = await submissionQueries.getSubmissionByTypeByModuleAndPromotion("exam", moduleId, promotion._id);

        if (!assignments || assignments.length === 0) {
            return res.status(404).send("Aucun examen trouvé pour ce module dans la promotion active.");
        }

        res.status(200).json({ assignments, submissions });
    } catch (error) {
        res.status(500).send('Erreur lors de la récupération des devoirs par module et promotion');
    }
})


router.get("/student/grades/:moduleId/promotion/:promotionId", isStudentMiddleware, async (req, res) => {
    try {
        const { moduleId, promotionId } = req.params;
        const studentId = req.session._id;
        const result = await submissionQueries.getSubmissionByTypeByModuleAndPromotionForStudent("exam", moduleId, promotionId, studentId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de la récupération des notes de l'étudiant:", error);
        res.status(500).send("Erreur lors de la récupération des notes de l'étudiant");
    }
})

router.post("/online/:assignmentId", isStudentMiddleware, isRestrictedMiddleware, async (req, res) => {
    try {
        const data = req.body;
        const studentId = req.session._id;

        const assignmentId = req.params.assignmentId;

        // Récupérer l'assignment pour vérifier l'échéance et le type de soumission
        const assignment = await assignmentQueries.getAssignmentById(assignmentId);

        if (!assignment) {
            return res.status(404).send("Devoir non trouvé");
        }

        // Vérifier que le devoir accepte les soumissions en ligne
        if (assignment.submissionLocation !== 'online') {
            return res.status(400).send("Ce devoir n'accepte pas les soumissions en ligne.");
        }

        // Vérifier que le devoir est actif
        if (!assignment.isActive) {
            return res.status(400).send("Ce devoir n'est pas actif.");
        }

        // Vérifier si l'étudiant a déjà soumis
        const existingSubmission = await submissionQueries.getSubmissionByStudentAndAssignment(studentId, assignmentId);
        if (existingSubmission) {
            return res.status(400).send("Vous avez déjà soumis ce devoir.");
        }

        // Vérifier l'échéance et définir le statut
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);

        // Définir le statut en fonction de l'échéance
        if (now > dueDate) {
            data.status = 'late'; // Soumission en retard
        } else {
            data.status = 'submitted'; // Soumission à temps
        }

        data.student = studentId;
        data.assignment = assignmentId;
        data.submittedAt = now;

        const submission = await submissionQueries.CreateSubmission(data);

        res.status(201).json({
            message: data.status === 'late'
                ? "Soumission créée avec succès (en retard)"
                : "Soumission créée avec succès",
            submission: submission,
            status: data.status
        });
    } catch (error) {
        console.error('Erreur lors de la création de la soumission:', error);
        res.status(500).send('Erreur lors de la création de la soumission');
    }
});

router.patch("/online/:submissionId", isStudentMiddleware, isRestrictedMiddleware, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const updateData = req.body;
        const studentId = req.session._id;


        // Récupérer la soumission existante
        const existingSubmission = await submissionQueries.getSubmissionById(submissionId);

        if (!existingSubmission) {
            return res.status(404).send("Soumission non trouvée");
        }

        // Vérifier que c'est bien l'étudiant propriétaire
        if (existingSubmission.student._id.toString() !== studentId.toString()) {
            return res.status(403).send("Vous n'êtes pas autorisé à modifier cette soumission.");
        }

        // Récupérer l'assignment pour vérifier l'échéance
        const assignment = await assignmentQueries.getAssignmentById(existingSubmission.assignment);

        if (!assignment) {
            return res.status(404).send("Devoir non trouvé");
        }

        // Vérifier que le devoir est actif
        if (!assignment.isActive) {
            return res.status(400).send("Ce devoir n'est plus actif.");
        }

        // Vérifier que le devoir accepte les soumissions en ligne
        if (assignment.submissionLocation !== 'online') {
            return res.status(400).send("Ce devoir n'accepte pas les modifications en ligne.");
        }

        // Vérifier si le devoir a déjà été noté
        if (existingSubmission.status === 'graded') {
            return res.status(400).send("Vous ne pouvez pas modifier une soumission déjà notée.");
        }

        // Vérifier l'échéance - bloquer les modifications si en retard
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);

        if (now > dueDate) {
            return res.status(400).send("La date limite est dépassée, vous ne pouvez plus modifier votre soumission.");
        }

        // Mettre à jour la date de soumission
        updateData.submittedAt = now;
        updateData.status = 'submitted';

        const updatedSubmission = await submissionQueries.updateSubmission(submissionId, updateData);

        res.status(200).json({
            message: "Soumission mise à jour avec succès",
            submission: updatedSubmission,
            status: updateData.status
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la soumission:', error);
        res.status(500).send('Erreur lors de la mise à jour de la soumission');
    }
});


router.get("/all-grades/:promotionId", isStudentMiddleware, async (req, res) => {
    try {
        const { promotionId } = req.params;
        const studentId = req.session._id;

        // Récupérer toutes les soumissions de l'étudiant pour la promotion donnée
        const submissions = await submissionQueries.getAllExamGradesByStudentAndPromotion(studentId, promotionId);


        res.status(200).json(submissions);
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).send('Erreur lors de la récupération des notes');
    }
});

router.get("/all-grades/promotion/:promotionId/student/:studentId", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { promotionId, studentId } = req.params;

        const [student, promotion, grades] = await Promise.all([
            StudentQueries.GetStudentById(studentId),
            promotionQueries.GetPromotionById(promotionId),
            submissionQueries.getAllExamGradesByStudentAndPromotion(studentId, promotionId)
        ]);



        res.status(200).json({ student, grades, promotion });
    } catch (error) {
        console.error('Erreur lors de la récupération des notes:', error);
        res.status(500).send('Erreur lors de la récupération des notes');
    }
});


router.get("/transcript/promotion/:promotionId/student/:studentId", isAdminAndSuperAdmin, async (req, res) => {
    const puppeteer = require('puppeteer');
    const qrcode = require('qrcode');
    const ejs = require('ejs');
    const path = require('path');
    const fsPromises = require('fs/promises');

    let browser;
    try {
        const { promotionId, studentId } = req.params;

        // Récupérer les données en parallèle
        const [student, promotion, gradesData] = await Promise.all([
            StudentQueries.GetStudentById(studentId),
            promotionQueries.GetPromotionById(promotionId),
            submissionQueries.getAllExamGradesByStudentAndPromotion(studentId, promotionId)
        ]);

        if (!student || !promotion) {
            return res.status(404).send("Étudiant ou promotion non trouvé");
        }

        if (gradesData.length === 0) {
            return res.status(400).send("Impossible de telecharger le relevé de notes. Aucun module avec des notes trouvées pour cet étudiant dans cette promotion.");
        }


        const allModulesHaveNormalLocked = gradesData.every(unit =>
            unit.modules.every(module => {
                // Trouver l'examen de session normale
                const normalExam = module.examSubmissions.find(exam => exam.assignment.session === 'normal');

                // Vérifications complètes :
                // 1. L'examen normal existe
                // 2. Il a une submission
                // 3. La submission a une note valide (pas null)
                // 4. L'examen est verrouillé
                return normalExam &&
                    normalExam.submission &&
                    normalExam.submission.grade !== null &&
                    normalExam.assignment.lockedGrade === true;
            })
        );



        if (!allModulesHaveNormalLocked) {
            return res.status(400).send("Impossible de telecharger le relevé de notes. Tous les modules de la promotion doivent avoir des notes attribuées et verrouillées.");
        }

        if (promotion.isActive) {
            return res.status(400).send("Impossible de telecharger le relevé de notes. La promotion doit être clôturée.");
        }

        // Extraire les teachingUnits et construire le tableau de grades plat
        const teachingUnits = gradesData;
        const gradesMap = new Map();


        teachingUnits.forEach(tu => {
            tu.modules.forEach(module => {
                module.examSubmissions.forEach(exam => {
                    const moduleKey = module._id.toString();
                    const currentGrade = exam.submission.grade;

                    if (gradesMap.has(moduleKey)) {
                        const existing = gradesMap.get(moduleKey);
                        if (currentGrade !== null && (existing.grade === null || currentGrade > existing.grade)) {
                            gradesMap.set(moduleKey, {
                                teachingUnitCode: tu.teachingUnit.code,
                                teachingUnitName: tu.teachingUnit.name,
                                semester: tu.teachingUnit.semester,
                                moduleId: module._id,
                                moduleCode: module.code,
                                moduleTitle: module.title,
                                moduleCoefficient: module.coefficient,
                                grade: currentGrade,
                                status: exam.submission.status
                            });
                        }
                    } else {
                        gradesMap.set(moduleKey, {
                            teachingUnitCode: tu.teachingUnit.code,
                            teachingUnitName: tu.teachingUnit.name,
                            semester: tu.teachingUnit.semester,
                            moduleId: module._id,
                            moduleCode: module.code,
                            moduleTitle: module.title,
                            moduleCoefficient: module.coefficient,
                            grade: currentGrade,
                            status: exam.submission.status
                        });
                    }
                });
            });
        });

        const grades = Array.from(gradesMap.values());


        // On génère toujours un nouveau token car une fois hashé, on ne peut plus récupérer l'original
        const token = await gradesAuthenticationQueries.CreateGradesAuthentication(promotionId, studentId);

        const qrCodeData = `www.isa-ambato.mg/authenticate-grades/${token}`;
        const qrCode = await qrcode.toDataURL(qrCodeData, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            width: 300
        });

        // Convertir le logo en base64
        let logoUrl;
        try {
            const logoPath = path.join(__dirname, '..', 'public', 'logo-write.png');
            const logoBuffer = await fsPromises.readFile(logoPath);
            logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } catch (error) {
            console.error('Erreur lors du chargement du logo:', error);
            logoUrl = null;
        }

        // Formater les teaching units pour le template
        const formattedTeachingUnits = teachingUnits.map(tu => ({
            _id: tu.teachingUnit._id,
            code: tu.teachingUnit.code,
            name: tu.teachingUnit.name,
            semester: tu.teachingUnit.semester,
            credits: tu.teachingUnit.credits,
            modules: tu.modules
        }));

        // Préparer les données pour le template
        const templateData = {
            student: {
                firstName: student.firstName,
                name: student.name,
                matricule: student.matricule,
                field: student.field
            },
            promotion: {
                name: promotion.name
            },
            academicYear: promotion.name,
            qrCode: qrCode,
            logoUrl: logoUrl,
            teachingUnits: formattedTeachingUnits,
            grades: grades
        };

        // Rendre le template EJS
        const templatePath = path.join(__dirname, '../views/StudentTranscript.ejs');
        const html = await ejs.renderFile(templatePath, templateData);

        // Configuration Puppeteer
        browser = await puppeteer.launch({
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
        page.setDefaultNavigationTimeout(60000);

        // Charger le HTML
        await page.setContent(html, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        // Attendre que les images soient chargées
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve;
                    }))
            );
        });

        // Attendre un peu plus pour la stabilité
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

        // Créer un nom de fichier sûr (sans caractères spéciaux)
        const safePromotionName = promotion.name
            .replace(/[^a-zA-Z0-9-_]/g, '-')  // Remplacer les caractères spéciaux par des tirets
            .replace(/-+/g, '-')               // Remplacer les tirets multiples par un seul
            .replace(/^-|-$/g, '');            // Enlever les tirets au début et à la fin

        const filename = `releve-notes-${student.matricule}-${safePromotionName}.pdf`;

        // Envoyer le PDF
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error("Erreur lors de la génération du PDF du relevé de notes:", error);
        if (browser) {
            await browser.close();
        }
        if (!res.headersSent) {
            res.status(500).send("Erreur lors de la génération du PDF du relevé de notes");
        }
    }
});


module.exports = router