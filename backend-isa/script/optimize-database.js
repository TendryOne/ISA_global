/**
 * 🚀 SCRIPT D'OPTIMISATION DE LA BASE DE DONNÉES
 * 
 * Ce script effectue les opérations suivantes:
 * 1. Crée tous les index optimisés
 * 2. Recalcule les statistiques dénormalisées des frais de scolarité
 * 3. Affiche un rapport de performance
 * 
 * Usage: node script/optimize-database.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import des modèles
const User = require("../models/user.model");
const Student = require("../models/student.model");
const Professor = require("../models/professor.model");
const Admin = require("../models/admin.model");
const TutionFees = require("../models/tutionFees.model");
const PendingStudent = require("../models/pendingStudents.models");
const Promotion = require("../models/promotion.model");
const Notification = require("../models/notification.model");
const Module = require("../models/module.model");
const Assignment = require("../models/assignment.model");
const Submission = require("../models/submission.model");
const Schedule = require("../models/schedule.model");
const AdministrativeRequest = require("../models/administrative-requests.model");
const BugReport = require("../models/bugReport.model");

async function createOptimizedIndexes() {
  console.log("\n📊 ===== CRÉATION DES INDEX OPTIMISÉS =====\n");

  const indexOperations = [
    // User indexes
    { model: User, index: { role: 1 }, name: "role_1" },
    { model: User, index: { email: 1 }, name: "email_1", options: { unique: true } },
    { model: User, index: { matricule: 1 }, name: "matricule_1" },
    { model: User, index: { createdAt: -1 }, name: "createdAt_-1" },
    
    // Student indexes
    { model: Student, index: { verified: 1 }, name: "verified_1" },
    { model: Student, index: { field: 1 }, name: "field_1" },
    { model: Student, index: { field: 1, level: 1 }, name: "field_1_level_1" },
    { model: Student, index: { "parcours.promotion": 1 }, name: "parcours.promotion_1" },
    { model: Student, index: { "parcours.status": 1 }, name: "parcours.status_1" },
    { model: Student, index: { level: 1, verified: 1 }, name: "level_1_verified_1" },
    
    // TutionFees indexes
    { model: TutionFees, index: { promotion: 1 }, name: "promotion_1" },
    { model: TutionFees, index: { "installments.verified": 1 }, name: "installments.verified_1" },
    { model: TutionFees, index: { "installments.dueDate": 1 }, name: "installments.dueDate_1" },
    { model: TutionFees, index: { "installments.transactionRef": 1 }, name: "installments.transactionRef_1" },
    
    // PendingStudent indexes
    { model: PendingStudent, index: { status: 1 }, name: "status_1" },
    { model: PendingStudent, index: { field: 1 }, name: "field_1" },
    { model: PendingStudent, index: { status: 1, createdAt: -1 }, name: "status_1_createdAt_-1" },
    { model: PendingStudent, index: { token: 1 }, name: "token_1" },
    
    // Promotion indexes
    { model: Promotion, index: { level: 1, field: 1 }, name: "level_1_field_1" },
    { model: Promotion, index: { isActive: 1 }, name: "isActive_1" },
    { model: Promotion, index: { isActive: 1, startDate: 1, endDate: 1 }, name: "isActive_dates" },
    
    // Notification indexes
    { model: Notification, index: { type: 1 }, name: "type_1" },
    { model: Notification, index: { type: 1, createdAt: -1 }, name: "type_1_createdAt_-1" },
    { model: Notification, index: { user: 1, type: 1 }, name: "user_1_type_1" },
    
    // Module indexes
    { model: Module, index: { teachingUnit: 1 }, name: "teachingUnit_1" },
    { model: Module, index: { teacher: 1 }, name: "teacher_1" },
    { model: Module, index: { code: 1 }, name: "code_1" },
    
    // Assignment indexes
    { model: Assignment, index: { module: 1, promotion: 1 }, name: "module_1_promotion_1" },
    { model: Assignment, index: { professor: 1 }, name: "professor_1" },
    { model: Assignment, index: { promotion: 1, isActive: 1, dueDate: 1 }, name: "promotion_active_due" },
    
    // Submission indexes
    { model: Submission, index: { student: 1 }, name: "student_1" },
    { model: Submission, index: { assignment: 1 }, name: "assignment_1" },
    { model: Submission, index: { student: 1, assignment: 1 }, name: "student_1_assignment_1" },
    
    // Schedule indexes
    { model: Schedule, index: { date: 1 }, name: "date_1" },
    { model: Schedule, index: { professor: 1, date: 1 }, name: "professor_1_date_1" },
    { model: Schedule, index: { promotions: 1, date: 1 }, name: "promotions_1_date_1" },
    
    // AdministrativeRequest indexes
    { model: AdministrativeRequest, index: { status: 1 }, name: "status_1" },
    { model: AdministrativeRequest, index: { student: 1 }, name: "student_1" },
    
    // BugReport indexes
    { model: BugReport, index: { isResolved: 1 }, name: "isResolved_1" },
  ];

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const op of indexOperations) {
    try {
      await op.model.collection.createIndex(op.index, op.options || {});
      console.log(`  ✅ ${op.model.modelName}: ${op.name}`);
      created++;
    } catch (error) {
      if (error.code === 85 || error.code === 86) {
        // Index already exists
        console.log(`  ⏭️  ${op.model.modelName}: ${op.name} (existe déjà)`);
        skipped++;
      } else {
        console.log(`  ❌ ${op.model.modelName}: ${op.name} - ${error.message}`);
        errors++;
      }
    }
  }

  console.log(`\n📈 Résumé: ${created} créés, ${skipped} existants, ${errors} erreurs`);
  return { created, skipped, errors };
}

async function recalculateTutionFeesStats() {
  console.log("\n💰 ===== RECALCUL DES STATISTIQUES FRAIS DE SCOLARITÉ =====\n");

  const allFees = await TutionFees.find({});
  let updated = 0;
  let alreadyOk = 0;

  for (const fee of allFees) {
    const now = new Date();
    
    // Calculer les nouvelles stats
    const totalPaid = fee.installments
      .filter(i => i.verified === true)
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    
    const totalPending = fee.installments
      .filter(i => !i.verified && (i.proofFile || i.transactionRef))
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    
    const totalOverdue = fee.installments
      .filter(i => !i.verified && !i.proofFile && !i.transactionRef && i.dueDate && i.dueDate < now)
      .reduce((sum, i) => sum + (i.amount || 0), 0);

    // Vérifier si les stats sont différentes
    const statsChanged = 
      fee.stats?.totalPaid !== totalPaid ||
      fee.stats?.totalPending !== totalPending ||
      fee.stats?.totalOverdue !== totalOverdue;

    if (statsChanged || !fee.stats) {
      // Utiliser save() pour déclencher le middleware
      await fee.save();
      updated++;
    } else {
      alreadyOk++;
    }
  }

  console.log(`  ✅ ${updated} documents mis à jour`);
  console.log(`  ⏭️  ${alreadyOk} documents déjà à jour`);
  console.log(`  📊 Total: ${allFees.length} documents traités`);
  
  return { updated, alreadyOk, total: allFees.length };
}

async function displayCollectionStats() {
  console.log("\n📋 ===== STATISTIQUES DES COLLECTIONS =====\n");

  const collections = [
    { model: User, name: "Users (tous)" },
    { model: Student, name: "Étudiants" },
    { model: Professor, name: "Professeurs" },
    { model: TutionFees, name: "Frais de scolarité" },
    { model: PendingStudent, name: "Pré-inscriptions" },
    { model: Promotion, name: "Promotions" },
    { model: Notification, name: "Notifications" },
    { model: Assignment, name: "Devoirs" },
    { model: Submission, name: "Soumissions" },
    { model: Schedule, name: "Emplois du temps" },
  ];

  for (const col of collections) {
    try {
      const count = await col.model.countDocuments();
      const indexes = await col.model.collection.indexes();
      console.log(`  ${col.name}: ${count} documents, ${indexes.length} index`);
    } catch (error) {
      console.log(`  ${col.name}: Erreur - ${error.message}`);
    }
  }
}

async function runPerformanceTest() {
  console.log("\n⚡ ===== TEST DE PERFORMANCE =====\n");

  const tests = [
    {
      name: "Count étudiants par rôle ($facet)",
      fn: async () => {
        return await User.aggregate([
          {
            $facet: {
              byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }]
            }
          }
        ]);
      }
    },
    {
      name: "Stats financières (dénormalisées)",
      fn: async () => {
        return await TutionFees.aggregate([
          {
            $group: {
              _id: null,
              totalCollected: { $sum: "$stats.totalPaid" },
              totalPending: { $sum: "$stats.totalPending" }
            }
          }
        ]);
      }
    },
    {
      name: "Étudiants non vérifiés avec pagination",
      fn: async () => {
        return await Student.find({ verified: false })
          .skip(0)
          .limit(10)
          .select("matricule name firstName")
          .lean();
      }
    },
    {
      name: "Promotions actives",
      fn: async () => {
        return await Promotion.find({ isActive: true }).lean();
      }
    }
  ];

  for (const test of tests) {
    const start = Date.now();
    await test.fn();
    const duration = Date.now() - start;
    console.log(`  ${test.name}: ${duration}ms`);
  }
}

async function main() {
  console.log("🚀 ===== OPTIMISATION DE LA BASE DE DONNÉES ISA =====");
  console.log(`📅 Date: ${new Date().toLocaleString("fr-FR")}\n`);

  try {
    // Connexion
    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/isa");
    console.log("✅ Connecté à MongoDB\n");

    // Étape 1: Créer les index
    await createOptimizedIndexes();

    // Étape 2: Recalculer les stats TutionFees
    await recalculateTutionFeesStats();

    // Étape 3: Afficher les stats des collections
    await displayCollectionStats();

    // Étape 4: Test de performance
    await runPerformanceTest();

    console.log("\n✅ ===== OPTIMISATION TERMINÉE =====\n");

  } catch (error) {
    console.error("\n❌ Erreur:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Connexion fermée");
  }
}

// Exécuter le script
main();
