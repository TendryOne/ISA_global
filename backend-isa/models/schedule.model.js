const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
    promotions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Promotion' }],
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
    title: { type: String, required: true },
    description: { type: String },
    room: { type: String, default: null },
    courseType: { type: String, enum: ['cm', 'td', 'tp', "exam", "other"], default: 'cm' },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format "HH:MM"
    endTime: { type: String, required: true },   // Format "HH:MM"
    duration: { type: Number, required: true }, // en minutes
    type: { type: String, enum: ['presentiel', 'distanciel', 'hybride'], default: 'presentiel' },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    googleMeetLink: { type: String, default: null },
    department: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    status: { type: String, enum: ['pending', 'missed', 'done'], default: 'pending' },
    studentReclamations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    approvedByCron: { type: Boolean, default: false },
    approvedManuallyAfterCronBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null }

}, { timestamps: true });

ScheduleSchema.index({ promotions: 1, module: 1, date: 1, startTime: 1, endTime: 1 });
ScheduleSchema.index({ module: 1, promotions: 1, status: 1 });

const Schedule = mongoose.model("Schedule", ScheduleSchema);
module.exports = Schedule;
