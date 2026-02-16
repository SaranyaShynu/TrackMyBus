const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
    try {
        // req.user comes from your protect middleware
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching profile" });
    }
};

exports.updateSettings = async (req, res) => {
    const { name, mobileNo, password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (name) user.name = name;
        if (mobileNo) user.mobileNo = mobileNo;
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