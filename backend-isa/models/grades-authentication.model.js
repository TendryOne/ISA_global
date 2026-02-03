const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GradesAuthenticationSchema = new Schema({
    promotion : { type: Schema.Types.ObjectId, ref: 'Promotion', required: true },
    student : { type: Schema.Types.ObjectId, ref: 'user', required: true },
    UniqueToken : { type: String, required: true },
}, { timestamps: true });

GradesAuthenticationSchema.index({ promotion: 1, student: 1 }, { unique: true });

const GradesAuthentication = mongoose.model('GradesAuthentication', GradesAuthenticationSchema);

module.exports = GradesAuthentication;