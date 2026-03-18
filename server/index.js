require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

const Student = require('./models/Student');
const Notification = require('./models/Notification');
const app = express();
const server = http.createServer(app);
let simStep = 0;
const busStatus = {};
const notifiedStatus = new Set();
const Bus = require('./models/Bus');

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

io.on('connection', (socket) => {
  console.log('📡 New Connection:', socket.id);

  socket.on('joinBusRoom', (busId) => {
    socket.join(busId.toString());
    console.log(`User joined bus room: ${busId}`);
  });

  socket.on('joinAdminRoom', () => {
    socket.join('admin-control-center');
  });

  socket.on('joinStudentRoom', (studentId) => {
    socket.join(studentId.toString());
  });

    // Broadcast to Map Views

   socket.on('parent_missed_bus', async (data) => {
    try {
      await Student.findByIdAndUpdate(data.studentId, { status: 'missed' });
      const newNotif = await Notification.create({
        busId: data.busId, 
        type: 'EMERGENCY',
        message: `ALERT: ${data.studentName} missed their bus!`,
        sender: data.parentId,
        recipients: ['admin-control-center']
      });

       const allBuses = await Bus.find({ status: 'active' });

    const nearbyBuses = allBuses.filter(bus =>
      bus._id.toString() !== data.busId.toString() &&
      bus.status === 'active'
    );

    console.log("Nearby buses:", nearbyBuses.map(b => b.busNo));

    io.to('admin-control-center').emit('nearby_buses', {
      studentId: data.studentId,
      studentName: data.studentName,
      buses: nearbyBuses
    });


      io.to('admin-control-center').emit('refresh_data');
      io.to('admin-control-center').emit('notification', newNotif);
    } catch (err) { console.error(err); }
  });

  // B. Admin -> Driver (Logging the Instruction)
  socket.on('admin_reassign_driver', async (data) => {
    try {
    
      const instruction = await Notification.create({
        busId: data.busId,
        type: 'EMERGENCY',
        message: `Pickup Order: Collect ${data.studentName} at ${data.pickupLocation}.`,
        sender: null
      });
         const roomTarget = data.busId.toString();
      io.to(roomTarget).emit('admin_reassign_driver', {
      ...instruction._doc,
      studentId: data.studentId,  
      parentId: data.parentId,  
      studentName: data.studentName,
      pickupLocation: data.pickupLocation,
      message: `Pickup ${data.studentName} at ${data.pickupLocation}`,
      isTemporary: true
    });

     io.to('admin-control-center').emit('notification', {
      type: 'INFO',
      message: `Instruction sent to Bus ${data.busId} for ${data.studentName}`,
      time: new Date().toLocaleTimeString()
    });  
    } catch (err) { console.error(err); }
  });

socket.on('driver_accept_emergency', async (data) => {
  try {
    // 1. Update the Student record in DB to point to THIS bus
    await Student.findByIdAndUpdate(data.studentId, { 
      assignedBus: data.busId,
      status: 'assigned' 
    });

    // 2. Tell Admin the driver is on the way
    io.to('admin-control-center').emit('notification', {
      type: 'SUCCESS',
      message: `Driver confirmed pickup for ${data.studentName}`,
      time: new Date().toLocaleTimeString()
    });

    io.to(data.studentId.toString()).emit('temp_assignment_broadcast', {
      busId: data.busId,
      busNo: data.busNo,
      studentName: data.studentName,
      message: `A new bus (${data.busNo}) is coming to pick up your child!`
    });

  } catch (err) {
    console.error("Accept Task Error:", err);
  }
});

  // C. Driver -> Parent (Logging the Success)
  socket.on('driver_pickup_confirmed', async (data) => {
    try {
      await Student.findByIdAndUpdate(data.studentId, { status: 'present' });
      const successNotif = await Notification.create({
        busId: data.busId,
        type: 'NEAR_HOME', // Using this to trigger the 'success' UI
        message: `${data.studentName} collected at Lat: ${data.pickupCoords.lat}, Lng: ${data.pickupCoords.lng}`,
        recipients: [data.parentId]
      });

      io.to(data.studentId).emit('notification', successNotif);
      io.to('admin-control-center').emit('pickup_verified', {
      studentId: data.studentId,
      coords: data.pickupCoords,
      busNo: data.busNo
    });
      io.to('admin-control-center').emit('refresh_data');
    } catch (err) { console.error(err); }
  });

  socket.on('updateLocation', async (data) => {
    const { busId, lat, lng, speed, busNo } = data;
    io.to(busId.toString()).to('admin-control-center').emit('fleetUpdate', data);

    // 1. Traffic Logic
    if (!busStatus[busId]) busStatus[busId] = { idleCount: 0 };
    if (speed < 5) { 
      busStatus[busId].idleCount++;
      if (busStatus[busId].idleCount === 6) {
        io.to(busId.toString()).to('admin-control-center').emit('notification', {
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
              studentName: student.name,
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

/* --- ADVANCED MULTI-ROUTE SIMULATOR --- */

// Coordinate paths for all 7 routes
const ROUTES_MAP = {
  "Dharmadam": [ { lat: 11.7750, lng: 75.4650 }, { lat: 11.7650, lng: 75.4750 }, { lat: 11.7491, lng: 75.4890 } ],
  "Temple Gate": [ { lat: 11.7400, lng: 75.4850 }, { lat: 11.7440, lng: 75.4870 }, { lat: 11.7491, lng: 75.4890 } ],
  "Kolassery": [ { lat: 11.7620, lng: 75.5050 }, { lat: 11.7550, lng: 75.4950 }, { lat: 11.7491, lng: 75.4890 } ],
  "Pinarayi": [ { lat: 11.7850, lng: 75.5200 }, { lat: 11.7700, lng: 75.5100 }, { lat: 11.7550, lng: 75.4750 } ],
  "Chonadam": [ { lat: 11.7380, lng: 75.5100 }, { lat: 11.7430, lng: 75.5000 }, { lat: 11.7491, lng: 75.4890 } ],
  "Manekkara": [ { lat: 11.7250, lng: 75.5300 }, { lat: 11.7350, lng: 75.5100 }, { lat: 11.7491, lng: 75.4890 } ],
  "Koppalam": [ { lat: 11.7580, lng: 75.4750 }, { lat: 11.7550, lng: 75.4800 }, { lat: 11.7491, lng: 75.4890 } ]
};

// Target School Coordinates based on your Building Schema
const BUILDING_COORDS = {
  'Building A': { lat: 11.7491, lng: 75.4890, name: "Main Building (LKG-G4)" },
  'Building B': { lat: 11.7550, lng: 75.4750, name: "West Building (G5-G10)" }
};

setInterval(async () => {
  try {
    // 1. Fetch all active buses from your actual MongoDB
    const activeBuses = await Bus.find({ status: 'active' });

    for (const bus of activeBuses) {
      // Find the path matching the bus's route string
      const path = ROUTES_MAP[bus.route] || ROUTES_MAP["Dharmadam"]; // Fallback to Dharmadam
      const coords = path[simStep % path.length];

      // 2. Update Bus Location in Memory/Socket
      const movementData = {
        busId: bus._id,
        _id: bus._id,
        busNo: bus.busNo,
        lat: coords.lat,
        lng: coords.lng,
        speed: Math.floor(Math.random() * 15) + 30,
        schoolBuilding: bus.schoolBuilding
      };

      // 3. Emit to Admin and joined Parents
      io.emit('fleetUpdate', movementData);
      io.to(bus._id.toString()).to('admin-control-center').emit('fleetUpdate', movementData);

      // 4. Smart School Arrival Notification
      const targetBuilding = BUILDING_COORDS[bus.schoolBuilding] || BUILDING_COORDS['Building A'];
      const distToSchool = calculateDistance(coords.lat, coords.lng, targetBuilding.lat, targetBuilding.lng);

      if (distToSchool < 0.15) { // 150 meters
        io.to(bus._id.toString()).to('admin-control-center').emit('notification', {
          type: 'ARRIVAL_SCHOOL',
          busNo: bus.busNo,
          message: `Bus ${bus.busNo} reached ${targetBuilding.name}.`,
          time: new Date().toLocaleTimeString()
        });
      }

      // 5. Proximity to Students (Your existing logic)
      const students = await Student.find({ assignedBus: bus._id });
      students.forEach(student => {
        const sLat = student.stopLocation?.coordinates?.lat;
        const sLng = student.stopLocation?.coordinates?.lng;
        if (sLat && sLng) {
          const distToHome = calculateDistance(coords.lat, coords.lng, sLat, sLng);
          if (distToHome < 0.5) {
            io.to(student._id.toString()).emit('notification', {
              type: 'NEAR_HOME',
              message: `Your assigned bus ${bus.busNo} is 500m away!`,
              time: new Date().toLocaleTimeString()
            });
          }
        }
      });
    }
    simStep++;
  } catch (err) {
    console.error("Simulation Loop Error:", err);
  }
}, 5000);

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