const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' , required: true},
  type: { type: String, required: true }, // 'DELAY', 'EMERGENCY', 'NEAR_HOME'
  message: { type: String, required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);