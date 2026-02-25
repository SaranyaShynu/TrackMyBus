const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNo: { 
        type: String, 
        required: true, 
        unique: true 
    },
    schoolBuilding: { 
        type: String, 
        required: true, 
        enum: ['Building A', 'Building B', 'Both', 'Emergency'], 
        default: 'Building A' 
    },
    route: { 
        type: String, 
        required: true 
    },
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    driverPhone: String,
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'maintenance'], 
        default: 'active' 
    },
    assistant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);