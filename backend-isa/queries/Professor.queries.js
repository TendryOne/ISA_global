const Professor = require("../models/professor.model");

class ProfessorQueries {
    constructor() {
        this.model = Professor
    }

    async getProfessorByDepartment(department) {
        try {
            return await this.model.find({ department }).lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }
    async getAllProfessors() {
        try {
            return await this.model.find().select('-password').lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }

    async CreateProfessor(data, session = null) {
        try {
            const professor = new this.model(data);
            if (session) {
                return await professor.save({ session });
            }
            return await professor.save();
        } catch (error) {
            throw error
        }
    }

    async getProfessorById(id, includeSalary = false) {
        try {

            const projection = includeSalary
                ? "-password"  // on récupère tout sauf le password
                : "-password -salaryType -salaryAmount"; // masque aussi le salaire

            return await this.model.findById(id).select(projection).lean(); // 🚀 +30%
        } catch (error) {
            throw error;
        }
    }


    async UpdateProfessor(id, data, session = null) {
        try {
            const options = { new: true, runValidators: true };
            if (session) options.session = session;

            return await this.model.findByIdAndUpdate(id, data, options).select('-password');
        } catch (error) {
            throw error
        }
    }

}
module.exports = new ProfessorQueries