const express = require("express");
const {connectDb} = require("./config/database")
const app = express();
const {User} = require("./models/user")
const validator = require('validator');
const {validateSignupData}  = require("./utils/validation")
const bcrypt = require('bcrypt');
const cookies = require('cookie-parser');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());



app.post("/login", async (req, res) => {
    const { loginId,userPassword } = req.body;
    try {
        const result = await User.findOne({
            $or: [{ email: loginId }, { phoneNo: loginId }]
        });
        if (!result) {
            throw new Error("No User with the following details Exists");
        } else {
             const {password} = result;
            bcrypt.compare(userPassword, password, function(err, isMatch) {
                if (err) {
                    res.send("Something Went Wrong: " + err.message);
                } else if (isMatch) {
                    // create a jwt token and send back to the browser
                    jwt.sign({_id: result._id}, "Rishi@123$567*90", function(err, token) {
                        if (err) {
                            throw new Error("Token is not generated");
                        }
                        console.log(token);
                        res.cookie("token", token);
                        res.send("User Validated");
                    });
                } else {
                    res.send("Invalid Credentials");
                }
            });
        }
    } catch (err) {
        if (err) console.log("Error: " + err.message);
        res.send("Error: " + err.message);
    }
});
app.post("/signup", async (req, res) => {
    const {fullName,email,phoneNo,password,age,gender,about,hobbies} = req.body;
    // first we have to validate the userData
    try {
        validateSignupData(req);
        const hashedPassword  = await bcrypt.hashSync(password,10);
        const user = new User({
            fullName,
            email,
            phoneNo,
            password: hashedPassword,
            age,
            gender,
            about,
            hobbies,
        });
        await user.save();
        res.status(201).send("User added successfully");
    } catch (err) {
            res.status(400).send("Something went wrong: " + err.message);
            console.error("Error saving user:", err.message);
        }
});


//to find a user with email address
app.get("/user",async(req,res)=>{
    const documnetToFind = (req.body);
    try{
        let result = await User.find(documnetToFind);
        if(result==0){
            res.send(`No user with the given filters is found`);
        }
        else{
            res.send(result);
        }
    }
    catch(err){
        res.status(500).send("Something Went Wrong");
    }
})



// feed api
app.get("/feed",async(req,res)=>{
    const documnetToFind = ({});
    try{
        let result = await User.find(documnetToFind);
        if(result==0){
            res.send("No user with given filters is present");
        }
        else{
            res.send(result);
        }
    }
    catch(errr){
        res.status(401).send("Something Went Wrong");
        console.log("something went wrong");
    }
})


//deleting a  user from the database
app.delete("/user", async (req,res) => {
    const documnetTodelete = req.body._id;
    try{
        const result = await User.findByIdAndDelete(documnetTodelete);
        res.send("The user has been deleted");
    }
    catch(err){
        res.status(401).send("Something Went Wrong");
        console.log("something went wrong");
    }
})

//update a user on the data base with the userId
app.patch("/user/:userId", async (req,res)=>{
    const documentToUpdate = req.params?.userId;
    const updateRequired = req.body;
    const {phoneNo,age,hobbies,password,about} = req.body;
    try {
        
            const allowedUpdates = ["age","phoneNo","about","password","hobbies"];
            const isUpdatesAllowed = Object.keys(updateRequired).every((k)=> allowedUpdates.includes(k));

            if(!isUpdatesAllowed){
                throw new Error("Updates are not allowed");
            }
        console.log(documentToUpdate);
        const hashedPassword = await bcrypt.hashSync(password,10);
        const result = await User.findOneAndUpdate({_id: documentToUpdate}, {$set: age,phoneNo,about,password: hashedPassword,hobbies},{new: true, runValidators: true});
        if (result) {
            console.log(result);
            res.send("Document is Updated Successfully");
        } else {
            res.status(404).send("Document not found")
        }
    } catch (err) {
        res.status(500).send("Something Went Wrong "  + err.message);
    }
})

app.patch("/user/email", async(req,res)=>{
    const documentToUpdate = req.body.oldEmail;
    const requiredUpdate = req.body;
    try{
        console.log(documentToUpdate);
        const result = await User.findOneAndUpdate({"email": documentToUpdate},requiredUpdate);
        if(result){
            res.send("Document is updated Sucessfully");
        }
        else{
            res.status(404).send("Document Not found");
        }
    }catch(err){
        res.status(501).send("Seomthing Went wrong");
    }
})



//GET PROFILE

app.get("/profile",userAuth, async(req,res)=>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.send("Error: "+ err.message);
    }
});
connectDb().then(()=>{
    console.log("connection to the database is successful");
    app.listen(7777,()=>console.log("the Server is running on the port http://localhost:7777"));
}).catch((err)=>{
    console.error("Database cannnot be connected" + err.message);
});
