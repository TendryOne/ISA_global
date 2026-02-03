const cron = require("node-cron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Dossier local pour stocker les backups
const LOCAL_BACKUP_DIR = path.join(__dirname, "backups");

// Crée le dossier si inexistant
if (!fs.existsSync(LOCAL_BACKUP_DIR)) fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });

// Fonction pour créer le dump compressé
function createDump() {
    return new Promise((resolve, reject) => {
        const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        const dumpFile = path.join(LOCAL_BACKUP_DIR, `dump-${date}.gz`);

        // Commande mongodump
        const cmd = `mongodump --uri="mongodb://tendry:12345678@localhost:27017/ISA" --archive=${dumpFile} --gzip`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) return reject(err);
            console.log(`Dump créé : ${dumpFile}`);
            resolve(dumpFile);
        });
    });
}

// Supprimer les anciens backups > 30 jours
function rotateBackups() {
    const files = fs.readdirSync(LOCAL_BACKUP_DIR);
    const now = Date.now();

    files.forEach(file => {
        const filePath = path.join(LOCAL_BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const ageDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageDays > 30) {
            fs.unlinkSync(filePath);
            console.log(`Backup supprimé (rotation) : ${file}`);
        }
    });
}

cron.schedule("* * * * *", async () => {
    console.log("Test du cron :", new Date());
    await createDump();
    rotateBackups();
});


// Cron job quotidien à 2h du matin
// cron.schedule("0 2 * * *", async () => {
//     try {
//         console.log("Début du backup :", new Date());
//         await createDump();
//         rotateBackups();
//         console.log("Backup terminé :", new Date());
//     } catch (err) {
//         console.error("Erreur lors du backup :", err);
//     }
// }, {
//     timezone: "Africa/Nairobi"
// });
