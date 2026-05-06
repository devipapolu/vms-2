const User = require('../models/User');
const VisitLog = require('../models/VisitLog');
const mongoose = require('mongoose');

const DEMO_HOSTS = [
  { _id: 'h1', name: 'MD Sir', department: 'Management', role: 'host', phone: '9988776655' },
  { _id: 'h2', name: 'Senior Manager', department: 'Operations', role: 'host', phone: '8877665544' },
  { _id: 'h3', name: 'HR Head', department: 'Human Resources', role: 'host', phone: '7766554433' },
];

exports.getAllHosts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  MongoDB offline, returning demo hosts (early exit)');
      return res.json(DEMO_HOSTS);
    }
    const hosts = await User.find({ role: 'host' }).select('-password');
    res.json(hosts);
  } catch (err) {
    console.warn('⚠️  MongoDB offline, returning demo hosts');
    res.json(DEMO_HOSTS);
  }
};

exports.getHostStatus = async (req, res) => {
  const { hostId } = req.params;

  try {
    const activeVisit = await VisitLog.findOne({ 
      hostId, 
      checkOutTime: { $exists: false } 
    });

    res.json({ 
      status: activeVisit ? 'BUSY' : 'ONLINE',
      activeVisit: activeVisit || null
    });
  } catch (err) {
    // Demo logic: MD Sir is busy, others online
    res.json({ 
      status: hostId === 'h1' ? 'BUSY' : 'ONLINE',
      activeVisit: null
    });
  }
};

exports.updateStaffStatus = async (req, res) => {
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    await user.save();
    res.json({ message: 'Status updated', status: user.status });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
