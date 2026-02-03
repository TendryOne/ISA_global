const Resend = require("resend");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");



exports.SendMailForPasswordGive = async (email, password, matriculeNumber) => {
    const resend = new Resend.Resend("re_vWXso9Fi_DcmgQSvFzehR7AqiiW4ZPy4c");

    const templatePath = path.join(__dirname, "..", "views", "mailForPasswordGive.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const mail = "mail@isa-ambato.mg"
    const telephone = "+261 34 50 798 08"
    const htmlEmail = ejs.render(template, {
        temporaryPassword: password,
        matriculeNumber,
        mail,
        telephone,
    });


    try {
        const { data, error } = await resend.emails.send({
            from: "Institut Supérieur d'Ambatomirahavavy <support@isa-ambato.mg>",
            to: [`${email}`],
            subject: "Détails de votre compte",
            html: htmlEmail,
            headers: {
                'X-Mailer': 'ISA Mail Service',
                'X-Priority': '1',
                'X-MSMail-Priority': 'High'
            }
        });

        if (error) {
            throw error;
        }

        console.log("Email envoyé avec succès:", data);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email:", error);
    }
};