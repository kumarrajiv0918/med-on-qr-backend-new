const bcrypt = require('bcryptjs');
const User = require('./../../model/userModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { sendVerificationEmail } = require('../../utils/mailer');

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&]).{5,}$/;

// ================== CREATE USER ==================
const createUser = async (req, res) => {
    try {
        const { name, businessName, email, password, roleId, pinCode, address, createdBy } = req.body;

        if (!name || !businessName || !email || !password || !roleId) {
            return res.status(400).json({ message: "Required fields are missing" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Password is invalid. Ensure it meets the requirements.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const newUser = new User({
            name,
            businessName,
            email,
            password, // auto-hashed by pre-save
            roleId,
            pinCode,
            address,
            token: verificationToken,
            createdBy
        });

        const user = await newUser.save();

        // Optionally send verification email
        // await sendVerificationEmail(email, verificationToken);

        res.status(200).json({
            status: true,
            message: 'Registration successful. Please check your email to verify your account.',
            data: user
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Error creating user",
            error: error.message,
            data: null
        });
    }
};

// ================== GET ALL USERS ==================
const getUserAll = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).send({
                status: false,
                message: "Users are empty",
                data: null
            });
        }
        res.status(200).send({
            status: true,
            message: "Get all users successfully!",
            data: users
        });
    } catch (error) {
        res.status(500).send({
            status: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// ================== GET USER BY ID ==================
const getUserById = async (req, res) => {
    const userId = req.params.userId;
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({
                status: false,
                message: "Invalid user ID",
                data: null
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                status: false,
                message: "User not found",
                data: null
            });
        }

        res.status(200).send({
            status: true,
            message: "Get user successfully!",
            data: user
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: "Error fetching user",
            error: error.message
        });
    }
};

// ================== UPDATE USER ==================
const updateUser = async (req, res) => {
    try {
        const { name, businessName, email, password, roleId, pinCode, address, updatedBy } = req.body;
        const userId = req.params.userId;

        if (!name || !businessName || !email || !roleId) {
            return res.status(400).send({ status: false, message: "Required fields are missing", data: null });
        }
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid or missing userId", data: null });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: false, message: "User not found", data: null });
        }

        let hashedPassword = user.password;
        if (password && !(await bcrypt.compare(password, user.password))) {
            if (!passwordRegex.test(password)) {
                return res.status(400).send({ status: false, message: "New password is invalid", data: null });
            }
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                businessName,
                email,
                password: hashedPassword,
                roleId,
                pinCode,
                address,
                updatedBy
            },
            { new: true }
        );

        res.status(200).send({
            status: true,
            message: "User updated successfully.",
            data: updatedUser
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: "Error updating user",
            error: error.message
        });
    }
};

// ================== DELETE USER ==================
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Invalid user ID", data: null });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ status: false, message: "User not found", data: null });
        }

        await User.findByIdAndDelete(userId);
        res.status(200).send({
            status: true,
            message: "User deleted successfully.",
            data: null
        });

    } catch (error) {
        res.status(500).send({
            status: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

module.exports = {
    createUser,
    getUserAll,
    getUserById,
    updateUser,
    deleteUser
};
