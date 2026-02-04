const FeesManagement = require("../models/feesManagement.model");
const promotionQueries = require("./promotion.queries");

class FeesManagementQueries {
  constructor() {
    this.model = FeesManagement;
  }

  // Créer une feesManagement
  async CreateFeesManagement(body) {
    try {
      const feesManagement = new this.model(body);
      return await feesManagement.save();
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les FeesManagements
  async GetFeesManagement(filters = {}) {
    const query = {};

    if (filters.year) query.year = Number(filters.year);
    if (filters.level) query.level = filters.level;
    if (filters.field) query.field = filters.field;

    return await FeesManagement.find(query).sort({ year: -1 });
  }

  async GetFeesManagementById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async GetFeesManagementByLevel(param) {
    try {
      return await this.model.findOne({ level: param });
    } catch (error) {
      throw error;
    }
  }

  async GetFeesManagementByFieldAndLevel(paramLevel, paramField) {
    try {
      return await this.model.findOne({ level: paramLevel, field: paramField });
    } catch (error) {
      throw error;
    }
  }

  async DeleteFeesManagement(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  async UpdateFeesManagement(id, updateData) {
    try {
      return await this.model.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async checkFeesManagementisNotOutdated(level, field, startDate) {
    try {
      const feesManagement = await this.model.findOne({
        level: level,
        field: field,
      });

      if (!feesManagement) {
        throw new Error(
          `Aucun fees management trouvé pour le niveau ${level} et la filière ${field}`
        );
      }

      // Vérifier que toutes les échéances ont des dates >= à la startDate
      const outdatedEcheances = feesManagement.echeances.filter((echeance) => {
        return new Date(echeance.date) < new Date(startDate);
      });

      if (outdatedEcheances.length > 0) {
        return {
          isValid: false,
          outdatedEcheances: outdatedEcheances.map((e) => ({
            label: e.label,
            date: e.date,
            amount: e.amount,
          })),
          message: `${outdatedEcheances.length} échéance(s) ont des dates antérieures à ${new Date(startDate).toLocaleDateString("fr-FR")}`,
        };
      }

      return {
        isValid: true,
        message: "Toutes les échéances sont valides",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FeesManagementQueries();
