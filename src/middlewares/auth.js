const jwt = require('jsonwebtoken');
const { User } = require("../models/user");
const { GoogleUser } = require("../models/googleUser");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        
        if (!token) {
            return res.status(401).json({ 
                error: "Unauthorized: Please Login First",
                isAuthenticated: false 
            });
        }

        const decodedObj = await jwt.verify(token, JWT_SECRET);
        const { _id, provider } = decodedObj;

        let user;
        
        // Check if it's a Google user or regular user
        if (provider === 'google') {
            user = await GoogleUser.findById(_id);
        } else {
            user = await User.findById(_id);
        }

        if (!user) {
            return res.status(401).json({ 
                error: "User not found",
                isAuthenticated: false 
            });
        }

        req.user = user;
        req.userType = provider || 'regular';
        next();
        
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ 
            error: "Invalid token: " + err.message,
            isAuthenticated: false 
        });
    }
}
module.exports = {
    userAuth,
};