const User = require('../models/User')
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email.js');

exports.forgotPassword = async (req,res) => {
    const {email} = req.body;
    try {
        const user = await User.findOne({email})
        
        if(!user){
            return res.status(200).json({
                message:'Password reset link sent to your email if the accaunt exists!'
            })
        }
        const resetToken = user.getResetPasswordToken();
        await user.save({validateBeforeSave:false});

        const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the link below to set a new password. This link is valid for 15 minutes.</p>
            <a href="${resetURL}" target="_blank" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
            <p>If you didn't request this, please ignore this email.</p>
        `;

        // Send the actual email
        await sendEmail({ email: user.email, subject: 'Your Password Reset Token', html: message });

        res.status(200).json({
            message:'Password reset link has been sent to your email'
        })
    } catch (error) {
        console.error('password reset error',error);
        res.status(500).json({
            error: error.message
        })
    }
}

exports.resetPassword = async (req,res)=>{
    const resetTokenfromLink = req.params.resetToken;
    const {password} = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken:resetTokenfromLink,
            resetPasswordExpiration: {$gt:Date.now()}
        })
        
        if(!user){
            return res.status(400).json({
                message:'invalid token or expired token'
            })
        }
        user.password = password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: 'Password reset successful, try not to forget next time'
        })

    } catch (error) {
        console.error('Password reset error',error)
        res.status(500).json({
            error: error.message
        })
    }
}