const mongoose = require('mongoose');

const visitLogSchema = new mongoose.Schema({
  visitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visitor', required: true },
  visitorName: { type: String }, // cached for quick display
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  purpose: { type: String, required: true },
  checkInTime: { type: Date, default: Date.now },
  checkOutTime: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  qrToken: { type: String, unique: true, sparse: true }, // unique QR token generated on approval
  checkoutMethod: { type: String, enum: ['QR_SCAN', 'AUTO_GEOFENCE', 'MANUAL'], default: 'MANUAL' },
  whatsappNotificationSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('VisitLog', visitLogSchema);
