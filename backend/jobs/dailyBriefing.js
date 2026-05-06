const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendWhatsAppMessage } = require('../utils/whatsapp');

// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Running daily morning briefing job...');
  await executeMorningBriefing();
});

const executeMorningBriefing = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Offline / Demo fallback
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ MongoDB offline, simulating daily briefing for demo hosts...');
      
      const demoMessage = `🌅 Good Morning MD Sir!\n\nYou have 2 visitors scheduled for today:\n- 10:30 AM : Ravi Kumar (Business Discussion)\n- 02:00 PM : Priya Sharma (Job Interview)\n\nHave a great day!`;
      await sendWhatsAppMessage('9988776655', demoMessage);
      
      const demoMessage2 = `🌅 Good Morning HR Head!\n\nYou have 1 visitor scheduled for today:\n- 11:00 AM : Amit Singh (Vendor Meeting)\n\nHave a great day!`;
      await sendWhatsAppMessage('7766554433', demoMessage2);
      
      return;
    }

    // Fetch all confirmed bookings for today
    const bookings = await Booking.find({ date: today, status: 'confirmed' })
      .populate('hostId', 'name phone')
      .sort({ time: 1 });

    if (!bookings || bookings.length === 0) {
      console.log('ℹ️ No bookings scheduled for today.');
      return;
    }

    // Group bookings by hostId
    const hostBookings = {};
    bookings.forEach(b => {
      const hostId = b.hostId._id.toString();
      if (!hostBookings[hostId]) {
        hostBookings[hostId] = {
          host: b.hostId,
          bookings: []
        };
      }
      hostBookings[hostId].bookings.push(b);
    });

    // Send WhatsApp message to each host
    for (const hostId in hostBookings) {
      const { host, bookings } = hostBookings[hostId];
      if (!host.phone) continue; // Skip if host has no phone number

      let message = `🌅 Good Morning ${host.name}!\n\nYou have ${bookings.length} visitor(s) scheduled for today:\n`;
      bookings.forEach(b => {
        message += `- ${b.time} : ${b.name} (${b.purpose})\n`;
      });
      message += `\nHave a great day!`;

      await sendWhatsAppMessage(host.phone, message);
    }
  } catch (err) {
    console.error('❌ Error executing morning briefing:', err.message);
  }
};

module.exports = { executeMorningBriefing };
