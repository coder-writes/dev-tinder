const jwt = require('jsonwebtoken');
const {User} = require("../models/user");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const {JWT_SECRET} = process.env;
if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in the environment variables");
}
const userAuth = async (req,res,next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).send("Unauthorized: Please Login First");
        }
        // console.log("Token received:", token);
        // console.log("JWT_SECRET:", JWT_SECRET);
        const decodedObj = await jwt.verify(token, JWT_SECRET);
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