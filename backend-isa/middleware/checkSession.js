exports.checkSession = async (req, res, next) => {
    try {
        if (req.session) {
            console.log(req.session);

            next()
        }
    } catch (error) {
        res.sendStatus(403);
    }
}