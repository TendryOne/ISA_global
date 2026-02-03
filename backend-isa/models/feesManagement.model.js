const mongoose = require("mongoose");

const EcheanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    label: {
        type: String,
        required: true,
    }
});

const FeesManagementSchema = new mongoose.Schema({
    level: {
        type: String,
        required: true
    },

    field: {
        type: String,
        enum: ['gestion', 'informatique', 'btp']
    },

    fees: {
        type: Number,
        required: true
    },
    echeances: {
        type: [EcheanceSchema],
        default: []
    },

}, {
    timestamps: true
});

const FeesManagement = mongoose.model("FeesManagement", FeesManagementSchema);

module.exports = FeesManagement
