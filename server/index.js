require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

const Student = require('./models/Student');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set('socketio', io);
app.use(express.json());
app.use(cors());

// Firebase (Ensure your .env keys are correct)
if (process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/bus', require('./routes/busRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const busStatus = {};
const notifiedStatus = new Set(); // To prevent notification spam in a single session

io.on('connection', (socket) => {
  console.log('📡 New Connection:', socket.id);

  socket.on('joinBusRoom', (busId) => {
    socket.join(busId);
    console.log(`User joined bus room: ${busId}`);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin-control-center');
  });

  socket.on('joinStudentRoom', (studentId) => {
    socket.join(studentId.toString());
  });

  socket.on('updateLocation', async (data) => {
    const { busId, lat, lng, speed, busNo } = data;

    // Broadcast to Map Views
    io.to(busId).to('admin-control-center').emit('fleetUpdate', data);

    // 1. Traffic Logic
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

    // 2. School Arrival Logic
    const schoolCoords = { lat: 11.7491, lng: 75.4890 };
    const distToSchool = calculateDistance(lat, lng, schoolCoords.lat, schoolCoords.lng);
    if (distToSchool < 0.2) { 
      io.to(busId).to('admin-control-center').emit('notification', {
        type: 'ARRIVAL_SCHOOL',
        busNo,
        message: `Bus ${busNo} arrived at School.`,
        time: new Date().toLocaleTimeString()
      });
    }

    // 3. Proximity Logic (Fixes Schema Path)
    try {
      const students = await Student.find({ assignedBus: busId });
      
      students.forEach(student => {
        // Accessing path matching your Schema: stopLocation.coordinates
        const sLat = student.stopLocation?.coordinates?.lat;
        const sLng = student.stopLocation?.coordinates?.lng;

        if (sLat && sLng) {
          const distToHome = calculateDistance(lat, lng, sLat, sLng);
          const notificationKey = `${student._id}-near-home`;

          if (distToHome < 0.5 && !notifiedStatus.has(notificationKey)) {
            io.to(student._id.toString()).emit('notification', {
              type: 'NEAR_HOME',
              studentId: student._id,
              message: `The bus is nearly at ${student.name}'s stop! (Distance: ${(distToHome * 1000).toFixed(0)}m)`,
              time: new Date().toLocaleTimeString()
            });
            notifiedStatus.add(notificationKey);
          } 
          // Reset notification if bus moves away (more than 1.5km)
          else if (distToHome > 1.5) {
            notifiedStatus.delete(notificationKey);
          }
        }
      });
    } catch (err) {
      console.error("Proximity Check Error:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected:', socket.id);
  });
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server spinning on port ${PORT}`));