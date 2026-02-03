const BugReport = require("../models/bugReport.model");

class BugReportQueries {
  constructor() {
    this.model = BugReport;
  }

  async createBugReport(data) {
    try {
      const bug = new this.model(data);
      return await bug.save();
    } catch (error) {
      throw error;
    }
  }

  async getAllbugReports(
    pageQuery,
    perPageQuery,
    priorityQuery,
    isResolvedQuery,
    reporterMatricule,
    typeQuery
  ) {
    try {
      const filter = {};

      if (reporterMatricule && reporterMatricule.trim() !== "") {
        const searchRegex = new RegExp(reporterMatricule.trim(), "i");
        filter.reporterMatricule = { $regex: searchRegex };
      }

      if (typeQuery && typeQuery.trim() !== "") {
        filter.type = typeQuery;
      }

      if (priorityQuery && priorityQuery.trim() !== "") {
        filter.priority = priorityQuery;
      }

      if (
        isResolvedQuery !== undefined &&
        isResolvedQuery !== null &&
        isResolvedQuery !== ""
      ) {
        filter.isResolved =
          isResolvedQuery === "true" || isResolvedQuery === true;
      }

      const perPage = parseInt(perPageQuery) || 10;
      const limit = Math.min(perPage, 50);
      const page = parseInt(pageQuery) || 1;
      const skip = (page - 1) * limit;

      const bugReports = await this.model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const totalBugReports = await this.model.countDocuments(filter);

      return { bugReports, totalBugReports };
    } catch (error) {
      throw error;
    }
  }

  async getReportById(reportId) {
    try {
      return await this.model
        .findById(reportId)
        .populate("reporter", "firstName name matricule ")
        .lean();
    } catch (error) {
      throw error;
    }
  }

  async updateBugReport(reportId, updateData) {
    try {
      return await this.model
        .findByIdAndUpdate(reportId, updateData, { new: true })
        .lean();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BugReportQueries();
