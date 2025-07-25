const { GoogleUser } = require("../models/googleUser");
const { oauth2Client } = require("../utils/googleClient");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const googleAuth = async (req, res) => {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({ error: "Authorization code is required" });
        }

        // Get tokens from Google
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        
        // Get user info from Google
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );

        const googleProfile = userRes.data;
        console.log("Google profile:", googleProfile);

        // Check if user already exists
        let user = await GoogleUser.findOne({ email: googleProfile.email });
        
        if (!user) {
            // Create new user from Google profile
            const userData = await GoogleUser.createFromGoogleProfile(googleProfile);
            user = await GoogleUser.create(userData);
            console.log("Created new Google user:", user);
        } else {
            // For existing users, only update essential Google data
            // Preserve all user customizations (photoUrl, phoneNo, etc.)
            
            // Always update the Google picture reference
            user.picture = googleProfile.picture;
            
            // Only update photoUrl if user hasn't customized it
            if (!user.photoUrl || 
                user.photoUrl === user.picture || 
                user.photoUrl === "https://th.bing.com/th/id/OIP.eGHa3HgHxIlTHmcvKNDs7AHaGe?w=860&h=752&rs=1&pid=ImgDetMain") {
                user.photoUrl = googleProfile.picture;
            }
            
            // Update verified_email status if needed
            if (googleProfile.verified_email !== undefined) {
                user.verified_email = googleProfile.verified_email;
            }
            
            // Don't touch phoneNo, age, about, gender, hobbies, etc. - these are user customizations
            
            await user.save();
            console.log("Updated existing Google user (preserved custom data):", user);
        }

        // Generate JWT token
        const token = await user.getJWT();
        
        // Set cookie with token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: 'Google login successful',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                photoUrl: user.photoUrl,
                about: user.about,
                hobbies: user.hobbies,
                age: user.age,
                gender: user.gender,
                provider: user.provider
            }
        });

    } catch (err) {
        console.error("Error during Google login:", err);
        return res.status(500).json({ 
            error: "Google login failed", 
            details: err.message 
        });
    }
}

module.exports = {
    googleAuth
}