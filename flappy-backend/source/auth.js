require('dotenv').config();
const jwt = require('jsonwebtoken');

function generateToken(user) {
    return jwt.sign(
        {id: user.id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: '2h'}
    );
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({message: 'No token'});

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({message: 'Invalid token format'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // {id, username}
        next();
    }catch (err) {
        return res.status(401).json({message: 'invalid or expired token'});
    }
}

module.exports = {
    generateToken,
    authMiddleware,
};