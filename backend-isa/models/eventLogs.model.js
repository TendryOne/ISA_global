const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'user' },
    eventType: { type: String, required: true },
    entityType: { type: String }, // 'module', 'assignment', 'submission', 'grade', 'user', etc.
    entityId: { type: Schema.Types.ObjectId },
    payload: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
});


eventLogSchema.index({ userId: 1, timestamp: -1 });
const EventLog = mongoose.model('eventLog', eventLogSchema);
module.exports = EventLog;