const Report = require("../models/report.model");

class ReportQueries {
    constructor() {
        this.model = Report
    }

    async GetReport(page = 1, perPageQuery = 20, searchQuery = '', sortField, sortDirection) {
        try {
            const maxPerPage = 100;
            const perPage = Math.min(parseInt(perPageQuery), maxPerPage);
            const skip = (parseInt(page) - 1) * perPage;

            const query = {};

            if (searchQuery) {
                const searchRegex = new RegExp(searchQuery.trim(), 'i');
                query.$or = [
                    { action: { $regex: searchRegex } },
                    { authorId: { $regex: searchRegex } },
                    { authorName: { $regex: searchRegex } },
                    { role: { $regex: searchRegex } }
                ];
            }
            const allowedSortFields = ['createdAt', 'authorName', 'role']; // autorisés
            const sort = allowedSortFields.includes(sortField)
                ? { [sortField]: sortDirection === 'asc' ? 1 : -1 }
                : { createdAt: -1 };



            const [report, totalDocs] = await Promise.all([
                this.model.find(query).sort(sort).skip(skip).limit(perPage).lean(),
                this.model.countDocuments(query)
            ]);

            return { report, totalDocs };
        } catch (error) {
            console.error("Erreur GetReport:", error);
            throw new Error("Impossible de récupérer le rapport");
        }
    }


    async CreateReport(body, session = null) {
        try {
            const newReport = new this.model(body)
            if (session) {
                await newReport.save(session);
            } else {
                await newReport.save(session);
            }

        } catch (error) {
            throw error
        }
    }

    async GetReportByMonth(monthsAgo = 1) {
        try {
            const now = new Date(); // Date actuelle
            const start = new Date();
            start.setMonth(start.getMonth() - monthsAgo); // Recule de X mois
            let report
            if (Number(monthsAgo) !== 13) {
                report = await this.model.find({
                    createdAt: {
                        $gte: start,
                        $lte: now
                    }
                }).sort({ createdAt: -1 }).lean();
                return { report, dateOfToday: formatDate(now), dateOfStart: formatDate(start) }
            } else {
                report = await this.model.find().sort({ createdAt: -1 }).lean();
                return { report, dateOfToday: "all", dateOfStart: "all" }
            }


        } catch (error) {
            console.error("Erreur GetReportByMonth:", error);
            throw new Error("Impossible de récupérer les rapports mensuels");
        }
    }
}

function formatDate(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}


module.exports = new ReportQueries