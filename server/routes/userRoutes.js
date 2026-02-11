const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/profile', protect, async (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching profile" });
    }
});

router.put('/settings', protect, async (req, res) => {
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
});

module.exports = router;