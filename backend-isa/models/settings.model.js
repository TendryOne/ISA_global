const mongoose = require("mongoose");
const Schema = mongoose.Schema



const settingsSchema = new Schema({
    registrationDate: {
        type: Date,
        default: null
    },
    documentReviewDate: {
        type: Date,
        default: null
    },
    resultsPublicationDate: {
        type: Date,
        default: null
    },
    finalEnrollmentDate: {
        type: Date,
        default: null
    },
    plannedStartDate: {
        type: Date,
        default: null
    },
    isResultAvailable: {
        type: Boolean,
        default: false
    },
    isInscriptionOpen: {
        type: Boolean,
        default: false
    },
    isAutomatic: {
        type: Boolean,
        default: false
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    

})



const Settings = mongoose.model("settings", settingsSchema)

module.exports = Settings