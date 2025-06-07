const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/file/fileRoutes');
const authRoutes = require('./routes/auth/authRoutes');
const connectDB = require('./config/db');
const registerRoutes = require('./routes/auth/registerRoutes');
const getAllUsersRoutes = require('./routes/auth/getAllUserRoutes');

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';
const CLIENT_ORIGIN = process.env.ORIGIN_URL;
connectDB();

app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/uploadFile', fileRoutes);
app.use('/auth', authRoutes);
app.use('/api', registerRoutes);
app.use('/getAlluserApi', getAllUsersRoutes);

// ✅ Listen with HOST and PORT
app.listen(PORT, HOST, () => {
  console.log(`✅ Server running at http://${HOST}:${PORT}`);
});
