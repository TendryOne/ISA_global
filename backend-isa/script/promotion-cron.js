const cron = require("node-cron");
const Promotion = require("../models/promotion.model");
const mongoose = require("mongoose");

exports.StartPromotionCron = function () {

    cron.schedule("0 0 * * *", async () => {
        try {
            // Vérifier que MongoDB est connecté
            if (mongoose.connection.readyState !== 1) {
                console.warn("⚠️  Cron Promotion: MongoDB pas prêt, skip");
                return;
            }

            const now = new Date();

            const result = await Promotion.updateMany(
                { endDate: { $lte: now }, isActive: true },
                { $set: { isActive: false } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ ${result.modifiedCount} promotions désactivées`);
            }
        } catch (err) {
            console.error("❌ Erreur dans le cron job :", err.message);
        }
    }, {
        timezone: "Indian/Antananarivo"
    });
}





