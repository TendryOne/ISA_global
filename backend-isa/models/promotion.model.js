const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const promotionSchema = new Schema({
    name: { type: String, default: null, unique: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    level: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    field: { type: String, default: null },
}, { timestamps: true });

// ===== INDEX OPTIMISÉS =====
promotionSchema.index({ level: 1, field: 1 });
promotionSchema.index({ isActive: 1 });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ field: 1, level: 1, startDate: 1 });

const Promotion = mongoose.model("Promotion", promotionSchema);
module.exports = Promotion;