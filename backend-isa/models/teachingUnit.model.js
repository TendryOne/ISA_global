// models/TeachingUnit.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TeachingUnitSchema = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    field: {
        type: String,
        enum: ['informatique', 'btp', 'gestion'],
        required: true
    },
    level: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
        required: true
    },
    semester: {
        type: String,
        enum: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'],
        required: true
    },
    credits: { type: Number, default: 0 },
    description: { type: String, required: true }
}, { timestamps: true })

const TeachingUnit = mongoose.model('TeachingUnit', TeachingUnitSchema)

module.exports = TeachingUnit
