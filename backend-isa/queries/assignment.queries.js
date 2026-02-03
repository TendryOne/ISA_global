const Assignment = require("../models/assignment.model");
const Submission = require("../models/submission.model");
const StudentQueries = require("./Student.queries");

class AssignmentQueries {
  constructor() {
    this.model = Assignment;
  }

  async createAssignment(assignmentData) {
    const assignment = new this.model(assignmentData);
    return await assignment.save();
  }

  async getAssignmentById(assignmentId) {
    return await this.model.findById(assignmentId).lean();
  }

  async getAssignmentByCriteria(moduleId, promotionId, professorId = null) {
    const mongoose = require("mongoose");

    // Construire le filtre avec conversion en ObjectId
    const query = {
      module: new mongoose.Types.ObjectId(moduleId),
      promotion: new mongoose.Types.ObjectId(promotionId),
    };
    if (professorId) {
      query.professor = new mongoose.Types.ObjectId(professorId);
    }

    // Optimisation: utiliser une agrégation MongoDB unique avec $lookup pour tout récupérer en 1 seule requête
    const pipeline = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: "submissions",
          localField: "_id",
          foreignField: "assignment",
          as: "submissions",
        },
      },
      {
        $addFields: {
          numberOfSubmissions: { $size: "$submissions" },
        },
      },
      {
        $project: {
          submissions: 0, // Exclure le tableau submissions pour économiser de la mémoire
        },
      },
      {
        $sort: { createdAt: -1 }, // Trier par date de création décroissante
      },
    ];

    const result = await this.model.aggregate(pipeline);
    const numberOfStudentPromotion =
      await StudentQueries.GetStudentNumberByPromotionId(promotionId);
    return { result, numberOfStudentPromotion };
  }

  async updateAssignment(assignmentId, updateData) {
    return await this.model.findByIdAndUpdate(assignmentId, updateData, {
      new: true,
    });
  }

  async deleteAssignment(assignmentId) {
    return await this.model.findByIdAndDelete(assignmentId);
  }

  async getAssignmentByIdWithModule(assignmentId) {
    return await this.model.findById(assignmentId).populate("module");
  }

  async getAllAssignmentWithSubmissionsForPromotion(
    moduleId,
    studentId,
    promotionId
  ) {
    // 1) Récupérer tous les assignments du module/promotion en parallèle avec les soumissions de l'étudiant
    const [assignments, submissions] = await Promise.all([
      this.model.find({ promotion: promotionId, module: moduleId }).lean(),
      Submission.find({ student: studentId }).select("assignment").lean(),
    ]);

    // 2) Créer un Set des assignmentIds pour lesquels l'étudiant a soumis
    const submittedAssignmentIds = new Set(
      submissions.map((sub) => sub.assignment.toString())
    );

    // 3) Mapper les assignments avec le statut de soumission
    const result = assignments.map((assignment) => ({
      ...assignment,
      _id: assignment._id.toString(),
      submitted: submittedAssignmentIds.has(assignment._id.toString()),
    }));

    return result;
  }

  async getAssignmentWithSubmissionForStudent(assignmentId, studentId) {
    const [assignment, submission] = await Promise.all([
      this.model.findById(assignmentId).lean(),
      Submission.findOne({
        student: studentId,
        assignment: assignmentId,
      }).lean(),
    ]);

    if (!assignment) {
      return null;
    }

    return {
      ...assignment,
      _id: assignment._id.toString(),
      submission: submission || null,
    };
  }

  async getAssignmentByPromotionForDashboard(promotionId, studentId) {
    try {
      const mongoose = require("mongoose");

      // Convert to ObjectId safely
      const promotionObjectId = mongoose.Types.ObjectId.isValid(promotionId)
        ? new mongoose.Types.ObjectId(promotionId)
        : promotionId;

      const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
        ? new mongoose.Types.ObjectId(studentId)
        : studentId;

      // Use aggregation for optimal performance - single query with lookup
      const assignments = await this.model.aggregate([
        {
          $match: {
            promotion: promotionObjectId,
            isActive: true,
            dueDate: { $gte: new Date() }, // Only upcoming assignments
          },
        },
        { $sort: { dueDate: 1 } }, // Sort by closest due date first
        { $limit: 5 },
        {
          $lookup: {
            from: "submissions",
            let: { assignmentId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$assignment", "$$assignmentId"] },
                      { $eq: ["$student", studentObjectId] },
                    ],
                  },
                },
              },
            ],
            as: "studentSubmission",
          },
        },
        {
          $lookup: {
            from: "modules",
            localField: "module",
            foreignField: "_id",
            as: "moduleData",
          },
        },
        { $unwind: "$moduleData" },
        {
          $addFields: {
            submitted: { $gt: [{ $size: "$studentSubmission" }, 0] },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            dueDate: 1,
            type: 1,
            session: 1,
            submissionLocation: 1,
            createdAt: 1,
            submitted: 1,
            module: {
              _id: "$moduleData._id",
              code: "$moduleData.code",
              title: "$moduleData.title",
            },
          },
        },
      ]);

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  async getAssignmentForProfessorDashboard(professorId, promotionIds) {
    try {
      const mongoose = require("mongoose");

      // Convert to ObjectId safely
      const professorObjectId = mongoose.Types.ObjectId.isValid(professorId)
        ? new mongoose.Types.ObjectId(professorId)
        : professorId;

      // Convert promotionIds array to ObjectIds
      const promotionObjectIds = Array.isArray(promotionIds)
        ? promotionIds.map((id) =>
          mongoose.Types.ObjectId.isValid(id)
            ? new mongoose.Types.ObjectId(id)
            : id
        )
        : [];

      // Return empty result if no promotions provided
      if (promotionObjectIds.length === 0) {
        return {
          assignments: [],
          totalToGrade: 0,
        };
      }

      // Build match criteria
      const matchCriteria = {
        professor: professorObjectId,
        promotion: { $in: promotionObjectIds },
        isActive: true,
        lockedGrade: false,
        dueDate: { $lt: new Date() }, // Past due date (assignments to grade)
      };

      // Use aggregation for optimal performance
      const result = await this.model.aggregate([
        {
          $match: matchCriteria,
        },
        {
          $lookup: {
            from: "submissions",
            localField: "_id",
            foreignField: "assignment",
            as: "submissions",
          },
        },
        {
          $lookup: {
            from: "modules",
            localField: "module",
            foreignField: "_id",
            as: "moduleData",
          },
        },
        { $unwind: "$moduleData" },
        {
          $addFields: {
            submissionsCount: { $size: "$submissions" },
          },
        },
        {
          $facet: {
            // Get assignments with details
            assignments: [
              { $sort: { dueDate: -1 } }, // Most recent first
              { $limit: 10 }, // Limit to 10 for dashboard
              {
                $project: {
                  _id: 1,
                  title: 1,
                  dueDate: 1,
                  promotion: 1,
                  type: 1,
                  session: 1,
                  submissionLocation: 1,
                  createdAt: 1,
                  submissionsCount: 1,
                  module: {
                    _id: "$moduleData._id",
                    code: "$moduleData.code",
                    title: "$moduleData.title",
                    coefficient: "$moduleData.coefficient",
                  },
                },
              },
            ],
            // Count total assignments to grade
            totalToGrade: [{ $count: "count" }],
          },
        },
      ]);

      return {
        assignments: result[0]?.assignments || [],
        totalToGrade: result[0]?.totalToGrade[0]?.count || 0,
      };
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new AssignmentQueries();
