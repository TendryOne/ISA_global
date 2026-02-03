const Counter = require("../models/counter.model");

/**
 * Génère un numéro d'inscription unique pour un étudiant
 * @param {string} filiere - Code de la filière (INFO, BTP, GES)
 * @param {Object} session - Session MongoDB pour la transaction (OBLIGATOIRE)
 * @returns {Promise<string>} - Numéro d'inscription formaté (ex: ETU-INFO-2025-0001)
 * 
 * @example
 * const session = await mongoose.startSession();
 * session.startTransaction();
 * try {
 *   const inscriptionNumber = await generateInscriptionNumber('INFO', session);
 *   // ... autres opérations ...
 *   await session.commitTransaction();
 * } catch (error) {
 *   await session.abortTransaction(); // Rollback automatique du compteur
 * }
 */
exports.generateInscriptionNumber = async (filiere, session = null) => {
    try {
        if (!session) {
            throw new Error('⚠️ generateInscriptionNumber doit être appelé avec une session MongoDB pour garantir l\'intégrité transactionnelle');
        }

        const currentYear = new Date().getFullYear();

        const counter = await Counter.findOneAndUpdate(
            { filiere, year: currentYear },
            { $inc: { sequence: 1 } },
            { upsert: true, new: true, session }
        );

        return `ETU-${filiere}-${currentYear}-${counter.sequence.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error('Erreur lors de la génération du numéro d\'inscription:', error);
        throw error;
    }
}

/**
 * @deprecated Cette fonction n'est plus nécessaire car le rollback des transactions MongoDB
 * gère automatiquement la décrémentation du compteur en cas d'erreur.
 * 
 * ❌ NE PLUS UTILISER - Sera supprimée dans une prochaine version
 * 
 * Utilisez plutôt les transactions MongoDB :
 * @example
 * const session = await mongoose.startSession();
 * session.startTransaction();
 * try {
 *   const inscriptionNumber = await generateInscriptionNumber('INFO', session);
 *   // ... opérations ...
 *   await session.commitTransaction(); // ✅ Commit si tout est OK
 * } catch (error) {
 *   await session.abortTransaction(); // ✅ Rollback automatique du compteur
 * }
 */
exports.DecreaseInscriptionNumberSequence = async (filiere) => {
    console.warn('⚠️ DEPRECATED: DecreaseInscriptionNumberSequence() ne devrait plus être utilisé. Utilisez les transactions MongoDB à la place.');
    
    try {
        const currentYear = new Date().getFullYear();

        const counter = await Counter.findOneAndUpdate(
            { filiere, year: currentYear },
            { $inc: { sequence: -1 } },
            { new: true }
        );

        if (!counter) {
            console.warn(`Aucun compteur trouvé pour ${filiere}-${currentYear}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Erreur lors de la décrémentation du compteur:', error);
        return false;
    }
}