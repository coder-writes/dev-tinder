const mongoose = require("mongoose");
const { Schema, model } = mongoose;
var validator = require('validator');
const jwt = require('jsonwebtoken');

const googleUserSchema = new Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxLength: 50,
        match: [/^[a-zA-Z\s'-.]+$/, 'Please enter a valid First name'],
        trim: true,
    },
    lastName: {
        type: String,
        minlength: 2,
        maxLength: 50,
        match: [/^[a-zA-Z\s'-.]+$/, 'Please enter a valid last name'],
        trim: true,
        default: ""
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        index: true,
        validate(value) {
            value = validator.normalizeEmail(value);
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email Address: " + value);
            }
        }
    },
    phoneNo: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        minLength: 10,
        maxLength: 10,
        validate(value) {
            if (value && !validator.isMobilePhone(value)) {
                throw new Error("Invalid Phone Number: " + value);
            }
        }
    },
    age: {
        type: Number,
        min: 18,
        max: 100
    },
    gender: {
        type: String,
        validate(value) {
            if (value && !["male", "female", "other", "Prefer Not to Say"].includes(value)) {
                throw new Error('Gender Data is not allowed');
            }
        }
    },
    about: {
        type: String,
        default: "Eat, Sleep, Code, Repeat",
    },
    photoUrl: {
        type: String,
        default: function() {
            return this.picture || "https://th.bing.com/th/id/OIP.eGHa3HgHxIlTHmcvKNDs7AHaGe?w=860&h=752&rs=1&pid=ImgDetMain";
        }
    },
    picture: {
        type: String, // Google profile picture
    },
    hobbies: {
        type: [String],
        default: ["HTML", "CSS", "JS"],
        validate(value) {
            if (value.length >= 15) {
                throw new Error("Cannot add more than 15 hobbies");
            }
        }
    },
    // Google-specific fields
    verified_email: {
        type: Boolean,
        default: false
    },
    locale: {
        type: String,
        default: "en"
    },
    // Authentication provider
    provider: {
        type: String,
        default: "google"
    }
},
{
    timestamps: true
});

googleUserSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign(
        { _id: user._id, provider: 'google' },
        process.env.JWT_SECRET || "Rishi@123$567*90",
        { expiresIn: "7d" }
    );
    return token;
};

// Method to convert Google profile to our format
googleUserSchema.statics.createFromGoogleProfile = async function(googleProfile) {
    const nameParts = googleProfile.name ? googleProfile.name.split(' ') : ['User'];
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData = {
        googleId: googleProfile.sub || googleProfile.id,
        firstName: firstName,
        lastName: lastName,
        email: googleProfile.email,
        photoUrl: googleProfile.picture,
        picture: googleProfile.picture,
        verified_email: googleProfile.verified_email || false,
        locale: googleProfile.locale || 'en'
    };

    return userData;
};

const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

module.exports = {
    GoogleUser
};
