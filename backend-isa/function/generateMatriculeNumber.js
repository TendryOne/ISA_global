const CounterMatricule = require("../models/counterMatricule");

exports.generateMatriculeNumber = async (role, session) => {
    try {
        const year = new Date().getFullYear()
        const counter = await CounterMatricule.findOneAndUpdate(
            { role, year },
            { $inc: { sequence: 1 } },
            { upsert: true, new: true, session }
        );

        return `${role}-${year.toString().slice(-2)}${counter.sequence.toString().padStart(4, '0')}`;
    } catch (error) {
        console.log(error);

    }
}


exports.DecreaseMatriculeNumber = async (role) => {
    try {
        const year = new Date().getFullYear()
        const counter = await CounterMatricule.findOneAndUpdate(
            { role, year },
            { $inc: { sequence: -1 } },
            { upsert: true, new: true }
        );

        return `${role}-${year.toString().slice(-2)}${counter.sequence.toString().padStart(4, '0')}`;
    } catch (error) {
        console.log(error);

    }
}