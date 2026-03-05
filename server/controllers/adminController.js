const User = require('../models/User');
const Bus = require('../models/Bus');
const Student = require('../models/Student'); 
const bcrypt = require('bcryptjs');

// --- STUDENT MANAGEMENT ---

exports.addStudent = async (req, res) => {
    try {
        const { name, rollNumber, grade, parentEmail, assignedBus, bloodGroup } = req.body;

        const parent = await User.findOne({ email: parentEmail, role: 'parent' });
        if (!parent) {
            return res.status(404).json({ message: "Parent with this email not found." });
        }

        const studentRecord = await Student.create({
            name,
            rollNumber,
            grade,
            medicalInfo: { bloodGroup }, // Nesting to match schema
            assignedBus: assignedBus || null,
            parentId: parent._id
        });

        // Push ONLY the ID to the parent's children array
        parent.children.push(studentRecord._id); 
        await parent.save();

        res.status(201).json({
            success: true,
            message: `Student ${name} enrolled and linked to ${parent.name}`,
            student: studentRecord
        });
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: "Roll number already exists." });
        res.status(500).json({ message: "Server error during enrollment" });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { parentId, studentId } = req.params; 
        const { name, grade, rollNumber, bloodGroup, assignedBus } = req.body;

        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            {
                name,
                grade,
                rollNumber,
                medicalInfo: { bloodGroup }, 
                assignedBus: assignedBus || null
            },
            { new: true }
        ).populate('assignedBus');

        if (!updatedStudent) {
            return res.status(404).json({ message: "Student record not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "Student updated successfully", 
            data: updatedStudent 
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { parentId, studentId } = req.params;

        // 1. Delete the actual student document
        await Student.findByIdAndDelete(studentId);

        // 2. Pull the reference out of the Parent's array
        await User.findByIdAndUpdate(parentId, {
            $pull: { children: studentId } // Just the ID, not an object
        });

        res.json({ success: true, message: "Student completely removed from system" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting student" });
    }
};

// --- BUS & FLEET MANAGEMENT ---

exports.addBus = async (req, res) => {
    try {
        const { busNo, route, capacity } = req.body;
        const newBus = new Bus({ 
            busNo, 
            route, 
            capacity: capacity || 40,
            currentLocation: { lat: 11.7491, lng: 75.4890 } // Default location
        });
        await newBus.save();
        res.status(201).json({ success: true, bus: newBus });
    } catch (err) {
        res.status(400).json({ message: "Could not add bus. Ensure Bus No is unique." });
    }
};

exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find()
            .populate('driver', 'name email mobileNo')
            .populate('assistant', 'name email mobileNo');
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching buses" });
    }
};

exports.updateBus = async (req, res) => {
    try {
        const { id } = req.params;
        const { busNo, route, capacity, driver, assistant } = req.body;

        // Check if driver/assistant are already busy elsewhere
        if (driver) {
            const busy = await Bus.findOne({ driver, _id: { $ne: id } });
            if (busy) return res.status(400).json({ message: `Driver already assigned to Bus ${busy.busNo}` });
        }

        const oldBus = await Bus.findById(id);
        if (!oldBus) return res.status(404).json({ message: "Bus not found" });

        // Update Bus record
        const updatedBus = await Bus.findByIdAndUpdate(
            id,
            { busNo, route, capacity, driver: driver || null, assistant: assistant || null },
            { new: true }
        ).populate('driver assistant');

        // Sync Staff records: Remove bus link from old staff
        if (oldBus.driver) await User.findByIdAndUpdate(oldBus.driver, { assignedBus: null });
        if (oldBus.assistant) await User.findByIdAndUpdate(oldBus.assistant, { assignedBus: null });

        // Sync Staff records: Add bus link to new staff
        if (driver) await User.findByIdAndUpdate(driver, { assignedBus: id });
        if (assistant) await User.findByIdAndUpdate(assistant, { assignedBus: id });

        res.status(200).json({ success: true, data: updatedBus });
    } catch (err) {
        res.status(500).json({ message: 'Server error during bus update' });
    }
};

exports.deleteBus = async (req, res) => {
    try {
        const busId = req.params.id;
        // Unlink bus from all staff and student sub-documents
        await User.updateMany({ assignedBus: busId }, { $set: { assignedBus: null } });
        await User.updateMany(
            { "children.assignedBus": busId },
            { $set: { "children.$[elem].assignedBus": null } },
            { arrayFilters: [{ "elem.assignedBus": busId }] }
        );

        await Bus.findByIdAndDelete(busId);
        res.json({ success: true, message: "Bus deleted and links cleared" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- USER & STAFF MANAGEMENT ---

exports.addStaff = async (req, res) => {
    const { name, email, mobileNo, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newStaff = new User({
            name, email, mobileNo,
            password: hashedPassword,
            role: role || 'driver'
        });

        await newStaff.save();
        res.status(201).json({ success: true, message: `${newStaff.role} created` });
    } catch (err) {
        res.status(500).json({ message: "Error creating account" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate({
                path: 'children',
                model: 'Student',
                populate: {
                    path: 'assignedBus',
                    model: 'Bus',
                    select: 'busNo route'
                }
            })
            .populate('assignedBus', 'busNo route')
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobileNo, role } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, mobileNo, role },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user.role === 'driver' || user.role === 'assistant') {
            await Bus.updateMany({ $or: [{ driver: user._id }, { assistant: user._id }] }, { $set: { driver: null, assistant: null } });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: "Delete failed" });
    }
};