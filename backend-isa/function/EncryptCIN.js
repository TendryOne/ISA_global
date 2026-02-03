const crypto = require("crypto");
const dotenv = require("dotenv");
const path = require("path");

// __dirname = dossier courant de ce fichier JS
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
// ⚠️ En production, stocke cette clé dans une variable d'environnement !
// Exemple : process.env.ENCRYPTION_KEY

// Fonction de chiffrement
function encryptCIN(cin) {
  const iv = crypto.randomBytes(16); // vecteur d'initialisation
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, iv);

  let encrypted = cipher.update(cin, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  // On retourne tout ce qu’il faut pour déchiffrer plus tard
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// Fonction de déchiffrement
function decryptCIN(encryptedData) {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}



module.exports = { encryptCIN, decryptCIN };


