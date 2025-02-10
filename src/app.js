const express = require("express");
const {adminAuth,userAuth} = require("./middlewares/auth.js");
const app = express();


const cb2 = function(req,res,next){
    console.log("this is the second callback");

    // next();
    res.send("Hello This response has been sent from the second callback function");
}
const cb4 = function(res,res){
    console.log("the cb4 is envoked");
}
const cb3  = function(req,res,next){
    console.log("this is third callback");
    next();
    // res.send("Hello , this response has been sent from the third callback function");
}
const cb1 = function(req,res,next){
    console.log("this is first cb1");
    next();
    // res.send("Hello , The response has been sent from the first callback funtion");
}



app.use("/test",cb1,[cb3,cb2],cb4);

app.get("/user/:userID/:name/:age",userAuth,(req,res) =>{
    console.log(req.params);
    console.log(req.query);
    res.send({
        "fName": "Rishi",
        "lName": "Verma",
        "age": 45,
        "phone no": 9453127915,
    })
});

// app.post("/user",(req,res)=>{
//     // console.log(req.pa)

//     console.log("data is succesfully saved to the database");
//     res.send("Data is Sucessfully saved to the db");
// })

// app.delete("/user",(req,res)=>{
//     console.log("Data is Deleted");
//     res.send("Data is Sucessfully Deleted from the dataBase");
// })

// // if keep adding the code of the authorization for the every request then the code will be meshy here the role of teh middlwares comes we will make a middleware function to ask for the authorization for all the incoming request on the admin portal


// app.use("/admin",adminAuth);
// app.get("/admin/getAllData",(req,res)=>{
//     // first authorise the admin to give him access get all the data of the user
//     // const token = "passwod"
//     // const isAdminAuthorised = token === "password";
//     // if(isAdminAuthorised){
//         res.send("All the data has been sent");
//     // }
//     // else{
//     //     res.status(401).send("Admin is not authorized")
//     // }
// })

// app.delete("/admin/deleteAUser",(req,res)=>{
//     //first authorise the admin to give him access delete a user
//     res.send("The user has been deleted");
// })

// app.post("/admin/addAUser",(req,res)=>{
//     //first authorise the admin to give him access add a user
//     res.send("A user has been added");
// })

// app.get("/login",(req,res)=>{
//     res.send("The login Page is here");
// })



app.listen(3000,()=>{
    console.log(`Server is running on the localhost http://localhost:3000/`);
})