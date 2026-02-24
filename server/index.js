require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

app.get('/', (req, res) => res.send("TrackMyBus API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));