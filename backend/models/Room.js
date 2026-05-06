const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String }, // e.g., "1st Floor", "Cabin A"
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  lastUsedAt: { type: Date }
});

module.exports = mongoose.model('Room', roomSchema);
