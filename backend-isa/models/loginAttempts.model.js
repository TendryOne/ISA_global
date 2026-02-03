const mongoose = require('mongoose');
const Schema = mongoose.Schema

const loginAttemptsSchema = new Schema({
    matricule: { type: String, required: true },
    attempts: { type: Number, default: 0 },
}, {
    timestamps: true
})

loginAttemptsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 })

const LoginAttemps = mongoose.model('loginAttemps', loginAttemptsSchema)


module.exports = LoginAttemps