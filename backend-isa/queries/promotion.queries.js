const Promotion = require("../models/promotion.model");


class PromotionQueries {
    constructor() {
        this.model = Promotion
    }

    async CreatePromotion(data, session = null) {

        const promotion = new this.model(data);

        if (session) {
            await promotion.save({ session })
            return promotion
        }
        return await promotion.save();
    }

    async GetPromotionByCriteria(level, field, startYear) {
        try {
            const promotion = await this.model.findOne({ level, field, startYear });
            return promotion;
        } catch (error) {
            throw error;
        }
    }

    async GetPromotionById(id) {
        try {
            return await this.model.findById(id).lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }
    async GetPromotionByLevelAndField(level, field) {
        try {
            return await this.model.find({ level, field }).sort({ startYear: -1 }).lean(); // 🚀 +30%
        } catch (error) {
            throw error
        }
    }

    async deletePromotion(id, session = null) {
        try {
            return await this.model.findByIdAndDelete(id, { session });
        } catch (error) {
            throw error
        }
    }

    async UpdatePromotionById(id, update, session = null) {
        try {
            const options = { new: true };
            if (session) options.session = session;

            return await this.model.findByIdAndUpdate(id, update, options);
        } catch (error) {
            throw error
        }
    }

    async GetPromotionsByName(name) {
        try {
            return await this.model.findOne({ name });
        } catch (error) {
            throw error
        }
    }

    async GetActivePromotionsForCurrentYear(field, level) {
        const currentDate = new Date();

        return await this.model.findOne({
            field,
            level,
            isActive: true,
            $or: [
                { startDate: { $lte: currentDate }, endDate: { $gte: currentDate } }, // en cours
                { startDate: { $gt: currentDate } } // futures
            ]
        }).sort({ startDate: 1 });
    }

    async GetClosestActivePromotionsOptimized(levels, departments) {
        const currentDate = new Date();

        return await this.model.aggregate([
            {
                $match: {
                    isActive: true,
                    level: { $in: levels },
                    field: { $in: departments },
                    $or: [
                        { $and: [{ startDate: { $lte: currentDate } }, { endDate: { $gte: currentDate } }] }, // en cours
                        { startDate: { $gt: currentDate } } // futures
                    ]
                }
            },
            { $sort: { startDate: 1 } },
            {
                $group: {
                    _id: { level: "$level", field: "$field" },
                    promotion: { $first: "$$ROOT" }
                }
            },
            { $replaceRoot: { newRoot: "$promotion" } }
        ]);
    }


    async GetAllActivePromotionsIdForCurrentYear() {
        const currentDate = new Date();

        return await this.model.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { $and: [{ startDate: { $lte: currentDate } }, { endDate: { $gte: currentDate } }] }, // en cours
                        { startDate: { $gt: currentDate } } // futures
                    ]
                }
            },
            { $sort: { startDate: 1 } }, // plus proche d'abord
            {
                $group: {
                    _id: { level: "$level", field: "$field" },
                    promotionId: { $first: "$_id" } // garde uniquement l’_id
                }
            },
            { $project: { _id: "$promotionId" } } // ne renvoyer que _id
        ]);
    }

    async getFuturePromotion(level, field, currentEndDate) {
        try {
            // Chercher une promotion du niveau suivant qui finit APRÈS la promotion actuelle
            // Exemple: si promotion actuelle (L1) finit le 25 oct 2025
            // → chercher promotion L2 dont endDate > 25 oct 2025
            const result = await this.model
                .findOne({
                    level,
                    field,
                    startDate: { $gt: currentEndDate }  // endDate > currentEndDate
                })
                .sort({ startDate: 1 })  // Trier par date de fin (la plus proche d'abord)
                .lean();

            return result || null;
        } catch (error) {
            throw error;
        }
    }


    async getPromotionOnYearPlage(level, field, startYear, endYear) {
        try {
            return await this.model.findOne({
                level,
                field,
                startYear: { $gte: startYear, $lte: endYear }
            }).sort({ startYear: 1 });
        } catch (error) {
            throw error;
        }
    }

    async getPromotionActive(field, level) {
        try {
            return await this.model.findOne({ field, level, isActive: true });
        } catch (error) {
            throw error;
        }
    }









}
module.exports = new PromotionQueries