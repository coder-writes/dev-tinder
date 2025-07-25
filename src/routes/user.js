const express = require('express');
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const connectionRequest = require('../models/connectionRequest');
const {User} = require("../models/user");


const USER_SAFE_DATA = "firstName lastName age gender photoUrl about";
userRouter.get("/user/requests/received",
    userAuth,
    async (req,res)=>{

        try{
            const loggedInUser = req.user;
            
            const connectionRequests = await connectionRequest.find({
                toUserId: loggedInUser._id,
                status: "interested"
            }).populate("fromUserId" , USER_SAFE_DATA);        
            
            
            res.json({
                message: "Following are the Connection Requests",
                data: connectionRequests,
            })
        }
        catch (err){
            res.status(400).json({
                message: err.message
            })
        }
    }
)

//api to get the connection oof the logged in user
userRouter.get("/user/connections" , userAuth , async (req,res)=>{
    
    try{
        
        const loggedInUser = req.user;
        
        console.log(loggedInUser._id);
        const connections = await connectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id, status: "accepted"},
                {toUserId: loggedInUser._id , status: "accepted"}
            ]
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId",USER_SAFE_DATA);
        
        const data = connections.map(obj=>{
            if(obj.fromUserId._id.toString()===loggedInUser._id.toString()){
                return obj.toUserId;
            }
            return obj.fromUserId;
        });
        res.json({
            message: "Following are the connection Request",
            data
        })
    }
    catch(err){
        res.status(404).json({
            message: "Error: " + err.message
        })
    }
})

userRouter.get("/feed" , userAuth , async (req,res) =>{
    
    try {
        const loggedInUser = req.user;
    
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;
    
        const connectionRequests = await connectionRequest.find({
          $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        }).select("fromUserId  toUserId");
    
        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
          hideUsersFromFeed.add(req.fromUserId.toString());
          hideUsersFromFeed.add(req.toUserId.toString());
        });
    
        const users = await User.find({
          $and: [
            { _id: { $nin: Array.from(hideUsersFromFeed) } },
            { _id: { $ne: loggedInUser._id } },
          ],
        })
          .select(USER_SAFE_DATA)
          .skip(skip)
          .limit(limit);
    
        res.json({ data: users });
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})

module.exports = userRouter;