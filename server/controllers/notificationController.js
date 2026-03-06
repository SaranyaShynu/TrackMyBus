const Student = require('../models/Student');
const Bus = require('../models/Bus');
const Notification = require('../models/Notification');
const admin = require('firebase-admin');

exports.broadcastNotification = async (req, res) => {
    const { busId, type, message, includeAdmin } = req.body;
    const io = req.app.get('socketio');

    try {
        const bus = await Bus.findById(busId).populate('driver');
        if (!bus) {
            return res.status(404).json({ success: false, msg: "Bus not found" });
        }

        const students = await Student.find({ assignedBus: busId }).populate('parent');
        
        const parentIds = [...new Set(students.map(s => s.parent?._id).filter(id => id))];
        const fcmTokens = [...new Set(students.map(s => s.parent?.fcmToken).filter(token => token))];

        const payload = {
            busId: bus._id,
            busNo: bus.busNo,
            route: bus.route,
            type, // START, DELAY, EMERGENCY, END
            message,
            driverName: bus.driver?.name || "Unknown",
            driverPhone: bus.driver?.mobileNo || "N/A",
            timestamp: new Date()
        };

        const newNotification = new Notification({
            busId: bus._id,
            type,
            message,
            recipients: parentIds,
            sender: req.user.id
        });
        await newNotification.save();

        io.to(`bus_${busId}`).emit('parentNotification', payload);

        if (includeAdmin || type === 'EMERGENCY' || type === 'DELAY') {
            io.to('admin_room').emit('adminAlert', {
                ...payload,
                priority: type === 'EMERGENCY' ? 'CRITICAL' : 'HIGH'
            });
        }

        if (fcmTokens.length > 0) {
            const pushPayload = {
                notification: {
                    title: `Bus ${bus.busNo}: ${type}`,
                    body: message,
                },
                tokens: fcmTokens,
                data: {
                    busId: String(bus._id),
                    type: type
                }
            };

            admin.messaging().sendEachForMulticast(pushPayload)
                .then((response) => console.log('Successfully sent push:', response.successCount))
                .catch((error) => console.error('Error sending push:', error));
        }

        return res.status(200).json({ 
            success: true, 
            msg: `Broadcast sent and saved for Bus ${bus.busNo}`,
            recipientCount: parentIds.length 
        });

    } catch (err) {
        console.error("Controller Error:", err);
        return res.status(500).json({ success: false, msg: "Internal Server Error" });
    }
};

exports.getNotificationHistory = async (req, res) => {
    try {
        const history = await Notification.find({ recipients: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('busId', 'busNo route');

        res.status(200).json({ success: true, history });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Failed to fetch history" });
    }
};