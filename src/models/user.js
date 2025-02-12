const mongoose = require("mongoose");
const {Schema,model} = mongoose;


const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email:{
        type: String,
         required: true, 
         unique: true,
    },
    phoneNo:{
        type: String, 
        required: true,
         unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    age:{
        type: Number,
        required: true,
    },
    gender:{
        type: String,
        required: true,
    },
    
});


const User = model('User',userSchema);


module.exports = {
    User
}

