const User = require('../models/User');
const Bus = require('../models/Bus');

exports.addBus = async (req, res) => {
    try {
        const newBus = new Bus(req.body);
        await newBus.save();
        res.status(201).json({ success: true, bus: newBus });
    } catch (err) {
        res.status(400).json({ message: "Could not add bus. Ensure Bus No is unique." });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
};