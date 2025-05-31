const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileRoutes = require('./routes/file/fileRoutes');
const authRoutes = require('./routes/auth/authRoutes');
const connectDB = require('./config/db');
const registerRoutes = require('./routes/auth/registerRoutes')
const getAllUsersRoutes = require('./routes/auth/getAllUserRoutes')
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3002;
connectDB();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/uploadFile', fileRoutes);
app.use('/auth', authRoutes);
app.use('/api', registerRoutes);
app.use('/getAlluserApi', getAllUsersRoutes);
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
