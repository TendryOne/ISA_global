const { errorMonitor } = require("connect-mongo");
const { generatePassword } = require("../function/generatePassword");
const Student = require("../models/student.model");
const User = require("../models/user.model");
const { EncryptPassword } = require("../secure/securepassword");
const pendingStudentsQueries = require("./pendingStudents.queries");
const fspromises = require('fs/promises');
const path = require("path");
const CounterMatricule = require("../models/counterMatricule");
const { moveDirSafe } = require("../utils/moveDirSafe");

class UserQueries {

    constructor() {
        this.model = User
    }

    async GetUserByMatricule(matricule) {
        try {

            if (!matricule) {
                throw new Error("Matricule is required");
            }

            let user;
            if (matricule.startsWith("ETU")) {
                user = await Student.findOne({ matricule: matricule }).populate('parcours.promotion').lean();
            } else {
                user = await this.model.findOne({ matricule: matricule }).lean();
            }
            return user;

        } catch (error) {
            throw error
        }
    }
    async PatchUserByMatricule(matricule, updatedData) {
        try {
            await this.model.findOneAndUpdate({ matricule }, updatedData);
        } catch (error) {
            throw error
        }
    }

    async GetUserByToken(resetPasswordToken) {
        try {
            return await this.model.findOne({ resetPasswordToken });
        } catch (error) {
            throw error
        }
    }

    async GetUserByEmail(email) {
        try {
            return await this.model.findOne({ email: email });
        } catch (error) {
            throw error
        }
    }

    async GetUserByEmailOrPhone(email, phone) {
        return await this.model.findOne({
            $or: [
                { email },
                { phone }
            ]
        });
    }



    async CreateStudent(matricule, inscriptionId, data, session) {
        const randomPassword = generatePassword(12);
        const hashedPassword = await EncryptPassword(randomPassword);

        const pendingStudents = await pendingStudentsQueries.getStudentById(
            inscriptionId,
            session
        );

        if (!pendingStudents) {
            throw new Error("PENDING_STUDENT_NOT_FOUND");
        }

        // ⚠️ ON NE TOUCHE PAS AU FILESYSTEM ICI
        // On garde juste les chemins logiques existants
        const newStudent = new Student({
            matricule,
            inscriptionId: pendingStudents.inscriptionId,
            password: hashedPassword,
            name: pendingStudents.lastName,
            firstName: pendingStudents.firstName,
            email: pendingStudents.email,
            address: pendingStudents.address,
            phone: pendingStudents.phone,
            gender: pendingStudents.gender,

            // chemins TEMPORAIRES (seront corrigés après commit)
            identityPhoto: pendingStudents.identityPhoto ?? null,
            bacTranscript: pendingStudents.bacTranscript ?? null,
            idDocument: pendingStudents.idDocument ?? null,
            residenceCertificate: pendingStudents.residenceCertificate ?? null,

            birthDate: pendingStudents.birthDate,
            birthPlace: pendingStudents.birthPlace,
            cin: pendingStudents.cin,
            emergencyContactName: pendingStudents.emergencyContactName,
            emergencyContactRelation: pendingStudents.emergencyContactRelation,
            emergencyContactPhone: pendingStudents.emergencyContactPhone,
            bacSeries: pendingStudents.bacSeries,
            bacYear: pendingStudents.bacYear,
            previousInstitution: pendingStudents.previousInstitution,
            field: pendingStudents.field,
            level: pendingStudents.levelAsked,

            terms: {
                cguAcceptance: data.cguAcceptance,
                privacyAcceptance: data.privacyAcceptance,
                engagmentAcceptance: data.engagmentAcceptance,
                charterAcceptance: data.charterAcceptance
            }
        });

        const student = await newStudent.save({ session });

        return {
            _id: student._id,
            email: student.email,
            password: randomPassword,
            field: pendingStudents.field // utile après commit
        };
    }



    async UpdateUserById(id, data) {
        try {
            const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');
            return user;
        } catch (error) {
            throw error
        }
    }

    async getAllStudents(page, limitperPage, fieldsQuery, searchQuery, levelQuery, isRestrictedQuery, verifiedQuery) {
        try {
            const skip = (parseInt(page) - 1) * parseInt(limitperPage);

            let matchQuery = {
                role: 'student'  // Les étudiants ont le champ role: 'student'
            };

            // Appliquer les filtres de recherche
            if (fieldsQuery !== 'all') {
                matchQuery.field = fieldsQuery;
            }

            if (levelQuery) {
                matchQuery.level = levelQuery;
            }


            if (searchQuery) {
                matchQuery.$or = [
                    { matricule: { $regex: searchQuery, $options: 'i' } },
                ];
            }

            if (isRestrictedQuery === 'true') {
                matchQuery.isRestricted = true;
            } else if (isRestrictedQuery === 'false') {
                matchQuery.isRestricted = false;
            }

            if (verifiedQuery === 'true') {
                matchQuery.verified = true;
            } else if (verifiedQuery === 'false') {
                matchQuery.verified = false;
            }


            // Utiliser le modèle User car les étudiants sont stockés avec role: 'student'
            const result = await User.aggregate([
                { $match: matchQuery },
                {
                    $facet: {
                        students: [
                            { $skip: skip },
                            { $limit: parseInt(limitperPage) },
                            {
                                $project: {
                                    firstName: 1,
                                    name: 1,
                                    matricule: 1,
                                    field: 1,
                                    level: 1,
                                    isRestricted: 1,
                                    verified: 1
                                }
                            }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ],
                        restrictedCount: [
                            { $match: { isRestricted: true } },
                            { $count: 'count' }
                        ],
                        verifiedCount: [
                            { $match: { verified: true } },
                            { $count: 'count' }
                        ]
                    }
                }
            ]);

            const students = result[0].students;
            const total = result[0].totalCount[0]?.count || 0;
            const totalRestricted = result[0].restrictedCount[0]?.count || 0;
            const totalVerified = result[0].verifiedCount[0]?.count || 0;


            return {
                students,
                total,
                totalRestricted,
                totalVerified
            };
        } catch (error) {
            throw error
        }
    }

    async getUserByIdForLogs(id) {
        try {
            const user = await this.model.findById(id).select('firstName name matricule role').lean();
            return user;
        } catch (error) {
            throw error
        }
    }

}


module.exports = new UserQueries