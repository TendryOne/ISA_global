const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    filiere: {
        type: String,
        required: true,
        enum: ['BTP', 'INFO', 'GES'],
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

CounterSchema.index({ filiere: 1, year: 1 }, { unique: true });

const Counter = mongoose.model('Counter', CounterSchema);

module.exports = Counter