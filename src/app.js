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
const dotenv = require("dotenv");
dotenv.config();
app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true,
}));


const authRouter  =    require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/requests");
const userRouter = require("./routes/user");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);



const port = process.env.PORT || 7777;
connectDb().then(() => {
    console.log("connection to the database is successful");
    app.listen(port, () => console.log(`The server is running on the port http://localhost:${port}`));
}).catch((err) => {
    console.error("Database cannot be connected: " + err.message);
});
