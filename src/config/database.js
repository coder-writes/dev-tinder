const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const { MONGODB_URI } = process.env;
if(!MONGODB_URI){
    throw new Error("MONGODB_URI is not defined in the environment variables");
}



const connectDB = async()=>{
    try{
        mongoose.connection.on('connected' , ()=> console.log("Database Connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}`);
    }catch(err){
        console.log(err.message);
    }
}


module.exports = {
    connectDB
}


