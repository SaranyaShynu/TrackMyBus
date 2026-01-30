const crypto=require('crypto');
const sendEmail=require('../utils/sendEmail');

router.post('/google-login', async (req, res) => {
    const { name, email, googleId } = req.body;

    try {
        // Find user by googleId OR email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (!user) {
            // New user: Create account
            user = new User({ name, email, googleId, role: 'parent' });
            await user.save();
        } else if (!user.googleId) {
            // Existing email user logging in with Google for the first time
            user.googleId = googleId;
            await user.save();
        }

        // Generate your own JWT so the user stays logged in to your app
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user: { name: user.name, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: "Server error during Google Login" });
    }
});

router.post('/forgot-password', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: "No user found with that email" });

    // Create a temporary reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
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
        await user.save();
        res.status(500).json({ message: "Email could not be sent" });
    }
});
