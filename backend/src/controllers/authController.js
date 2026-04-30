const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { generateToken } = require("../utils/token");

function sanitizeUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
}

function buildAuthResponse(user) {
    return {
        token: generateToken(user._id.toString()),
        user: sanitizeUser(user)
    };
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Name, email, and password are required");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
        res.status(409);
        throw new Error("An account with this email already exists");
    }

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
    });

    res.status(201).json(buildAuthResponse(user));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    res.json(buildAuthResponse(user));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.json({ user: sanitizeUser(req.user) });
});

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser
};
