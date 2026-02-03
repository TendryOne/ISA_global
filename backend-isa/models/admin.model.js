const mongoose = require('mongoose')
const User = require('./user.model')
const Schema = mongoose.Schema

const AdminSchema = new Schema({

    function: {
        type: String,
        required: true,
        enum: ['RH', 'Scolarite', 'PDG', 'IT', 'Finance', 'Support']
    }

})


const Admin = User.discriminator('admin', AdminSchema);

module.exports = Admin