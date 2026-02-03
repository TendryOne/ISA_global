const Resend = require("resend");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");



exports.SendMailForResetingPassword = async (email, token) => {
    const resend = new Resend.Resend("re_vWXso9Fi_DcmgQSvFzehR7AqiiW4ZPy4c");
    const resetLink = `https://www.edu.isa-ambato.mg/reset-password?tkn=${token}`
    const templatePath = path.join(__dirname, "..", "views", "mailForResetPassword.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const mail = "mail@isa-ambato.mg"
    const telephone = "+261 34 50 798 08"


    const htmlEmail = ejs.render(template, {
        resetLink,
        mail,
        telephone,
    });


    try {
        const { data, error } = await resend.emails.send({
            from: "Institut Supérieur d'Ambatomirahavavy <support@isa-ambato.mg>",
            to: [`${email}`],
            subject: "Réinitialisation de votre mot de passe",
            html: htmlEmail,
        });

        if (error) {
            throw error;
        }

        console.log("Email envoyé avec succès:", data);
    } catch (error) {
        throw error
    }
};