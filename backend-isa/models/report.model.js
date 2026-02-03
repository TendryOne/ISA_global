const mongoose = require('mongoose')
const Schema = mongoose.Schema


const ReportSchema = new Schema({
    authorId: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    }


}, {
    timestamps: true
})

ReportSchema.index({ createdAt: -1 });       // pour trier par date
ReportSchema.index({ authorId: 1 });         // pour rechercher par utilisateur
ReportSchema.index({ role: 1 });             // pour regrouper par rôle
ReportSchema.index({ action: 'text' });      // pour recherche plein texte dans action

const Report = mongoose.model('report', ReportSchema)

module.exports = Report