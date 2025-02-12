const express = require("express");
const {connectDb} = require("./config/database")
const app = express();
const {User} = require("./models/user")

app.use(express.json());

app.post("/signup", async (req, res) => {
    const userData = req.body;
    try {
        const user = new User(userData);
        await user.save();
        res.status(201).send("User added successfully");
        console.log("User added successfully");
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).send("Duplicate entry detected: Email or phone number already exists");
            console.log("Duplicate entry error:", err.message);
        } else {
            res.status(500).send("Something went wrong: " + err.message);
            console.error("Error saving user:", err);
        }
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
app.patch("/user", async (req,res)=>{
    const documentToUpdate = req.body.userId;
    const updateRequired = req.body;
    try {
        console.log(documentToUpdate);
        console.log(updateRequired);
        const result = await User.findOneAndUpdate({_id: documentToUpdate}, {$set: updateRequired}, {new: true});
        if (result) {
            res.send("Document is Updated Successfully");
        } else {
            res.status(404).send("Document not found");
        }
    } catch (err) {
        res.status(500).send("Something Went Wrong");
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
connectDb().then(()=>{
    console.log("connection to the database is successful");
    app.listen(7777,()=>console.log("the Server is running on the port http://localhost:7777"));
}).catch((err)=>{
    console.error("Database cannnot be connected");
});
