const User = require('../models/User');
const Bus = require('../models/Bus');
const bcrypt = require('bcryptjs');
const { Await } = require('react-router-dom');

exports.addStudent = async (req, res) => {
  try {
    const { name, rollNumber, grade, parentEmail, assignedBus, bloodGroup } = req.body;

    const parent = await User.findOne({ email: parentEmail, role: 'parent' });
    if (!parent) {
      return res.status(404).json({ message: "Parent with this email not found." });
    }

    const newStudent = {
      name,
      rollNumber,
      grade,
      bloodGroup,
      assignedBus
    };

    parent.children.push(newStudent);
    await parent.save();

    res.status(201).json({ 
      success: true, 
      message: `Student ${name} enrolled and linked to ${parent.name}` 
    });

  } catch (error) {
    console.error("Add Student Error:", error);
    res.status(500).json({ message: "Server error during student enrollment" });
  }
};

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

exports.addStaff=async (req,res) => {
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
        const users = await User.find().select('-password').populate('assignedBus', 'busNo route schoolBuilding').populate({path:'children.assignedBus', model:'Bus', select:'busNo route schoolBuilding'});
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

exports.updateStudent = async (req, res) => {
  try {
    const { parentId, studentId } = req.params;
    const { name, grade, rollNumber, bloodGroup, assignedBus } = req.body;

    const updatedParent = await User.findOneAndUpdate(
      { _id: parentId, "children._id": studentId },
      {
        $set: {
          "children.$.name": name,
          "children.$.grade": grade,
          "children.$.rollNumber": rollNumber,
          "children.$.bloodGroup": bloodGroup,
          "children.$.assignedBus": assignedBus || null,
        }
      },
      { new: true }
    ).populate('children.assignedBus');

    if (!updatedParent) {
      return res.status(404).json({ message: "Parent or Student not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: "Student details updated!", 
      data: updatedParent.children 
    });
  } catch (error) {
    console.error("Update Student Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

exports.deleteStudent = async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    // Use $pull to remove the specific student from the children array
    await User.findByIdAndUpdate(parentId, {
      $pull: { children: { _id: studentId } }
    });

    res.json({ success: true, message: "Student removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting student" });
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

exports.deleteBus = async (req, res) => {
    try{
        const bus = await Bus.findById(req.params.id);

        if(!bus) {
            return res.status(404).json({message:"Bus not found"});
        }
        await User.updateMany({assignedBus:req.params.id} , {$set:{assignedBus:null}});

        await bus.deleteOne();
        res.status(200).json({message:"Bus removed Successfully"});
    } catch (err) {
        res.status(500).json({message:"Server error"});
    }
}