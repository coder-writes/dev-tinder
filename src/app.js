const express = require("express");


const app = express();

app.use("/home",(req,res)=>{
    res.send("Hello from the  Side");
})

app.use("/contact",(req,res)=>{
    res.send("These are all the contacts");
})


app.listen(3000,()=>{
    console.log(`Server is running on the localhost http://localhost:3000/`);
})