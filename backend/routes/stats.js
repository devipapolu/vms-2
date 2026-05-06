const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const VisitLog = require('../models/VisitLog');

router.get('/dashboard', async (req, res) => {
  try {
    // Offline / Demo fallback
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  MongoDB offline, returning demo dashboard stats');
      return res.json({
        tomorrowLoad: 12,
        peakHour: '11 AM',
        highDemandTime: '10 AM - 12 PM',
        slotsRemaining: 8
      });
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // 1. Calculate Tomorrow's Load
    const tomorrowBookings = await Booking.find({ date: tomorrowStr, status: 'confirmed' });
    const tomorrowLoad = tomorrowBookings.length;

    // 2. Calculate Peak Hour (based on today's bookings)
    const todayBookings = await Booking.find({ date: todayStr, status: 'confirmed' });
    const hourCounts = {};
    todayBookings.forEach(b => {
      const hour = parseInt(b.time.split(':')[0], 10);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let maxCount = 0;
    let peakHourNum = 11; // Default
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        peakHourNum = parseInt(hour, 10);
      }
    }
    
    const ampm = peakHourNum >= 12 ? 'PM' : 'AM';
    let displayHour = peakHourNum % 12;
    displayHour = displayHour ? displayHour : 12; // the hour '0' should be '12'
    const peakHour = `${displayHour} ${ampm}`;

    // 3. Tomorrow's Availability (High Demand Time & Slots Remaining)
    // Find the busiest 2-hour window tomorrow
    const tomHourCounts = {};
    tomorrowBookings.forEach(b => {
      const hour = parseInt(b.time.split(':')[0], 10);
      tomHourCounts[hour] = (tomHourCounts[hour] || 0) + 1;
    });

    let tomMax = 0;
    let tomPeak = 10;
    for (const [hour, count] of Object.entries(tomHourCounts)) {
      if (count > tomMax) {
        tomMax = count;
        tomPeak = parseInt(hour, 10);
      }
    }

    const startAmpm = tomPeak >= 12 ? 'PM' : 'AM';
    let startDisplay = tomPeak % 12 || 12;
    const endPeak = (tomPeak + 2) % 24;
    const endAmpm = endPeak >= 12 ? 'PM' : 'AM';
    let endDisplay = endPeak % 12 || 12;
    
    const highDemandTime = `${startDisplay} ${startAmpm} - ${endDisplay} ${endAmpm}`;

    // Dummy logic for slots remaining: assuming 40 total slots per day across all hosts
    const totalSlotsPerDay = 40;
    const slotsRemaining = Math.max(0, totalSlotsPerDay - tomorrowLoad);

    res.json({
      tomorrowLoad,
      peakHour,
      highDemandTime,
      slotsRemaining
    });

  } catch (err) {
    console.error('❌ Error computing dashboard stats:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
