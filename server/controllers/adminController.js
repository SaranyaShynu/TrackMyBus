const User = require('../models/User');
const Bus = require('../models/Bus');
const bcrypt = require('bcryptjs');

exports.addBus = async (req, res) => {
    try {
        const { busNo, route, schoolBuilding } = req.body;
        const newBus = new Bus({ busNo, route, schoolBuilding });
        await newBus.save();
        res.status(201).json({ success: true, bus: newBus });
    } catch (err) {
        res.status(400).json({ message: "Could not add bus. Ensure Bus No is unique." });
    }
};

exports.getAllBuses = async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching buses" });
    }
};

exports.createDriver=async (req,res) => {
    const { name, email, mobileNo, password, assignedBus, role } = req.body;
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
            role:role || 'driver',
            assignedBus:assignedBus || null
        });
         
        await newDriver.save();

        res.status(201).json({
            success:true,
            message:`${newDriver.role} account created successfully`
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({message:"Error creating staff account"});
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('assignedBus', 'busNumber route schoolBuilding');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.updateUser = async (req,res) => {
    try {
        const {id} = req.params;
        const {name, email, mobileNo, assignedBus} = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {name, email, mobileNo, assignedBus},
            {new: true, runValidators:true}
        );
        if(!updatedUser){
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({
            success:true,
            message:'User updated Successfully',
            data:updatedUser
        })
    }  catch(err){
        res.status(500).json({message:'Server error during update'});
    }
}

exports.updateBus = async (req,res) => {
    try{
        const {id} = req.params;
        const {busNo, route, schoolBuilding, capacity} = req.body;

        const updatedBus = await Bus.findByIdAndUpdate(
            id,
            {busNo, route, schoolBuilding, capacity},
            {new:true, runValidators:true}
        );
        if(!updatedBus) {
            return res.status(404).json({message:'Bus not found'});
        }
        res.status(200).json({
            success:true,
            message:'Bus details updated Successfully',
            data:updatedBus
        });
    }  catch(err) {
        res.status(500).json({message:'Server error updating bus'});
    }
}

exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User removed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting user" });
    }
};