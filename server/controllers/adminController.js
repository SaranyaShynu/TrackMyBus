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

exports.createDriver=async (req,res) => {
    const { name, email, mobileNo, busNumber } = req.body;
    try{
        const existingUser=await User.findOne({email});
        if (existingUser) return res.status(400).json({message: "Email already registered" });

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);

        const newDriver=new User({
            name,
            email,
            password:hashedPassword,
            mobileNo,
            role:'driver',
            busNumber
        });
         
        await newDriver.save();

        res.status(201).json({
            success:true,
            message:"Driver account created by successfully Admin"
        });
    } catch(err) {
        res.status(500).json({message:"Error creating Driver account"});
    }
}

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