const nodemailer = require('nodemailer');

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER/EMAIL_PASS missing in .env');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // Gmail App Password (not your normal password)
    },
  });
};

const sendPasswordResetEmail = async (userEmail, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: 'DevTinder - Password Reset',
      html: `<p>Click to reset:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    console.log('Mail sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending password reset email:', err);
    return false;
  }
};

const sendPasswordResetOtpEmail = async (userEmail, otpCode) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: userEmail,
      subject: 'DevTinder - Your Password Reset Code',
      html: `<p>Your password reset verification code is:</p>
             <p style="font-size:20px;font-weight:bold;letter-spacing:4px;">${otpCode}</p>
             <p>This code will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    });
    console.log('OTP mail sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('Error sending password reset OTP email:', err);
    return false;
  }
};

module.exports = { sendPasswordResetEmail, sendPasswordResetOtpEmail };