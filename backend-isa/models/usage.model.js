const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const usageSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        date: { type: Date, required: true },
        hoursTracked: { type: Number, required: true, default: 0 },
    },
    { timestamps: true }
);


usageSchema.index({ user: 1, date: 1 }, { unique: true });
const Usage = mongoose.model(
    "Usage",
    usageSchema
);
module.exports = Usage;