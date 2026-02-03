const EventLog = require("../models/eventLogs.model")
const { ENTITY_TYPES } = require("../utils/eventTypes.constants");
const Assignment = require("../models/assignment.model");
const Submission = require("../models/submission.model");
const User = require("../models/user.model");
const Module = require("../models/module.model");
const Student = require("../models/student.model");
const Professor = require("../models/professor.model");
const Resource = require("../models/ressources.model");
const Schedule = require("../models/schedule.model");
const Report = require("../models/report.model");
const AdministrativeRequest = require("../models/administrative-requests.model");

class EventLogsQueries {
    constructor() {
        this.model = EventLog
    }

    async createLog(data) {
        try {
            const newLog = new this.model(data);
            await newLog.save();
        } catch (error) {
            // Log the error but do not throw to avoid blocking the main process
            console.error("Error creating event log:", error);
        }

    }

    async getLogsByUserIdAndDate(userId, date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const eventLog = await this.model.find({ userId, timestamp: { $gte: startOfDay, $lte: endOfDay } }).sort({ timestamp: -1 }).lean();
            return eventLog;
        } catch (error) {
            throw error;
        }
    }
    async getLogDetailsByentityIdAndEntityType(entityId, entityType) {
        try {
            if (!Object.values(ENTITY_TYPES).includes(entityType)) {
                throw new Error("Invalid entity type");
            }

            let logDetails = {
                title: null,
                details: null
            };

            switch (entityType) {
                case ENTITY_TYPES.ASSIGNMENT:
                    const assignment = await Assignment.findById(entityId).lean();
                    if (assignment) {
                        const typeMap = {
                            'homework': 'Devoir',
                            'project': 'Projet',
                            'exam': 'Examen'
                        };
                        logDetails.title = assignment.title;
                        logDetails.details = typeMap[assignment.type] || assignment.type;
                    }
                    break;

                case ENTITY_TYPES.SUBMISSION:
                    const submission = await Submission.findById(entityId)
                        .populate('assignment', 'title')
                        .populate('student', 'name firstName')
                        .lean();
                    if (submission) {
                        logDetails.title = submission.assignment?.title || 'Assignment non trouvé';
                        const studentName = submission.student
                            ? `${submission.student.firstName} ${submission.student.name}`
                            : 'Étudiant non trouvé';
                        logDetails.details = studentName;
                    }
                    break;

                case ENTITY_TYPES.USER:
                case ENTITY_TYPES.STUDENT:
                case ENTITY_TYPES.PROFESSOR:
                    const user = await User.findById(entityId).lean();
                    if (user) {
                        logDetails.title = `${user.firstName} ${user.name}`;
                        logDetails.details = user.email;
                    }
                    break;

                case ENTITY_TYPES.MODULE:
                    const module = await Module.findById(entityId).populate('teacher', 'name firstName').lean();
                    if (module) {
                        logDetails.title = `${module.code} - ${module.title}`;
                        const teacherName = module.teacher
                            ? `${module.teacher.firstName} ${module.teacher.name}`
                            : 'Non assigné';
                        logDetails.details = `Enseignant: ${teacherName}`;
                    }
                    break;

                case ENTITY_TYPES.RESOURCE:
                    const resource = await Resource.findById(entityId).populate('module', 'code title').lean();
                    if (resource) {
                        logDetails.title = resource.title || resource.fileName || 'Ressource';
                        logDetails.details = resource.module
                            ? `${resource.module.code} - ${resource.module.title}`
                            : 'Module non spécifié';
                    }
                    break;


                case ENTITY_TYPES.SCHEDULE:
                    const schedule = await Schedule.findById(entityId)
                        .populate('module', 'code title')
                        .populate('promotion', 'name')
                        .lean();
                    if (schedule) {
                        const moduleName = schedule.module
                            ? `${schedule.module.code} - ${schedule.module.title}`
                            : 'Module non spécifié';
                        logDetails.title = moduleName;
                        logDetails.details = schedule.promotion?.name || 'Promotion non spécifiée';
                    }
                    break;

                case ENTITY_TYPES.REPORT:
                    const report = await Report.findById(entityId).populate('reportedBy', 'name firstName').lean();
                    if (report) {
                        logDetails.title = report.title || 'Signalement';
                        const reporterName = report.reportedBy
                            ? `${report.reportedBy.firstName} ${report.reportedBy.name}`
                            : 'Utilisateur non trouvé';
                        logDetails.details = `Signalé par: ${reporterName}`;
                    }
                    break;

                case ENTITY_TYPES.REQUEST:
                    const request = await AdministrativeRequest.findById(entityId)
                        .populate('student', 'name firstName')
                        .lean();
                    if (request) {
                        logDetails.title = request.requestType || 'Demande administrative';
                        const studentName = request.student
                            ? `${request.student.firstName} ${request.student.name}`
                            : 'Étudiant non trouvé';
                        logDetails.details = studentName;
                    }
                    break;

                case ENTITY_TYPES.GRADE:
                    // Pour les notes, on récupère via submission
                    const gradeSubmission = await Submission.findById(entityId)
                        .populate('assignment', 'title')
                        .populate('student', 'name firstName')
                        .lean();
                    if (gradeSubmission) {
                        logDetails.title = gradeSubmission.assignment?.title || 'Assignment non trouvé';
                        const studentName = gradeSubmission.student
                            ? `${gradeSubmission.student.firstName} ${gradeSubmission.student.name}`
                            : 'Étudiant non trouvé';
                        logDetails.details = `Note: ${gradeSubmission.grade || 'Non notée'} - ${studentName}`;
                    }
                    break;

                default:
                    logDetails.title = 'Entité inconnue';
                    logDetails.details = `Type: ${entityType}`;
                    break;
            }

            return logDetails;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new EventLogsQueries();