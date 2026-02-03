const crypto = require('crypto')
exports.generateRadomBytes = () => {
    return crypto.randomBytes(32).toString('hex')
}