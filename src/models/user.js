const mongoose = require("mongoose");
const {Schema,model} = mongoose;
var validator = require('validator');
const jwt  = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        minlength: 2,
        maxLength: 50,
        match: [/^[a-zA-Z\s'-.]+$/, 'Please enter a valid full name'],
        trim: true,
    },
    email:{
        type: String,
         required: true, 
         trim: true,
         unique: true,
         index: true,
         validate(value){
             value = validator.normalizeEmail(value);
             if(!validator.isEmail(value)){
                 throw new Error("Invalid Email Address: " + value);
                }
         }
    },
    phoneNo:{
        type: String, 
        required: true,
        unique: true,
        minLength: 10,
        maxLength: 10,
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error("Invalid Phone Number: " + value);
            }
        }
    },
    password:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        min: 18,
        max: 100
    },
    gender:{
        type: String,
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error('Gender Data is not allowed');
            }
        }
    },
    about:{
        type: String,
        default: "Hey, there I am Using Whatsapp",
    },
    photoUrl:{
        type: String,
        default: "https://th.bing.com/th/id/OIP.eGHa3HgHxIlTHmcvKNDs7AHaGe?w=860&h=752&rs=1&pid=ImgDetMain"
    },
    hobbies:{
        type: [String],
        default: ["HTML","CSS","JS"],
        validate(value){
            if(value.length>=15){
                throw new Error("Cannot add more than 15 hobbies");
            }
        }
    }
},
{
    timestamps: true
}
);


userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({_id: user._id},
        "Rishi@123$567*90",{
        expiresIn: "7d",
    });

    return token;
};

userSchema.methods.validatePassword = async function (passwoordInputByUser) {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
        passwoordInputByUser,
        passwordHash
    );


    return isPasswordValid;

}
// userSchema.methods.

const User = mongoose.model('User',userSchema);


module.exports = {
    User
}

