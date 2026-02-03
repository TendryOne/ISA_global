const fs = require('fs');
const path = require('path')

exports.createFileDirectory = (sectorName, studentInscriptionId) => {
    try {
        const pathToPrivateFiles = path.join(__dirname, '..', 'private', 'inscription', sectorName, studentInscriptionId);
        fs.mkdirSync(pathToPrivateFiles, { recursive: true });
        return pathToPrivateFiles
    } catch (error) {
        console.log(error);

    }
}

exports.createFileDirectoryUserProof = (matricule) => {
    try {
        const pathToPrivateFiles = path.join(__dirname, '..', 'private', 'user', matricule, 'proof');
        fs.mkdirSync(pathToPrivateFiles, { recursive: true });
        return pathToPrivateFiles
    } catch (error) {
        console.log(error);

    }
}

exports.deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du fichier :', err);
        } else {
            console.log('Fichier supprimé avec succès :', filePath);
        }
    });
};