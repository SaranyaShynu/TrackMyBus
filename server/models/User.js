const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() {return !this.googleId }},
  googleId: { type: String }, 
  mobileNo: {type: String, required: true},
  role: { type: String, 
          enum: ['parent','driver','assistant','admin'],
          default: 'parent' },
  assignedBus:{type:mongoose.Schema.Types.ObjectId, ref:'Bus'},
  resetToken: String,
  resetTokenExpiry: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);