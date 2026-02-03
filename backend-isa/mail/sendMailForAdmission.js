const Resend = require("resend");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

/*
        candidateName: "Nom du candidat",
        registrationNumber: "Numéro de dossier",
        programName: "Nom de la filière",
        academicYear: "2023-2024",
        registrationLink: "https://votredomaine.com/inscription?token=ABC123",
        paymentDeadline: "Date limite de paiement",
        documentSubmissionStart: "Date début dépôt documents",
        documentSubmissionEnd: "Date fin dépôt documents"

*/

exports.SendMailForAdmission = async (email, candidateName, registrationNumber, programName, registrationLink, tuitionFees, level, paymentInstallments) => {
    const resend = new Resend.Resend("re_vWXso9Fi_DcmgQSvFzehR7AqiiW4ZPy4c");

    const templatePath = path.join(__dirname, "..", "views", "mailForAdmission.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const academicYear = new Date().getFullYear()
    const mail = "mail@isa-ambato.mg"
    const telephone = "+261 34 50 798 08"
    const htmlEmail = ejs.render(template, {
        candidateName,
        registrationNumber,
        programName,
        registrationLink: `https://www.edu.isa-ambato.mg/register?token=${registrationLink}`,
        academicYear,
        tuitionFees,
        level,
        paymentInstallments,
        mail,
        telephone,
    });


    try {
        const { data, error } = await resend.emails.send({
            from: "Institut Supérieur d'Ambatomirahavavy <support@isa-ambato.mg>",
            to: [`${email}`],
            subject: "Confirmation de votre admission à l’Institut Supérieur d’Ambatomirahavavy",
            html: htmlEmail,
        });

        if (error) {
            throw error;
        }

        console.log("Email envoyé avec succès:", data);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
    }
};