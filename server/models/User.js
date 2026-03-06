const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.googleId } },
  googleId: { type: String },
  mobileNo: { type: String, required: false },
  address:{type:String},
  role: {
    type: String,
    enum: ['parent', 'driver', 'assistant', 'admin'],
    default: 'parent'
  },
  children: [{
   type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }], 
  assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  resetToken: String,
  resetTokenExpiry: Date,
  fcmToken: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);