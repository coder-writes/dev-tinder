const express = require('express');
const bcrypt = require('bcrypt'); 
const  {User}  = require('../models/user');
const {validateSignupData} = require("../utils/validation");
const { googleAuth } = require("../controllers/authControllers");
const authRouter = express.Router();

authRouter.get("/google", googleAuth);

authRouter.post("/signup", async (req, res) => {
    const {firstName,lastName,emailId,phoneNo,password,age,gender,about,hobbies} = req.body;
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
            
            // Set cookie with proper options
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
            
            // Send user data without password
            const userResponse = {
                _id: result._id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                photoUrl: result.photoUrl,
                about: result.about,
                hobbies: result.hobbies,
                age: result.age,
                gender: result.gender,
                phoneNo: result.phoneNo
            };
            
            res.json({
                message: "Login successful",
                user: userResponse
            });
        
        }else{
            res.status(401).json({error: "Invalid Credentials"});
        }
    }catch(err){
        res.status(401).send("Error: " + err.message);

    }
})

authRouter.post("/logout", async (req,res) => {
    try{
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });    
        res.json({message: "User logged out successfully"});
    }catch(err){
        res.status(500).json({error: "Error during logout: " + err.message});
    }
})
module.exports = authRouter;