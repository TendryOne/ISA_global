const User = require("./user.model");
const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProfessorSchema = new Schema({

    department: {
        type: [String],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.every(val => ['informatique', 'gestion', 'btp'].includes(val));
            },
            message: props => `${props.value} contient une valeur non valide`
        }
    },


    emailProfessional: {
        type: String,
    },
    hireDate: {
        type: Date,
    },
    isPermanent: {
        type: Boolean,
        default: false,
    },
    salaryType: {
        type: String, enum: ['mensuel', 'horaire'],
        default: 'mensuel'
    },
    salaryAmount: { type: Number, default: 0 },
})


const Professor = User.discriminator('professor', ProfessorSchema);

module.exports = Professor