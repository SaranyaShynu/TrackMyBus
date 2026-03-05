const User = require('../models/User');
const Bus = require('../models/Bus');
const bcrypt = require('bcryptjs');

const Student = require('../models/Student'); // Import the Student model

exports.getProfile = async (req, res) => {
    try {
        // 1. req.user is already populated by your 'protect' middleware
        const parentId = req.user._id;

        // 2. Find all students belonging to this parent
        // We 'populate' the assignedBus, and then deep-populate the driver/assistant
        const children = await Student.find({ parentId })
            .populate({
                path: 'assignedBus',
                model: 'Bus',
                populate: [
                    { path: 'driver', model: 'User', select: 'name mobileNo' },
                    { path: 'assistant', model: 'User', select: 'name mobileNo' }
                ]
            });

        // 3. Construct the response to match what your React Dashboard expects
        res.json({
            ...req.user._doc, // Parent's name, email, etc.
            children: children // This now contains full names, grades, and bus details
        });

    } catch (err) {
        console.error("Profile Fetch Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.updateSettings = async (req, res) => {
    const { name, mobileNo, address, password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (mobileNo) user.mobileNo = mobileNo;
        if (address) user.address = address;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.json({ success: true, message: "Settings updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error updating settings" });
    }
};