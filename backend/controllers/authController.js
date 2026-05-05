const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Demo/hardcoded users for offline demo mode (no MongoDB needed)
const DEMO_USERS = [
  {
    _id: 'demo-001',
    name: 'BT Receptionist',
    email: 'BT-123',
    password: '12345',
    role: 'receptionist',
    department: 'Front Desk'
  }
];

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const identifier = email; // can be email OR username like BT-123

  const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

  try {
    // First try to find in MongoDB (by email or username field)
    let user = null;
    try {
      user = await User.findOne({ email: identifier });
    } catch (dbErr) {
      // MongoDB unavailable — fall through to demo users
      console.warn('⚠️  MongoDB unavailable, checking demo users...');
    }

    if (user) {
      // MongoDB user found — verify password with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // Fallback: check demo users (plain text password comparison)
    const demoUser = DEMO_USERS.find(
      u => u.email === identifier && u.password === password
    );

    if (!demoUser) {
      return res.status(404).json({ message: 'User not found or invalid credentials' });
    }

    const token = jwt.sign(
      { id: demoUser._id, role: demoUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: { id: demoUser._id, name: demoUser.name, email: demoUser.email, role: demoUser.role }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.register = async (req, res) => {
  const { name, email, password, role, department } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
