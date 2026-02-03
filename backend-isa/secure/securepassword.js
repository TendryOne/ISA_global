const argon2 = require('argon2')

exports.EncryptPassword = async (password) => {
    try {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 32768,
            timeCost: 2,
            parallelism: 2,
            hashLenth: 32,
            saltLength: 16
        });
    } catch (error) {
        throw error

    }
}


exports.VerifyPasswordMatch = async (hashedPassword, password) => {
    try {
        const result = await argon2.verify(hashedPassword, password)
        return result
    } catch (error) {
        throw error
    }
};