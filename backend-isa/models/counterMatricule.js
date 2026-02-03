const mongoose = require('mongoose');

const CounterMatriculeSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['ETU', 'SUP', 'PRO', 'ADM'],
        uppercase: true
    },
    year: {
        type: Number,
        required: true,
        min: 2023,
        max: 2100
    },
    sequence: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

CounterMatriculeSchema.index({ role: 1, year: 1 }, { unique: true });

const CounterMatricule = mongoose.model('CounterMatricule', CounterMatriculeSchema);

module.exports = CounterMatricule