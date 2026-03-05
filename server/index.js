require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const app = express();
const server = http.createServer(app);

const Student = require('./models/Student');

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
app.use('/api/bus' , require('./routes/busRoutes'));

const busStatus = {};
const busStudentsCache = {};



io.on('connection', (socket) => {
  console.log('📡 New Connection:', socket.id);

  socket.on('joinBusRoom', (busId) => {
    socket.join(busId);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin-control-center');
  });

  socket.on('updateLocation', async (data) => {
    const { busId, lat, lng, speed, busNo } = data;

    io.to(busId).to('admin-control-center').emit('fleetUpdate', data);

    if (!busStatus[busId]) busStatus[busId] = { idleCount: 0 };
    if (speed < 5) { 
      busStatus[busId].idleCount++;
      if (busStatus[busId].idleCount === 6) {
        io.to(busId).to('admin-control-center').emit('notification', {
          type: 'TRAFFIC',
          busNo,
          message: `Bus ${busNo} is stuck in traffic.`,
          time: new Date().toLocaleTimeString()
        });
      }
    } else {
      busStatus[busId].idleCount = 0; 
    }

    const schoolCoords = { lat: 11.7491, lng: 75.4890 };
    const distToSchool = calculateDistance(lat, lng, schoolCoords.lat, schoolCoords.lng);
    if (distToSchool < 0.2) { // Within 200 meters
      io.to(busId).to('admin-control-center').emit('notification', {
        type: 'ARRIVAL_SCHOOL',
        busNo,
        message: `Bus ${busNo} arrived at School.`,
        time: new Date().toLocaleTimeString()
      });
    }

    if (!busStudentsCache[busId]) {
      try {
        busStudentsCache[busId] = await Student.find({ assignedBus: busId });
      } catch (err) {
        console.error("Error fetching students for proximity check:", err);
      }
    }

    if (busStudentsCache[busId]) {
      busStudentsCache[busId].forEach(student => {

        if (student.lat && student.lng) {
          const distToHome = calculateDistance(lat, lng, student.lat, student.lng);
          
          if (distToHome < 0.5 && !student.notifiedNearHome) {
             io.to(busId).emit('notification', {
               type: 'NEAR_HOME',
               studentId: student._id,
               message: `The bus is nearly at ${student.name}'s stop! Please get ready.`,
               time: new Date().toLocaleTimeString()
             });
             student.notifiedNearHome = true; 
          } 
          else if (distToHome > 1.0) {
            student.notifiedNearHome = false;
          }
        }
      });
    }
  });

  socket.on('sendDelayAlert', (data) => {
    const { busId, busNo, message, driverName } = data;
    const alert = {
      type: 'MANUAL_DELAY',
      busNo,
      driverName,
      message,
      time: new Date().toLocaleTimeString()
    };
    io.to(busId).to('admin-control-center').emit('notification', alert);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected');
  });
});

// Haversine Formula for accurate distance in KM
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