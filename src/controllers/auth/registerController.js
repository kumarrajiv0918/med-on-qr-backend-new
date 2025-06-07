const Auth = require('../../model/authModel');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const {
      name,
      businessName,
      email,
      password,
      roleId,
      pinCode,
      address,
      createdBy,
      status
    } = req.body;

    // 1. Validate required fields (optional but recommended)
    if (!name || !email || !password || !roleId) {
      return res.status(400).json({
        status: false,
        message: 'Name, email, password, and roleId are required'
      });
    }

    // 2. Check if email already exists
    const existingUser = await Auth.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: 'Email already registered'
      });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅hashedPassword', hashedPassword);
    // 4. Create new user
    const user = new Auth({
      name,
      businessName,
      email,
      password: hashedPassword, // Hashed password stored
      roleId,
      pinCode,
      address,
      createdBy,
      status: status || 'enable'
    });

    // 5. Save to DB
    await user.save();

    // 6. Remove sensitive fields before sending response
    const { password: _, __v, ...userData } = user.toObject();

    return res.status(201).json({
      status: true,
      message: 'User registered successfully',
      data: userData
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      status: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

module.exports = {
  register
};
