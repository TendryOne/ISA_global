const mongoose = require('mongoose');
require('dotenv').config();

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/isa');
        
        const User = require('./models/user.model');
        const Student = require('./models/student.model');
        
        const allUsers = await User.countDocuments({});
        const students = await Student.countDocuments({});
        const usersWithDiscriminator = await User.countDocuments({ __t: 'student' });
        
        console.log('\n📊 Statistiques de la base de données:');
        console.log('Total users (collection users):', allUsers);
        console.log('Students (via Student model):', students);
        console.log('Users avec __t: "student":', usersWithDiscriminator);
        
        const sampleStudent = await Student.findOne().select('matricule firstName name field level verified isRestricted').lean();
        console.log('\n📋 Exemple d\'étudiant:', sampleStudent);
        
        const allDocs = await User.find({}).limit(5).select('matricule __t role').lean();
        console.log('\n📄 Premiers documents dans users:', allDocs);
        
        await mongoose.connection.close();
        console.log('\n✅ Vérification terminée');
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkStudents();
