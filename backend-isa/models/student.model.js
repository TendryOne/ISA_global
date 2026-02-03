const mongoose = require('mongoose')
const User = require('./user.model')
const Schema = mongoose.Schema


const parcoursSchema = new Schema({
    promotion: { type: Schema.Types.ObjectId, ref: 'Promotion' },
    status: { type: String, enum: ['in progress', 'completed', 'dropped', 'repeated'], default: 'in progress' }
}, {
    _id: false
})

const studentSchema = new Schema({
    inscriptionId: {
        type: String,
        unique: true
    },

    identityPhoto: {
        type: String,
        required: [true, 'La photo d\'identité est requise']
    },
    birthDate: {
        type: Date,
        required: [true, 'La date de naissance est requise']
    },
    birthPlace: {
        type: String,
        required: [true, 'Le lieu de naissance est requis'],
        trim: true
    },

    cin: {
        type: String,
        sparse: true,
        trim: true,
        unique: true,
    },

    // Contact d'urgence
    emergencyContactName: {
        type: String,
        required: [true, 'Le nom du contact est requis'],
        trim: true
    },
    emergencyContactRelation: {
        type: String,
        required: [true, 'La relation du contact est requise'],
        trim: true
    },
    emergencyContactPhone: {
        type: String,
        required: [true, 'Le téléphone du contact est requis'],
        trim: true,
    },


    bacSeries: {
        type: String,
        required: [true, 'La série du BAC est requise'],
        enum: {
            values: ['A1', 'A2', 'C', 'D', 'Techniques', 'autre'],
            message: 'Série BAC non valide'
        }
    },
    bacYear: {
        type: Number,
        required: [true, 'L\'année d\'obtention du BAC est requise'],
        min: [1950, 'L\'année ne peut pas être antérieure à 1950'],
        max: [new Date().getFullYear(), 'L\'année ne peut pas être dans le futur']
    },
    previousInstitution: {
        type: String,
        required: [true, 'L\'établissement précédent est requis'],
        trim: true
    },
    field: {
        type: String,
        required: [true, 'La filière est requise'],
        enum: {
            values: ['btp', 'informatique', 'gestion'],
            message: 'Filière non valide'
        }
    },


    bacTranscript: {
        type: String,
        default: null
    },
    idDocument: {
        type: String,
        required: [true, 'Le document d\'identité est requis']
    },
    residenceCertificate: {
        type: String,
        required: [true, 'Le certificat de résidence est requis']
    },
    level: {
        type: String,
        enum: ['L1', 'L2', 'L3', "M1", "M2"],
        default: "L1"
    },
    promotionYear: {
        type: Number,
        default: new Date().getFullYear()

    }, terms: {
        cguAcceptance: {
            type: Boolean,
            default: true
        },
        privacyAcceptance: {
            type: Boolean,
            default: true
        },
        engagementAcceptance: {
            type: Boolean,
            default: true
        },
        charterAcceptance: {
            type: Boolean,
            default: true
        }
    },
    verified: {
        type: Boolean,
        default: false
    }
    ,
    parcours: [parcoursSchema],
    isRestricted: {
        type: Boolean,
        default: false
    },


})


// ===== INDEX OPTIMISÉS =====
studentSchema.index({ "parcours.promotion": 1 });
studentSchema.index({ verified: 1 });
studentSchema.index({ field: 1 });
studentSchema.index({ field: 1, level: 1 });
studentSchema.index({ "parcours.status": 1 });
studentSchema.index({ level: 1, verified: 1 });


const Student = User.discriminator('student', studentSchema);

module.exports = Student