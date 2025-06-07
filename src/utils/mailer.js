const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const crypto = require('crypto');
dotenv.config(); 
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASSWORD  
  }
});


function sendPasswordResetEmail(userEmail, resetToken) {
  const resetLink = `http://localhost:3000/resetPassword/${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER , 
    to: userEmail, 
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetLink}" style="color:blue;">here</a> to reset password.</p>`,
  };
  return transporter.sendMail(mailOptions);
}

async function sendVerificationEmail(email, token){
  const url = `http://localhost:3001/api/users/verifyEmail?token=${token}`;
  const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email Address to register',
      html: `<p>Click <a href="${url}" style="color:blue;">here</a>  To verify your email address and complete your Registration process.If you did not request this, please disregard this message.</p>`,
  };
  try {
      await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({
      status: false,
      message: error.message,
      data: null
    })
      
  }
};


function sendOtpEmail(userEmail, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER ,
    to: userEmail,
    subject: 'Your One-Time Password (OTP)',
    html: `
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `,
  };
  return transporter.sendMail(mailOptions);
}

// Generate OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999);
}
module.exports = { sendPasswordResetEmail, sendVerificationEmail, sendOtpEmail, generateOtp };