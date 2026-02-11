const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
    busNo: { 
        type: String, 
        required: true, 
        unique: true 
    },
    route: { 
        type: String, 
        required: true 
    },
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'maintenance'], 
        default: 'active' 
    },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);