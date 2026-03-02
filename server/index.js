require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- REAL-TIME FLEET LOGIC ---
const busStatus = {};

io.on('connection', (socket) => {
  console.log('📡 New Connection:', socket.id);

  socket.on('updateLocation', (data) => {
    const { busId, lat, lng, speed, busNo } = data;

    // 1. Broadcast movement to Admin & Parents
    io.emit('fleetUpdate', data);

    // 2. Traffic Detection Logic
    if (!busStatus[busId]) busStatus[busId] = { idleCount: 0 };
    
    if (speed < 5) { // If bus moves slower than 5km/h
      busStatus[busId].idleCount++;
      
      // If idle for 6 consecutive updates (approx 3 mins if updates are every 30s)
      if (busStatus[busId].idleCount === 6) {
        io.emit('notification', {
          type: 'TRAFFIC',
          busNo: busNo,
          message: `Bus ${busNo} is experiencing heavy traffic/delay.`
        });
      }
    } else {
      busStatus[busId].idleCount = 0; // Reset if bus speeds up
    }

    // 3. School Reach Detection (Geofencing)
    const schoolCoords = { lat: 11.7491, lng: 75.4890 };
    const distanceToSchool = calculateDistance(lat, lng, schoolCoords.lat, schoolCoords.lng);

    if (distanceToSchool < 0.1) {
      io.emit('notification', {
        type: 'ARRIVAL',
        busNo: busNo,
        message: `Bus ${busNo} has reached the school campus.`
      });
    }
  });

  socket.on('disconnect', () => console.log('❌ Disconnected'));
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

app.get('/', (req, res) => res.send("TrackMyBus API is running..."));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));