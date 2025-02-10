const mongoose = require("mongoose");

const connectDb = async()=>{
   await mongoose.connect("mongodb+srv://risshi_codes:U5rfIRbXyAoFmTQz@namastenode.hfv93.mongodb.net/devTinder");
}



module.exports = {
    connectDb,
}


