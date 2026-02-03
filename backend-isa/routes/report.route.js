const { isSuperAdmin } = require('../middleware/AdminVerification');
const { isConnectedMiddleware } = require('../middleware/middleware.global');
const ReportQueries = require('../queries/Report.queries')

const router = require('express').Router()
const XLSX = require('xlsx')
router.get('/', isSuperAdmin, async (req, res) => {
    try {
        const { page, perPage, search, sortField, sortDirection } = req.query
        const report = await ReportQueries.GetReport(page, perPage, search, sortField, sortDirection);
        res.status(200).json(report)
    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }
})

router.post("/", isConnectedMiddleware, async (req, res) => {
    try {
        const body = req.body
        await ReportQueries.CreateReport(body)
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500);
        console.log(error);

    }
})

router.get('/export-data', isSuperAdmin, async (req, res) => {
    try {
        // Récupération des données
        const month = req.query.month
        const { dateOfStart, dateOfToday, report } = await ReportQueries.GetReportByMonth(month);
        const newData = report.map(({ _id, __v, updatedAt, ...rest }) => rest);

        // Regroupement par filière
        const superAdminRole = newData.filter(s => s.role === 'superAdmin')
        const adminRole = newData.filter(s => s.role === 'admin')
        const professorRole = newData.filter(s => s.role === 'professor')

        const workbook = XLSX.utils.book_new();

        const btpSheet = XLSX.utils.json_to_sheet(superAdminRole);
        XLSX.utils.book_append_sheet(workbook, btpSheet, "superAdmin");

        const gestionSheet = XLSX.utils.json_to_sheet(adminRole);
        XLSX.utils.book_append_sheet(workbook, gestionSheet, "admin");

        const infoSheet = XLSX.utils.json_to_sheet(professorRole);
        XLSX.utils.book_append_sheet(workbook, infoSheet, "Professor");

        // Génération du fichier Excel en mémoire
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer"
        });


        const filename = `logs-${dateOfStart}-${dateOfToday}.xlsx`;
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer).status(200);
    } catch (error) {
        console.error("Erreur lors de l'export :", error);
        res.sendStatus(500);
    }
});



module.exports = router