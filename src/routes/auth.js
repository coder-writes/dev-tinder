const express = require('express');
const bcrypt = require('bcrypt'); 
const  {User}  = require('../models/user');
const {validateSignupData} = require("../utils/validation");
const PasswordReset = require('../models/passwordReset');
const { sendPasswordResetEmail, sendWelcomeEmail, sendPasswordResetOtpEmail } = require('../utils/emailService');
const crypto = require('crypto');
const validator = require('validator');

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    const {firstName,lastName,emailId,password} = req.body;
    // first we have to validate the userData
    try {
        validateSignupData(req);
        const hashedPassword  = await bcrypt.hash(password,10);
        const user = new User({
            firstName,
            lastName,
            email: emailId,
            password: hashedPassword
        });
                const savedUser = await user.save();
         const token = await savedUser.getJWT();
 
        res.cookie("token", token, {
       expires: new Date(Date.now() + 8 * 3600000),
     });
 
      res.json({ message: "User Added successfully!", data: savedUser });
      
      // Send welcome email (optional)
      try {
          await sendWelcomeEmail(emailId, firstName);
      } catch (emailError) {
          console.log('Welcome email failed to send:', emailError.message);
      }
    } catch (err) {
            console.log(err.message);
            res.status(400).send("Something went wrong: " + err.message);
        }
});

authRouter.post("/login", async (req,res) => {
    const {emailId,password} = req.body;
    try{
        const result = await User.findOne({
            $or: [{email: emailId},{phoneNo: emailId}],
        });

        if(!result){
            throw new Error("No User With the following credentials present");
        }
        const hashedPassword = result.password;
        const isPasswordValid = await bcrypt.compare(password,hashedPassword);
        if(isPasswordValid){
            const token = await result.getJWT();
            res.cookie("token", token ,{
                httpOnly: true,
                secure: true,
                sameSite: "None",
            });
            res.send(result);
        
        }else{
            res.status(401).send("Invalid Credentials");
        }
    }catch(err){
        res.status(401).send("Error: " + err.message);

    }
})

authRouter.post("/logout", async (req,res) => {
    try{
        res.clearCookie("token",{
             httpOnly: true,
             secure: true,          
             sameSite: "None"
        });    
        res.send("User is logged out Successfully");
    }catch(err){
        res.send("Error: " + err.message);
    }
})

// Forgot Password - Request Reset
authRouter.post("/auth/password/forgot", async (req, res) => {
    try {
        const { emailId } = req.body;
        
        if (!emailId) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        // Find user by email
        const user = await User.findOne({ email: emailId });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
        }
        
        // Generate secure token for reset URL
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Generate 6-digit OTP code and hash it for storage
        const otpCode = (Math.floor(100000 + Math.random() * 900000)).toString();
        const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
        
        // Create password reset record
        const passwordReset = new PasswordReset({
            userId: user._id,
            token: hashedToken,
            plainToken: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour for final reset
            otpCode: hashedOtp,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes for OTP
            otpAttempts: 0,
        });
        
        await passwordReset.save();
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        // Send OTP email instead of direct link
        const emailSent = await sendPasswordResetOtpEmail(emailId, otpCode);
        
        if (emailSent) {
            res.json({ message: "If an account with that email exists, an OTP has been sent to your email." });
        } else {
            res.status(500).json({ message: "Failed to send OTP email. Please try again." });
        }
        
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

// Verify OTP and return reset URL token
authRouter.post("/auth/password/verify-otp", async (req, res) => {
    try {
        const { emailId, otp } = req.body;
        if (!emailId || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email: emailId });
        if (!user) {
            // do not reveal existence
            return res.status(400).json({ message: "Invalid OTP or expired" });
        }

        // Find the latest unused reset request with a valid OTP
        const resetRecord = await PasswordReset.findOne({
            userId: user._id,
            used: false,
            otpExpiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!resetRecord || !resetRecord.otpCode) {
            return res.status(400).json({ message: "Invalid OTP or expired" });
        }

        // Rate limit attempts (optional)
        if (resetRecord.otpAttempts >= 5) {
            return res.status(429).json({ message: "Too many attempts. Request a new code." });
        }

        const hashedInput = crypto.createHash('sha256').update(otp.toString()).digest('hex');
        if (hashedInput !== resetRecord.otpCode) {
            resetRecord.otpAttempts = (resetRecord.otpAttempts || 0) + 1;
            await resetRecord.save();
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid. Option 1: immediately mark OTP as used by clearing it.
        resetRecord.otpCode = null;
        resetRecord.otpExpiresAt = null;
        resetRecord.otpAttempts = 0;
        await resetRecord.save();

        // Return the reset URL token to the client to navigate to the reset page
        // Or we could also set a short-lived session/cookie. For SPA, returning token is fine.
        return res.json({
            message: "OTP verified",
            resetToken: resetRecord.plainToken,
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});
// Reset Password - Set New Password
authRouter.post("/auth/password/reset/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }
        
        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find valid password reset record
        const passwordReset = await PasswordReset.findOne({
            token: hashedToken,
            used: false,
            expiresAt: { $gt: new Date() }
        });
        
        if (!passwordReset) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }
        
        // Validate password strength
        if (!validator.isStrongPassword(newPassword)) {
            return res.status(400).json({ message: "Password is not strong enough" });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update user password
        await User.findByIdAndUpdate(passwordReset.userId, {
            password: hashedPassword
        });
        
        // Mark token as used
        passwordReset.used = true;
        await passwordReset.save();
        
        res.json({ message: "Password has been reset successfully. You can now login with your new password." });
        
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

module.exports = authRouter;