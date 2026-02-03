const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingStudentSchema = new Schema({
    inscriptionId: {
        type: String,
        required: true,
        unique: true
    },
    identityPhoto: {
        type: String,
        required: [true, 'La photo d\'identité est requise']
    },
    firstName: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
        minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
        set: v => {
            if (!v) return "";
            return v
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");
        }
    },
    lastName: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        set: v => v.toUpperCase()
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
    gender: {
        type: String,
        required: [true, 'Le genre est requis'],
        enum: {
            values: ['male', 'female'],
            message: 'Le genre doit être soit "male" soit "female"'
        }
    },
    cin: {
        type: String,
        sparse: true,
        trim: true,
        unique: true,
    },

    address: {
        type: String,
        required: [true, 'L\'adresse est requise'],
        trim: true,
        minlength: [10, 'L\'adresse doit contenir au moins 10 caractères']
    },
    phone: {
        type: String,
        required: [true, 'Le numéro de téléphone est requis'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'L\'email est requis'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide'],
        set: v => v.toLowerCase()
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

    lastDiploma: {
        type: String,
        required: [true, 'Le dernier diplôme est requis'],
        enum: {
            values: ['Bepc', 'bac', 'licence'],
            message: 'Diplôme non valide'
        }
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

    transactionNumber: {
        type: String,
        required: [true, 'Le numéro de transaction est requis'],
        trim: true,
        unique: true
    },


    submissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    acceptingTerms: {
        type: Boolean,
        default: true
    },
    rejectionReason: {
        type: String,
        default: null
    },
    levelAsked: {
        type: String,
        enum: ["L1", "L2", "L3", "M1", "M2"],
        default: "L1"
    },
    token: {
        type: String,
        default: null
    },
    expiredToken: {
        type: Boolean,
        default: false
    }



}, {
    timestamps: true
});

pendingStudentSchema.index({ status: 1 });
pendingStudentSchema.index({ field: 1 });




const PendingStudent = mongoose.model('PendingStudent', pendingStudentSchema);

module.exports = PendingStudent;