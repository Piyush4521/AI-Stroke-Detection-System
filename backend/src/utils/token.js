const jwt = require("jsonwebtoken");

function generateToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || "change-this-jwt-secret",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

module.exports = {
    generateToken
};
