const User = require('../models/User');
const Bus = require('../models/Bus');
const bcrypt = require('bcryptjs');

exports.addStudent = async (req, res) => {
    try {
        const { name, rollNumber, grade, parentEmail, assignedBus, bloodGroup } = req.body;

        const parent = await User.findOne({ email: parentEmail, role: 'parent' });
        if (!parent) {
            return res.status(404).json({ message: "Parent with this email not found." });
        }

        if (assignedBus) {
            const busExists = await Bus.findById(assignedBus);
            if (!busExists) return res.status(404).json({ message: "Bus not found." });
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
        const buses = await Bus.find().populate('driver', 'name email').populate('assistant', 'name email');
        res.json(buses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching buses" });
    }
};

exports.addStaff = async (req, res) => {
    const { name, email, mobileNo, password, assignedBus, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDriver = new User({
            name,
            email,
            password: hashedPassword,
            mobileNo,
            role: role || 'driver',
            assignedBus: assignedBus || null
        });

        await newDriver.save();

        res.status(201).json({
            success: true,
            message: `${newDriver.role} account created successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating staff account" });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('assignedBus', 'busNo route schoolBuilding').populate({ path: 'children.assignedBus', model: 'Bus', select: 'busNo route schoolBuilding' });
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

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobileNo, assignedBus } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { name, email, mobileNo, assignedBus },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            success: true,
            message: 'User updated Successfully',
            data: updatedUser
        })
    } catch (err) {
        res.status(500).json({ message: 'Server error during update' });
    }
}

exports.updateBus = async (req, res) => {
    try {
        const { id } = req.params; // The Bus ID
        const { busNo, route, schoolBuilding, driver, assistant } = req.body;

        if (driver) {
            const busyDriver = await Bus.findOne({ driver: driver, _id: { $ne: id } });
            if (busyDriver) {
                return res.status(400).json({ message: `This driver is already assigned to Bus ${busyDriver.busNo}` });
            }
        }

        if (assistant) {
            const busyAssistant = await Bus.findOne({ assistant: assistant, _id: { $ne: id } });
            if (busyAssistant) {
                return res.status(400).json({ message: `This assistant is already assigned to Bus ${busyAssistant.busNo}` });
            }
        }

        const oldBus = await Bus.findById(id);
        if (!oldBus) return res.status(404).json({ message: "Bus not found" });

        const updatedBus = await Bus.findByIdAndUpdate(
            id,
            { busNo, route, schoolBuilding, driver: driver || null, assistant: assistant || null },
            { new: true }
        ).populate('driver assistant');

        if (oldBus.driver) await User.findByIdAndUpdate(oldBus.driver, { assignedBus: null });
        if (oldBus.assistant) await User.findByIdAndUpdate(oldBus.assistant, { assignedBus: null });

        if (driver) await User.findByIdAndUpdate(driver, { assignedBus: id });
        if (assistant) await User.findByIdAndUpdate(assistant, { assignedBus: id });

        res.status(200).json({
            success: true,
            message: 'Bus and Staff assignments synchronized!',
            data: updatedBus
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during bus update' });
    }
};

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
    try {
        const busId = req.params.id;

        await User.updateMany(
            { assignedBus: busId },
            { $set: { assignedBus: null } }
        );

        await User.updateMany(
            { "children.assignedBus": busId },
            { $set: { "children.$[elem].assignedBus": null } },
            { arrayFilters: [{ "elem.assignedBus": busId }] }
        );

        const deletedBus = await Bus.findByIdAndDelete(busId);

        if (!deletedBus) {
            return res.status(404).json({ success: false, message: "Bus not found" });
        }

        res.status(200).json({
            success: true,
            message: "Bus deleted and all staff/student links cleared successfully"
        });

    } catch (err) {
        console.error("DELETE BUS ERROR:", err);
        res.status(500).json({ success: false, message: "Server error while removing bus" });
    }
}