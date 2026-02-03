const TeachingUnit = require("../models/teachingUnit.model");
const ModuleQueries = require("./Module.queries");

class TeachingUnitQueries {
  constructor() {
    this.model = TeachingUnit;
  }

  async CreateTeachingUnit(body, session = null) {
    try {
      const newTeachingUnit = new this.model(body);
      if (session) {
        return await newTeachingUnit.save({ session });
      } else {
        return await newTeachingUnit.save();
      }
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitByCode(code) {
    try {
      return await this.model.findOne({ code: code.toLowerCase() });
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitByFieldAndBySemester(field, semester) {
    try {
      return await this.model.find({ field, semester });
    } catch (error) {
      throw error;
    }
  }

  async updateTeachingUnitById(id, update, session = null) {
    try {
      const options = {};
      if (session) options.session = session;
      return await this.model.findByIdAndUpdate(id, update, {
        ...options,
        new: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async deleteTeachingUnitById(id, session = null) {
    try {
      return await this.model.findByIdAndDelete(id, { session });
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitByField(field) {
    try {
      return await this.model.find({ field });
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitByLevel(level) {
    try {
      return await this.model.find({ level }).lean();
    } catch (error) {
      throw error;
    }
  }

  async getTeachingUnitsByLevelAndFieldWithModulesNumber(level, field) {
    try {
      // Count total modules for all teaching units matching level and field
      const result = await this.model.aggregate([
        { $match: { level, field } },
        {
          $lookup: {
            from: "modules",
            localField: "_id",
            foreignField: "teachingUnit",
            as: "modules",
          },
        },
        {
          $group: {
            _id: null,
            totalModules: { $sum: { $size: "$modules" } },
          },
        },
      ]);

      return result[0]?.totalModules || 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TeachingUnitQueries();
