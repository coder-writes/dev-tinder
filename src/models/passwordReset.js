const mongoose = require('mongoose');
const { Schema } = mongoose;

const passwordResetSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // Store the plain token temporarily to support OTP verification redirect.
    // This value is equivalent to what would be sent via email link.
    // Do not index this field.
    plainToken: {
        type: String,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    used: {
        type: Boolean,
        default: false
    },
    // OTP for email verification (hashed)
    otpCode: {
        type: String,
    },
    // When the OTP expires (typically short-lived, e.g., 10 minutes)
    otpExpiresAt: {
        type: Date,
    },
    // Track incorrect attempts if needed in future
    otpAttempts: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

// Index for automatic cleanup of expired tokens
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if token is valid and not expired
passwordResetSchema.methods.isValid = function() {
    return !this.used && new Date() < this.expiresAt;
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset; 