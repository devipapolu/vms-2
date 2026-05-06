const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('./jobs/dailyBriefing'); // Initialize cron jobs

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/vms';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to VMS API' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const visitorRoutes = require('./routes/visitors');
const hostRoutes = require('./routes/hosts');
const bookingRoutes = require('./routes/bookings');
const roomRoutes = require('./routes/rooms');

app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/hosts', hostRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/stats', require('./routes/stats'));

// Test Routes (for demo purposes)
app.get('/api/test/trigger-briefing', async (req, res) => {
  const { executeMorningBriefing } = require('./jobs/dailyBriefing');
  await executeMorningBriefing();
  res.json({ message: 'Morning briefing triggered successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
