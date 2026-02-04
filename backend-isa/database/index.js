const mongoose = require('mongoose');

console.log('🔌 Connexion à MongoDB...');
console.log('📍 URI:', process.env.MONGODB_URI ? 'Défini' : '❌ Non défini');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((e) => {
        console.error('❌ Erreur de connexion MongoDB:', e.message);
        console.error('Stack:', e.stack);
    })


