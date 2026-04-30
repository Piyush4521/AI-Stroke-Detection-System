const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
    const authorizationHeader = req.headers.authorization || "";

    if (!authorizationHeader.startsWith("Bearer ")) {
        res.status(401);
        throw new Error("Authentication token is required");
    }

    const token = authorizationHeader.replace("Bearer ", "").trim();

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "change-this-jwt-secret"
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401);
            throw new Error("User not found for this token");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Invalid or expired token");
    }
});

module.exports = {
    protect
};
