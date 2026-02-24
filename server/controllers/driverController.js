
const User = require('../models/User');

/*exports.getDriverProfile = async (req, res) => {
    try {
        const driver = await User.findById(req.user.id)
            .select('-password')
            .populate('assignedBus');

        if (!driver) {
            return res.status(404).json({ message: "Driver not found" });
        }

        res.json(driver);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching profile" });
    }
}; */