const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.googleId } },
  googleId: { type: String },
  mobileNo: { type: String, required: false },
  role: {
    type: String,
    enum: ['parent', 'driver', 'assistant', 'admin'],
    default: 'parent'
  },
  children: [{
    name: { type: String, required: true },
    rollNumber: { type: String },
    grade: { type: String },
    bloodGroup: { type: String },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' }
  }],
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);