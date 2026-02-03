const PendingStudent = require("../models/pendingStudents.models")
const fs = require('fs/promises')
const path = require('path')
const crypto = require("crypto")
const { trusted } = require("mongoose")

class PendingStudentQueries {
    constructor() {
        this.model = PendingStudent
    }

    async create(studentData, session = null) {
        try {
            const newStudent = new this.model(studentData);
            return await newStudent.save({ session });
        } catch (error) {
            throw error
        }
    }

    async getStudentById(inscriptionId) {
        try {
            return await this.model.findOne({ inscriptionId: inscriptionId }).lean(); // 🚀 +30%
        } catch (error) {
            throw error

        }
    }

    async getStudentByFieldName(fieldName) {
        try {
            return await this.model.findOne({ fieldName }).lean(); // 🚀 +30%
        } catch (error) {
            throw error

        }
    }

    async UpdatePendingStudentsById(inscriptionId, update, session = null) {
        try {

            const options = {};
            if (session) {
                options.session = session;
            }
            return await this.model.findOneAndUpdate({ inscriptionId: inscriptionId }, update, { ...options, new: true })
        } catch (error) {
            throw error
        }
    }


    async getStudent(page, limitperPage, searchQuery, fieldsQuery, statusQuery) {
        try {
            const perPage = limitperPage || 1;
            const skip = ((page || 1) - 1) * perPage;
            let matchQuery = {};
            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery.trim(), 'i');
                matchQuery.$or = [
                    { lastName: { $regex: searchRegex } },
                    { firstName: { $regex: searchRegex } }
                ];
            }

            if (fieldsQuery) {
                matchQuery.field = fieldsQuery;
            }

            if (statusQuery) {
                matchQuery.status = statusQuery
            }
            const result = await this.model.aggregate([
                { $match: matchQuery },
                {

                    $facet: {
                        fieldCounts: [
                            { $group: { _id: "$field", count: { $sum: 1 } } }
                        ],
                        statusCounts: [
                            { $group: { _id: "$status", count: { $sum: 1 } } }
                        ],
                        pendingStudents: [
                            { $sort: { submissionDate: -1 } },
                            { $skip: skip },

                            { $limit: perPage },
                            {
                                $project: {
                                    inscriptionId: 1,
                                    lastName: 1,
                                    firstName: 1,
                                    field: 1,
                                    submissionDate: 1,
                                    status: 1,
                                    token: 1,
                                    expiredToken: 1
                                }
                            }
                        ]
                    }
                }
            ]);

            // result est un tableau avec un seul élément
            const { fieldCounts, statusCounts, pendingStudents } = result[0];

            // Convertir arrays en objets plus simples
            const fieldCountsObj = fieldCounts.reduce((acc, cur) => {
                acc[cur._id] = cur.count;
                return acc;
            }, {});
            const statusCountsObj = statusCounts.reduce((acc, cur) => {
                acc[cur._id] = cur.count;
                return acc;
            }, {});

            return {
                pendingStudents: pendingStudents,
                fieldCounts: fieldCountsObj,
                statusCounts: statusCountsObj
            };
        } catch (error) {
            console.log(error);

            throw error;
        }
    }

    async DeleteStudent(inscriptionId, field, session = null) {
        try {
            const options = {}
            if (session) {
                options.session = session
            }
            const deletedStudent = await this.model.findOneAndDelete({ inscriptionId }, options);
            const directory = path.join(__dirname, '..', 'private', field, inscriptionId)
            try {
                await fs.access(directory);
                await fs.rm(directory, { recursive: true, force: true })
            } catch (error) {
                console.log("pas de fichier");

            }
            return deletedStudent
        } catch (error) {
            throw error
        }
    }

    async getStudentByParam(param) {
        try {
            return await this.model.find({ param })
        } catch (error) {
            throw error
        }
    }

    async getStudentByToken(token) {
        try {
            return await this.model
                .findOne({ token: token })
                .select("firstName lastName email field levelAsked inscriptionId expiredToken")
                .lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }

    async getApprovedStudentWithLessInfo(){
        try {
            return await this.model
                .find({ status: 'approved' })
                .select("firstName lastName field levelAsked inscriptionId")
                .lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }

}


module.exports = new PendingStudentQueries