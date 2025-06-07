const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../../model/userModel');
const { sendPasswordResetEmail } = require('../../utils/mailer');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// =================== Login ===================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                status: false,
                message: 'Email and password are required.',
                data: null 
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'Invalid email or password!',
                data: null
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: false,
                message: 'Invalid email or password.',
                data: null
            });
        }

        // Generate fresh token with current login timestamp
        const authToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                loginTime: new Date().toISOString()
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Sanitize user object (remove password)
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            status: true,
            message: 'User logged in successfully.',
            data: {
                token: authToken,
                user: userObj
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Error logging in. Please try again later.',
            error: error.message,
            data: null
        });
    }
};

// =================== Forgot Password ===================
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found', data: null });
        }

        const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
        const resetTokenExpiration = Date.now() + 3600000;

        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({
            status: true,
            message: 'A password reset link has been sent to your email.',
            data: resetToken
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'Error sending password reset email',
            data: null
        });
    }
};

// =================== Reset Password ===================
const resetPassword = async (req, res) => {
    const resetToken = req.params.token;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ status: false, message: 'New password is required', data: null });
    }

    try {
        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: 'Invalid or expired token',
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Password successfully reset'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: 'Error resetting password',
            data: null
        });
    }
};

// =================== Change Password ===================
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found', data: null });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: false, message: 'Incorrect current password', data: null });
        }

        // ✅ Do NOT manually hash if pre-save middleware handles it
        user.password = newPassword;

        const updatedUser = await user.save();

        // ✅ Remove password field before sending response
        const { password, ...safeUserData } = updatedUser.toObject();

        res.status(200).json({
            status: true,
            message: 'Password changed successfully',
            data: safeUserData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Error changing password',
            error: error.message,
            data: null
        });
    }
};

module.exports = {
    login,
    forgotPassword,
    resetPassword,
    changePassword
};
