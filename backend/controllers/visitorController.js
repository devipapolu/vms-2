const Visitor = require('../models/Visitor');
const VisitLog = require('../models/VisitLog');
const User = require('../models/User');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { calculateDistance } = require('../utils/geo');
const { v4: uuidv4 } = require('uuid');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

// ─── Helper: Notify Next Meeting ─────────────────────────────────────────────
const notifyNextMeeting = async (hostId) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  MongoDB offline, simulating next meeting notification');
      await sendWhatsAppMessage('9988776655', `✅ Meeting Completed.\n📅 Demo Alert: Your next meeting is at 2:00 PM with Priya Sharma for Job Interview.`);
      return;
    }

    const host = await User.findById(hostId);
    if (!host || !host.phone) return;

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentTimeString = now.toTimeString().substring(0, 5); // "HH:mm"

    // Find the earliest booking for today that is AFTER the current time
    const nextBooking = await Booking.findOne({
      hostId: hostId,
      date: today,
      status: 'confirmed',
      time: { $gt: currentTimeString }
    }).sort({ time: 1 });

    if (nextBooking) {
      await sendWhatsAppMessage(host.phone, `✅ Meeting Completed.\n📅 Your next meeting is at ${nextBooking.time} with ${nextBooking.name} for ${nextBooking.purpose}.`);
    } else {
      await sendWhatsAppMessage(host.phone, `✅ Meeting Completed.\n☕ You have no more meetings scheduled for today.`);
    }
  } catch (err) {
    console.error('Error notifying next meeting:', err);
  }
};

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

    // WHATSAPP: Notify Host
    const host = await User.findById(hostId);
    if (host && host.phone) {
      await sendWhatsAppMessage(host.phone, `🔔 New Visitor: ${name} is here to meet you for "${purpose}". Please approve/reject the meeting in your VMS dashboard.`);
    }

    res.status(201).json({ message: 'Visitor registered and visit log created', visitor, visitLog });
  } catch (err) {
    console.warn('⚠️  MongoDB offline, simulating registration success + WhatsApp');
    
    // WHATSAPP: Simulate Host Notification (MD Sir phone)
    sendWhatsAppMessage('9988776655', `🔔 New Visitor: ${name} is here to meet you for "${purpose}". Please approve/reject the meeting in your VMS dashboard.`);

    res.status(201).json({ 
      message: 'Demo: Visitor registered (offline mode)', 
      visitor: { name, phone, _id: 'demo-v-' + Date.now() },
      visitLog: { _id: 'demo-log-' + Date.now(), status: 'pending' }
    });
  }
};

// ─── Approve Visit → Generate QR Token & Notify Visitor ──────────────────────
exports.approveVisit = async (req, res) => {
  const { logId, roomId, roomName } = req.body;
  try {
    const log = await VisitLog.findById(logId).populate('visitorId');
    if (!log) return res.status(404).json({ message: 'Visit log not found' });
    
    log.status = 'approved';
    log.qrToken = uuidv4();
    log.roomId = roomId;
    await log.save();

    // Update Room status
    const Room = require('../models/Room');
    const room = await Room.findById(roomId);
    if (room) {
      room.status = 'occupied';
      await room.save();
    }

    // WHATSAPP: Notify Visitor with QR Pass Link & Room Details
    const visitorPhone = log.visitorId?.phone || log.phone;
    const finalRoomName = roomName || room?.name || 'Assigned Cabin';
    if (visitorPhone) {
      const passUrl = `http://localhost:5173/visitor-pass/${log.qrToken}`;
      await sendWhatsAppMessage(visitorPhone, `✅ Meeting Approved! Please proceed to: ${finalRoomName}. Your entry QR pass is ready: ${passUrl}`);
    }

    res.json({ message: `Visit approved. Room ${finalRoomName} assigned.`, qrToken: log.qrToken, logId: log._id, roomName: finalRoomName });
  } catch (err) {
    console.warn('⚠️  MongoDB offline, simulating approval success + Room + WhatsApp');
    const qrToken = uuidv4();
    const finalRoomName = roomName || 'Conference Room A';
    
    // WHATSAPP: Simulate Visitor Notification
    sendWhatsAppMessage('9998887776', `✅ Meeting Approved! Please proceed to: ${finalRoomName}. Your entry QR pass is ready: http://localhost:5173/visitor-pass/${qrToken}`);

    res.json({ message: 'Demo: Visit approved (offline mode)', qrToken, logId, roomName: finalRoomName });
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
    res.json({ message: 'Demo: Visit rejected (offline mode)', logId });
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
    
    // Trigger next meeting alert
    notifyNextMeeting(log.hostId._id || log.hostId);
    
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
      .populate('hostId', 'name department')
      .populate('roomId', 'name location');
    if (!log) return res.status(404).json({ message: 'Pass not found' });
    res.json({
      visitorName: log.visitorName || log.visitorId?.name,
      hostName: log.hostId?.name,
      hostDept: log.hostId?.department,
      roomName: log.roomId?.name || 'Assigned Room',
      roomLocation: log.roomId?.location || 'Main Office',
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
    console.warn('⚠️  MongoDB offline, returning demo logs');
    const demoLogs = [
      {
        _id: 'demo-log-1',
        visitorName: 'Ravi Kumar',
        purpose: 'Business Discussion',
        status: 'pending',
        checkInTime: new Date().toISOString(),
        hostId: { _id: 'h1', name: 'MD Sir', department: 'Management' }
      },
      {
        _id: 'demo-log-2',
        visitorName: 'Priya Sharma',
        purpose: 'Job Interview',
        status: 'pending',
        checkInTime: new Date().toISOString(),
        hostId: { _id: 'h3', name: 'HR Head', department: 'Human Resources' }
      }
    ];
    res.json(demoLogs);
  }
};

// ─── Update Visit Status (manual) ───────────────────────────────────────────
exports.updateVisitStatus = async (req, res) => {
  const { logId, status } = req.body;
  try {
    if (mongoose.connection.readyState !== 1 || String(logId).startsWith('demo')) {
      if (status === 'completed') {
        notifyNextMeeting('demo-host-1');
      }
      return res.json({ message: 'Demo: Visit status updated', qrToken: 'demo-qr', logId });
    }

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
    
    // Trigger next meeting alert if completed
    if (status === 'completed') {
      notifyNextMeeting(log.hostId._id || log.hostId);
    }
    
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
      
      // Trigger next meeting alert
      notifyNextMeeting(log.hostId._id || log.hostId);
      
      return res.json({ message: 'Auto-checkout triggered (Outside geofence)', distance, checkedOut: true });
    }
    res.json({ message: 'Location updated', distance, checkedOut: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
