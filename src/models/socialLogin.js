const mongoose = require("mongoose");
const { Schema } = mongoose;

const socialLoginSchema = new Schema({
    name:{
        type: String,
    },
    email:{
        type: String
    },
    image:{
        type: String
    }
});

const userModel = mongoose.model("SocialLogin", socialLoginSchema);

module.exports = userModel;
