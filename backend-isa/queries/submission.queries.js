const Submission = require("../models/submission.model");
const assignmentQueries = require("./assignment.queries");
const ModuleQueries = require("./Module.queries");
const promotionQueries = require("./promotion.queries");
const StudentQueries = require("./Student.queries");
const TeachingUnitQueries = require("./TeachingUnit.queries");

class SubmissionQueries {
  constructor() {
    this.model = Submission;
  }

  async CreateSubmission(data) {
    const submission = new this.model(data);
    return submission.save();
  }

  async getFirstSubmissionByAssignment(assignmentId) {
    return this.model.findOne({ assignment: assignmentId });
  }

  async getSubmissionsByAssignment(assignmentId) {
    return this.model
      .find({ assignment: assignmentId })
      .populate("student", "-password -role -__v -createdAt -updatedAt");
  }

  async getSubmissionById(submissionId) {
    return this.model
      .findById(submissionId)
      .populate("student", "-password -role -__v -createdAt -updatedAt");
  }

  async getSubmissionByStudentAndAssignment(studentId, assignmentId) {
    return this.model
      .findOne({
        student: studentId,
        assignment: assignmentId,
      })
      .lean();
  }

  async updateSubmission(submissionId, updateData) {
    return this.model.findByIdAndUpdate(submissionId, updateData, {
      new: true,
    });
  }

  async deleteSubmission(submissionId) {
    return this.model.findByIdAndDelete(submissionId);
  }

  async getSubmissionByAssignmentAndPromotions(assignmentId, promotionId) {
    try {
      // 1) Récupérer les étudiants de la promo
      const students =
        await StudentQueries.GetStudentByPromotionId(promotionId);

      // 2) Récupérer toutes les soumissions pour ce devoir
      const submissions = await this.model
        .find({ assignment: assignmentId })
        .lean();

      const assignment =
        await assignmentQueries.getAssignmentById(assignmentId);
      // 3) Indexer les soumissions par studentId pour lookup rapide
      const submissionMap = new Map(
        submissions.map((s) => [s.student.toString(), s])
      );

      // 4) Construire la réponse
      const results = students.map((student) => {
        const submission = submissionMap.get(student._id.toString());
        return {
          studentId: student._id,
          name: student.name,
          firstName: student.firstName,
          email: student.email,
          matricule: student.matricule,
          submission: submission || {
            fileUrl: null,
            submittedAt: null,
            grade: null,
            status: "not_submitted",
            feedback: null,
          },
        };
      });

      return { results, assignment };
    } catch (error) {
      console.error("Erreur getSubmissionByAssignmentAndPromotions:", error);
      throw error;
    }
  }

  async UpdateManySubmissions(filter, updateData) {
    return this.model.updateMany(filter, updateData);
  }

  async getSubmissionByTypeByModuleAndPromotion(type, moduleId, promotionId) {
    try {
      // 1) Récupérer les assignments du module et de la promotion
      const assignments = await assignmentQueries.model
        .find({
          module: moduleId,
          promotion: promotionId,
          type: type,
        })
        .lean();

      // 2) Récupérer les soumissions pour ces assignments
      const submissions = await this.model
        .find({
          assignment: { $in: assignments.map((a) => a._id) },
        })
        .lean();

      const students =
        await StudentQueries.GetStudentByPromotionId(promotionId);

      const results = [];
      for (const student of students) {
        const studentSubmissions = [];

        for (const assignment of assignments) {
          const submission = submissions.find(
            (s) =>
              s.student.toString() === student._id.toString() &&
              s.assignment.toString() === assignment._id.toString()
          );

          studentSubmissions.push(
            submission || {
              assignment: assignment._id, // 🔑 garder la référence de l'assignment
              fileUrl: null,
              submittedAt: null,
              grade: null,
              status: "not_submitted",
              feedback: null,
            }
          );
        }

        results.push({
          student,
          submissions: studentSubmissions,
        });
      }

      return { assignments, submissions: results };
    } catch (error) {
      console.error("Erreur getSubmissionByTypeByModuleAndPromotion:", error);
      throw error;
    }
  }

