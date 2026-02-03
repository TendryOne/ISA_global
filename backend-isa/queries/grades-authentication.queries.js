const crypto = require('crypto');
const { hashToken } = require("../function/HashToken");
const GradesAuthentication = require("../models/grades-authentication.model");


class gradesAuthenticationQueries {
    constructor() {
        this.model = GradesAuthentication
    }

    async CreateGradesAuthentication(promotion, student) {
        try {
            // Supprimer l'ancien token s'il existe
            await this.model.deleteOne({ student, promotion });

            const token = crypto.randomBytes(32).toString('hex');
            const gradesAuth = new this.model({
                promotion,
                student,
                UniqueToken: hashToken(token),
            })
            await gradesAuth.save();
            return token;
        } catch (error) {
            throw error;
        }
    }

    async getGradesAuthenticationByStudentAndPromotion(studentId, promotionId) {
        try {
            return await this.model.findOne({
                student: studentId,
                promotion: promotionId
            });
        } catch (error) {
            throw error;
        }
    }

    async checkTokenExists(token) {
        try {
            const hashedToken = hashToken(token);
            console.log("Checking token:", hashedToken);
            const record = await this.model.findOne({ UniqueToken: hashedToken });
            return record !== null;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = new gradesAuthenticationQueries()

