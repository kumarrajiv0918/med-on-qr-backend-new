const Auth = require('../../model/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt with:', email, password);

    // 1. Find user
    const user = await Auth.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        status: false,
        message: 'User not found'
      });
    }

    // 2. Check if account is active
    if (user.status !== 'enable') {
      console.log('⚠️ Account is blocked for email:', email);
      return res.status(403).json({
        status: false,
        message: 'Your account has been blocked. Please contact the administrator to reactivate your ID.'
      });
    }

    // 3. Debug password comparison
    console.log('✅ Stored hash:', user.password);
    console.log('🔐 Plain password:', password);
const hashedPassword = await bcrypt.hash(password, 10);
 console.log('🔐 hashedPassword', hashedPassword);
    const isMatch = await bcrypt.compare(hashedPassword, user.password);

    if (!isMatch) {
      console.log('❌ Password does not match for email:', email);
      return res.status(401).json({
        status: false,
        message: 'Invalid credentials'
      });
    }

    // 4. Create JWT token
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // 5. Save token (optional)
    user.token = token;
    await user.save();

    // 6. Return clean user object
    const { password: _, __v, ...userData } = user.toObject();

    console.log('✅ Login successful:', userData);

    return res.status(200).json({
      status: true,
      message: 'Login successful',
      token,
      data: userData
    });

  } catch (error) {
    console.error('🔥 Login error:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

module.exports = { login };
