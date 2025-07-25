const express = require('express');
const bcrypt = require('bcrypt'); 
const  {User}  = require('../models/user');
const {validateSignupData} = require("../utils/validation");

const authRouter = express.Router();

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
            phoneNo,
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
            res.cookie("token", token);
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
        res.clearCookie("token");    
        res.send("User is logged out Successfully");
    }catch(err){
        res.send("Error: " + err.message);
    }
})
module.exports = authRouter;