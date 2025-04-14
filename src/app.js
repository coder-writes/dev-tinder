const express = require("express");
const { connectDb } = require("./config/database")
const app = express();
const { User } = require("./models/user")
const validator = require('validator');
const { validateSignupData } = require("./utils/validation")
const bcrypt = require('bcrypt');
const cookies = require('cookie-parser');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");
const cors = require("cors");
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));


const authRouter  =    require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);



connectDb().then(() => {
    console.log("connection to the database is successful");
    app.listen(7777, () => console.log("the Server is running on the port http://localhost:7777"));
}).catch((err) => {
    console.error("Database cannnot be connected: " + err.message);
});