  async getSubmissionByTypeByModuleAndPromotionForStudent(
    type,
    moduleId,
    promotionId,
    studentId
  ) {
    try {
      const mongoose = require("mongoose");

      // Utiliser une agrégation performante pour récupérer les submissions avec les détails des assignments en 1 requête
      const pipeline = [
        {
          $match: {
            student: new mongoose.Types.ObjectId(studentId),
          },
        },
        {
          $lookup: {
            from: "assignments",
            localField: "assignment",
            foreignField: "_id",
            as: "assignmentDetails",
          },
        },
        {
          $unwind: "$assignmentDetails",
        },
        {
          $match: {
            "assignmentDetails.module": new mongoose.Types.ObjectId(moduleId),
            "assignmentDetails.promotion": new mongoose.Types.ObjectId(
              promotionId
            ),
            "assignmentDetails.type": type,
            "assignmentDetails.isActive": true,
          },
        },
        {
          $project: {
            _id: 1,
            assignment: 1,
            student: 1,
            fileUrl: 1,
            submittedAt: 1,
            grade: 1,
            status: 1,
            feedback: 1,
            createdAt: 1,
            updatedAt: 1,
            // Inclure les informations nécessaires de l'assignment
            assignmentInfo: {
              _id: "$assignmentDetails._id",
              title: "$assignmentDetails.title",
              session: "$assignmentDetails.session",
              type: "$assignmentDetails.type",
              dueDate: "$assignmentDetails.dueDate",
              submissionLocation: "$assignmentDetails.submissionLocation",
            },
          },
        },
        {
          $sort: { "assignmentInfo.session": 1, submittedAt: -1 }, // Trier par session (normal puis rattrapage) puis par date
        },
      ];

      const submissions = await this.model.aggregate(pipeline);
      return submissions;
    } catch (error) {
      console.error(
        "Erreur getSubmissionByTypeByModuleAndPromotionForStudent:",
        error
      );
      throw error;
    }
  }

