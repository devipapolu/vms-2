const User = require('../models/User');
const VisitLog = require('../models/VisitLog');

exports.getAllHosts = async (req, res) => {
  try {
    const hosts = await User.find({ role: 'host' }).select('-password');
    res.json(hosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getHostStatus = async (req, res) => {
  const { hostId } = req.params;

  try {
    // Logic: Check if there's an active visit log (check_in exists, check_out is null)
    const activeVisit = await VisitLog.findOne({ 
      hostId, 
      checkOutTime: { $exists: false } 
    });

    res.json({ 
      status: activeVisit ? 'BUSY' : 'ONLINE',
      activeVisit: activeVisit || null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStaffStatus = async (req, res) => {
  const { status } = req.body;
  const userId = req.user.id; // From auth middleware

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
