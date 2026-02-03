const ProfessorQueries = require('../queries/Professor.queries')
const mongoose = require('mongoose')
const UserQueries = require('../queries/UserQueries')
const ReportQueries = require('../queries/Report.queries')
const { generateMatriculeNumber, DecreaseMatriculeNumber } = require('../function/generateMatriculeNumber')
const { generatePassword } = require('../function/generatePassword')
const { EncryptPassword } = require('../secure/securepassword')
const { SendMailForPasswordGive } = require('../mail/sendMailForPasswordGive')
const { isSuperAdmin, isAdminAndSuperAdmin } = require('../middleware/AdminVerification')
const router = require('express').Router()

// router.get("/field/:field", async (req, res) => {
//     try {
//         const { field } = req.params
//         const response = await ProfessorQueries.getProfessorByDepartment(field)
//         res.status(200).json(response);
//     } catch (error) {
//         res.status(500).send("erreur serveur")
//     }
// })

router.get("/all", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const response = await ProfessorQueries.getAllProfessors()
        res.status(200).json(response);
    } catch (error) {
        res.status(500).send("erreur serveur")
    }
})

router.post("/", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession();
    let matricule = null;

    try {
        session.startTransaction();

        const { email, firstName, name, phone, department } = req.body;
        if (!email || !firstName || !name || !phone || !department) {
            return res.status(400).send('Tous les champs requis doivent être renseignés.');
        }


        const emailExists = await UserQueries.GetUserByEmail(email, session);
        if (emailExists) {
            return res.status(409).send(`L'adresse email ${email} est déjà utilisée.`);
        }

        matricule = await generateMatriculeNumber('PRO', session);
        const password = generatePassword(12);
        const hashedPassword = await EncryptPassword(password);

        const professorData = {
            ...req.body,
            matricule,
            hireDate: new Date(),
            password: hashedPassword
        };

        const professor = await ProfessorQueries.CreateProfessor(professorData, session);

        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Création du professeur ${professor.firstName} ${professor.name}`,
            details: `Le professeur ${professor.firstName} ${professor.name}, de matricule ${professor.matricule}, a été créé dans le département ${professor.department}.`,
            role: req.session.role
        };
        await ReportQueries.CreateReport(report, session);
        await session.commitTransaction();

        try {
            await SendMailForPasswordGive(professor.email, password, professor.matricule);
        } catch (emailError) {
            console.warn('Professeur créé mais échec envoi email:', emailError.message);
        }

        const { password: _, ...professorResponse } = professor.toObject();
        res.status(201).json({
            ...professorResponse,
            message: 'Professeur créé avec succès. Email envoyé.'
        });

    } catch (error) {
        console.error('Erreur création professeur:', error);
        await session.abortTransaction();

        if (error.name === 'MongooseError') {
            return res.status(409).send('Conflit de données: ' + error.message);
        }

        res.status(500).send('Erreur interne du serveur.');
    } finally {
        session.endSession();
    }
})

// GET un professeur par ID
router.get("/:id", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('ID professeur invalide.');
        }
        const includeSalary = req.session.role === "superAdmin";

        const professor = await ProfessorQueries.getProfessorById(id, includeSalary);
        if (!professor) {
            return res.status(404).send('Professeur introuvable.');
        }

        res.status(200).json(professor);
    } catch (error) {
        console.error('Erreur récupération professeur:', error);
        res.status(500).send("Erreur serveur");
    }
})

// PUT/PATCH mise à jour d'un professeur
router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send('ID professeur invalide.');
        }

        // Vérifier que le professeur existe
        const existingProfessor = await ProfessorQueries.getProfessorById(id);
        if (!existingProfessor) {
            return res.status(404).send('Professeur introuvable.');
        }

        const allowedFields = ['firstName', 'name', 'email', 'phone', 'address', 'gender', 'department', 'isPermanent'];
        const updateData = {};

        for (const field of allowedFields) {
            if (req.body.hasOwnProperty(field)) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send('Aucune donnée valide à mettre à jour.');
        }

        // Vérifier l'unicité de l'email si modifié
        if (updateData.email && updateData.email !== existingProfessor.email) {
            const emailExists = await UserQueries.GetUserByEmail(updateData.email, session);
            if (emailExists) {
                return res.status(409).send(`L'adresse email ${updateData.email} est déjà utilisée.`);
            }
        }


        const updatedProfessor = await ProfessorQueries.UpdateProfessor(id, updateData, session);

        const changedFields = Object.keys(updateData).join(', ');
        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Modification du professeur ${updatedProfessor.firstName} ${updatedProfessor.name}`,
            details: `Le professeur ${updatedProfessor.firstName} ${updatedProfessor.name} (${updatedProfessor.matricule}) a été modifié. Champs modifiés: ${changedFields}.`,
            role: req.session.role
        };
        await ReportQueries.CreateReport(report, session);

        await session.commitTransaction();

        res.status(200).json(updatedProfessor.toObject());

    } catch (error) {
        console.error('Erreur mise à jour professeur:', error);
        await session.abortTransaction();

        if (error.name === 'ValidationError') {
            return res.status(400).send('Données invalides: ' + error.message);
        }
        if (error.name === 'MongooseError') {
            return res.status(409).send('Conflit de données: ' + error.message);
        }

        res.status(500).send('Erreur interne du serveur.');
    } finally {
        session.endSession();
    }
})

module.exports = router