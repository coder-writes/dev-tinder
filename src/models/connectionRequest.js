const mongoose = require('mongoose');
const { Schema }  = mongoose;

const connectionRequestSchema = new Schema({
    fromUserId:{
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: "User",
        required: true,
    },
    toUserId:{
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref:"User",
        required: true,
    },
    status:{
        type: String,
        required: true,
        enum: {
         values: ["accepted","rejected","ignored","interested"],
         message: `{VALUE} is an incorrect status type`,
        },
    },
},
{timestamps: true}
);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;

    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send the Connection Request to Yourself");
    }
    next();
});

const connectionRequestModel = mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema,
);

module.exports = connectionRequestModel;