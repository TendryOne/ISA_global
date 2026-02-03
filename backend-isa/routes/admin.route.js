const router = require("express").Router();
const AdminQueries = require("../queries/admin.queries");
const getDiff = require("../function/getDiff");
const ReportQueries = require("../queries/Report.queries");

const mongoose = require("mongoose");
const {
  generateMatriculeNumber,
} = require("../function/generateMatriculeNumber");
const { generatePassword } = require("../function/generatePassword");

const UserQueries = require("../queries/UserQueries");
const { SendMailForPasswordGive } = require("../mail/sendMailForPasswordGive");
const { EncryptPassword } = require("../secure/securepassword");
const SuperAdmin = require("../models/superAdmin.model");
router.get("/", async (req, res) => {
  try {
    const { admins, total } = await AdminQueries.getAdmin(
      req.query.pageQuery,
      req.query.perPageQuery,
      req.query.searchQuery,
      req.query.roleQuery
    );
    res.status(200).json({ admins, total });
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await UserQueries.GetUserByEmail(req.body.email.toLowerCase());

    if (user) {
      throw new Error("Un utilisateur avec cet email existe déjà.");
    }

    const matricule = await generateMatriculeNumber(
      req.body.role === "admin" ? "ADM" : "SUP",
      session
    );
    req.body.matricule = matricule;
    const password = generatePassword(12);
    const hashedPassword = await EncryptPassword(password);

    const newAdmin = await AdminQueries.CreateUser(
      { ...req.body, password: hashedPassword },
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Création d’un nouvel administrateur (${newAdmin.matricule})`,
      details: `Création d’un nouvel administrateur ${newAdmin.matricule} avec l'email ${newAdmin.email}`,
      role: req.session.role,
    };

    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();

    await SendMailForPasswordGive(newAdmin.email, password, newAdmin.matricule);
    res.status(201).json(newAdmin);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    session.endSession();
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const admin = await AdminQueries.getUsersById(req.params.id);
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.patch("/user/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    if (req.body.email) {
      const user = await UserQueries.GetUserByEmail(req.body.email);

      if (user && user._id.toString() !== req.params.id) {
        throw new Error("Un utilisateur avec cet email existe déjà.");
      }
    }

    const updatedAdmin = await AdminQueries.UpdateUsersById(
      req.params.id,
      req.body,
      session
    );

    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Mise à jour de l’administrateur (${updatedAdmin.matricule})`,
      details: `Mise à jour de l’administrateur ${updatedAdmin.matricule} avec les nouvelles informations`,
      role: req.session.role,
    };
    await ReportQueries.CreateReport(report, session);

    await session.commitTransaction();
    res.status(200).json(updatedAdmin);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    session.endSession();
  }
});

router.delete("/user/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deletedAdmin = await AdminQueries.DeleteUser(req.params.id, session);
    const report = {
      authorId: req.session.matricule,
      authorName: req.session.fullName,
      action: `Suppression de l’administrateur (${deletedAdmin.matricule})`,
      details: `Suppression de l’administrateur ${deletedAdmin.matricule}  `,
      role: req.session.role,
    };

    const adminCounts = await SuperAdmin.countDocuments();

    if (deletedAdmin.matricule === req.session.matricule) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte.");
    }

    if (adminCounts <= 1 && deletedAdmin.role === "superAdmin") {
      throw new Error(
        "Impossible de supprimer le dernier super administrateur."
      );
    }

    await ReportQueries.CreateReport(report, session);
    await session.commitTransaction();

    res.sendStatus(204);
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    res.status(500).send(error.message);
  } finally {
    session.endSession();
  }
});

module.exports = router;
