const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { MONGODB_STRING } = process.env;
if(!MONGODB_STRING){
    throw new Error("MONGODB_STRING is not defined in the environment variables");
}
const connectDb = async()=>{
   await mongoose.connect(MONGODB_STRING);
}



module.exports = {
    connectDb
}


