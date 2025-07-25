const express = require('express');
const userRouter = express.Router();
const {userAuth} = require("../middlewares/auth");
const connectionRequest = require('../models/connectionRequest');
const {User} = require("../models/user");
const {GoogleUser} = require("../models/googleUser");


const USER_SAFE_DATA = "firstName lastName age gender photoUrl about";
userRouter.get("/user/requests/received",
    userAuth,
    async (req,res)=>{

        try{
            const loggedInUser = req.user;
            
            const connectionRequests = await connectionRequest.find({
                toUserId: loggedInUser._id,
                status: "interested"
            });
            
            // Manually populate fromUserId from both User and GoogleUser collections
            const populatedRequests = await Promise.all(
                connectionRequests.map(async (request) => {
                    let fromUser = null;
                    
                    // First try to find in regular User collection
                    fromUser = await User.findById(request.fromUserId).select(USER_SAFE_DATA);
                    
                    // If not found, try GoogleUser collection
                    if (!fromUser) {
                        fromUser = await GoogleUser.findById(request.fromUserId).select(USER_SAFE_DATA);
                    }
                    
                    return {
                        ...request.toObject(),
                        fromUserId: fromUser
                    };
                })
            );
            
            // Filter out requests where we couldn't find the user in either collection
            const validRequests = populatedRequests.filter(request => request.fromUserId !== null);
            
            res.json({
                message: "Following are the Connection Requests",
                data: validRequests,
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
        });
        
        // Manually populate both fromUserId and toUserId from both collections
        const populatedConnections = await Promise.all(
            connections.map(async (connection) => {
                let fromUser = null;
                let toUser = null;
                
                // Populate fromUserId
                fromUser = await User.findById(connection.fromUserId).select(USER_SAFE_DATA);
                if (!fromUser) {
                    fromUser = await GoogleUser.findById(connection.fromUserId).select(USER_SAFE_DATA);
                }
                
                // Populate toUserId
                toUser = await User.findById(connection.toUserId).select(USER_SAFE_DATA);
                if (!toUser) {
                    toUser = await GoogleUser.findById(connection.toUserId).select(USER_SAFE_DATA);
                }
                
                return {
                    ...connection.toObject(),
                    fromUserId: fromUser,
                    toUserId: toUser
                };
            })
        );
        
        const data = populatedConnections.map(obj=>{
            if(obj.fromUserId && obj.fromUserId._id.toString()===loggedInUser._id.toString()){
                return obj.toUserId;
            }
            return obj.fromUserId;
        }).filter(user => user !== null); // Filter out any null users
        
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
        const userType = req.userType; // 'google' or 'regular'
    
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
    
        // Get users from both collections
        const regularUsers = await User.find({
          $and: [
            { _id: { $nin: Array.from(hideUsersFromFeed) } },
            { _id: { $ne: loggedInUser._id } },
          ],
        })
          .select(USER_SAFE_DATA)
          .skip(skip)
          .limit(Math.ceil(limit / 2));

        const googleUsers = await GoogleUser.find({
          $and: [
            { _id: { $nin: Array.from(hideUsersFromFeed) } },
            { _id: { $ne: loggedInUser._id } },
          ],
        })
          .select(USER_SAFE_DATA)
          .skip(skip)
          .limit(Math.ceil(limit / 2));

        // Combine and shuffle the results
        const allUsers = [...regularUsers, ...googleUsers].slice(0, limit);
        
        // Shuffle array for better diversity
        for (let i = allUsers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allUsers[i], allUsers[j]] = [allUsers[j], allUsers[i]];
        }
    
        res.json({ 
          data: allUsers,
          message: `Found ${allUsers.length} users for feed`
        });
      } catch (err) {
        console.error("Feed error:", err);
        res.status(400).json({ 
          message: "Error fetching feed: " + err.message 
        });
      }
})

module.exports = userRouter;