const User = require('../models/User');
const Bus = require('../models/Bus');
const Student = require('../models/Student');

exports.getBusSummary = async (req, res) => {
    try {

        const buses = await Bus.find().populate('driver assistant', 'name');

        const summary = await Promise.all(buses.map(async (bus) => {
            const studentCount = await Student.countDocuments({
                assignedBus: bus._id
            });

            return {
                _id: bus._id,
                busNo: bus.busNo,
                route: bus.route,
                capacity: bus.capacity,
                currentStudents: studentCount,
                driverName: bus.driver?.name || 'Unassigned',
                assistantName: bus.assistant?.name || 'Unassigned',
                availableSeats: Math.max(0, bus.capacity - studentCount)
            };
        }));

        res.status(200).json(summary);
    } catch (err) {
        res.status(500).json({ message: "Error fetching bus summary" });
    }
};

exports.getBusStudents = async (req, res) => {
    try {
        const { busId } = req.params;

        const students = await Student.find({ assignedBus: busId })
            .populate('parentId', 'name mobileNo'); 

        const studentList = students.map(s => ({
            _id: s._id,
            name: s.name,
            grade: s.grade,
            rollNumber: s.rollNumber,
            parentName: s.parentId?.name || 'Unknown',
            parentPhone: s.parentId?.mobileNo || 'N/A'
        }));

        res.status(200).json(studentList);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student list" });
    }
};

exports.updateBusLocation = async (req, res) => {
    try {
        const { busId } = req.params;
        const { lat, lng } = req.body;

        if (lat == null || lng == null) {
            return res.status(400).json({ message: "Invalid coordinates" });
        }

        const updatedBus = await Bus.findByIdAndUpdate(
            busId,
            {
                currentLocation: { lat, lng }
            },
            { new: true }
        );

        if (!updatedBus) {
            return res.status(404).json({ message: "Bus not found" });
        }

        res.status(200).json({ success: true, data: updatedBus });

    } catch (err) {
        console.error("Location Update Error:", err);
        res.status(500).json({ message: "Location update failed" });
    }
};