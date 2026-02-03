const mongoose = require('mongoose')
const User = require('./user.model')
const Schema = mongoose.Schema

const SuperAdminSchema = new Schema({

    function: {
        type: String,
        required: true,
        enum: ['RH', 'Scolarite', 'PDG', 'IT', 'Finance', 'Support']
    }

})


const SuperAdmin = User.discriminator('superAdmin', SuperAdminSchema);

module.exports = SuperAdmin