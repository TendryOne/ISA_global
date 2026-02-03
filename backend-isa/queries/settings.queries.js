const Settings = require("../models/settings.model");

class SettingsQueries {
    constructor() {
        this.model = Settings
    }

    async CreateSettings(data) {
        try {

            const newSettings = new this.model(data);
            return await newSettings.save();

        } catch (error) {
            throw error
        }
    }

    async UpdateSettings(id, data) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true })
        } catch (error) {
            throw error
        }
    }


    async GetSettings() {
        try {
            return await this.model.findOne()
        } catch (error) {
            throw error
        }
    }

    async CheckIfStatusAutomatic() {
        try {
            const settings = await this.model.findOne();
            return settings ? settings.isAutomatic : false;
        } catch (error) {
            throw error
        }
    }

    async UpdateAutoSettings(updates) {
        try {
            const settings = await this.model.findOne();
            if (!settings) {
                throw new Error('Aucun paramètre trouvé');
            }

            Object.assign(settings, updates);
            return await settings.save();
        } catch (error) {
            throw error
        }
    }

    async UpdateInscriptionStatus(isOpen) {
        try {
            return await this.UpdateAutoSettings({ isInscriptionOpen: isOpen });
        } catch (error) {
            throw error
        }
    }

    async UpdateResultStatus(isAvailable) {
        try {
            return await this.UpdateAutoSettings({ isResultAvailable: isAvailable });
        } catch (error) {
            throw error
        }
    }

    async UpdateSettingsWithReschedule(id, data) {
        try {
            const result = await this.model.findByIdAndUpdate(id, data, { new: true });

            // Si les dates ou le mode automatique ont changé, reprogrammer les tâches
            const dateFields = ['registrationDate', 'finalEnrollmentDate', 'resultsPublicationDate', 'isAutomatic'];
            const hasDateChanges = dateFields.some(field => data.hasOwnProperty(field));

            if (hasDateChanges) {
                // Importer et exécuter la reprogrammation
                const { rescheduleJobsAfterSettingsUpdate } = require('../script/resultAndInscription');
                await rescheduleJobsAfterSettingsUpdate();
            }

            return result;
        } catch (error) {
            throw error
        }
    }

    async UpdateAutoSettingsWithReschedule(updates) {
        try {
            const settings = await this.model.findOne();
            if (!settings) {
                throw new Error('Aucun paramètre trouvé');
            }

            // Vérifier si des dates importantes changent
            const dateFields = ['registrationDate', 'finalEnrollmentDate', 'resultsPublicationDate', 'isAutomatic'];
            const hasDateChanges = dateFields.some(field => updates.hasOwnProperty(field));

            Object.assign(settings, updates);
            const result = await settings.save();

            if (hasDateChanges) {
                // Reprogrammer les tâches si des dates ont changé
                const { rescheduleJobsAfterSettingsUpdate } = require('../script/resultAndInscription');
                await rescheduleJobsAfterSettingsUpdate();
            }

            return result;
        } catch (error) {
            throw error
        }
    }


}

module.exports = new SettingsQueries