  async getAllExamGradesByStudentAndPromotion(studentId, promotionId) {
    try {
      const mongoose = require("mongoose");

      // ✅ Approche optimisée : requêtes ciblées en parallèle au lieu d'une agrégation lourde avec $unwind

      // 1️⃣ Récupérer la promotion avec field/level
      const promotion = await promotionQueries.model
        .findById(promotionId)
        .select("field level")
        .lean();

      if (!promotion) throw new Error("Promotion non trouvée");

      // 2️⃣ Récupérer TeachingUnits + Modules en une seule agrégation optimisée (sans $unwind)
      const teachingUnitsWithModules =
        await TeachingUnitQueries.model.aggregate([
          {
            $match: {
              field: promotion.field,
              level: promotion.level,
            },
          },
          {
            $lookup: {
              from: "modules",
              localField: "_id",
              foreignField: "teachingUnit",
              as: "modules",
            },
          },
          {
            $project: {
              name: 1,
              code: 1,
              field: 1,
              level: 1,
              semester: 1,
              credits: 1,

              "modules._id": 1,
              "modules.code": 1,
              "modules.title": 1,
              "modules.coefficient": 1,
              "modules.credits": 1,
              "modules.hours": 1,
            },
          },
          { $sort: { semester: 1, name: 1 } },
        ]);

      // 3️⃣ Extraire tous les IDs des modules
      const moduleIds = teachingUnitsWithModules.flatMap((tu) =>
        tu.modules.map((m) => m._id)
      );

      if (moduleIds.length === 0) {
        return [];
      }

      // 4️⃣ Récupérer TOUS les examens et submissions en parallèle
      const [assignments, submissions] = await Promise.all([
        // Récupérer tous les examens pour ces modules
        assignmentQueries.model
          .find({
            module: { $in: moduleIds },
            promotion: new mongoose.Types.ObjectId(promotionId),
            type: "exam",
            isActive: true,
          })
          .select(
            "_id title session dueDate submissionLocation module lockedGrade"
          )
          .sort({ session: 1 })
          .lean(),

        // Récupérer toutes les submissions de l'étudiant pour ces examens
        (async () => {
          const assignmentIds = await assignmentQueries.model.distinct("_id", {
            module: { $in: moduleIds },
            promotion: new mongoose.Types.ObjectId(promotionId),
            type: "exam",
          });

          return this.model
            .find({
              student: new mongoose.Types.ObjectId(studentId),
              assignment: { $in: assignmentIds },
            })
            .select("assignment fileUrl submittedAt grade status feedback")
            .lean();
        })(),
      ]);

      // 5️⃣ Indexer pour lookup O(1)
      const submissionMap = new Map(
        submissions.map((sub) => [sub.assignment.toString(), sub])
      );

      const assignmentsByModule = assignments.reduce((acc, assignment) => {
        const moduleId = assignment.module.toString();
        if (!acc[moduleId]) acc[moduleId] = [];
        acc[moduleId].push(assignment);
        return acc;
      }, {});

      // 6️⃣ Construire le résultat final
      return teachingUnitsWithModules.map((tu) => ({
        teachingUnit: {
          _id: tu._id,
          name: tu.name,
          code: tu.code,
          field: tu.field,
          level: tu.level,
          semester: tu.semester,
          credits: tu.credits,
        },
        modules: tu.modules.map((module) => {
          const moduleAssignments =
            assignmentsByModule[module._id.toString()] || [];

          return {
            _id: module._id,
            code: module.code,
            title: module.title,
            coefficient: module.coefficient,
            credits: module.credits,
            hours: module.hours,
            examSubmissions: moduleAssignments.map((assignment) => ({
              assignment: {
                _id: assignment._id,
                title: assignment.title,
                session: assignment.session,
                dueDate: assignment.dueDate,
                lockedGrade: assignment.lockedGrade,
                submissionLocation: assignment.submissionLocation,
              },
              submission: submissionMap.get(assignment._id.toString()) || {
                assignment: assignment._id,
                fileUrl: null,
                submittedAt: null,
                grade: null,
                status: "not_submitted",
                feedback: null,
              },
            })),
          };
        }),
      }));
    } catch (error) {
      console.error("Erreur getAllExamGradesByStudentAndPromotion:", error);
      throw error;
    }
  }

  async getsubmissionByStudentForDashboard(studentId, promotionId) {
    try {
      const mongoose = require("mongoose");

      // Convert to ObjectId safely
      const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
        ? new mongoose.Types.ObjectId(studentId)
        : studentId;

      const promotionObjectId = mongoose.Types.ObjectId.isValid(promotionId)
        ? new mongoose.Types.ObjectId(promotionId)
        : promotionId;

      // Use aggregation for optimal performance - single query with nested lookups
      const submissions = await this.model.aggregate([
        {
          $match: {
            student: studentObjectId,
            status: "graded",
          },
        },
        {
          $lookup: {
            from: "assignments",
            localField: "assignment",
            foreignField: "_id",
            as: "assignmentData",
          },
        },
        { $unwind: "$assignmentData" },
        {
          $match: {
            "assignmentData.promotion": promotionObjectId,
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "modules",
            localField: "assignmentData.module",
            foreignField: "_id",
            as: "moduleData",
          },
        },
        { $unwind: "$moduleData" },
        {
          $project: {
            _id: 1,
            grade: 1,
            updatedAt: 1,
            assignment: {
              _id: "$assignmentData._id",
              type: "$assignmentData.type",
              session: "$assignmentData.session",
            },
            module: {
              _id: "$moduleData._id",
              code: "$moduleData.code",
              title: "$moduleData.title",
            },
          },
        },
      ]);

      return submissions;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new SubmissionQueries();
