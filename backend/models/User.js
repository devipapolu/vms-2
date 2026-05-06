const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Added for WhatsApp notifications
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'receptionist', 'host'], default: 'host' },
  department: { type: String },
  status: { type: String, enum: ['available', 'busy', 'away'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
