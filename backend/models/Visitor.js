const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  faceEmbedding: { type: [Number] }, // 128-d vector from FaceNet
  photoUrl: { type: String },
  lastVisit: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', visitorSchema);
