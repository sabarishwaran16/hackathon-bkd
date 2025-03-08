const patientAccessMiddleware = (req, res, next) => {
    try {
        if (req.user[role_name] === 'patient') {
            next();
        };
        return res.status(403).send({ message: 'You are not autharized' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

const doctorAccessMiddleware = (req, res, next) => {
    try {
        if (req.user[role_name] === 'doctor') {
            next();
        };
        return res.status(403).send({ message: 'You are not autharized' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

const adminAccessMiddleware = (req, res, next) => {
    try {
        if (req.user[role_name] === 'admin') {
            next();
        };
        return res.status(403).send({ message: 'You are not autharized' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

module.exports = {
    patientAccessMiddleware,
    doctorAccessMiddleware,
    adminAccessMiddleware
};