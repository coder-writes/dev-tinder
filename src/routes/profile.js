const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateSignupData,validateNewPassword} = require('../utils/validation');
const { validateProfileEditData } = require('../utils/validation');
const {User} = require("../models/user")
const bcrypt = require('bcrypt'); 

profileRouter.get("/profile/view", userAuth , async (req,res) => {
    const user = req.user;    
    console.log(user);
    res.send(user);
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        const isValid = validateProfileEditData(req);
        if (!isValid) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;
        const updates = req.body;

        // Update user profile with new data using updateOne method
        const updatedUser = await User.updateOne({ _id: loggedInUser._id }, updates, { new: true });

        if (!updatedUser) {
            throw new Error("User not found");
        }
        console.log(loggedInUser);
        console.log(updatedUser);
        res.json({
            message: `${loggedInUser.fullName}, your profile updated successfully`,
            data: updatedUser,
        });
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

profileRouter.patch("/profile/password/forgot",userAuth, async(req,res)=>{
    const {currPassword} = req.body;
    const {newPassword} = req.body;
    const isStrong = validateNewPassword(req,res);
    try{
        if(!isStrong){
            throw new Error("The Password is no Strong Enough");
        }
        else{

            const loggedInUser = req.user;
            const {_id} = loggedInUser;
            const result = await User.findById(_id);
            const comparePassword = result.password;
            const isPasswordValid = await bcrypt.compare(currPassword,comparePassword);
            if(isPasswordValid){
                const hashedPassword  = await bcrypt.hash(newPassword,10);
                const updatedUser = await User.updateOne({_id: loggedInUser._id},{$set:{password: hashedPassword}});
                res.send("The Password has been Successfully Changed");
            }
            else{
                throw new Error("The Current Password is incorrect");
            }
        }
    }
    catch (err){
        res.status(400).send("Error: " + err.message);
    }

});

module.exports = profileRouter;