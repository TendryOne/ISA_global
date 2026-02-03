const AdministrativeRequest = require("../models/administrative-requests.model");

class AdministrativeRequestsQueries {
  constructor() {
    this.model = AdministrativeRequest;
  }

  async checkStudentPendingAndInProgressRequest(
    studentId,
    promotionId,
    requestType
  ) {
    return await this.model.findOne({
      student: studentId,
      promotion: promotionId,
      requestType: requestType,
      status: { $in: ["pending", "in-progress"] },
    });
  }

  async CreateAdministrativeRequest(requestData) {
    const request = new this.model(requestData);
    const savedRequest = await request.save();
    return await this.model
      .findById(savedRequest._id)
      .populate("promotion", "name level field")
      .populate("handledBy", "firstName name ");
  }

  async getAdministrativeRequestById(requestId) {
    return await this.model.findById(requestId);
  }

  async patchAdministrativeRequest(requestId, updateData) {
    return await this.model
      .findByIdAndUpdate(requestId, updateData, {
        new: true,
      })
      .populate("student", "firstName name matricule level field")
      .populate("promotion", "name level field")
      .populate("handledBy", "firstName name ");
  }

  async getAdministrativeRequestsByCriteria(
    pageQuery,
    perPageQuery,
    statusQuery,
    searchQuery,
    requestTypeQuery
  ) {
    const query = {};

    if (statusQuery) {
      query.status = statusQuery;
    }

    if (requestTypeQuery) {
      query.requestType = requestTypeQuery;
    }

    if (searchQuery && searchQuery.trim() !== "") {
      query.$or = [{ matricule: { $regex: searchQuery, $options: "i" } }];
    }
    const page = parseInt(pageQuery) || 1;
    const perPage = parseInt(perPageQuery) || 10;
    const skip = (page - 1) * perPage;

    const total = await this.model.countDocuments(query);
    const requests = await this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(perPage)
      .populate("student", "firstName name matricule level field")
      .populate("promotion", "name level field")
      .populate("handledBy", "firstName name ");
    return { total, requests };
  }

  async getAdministrativeRequestByStudentId(studentId) {
    return await this.model
      .find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate("promotion", "name level field")
      .populate("handledBy", "firstName name");
  }

  async getAdministrativeRequestByStudentForDashboard(studentId) {
    try {
      // Use parallel queries for better performance
      const [recentRequests, statusCounts] = await Promise.all([
        // Get 5 most recent requests
        this.model
          .find({ student: studentId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),

        // Count requests by status using aggregation
        this.model.aggregate([
          { $match: { student: studentId } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      // Transform statusCounts array to object for easier access
      const statusCountsObj = {
        pending: 0,
        "in-progress": 0,
        recoverable: 0,
        delivered: 0,
        cancelled: 0,
      };

      statusCounts.forEach((item) => {
        statusCountsObj[item._id] = item.count;
      });

      return {
        recentRequests,
        statusCounts: statusCountsObj,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdministrativeRequestsQueries();
