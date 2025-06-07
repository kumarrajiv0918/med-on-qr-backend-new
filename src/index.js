const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/file/fileRoutes');
const registerRoutes = require('./routes/auth/registerRoutes');
const getAllUsersRoutes = require('./routes/auth/getAllUserRoutes');
const updateUser = require('./routes/auth/authRoutes');
const authRoutes = require('./routes/auth/authAllRouters');
const userRoutes = require('./routes/user/userRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';
const CLIENT_ORIGIN = 'http://localhost:3000';

// ✅ Connect to DB
connectDB();

// ✅ Middleware
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json()); // Handles JSON request bodies
app.use(express.urlencoded({ extended: true })); // Handles URL-encoded form data

// ✅ Static folder
app.use('/uploads', express.static('uploads'));

// ✅ Routes
app.use('/auth', updateUser);
app.use('/uploadFile', fileRoutes);
app.use('/api', registerRoutes);
app.use('/getAlluserApi', getAllUsersRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// ✅ Start server
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});
