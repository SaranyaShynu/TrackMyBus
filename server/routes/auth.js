// 3. GOOGLE SIGN-IN / SIGN-UP ROUTE
router.post('/google-login', async (req, res) => {
    try {
        const { name, email, googleId, photo } = req.body;

        // 1. Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });

        if (!user) {
            // 2. If not, check if a user exists with the same email (but no Google ID)
            user = await User.findOne({ email });

            if (user) {
                // Link Google ID to existing email account
                user.googleId = googleId;
                await user.save();
            } else {
                // 3. Create a brand new user
                user = new User({
                    name,
                    email,
                    googleId,
                    role: 'parent' // Default role
                });
                await user.save();
            }
        }

        // 4. Create JWT Token for the session
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: { name: user.name, role: user.role }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Google Auth Failed" });
    }
});