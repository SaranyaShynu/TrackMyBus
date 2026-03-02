const User = require('../models/User');
const Bus = require('../models/Bus');

exports.getBusSummary = async (req, res) => {
    try {

        const buses = await Bus.find().populate('driver assistant', 'name');

        const summary = await Promise.all(buses.map(async (bus) => {
            const studentCount = await User.countDocuments({
                role: 'student',
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
                availableSeats: bus.capacity - studentCount
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

        const parents = await User.find({ "children.assignedBus": busId });

        let studentList = [];
        parents.forEach(parent => {
            parent.children.forEach(child => {
                if (child.assignedBus?.toString() === busId) {
                    studentList.push({
                        name: child.name,
                        grade: child.grade,
                        parentName: parent.name,
                        parentPhone: parent.mobileNo
                    });
                }
            });
        });

        res.status(200).json(studentList);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch student list" });
    }
};