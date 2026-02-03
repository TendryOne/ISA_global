const usage = require("../models/usage.model");
const mongoose = require("mongoose");

class usageQueries {
    constructor() {
        this.model = usage
    }

    async trackHours(userId, date, hours, session = null) {
        try {
            await this.model.updateOne(
                { user: userId, date: date },
                { $inc: { hoursTracked: hours } },
                { upsert: true, session: session }
            );

        } catch (error) {
            console.log(error);
        }
    }

    async syncHours(sessions = [], session = null) {
        try {
            const ops = sessions.map(s => {
                const d = new Date(s.date);
                d.setHours(0, 0, 0, 0);
                return {
                    updateOne: {
                        filter: { user: s.user, date: d },
                        update: { $inc: { hoursTracked: s.hours } },
                        upsert: true
                    }
                }
            });

            if (ops.length > 0) {
                await this.model.bulkWrite(ops, { session });
            }

        } catch (error) {
            console.log(error);
        }
    }

    async getUserUsage(userId, year) {
        try {

            // Convertir userId en ObjectId si c'est une string
            const userObjectId = typeof userId === 'string'
                ? new mongoose.Types.ObjectId(userId)
                : userId;

            return await this.model.aggregate([
                {
                    $match: {
                        user: userObjectId,
                        date: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        date: 1,
                        hoursTracked: 1
                    }
                }


            ]);


        } catch (error) {
            throw error;
        }
    }

}

module.exports = new usageQueries();