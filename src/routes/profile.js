const express = require('express');
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateSignupData,validateNewPassword} = require('../utils/validation');
const { validateProfileEditData } = require('../utils/validation');
const {User} = require("../models/user");
const {GoogleUser} = require("../models/googleUser");
const bcrypt = require('bcrypt'); 

profileRouter.get("/profile/view", userAuth , async (req,res) => {
    try {
        const user = req.user;
        res.send(user);
      } catch (err) {
        res.status(400).send("ERROR : " + err.message);
      }
})

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        console.log("Profile edit request body:", req.body);
        console.log("User type:", req.userType);
        console.log("User ID:", req.user._id);
        
        const isValid = validateProfileEditData(req);
        if (!isValid) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;
        const userType = req.userType;

        // Save based on user type
        let updatedUser;
        if (userType === 'google') {
            console.log("Updating Google user with data:", req.body);
            // For Google users, update in GoogleUser collection
            updatedUser = await GoogleUser.findByIdAndUpdate(
                loggedInUser._id,
                req.body,
                { new: true, runValidators: true }
            );
            console.log("Updated Google user:", updatedUser);
        } else {
            console.log("Updating regular user with data:", req.body);
            // For regular users, update in User collection
            updatedUser = await User.findByIdAndUpdate(
                loggedInUser._id,
                req.body,
                { new: true, runValidators: true }
            );
            console.log("Updated regular user:", updatedUser);
        }

        if (!updatedUser) {
            throw new Error("User not found");
        }

        res.json({
            message: `${updatedUser.firstName}, your profile updated successfully`,
            data: updatedUser,
        });
    } catch (err) {
        console.error("Profile edit error:", err);
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