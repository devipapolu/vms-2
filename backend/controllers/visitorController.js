const Visitor = require('../models/Visitor');
const VisitLog = require('../models/VisitLog');
const User = require('../models/User');
const { calculateDistance } = require('../utils/geo');
const { v4: uuidv4 } = require('uuid');

// ─── Register Visitor & create VisitLog ─────────────────────────────────────
exports.registerVisitor = async (req, res) => {
  const { name, phone, email, faceEmbedding, photoUrl, hostId, purpose } = req.body;
  try {
    let visitor = await Visitor.findOne({ phone });
    if (!visitor) {
      visitor = new Visitor({ name, phone, email, faceEmbedding, photoUrl });
      await visitor.save();
    }
    const visitLog = new VisitLog({
      visitorId: visitor._id,
      visitorName: name || visitor.name,
      hostId,
      purpose,
      status: 'pending'
    });
    await visitLog.save();
    visitor.lastVisit = Date.now();
    await visitor.save();
    res.status(201).json({ message: 'Visitor registered and visit log created', visitor, visitLog });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Approve Visit → Generate QR Token ──────────────────────────────────────
exports.approveVisit = async (req, res) => {
  const { logId } = req.body;
  try {
    const log = await VisitLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Visit log not found' });
    log.status = 'approved';
    log.qrToken = uuidv4();
    await log.save();
    res.json({ message: 'Visit approved. QR pass generated.', qrToken: log.qrToken, logId: log._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Reject Visit ────────────────────────────────────────────────────────────
exports.rejectVisit = async (req, res) => {
  const { logId } = req.body;
  try {
    const log = await VisitLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Visit log not found' });
    log.status = 'rejected';
    await log.save();
    res.json({ message: 'Visit rejected.', logId: log._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── QR Scan → Entry Confirmation ────────────────────────────────────────────
exports.qrCheckIn = async (req, res) => {
  const { qrToken } = req.body;
  try {
    const log = await VisitLog.findOne({ qrToken })
      .populate('visitorId', 'name phone photoUrl')
      .populate('hostId', 'name department');
    if (!log) return res.status(404).json({ message: 'Invalid QR code' });
    if (log.status !== 'approved') {
      return res.status(400).json({ message: `Visit status is '${log.status}', not approved.` });
    }
    log.checkInTime = new Date();
    await log.save();
    res.json({
      message: '✅ Entry confirmed!',
      visitor: log.visitorId,
      host: log.hostId,
      purpose: log.purpose,
      checkInTime: log.checkInTime,
      logId: log._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── QR Scan → Exit / Checkout ───────────────────────────────────────────────
exports.qrCheckOut = async (req, res) => {
  const { qrToken } = req.body;
  try {
    const log = await VisitLog.findOne({ qrToken })
      .populate('visitorId', 'name phone')
      .populate('hostId', 'name department');
    if (!log) return res.status(404).json({ message: 'Invalid QR code' });
    if (log.status === 'completed') {
      return res.status(400).json({ message: 'Visitor already checked out.' });
    }
    log.status = 'completed';
    log.checkOutTime = new Date();
    log.checkoutMethod = 'QR_SCAN';
    await log.save();
    res.json({
      message: '✅ Checkout successful!',
      visitor: log.visitorId,
      host: log.hostId,
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
      method: 'QR_SCAN'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get Visitor Pass Info by QR Token ──────────────────────────────────────
exports.getVisitorPassByToken = async (req, res) => {
  const { token } = req.params;
  try {
    const log = await VisitLog.findOne({ qrToken: token })
      .populate('visitorId', 'name phone photoUrl')
      .populate('hostId', 'name department');
    if (!log) return res.status(404).json({ message: 'Pass not found' });
    res.json({
      visitorName: log.visitorName || log.visitorId?.name,
      hostName: log.hostId?.name,
      hostDept: log.hostId?.department,
      purpose: log.purpose,
      status: log.status,
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
      qrToken: log.qrToken,
      logId: log._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Get All Visitor Logs ────────────────────────────────────────────────────
exports.getVisitorLogs = async (req, res) => {
  try {
    const logs = await VisitLog.find()
      .populate('visitorId', 'name phone photoUrl')
      .populate('hostId', 'name department')
      .sort({ checkInTime: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Update Visit Status (manual) ───────────────────────────────────────────
exports.updateVisitStatus = async (req, res) => {
  const { logId, status } = req.body;
  try {
    const log = await VisitLog.findById(logId);
    if (!log) return res.status(404).json({ message: 'Visit log not found' });
    log.status = status;
    if (status === 'completed') {
      log.checkOutTime = Date.now();
      log.checkoutMethod = 'MANUAL';
    }
    if (status === 'approved' && !log.qrToken) {
      log.qrToken = uuidv4();
    }
    await log.save();
    res.json({ message: 'Visit status updated', log, qrToken: log.qrToken });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── Location Update (Geofence Auto-Checkout) ───────────────────────────────
exports.updateVisitorLocation = async (req, res) => {
  const { logId, latitude, longitude } = req.body;
  try {
    const log = await VisitLog.findById(logId);
    if (!log || log.status !== 'approved') {
      return res.status(404).json({ message: 'Active visit log not found' });
    }
    const officeLat = parseFloat(process.env.OFFICE_LATITUDE);
    const officeLon = parseFloat(process.env.OFFICE_LONGITUDE);
    const radius = parseFloat(process.env.GEOFENCE_RADIUS_METERS) || 100;
    const distance = calculateDistance(latitude, longitude, officeLat, officeLon);

    if (distance > radius) {
      log.status = 'completed';
      log.checkOutTime = Date.now();
      log.checkoutMethod = 'AUTO_GEOFENCE';
      await log.save();
      return res.json({ message: 'Auto-checkout triggered (Outside geofence)', distance, checkedOut: true });
    }
    res.json({ message: 'Location updated', distance, checkedOut: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
