const getDiff = require('../function/getDiff');
const { isAdminAndSuperAdmin } = require('../middleware/AdminVerification');
const ModuleQueries = require('../queries/Module.queries');
const ReportQueries = require('../queries/Report.queries');
const TeachingUnitQueries = require('../queries/TeachingUnit.queries')
const mongoose = require("mongoose")
const router = require('express').Router()



router.post('/', isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession()

    try {
        const { code } = req.body;
        session.startTransaction()
        const existingUnit = await TeachingUnitQueries.getTeachingUnitByCode(code);
        if (existingUnit) {
            return res.status(409).json(`Le code '${code}' est déjà utilisé par une autre unité d’enseignement ${existingUnit.name}.`);
        }

        const newUnit = await TeachingUnitQueries.CreateTeachingUnit({ ...req.body, code: code.toLowerCase() }, session);


        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Création de l’unité d’enseignement (${newUnit.code})`,
            details: `Création de l’unité d’enseignement ${newUnit.code}  `,
            role: req.session.role
        };

        await ReportQueries.CreateReport(report, session)

        await session.commitTransaction()
        session.endSession()


        return res.status(201).json(newUnit);

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error("Erreur lors de la création de l’unité :", error);
        return res.status(500).json("Une erreur interne est survenue lors de la création de l’unité d’enseignement.",);
    }
});

router.get("/field/:field", async (req, res) => {
    try {
        const { field } = req.params
        const response = await TeachingUnitQueries.getTeachingUnitByField(field)
        res.status(200).json(response)
    } catch (error) {
        res.status(500).send("Erreur lors de la recuperation de l'UE")
    }
});

router.get("/semesterAndField/:semester/:field", isAdminAndSuperAdmin, async (req, res) => {
    try {
        const { field, semester } = req.params
        const response = await TeachingUnitQueries.getTeachingUnitByFieldAndBySemester(field, semester)
        res.status(200).json(response)
    } catch (error) {
        res.status(500).send("Erreur lors de la recuperation de l'UE")
    }
})

router.patch("/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession()
    try {

        session.startTransaction()
        const { id } = req.params
        const oldUnit = await TeachingUnitQueries.getTeachingUnitById(id)

        const response = await TeachingUnitQueries.updateTeachingUnitById(id, req.body, session)

        const changes = getDiff(oldUnit.toObject(), response.toObject())
        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Modification de l’unité d’enseignement (${response.code})`,
            details: JSON.stringify(changes, null, 2),
            role: req.session.role
        };

        await ReportQueries.CreateReport(report, session)

        await session.commitTransaction()
        session.endSession()

        res.status(200).json(response)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error);

        res.status(500).send("Erreur lors de la modification de cette UE")
    }
})


router.delete("/:id", isAdminAndSuperAdmin, async (req, res) => {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()
        const { id } = req.params

        const moduleCount = await ModuleQueries.getModulesNumberByTeachingUnit(id)
        if (moduleCount > 0) {
            throw new Error(`Impossible de supprimer cette unité d’enseignement car ${moduleCount} module${moduleCount > 1 ? 's' : ''} associé${moduleCount > 1 ? 's' : ''}.`)
        }
        const deletedTeachingUnit = await TeachingUnitQueries.deleteTeachingUnitById(id, session)

        const report = {
            authorId: req.session.matricule,
            authorName: req.session.fullName,
            action: `Suppression de l’unité d’enseignement (${deletedTeachingUnit.code})`,
            details: `Suppression de l'unité d'enseignement ${deletedTeachingUnit.code}`,
            role: req.session.role
        };

        await ReportQueries.CreateReport(report, session)
        await session.commitTransaction()
        session.endSession()

        res.sendStatus(200)
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error);

        res.status(500).send(error.message || "Erreur lors de la suppression de cette UE")
    }
})

module.exports = router