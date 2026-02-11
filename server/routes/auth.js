
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { name, email, password, mobileNo } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, mobileNo, role: 'parent' });
        await user.save();

        const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, token, user:{name:user.name, role:user.role} });
    } catch (err) {
        res.status(500).json({ message: "Registration error" });
    }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { name: user.name, role: user.role, email:user.email } });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

// --- GOOGLE LOGIN ---
router.post('/google-login', async (req, res) => {
    const { name, email, googleId, mobileNo } = req.body;
    try {
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            user = new User({ name, email, googleId, mobileNo:mobileNo || 'N/A', role: 'parent' });
            await user.save();
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server error during Google Login" });
    }
});

// --- FORGOT PASSWORD ---
router.post('/forgot-password', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No user found with that email" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `You requested a password reset. Click here: ${resetUrl}`
        });
        res.json({ success: true, message: "Email sent!" });
    } catch (err) {
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();
        res.status(500).json({ message: "Email could not be sent" });
    }
});

// --- RESET PASSWORD ---
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        
        await user.save();
        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;