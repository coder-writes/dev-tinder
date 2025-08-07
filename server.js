const express = require("express");
const { connectDB } = require("./src/config/database")
const app = express();
const { User } = require("./src/models/user")
const validator = require('validator');
const { validateSignupData } = require("./src/utils/validation")
const bcrypt = require('bcrypt');
const cookies = require('cookie-parser');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./src/middlewares/auth");
const cors = require("cors");
const dotenv = require("dotenv");

// Create an async function to initialize the server
async function startServer() {
    dotenv.config();
    
    app.use(express.json());
    await connectDB();
    app.use(cookieParser());
    
    app.use(cors({
        origin: [
            "https://dev-tinder-frontend-main.vercel.app",
            "http://localhost:5173",
            "https://dev-tinder-ax9m.onrender.com",
            "www.devtinder.engineer",
            "https://www.devtinder.engineer",
            "https://legendary-waffle-r4rpvxgr79vvcx5pw-5173.app.github.dev"
        ],
        credentials: true,
    }));

    const authRouter = require("./src/routes/auth");
    const profileRouter = require("./src/routes/profile");
    const requestRouter = require("./src/routes/requests");
    const userRouter = require("./src/routes/user");

    app.get("/", (req, res) => {
        res.send("Welcome to DevTinder Backend");
    });
    
    app.use("/", authRouter);
    app.use("/", profileRouter);
    app.use("/", requestRouter);
    app.use("/", userRouter);

    const port = process.env.PORT || 7777;

    app.listen(port, () => {
        console.log(`The Server is running on the port http://localhost:${port}`);
    });
}

// Start the server
startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
});