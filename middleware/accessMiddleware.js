
export const patientAccessMiddleware = (req, res, next) => {
    try {
        if (req.user[role_name] === 'patient') {
            next(); // Pass to the next middleware/route handler
        };
        return res.status(403).send({ message: 'You are not autharized' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};

export const doctorAccessMiddleware = (req, res, next) => {
    try {
        if (req.user[role_name] === 'doctor') {
            next(); // Pass to the next middleware/route handler
        };
        return res.status(403).send({ message: 'You are not autharized' });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred during authentication' });
    }
};