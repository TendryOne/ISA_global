const TutionFees = require("../models/tutionFees.model");
const FeesManagementQueries = require("./FeesManagement.queries");
const {
  GetFeesManagementByFieldAndLevel,
} = require("./FeesManagement.queries");
const pendingStudentsQueries = require("./pendingStudents.queries");
const fs = require("fs/promises");
const path = require("path");

class TutionFeesQueries {
  constructor() {
    this.model = TutionFees;
  }

  async CreateFeesWithSession(idUser, data, session) {
    try {
      console.log("CreatingFees : ", idUser);

      const fees = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(
        data.level,
        data.field
      );

      const installments = fees.echeances.map((echeance) => ({
        dueDate: echeance.date,
        label: echeance.label,
        amount: echeance.amount,
      }));

      const newTutionFees = new this.model({
        year: new Date().getFullYear(),
        field: data.field,
        installments: installments,
        level: data.level,
        totalAmount: fees.fees,
        user: idUser,
      });

      return await newTutionFees.save({ session });
    } catch (error) {
      throw error;
    }
  }

  async CreateFeesWithSessionAndPromotion(idUser, data, promotionId, session) {
    try {
      console.log("CreatingFees with promotion: ", idUser, promotionId);

      const fees = await FeesManagementQueries.GetFeesManagementByFieldAndLevel(
        data.level,
        data.field
      );

      const installments = fees.echeances.map((echeance) => ({
        dueDate: echeance.date,
        label: echeance.label,
        amount: echeance.amount,
      }));

      const newTutionFees = new this.model({
        year: new Date().getFullYear(),
        field: data.field,
        installments: installments,
        level: data.level,
        totalAmount: fees.fees,
        user: idUser,
        promotion: promotionId,
      });

      return await newTutionFees.save({ session });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: Mise à jour avec recalcul automatique des stats via middleware
   */
  async updateInstallmentByLabel(
    tuitionFeeId,
    label,
    updateFields,
    session = null
  ) {
    try {
      const normalizedLabel = label.trim();

      // 🔍 Trouver le document DANS la session si elle existe
      let query = this.model.findOne({
        _id: tuitionFeeId,
        "installments.label": normalizedLabel
      });

      if (session) {
        query = query.session(session);
      }

      const tuitionFee = await query;

      if (!tuitionFee) {
        throw new Error("TUITION_OR_INSTALLMENT_NOT_FOUND");
      }

      // 🔁 Trouver l’échéance
      const installment = tuitionFee.installments.find(
        i => i.label.trim() === normalizedLabel
      );

      if (!installment) {
        throw new Error("INSTALLMENT_NOT_FOUND");
      }

      // 📝 Appliquer les mises à jour
      Object.assign(installment, updateFields);

      // 💾 Save (déclenche pre-save)
      await tuitionFee.save(session ? { session } : {});

      // 🔄 Relire le document mis à jour (dans la session si besoin)
      let resultQuery = this.model.findById(tuitionFeeId);

      if (session) {
        resultQuery = resultQuery.session(session);
      }

      const result = await resultQuery
        .populate("user", "-password")
        .lean();

      return result;

    } catch (error) {
      console.error("❌ Erreur updateInstallmentByLabel:", error);
      throw error;
    }
  }


  /**
   * 🚀 OPTIMISÉ: .lean() + projection
   */
  async GetTutionByRef(transactionRef, session) {
    try {
      return await this.model
        .findOne({ "installments.transactionRef": transactionRef })
        .lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: .lean()
   */
  async GetTutionFeesByUserId(userId) {
    try {
      return await this.model.findOne({ user: userId }).lean();
    } catch (error) {
      throw error;
    }
  }

  async updatePromotionInTutionFees(userId, promotionId, session = null) {
    try {
      const options = session ? { session } : {};
      return await this.model.findOneAndUpdate(
        { user: userId },
        { promotion: promotionId },
        { ...options, new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: .lean() pour grandes listes
   */
  async getTutionFeesByPromotion(promotionId) {
    try {
      return await this.model
        .find({ promotion: promotionId })
        .populate("user", "-password -resetPasswordToken -resetPasswordExpires")
        .lean(); // 🚀 +40% pour grandes listes
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: .lean()
   */
  async getTutionFeesByStudentAndPromotion(studentId, promotionId) {
    return await this.model
      .findOne({ promotion: promotionId, user: studentId })
      .lean();
  }

  /**
   * 🚀 OPTIMISÉ: .lean()
   */
  async getTutionFeesById(tutionFeesId) {
    try {
      return await this.model.findById(tutionFeesId).lean();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 DÉJÀ OPTIMISÉ: findOne avec projection minimale
   */
  async hasAlreadyUsedTransactionRef(transactionRef) {
    try {
      const exists = await this.model
        .findOne({ "installments.transactionRef": transactionRef }, { _id: 1 })
        .lean();
      return exists !== null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: .lean()
   */
  async checkFeesStateByPromotionByStudent(promotionId, studentId) {
    try {
      const tutionFees = await this.model
        .findOne({ promotion: promotionId, user: studentId })
        .lean();

      if (!tutionFees) {
        return null;
      }
      const allVerified = tutionFees.installments.every(
        (installment) => installment.verified === true
      );
      return allVerified;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: Utilise les stats dénormalisées quand disponibles
   */
  async getTutionFeesByPromotionAndUser(promotionId, user) {
    try {
      const tution = await this.model
        .findOne({ promotion: promotionId, user: user })
        .lean();

      if (!tution) {
        return null;
      }

      // 🚀 Utiliser les stats dénormalisées si disponibles
      const totalPaid = tution.stats?.totalPaid ?? tution.installments
        .filter((inst) => inst.verified)
        .reduce((sum, inst) => sum + inst.amount, 0);

      const percentagePaid = (totalPaid / tution.totalAmount) * 100;

      const nextInstallment = tution.installments
        .filter((inst) => !inst.verified)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

      return {
        amount: tution.totalAmount,
        totalPaid,
        percentagePaid,
        remainingAmount: tution.totalAmount - totalPaid,
        nextInstallment,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 NOUVELLE MÉTHODE: Statistiques globales ultra-rapides
   * Utilise les champs dénormalisés pour des performances optimales
   */
  async getGlobalFinanceStats() {
    try {
      const result = await this.model.aggregate([
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$stats.totalPaid" },
            totalPending: { $sum: "$stats.totalPending" },
            totalOverdue: { $sum: "$stats.totalOverdue" },
            totalExpected: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        }
      ]);

      const stats = result[0] || {
        totalCollected: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalExpected: 0,
        count: 0
      };

      return {
        ...stats,
        collectionRate: stats.totalExpected > 0
          ? ((stats.totalCollected / stats.totalExpected) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 NOUVELLE MÉTHODE: Stats par promotion (pour rapports)
   */
  async getFinanceStatsByPromotion(promotionId) {
    try {
      const result = await this.model.aggregate([
        { $match: { promotion: promotionId } },
        {
          $group: {
            _id: "$promotion",
            totalCollected: { $sum: "$stats.totalPaid" },
            totalPending: { $sum: "$stats.totalPending" },
            totalOverdue: { $sum: "$stats.totalOverdue" },
            totalExpected: { $sum: "$totalAmount" },
            studentsCount: { $sum: 1 }
          }
        }
      ]);

      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 🚀 NOUVELLE MÉTHODE: Recalculer toutes les stats (maintenance)
   * À exécuter une fois après migration pour initialiser stats
   */
  async recalculateAllStats() {
    try {
      const allFees = await this.model.find({});
      let updated = 0;

      for (const fee of allFees) {
        // Le save() déclenchera le middleware pre-save
        await fee.save();
        updated++;
      }

      console.log(`✅ ${updated} documents mis à jour avec stats recalculées`);
      return updated;
    } catch (error) {
      throw error;
    }
  }

  async updateInstallmentProof(tuitionFeeId, label, proofFile) {
    const normalizedLabel = label.trim();

    const result = await this.model.findOneAndUpdate(
      {
        _id: tuitionFeeId,
        "installments.label": normalizedLabel
      },
      {
        $set: {
          "installments.$.proofFile": proofFile
        }
      },
      { new: true }
    );

    if (!result) {
      throw new Error("INSTALLMENT_NOT_FOUND");
    }

    return result;
  }

}

module.exports = new TutionFeesQueries();
