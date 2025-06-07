const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String },
    businessName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roleId: { type: String },
    pinCode: { type: String },
    address: { type: String },
    token: { type: String },
    status: { type: String, default: 'active' },
    createdBy: { type: String },
    updatedBy: { type: String },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
