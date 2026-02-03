const mongoose = require("mongoose")
const Schema = mongoose.Schema

const AssignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    module: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    promotion: { type: Schema.Types.ObjectId, ref: "Promotion", required: true },
    professor: { type: Schema.Types.ObjectId, ref: "user", required: true },
    fileUrl: { type: String },
    type: { type: String, enum: ['homework', 'project', 'exam'], required: true },
    session: { type: String, enum: ['normal', 'rattrapage'], default: 'normal' },
    submissionLocation: { type: String, enum: ['online', 'in-person'], default: 'online' },
    isActive: { type: Boolean, default: true },
    lockedGrade: { type: Boolean, default: false }
}, {
    timestamps: true
})

const Assignment = mongoose.model("Assignment", AssignmentSchema)

module.exports = Assignment
