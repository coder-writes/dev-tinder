const express = require('express');
const { userAuth } = require("../middlewares/auth");
const requestRouter  = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const {User} = require("../models/user"); // Ensure this path is correct and the User model is properly exported in ../models/user
const mongoose = require('mongoose');


requestRouter.post(
    "/request/send/:status/:toUserId",
    userAuth,
    async (req,res) =>{

        try{
            const fromUserId = req.user._id;
            const toUserId = req.params.toUserId;
            const status = req.params.status;
               
            // if(fromUserId==toUserId){
            //     return res.status(400).json({
            //         message: "Cannot send the Connection Request to the yourself"
            //     })
            // }
            const toUser = await User.findById(toUserId);
            if(!toUser){
                return res.status(400).json({
                    message: "The User does not exist"
                })
            } 
            
            const validStatus  = ["interested","ignored"];
            if(!validStatus.includes(status)){
                return res.status(400).json({
                    message: "Invalid Status Type: " + status
                });
            }

            const isExisitingConnectionRequest = await ConnectionRequest.findOne({
                $or: [
                    {fromUserId,toUserId},
                    {fromUserId: toUserId , toUserId: fromUserId}
                ]
            })
            if(isExisitingConnectionRequest){
                return res.status(400).json({
                    message: "The connection request already exists"
                })
            }
            const connectionRequest = new ConnectionRequest({

                fromUserId,toUserId,status
            })
            const data = await connectionRequest.save();
    
    
            res.json({
              message: req.user.fullName + " is " + status + " in " + toUser.fullName,
              data  
            })
        }
        catch (err){
            res.status(400).send("Error: " + err.message);
        }
    }
)
requestRouter.post(
    "/request/review/:status/:requestId",
    userAuth,
    async (req, res) => {
      try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
  
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({ messaage: "Status not allowed!" });
        }

  
        const connectionRequest = await ConnectionRequest.findOne({
        //   _id: requestId,
          toUserId: loggedInUser._id,
          status: "interested",
        });
        if (!connectionRequest) {
          return res
            .status(404)
            .json({ message: "Connection request not found" });
        }
  
        connectionRequest.status = status;
  
        const data = await connectionRequest.save();
  
        res.json({ message: "Connection request " + status, data });
      } catch (err) {
        res.status(400).send("ERROR: " + err.message);
      }
    }
);

module.exports = requestRouter;