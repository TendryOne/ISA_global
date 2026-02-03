const Resend = require("resend");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

exports.SendMailForSuccessAdmission = async (email, matricule, password) => {
    const resend = new Resend.Resend("re_vWXso9Fi_DcmgQSvFzehR7AqiiW4ZPy4c");
    const templatePath = path.join(__dirname, "..", "views", "mailForSuccesAdmission.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const mail = "mail@isa-ambato.mg"
    const telephone = "+261 34 50 798 08"

    const htmlEmail = ejs.render(template, {
        matricule,
        password,
        mail,
        telephone,
    });

    try {
        const { data, error } = await resend.emails.send({
            from: "Institut Supérieur d'Ambatomirahavavy <admission@isa-ambato.mg>",
            to: [`${email}`],
            subject: "Confirmation d'inscription - Vos identifiants ISA",
            html: htmlEmail,
        });

        if (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            throw error;
        }

        console.log("Email de confirmation envoyé avec succès à:", email);
        return data;
    } catch (error) {
        console.error("Erreur dans SendRegistrationConfirmation:", error);
        throw error;
    }
};