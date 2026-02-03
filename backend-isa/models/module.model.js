// models/Module.js
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ModuleSchema = new Schema({
    code: { type: String, required: true, unique: true }, // e.g. MATH101
    title: { type: String, required: true }, // e.g. "Analyse 1"
    coefficient: { type: Number, required: true },
    credits: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }, // prof responsable
    teachingUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingUnit' }, // UE parent
    type: {
        type: String,
        enum: ['Cours Magistral', 'TD', 'TP'],
        default: 'Cours Magistral'
    },
    hours: { type: Number, required: true },
    description: { type: String, required: true },
    // Liens (relatifs au dossier "private") vers les supports PDF du module
    files: { type: [String], default: [] }
}, { timestamps: true })

const Module = mongoose.model('Module', ModuleSchema)

module.exports = Module
