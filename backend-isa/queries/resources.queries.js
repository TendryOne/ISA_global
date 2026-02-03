const Resources = require("../models/ressources.model");

class RessourceQueries {
  constructor() {
    this.model = Resources;
  }

  async getResourcesByModuleProfessorPromotion(
    moduleId,
    professorId,
    promotionId
  ) {
    const query = {};
    if (moduleId) query.module = moduleId;
    if (professorId) query.professor = professorId;
    if (promotionId) query.promotion = promotionId;

    return this.model.find(query).sort({ createdAt: -1 });
  }

  async CreateRessources(data) {
    const newResource = new this.model(data);
    const saved = await newResource.save();

    return saved;
  }

  async UpdateRessources(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async DeleteRessources(id) {
    return this.model.findByIdAndDelete(id);
  }

  async getResourceById(id) {
    return this.model.findById(id);
  }
}

module.exports = new RessourceQueries();
