const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('db ok'))
    .catch((e) => console.log(`error :`, e))


