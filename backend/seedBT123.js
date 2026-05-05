const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vms';

const seedUser = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    let user = await User.findOne({ email: 'BT-123' });
    if (user) {
      console.log('✅ User BT-123 already exists, updating password...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash('12345', salt);
      await user.save();
      console.log('✅ Password updated to 12345');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('12345', salt);

    const newUser = new User({
      name: 'BT User',
      email: 'BT-123',
      password: hashedPassword,
      role: 'receptionist',
      department: 'Front Desk'
    });

    await newUser.save();
    console.log('🚀 User BT-123 created successfully!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding:', err.message);
    process.exit(1);
  }
};

seedUser();
