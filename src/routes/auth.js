const express = require('express');
const bcrypt = require('bcrypt'); 
const  {User}  = require('../models/user');
const {validateSignupData} = require("../utils/validation");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    const {fullName,email,phoneNo,password,age,gender,about,hobbies} = req.body;
    // first we have to validate the userData
    try {
        validateSignupData(req);
        const hashedPassword  = await bcrypt.hash(password,10);
        const user = new User({
            fullName,
            email,
            phoneNo,
            password: hashedPassword,
            age,
            gender,
            about,
            hobbies,
        });
        await user.save();
        res.status(201).send("User added successfully");
    } catch (err) {
            res.status(400).send("Something went wrong: " + err.message);
            console.error("Error saving user:", err.message);
        }
});

authRouter.post("/login", async (req,res) => {
    const {loginId,password} = req.body;
    try{
        const result = await User.findOne({
            $or: [{email: loginId},{phoneNo: loginId}],
        });

        if(!result){
            throw new Error("No User With the following credentials present");
        }
        const hashedPassword = result.password;
        console.log(hashedPassword);
        console.log(password);
        const isPasswordValid = await bcrypt.compare(password,hashedPassword);
        if(isPasswordValid){
            const token = await result.getJWT();
            res.cookie("token", token);
            res.send("Login Sucessful");
        }else{
            res.send("Invalid Credentials");
        }
    }catch(err){
        res.send("Error: " + err.message);

    }
})

authRouter.post("/logout", async (req,res) => {
    try{
        res.clearCookie("token");    
        res.send("User is logged out Successfully");
    }catch(err){
        res.send("Error: " + err.message);
    }
})
module.exports = authRouter;