const Auth = require('../../model/authModel');
const bcrypt = require('bcrypt');
require('dotenv').config();

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const userId = req.user?.id;

        const user = await Auth.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            return res.status(401).json({
                status: false,
                message: 'Current password is incorrect'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            status: false,
            message: 'Server error during password change',
            error: error.message
        });
    }
};

module.exports = { changePassword };
