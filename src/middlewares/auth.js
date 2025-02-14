const jwt = require('jsonwebtoken');
const {User} = require("../models/user");
const mongoose = require('mongoose');

const userAuth = async (req,res,next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error("Token is not Valid");
        }
        const decodedObj = jwt.verify(token,"Rishi@123$567*90");
        const {_id} = decodedObj;
        const user = await User.findById(_id);
        if(!user){
            throw new Error("User Not found");
        }
        req.user = user
        next();
    }
    catch(err){
        res.status(400).send("Error: "+ err.message);
    }  


}
module.exports = {
    userAuth,
};