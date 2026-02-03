const env = require('dotenv');
const path = require('path')
const envPath = path.join(__dirname, '../.env');
env.config({ path: envPath })
const randomPassword = '12345678';
const mongoose = require('mongoose');
const { EncryptPassword } = require('../secure/securepassword');
const { generateMatriculeNumber, DecreaseMatriculeNumber } = require('../function/generateMatriculeNumber');
const SuperAdmin = require('../models/superAdmin.model');





async function seedAdmin() {
    try {

        const adminExists = await SuperAdmin.findOne();
        if (adminExists) {
            console.log("Super Admin already exists");
            return
        }
        const hashedPassword = await EncryptPassword(randomPassword);
        const newUser = new SuperAdmin({
            name: 'Tendry',
            firstName: 'RANAIVOSON',
            password: hashedPassword,
            function: 'IT',
            matricule: "SUP-000000",
            email: 'tendryone@hotmail.com',
            address: 'Antananarivo',
            phone: '0345079832',
            gender: 'male'

        })


        const response = await newUser.save()
        if (response) {
            console.log("super Admin created")
            return
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    seedAdmin
}